'use client';

import React from 'react';
import { Shield, BookOpen, Clock, BarChart3, ChevronRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function Home() {

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

  const steps = [
    { bil: '1.0', tajuk: 'Pendaftaran Profil', desc: 'Pengesahan dan kemasukan profil pegawai awam terbabit.' },
    { bil: '2.0', tajuk: 'Klasifikasi Kes', desc: 'Klasifikasi jenis kesalahan dan perincian ringkasan kes.' },
    { bil: '3.0', tajuk: 'Penentuan Pengerusi', desc: 'Penyediaan kertas makluman bagi penetapan laluan peraturan (P36/P37).' },
    { bil: '4.0', tajuk: 'Surat Pertuduhan', desc: 'Penyediaan draf pertuduhan bertulis untuk diserahkan kepada pegawai.' },
    { bil: '5.0', tajuk: 'Keputusan Lembaga', desc: 'Persidangan Lembaga Tatatertib dan penetapan hukuman muktamad.' },
    { bil: '6.0', tajuk: 'Rayuan & HRMIS', desc: 'Pengurusan rayuan tatatertib dan pengemaskinian rekod ke HRMIS.' }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden font-sans">
      {/* Header */}
      <header className="glass-panel sticky top-0 w-full z-40 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 bg-gov-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-gov-blue-700/20">
              <Shield className="h-6 w-6 text-gov-gold-400" />
            </div>
            <div>
              <span className="text-lg font-bold text-gov-blue-700 tracking-tight block">Sistem Pengurusan Tatatertib</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gov-gold-600">Jabatan Perkhidmatan Awam Malaysia</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#objektif" className="hover:text-gov-blue-700 transition-colors">Objektif</a>
            <a href="#aliran" className="hover:text-gov-blue-700 transition-colors">Aliran Kerja</a>
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
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-20 grid md:grid-cols-12 gap-12 items-center z-10">
        <div className="md:col-span-7 space-y-6 md:pr-4 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gov-blue-50 border border-gov-blue-100 text-gov-blue-700 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-gov-gold-500 animate-pulse"></span>
            <span>Versi Digital Terkini 2.0</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gov-blue-700 leading-tight tracking-tight">
            Ketelusan Pentadbiran, <span className="text-gov-gold-500">Integriti</span> Perkhidmatan Awam.
          </h1>
          <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
            SPT menyediakan kerangka kerja berstruktur untuk mendigitalisasikan pengurusan kes, melacak prestasi KPI pelepasan kes, serta menyelaraskan keputusan tatatertib secara berpusat bagi memelihara kebertanggungjawaban awam.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
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

        {/* Dashboard Preview Widget */}
        <div className="md:col-span-5 animate-fade-in">
          <div className="glass-panel shadow-2xl rounded-3xl overflow-hidden border border-slate-200">
            {/* Header Mock */}
            <div className="bg-gov-blue-700 px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 ml-2">SPT Dashboard Preview</span>
              </div>
              <span className="text-[9px] bg-gov-blue-800 text-gov-gold-400 px-2 py-0.5 rounded font-mono font-bold">Secure SSL</span>
            </div>

            {/* Content Mock */}
            <div className="p-6 bg-slate-50 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700">Ringkasan Kes Semasa</h4>
                <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">Julai 2026</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-semibold block">Dalam Siasatan</span>
                  <span className="text-lg font-black text-gov-blue-700">14 Kes</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-semibold block">Menunggu Kelulusan</span>
                  <span className="text-lg font-black text-amber-500">6 Kes</span>
                </div>
              </div>

              {/* Progress Line */}
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-500">Kadar Penyelesaian KPI</span>
                  <span className="text-emerald-600">88.5%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-[88.5%] bg-emerald-500 rounded-full"></div>
                </div>
              </div>

              {/* Recent Activity Item */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <ShieldAlert className="h-4 w-4 text-gov-blue-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-700 block">Draf Pertuduhan Baharu</span>
                    <span className="text-[9px] text-slate-400 block font-medium">No. Rujukan Fail: JPA.C.P.100-2/4/12</span>
                  </div>
                </div>
                <span className="text-[9px] bg-blue-50 text-gov-blue-600 px-2 py-0.5 rounded font-bold">Sedia</span>
              </div>
            </div>
          </div>
        </div>
      </main>

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

      {/* Workflow Section */}
      <section id="aliran" className="py-16 md:py-20 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-3xl font-black text-gov-blue-700 tracking-tight">Kitaran Aliran Kerja Tatatertib</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium">
              Sistem SPT mengikuti secara ketat prosedur undang-undang tatatertib bermula daripada saringan profil sehingga tindakan rayuan pegawai.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((s, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-sm font-black text-gov-gold-600 bg-gov-gold-50 h-8 w-8 rounded-lg flex items-center justify-center shrink-0">
                  {s.bil}
                </span>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">{s.tajuk}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gov-blue-900 py-12 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gov-blue-800 rounded-lg flex items-center justify-center border border-slate-700">
              <Shield className="h-4.5 w-4.5 text-gov-gold-400" />
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
