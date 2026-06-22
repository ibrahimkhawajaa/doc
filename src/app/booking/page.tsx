'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { type DoctorRecord } from '@/lib/doctors';

function BookingForm() {
  const searchParams = useSearchParams();
  const preselectedDoctor = searchParams.get('doctor') || '';
  const preselectedName = searchParams.get('name') || '';

  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    doctor: preselectedDoctor,
    doctorName: preselectedName,
    date: '',
    time: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetch('/api/scraping/doctors')
      .then((res) => res.json())
      .then((data) => {
        if (data.doctors?.length) {
          setDoctors(data.doctors);
          if (preselectedDoctor && !preselectedName) {
            const found = data.doctors.find((d: DoctorRecord) => d.id === preselectedDoctor);
            if (found) {
              setFormData((prev) => ({ ...prev, doctorName: found.name }));
            }
          }
        }
      })
      .catch(console.error);
  }, [preselectedDoctor, preselectedName]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'doctor') {
      const selected = doctors.find((d) => d.id === value);
      setFormData((prev) => ({
        ...prev,
        doctor: value,
        doctorName: selected?.name || '',
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType('success');
        setMessage('Appointment booked successfully! We will send a confirmation shortly.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          doctor: '',
          doctorName: '',
          date: '',
          time: '',
          reason: '',
        });
      } else {
        setMessageType('error');
        setMessage(data.error || 'Failed to book appointment');
      }
    } catch {
      setMessageType('error');
      setMessage('Error booking appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="page-shell">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div className="mb-10 animate-fade-in">
          <span className="badge mb-4">Quick & Easy Scheduling</span>
          <h1 className="section-title mb-3">Book an Appointment</h1>
          <p className="text-lg text-slate-600">
            Schedule a consultation with our experienced doctors in minutes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 card p-6 md:p-8 animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Select Doctor *
                  </label>
                  <select
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">-- Select a Doctor --</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} — {doc.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={minDate}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Time *</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reason for Visit
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Describe your symptoms or reason for visit..."
                />
              </div>

              {message && (
                <div
                  className={`p-4 rounded-xl border ${
                    messageType === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {message}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                {loading ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </form>
          </div>

          <div className="space-y-6 animate-fade-in">
            <div className="card p-6 sticky top-24">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Booking Info</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> Fill all required fields</li>
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> Choose an available date and time</li>
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> Confirmation saved to your account</li>
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> Arrive 15 minutes early</li>
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> Cancel up to 24 hours before</li>
              </ul>
            </div>

            <div className="card p-6 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
              <h3 className="font-bold mb-2">Need help choosing?</h3>
              <p className="text-sm text-emerald-50 mb-4">
                Use our AI Doctor Finder to match your symptoms with the right specialist.
              </p>
              <Link href="/doctors/finder" className="inline-block bg-white text-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition">
                Try AI Finder →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="page-shell min-h-screen flex items-center justify-center">Loading...</div>}>
      <BookingForm />
    </Suspense>
  );
}
