'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CompleteCase } from '@/lib/types';
import { INITIAL_CASES } from '@/lib/mock-data';
import { Plus } from 'lucide-react';
import AdminCharts from '@/components/admin-charts';

export default function AdminDashboard() {
  const [cases, setCases] = useState<CompleteCase[]>([]);

  useEffect(() => {
    // Load from localStorage or seed
    const stored = localStorage.getItem('spt_cases');
    setTimeout(() => {
      if (stored) {
        setCases(JSON.parse(stored));
      } else {
        localStorage.setItem('spt_cases', JSON.stringify(INITIAL_CASES));
        setCases(INITIAL_CASES);
      }
    }, 0);
  }, []);

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



      {/* Analytics Charts */}
      <AdminCharts cases={cases} />
    </div>
  );
}
