'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        if (rememberMe) {
          localStorage.setItem('adminEmail', email);
        }
        router.push('/admin');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 p-8 text-center">
            <div className="text-5xl mb-4">🏥</div>
            <h1 className="text-3xl font-bold text-white mb-2">MediCare Admin</h1>
            <p className="text-emerald-100">Secure Access Portal</p>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                <p className="font-semibold">❌ {error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📧 Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                  placeholder="admin@medicare.com"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔐 Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                  placeholder="••••••••"
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold">
                  Forgot password?
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Logging in...' : '🔓 Login to Dashboard'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Support Links */}
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-emerald-600 hover:bg-emerald-50 transition text-gray-700 font-semibold">
                <span>📞</span> Contact Support
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-emerald-600 hover:bg-emerald-50 transition text-gray-700 font-semibold">
                <span>🔑</span> Verify Identity
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-5 text-center border-t border-gray-200 space-y-2">
            <p className="text-xs text-gray-500">
              Demo: admin@medicare.com / Admin@2024
            </p>
            <p className="text-sm text-gray-600">
              Not authorized?{' '}
              <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                Go Home
              </Link>
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-emerald-600">
            <p className="font-semibold text-gray-800 text-sm">🛡️ Secure Login</p>
            <p className="text-xs text-gray-600 mt-1">Your data is encrypted and protected</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-cyan-600">
            <p className="font-semibold text-gray-800 text-sm">⏰ 24/7 Access</p>
            <p className="text-xs text-gray-600 mt-1">Manage your platform anytime</p>
          </div>
        </div>
      </div>
    </div>
  );
}
