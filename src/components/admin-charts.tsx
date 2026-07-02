'use client';

import React, { useState } from 'react';
import { CompleteCase } from '@/lib/types';
import { BarChart3, LineChart, PieChart, Info } from 'lucide-react';

interface AdminChartsProps {
  cases: CompleteCase[];
}

interface TooltipState {
  x: number;
  y: number;
  title: string;
  value: string;
}

export default function AdminCharts({ cases }: AdminChartsProps) {
  const [activeTooltip, setActiveTooltip] = useState<TooltipState | null>(null);
  const [hoveredChart, setHoveredChart] = useState<string | null>(null);
  const [activeDonutIndex, setActiveDonutIndex] = useState<number | null>(null);
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);

  // 1. Process Bar Chart Data: Cases by Year
  const yearCounts = cases.reduce((acc, c) => {
    const yr = c.workflow.TAHUN_TERIMA || 2026;
    acc[yr] = (acc[yr] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // Ensure we show at least a range of years, e.g., 2023 to 2026
  const allYears = Array.from({ length: 4 }, (_, i) => 2023 + i);
  const barData = allYears.map(year => ({
    label: year.toString(),
    value: yearCounts[year] || 0,
  }));

  const maxBarValue = Math.max(...barData.map(d => d.value), 1);

  // 2. Process Line Chart Data: Cases by Month (Current Year 2026)
  const monthNames = [
    'Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun',
    'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'
  ];
  
  const monthlyCounts = cases.reduce((acc, c) => {
    // Check if the case is from 2026 or has date of intake
    const dateStr = c.workflow.TARIKH_TERIMA_PERAKUAN;
    if (dateStr) {
      const monthIdx = new Date(dateStr).getMonth(); // 0-11
      if (monthIdx >= 0 && monthIdx < 12) {
        acc[monthIdx] = (acc[monthIdx] || 0) + 1;
      }
    } else {
      // Fallback: use first month
      acc[0] = (acc[0] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  const lineData = monthNames.map((name, idx) => ({
    label: name,
    value: monthlyCounts[idx] || 0,
  }));

  const maxLineValue = Math.max(...lineData.map(d => d.value), 1);

  // 3. Process Donut Chart Data: Top Offenses
  const offenseCounts = cases.reduce((acc, c) => {
    const offenses = c.details.JENIS_KESALAHAN || [];
    offenses.forEach(o => {
      acc[o] = (acc[o] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const sortedOffenses = Object.entries(offenseCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Top 4 offenses + others
  const topOffensesCount = 4;
  let donutData = sortedOffenses.slice(0, topOffensesCount);
  const otherOffensesCount = sortedOffenses.slice(topOffensesCount).reduce((sum, item) => sum + item.count, 0);

  if (otherOffensesCount > 0) {
    donutData.push({ name: 'Lain-lain', count: otherOffensesCount });
  }

  // If no offenses data exists, put placeholders
  if (donutData.length === 0) {
    donutData = [
      { name: 'Tiada Data', count: 1 }
    ];
  }

  const totalOffenses = donutData.reduce((sum, d) => sum + d.count, 0);

  // Colors for Donut chart
  const donutColors = [
    '#1e3a8a', // gov-blue
    '#d97706', // gov-gold
    '#10b981', // emerald
    '#8b5cf6', // violet
    '#f43f5e', // rose
    '#64748b'  // slate
  ];

  // Helper for tooltips
  const handleMouseEnter = (e: React.MouseEvent, title: string, value: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.closest('.chart-container')?.getBoundingClientRect();
    if (parentRect) {
      setActiveTooltip({
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top - 8,
        title,
        value
      });
    }
  };

  const handleMouseLeave = () => {
    setActiveTooltip(null);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* 1. Bar Chart - Yearly Trend */}
      <div 
        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative chart-container flex flex-col justify-between h-[300px] transition-all duration-300 hover:shadow-md hover:border-slate-300"
        onMouseEnter={() => setHoveredChart('bar')}
        onMouseLeave={() => setHoveredChart(null)}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prestasi Tahunan</span>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <BarChart3 className="h-4 w-4 text-gov-blue-700" />
              Trend Penerimaan Kes Mengikut Tahun
            </h3>
          </div>
          <span title="Data dikira berdasarkan Tahun Terima Kes" className="cursor-help"><Info className="h-4 w-4 text-slate-300" /></span>
        </div>

        {/* SVG Drawing area */}
        <div className="flex-1 relative flex items-center justify-center">
          <svg className="w-full h-full min-h-[160px]" viewBox="0 0 320 160">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = 20 + ratio * 100;
              const val = Math.round(maxBarValue * (1 - ratio));
              return (
                <g key={i}>
                  <line 
                    x1="35" 
                    y1={y} 
                    x2="300" 
                    y2={y} 
                    stroke="#f1f5f9" 
                    strokeWidth="1" 
                  />
                  <text 
                    x="25" 
                    y={y + 3} 
                    fill="#94a3b8" 
                    fontSize="9" 
                    textAnchor="end" 
                    fontWeight="bold"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {barData.map((d, index) => {
              const barWidth = 36;
              const gap = 28;
              const startX = 50 + index * (barWidth + gap);
              const heightRatio = d.value / maxBarValue;
              const barHeight = Math.max(heightRatio * 100, 3); // minimum height to make it visible
              const y = 120 - barHeight;

              return (
                <g key={index}>
                  {/* Background invisible bar for easier hover */}
                  <rect
                    x={startX - 5}
                    y="10"
                    width={barWidth + 10}
                    height="120"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={(e) => {
                      setActiveBarIndex(index);
                      handleMouseEnter(e, `${d.label}`, `${d.value} Kes`);
                    }}
                    onMouseLeave={() => {
                      setActiveBarIndex(null);
                      handleMouseLeave();
                    }}
                  />
                  
                  {/* Actual Visual Bar */}
                  <rect
                    x={startX}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="6"
                    ry="6"
                    fill={activeBarIndex === index ? 'url(#barGradActive)' : 'url(#barGrad)'}
                    className="transition-all duration-200 pointer-events-none"
                  />

                  {/* Year Label */}
                  <text
                    x={startX + barWidth / 2}
                    y="138"
                    fill={activeBarIndex === index ? '#1e3a8a' : '#64748b'}
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}

            {/* Definitions for Gradients */}
            <defs>
              <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
              <linearGradient id="barGradActive" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* 2. Line Chart - Monthly Intake */}
      <div 
        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative chart-container flex flex-col justify-between h-[300px] transition-all duration-300 hover:shadow-md hover:border-slate-300"
        onMouseEnter={() => setHoveredChart('line')}
        onMouseLeave={() => setHoveredChart(null)}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kemasukan Bulanan</span>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <LineChart className="h-4 w-4 text-gov-blue-700" />
              Analisis Aliran Penerimaan Kes Bulanan
            </h3>
          </div>
          <span title="Menunjukkan bilangan kes diterima setiap bulan bagi tahun semasa" className="cursor-help"><Info className="h-4 w-4 text-slate-300" /></span>
        </div>

        {/* SVG Drawing area */}
        <div className="flex-1 relative flex items-center justify-center">
          <svg className="w-full h-full min-h-[160px]" viewBox="0 0 320 160">
            {/* Grid Lines */}
            {[0, 0.5, 1].map((ratio, i) => {
              const y = 20 + ratio * 100;
              const val = Math.round(maxLineValue * (1 - ratio));
              return (
                <g key={i}>
                  <line 
                    x1="30" 
                    y1={y} 
                    x2="310" 
                    y2={y} 
                    stroke="#f1f5f9" 
                    strokeWidth="1" 
                  />
                  <text 
                    x="22" 
                    y={y + 3} 
                    fill="#94a3b8" 
                    fontSize="9" 
                    textAnchor="end" 
                    fontWeight="bold"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Calculations for line coordinates */}
            {(() => {
              const paddingLeft = 35;
              const totalWidth = 270;
              const points = lineData.map((d, index) => {
                const x = paddingLeft + (index / 11) * totalWidth;
                const heightRatio = d.value / maxLineValue;
                const y = 120 - heightRatio * 100;
                return { x, y, label: d.label, value: d.value };
              });

              // Create path
              const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
              const areaPath = `${linePath} L ${points[points.length - 1].x} 120 L ${points[0].x} 120 Z`;

              return (
                <g>
                  {/* Area fill */}
                  <path d={areaPath} fill="url(#lineAreaGrad)" opacity="0.15" />

                  {/* Line path */}
                  <path 
                    d={linePath} 
                    fill="none" 
                    stroke="#4f46e5" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />

                  {/* Nodes & Interactive circles */}
                  {points.map((p, index) => {
                    const isEven = index % 2 === 0;
                    return (
                      <g key={index}>
                        {/* Visual node circle */}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={activeLineIndex === index ? 5.5 : 3.5}
                          fill={activeLineIndex === index ? '#d97706' : '#4f46e5'}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="transition-all duration-150 pointer-events-none"
                        />

                        {/* Hover receiver */}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="10"
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={(e) => {
                            setActiveLineIndex(index);
                            handleMouseEnter(e, `${p.label} 2026`, `${p.value} Kes Baru`);
                          }}
                          onMouseLeave={() => {
                            setActiveLineIndex(null);
                            handleMouseLeave();
                          }}
                        />

                        {/* X-axis Labels (Skip every other to fit nicely on mobile-svg viewport) */}
                        {isEven && (
                          <text
                            x={p.x}
                            y="138"
                            fill={activeLineIndex === index ? '#4f46e5' : '#94a3b8'}
                            fontSize="8.5"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {p.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })()}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="lineAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* 3. Donut Chart - Offense Types Breakdown */}
      <div 
        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative chart-container flex flex-col justify-between h-[300px] transition-all duration-300 hover:shadow-md hover:border-slate-300"
        onMouseEnter={() => setHoveredChart('donut')}
        onMouseLeave={() => setHoveredChart(null)}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kategori Kesalahan</span>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <PieChart className="h-4 w-4 text-gov-blue-700" />
              Taburan Kategori Kesalahan
            </h3>
          </div>
          <span title="Pecahan jenis pertuduhan utama daripada fail kes aktif" className="cursor-help"><Info className="h-4 w-4 text-slate-300" /></span>
        </div>

        {/* Split layout: SVG on left, Legends on right */}
        <div className="flex-1 flex items-center gap-2 mt-2">
          {/* Donut SVG */}
          <div className="w-[120px] h-[120px] shrink-0 relative flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 120 120">
              {/* Central text displaying total */}
              <g transform="translate(60, 60)">
                <text
                  x="0"
                  y="-4"
                  fill="#94a3b8"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="uppercase tracking-wider"
                >
                  Jumlah
                </text>
                <text
                  x="0"
                  y="12"
                  fill="#0f172a"
                  fontSize="16"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {totalOffenses}
                </text>
              </g>

              {/* Render Segments */}
              {(() => {
                const radius = 40;
                const cx = 60;
                const cy = 60;
                const circumference = 2 * Math.PI * radius;
                let accumulatedPercent = 0;

                return donutData.map((d, index) => {
                  const percent = (d.count / totalOffenses) * 100;
                  const strokeOffset = circumference - (percent / 100) * circumference;
                  const angleRotation = (accumulatedPercent / 100) * 360;
                  accumulatedPercent += percent;

                  const color = donutColors[index % donutColors.length];
                  const isHovered = activeDonutIndex === index;

                  return (
                    <circle
                      key={index}
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill="transparent"
                      stroke={color}
                      strokeWidth={isHovered ? 13 : 9}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeOffset}
                      transform={`rotate(${angleRotation - 90} ${cx} ${cy})`}
                      className="transition-all duration-200 cursor-pointer origin-center"
                      onMouseEnter={(e) => {
                        setActiveDonutIndex(index);
                        handleMouseEnter(e, d.name, `${d.count} Pertuduhan (${percent.toFixed(1)}%)`);
                      }}
                      onMouseLeave={() => {
                        setActiveDonutIndex(null);
                        handleMouseLeave();
                      }}
                    />
                  );
                });
              })()}
            </svg>
          </div>

          {/* Legends */}
          <div className="flex-1 flex flex-col justify-center gap-1.5 overflow-hidden">
            {donutData.map((d, index) => {
              const color = donutColors[index % donutColors.length];
              const percent = (d.count / totalOffenses) * 100;
              const isHovered = activeDonutIndex === index;

              return (
                <div 
                  key={index} 
                  className={`flex items-center gap-2 cursor-pointer p-1 rounded-lg transition-colors ${isHovered ? 'bg-slate-50 font-bold' : ''}`}
                  onMouseEnter={(e) => {
                    setActiveDonutIndex(index);
                    handleMouseEnter(e, d.name, `${d.count} Pertuduhan (${percent.toFixed(1)}%)`);
                  }}
                  onMouseLeave={() => {
                    setActiveDonutIndex(null);
                    handleMouseLeave();
                  }}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-[10px] text-slate-700 block truncate leading-tight font-bold">
                      {d.name}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-semibold leading-none mt-0.5">
                      {d.count} kes ({percent.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {activeTooltip && (
        <div 
          className="absolute z-30 bg-slate-900/95 text-white px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700 text-[10px] pointer-events-none flex flex-col gap-0.5 backdrop-blur-sm -translate-x-1/2 -translate-y-full transition-all duration-100 ease-out"
          style={{ 
            left: `${activeTooltip.x}px`, 
            top: `${activeTooltip.y}px` 
          }}
        >
          <span className="font-bold opacity-60 uppercase tracking-wide text-[8px]">
            {activeTooltip.title}
          </span>
          <span className="font-black text-gov-gold-400">
            {activeTooltip.value}
          </span>
        </div>
      )}
    </div>
  );
}
