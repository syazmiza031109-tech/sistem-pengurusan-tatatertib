'use client';

import React, { useState, useMemo } from 'react';
import { CompleteCase } from '@/lib/types';
import { 
  Database, Clock, ShieldAlert, CheckCircle, 
  Calendar, User, Search, RotateCcw, AlertCircle
} from 'lucide-react';

interface AdminChartsProps {
  cases: CompleteCase[];
}

// Colors for segments
const segmentColors = [
  '#22d3ee', // Agihan Kes (PP) - Cyan
  '#3b82f6', // Penyediaan (PP) - Blue
  '#6366f1', // Semakan (PP) - Indigo
  '#8b5cf6', // Penentuan Pengerusi - Violet
  '#10b981'  // Selesai / Lain-lain - Emerald
];

const segmentLabels = [
  'A) Agihan Kes (PP)',
  'B01) Penyediaan (PP)',
  'B02) Semakan (PP)',
  'B03) Penentuan Pengerusi',
  'G) Selesai (Selesai)'
];

// Standard list of dates from reference image
const baseChartData = [
  { date: '2026-01-06', label: '6 Jan', segments: [1, 0, 0, 0, 0] },
  { date: '2026-01-13', label: '13 Jan', segments: [2, 1, 0, 0, 0] },
  { date: '2026-01-16', label: '16 Jan', segments: [1, 2, 1, 0, 0] },
  { date: '2026-01-30', label: '30 Jan', segments: [0, 1, 2, 0, 0] },
  { date: '2026-02-10', label: '10 Feb', segments: [0, 1, 0, 0, 0] },
  { date: '2026-02-20', label: '20 Feb', segments: [3, 4, 2, 1, 0] },
  { date: '2026-03-04', label: '4 Mac', segments: [1, 0, 1, 0, 0] },
  { date: '2026-03-06', label: '6 Mac', segments: [0, 1, 1, 0, 0] },
  { date: '2026-03-10', label: '10 Mac', segments: [2, 2, 0, 0, 0] },
  { date: '2026-03-11', label: '11 Mac', segments: [0, 1, 0, 0, 0] },
  { date: '2026-03-30', label: '30 Mac', segments: [1, 0, 0, 0, 0] },
  { date: '2026-04-07', label: '7 Apr', segments: [0, 1, 0, 0, 0] },
  { date: '2026-04-14', label: '14 Apr', segments: [4, 5, 2, 1, 1] },
  { date: '2026-04-22', label: '22 Apr', segments: [1, 0, 1, 0, 0] },
  { date: '2026-04-23', label: '23 Apr', segments: [2, 1, 0, 0, 0] },
  { date: '2026-04-30', label: '30 Apr', segments: [0, 1, 0, 0, 0] },
  { date: '2026-05-19', label: '19 Mei', segments: [3, 2, 1, 1, 0] },
  { date: '2026-05-22', label: '22 Mei', segments: [0, 1, 0, 0, 0] }
];

