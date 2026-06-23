'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: string;
  reason: string;
  email?: string;
  phone?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience?: number;
  email?: string;
  phone?: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  date: string;
  time: string;
}

interface ScraperStats {
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  successCount: number;
  failureCount: number;
  isRunning: boolean;
  doctorsAdded: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [scraperStats, setScraperStats] = useState<ScraperStats | null>(null);
  const [scraperLoading, setScraperLoading] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialization: '',
    email: '',
    phone: '',
  });
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalDoctors: 0,
    pendingAppointments: 0,
    totalContacts: 0,
    newContacts: 0,
  });

  const loadData = async () => {
    try {
      const [apptRes, doctorsRes, contactRes, scraperRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/doctors'),
        fetch('/api/contact'),
        fetch('/api/scraping/scheduler?action=stats'),
      ]);

      if (apptRes.ok) {
        const data = await apptRes.json();
        setAppointments(Array.isArray(data) ? data : []);
        setStats((prev) => ({
          ...prev,
          totalAppointments: Array.isArray(data) ? data.length : 0,
          pendingAppointments: Array.isArray(data)
            ? data.filter((a: Appointment) => a.status === 'pending').length
            : 0,
        }));
      }

      if (doctorsRes.ok) {
        const data = await doctorsRes.json();
        setDoctors(Array.isArray(data) ? data : []);
        setStats((prev) => ({
          ...prev,
          totalDoctors: Array.isArray(data) ? data.length : 0,
        }));
      }

      if (contactRes.ok) {
        const data = await contactRes.json();
        setContacts(Array.isArray(data) ? data : []);
        setStats((prev) => ({
          ...prev,
          totalContacts: Array.isArray(data) ? data.length : 0,
          newContacts: Array.isArray(data)
            ? data.filter((c: ContactMessage) => c.status === 'new').length
            : 0,
        }));
      }

      if (scraperRes.ok) {
        const scraperData = await scraperRes.json();
        if (scraperData.stats) {
          setScraperStats(scraperData.stats);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin-login');
    } else {
      setAuthenticated(true);
      loadData();
      // Refresh scraper stats every 5 minutes
      const interval = setInterval(() => {
        fetch('/api/scraping/scheduler?action=stats')
          .then(r => r.json())
          .then(data => data.stats && setScraperStats(data.stats))
          .catch(console.error);
      }, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    router.push('/admin-login');
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoctor),
      });
      if (response.ok) {
        setNewDoctor({ name: '', specialization: '', email: '', phone: '' });
        loadData();
      }
    } catch (error) {
      console.error('Error adding doctor:', error);
    }
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const updateContactStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleRefreshScraper = async () => {
    setScraperLoading(true);
    try {
      const response = await fetch('/api/scraping/scheduler?action=trigger');
      const data = await response.json();
      alert(data.message || 'Scraper triggered');
      // Refresh stats immediately
      loadData();
    } catch (error) {
      console.error('Scraper error:', error);
      alert('Error triggering scraper');
    } finally {
      setScraperLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-xl">
              🏥
            </span>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-emerald-100 text-sm">Appointments, contacts & doctors</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefreshScraper}
              disabled={scraperLoading}
              className="bg-white/20 hover:bg-white/30 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              {scraperLoading ? 'Scraping...' : 'Run Scraper'}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 border-l-4 border-emerald-500">
            <p className="text-slate-500 text-sm font-medium">Total Appointments</p>
            <p className="text-4xl font-bold text-emerald-600 mt-1">{stats.totalAppointments}</p>
          </div>
          <div className="card p-6 border-l-4 border-teal-500">
            <p className="text-slate-500 text-sm font-medium">Registered Doctors</p>
            <p className="text-4xl font-bold text-teal-600 mt-1">{stats.totalDoctors}</p>
          </div>
          <div className="card p-6 border-l-4 border-amber-500">
            <p className="text-slate-500 text-sm font-medium">Pending Appointments</p>
            <p className="text-4xl font-bold text-amber-600 mt-1">{stats.pendingAppointments}</p>
          </div>
          <div className="card p-6 border-l-4 border-violet-500">
            <p className="text-slate-500 text-sm font-medium">Contact Messages</p>
            <p className="text-4xl font-bold text-violet-600 mt-1">{stats.totalContacts}</p>
            {stats.newContacts > 0 && (
              <p className="text-xs text-violet-500 mt-1">{stats.newContacts} new unread</p>
            )}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {[
              { id: 'appointments', label: 'Appointments' },
              { id: 'contacts', label: 'Contact Us' },
              { id: 'doctors', label: 'Doctors' },
              { id: 'reports', label: 'Reports' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/50'
                    : 'text-slate-500 hover:text-emerald-700'
                }`}
              >
                {tab.label}
                {tab.id === 'contacts' && stats.newContacts > 0 && (
                  <span className="ml-2 bg-violet-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {stats.newContacts}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'appointments' && (
              <div>
                <h3 className="text-xl font-bold mb-4 text-slate-900">Manage Appointments</h3>
                {appointments.length === 0 ? (
                  <p className="text-slate-500 py-8 text-center">No appointments yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-slate-500">
                          <th className="px-3 py-3 font-semibold">Patient</th>
                          <th className="px-3 py-3 font-semibold">Contact</th>
                          <th className="px-3 py-3 font-semibold">Doctor</th>
                          <th className="px-3 py-3 font-semibold">Date & Time</th>
                          <th className="px-3 py-3 font-semibold">Reason</th>
                          <th className="px-3 py-3 font-semibold">Status</th>
                          <th className="px-3 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((apt) => (
                          <tr key={apt.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-3 py-3">
                              <p className="font-medium text-slate-900">{apt.patientName}</p>
                            </td>
                            <td className="px-3 py-3">
                              <p className="text-xs text-slate-600">{apt.email}</p>
                              <p className="text-xs text-slate-500">{apt.phone}</p>
                            </td>
                            <td className="px-3 py-3">{apt.doctorName}</td>
                            <td className="px-3 py-3">
                              {apt.date} at {apt.time}
                            </td>
                            <td className="px-3 py-3 max-w-[180px]">
                              <p className="text-xs text-slate-600 truncate" title={apt.reason}>
                                {apt.reason || '—'}
                              </p>
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  apt.status === 'confirmed'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : apt.status === 'pending'
                                    ? 'bg-amber-100 text-amber-700'
                                    : apt.status === 'cancelled'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {apt.status}
                              </span>
                            </td>
                            <td className="px-3 py-3 space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-xs font-medium"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium"
                              >
                                Cancel
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'contacts' && (
              <div>
                <h3 className="text-xl font-bold mb-4 text-slate-900">Contact Us Messages</h3>
                {contacts.length === 0 ? (
                  <p className="text-slate-500 py-8 text-center">No contact messages yet</p>
                ) : (
                  <div className="space-y-4">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className={`p-5 rounded-xl border ${
                          contact.status === 'new'
                            ? 'border-violet-200 bg-violet-50/50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex flex-wrap justify-between gap-3 mb-3">
                          <div>
                            <p className="font-bold text-slate-900">{contact.name}</p>
                            <p className="text-sm text-slate-600">{contact.email}</p>
                            {contact.phone && (
                              <p className="text-sm text-slate-500">{contact.phone}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 capitalize">
                              {contact.subject}
                            </span>
                            <p className="text-xs text-slate-400 mt-1">
                              {contact.date} at {contact.time}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 bg-white/80 rounded-lg p-3 border border-slate-100">
                          {contact.message}
                        </p>
                        <div className="flex gap-2 mt-3">
                          {contact.status === 'new' && (
                            <button
                              onClick={() => updateContactStatus(contact.id, 'read')}
                              className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1 rounded-lg text-xs font-medium"
                            >
                              Mark as Read
                            </button>
                          )}
                          {contact.status !== 'resolved' && (
                            <button
                              onClick={() => updateContactStatus(contact.id, 'resolved')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-xs font-medium"
                            >
                              Mark Resolved
                            </button>
                          )}
                          <span
                            className={`ml-auto px-2.5 py-1 rounded-full text-xs font-semibold ${
                              contact.status === 'new'
                                ? 'bg-violet-100 text-violet-700'
                                : contact.status === 'read'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {contact.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'doctors' && (
              <div>
                <h3 className="text-xl font-bold mb-6 text-slate-900">Manage Doctors</h3>

                <form
                  onSubmit={handleAddDoctor}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-5 bg-slate-50 rounded-xl"
                >
                  <input
                    type="text"
                    placeholder="Doctor Name"
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                    className="input-field"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Specialization"
                    value={newDoctor.specialization}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, specialization: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newDoctor.email}
                    onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                    className="input-field"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={newDoctor.phone}
                    onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                    className="input-field"
                  />
                  <button type="submit" className="btn-primary md:col-span-2 py-3">
                    Add Doctor
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition"
                    >
                      <h4 className="font-bold text-slate-900">{doctor.name}</h4>
                      <p className="text-emerald-600 text-sm font-medium">{doctor.specialization}</p>
                      {doctor.email && (
                        <p className="text-xs text-slate-500 mt-2">{doctor.email}</p>
                      )}
                      {doctor.phone && <p className="text-xs text-slate-500">{doctor.phone}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div>
                <h3 className="text-xl font-bold mb-6 text-slate-900">Reports & Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                    <h4 className="font-bold text-slate-900 mb-2">Appointment Overview</h4>
                    <p className="text-3xl font-bold text-emerald-700">{stats.totalAppointments}</p>
                    <p className="text-sm text-slate-500 mt-1">Total bookings in system</p>
                  </div>
                  <div className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                    <h4 className="font-bold text-slate-900 mb-2">Pending Review</h4>
                    <p className="text-3xl font-bold text-amber-700">{stats.pendingAppointments}</p>
                    <p className="text-sm text-slate-500 mt-1">Awaiting confirmation</p>
                  </div>
                  <div className="p-6 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
                    <h4 className="font-bold text-slate-900 mb-2">Contact Inquiries</h4>
                    <p className="text-3xl font-bold text-violet-700">{stats.totalContacts}</p>
                    <p className="text-sm text-slate-500 mt-1">{stats.newContacts} new messages</p>
                  </div>
                  <div className="p-6 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100">
                    <h4 className="font-bold text-slate-900 mb-2">Doctor Network</h4>
                    <p className="text-3xl font-bold text-cyan-700">{stats.totalDoctors}</p>
                    <p className="text-sm text-slate-500 mt-1">Pakistani doctors from Marham.pk</p>
                  </div>
                  <div className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 md:col-span-2">
                    <h4 className="font-bold text-slate-900 mb-3">Automated Scraper Status</h4>
                    {scraperStats ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-slate-500">Status</p>
                          <p className="font-semibold text-slate-900">{scraperStats.isRunning ? '🔄 Running' : '✅ Idle'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Success</p>
                          <p className="font-semibold text-emerald-600">{scraperStats.successCount}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Failures</p>
                          <p className="font-semibold text-red-600">{scraperStats.failureCount}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Doctors Added</p>
                          <p className="font-semibold text-blue-600">{scraperStats.doctorsAdded}</p>
                        </div>
                        {scraperStats.lastRunAt && (
                          <div className="md:col-span-2">
                            <p className="text-slate-500">Last Run</p>
                            <p className="font-semibold text-slate-900 text-xs">
                              {new Date(scraperStats.lastRunAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {scraperStats.nextRunAt && (
                          <div className="md:col-span-2">
                            <p className="text-slate-500">Next Run</p>
                            <p className="font-semibold text-slate-900 text-xs">
                              {new Date(scraperStats.nextRunAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-600">Loading scraper stats...</p>
                    )}
                    <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                      The scraper runs automatically every hour to fetch Pakistani doctors from Marham.pk. 
                      Click &quot;Run Scraper&quot; above to trigger it manually. All new doctors are automatically 
                      saved to the database.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
