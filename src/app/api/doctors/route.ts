import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { FALLBACK_DOCTORS, normalizeDoctor } from '@/lib/doctors';

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      orderBy: { rating: 'desc' },
    });

    if (doctors.length === 0) {
      return NextResponse.json(FALLBACK_DOCTORS);
    }

    return NextResponse.json(
      doctors.map((doc, index) =>
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
          },
          index
        )
      )
    );
  } catch (error) {
    console.error('Doctors fetch error:', error);
    return NextResponse.json(FALLBACK_DOCTORS);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, specialization, email, phone, experience, consultationFee, location, hospital } =
      body;

    const doctor = await prisma.doctor.create({
      data: {
        name,
        specialization,
        email: email || null,
        phone: phone || null,
        experience: experience ? Number(experience) : 5,
        consultationFee: consultationFee ? Number(consultationFee) : 200,
        location: location || 'Medical Center',
        hospital: hospital || 'General Hospital',
        rating: 4.5,
        source: 'admin',
      },
    });

    return NextResponse.json(normalizeDoctor({
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      experience: doctor.experience,
      rating: doctor.rating,
      consultationFee: doctor.consultationFee,
      location: doctor.location,
      hospital: doctor.hospital,
      phone: doctor.phone ?? undefined,
      email: doctor.email ?? undefined,
      imageUrl: doctor.imageUrl ?? undefined,
      source: doctor.source,
    }), { status: 201 });
  } catch (error) {
    console.error('Doctor create error:', error);
    return NextResponse.json({ error: 'Failed to create doctor' }, { status: 500 });
  }
}
