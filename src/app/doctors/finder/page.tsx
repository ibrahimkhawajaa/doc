'use client';

import { useState } from 'react';
import DoctorCard from '@/components/DoctorCard';
import type { DoctorRecord } from '@/lib/doctors';

export default function DoctorFinderPage() {
  const [condition, setCondition] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condition.trim()) {
      setError('Please describe your condition');
      return;
    }

    setLoading(true);
    setError('');
    setRecommendation('');
    setDoctors([]);

    try {
      const response = await fetch('/api/doctors/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ condition }),
      });

      const data = await response.json();

      if (response.ok) {
        const rec =
          typeof data.recommendation === 'string'
            ? data.recommendation
            : JSON.stringify(data.recommendation, null, 2);
        setRecommendation(rec);
        setDoctors(data.doctors || []);
      } else {
        setError(data.error || 'Failed to get recommendation');
      }
    } catch {
      setError('Error getting doctor recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    'Chest pain and shortness of breath',
    'Itchy skin rash on my arm',
    'Persistent headaches and dizziness',
    'Joint pain in my knee after exercise',
  ];

  return (
    <div className="page-shell">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="mb-10">
          <span className="badge mb-4">AI-Powered Matching</span>
          <h1 className="section-title mb-3">AI Doctor Finder</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Describe your symptoms and our AI will recommend the best specialists for your condition
          </p>
        </div>

        <div className="card p-6 md:p-8 mb-8 bg-gradient-to-br from-emerald-600 to-teal-600 text-white border-0">
          <form onSubmit={handleSubmit} className="max-w-3xl">
            <label className="block text-sm font-semibold mb-2 text-emerald-50">
              Describe Your Health Condition *
            </label>
            <textarea
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="E.g., I have severe chest pain, shortness of breath, and dizziness..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-white/30 border-0 mb-4"
            />

            <div className="flex flex-wrap gap-2 mb-5">
              {examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setCondition(example)}
                  className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition"
                >
                  {example}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-white text-emerald-700 hover:bg-emerald-50 font-bold py-3 px-8 rounded-xl disabled:opacity-50 transition shadow-lg"
            >
              {loading ? 'Analyzing Your Condition...' : 'Find Best Doctors for Me'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8">
            {error}
          </div>
        )}

        {recommendation && (
          <div className="card p-6 md:p-8 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">AI Analysis & Recommendation</h2>
            <div className="bg-slate-50 rounded-xl p-5 text-slate-700 leading-relaxed whitespace-pre-wrap">
              {recommendation}
            </div>
          </div>
        )}

        {doctors.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Recommended Doctors ({doctors.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </div>
        )}

        {!recommendation && !error && !loading && (
          <div className="card text-center py-16">
            <p className="text-5xl mb-4">🏥</p>
            <p className="text-slate-600 text-lg mb-2">
              Describe your health condition to get AI-powered recommendations
            </p>
            <p className="text-slate-400 text-sm">
              Works with or without a Gemini API key — smart matching is always available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
