'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import DoctorCard from '@/components/DoctorCard';
import { type DoctorRecord } from '@/lib/doctors';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorRecord[]>([]);
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [source, setSource] = useState('');
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);

  const applyFilters = useCallback(
    (list: DoctorRecord[], spec: string, loc: string, sort: string) => {
      let filtered = [...list];

      if (spec) {
        filtered = filtered.filter((d) =>
          d.specialization.toLowerCase().includes(spec.toLowerCase())
        );
      }

      if (loc) {
        filtered = filtered.filter(
          (d) =>
            d.location.toLowerCase().includes(loc.toLowerCase()) ||
            d.hospital.toLowerCase().includes(loc.toLowerCase())
        );
      }

      if (sort === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (sort === 'experience') {
        filtered.sort((a, b) => b.experience - a.experience);
      } else if (sort === 'fee') {
        filtered.sort((a, b) => a.consultationFee - b.consultationFee);
      }

      return filtered;
    },
    []
  );

  const fetchDoctors = async (pageNum = 1, shouldRefresh = false) => {
    if (pageNum === 1) {
      if (shouldRefresh) setRefreshing(true);
      else setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const delay = pageNum === 1 ? 500 : 1000; // Longer delay for subsequent pages
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '24',
        delay: delay.toString(),
      });

      if (shouldRefresh) {
        params.set('refresh', 'true');
      }

      const url = `/api/scraping/doctors?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.doctors?.length) {
        if (pageNum === 1) {
          // First page: replace all doctors
          setDoctors(data.doctors);
          setSource(data.source || '');
          setTotal(data.total || data.doctors.length);
          setHasMore(data.hasMore ?? true);
        } else {
          // Subsequent pages: append new doctors
          setDoctors((prev) => [...prev, ...data.doctors]);
          setHasMore(data.hasMore ?? true);
        }
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    setPage(1);
    fetchDoctors(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply filters whenever doctors, specialty, location, or sortBy changes
  useEffect(() => {
    setFilteredDoctors(applyFilters(doctors, specialty, location, sortBy));
  }, [doctors, specialty, location, sortBy, applyFilters]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && hasMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchDoctors(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, loading, loadingMore, hasMore]);

  const handleRefresh = () => {
    setPage(1);
    fetchDoctors(1, true);
  };

  return (
    <div className="page-shell">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="mb-10">
          <span className="badge mb-4">Quality Healthcare Professionals</span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="section-title mb-3">Find Your Doctor</h1>
              <p className="text-lg text-slate-600">
                Search from our network of{' '}
                <span className="font-semibold text-emerald-700">
                  {filteredDoctors.length} / {total}
                </span>{' '}
                verified healthcare professionals
                {source && (
                  <span className="block text-sm text-slate-500 mt-1">
                    Data source: {source === 'live-scraper' ? '🔴 Live Marham.pk (Pakistan)' : source}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary px-5 py-3 text-sm shrink-0"
            >
              {refreshing ? 'Refreshing...' : '↻ Refresh'}
            </button>
          </div>
        </div>

        <div className="card p-6 md:p-8 mb-10">
          <h2 className="text-xl font-bold mb-5 text-slate-900">Search Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Specialization
              </label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="E.g., Cardiology"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="E.g., Lahore"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field"
              >
                <option value="rating">Highest Rating</option>
                <option value="experience">Most Experience</option>
                <option value="fee">Lowest Fee</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card h-96 animate-pulse bg-slate-200">
                <div className="h-48 bg-slate-300 rounded mb-3" />
                <div className="h-6 bg-slate-300 rounded mb-2" />
                <div className="h-4 bg-slate-300 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : filteredDoctors.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>

            {/* Infinite scroll target */}
            <div ref={observerTarget} className="mt-12 pt-8 flex justify-center">
              {loadingMore && (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <p className="text-slate-600 text-sm">Loading more doctors...</p>
                </div>
              )}
              {!hasMore && filteredDoctors.length > 0 && (
                <p className="text-slate-500 text-center">
                  No more doctors to load. Showing all {filteredDoctors.length} doctors.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="card text-center py-16">
            <p className="text-2xl mb-2">No doctors found</p>
            <p className="text-slate-500">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
