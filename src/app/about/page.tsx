export default function AboutPage() {
  const values = [
    { icon: '✓', title: 'Verified Doctors', desc: 'All doctors are licensed and verified professionals' },
    { icon: '⏰', title: '24/7 Access', desc: 'Book appointments anytime, anywhere' },
    { icon: '🔒', title: 'Privacy Secure', desc: 'Your health data is encrypted and protected' },
    { icon: '💰', title: 'Affordable', desc: 'Transparent, competitive pricing' },
    { icon: '🤖', title: 'AI Powered', desc: 'Smart recommendations and analysis' },
    { icon: '⚡', title: 'Fast Booking', desc: 'Quick appointment confirmation' },
  ];

  const team = [
    { name: 'Ibrahim Khan', role: 'Founder & CEO', emoji: '👨‍💼' },
    { name: 'Dr. Sarah Ahmed', role: 'Medical Director', emoji: '👩‍⚕️' },
    { name: 'Ahmed Hassan', role: 'Tech Lead', emoji: '👨‍💻' },
  ];

  return (
    <div className="page-shell">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-16 animate-fade-in">
          <span className="badge mb-4">Our Story</span>
          <h1 className="section-title mb-4">About MediCare</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Making quality healthcare accessible through technology, AI, and a trusted network of
            professionals
          </p>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-20 animate-fade-in">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              MediCare is dedicated to making quality healthcare accessible to everyone. We leverage
              modern technology to connect patients with experienced healthcare professionals and
              provide personalized medical guidance.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Our platform simplifies appointment booking, eliminates geographical barriers, and
              ensures timely access to medical expertise — powered by live doctor data and AI
              assistance.
            </p>
          </div>
          <div className="card p-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-center border-0">
            <div className="text-7xl mb-4">🏥</div>
            <h3 className="text-2xl font-bold">Healthcare at Your Fingertips</h3>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Why Choose MediCare?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((item) => (
              <div key={item.title} className="card p-6 text-center hover:-translate-y-1 transition-transform">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member) => (
              <div key={member.name} className="card p-8 text-center">
                <div className="text-5xl mb-4">{member.emoji}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{member.name}</h3>
                <p className="text-emerald-600 font-semibold text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-10 bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Happy Patients' },
              { value: '500+', label: 'Verified Doctors' },
              { value: '50+', label: 'Hospitals' },
              { value: '4.9', label: 'Average Rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold mb-1">{stat.value}</div>
                <p className="text-emerald-100 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
