'use client';

import { useState } from 'react';

export default function PrescriptionAnalyzer() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [analysis, setAnalysis] = useState('');
  const [aiPowered, setAiPowered] = useState(false);
  const [condition, setCondition] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!image) {
      setError('Please select an image');
      return;
    }
    if (!condition.trim()) {
      setError('Please describe the affected area');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis('');
    setAiPowered(false);

    try {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('condition', condition);

      const response = await fetch('/api/ai/analyze-prescription', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setAnalysis(data.prescription);
        setAiPowered(Boolean(data.aiPowered));
      } else {
        setError(data.error || 'Failed to analyze image');
      }
    } catch {
      setError('Error analyzing image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div className="mb-10 animate-fade-in">
          <span className="badge mb-4">AI Medical Insights</span>
          <h1 className="section-title mb-3">Prescription Analyzer</h1>
          <p className="text-lg text-slate-600">
            Upload a medical image for AI-powered analysis and general health guidance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card p-6 md:p-8 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Upload Image</h2>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Describe the affected area *
              </label>
              <textarea
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="E.g., Rash on arm, swelling on leg, acne on face..."
                rows={4}
                className="input-field resize-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Image *
              </label>
              <div
                className="border-2 border-dashed border-emerald-200 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition"
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                {preview ? (
                  <div>
                    <img src={preview} alt="Preview" className="max-h-48 mx-auto mb-4 rounded-xl" />
                    <p className="text-emerald-600 font-semibold text-sm">Click to change image</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-2">📸</div>
                    <p className="text-slate-600">Click to upload or drag and drop</p>
                    <p className="text-sm text-slate-400 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                )}
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || !image || !condition}
              className="btn-primary w-full py-3.5"
            >
              {loading ? 'Analyzing...' : 'Analyze Image'}
            </button>
          </div>

          <div className="card p-6 md:p-8 bg-gradient-to-br from-emerald-50 to-teal-50 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Analysis Results</h2>

            {analysis ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      aiPowered
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {aiPowered ? 'Gemini AI Analysis' : 'General Guidance (no AI key or quota)'}
                  </span>
                </div>
                <div className="bg-white rounded-xl p-5 border border-emerald-100">
                  <h3 className="font-bold text-slate-900 mb-3">Medical Assessment</h3>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
                    {analysis}
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Disclaimer:</strong> This AI analysis is for informational purposes
                    only. Always consult a licensed doctor for proper diagnosis and treatment.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12">
                <p className="text-4xl mb-4">📊</p>
                <p>Upload an image and click Analyze to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
