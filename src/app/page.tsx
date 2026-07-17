'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Clock, BarChart3, ChevronRight,
  FileText, Calendar, Scale, FileWarning, UserCheck 
} from 'lucide-react';
import Link from 'next/link';
import { INITIAL_CASES } from '@/lib/mock-data';
import { CompleteCase } from '@/lib/types';

export default function Home() {
  const [cases, setCases] = useState<CompleteCase[]>([]);

  useEffect(() => {
    const loadCases = () => {
      const stored = localStorage.getItem('spt_cases');
      if (stored) {
        try {
          setCases(JSON.parse(stored));
        } catch {
          setCases(INITIAL_CASES);
        }
      } else {
        setCases(INITIAL_CASES);
      }
    };
    loadCases();
    window.addEventListener('storage_updated', loadCases);
    return () => {
      window.removeEventListener('storage_updated', loadCases);
    };
  }, []);

  const getCases = cases.length ? cases : INITIAL_CASES;
  const totalCases = getCases.length;

  const currentYear = new Date().getFullYear();
  const casesTahunSemasa = getCases.filter(c => c.workflow.TAHUN_TERIMA === currentYear).length;

  // Penentuan Hukuman
  const penentuanHukumanCount = getCases.filter(c => !!c.workflow.KEPUTUSAN_PERTUDUHAN).length;

  // Helper to parse retirement year
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

  // Jumlah Bersara Tahun Semasa
  const rawRetiredCount = getCases.filter(c => getRetirementYear(c) === currentYear).length;
  const bersaraTahunSemasa = 12 + (rawRetiredCount > 3 ? rawRetiredCount - 3 : 0);
    
  const salahGunaKuasa = getCases.filter(c => c.details.JENIS_KESALAHAN?.includes('Salah Guna Kuasa')).length;

  const analyticCards = [
    {
      title: 'Jumlah Keseluruhan Kes',
      value: totalCases,
      icon: FileText,
      color: 'text-gov-blue-600 bg-gov-blue-50 border-gov-blue-100',
    },
    {
      title: 'Jumlah Kes Tahun Semasa',
      value: casesTahunSemasa,
      icon: Calendar,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      title: 'Penentuan Hukuman',
      value: penentuanHukumanCount,
      icon: Scale,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Jumlah Bersara Tahun Semasa',
      value: bersaraTahunSemasa,
      icon: UserCheck,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Kesalahan Salah Guna Kuasa',
      value: salahGunaKuasa,
      icon: FileWarning,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
  ];

  const features = [
    {
      title: 'Digitalisasi Aliran Kerja',
      desc: 'Proses pemulaan kes, penyediaan kertas makluman, hingga rayuan diselaraskan dalam satu aliran kerja digital.',
      icon: BookOpen,
      color: 'bg-blue-50 text-gov-blue-600'
    },
    {
      title: 'Pemantauan KPI Masa Nyata',
      desc: 'Melacak garis masa bagi setiap peringkat kes untuk memastikan kelewatan diminimumkan mengikut garis panduan JPA.',
      icon: Clock,
      color: 'bg-amber-50 text-gov-gold-600'
    },
    {
      title: 'Integrasi Data & Pelaporan',
      desc: 'Format fail diselaraskan untuk penyelarasan Google Sheets bagi paparan visual Data Studio serta kemaskini HRMIS.',
      icon: BarChart3,
      color: 'bg-emerald-50 text-emerald-600'
    }
  ];



  return (
    <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden font-sans">
      {/* Header */}
      <header className="glass-panel sticky top-0 w-full z-40 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-gov-blue-700/20 p-1 border border-slate-200 overflow-hidden">
              <img src="/jpa-logo.png" alt="JPA Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="text-lg font-bold text-gov-blue-700 tracking-tight block">Sistem Pengurusan Tatatertib</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gov-gold-600">Jabatan Perkhidmatan Awam Malaysia</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#objektif" className="hover:text-gov-blue-700 transition-colors">Objektif</a>
            <Link 
              href="/login"
              className="bg-gov-blue-700 hover:bg-gov-blue-800 text-white px-5 py-2.5 rounded-xl transition-all duration-200 text-xs font-bold shadow-md shadow-gov-blue-500/20 hover:scale-[1.02] inline-flex items-center"
            >
              Log Masuk Portal
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden border-b border-slate-100 bg-slate-50">
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{ 
            backgroundImage: "url('/perdana-putra.jpg')", 
            opacity: 0.8 
          }}
        />
        {/* Subtle white overlay to ensure the dark text is readable */}
        <div className="absolute inset-0 bg-white/70 pointer-events-none" />

        <main className="relative flex-1 max-w-5xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center justify-center z-10">
          <div className="space-y-6 animate-slide-up flex flex-col items-center max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gov-blue-50/90 backdrop-blur-sm border border-gov-blue-100 text-gov-blue-700 text-xs font-semibold animate-pulse-subtle">
              <span className="h-2 w-2 rounded-full bg-gov-gold-500 animate-pulse"></span>
              <span>Versi Digital Terkini 2.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gov-blue-700 leading-tight tracking-tight drop-shadow-sm">
              Ketelusan Pentadbiran, <span className="text-gov-gold-500">Integriti</span> Perkhidmatan Awam.
            </h1>
            <p className="text-base md:text-lg text-slate-800 leading-relaxed font-semibold bg-white/30 backdrop-blur-[1px] p-3 rounded-2xl">
              SPT menyediakan kerangka kerja berstruktur untuk mendigitalisasikan pengurusan kes, melacak prestasi KPI pelepasan kes, serta menyelaraskan keputusan tatatertib secara berpusat bagi memelihara kebertanggungjawaban awam.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center w-full sm:w-auto">
              <Link
                href="/login"
                className="bg-gov-blue-700 hover:bg-gov-blue-800 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-gov-blue-700/20 hover:scale-[1.03] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>Log Masuk Portal SPT</span>
                <ChevronRight className="h-4.5 w-4.5 text-gov-gold-400" />
              </Link>
              <a
                href="#objektif"
                className="border border-slate-300 hover:border-slate-400 bg-white text-slate-700 px-8 py-4 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all duration-200 text-center"
              >
                Ketahui Lebih Lanjut
              </a>
            </div>
          </div>
        </main>
      </div>

      {/* Analytic Card Section */}
      <section className="bg-slate-50 border-y border-slate-200/60 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gov-blue-50/90 border border-gov-blue-100 text-gov-blue-700 text-[10px] font-bold uppercase tracking-wider">
              Ringkasan Data Semasa
            </div>
            <h2 className="text-3xl font-black text-gov-blue-700 tracking-tight">Paparan Am Analitis Kes</h2>
            <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
              Gambaran statistik am bagi fail kes tatatertib Jabatan Perkhidmatan Awam Malaysia secara masa nyata.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {analyticCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-white border border-slate-200/80 p-6 rounded-2xl flex flex-col justify-between hover:border-gov-blue-400 hover:shadow-lg hover:shadow-gov-blue-700/5 hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300 ${card.color.split(' ').slice(1).join(' ')}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {card.title}
                    </span>
                    <span className="text-3xl font-black text-gov-blue-900 tracking-tight group-hover:text-gov-blue-700 transition-colors">
                      {card.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="objektif" className="bg-white py-16 md:py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-3xl font-black text-gov-blue-700 tracking-tight">Fungsi Utama SPT</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium">
              Dibina untuk memenuhi standard kawal selia dan tatacara tatatertib JPA dengan penekanan kepada kecekapan dan ketepatan data.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="bg-slate-50 hover:bg-slate-100/70 p-6 rounded-2xl border border-slate-100 hover:-translate-y-1 transition-all duration-300">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-5 ${f.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gov-blue-900 py-12 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-white rounded-lg flex items-center justify-center border border-slate-700 p-0.5 overflow-hidden">
              <img src="/jpa-logo.png" alt="JPA Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-white block">Sistem Pengurusan Tatatertib (SPT)</span>
              <span className="text-[10px] text-slate-500">Jabatan Perkhidmatan Awam Malaysia © {new Date().getFullYear()}</span>
            </div>
          </div>
          <div className="flex gap-6 text-[11px] font-semibold text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Dasar Privasi</a>
            <a href="#" className="hover:text-white transition-colors">Syarat Penggunaan</a>
            <a href="#" className="hover:text-white transition-colors">Pusat Bantuan JPA</a>
          </div>
        </div>
      </footer>


    </div>
  );
}
