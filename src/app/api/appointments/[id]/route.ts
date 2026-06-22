import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: body.status },
    });

    return NextResponse.json({
      message: 'Appointment updated',
      appointment: {
        id: appointment.id,
        status: appointment.status,
      },
    });
  } catch (error) {
    console.error('Appointment update error:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.appointment.delete({ where: { id } });
    return NextResponse.json({ message: 'Appointment deleted' });
  } catch (error) {
    console.error('Appointment delete error:', error);
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}
