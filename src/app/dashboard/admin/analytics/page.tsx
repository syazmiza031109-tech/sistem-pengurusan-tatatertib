'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CompleteCase } from '@/lib/types';
import { INITIAL_CASES } from '@/lib/mock-data';
import PersaraanCharts from '@/components/persaraan-charts';
import { 
  PieChart, Building2, UserCheck, 
  MapPin, Calendar
} from 'lucide-react';

function AnalyticsContent() {
  const [cases, setCases] = useState<CompleteCase[]>([]);
  const [activeTab, setActiveTab] = useState<'kpi' | 'kesalahan' | 'kementerian' | 'demografi' | 'geografi'>('kpi');
  
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  useEffect(() => {
    if (tabParam === 'demografi' || tabParam === 'kpi' || tabParam === 'kesalahan' || tabParam === 'kementerian' || tabParam === 'geografi') {
      setActiveTab(tabParam as 'kpi' | 'kesalahan' | 'kementerian' | 'demografi' | 'geografi');
    }
  }, [tabParam]);

  useEffect(() => {
    const loadCases = () => {
      const stored = localStorage.getItem('spt_cases');
      if (stored) {
        setCases(JSON.parse(stored));
      } else {
        localStorage.setItem('spt_cases', JSON.stringify(INITIAL_CASES));
        setCases(INITIAL_CASES);
      }
    };

    loadCases();

    window.addEventListener('storage_updated', loadCases);
    return () => {
      window.removeEventListener('storage_updated', loadCases);
    };
  }, []);

  // --- COMPUTE DEMOGRAPHIC & CLASSIFICATION DATA ---
  const statsData = useMemo(() => {
    if (cases.length === 0) return null;

    // 1. Offense Breakdown
    const offenseCounts = cases.reduce((acc, c) => {
      const offenses = c.details.JENIS_KESALAHAN || [];
      offenses.forEach(o => {
        acc[o] = (acc[o] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const offenseBreakdown = Object.entries(offenseCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // 2. Ministry Breakdown
    const ministryCounts = cases.reduce((acc, c) => {
      const min = c.officer.KEMENTERIAN || 'LAIN-LAIN';
      const shortName = min.split(' - ')[0] || min; // extract JPM, KKM, etc.
      acc[shortName] = (acc[shortName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ministryBreakdown = Object.entries(ministryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // 3. Race (Kaum) Breakdown
    const raceCounts = cases.reduce((acc, c) => {
      const race = c.officer.KAUM || 'LAIN-LAIN KAUM';
      acc[race] = (acc[race] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const raceBreakdown = Object.entries(raceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // 4. Gender (Jantina) Breakdown
    const genderCounts = cases.reduce((acc, c) => {
      const gen = c.officer.JANTINA === 'L' ? 'Lelaki' : 'Perempuan';
      acc[gen] = (acc[gen] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 5. State (Negeri) Breakdown
    const stateCounts = cases.reduce((acc, c) => {
      const state = c.officer.NEGERI || 'W.P. PUTRAJAYA';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const stateBreakdown = Object.entries(stateCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      offenseBreakdown,
      ministryBreakdown,
      raceBreakdown,
      genderBreakdown: Object.entries(genderCounts).map(([name, count]) => ({ name, count })),
      stateBreakdown
    };
  }, [cases]);

  // Colors for charts
  const colors = ['#1e3a8a', '#d97706', '#10b981', '#8b5cf6', '#f43f5e', '#06b6d4', '#64748b'];

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-gov-blue-700 tracking-tight">Analitis & Statistik Grafik</h2>
        <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">
          Portal Urus Setia Kes (Admin) &bull; Eksplorasi Visual Berpusat
        </p>
      </div>



    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-220px)] w-full min-w-0">
      {/* Left Data Studio Sidebar */}
      <aside className="w-full lg:w-64 bg-slate-50 border border-slate-200 rounded-3xl p-4 shrink-0 flex flex-col justify-between text-left h-fit lg:sticky lg:top-4">
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-2 px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Halaman Laporan</span>
            <span className="text-xs font-black text-gov-blue-700">Looker Studio SPT</span>
          </div>
          
          <nav className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
            {[
              { id: 'kpi', name: 'Ringkasan KPI & Persaraan', icon: Calendar },
              { id: 'kesalahan', name: 'Jenis Kesalahan Pegawai', icon: PieChart },
              { id: 'kementerian', name: 'Pecahan Kementerian', icon: Building2 },
              { id: 'demografi', name: 'Profil Kaum & Jantina', icon: UserCheck },
              { id: 'geografi', name: 'Taburan Negeri', icon: MapPin }
            ].map((page, idx) => {
              const isActive = activeTab === page.id;
              const PageIcon = page.icon;
              return (
                <button
                  key={page.id}
                  onClick={() => setActiveTab(page.id as 'kpi' | 'kesalahan' | 'kementerian' | 'demografi' | 'geografi')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gov-blue-700 text-white shadow-sm'
                      : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="text-[10px] opacity-60 font-mono">{(idx + 1).toString().padStart(2, '0')}</span>
                  <PageIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{page.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-200 mt-4 px-1 text-[9px] text-slate-400 font-semibold leading-relaxed">
          Sistem Pengurusan Tatatertib &copy; JPA
        </div>
      </aside>

      {/* Right Canvas Content */}
      <main className="flex-1 min-w-0 bg-white border-2 border-transparent moving-gradient-border rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[500px]">
        {/* Canvas Header/Page indicator */}
        <div className="border-b border-slate-100 pb-3 flex justify-between items-center mb-6">
          <div className="space-y-1 text-left">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              {activeTab === 'kpi' && 'Halaman 1 dari 5'}
              {activeTab === 'kesalahan' && 'Halaman 2 dari 5'}
              {activeTab === 'kementerian' && 'Halaman 3 dari 5'}
              {activeTab === 'demografi' && 'Halaman 4 dari 5'}
              {activeTab === 'geografi' && 'Halaman 5 dari 5'}
            </span>
            <h3 className="text-base font-extrabold text-gov-blue-955 flex items-center gap-2">
              {activeTab === 'kpi' && <Calendar className="h-4.5 w-4.5 text-gov-blue-700" />}
              {activeTab === 'kesalahan' && <PieChart className="h-4.5 w-4.5 text-gov-blue-700" />}
              {activeTab === 'kementerian' && <Building2 className="h-4.5 w-4.5 text-gov-blue-700" />}
              {activeTab === 'demografi' && <UserCheck className="h-4.5 w-4.5 text-gov-blue-700" />}
              {activeTab === 'geografi' && <MapPin className="h-4.5 w-4.5 text-gov-blue-700" />}
              <span>
                {activeTab === 'kpi' && 'KPI & Persaraan'}
                {activeTab === 'kesalahan' && 'Jenis Kesalahan Pegawai'}
                {activeTab === 'kementerian' && 'Pecahan Mengikut Kementerian'}
                {activeTab === 'demografi' && 'Profil Kaum & Jantina'}
                {activeTab === 'geografi' && 'Taburan Fail Kes Mengikut Negeri'}
              </span>
            </h3>
          </div>
        </div>

        {/* Canvas Body */}
        <div className="flex-1">
          {activeTab === 'kpi' && (
            <div className="animate-fade-in">
              <PersaraanCharts cases={cases} />
            </div>
          )}

          {activeTab === 'kesalahan' && (
            <div className="animate-fade-in max-w-2xl mx-auto py-4 text-left">
              {statsData && statsData.offenseBreakdown.length > 0 ? (
                <div className="flex flex-col md:flex-row items-center justify-center gap-10">
                  <div className="w-[180px] h-[180px] shrink-0 relative flex items-center justify-center bg-slate-50 rounded-full border border-slate-100 p-2">
                    <svg className="w-full h-full" viewBox="0 0 120 120">
                      <g transform="translate(60, 60)">
                        <text x="0" y="4" fill="#1e3a8a" fontSize="11" fontWeight="950" textAnchor="middle">
                          {cases.length} Kes
                        </text>
                      </g>
                      {(() => {
                        const radius = 40;
                        const circumference = 2 * Math.PI * radius;
                        let accumulated = 0;
                        const total = statsData.offenseBreakdown.reduce((sum, d) => sum + d.count, 0);

                        return statsData.offenseBreakdown.map((item, idx) => {
                          const percent = (item.count / total) * 100;
                          const strokeOffset = circumference - (percent / 100) * circumference;
                          const angle = (accumulated / 100) * 360;
                          accumulated += percent;
                          return (
                            <circle
                              key={idx}
                              cx="60"
                              cy="60"
                              r={radius}
                              fill="transparent"
                              stroke={colors[idx % colors.length]}
                              strokeWidth="10"
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeOffset}
                              transform={`rotate(${angle - 90} 60 60)`}
                            />
                          );
                        });
                      })()}
                    </svg>
                  </div>

                  <div className="flex-1 flex flex-col gap-2.5 text-xs">
                    {statsData.offenseBreakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: colors[idx % colors.length] }} />
                        <div className="min-w-0 flex-1">
                          <span className="font-extrabold text-slate-800 block truncate leading-tight">{item.name}</span>
                          <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">{item.count} kes ({Math.round((item.count / cases.length) * 100)}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-semibold text-center my-12 block">Tiada data kes</span>
              )}
            </div>
          )}

          {activeTab === 'kementerian' && (
            <div className="animate-fade-in max-w-2xl mx-auto py-4 text-left">
              {statsData && statsData.ministryBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {statsData.ministryBreakdown.map((item, idx) => {
                    const maxCount = statsData.ministryBreakdown[0]?.count || 1;
                    const ratioPercent = (item.count / maxCount) * 100;
                    return (
                      <div key={idx} className="space-y-1.5 text-xs font-bold bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-center text-slate-800">
                          <span className="truncate pr-2 font-extrabold">{item.name}</span>
                          <span className="text-gov-blue-800">{item.count} Kes</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gov-blue-700 transition-all duration-500" 
                            style={{ width: `${ratioPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-semibold text-center my-12 block">Tiada data kementerian</span>
              )}
            </div>
          )}

          {activeTab === 'demografi' && (
            <div className="animate-fade-in max-w-2xl mx-auto py-4 text-left space-y-8">
              {statsData ? (
                <>
                  {/* Jantina Section */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pecahan Jantina</span>
                    <div className="grid grid-cols-2 gap-4">
                      {statsData.genderBreakdown.map((item, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">{item.name}</span>
                          <span className="text-2xl font-black text-gov-blue-900">{item.count} <span className="text-[11px] text-slate-400 font-medium">Pegawai</span></span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kaum Section */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Taburan Kaum</span>
                    <div className="space-y-2.5">
                      {statsData.raceBreakdown.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs font-bold text-slate-700 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                          <span className="flex items-center gap-2 font-semibold text-slate-600">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
                            {item.name}
                          </span>
                          <span className="text-gov-blue-900 font-black">{item.count} Kes</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <span className="text-xs text-slate-400 font-semibold text-center my-12 block">Tiada data demografi</span>
              )}
            </div>
          )}

          {activeTab === 'geografi' && (
            <div className="animate-fade-in text-left">
              {statsData && statsData.stateBreakdown.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {statsData.stateBreakdown.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 hover:bg-slate-100/50 transition-colors p-4 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block truncate w-full">{item.name}</span>
                      <span className="text-2xl font-black text-gov-blue-900 tracking-tight mt-1">{item.count} <span className="text-xs text-slate-400 font-medium">Kes</span></span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-semibold text-center my-4 block">Tiada data negeri</span>
              )}
            </div>
          )}
        </div>
      </main>
    </div>

    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-bold">Memuatkan Analitis...</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
