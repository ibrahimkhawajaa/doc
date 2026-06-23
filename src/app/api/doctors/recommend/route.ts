import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateText, hasGeminiKey } from '@/lib/gemini';
import { FALLBACK_DOCTORS, normalizeDoctor, type DoctorRecord } from '@/lib/doctors';

type DoctorType = {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  consultationFee: number;
  location: string;
  hospital: string;
  phone: string | null;
  email: string | null;
  imageUrl: string | null;
  source: string;
  profileUrl: string | null;
};

async function getDoctors(): Promise<DoctorRecord[]> {
  try {
    const doctors = await prisma.doctor.findMany({ 
      orderBy: [{ rating: 'desc' }, { experience: 'desc' }], 
      take: 20 
    });
    if (doctors.length > 0) {
      return doctors.map((doc: DoctorType, index: number) =>
        normalizeDoctor(
          {
            id: doc.id,
            name: doc.name,
            specialization: doc.specialization,
            experience: doc.experience,
            rating: doc.rating,
            consultationFee: doc.consultationFee,
            location: doc.location,
            hospital: doc.hospital,
            phone: doc.phone ?? undefined,
            email: doc.email ?? undefined,
            imageUrl: doc.imageUrl ?? undefined,
            source: doc.source,
            profileUrl: doc.profileUrl ?? undefined,
          },
          index
        )
      );
    }
  } catch {
    // fallback below
  }
  return FALLBACK_DOCTORS;
}

function matchDoctorsByCondition(condition: string, doctors: DoctorRecord[]): DoctorRecord[] {
  const text = condition.toLowerCase();
  const rules: Array<{ keywords: string[]; specs: string[] }> = [
    { keywords: ['chest', 'heart', 'breath', 'cardiac', 'bp', 'blood pressure'], specs: ['cardio'] },
    { keywords: ['child', 'baby', 'pediatric', 'infant', 'kid'], specs: ['pediatr'] },
    { keywords: ['skin', 'rash', 'acne', 'derma', 'eczema', 'psoriasis'], specs: ['derma'] },
    { keywords: ['headache', 'brain', 'seizure', 'neuro', 'migraine', 'stroke'], specs: ['neuro'] },
    { keywords: ['bone', 'joint', 'fracture', 'ortho', 'spine', 'arthritis'], specs: ['ortho'] },
    { keywords: ['anxiety', 'depress', 'mental', 'psych', 'stress', 'adhd'], specs: ['psych'] },
    { keywords: ['pregnant', 'gynec', 'obstet', 'pregnancy', 'women'], specs: ['obstet', 'gynec'] },
    { keywords: ['ear', 'nose', 'throat', 'ent', 'hearing', 'sinusitis'], specs: ['ent'] },
    { keywords: ['tooth', 'dental', 'teeth', 'gum', 'cavity'], specs: ['dent'] },
    { keywords: ['eye', 'vision', 'optic', 'ophthal'], specs: ['ophthal', 'eye'] },
    { keywords: ['diabetes', 'sugar', 'endocr', 'thyroid'], specs: ['endocrin'] },
    { keywords: ['stomach', 'digestive', 'gastro', 'ibs'], specs: ['gastro'] },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((word) => text.includes(word))) {
      const matched = doctors.filter((doc) =>
        rule.specs.some((spec) => doc.specialization.toLowerCase().includes(spec))
      );
      if (matched.length > 0) return matched.slice(0, 5);
    }
  }

  return doctors.slice(0, 5);
}

function getUrgencyLevel(condition: string): string {
  const urgent = ['chest pain', 'severe', 'emergency', 'critical', 'bleeding', 'unconscious', 'difficulty breathing'];
  const moderate = ['persistent', 'worsening', 'fever', 'infection', 'injury'];
  
  const text = condition.toLowerCase();
  if (urgent.some(word => text.includes(word))) {
    return 'URGENT: Consult immediately (within 24 hours)';
  }
  if (moderate.some(word => text.includes(word))) {
    return 'High: Schedule within 3-5 days';
  }
  return 'Standard: Schedule within 1-2 weeks';
}

function fallbackRecommendation(condition: string, doctors: DoctorRecord[]) {
  const matched = matchDoctorsByCondition(condition, doctors);
  const topDoctors = matched.slice(0, 3);
  const top = topDoctors[0];

  const doctorsList = topDoctors
    .map(d => `${d.name} (${d.specialization}, ${d.location}, ${d.experience}y, ⭐${d.rating})`)
    .join('\n• ');

  return {
    recommendation: `Based on your condition ("${condition.slice(0, 80)}${condition.length > 80 ? '...' : ''}"), we recommend these specialists:\n\n• ${doctorsList}\n\n${top.name} is our top recommendation - a ${top.specialization} specialist with ${top.experience} years of experience and a ${top.rating}/5 rating in ${top.location}. Consultation fee: Rs. ${top.consultationFee}.`,
    recommendedDoctor: top.name,
    urgency: getUrgencyLevel(condition),
    nextSteps: [
      'Book appointment with recommended doctor',
      'Prepare your complete symptom history',
      'Bring any relevant medical tests/records',
      'Note down all current medications'
    ],
    doctors: topDoctors,
    aiPowered: false,
  };
}

export async function POST(req: NextRequest) {
  let condition = '';

  try {
    const body = await req.json();
    condition = body.condition ?? '';

    if (!condition.trim()) {
      return NextResponse.json({ error: 'Condition is required' }, { status: 400 });
    }

    const doctors = await getDoctors();

    if (!hasGeminiKey()) {
      return NextResponse.json(fallbackRecommendation(condition, doctors));
    }

    try {
      const matched = matchDoctorsByCondition(condition, doctors);
      const topDoctors = matched.slice(0, 5);

      const prompt = `You are a medical advisor AI for a Pakistani health platform. A patient describes their condition: "${condition}"

Available doctors to recommend from:
${topDoctors.map((d) => `- ${d.name} | Specialty: ${d.specialization} | Location: ${d.location} | Experience: ${d.experience} years | Rating: ${d.rating}/5 | Consultation: Rs. ${d.consultationFee}`).join('\n')}

Provide a brief medical recommendation (80-150 words) including:
1. Which doctor(s) to consult and why
2. What specialists are relevant for this condition
3. Urgency level (URGENT/High/Standard)
4. Two specific next steps

Keep it professional, empathetic, and actionable.`;

      const result = await generateText(prompt);

      return NextResponse.json({
        recommendation: result.text,
        doctors: topDoctors,
        urgency: getUrgencyLevel(condition),
        nextSteps: [
          'Book appointment immediately',
          'Prepare complete medical history',
          'Bring relevant test reports',
        ],
        aiPowered: true,
      });
    } catch (aiError) {
      console.error('Gemini recommendation error:', aiError);
      return NextResponse.json(fallbackRecommendation(condition, doctors));
    }
  } catch (error) {
    console.error('Recommendation Error:', error);
    const doctors = await getDoctors();
    return NextResponse.json(
      fallbackRecommendation(condition || 'medical consultation needed', doctors)
    );
  }
}
