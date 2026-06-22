import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { FALLBACK_DOCTORS, normalizeDoctor } from '@/lib/doctors';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const dbDoctor = await prisma.doctor.findUnique({ where: { id } });

    if (dbDoctor) {
      return NextResponse.json(
        normalizeDoctor({
          id: dbDoctor.id,
          name: dbDoctor.name,
          specialization: dbDoctor.specialization,
          experience: dbDoctor.experience,
          rating: dbDoctor.rating,
          consultationFee: dbDoctor.consultationFee,
          location: dbDoctor.location,
          hospital: dbDoctor.hospital,
          phone: dbDoctor.phone ?? undefined,
          email: dbDoctor.email ?? undefined,
          imageUrl: dbDoctor.imageUrl ?? undefined,
          source: dbDoctor.source,
          profileUrl: dbDoctor.profileUrl ?? undefined,
        })
      );
    }

    const fallback = FALLBACK_DOCTORS.find((d) => d.id === id);
    if (fallback) {
      return NextResponse.json(fallback);
    }

    return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
  } catch (error) {
    console.error('Doctor fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch doctor' }, { status: 500 });
  }
}
