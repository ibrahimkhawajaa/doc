import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-emerald-50 via-white to-cyan-50 min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
              ✨ Revolutionary Healthcare
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Health, Our Priority
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Book appointments with verified doctors, get AI-powered medical recommendations, and manage your health all in one place.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/booking" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-lg font-semibold transform hover:scale-105 transition shadow-lg">
                🗓️ Book Now
              </Link>
              <Link href="/doctors/finder" className="bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-4 rounded-lg font-semibold transition shadow-md">
                🤖 AI Doctor Finder
              </Link>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl p-8 text-white text-center">
            <div className="text-7xl mb-4">💊</div>
            <p className="text-2xl font-bold">Healthcare Made Easy</p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-3xl font-bold">10K+</p>
                <p className="text-sm">Happy Patients</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-3xl font-bold">500+</p>
                <p className="text-sm">Verified Doctors</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-3xl font-bold">50+</p>
                <p className="text-sm">Hospitals</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-3xl font-bold">24/7</p>
                <p className="text-sm">Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-xl text-gray-600">Everything you need for quality healthcare</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: '📅',
              title: 'Smart Booking',
              desc: 'Schedule appointments instantly with verified doctors',
              link: '/booking',
              gradient: 'from-blue-500 to-blue-600'
            },
            {
              icon: '👨‍⚕️',
              title: 'Expert Doctors',
              desc: 'Access a network of qualified healthcare professionals',
              link: '/doctors',
              gradient: 'from-emerald-500 to-teal-600'
            },
            {
              icon: '🤖',
              title: 'AI Assistant',
              desc: 'Get personalized doctor recommendations using AI',
              link: '/doctors/finder',
              gradient: 'from-purple-500 to-pink-600'
            },
            {
              icon: '🔬',
              title: 'Prescription Analysis',
              desc: 'Upload images for AI-powered medical insights',
              link: '/prescription-analyzer',
              gradient: 'from-orange-500 to-red-600'
            },
            {
              icon: '💬',
              title: 'Live Chat Support',
              desc: '24/7 AI-powered chatbot assistance',
              link: '/',
              gradient: 'from-cyan-500 to-blue-600'
            },
            {
              icon: '📊',
              title: 'Health Dashboard',
              desc: 'Track your appointments and medical history',
              link: '/',
              gradient: 'from-green-500 to-emerald-600'
            },
          ].map((service, idx) => (
            <Link key={idx} href={service.link} className="group">
              <div className={`bg-gradient-to-br ${service.gradient} rounded-2xl p-8 text-white h-full transform hover:scale-105 transition shadow-lg hover:shadow-2xl`}>
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                <p className="text-white/90">{service.desc}</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition">
                  Learn more →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: '1️⃣', title: 'Create Account', desc: 'Sign up with your email' },
              { num: '2️⃣', title: 'Browse Doctors', desc: 'Search by specialty' },
              { num: '3️⃣', title: 'Book Appointment', desc: 'Choose date & time' },
              { num: '4️⃣', title: 'Get Consulted', desc: 'Receive expert care' },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl mb-4">{step.num}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-white/80">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose MediCare */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">Why Choose MediCare?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { emoji: '✅', title: 'Verified Professionals', desc: 'All doctors are licensed and verified' },
            { emoji: '⚡', title: 'Instant Booking', desc: 'Get appointments in minutes' },
            { emoji: '🔒', title: 'Secure & Private', desc: 'Your data is encrypted and protected' },
            { emoji: '💰', title: 'Affordable Pricing', desc: 'Transparent, competitive rates' },
            { emoji: '🌍', title: 'Wide Network', desc: 'Access doctors across regions' },
            { emoji: '📱', title: 'Mobile Friendly', desc: 'Book anytime, anywhere' },
            { emoji: '🤖', title: 'AI Powered', desc: 'Smart recommendations' },
            { emoji: '🏥', title: 'Multiple Hospitals', desc: 'Choose from trusted facilities' },
            { emoji: '⭐', title: 'Top Rated', desc: '4.9/5 average rating' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition border-l-4 border-emerald-600">
              <div className="text-3xl mb-3">{item.emoji}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">Patient Testimonials</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Fatima Ahmed',
                role: 'Patient',
                text: 'MediCare made it so easy to find a doctor. The AI recommendations were spot on!',
                rating: '⭐⭐⭐⭐⭐'
              },
              {
                name: 'Mohammed Ali',
                role: 'Patient',
                text: 'Best healthcare app I have used. Quick booking, professional doctors, great experience.',
                rating: '⭐⭐⭐⭐⭐'
              },
              {
                name: 'Sarah Khan',
                role: 'Patient',
                text: 'The prescription analyzer helped me understand my condition better. Highly recommended!',
                rating: '⭐⭐⭐⭐⭐'
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-xl p-8 shadow-md">
                <div className="mb-4">{testimonial.rating}</div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of patients who trust MediCare for their healthcare needs
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/booking" className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold transform hover:scale-105 transition">
              📅 Book Now
            </Link>
            <Link href="/contact" className="border-2 border-white text-white hover:bg-white/20 px-8 py-4 rounded-lg font-bold transition">
              📞 Get Help
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Preview */}
      <section className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">🏥 MediCare</h3>
              <p className="text-gray-400">Your trusted healthcare partner</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/doctors" className="hover:text-white">Doctors</Link></li>
                <li><Link href="/booking" className="hover:text-white">Book</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MediCare. All rights reserved. Empowering Healthcare Together.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
