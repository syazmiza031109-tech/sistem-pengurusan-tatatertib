'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CompleteCase } from '@/lib/types';
import { INITIAL_CASES } from '@/lib/mock-data';
import { 
  Plus, ShieldAlert, FileText, Database, CheckCircle
} from 'lucide-react';
import AdminCharts from '@/components/admin-charts';

export default function AdminDashboard() {
  const [cases, setCases] = useState<CompleteCase[]>([]);

  useEffect(() => {
    // Load from localStorage or seed
    const stored = localStorage.getItem('spt_cases');
    if (stored) {
      setCases(JSON.parse(stored));
    } else {
      localStorage.setItem('spt_cases', JSON.stringify(INITIAL_CASES));
      setCases(INITIAL_CASES);
    }
  }, []);

  // KPIs
  const totalCases = cases.length;
  const pendingPenentuan = cases.filter(c => c.workflow.STATUS_KATEGORI_UTAMA === 'Klarifikasi & Perincian Kesalahan').length;
  const pendingSP = cases.filter(c => c.workflow.STATUS_KATEGORI_UTAMA === 'Penentuan Pengerusi').length;
  const pendingLembaga = cases.filter(c => c.workflow.STATUS_KATEGORI_UTAMA === 'Surat Pertuduhan (SP)').length;

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gov-blue-700 tracking-tight">Papan Pemuka Kes Tatatertib</h2>
          <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mt-0.5">Urus Setia & Pegawai Kes (Admin)</p>
        </div>

        <Link
          href="/dashboard/admin/register"
          className="bg-gov-gold-500 hover:bg-gov-gold-600 text-gov-blue-900 px-6 py-3.5 rounded-2xl text-xs font-bold shadow-lg shadow-gov-gold-500/20 hover:scale-[1.02] transition-all duration-200 flex items-center gap-2.5 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5 stroke-[3]" />
          <span>Daftar Kes Baharu</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jumlah Kes</span>
            <span className="text-2xl font-black text-gov-blue-700 mt-1 block">{totalCases} Fail</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-gov-blue-50 text-gov-blue-700 flex items-center justify-center">
            <Database className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Klarifikasi Awal</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">{pendingPenentuan} Kes</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Penentuan Pengerusi</span>
            <span className="text-2xl font-black text-purple-600 mt-1 block">{pendingSP} Kes</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pertuduhan Fail</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{pendingLembaga} Kes</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <AdminCharts cases={cases} />
    </div>
  );
}
