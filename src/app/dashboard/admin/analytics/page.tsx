'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CompleteCase } from '@/lib/types';
import { INITIAL_CASES } from '@/lib/mock-data';
import PersaraanCharts from '@/components/persaraan-charts';
import { 
  PieChart, Building2, UserCheck, 
  MapPin, Layers, Calendar
} from 'lucide-react';

export default function AnalyticsPage() {
  const [cases, setCases] = useState<CompleteCase[]>([]);
  const [activeTab, setActiveTab] = useState<'kpi' | 'demografi'>('kpi');

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

      {/* Horizontal Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-6 mb-4">
        <button 
          onClick={() => setActiveTab('kpi')}
          className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'kpi' 
              ? 'border-gov-blue-700 text-gov-blue-700 font-black' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className="h-4.5 w-4.5" />
          <span>Persaraan & Status Kes</span>
        </button>
        <button 
          onClick={() => setActiveTab('demografi')}
          className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'demografi' 
              ? 'border-gov-blue-700 text-gov-blue-700 font-black' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Layers className="h-4.5 w-4.5" />
          <span>Demografi & Klasifikasi Kes</span>
        </button>
      </div>

      {/* Sub-Tabs View rendering */}
      {activeTab === 'kpi' ? (
        <div className="animate-fade-in">
          <PersaraanCharts cases={cases} />
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6 animate-fade-in">
          
          {/* 1. Kategori Kesalahan (Donut) */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between min-h-[300px]">
            <div className="space-y-1.5 border-b border-slate-100 pb-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Taburan Kesalahan</span>
              <h3 className="text-sm font-bold text-gov-blue-950 flex items-center gap-2">
                <PieChart className="h-4.5 w-4.5 text-gov-blue-700" />
                Jenis Kesalahan Pegawai
              </h3>
            </div>

            {statsData && statsData.offenseBreakdown.length > 0 ? (
              <div className="flex-1 flex items-center gap-4 mt-4">
                {/* Donut Chart visual */}
                <div className="w-[120px] h-[120px] shrink-0 relative flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 120 120">
                    <g transform="translate(60, 60)">
                      <text x="0" y="4" fill="#1e3a8a" fontSize="12" fontWeight="950" textAnchor="middle">
                        {cases.length} Kes
                      </text>
                    </g>
                    {(() => {
                      const radius = 40;
                      const circumference = 2 * Math.PI * radius;
                      let accumulated = 0;
                      const total = statsData.offenseBreakdown.reduce((sum, d) => sum + d.count, 0);

                      return statsData.offenseBreakdown.slice(0, 5).map((item, idx) => {
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
                            strokeWidth="9"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeOffset}
                            transform={`rotate(${angle - 90} 60 60)`}
                          />
                        );
                      });
                    })()}
                  </svg>
                </div>
                {/* Legends */}
                <div className="flex-1 flex flex-col gap-1.5 justify-center overflow-hidden text-[10px]">
                  {statsData.offenseBreakdown.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: colors[idx % colors.length] }} />
                      <div className="min-w-0 flex-1">
                        <span className="font-extrabold text-slate-700 block truncate leading-tight">{item.name}</span>
                        <span className="text-[9px] text-slate-400 block font-semibold leading-none">{item.count} kes</span>
                      </div>
                    </div>
                  ))}
                  {statsData.offenseBreakdown.length > 4 && (
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full shrink-0 bg-slate-400" />
                      <div className="min-w-0 flex-1">
                        <span className="font-extrabold text-slate-700 block truncate leading-tight">Lain-lain</span>
                        <span className="text-[9px] text-slate-400 block font-semibold leading-none">
                          {statsData.offenseBreakdown.slice(4).reduce((a, b) => a + b.count, 0)} kes
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-semibold text-center my-12 block">Tiada data kes</span>
            )}
          </div>

          {/* 2. Pengaruh Kementerian (Horizontal Bars) */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between min-h-[300px]">
            <div className="space-y-1.5 border-b border-slate-100 pb-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Kementerian Terlibat</span>
              <h3 className="text-sm font-bold text-gov-blue-950 flex items-center gap-2">
                <Building2 className="h-4.5 w-4.5 text-gov-blue-700" />
                Pecahan Mengikut Kementerian
              </h3>
            </div>

            {statsData && statsData.ministryBreakdown.length > 0 ? (
              <div className="flex-1 flex flex-col justify-center gap-3.5 mt-4">
                {statsData.ministryBreakdown.slice(0, 4).map((item, idx) => {
                  const maxCount = statsData.ministryBreakdown[0]?.count || 1;
                  const ratioPercent = (item.count / maxCount) * 100;
                  return (
                    <div key={idx} className="space-y-1 text-[10px] font-bold">
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="truncate pr-2">{item.name}</span>
                        <span className="text-gov-blue-800">{item.count} Kes</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gov-blue-700" 
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

          {/* 3. Pecahan Kaum & Jantina (Demographics) */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between min-h-[300px]">
            <div className="space-y-1.5 border-b border-slate-100 pb-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Analisis Demografi</span>
              <h3 className="text-sm font-bold text-gov-blue-950 flex items-center gap-2">
                <UserCheck className="h-4.5 w-4.5 text-gov-blue-700" />
                Profil Kaum & Jantina
              </h3>
            </div>

            {statsData ? (
              <div className="flex-1 flex flex-col justify-between gap-4 mt-4">
                {/* Jantina Section */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Pecahan Jantina</span>
                  <div className="flex gap-3 text-[10px] font-bold text-slate-700">
                    {statsData.genderBreakdown.map((item, idx) => (
                      <span key={idx} className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                        {item.name}: <span className="text-gov-blue-800 font-extrabold">{item.count}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Kaum Section */}
                <div className="flex-1 space-y-2 flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Taburan Kaum</span>
                  {statsData.raceBreakdown.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-500">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
                        {item.name}
                      </span>
                      <span>{item.count} Kes</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-semibold text-center my-12 block">Tiada data demografi</span>
            )}
          </div>

          {/* 4. Taburan Kes Mengikut Negeri */}
          <div className="col-span-12 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="space-y-1.5 border-b border-slate-100 pb-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sebaran Geografi</span>
              <h3 className="text-sm font-bold text-gov-blue-950 flex items-center gap-2">
                <MapPin className="h-4.5 w-4.5 text-gov-blue-700" />
                Taburan Fail Kes Mengikut Negeri Pentadbiran
              </h3>
            </div>

            {statsData && statsData.stateBreakdown.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                {statsData.stateBreakdown.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 hover:bg-slate-100/50 transition-colors p-3.5 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide block truncate w-full">{item.name}</span>
                    <span className="text-lg font-black text-gov-blue-900 tracking-tight mt-1">{item.count} Kes</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-semibold text-center my-4 block">Tiada data negeri</span>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
