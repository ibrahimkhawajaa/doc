'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import DoctorAvatar from '@/components/DoctorAvatar';
import { formatConsultationFee, type DoctorRecord } from '@/lib/doctors';

export default function DoctorProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [doctor, setDoctor] = useState<DoctorRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    fetch(`/api/doctors/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Doctor not found');
        setDoctor(data);
      })
      .catch((err) => setError(err.message || 'Failed to load doctor'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-500 animate-pulse">Loading doctor profile...</p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="page-shell">
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <p className="text-2xl mb-4">Doctor not found</p>
          <p className="text-slate-500 mb-6">{error}</p>
          <Link href="/doctors" className="btn-primary inline-block px-6 py-3">
            Browse All Doctors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <Link
          href="/doctors"
          className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium mb-8 text-sm"
        >
          ← Back to all doctors
        </Link>

        <div className="card overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 px-6 py-10 md:px-10 flex flex-col md:flex-row items-center gap-8">
            <DoctorAvatar
              name={doctor.name}
              id={doctor.id}
              imageUrl={doctor.imageUrl}
              size={140}
            />
            <div className="text-center md:text-left text-white">
              <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                {doctor.source || 'Verified Doctor'}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{doctor.name}</h1>
              <p className="text-emerald-100 text-xl font-medium mb-3">{doctor.specialization}</p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">⭐ {doctor.rating} rating</span>
                <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">{doctor.experience} years exp.</span>
                <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">
                  {formatConsultationFee(doctor.consultationFee, doctor.consultationCurrency)} fee
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-10">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Doctor Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                { label: 'Location', value: doctor.location, icon: '📍' },
                { label: 'Hospital / Practice', value: doctor.hospital, icon: '🏥' },
                { label: 'Phone', value: doctor.phone || 'Not listed', icon: '📞' },
                { label: 'Consultation Fee', value: formatConsultationFee(doctor.consultationFee, doctor.consultationCurrency), icon: '💰' },
                { label: 'Experience', value: `${doctor.experience} years`, icon: '🎓' },
                { label: 'Rating', value: `${doctor.rating} / 5`, icon: '⭐' },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">
                    {item.icon} {item.label}
                  </p>
                  <p className="text-slate-900 font-medium">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/booking?doctor=${encodeURIComponent(doctor.id)}&name=${encodeURIComponent(doctor.name)}`}
                className="btn-primary flex-1 py-3.5 text-center"
              >
                Book Appointment
              </Link>
              {doctor.profileUrl?.startsWith('http') && (
                <a
                  href={doctor.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex-1 py-3.5 text-center"
                >
                  View on Marham.pk
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
