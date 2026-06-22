'use client';

import Link from 'next/link';
import DoctorAvatar from '@/components/DoctorAvatar';
import { formatConsultationFee, type DoctorRecord } from '@/lib/doctors';

interface DoctorCardProps {
  doctor: DoctorRecord;
  showViewProfile?: boolean;
}

export default function DoctorCard({ doctor, showViewProfile = true }: DoctorCardProps) {
  return (
    <div className="card overflow-hidden group h-full flex flex-col">
      <Link href={`/doctors/${doctor.id}`} className="block">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 flex flex-col items-center relative">
          <DoctorAvatar
            name={doctor.name}
            id={doctor.id}
            imageUrl={doctor.imageUrl}
            size={112}
            className="group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-white/90 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">
            ⭐ {doctor.rating}
          </div>
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-1">
        <Link href={`/doctors/${doctor.id}`} className="hover:text-emerald-700 transition">
          <h3 className="text-xl font-bold text-slate-900 mb-1">{doctor.name}</h3>
          <p className="text-emerald-600 font-semibold mb-4">{doctor.specialization}</p>
        </Link>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-amber-700">{doctor.experience}y</p>
            <p className="text-xs text-slate-500">Experience</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-emerald-700">
              {formatConsultationFee(doctor.consultationFee, doctor.consultationCurrency)}
            </p>
            <p className="text-xs text-slate-500">Consultation</p>
          </div>
        </div>

        <div className="space-y-2 mb-5 text-sm text-slate-600 flex-1">
          <p>📍 {doctor.location}</p>
          <p>🏥 {doctor.hospital}</p>
          {doctor.phone && <p>📞 {doctor.phone}</p>}
        </div>

        <div className="space-y-2 mt-auto">
          <Link
            href={`/doctors/${doctor.id}`}
            className="btn-secondary block w-full py-2.5 text-center text-sm"
          >
            View Profile
          </Link>
          <Link
            href={`/booking?doctor=${encodeURIComponent(doctor.id)}&name=${encodeURIComponent(doctor.name)}`}
            className="btn-primary block w-full py-2.5 text-center text-sm"
          >
            Book Appointment
          </Link>
        </div>

        {showViewProfile && doctor.source && (
          <p className="text-xs text-slate-400 text-center mt-3">
            Verified via {doctor.source}
          </p>
        )}
      </div>
    </div>
  );
}