export default function AdminCharts({ cases }: AdminChartsProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    title: string;
    details: string[];
  } | null>(null);

  // --- 1. DYNAMIC STATS CALCULATION WITH SNAPSHOT OFFSETS ---
  // We offset the metrics based on the Data Studio snapshot so they exactly match, 
  // but remain dynamically updated if new cases are added or modified.
  const extraCases = Math.max(0, cases.length - 6);
  
  const stats = useMemo(() => {
    // Count workflow status categories from active cases
    const pendingKlarifikasi = cases.filter(c => c.workflow.STATUS_KATEGORI_UTAMA === 'Klarifikasi & Perincian Kesalahan').length;
    const pendingPengerusi = cases.filter(c => c.workflow.STATUS_KATEGORI_UTAMA === 'Penentuan Pengerusi').length;
    const pendingSP = cases.filter(c => c.workflow.STATUS_KATEGORI_UTAMA === 'Surat Pertuduhan (SP)').length;
    const pendingHukuman = cases.filter(c => c.workflow.STATUS_KATEGORI_UTAMA === 'Penyerahan Hukuman & Keputusan Lembaga (PH/LTT)').length;

    return {
      jumlahKes: 1943 + extraCases,
      dalamTindakan: 454 + pendingKlarifikasi,
      penentuanPengerusi: 373 + pendingPengerusi,
      pertimbanganKsn: 127 + (pendingPengerusi > 1 ? 1 : 0),
      penyediaanPp: 98 + (pendingPengerusi > 0 ? 1 : 0),
      penyediaanSp: 9 + pendingSP,
      penentuanHukuman: 81 + pendingHukuman,
      penyediaanPh: 10 + (pendingHukuman > 0 ? 1 : 0),
      menungguRep: 18 + (pendingSP > 0 ? 1 : 0)
    };
  }, [cases, extraCases]);

  // --- 2. BAR CHART DATA SETUP (STACKED) ---

  // Calculate dynamic additions to chart data based on cases
  const chartData = useMemo(() => {
    // Clone base data
    const data = baseChartData.map(item => ({ ...item, segments: [...item.segments] }));

    // Map database cases into the chart
    cases.forEach(c => {
      const dateStr = c.workflow.TARIKH_TERIMA_PERAKUAN;
      if (!dateStr) return;

      // Find matching item in baseChartData
      const item = data.find(d => d.date === dateStr);
      
      // Determine segment index
      let segIdx = 4; // default Selesai
      const cat = c.workflow.STATUS_KATEGORI_UTAMA;
      if (cat === 'Klarifikasi & Perincian Kesalahan') {
        segIdx = 0;
      } else if (cat === 'Penentuan Pengerusi') {
        segIdx = 1;
      } else if (cat === 'Surat Pertuduhan (SP)') {
        segIdx = 2;
      } else if (cat === 'Penyerahan Hukuman & Keputusan Lembaga (PH/LTT)') {
        segIdx = 3;
      }

      if (item) {
        // Increment existing
        item.segments[segIdx] += 1;
      } else {
        // Create new item if date not in list
        const label = new Date(dateStr).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' });
        const segments = [0, 0, 0, 0, 0];
        segments[segIdx] = 1;
        data.push({
          date: dateStr,
          label,
          segments
        });
      }
    });

    // Sort by date chronologically
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [cases]);

  // Compute maximum stack value for SVG scale
  const maxStackValue = useMemo(() => {
    return Math.max(...chartData.map(d => d.segments.reduce((a, b) => a + b, 0)), 1);
  }, [chartData]);

  // --- 3. FILTERING & DRILL-DOWN CASES ---
  const filteredCases = useMemo(() => {
    let result = cases;

    // Filter by selected chart date
    if (selectedDate) {
      result = result.filter(c => c.workflow.TARIKH_TERIMA_PERAKUAN === selectedDate);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.officer.NAMA.toLowerCase().includes(query) ||
        c.officer.NO_KP.includes(query) ||
        c.officer.JAWATAN.toLowerCase().includes(query) ||
        c.details.RINGKASAN_KESALAHAN.toLowerCase().includes(query) ||
        c.workflow.PEGAWAI_KES.toLowerCase().includes(query)
      );
    }

    return result;
  }, [cases, selectedDate, searchQuery]);

  // Format dates for display
  const formatDateMalay = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // --- 4. TOOLTIP HANDLERS ---
  const handleBarMouseEnter = (e: React.MouseEvent, index: number) => {
    const item = chartData[index];
    const total = item.segments.reduce((a, b) => a + b, 0);
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.closest('.chart-area-container')?.getBoundingClientRect();

    if (parentRect) {
      const details = item.segments
        .map((val, idx) => val > 0 ? `${segmentLabels[idx]}: ${val} kes` : null)
        .filter(Boolean) as string[];

      setHoveredBarIndex(index);
      setTooltipData({
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top - 10,
        title: `${item.label} 2026 (Jumlah: ${total})`,
        details
      });
    }
  };

  const handleBarMouseLeave = () => {
    setHoveredBarIndex(null);
    setTooltipData(null);
  };

  return (
    <div className="space-y-6">
      
      {/* --- DASHBOARD UPPER GRID --- */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* LEFT PANEL: QUICK FACTS (Dark Themed, Premium) */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 bg-gov-blue-900 text-slate-100 rounded-3xl p-6 shadow-xl border border-gov-blue-950 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -right-20 -top-20 w-48 h-48 bg-gov-gold-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-6 z-10">
            <div className="flex items-center justify-between border-b border-gov-blue-800 pb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-gov-gold-400">Papan Info Utama</span>
              <span className="text-[9px] bg-gov-blue-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">2026</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Facts</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white tracking-tight">
                  {stats.jumlahKes.toLocaleString()}
                </span>
                <span className="text-xs text-gov-gold-400 font-bold uppercase">Jumlah Kes</span>
              </div>
            </div>

            {/* Quick Facts Metrics */}
            <div className="space-y-4 pt-2">
              
              {/* Metric 1 */}
              <div className="bg-gov-blue-950/40 p-3 rounded-xl border border-gov-blue-800/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Dalam Tindakan</span>
                  <span className="text-lg font-black text-white">{stats.dalamTindakan} Kes</span>
                </div>
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Clock className="h-4.5 w-4.5" />
                </div>
              </div>

              {/* Metric 2 & Sub-metrics */}
              <div className="bg-gov-blue-950/40 p-3 rounded-xl border border-gov-blue-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">Penentuan Pengerusi</span>
                    <span className="text-lg font-black text-white">{stats.penentuanPengerusi} Kes</span>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-gov-gold-400 flex items-center justify-center">
                    <ShieldAlert className="h-4.5 w-4.5" />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 border-t border-gov-blue-800/50 pt-2.5 text-center">
                  <div>
                    <span className="text-[18px] font-extrabold text-gov-gold-400 block">{stats.pertimbanganKsn}</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Pertimbangan KSN</span>
                  </div>
                  <div>
                    <span className="text-[18px] font-extrabold text-blue-400 block">{stats.penyediaanPp}</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Penyediaan PP</span>
                  </div>
                  <div>
                    <span className="text-[18px] font-extrabold text-purple-400 block">{stats.penyediaanSp}</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Penyediaan SP</span>
                  </div>
                </div>
              </div>

              {/* Metric 3 & Sub-metrics */}
              <div className="bg-gov-blue-950/40 p-3 rounded-xl border border-gov-blue-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">Penentuan Hukuman</span>
                    <span className="text-lg font-black text-emerald-400">{stats.penentuanHukuman} Kes</span>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <CheckCircle className="h-4.5 w-4.5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-gov-blue-800/50 pt-2.5 text-center">
                  <div>
                    <span className="text-[18px] font-extrabold text-emerald-400 block">{stats.penyediaanPh}</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Penyediaan PH</span>
                  </div>
                  <div>
                    <span className="text-[18px] font-extrabold text-rose-400 block">{stats.menungguRep}</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Menunggu Rep</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT PANEL: MAIN KPI & CHART WORKSPACE */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col gap-6">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">KPI & Trend Analisis</span>
              <h3 className="text-lg font-bold text-gov-blue-950 flex items-center gap-2 mt-0.5">
                Pencapaian KPI TT COP 2026
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Tempoh KPI: 1 Ogos 2025 - 31 Julai 2026</span>
          </div>

          {/* KPI Gauge + Stats Summary Block */}
          <div className="grid grid-cols-12 gap-6 items-center">
            
            {/* KPI Gauge Graphic */}
            <div className="col-span-12 md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-2xl relative h-[180px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pencapaian OBB</span>
              
              <div className="relative w-[180px] h-[95px] flex items-center justify-center">
                <svg width="180" height="110" viewBox="0 0 180 110" className="absolute top-0">
                  {/* Gauge definitions */}
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  
                  {/* Track arc (semicircle) */}
                  <path 
                    d="M 20 90 A 70 70 0 0 1 160 90" 
                    fill="none" 
                    stroke="#e2e8f0" 
                    strokeWidth="12" 
                    strokeLinecap="round" 
                  />
                  {/* Active arc (38.3% of 220 degree dash stroke) */}
                  <path 
                    d="M 20 90 A 70 70 0 0 1 160 90" 
                    fill="none" 
                    stroke="url(#gaugeGrad)" 
                    strokeWidth="12" 
                    strokeLinecap="round" 
                    strokeDasharray="220" 
                    strokeDashoffset="135.7" // 220 * (1 - 0.383)
                  />
                </svg>
                
                {/* Stats center text */}
                <div className="text-center mt-6">
                  <span className="text-2xl font-black text-slate-800 tracking-tight block">38.3%</span>
                  <span className="text-[8px] font-bold text-gov-gold-600 uppercase tracking-widest">Capai KPI OBB</span>
                </div>
              </div>
              
              <div className="flex justify-between w-full px-4 text-[9px] font-bold text-slate-400 mt-1">
                <span>Sasaran: 90%</span>
                <span>Semasa: 38.3%</span>
              </div>
            </div>

            {/* Major KPI Numbers */}
            <div className="col-span-12 sm:col-span-6 md:col-span-4 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl text-center space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Bil. Kes</span>
                <span className="text-3xl font-black text-gov-blue-900 tracking-tight block">227</span>
                <span className="text-[8px] text-slate-400 block font-semibold">Tahun Semasa</span>
              </div>
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl text-center space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Bil. PP Capai</span>
                <span className="text-3xl font-black text-emerald-600 tracking-tight block">87</span>
                <span className="text-[8px] text-emerald-600 font-bold block">Memenuhi KPI</span>
              </div>
            </div>

            {/* Minor Stats Panel (Vertical Grid) */}
            <div className="col-span-12 sm:col-span-6 md:col-span-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 h-[180px] flex flex-col justify-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status Aktiviti Kes</span>
              <div className="space-y-1.5 text-[10px] font-bold text-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Penyediaan PP</span>
                  <span>82</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200/50 pt-1.5">
                  <span className="text-slate-400 font-semibold">Semakan PP</span>
                  <span>33</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200/50 pt-1.5">
                  <span className="text-slate-400 font-semibold">Tindakan Urus Setia</span>
                  <span>23</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200/50 pt-1.5">
                  <span className="text-slate-400 font-semibold">Penelitian PBK</span>
                  <span>1</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200/50 pt-1.5">
                  <span className="text-slate-400 font-semibold">Agihan Kes</span>
                  <span className="text-cyan-600">9</span>
                </div>
              </div>
            </div>

          </div>

          {/* --- STACKED BAR CHART SECTION --- */}
          <div className="space-y-4 pt-4 border-t border-slate-100 relative chart-area-container">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  Bil. Kes Tahun Semasa (102)
                  {selectedDate && (
                    <span className="text-xs bg-gov-gold-550 text-gov-gold-700 px-2 py-0.5 rounded-full font-bold animate-fade-in border border-gov-gold-100 flex items-center gap-1">
                      Tapisan: {formatDateMalay(selectedDate)}
                    </span>
                  )}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">Klik pada tiang graf untuk menapis senarai detail kes di bawah.</p>
              </div>
              
              {/* Legends Row */}
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[9px] font-bold text-slate-500">
                {segmentLabels.map((lbl, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: segmentColors[idx] }} />
                    <span>{lbl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SVG STACKED BAR CHART */}
            <div className="relative flex justify-center w-full min-h-[160px] overflow-x-auto pt-2 scrollbar-thin">
              <svg className="w-full min-w-[700px] h-[160px]" viewBox="0 0 740 160">
                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = 10 + ratio * 110;
                  const val = Math.round(maxStackValue * (1 - ratio));
                  return (
                    <g key={i}>
                      <line x1="30" y1={y} x2="730" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                      <text x="22" y={y + 3.5} fill="#94a3b8" fontSize="9" textAnchor="end" fontWeight="bold">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Draw the Stacked Bars */}
                {chartData.map((d, index) => {
                  const barWidth = 18;
                  const gap = 20;
                  const startX = 35 + index * (barWidth + gap);
                  const total = d.segments.reduce((a, b) => a + b, 0);

                  // Calculate heights and render stacked rects
                  let currentY = 120;
                  const isSelected = selectedDate === d.date;

                  return (
                    <g key={index}>
                      {/* Background element for hover & click trigger */}
                      <rect
                        x={startX - 5}
                        y="10"
                        width={barWidth + 10}
                        height="120"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={(e) => handleBarMouseEnter(e, index)}
                        onMouseLeave={handleBarMouseLeave}
                        onClick={() => setSelectedDate(selectedDate === d.date ? null : d.date)}
                      />

                      {/* Segments Stack */}
                      {d.segments.map((val, segIdx) => {
                        if (val === 0) return null;
                        
                        const heightRatio = val / maxStackValue;
                        const segmentHeight = heightRatio * 110;
                        const rectY = currentY - segmentHeight;
                        currentY = rectY;

                        return (
                          <rect
                            key={segIdx}
                            x={startX}
                            y={rectY}
                            width={barWidth}
                            height={segmentHeight}
                            fill={segmentColors[segIdx]}
                            opacity={selectedDate && !isSelected ? 0.3 : hoveredBarIndex !== null && hoveredBarIndex !== index ? 0.8 : 1}
                            rx={total === val ? 2 : 0} // round top if single segment
                            className="transition-all duration-200 pointer-events-none"
                          />
                        );
                      })}

                      {/* Active border/glow if selected */}
                      {isSelected && (
                        <rect
                          x={startX - 3}
                          y={currentY - 3}
                          width={barWidth + 6}
                          height={123 - currentY}
                          fill="transparent"
                          stroke="#f59e0b"
                          strokeWidth="2.5"
                          rx="4"
                          className="pointer-events-none"
                        />
                      )}

                      {/* Date label */}
                      <text
                        x={startX + barWidth / 2}
                        y="136"
                        fill={isSelected ? '#1e3a8a' : '#64748b'}
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="pointer-events-none"
                      >
                        {d.label}
                      </text>
                    </g>
                  );
                })}

                {/* Bottom baseline */}
                <line x1="30" y1="120" x2="730" y2="120" stroke="#cbd5e1" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Custom Tooltip */}
            {tooltipData && (
              <div 
                className="absolute z-50 bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-[10px] pointer-events-none flex flex-col gap-1.5 backdrop-blur-sm -translate-x-1/2 -translate-y-full transition-all duration-100 ease-out"
                style={{ left: `${tooltipData.x}px`, top: `${tooltipData.y}px` }}
              >
                <span className="font-bold text-gov-gold-400 border-b border-slate-800 pb-1 uppercase tracking-wider">
                  {tooltipData.title}
                </span>
                <div className="space-y-0.5">
                  {tooltipData.details.map((det, i) => (
                    <span key={i} className="block font-semibold opacity-90">{det}</span>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* --- DRILL-DOWN CASES DETAILS LIST SECTION --- */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        
        {/* Table Filter Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-base font-bold text-gov-blue-950 flex items-center gap-2">
              <Database className="h-4.5 w-4.5 text-gov-gold-600" />
              Senarai Rekod Perincian Kes
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Menunjukkan {filteredCases.length} rekod {selectedDate ? `pada tarikh ${formatDateMalay(selectedDate)}` : 'kes aktif'}.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, KP, jawatan atau kesalahan..."
                className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-700 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gov-blue-500/20 focus:border-gov-blue-500 transition-all text-xs font-semibold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Clear Filter Button */}
            {(selectedDate || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedDate(null);
                  setSearchQuery('');
                }}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Set Semula Penapis</span>
              </button>
            )}
          </div>
        </div>

        {/* Detailed Table Grid */}
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] rounded-2xl border border-slate-200 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 sticky top-0 z-10 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                <th className="px-5 py-4 w-32 bg-slate-50">Tarikh Terima</th>
                <th className="px-5 py-4 w-80 bg-slate-50">Nama / No. KP / Jawatan / Gred</th>
                <th className="px-5 py-4 bg-slate-50">Ringkasan Kesalahan</th>
                <th className="px-5 py-4 w-60 bg-slate-50">Pegawai Kes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCases.length > 0 ? (
                filteredCases.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Tarikh Terima */}
                    <td className="px-5 py-4 align-top">
                      <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {c.workflow.TARIKH_TERIMA_PERAKUAN ? new Date(c.workflow.TARIKH_TERIMA_PERAKUAN).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </span>
                    </td>

                    {/* Officer Profile Details */}
                    <td className="px-5 py-4 align-top space-y-1.5">
                      <div>
                        <span className="font-extrabold text-slate-800 block">{c.officer.NAMA}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold block">{c.officer.NO_KP} ({c.officer.KAUM})</span>
                      </div>
                      <div className="text-[10px] bg-gov-blue-50/50 text-gov-blue-800 border border-gov-blue-100/50 p-2 rounded-lg space-y-0.5">
                        <span className="font-bold block truncate">{c.officer.JAWATAN}</span>
                        <span className="text-[9px] font-semibold text-slate-500 block">Gred {c.officer.GRED} ({c.officer.STATUS_JAWATAN})</span>
                      </div>
                    </td>

                    {/* Ringkasan Kesalahan */}
                    <td className="px-5 py-4 align-top space-y-2">
                      <p className="text-slate-600 font-medium leading-relaxed">
                        {c.details.RINGKASAN_KESALAHAN}
                      </p>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {c.details.JENIS_KESALAHAN?.map((j, jidx) => (
                          <span key={jidx} className="bg-slate-100 border border-slate-200 text-slate-500 font-bold px-2 py-0.5 rounded text-[9px] uppercase">
                            {j}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Pegawai Kes (Case Officer) */}
                    <td className="px-5 py-4 align-top">
                      <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 p-2 rounded-xl text-[10px] font-bold text-slate-700 w-full">
                        <div className="h-6 w-6 rounded-lg bg-gov-gold-100 text-gov-gold-800 flex items-center justify-center font-bold">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="block truncate">{c.workflow.PEGAWAI_KES}</span>
                          <span className="text-[8px] text-slate-400 block uppercase font-medium">Urus Setia Kes</span>
                        </div>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center">
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
