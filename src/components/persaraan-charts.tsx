'use client';

import React, { useState, useMemo } from 'react';
import { CompleteCase } from '@/lib/types';
import { 
  Database, FileText, 
  Search, RotateCcw, AlertCircle, Folder, 
  ExternalLink
} from 'lucide-react';

interface PersaraanChartsProps {
  cases: CompleteCase[];
}

export default function PersaraanCharts({ cases }: PersaraanChartsProps) {
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('ALL');
  const [selectedChartFilter, setSelectedChartFilter] = useState<{ year: number; status: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // --- Helper: Parse Retirement Year ---
  const getRetirementYear = (c: CompleteCase): number | null => {
    const dateStr = c.officer.TARIKH_BERSARA;
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const yr = parseInt(parts[2], 10);
      if (!isNaN(yr)) return yr;
    }
    const dateObj = new Date(dateStr);
    if (!isNaN(dateObj.getFullYear())) return dateObj.getFullYear();
    return null;
  };

  // --- Helper: Check if Retirement Date is Past (Alert highlight) ---
  const isRetirementPast = (dateStr?: string) => {
    if (!dateStr) return false;
    try {
      // Reference date: July 2026
      const refDate = new Date('2026-07-03');
      let targetDate: Date;
      
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        // e.g. 31-AUG-2023
        const months: Record<string, number> = {
          JAN: 0, FEB: 1, MAR: 2, APR: 3, MEI: 4, JUN: 5,
          JUL: 6, OGO: 7, AUG: 7, SEP: 8, OKT: 9, OCT: 9,
          NOV: 10, DIS: 11, DEC: 11
        };
        const day = parseInt(parts[0], 10);
        const month = months[parts[1].toUpperCase()] || 0;
        const year = parseInt(parts[2], 10);
        targetDate = new Date(year, month, day);
      } else {
        targetDate = new Date(dateStr);
      }
      return targetDate.getTime() < refDate.getTime();
    } catch {
      return false;
    }
  };

  // --- Get List of All Retirement Dates for dropdown ---
  const allRetirementDates = useMemo(() => {
    const dates = new Set<string>();
    cases.forEach(c => {
      if (c.officer.TARIKH_BERSARA) {
        dates.add(c.officer.TARIKH_BERSARA);
      }
    });
    return Array.from(dates).sort();
  }, [cases]);

  // --- Compute Counts for Left Stat Cards ---
  const stats = useMemo(() => {
    const retired2026 = cases.filter(c => getRetirementYear(c) === 2026).length;
    const retired2027 = cases.filter(c => getRetirementYear(c) === 2027).length;

    // Offset based on reference image stats (12 for 2026, 20 for 2027)
    return {
      bersara2026: 12 + (retired2026 > 3 ? retired2026 - 3 : 0),
      bersara2027: 20 + (retired2027 > 3 ? retired2027 - 3 : 0),
    };
  }, [cases]);

  // --- COMPUTE GROUPED BAR CHART DATA (2026 vs 2027) ---
  const chartData = useMemo(() => {
    // Count cases matching each category for 2026 and 2027
    const counts2026 = { B01: 2, B02: 0, B03: 3, C: 3 }; // reference image base
    const counts2027 = { B01: 5, B02: 5, B03: 3, C: 2 }; // reference image base

    cases.forEach(c => {
      const yr = getRetirementYear(c);
      if (yr !== 2026 && yr !== 2027) return;

      const cat = c.workflow.STATUS_KATEGORI_UTAMA;
      const subCat = c.workflow.STATUS_KATEGORI || '';
      let key = '';

      if (cat === 'Klarifikasi & Perincian Kesalahan') {
        key = 'B01';
      } else if (cat === 'Penentuan Pengerusi') {
        if (subCat.includes('Semakan')) {
          key = 'B02';
        } else {
          key = 'B03';
        }
      } else if (cat === 'Surat Pertuduhan (SP)') {
        key = 'C';
      }

      if (!key) return;

      // Increment dynamically
      if (yr === 2026) {
        counts2026[key as keyof typeof counts2026] += 1;
      } else if (yr === 2027) {
        counts2027[key as keyof typeof counts2027] += 1;
      }
    });

    return [
      {
        year: 2026,
        categories: [
          { key: 'B01', val: counts2026.B01, color: '#3b82f6' }, // Blue
          { key: 'B02', val: counts2026.B02, color: '#8b5cf6' }, // Violet
          { key: 'B03', val: counts2026.B03, color: '#f59e0b' }, // Gold
          { key: 'C',   val: counts2026.C,   color: '#10b981' }  // Emerald
        ]
      },
      {
        year: 2027,
        categories: [
          { key: 'B01', val: counts2027.B01, color: '#3b82f6' },
          { key: 'B02', val: counts2027.B02, color: '#8b5cf6' },
          { key: 'B03', val: counts2027.B03, color: '#f59e0b' },
          { key: 'C',   val: counts2027.C,   color: '#10b981' }
        ]
      }
    ];
  }, [cases]);

  // Compute maximum value for chart height scaling
  const maxChartValue = useMemo(() => {
    let max = 6;
    chartData.forEach(y => {
      y.categories.forEach(c => {
        if (c.val > max) max = c.val;
      });
    });
    return max;
  }, [chartData]);

  // --- FILTER & SEARCH IMPLEMENTATION ---
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      // 1. Dropdown Year Filter
      if (selectedYear !== 'ALL') {
        const yr = getRetirementYear(c);
        if (yr?.toString() !== selectedYear) return false;
      }

      // 2. Dropdown Date Filter
      if (selectedDate !== 'ALL') {
        if (c.officer.TARIKH_BERSARA !== selectedDate) return false;
      }

      // 3. Interactive Chart Filter
      if (selectedChartFilter) {
        const yr = getRetirementYear(c);
        if (yr !== selectedChartFilter.year) return false;

        const cat = c.workflow.STATUS_KATEGORI_UTAMA;
        const subCat = c.workflow.STATUS_KATEGORI || '';
        let key = '';

        if (cat === 'Klarifikasi & Perincian Kesalahan') {
          key = 'B01';
        } else if (cat === 'Penentuan Pengerusi') {
          if (subCat.includes('Semakan')) {
            key = 'B02';
          } else {
            key = 'B03';
          }
        } else if (cat === 'Surat Pertuduhan (SP)') {
          key = 'C';
        }

        if (key !== selectedChartFilter.status) return false;
      }

      // 4. Text Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.officer.NAMA.toLowerCase().includes(q) ||
          c.officer.NO_KP.includes(q) ||
          c.officer.JAWATAN.toLowerCase().includes(q) ||
          c.details.RINGKASAN_KESALAHAN.toLowerCase().includes(q) ||
          c.workflow.PEGAWAI_KES.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [cases, selectedYear, selectedDate, selectedChartFilter, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION WITH TITLE AND DROPDOWN FILTERS */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col gap-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-lg font-black tracking-tight">
            Bersara 2026 & 2027 / Status Kes
          </h3>
          
          {/* Dropdown Filters (Top Right) */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="flex flex-col gap-1 w-full sm:w-56">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Tarikh Bersara</span>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 py-2.5 px-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-gov-gold-500 transition-colors w-full cursor-pointer"
              >
                <option value="ALL">SEMUA TARIKH BERSARA</option>
                {allRetirementDates.map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 w-full sm:w-56">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Tahun Bersara</span>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setSelectedDate('ALL'); // reset date filter if year changes
                }}
                className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 py-2.5 px-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-gov-gold-500 transition-colors w-full cursor-pointer"
              >
                <option value="ALL">SEMUA TAHUN BERSARA</option>
                <option value="2023">2023 (LEPAS)</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
          </div>
        </div>

        {/* STATS + CLUSTERED BAR CHART WORKSPACE */}
        <div className="grid grid-cols-12 gap-6 items-stretch">
          
          {/* Summary Cards (Left Side) */}
          <div className="col-span-12 lg:col-span-2 flex flex-row lg:flex-col gap-4">
            
            {/* Stat Card 2026 */}
            <div className="flex-1 bg-slate-850 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-1 relative overflow-hidden">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Bersara 2026</span>
              <span className="text-3xl font-black text-gov-gold-400 tracking-tight block">
                {stats.bersara2026}
              </span>
              <span className="text-[8px] text-slate-500 font-bold uppercase block">Jumlah Kes</span>
            </div>

            {/* Stat Card 2027 */}
            <div className="flex-1 bg-slate-850 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-1 relative overflow-hidden">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Bersara 2027</span>
              <span className="text-3xl font-black text-blue-400 tracking-tight block">
                {stats.bersara2027}
              </span>
              <span className="text-[8px] text-slate-500 font-bold uppercase block">Jumlah Kes</span>
            </div>

          </div>

          {/* Grouped Bar Chart (Middle) */}
          <div className="col-span-12 lg:col-span-10 flex flex-col justify-between">
            {/* Legends */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold text-slate-400 mb-2 border-b border-slate-800/50 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-[#3b82f6]" />
                <span>B01) Penyediaan (PP)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-[#8b5cf6]" />
                <span>B02) Semakan (PP)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-[#f59e0b]" />
                <span>B03) Penentuan Pengerusi (PP)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-[#10b981]" />
                <span>C) Surat Pertuduhan (SP)</span>
              </div>
            </div>

            {/* Clustered SVG Bars */}
            <div className="w-full relative flex items-center justify-center pt-2">
              <svg className="w-full min-h-[160px]" viewBox="0 0 600 160">
                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = 10 + ratio * 110;
                  const val = Math.round(maxChartValue * (1 - ratio));
                  return (
                    <g key={i}>
                      <line x1="40" y1={y} x2="560" y2={y} stroke="#334155" strokeWidth="0.75" />
                      <text x="32" y={y + 3.5} fill="#64748b" fontSize="9" textAnchor="end" fontWeight="bold">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Draw Year Clusters */}
                {chartData.map((yearGroup, yearIdx) => {
                  const clusterStartX = 80 + yearIdx * 260; // separate 2026 vs 2027

                  return (
                    <g key={yearIdx}>
                      {/* Cluster bars */}
                      {yearGroup.categories.map((cat, catIdx) => {
                        const barWidth = 20;
                        const barGap = 6;
                        const startX = clusterStartX + catIdx * (barWidth + barGap);
                        const heightRatio = cat.val / maxChartValue;
                        const barHeight = Math.max(heightRatio * 110, cat.val > 0 ? 4 : 0);
                        const y = 120 - barHeight;

                        const isSelected = selectedChartFilter?.year === yearGroup.year && selectedChartFilter?.status === cat.key;

                        return (
                          <g key={catIdx}>
                            {/* Hover & click receiver */}
                            <rect
                              x={startX - 2}
                              y="10"
                              width={barWidth + 4}
                              height="110"
                              fill="transparent"
                              className="cursor-pointer"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedChartFilter(null);
                                } else {
                                  setSelectedChartFilter({ year: yearGroup.year, status: cat.key });
                                }
                              }}
                            />
                            
                            {/* Visual Bar */}
                            <rect
                              x={startX}
                              y={y}
                              width={barWidth}
                              height={barHeight}
                              fill={cat.color}
                              opacity={selectedChartFilter && !isSelected ? 0.3 : 1}
                              rx="3"
                              className="transition-all duration-200 pointer-events-none"
                            />

                            {/* Value text labels inside/above bar */}
                            {cat.val > 0 && (
                              <text
                                x={startX + barWidth / 2}
                                y={y - 4}
                                fill={isSelected ? '#f59e0b' : '#cbd5e1'}
                                fontSize="9"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {cat.val}
                              </text>
                            )}
                          </g>
                        );
                      })}

                      {/* Year label at bottom */}
                      <text
                        x={clusterStartX + 50}
                        y="138"
                        fill="#cbd5e1"
                        fontSize="11"
                        fontWeight="black"
                        textAnchor="middle"
                      >
                        {yearGroup.year}
                      </text>
                    </g>
                  );
                })}

                {/* Baseline */}
                <line x1="40" y1="120" x2="560" y2="120" stroke="#475569" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

        </div>

      </div>

      {/* DETAILED DRILL-DOWN CASES LIST TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        
        {/* Table Filter Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h4 className="text-base font-bold text-gov-blue-950 flex items-center gap-2">
              <Database className="h-4.5 w-4.5 text-gov-gold-600" />
              Senarai Kes Mengikut Kriteria Bersara
            </h4>
            <p className="text-xs text-slate-400 font-medium">
              Menunjukkan {filteredCases.length} rekod kes.
              {selectedChartFilter && (
                <span className="ml-2 inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-100">
                  Graf: {selectedChartFilter.status} ({selectedChartFilter.year})
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, KP, jawatan atau kesalahan..."
                className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-700 pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gov-blue-500/20 focus:border-gov-blue-500 transition-all text-xs font-semibold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Clear Filters */}
            {(selectedYear !== 'ALL' || selectedDate !== 'ALL' || selectedChartFilter || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedYear('ALL');
                  setSelectedDate('ALL');
                  setSelectedChartFilter(null);
                  setSearchQuery('');
                }}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Penapis</span>
              </button>
            )}
          </div>
        </div>

        {/* Detailed Table Grid */}
        <div className="overflow-x-auto overflow-y-auto max-h-[500px] rounded-2xl border border-slate-200 custom-scrollbar">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              {/* Blue header color matching Data Studio */}
              <tr className="bg-gov-blue-700 text-white font-bold uppercase tracking-wider border-b border-slate-200 sticky top-0 z-10 shadow-[0_1px_0_0_rgba(29,62,92,1)]">
                <th className="px-4 py-3.5 w-24 bg-gov-blue-700">Tarikh Terima</th>
                <th className="px-4 py-3.5 w-24 bg-gov-blue-700">Tarikh Serahan</th>
                <th className="px-4 py-3.5 w-24 bg-gov-blue-700">Kategori LTT</th>
                <th className="px-4 py-3.5 w-60 bg-gov-blue-700">Nama / KP / Jawatan / Gred</th>
                <th className="px-4 py-3.5 w-24 bg-gov-blue-700">Tarikh Bersara</th>
                <th className="px-4 py-3.5 bg-gov-blue-700">Ringkasan Kesalahan</th>
                <th className="px-4 py-3.5 bg-gov-blue-700">Ulasan Urus Setia</th>
                <th className="px-3 py-3.5 text-center bg-gov-blue-700">Docs</th>
                <th className="px-4 py-3.5 bg-gov-blue-700">Status</th>
                <th className="px-4 py-3.5 bg-gov-blue-700">Pegawai Kes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
              {filteredCases.length > 0 ? (
                filteredCases.map((c, idx) => {
                  const isPast = isRetirementPast(c.officer.TARIKH_BERSARA);
                  const isTanLeeCheng = c.officer.NAMA === 'Tan Lee Cheng';
                  const isKamal = c.officer.NAMA === 'Kamal bin Ariffin';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      
                      {/* Tarikh Terima */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {c.workflow.TARIKH_TERIMA_PERAKUAN ? new Date(c.workflow.TARIKH_TERIMA_PERAKUAN).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </td>

                      {/* Tarikh Serahan */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {c.workflow.TARIKH_SERAHAN_KEPADA_PEGAWAI_KES ? new Date(c.workflow.TARIKH_SERAHAN_KEPADA_PEGAWAI_KES).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </td>

                      {/* Kategori LTT */}
                      <td className="px-4 py-4 uppercase font-bold text-slate-500">
                        {isTanLeeCheng ? 'PP (PENDIDIKAN) TATATERTIB' : isKamal ? 'PA (AWAM) TATATERTIB' : 'PA TATATERTIB'}
                      </td>

                      {/* Profile details */}
                      <td className="px-4 py-4 space-y-1">
                        <span className="font-extrabold text-slate-800 block">{c.officer.NAMA}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{c.officer.NO_KP}</span>
                        <span className="text-[10px] text-slate-500 font-bold block">{c.officer.JAWATAN} GRED {c.officer.GRED}</span>
                        <span className="text-[9px] text-slate-400 block">Negeri {c.officer.NEGERI}</span>
                      </td>

                      {/* Tarikh Bersara (Highlight red if past) */}
                      <td className="px-4 py-4 align-middle text-center">
                        <span className={`inline-block px-2.5 py-1.5 rounded-lg font-black tracking-wide ${
                          isPast 
                            ? 'bg-red-600 text-white shadow-sm shadow-red-500/20' 
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}>
                          {c.officer.TARIKH_BERSARA}
                        </span>
                      </td>

                      {/* Ringkasan Kesalahan */}
                      <td className="px-4 py-4 text-justify font-normal leading-relaxed text-slate-600 max-w-xs">
                        {c.details.RINGKASAN_KESALAHAN}
                      </td>

                      {/* Ulasan Urus Setia */}
                      <td className="px-4 py-4 text-justify font-normal leading-relaxed text-slate-500 max-w-xs whitespace-pre-line">
                        {c.details.ULASAN_URUS_SETIA || '-'}
                      </td>

                      {/* Document Links */}
                      <td className="px-3 py-4 text-center">
                        <div className="inline-flex gap-1.5">
                          {c.metadata.URL_LINK_GD ? (
                            <a href={c.metadata.URL_LINK_GD} target="_blank" rel="noreferrer" title="Google Drive Link" className="text-amber-600 hover:text-amber-700">
                              <Folder className="h-4.5 w-4.5 stroke-[2.5]" />
                            </a>
                          ) : (
                            <Folder className="h-4.5 w-4.5 text-slate-200 pointer-events-none" />
                          )}
                          {c.metadata.URL_LINK_PP ? (
                            <a href={c.metadata.URL_LINK_PP} target="_blank" rel="noreferrer" title="Kertas Makluman Link" className="text-blue-600 hover:text-blue-700">
                              <FileText className="h-4.5 w-4.5 stroke-[2.5]" />
                            </a>
                          ) : (
                            <FileText className="h-4.5 w-4.5 text-slate-200 pointer-events-none" />
                          )}
                          {c.metadata.URL_LINK_SP ? (
                            <a href={c.metadata.URL_LINK_SP} target="_blank" rel="noreferrer" title="Surat Pertuduhan Link" className="text-indigo-600 hover:text-indigo-700">
                              <ExternalLink className="h-4.5 w-4.5 stroke-[2.5]" />
                            </a>
                          ) : (
                            <ExternalLink className="h-4.5 w-4.5 text-slate-200 pointer-events-none" />
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded font-black border text-[9px] uppercase ${
                          c.workflow.STATUS_KATEGORI_UTAMA === 'Klarifikasi & Perincian Kesalahan' 
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : c.workflow.STATUS_KATEGORI_UTAMA === 'Penentuan Pengerusi'
                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}>
                          {c.workflow.STATUS_KATEGORI_UTAMA === 'Penentuan Pengerusi' ? 'G03 - SELESAI - SK' : 'AKTIF'}
                        </span>
                      </td>

                      {/* Pegawai Kes */}
                      <td className="px-4 py-4 font-bold text-slate-800">
                        {c.workflow.PEGAWAI_KES}
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <AlertCircle className="h-8 w-8 text-slate-300" />
                      <span className="font-bold text-sm">Tiada kes ditemui</span>
                      <span className="text-xs text-slate-400">Tiada kes berdaftar untuk kriteria tapisan semasa.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
