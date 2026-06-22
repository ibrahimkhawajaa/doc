import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateText, hasGeminiKey } from '@/lib/gemini';
import { FALLBACK_DOCTORS, normalizeDoctor, type DoctorRecord } from '@/lib/doctors';

async function getDoctors(): Promise<DoctorRecord[]> {
  try {
    const doctors = await prisma.doctor.findMany({ orderBy: { rating: 'desc' }, take: 15 });
    if (doctors.length > 0) {
      return doctors.map((doc, index) =>
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
    { keywords: ['chest', 'heart', 'breath', 'cardiac'], specs: ['cardio'] },
    { keywords: ['child', 'baby', 'pediatric', 'infant'], specs: ['pediatr'] },
    { keywords: ['skin', 'rash', 'acne', 'derma'], specs: ['derma'] },
    { keywords: ['headache', 'brain', 'seizure', 'neuro'], specs: ['neuro'] },
    { keywords: ['bone', 'joint', 'fracture', 'ortho'], specs: ['ortho'] },
    { keywords: ['anxiety', 'depress', 'mental', 'psych'], specs: ['psych'] },
    { keywords: ['pregnant', 'gynec', 'obstet'], specs: ['obstet', 'gynec', 'gynecologist'] },
    { keywords: ['ear', 'nose', 'throat', 'ent'], specs: ['ent'] },
    { keywords: ['tooth', 'dental', 'teeth'], specs: ['dent'] },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((word) => text.includes(word))) {
      const matched = doctors.filter((doc) =>
        rule.specs.some((spec) => doc.specialization.toLowerCase().includes(spec))
      );
      if (matched.length > 0) return matched.slice(0, 3);
    }
  }

  return doctors.slice(0, 3);
}

function fallbackRecommendation(condition: string, doctors: DoctorRecord[]) {
  const matched = matchDoctorsByCondition(condition, doctors);
  const top = matched[0];

  return {
    recommendation: `Based on your description ("${condition.slice(0, 120)}${condition.length > 120 ? '...' : ''}"), we recommend consulting ${top.name}, a ${top.specialization} specialist in ${top.location} with ${top.experience} years of experience and a ${top.rating}/5 rating. Consultation fee: Rs. ${top.consultationFee}. Book an appointment for a proper evaluation.`,
    recommendedDoctor: top.name,
    urgency: 'Schedule within 1-2 weeks unless symptoms worsen',
    nextSteps: ['Book an appointment', 'Prepare your symptom history', 'Bring any prior test results'],
    doctors: matched,
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
      const prompt = `Based on the patient's medical condition: "${condition}"

Recommend the most suitable doctors from this list:
${doctors.map((d) => `- ${d.name} (${d.specialization}, ${d.location}, ${d.experience} years, Rating: ${d.rating}, Fee: Rs. ${d.consultationFee})`).join('\n')}

Respond in plain text with:
1. Recommended doctor name
2. Why they are the best choice
3. Urgency level
4. Next steps

Keep it concise and helpful.`;

      const result = await generateText(prompt);
      const matched = matchDoctorsByCondition(condition, doctors);

      return NextResponse.json({
        recommendation: result.text,
        doctors: matched,
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
      fallbackRecommendation(condition || 'general symptoms', doctors)
    );
  }
}
