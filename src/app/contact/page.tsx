'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: '📍', title: 'Address', lines: ['Plot 38, Babar Block', 'Garden Town, Lahore, Pakistan'] },
    { icon: '📞', title: 'Phone', lines: ['+92-42-34500888', 'Available 24/7'] },
    { icon: '✉️', title: 'Email', lines: ['support@medicare.pk', 'Response within 24 hours'] },
    { icon: '⏰', title: 'Hours', lines: ['Mon–Fri: 9 AM – 6 PM', 'Sat: 10 AM – 4 PM', 'Sun: Closed'] },
  ];

  return (
    <div className="page-shell">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <span className="badge mb-4">We&apos;re Here to Help</span>
          <h1 className="section-title mb-3">Contact Us</h1>
          <p className="text-lg text-slate-600">Get in touch with our support team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            {contactInfo.map((item) => (
              <div key={item.title} className="card p-5">
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                {item.lines.map((line) => (
                  <p key={line} className="text-sm text-slate-600">
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 card p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Send us a Message</h2>

            {submitted && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm">
                Thank you! Your message has been sent and saved. We&apos;ll get back to you soon.
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-field" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" placeholder="your@email.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="+92 300 1234567" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Subject *</label>
                <select name="subject" value={formData.subject} onChange={handleChange} required className="input-field">
                  <option value="">-- Select Subject --</option>
                  <option value="appointment">Appointment Issue</option>
                  <option value="billing">Billing Question</option>
                  <option value="feedback">Feedback</option>
                  <option value="support">Technical Support</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Message *</label>
                <textarea name="message" value={formData.message} onChange={handleChange} required rows={5} className="input-field resize-none" placeholder="Your message..." />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
