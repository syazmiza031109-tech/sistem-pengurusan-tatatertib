'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CompleteCase } from '@/lib/types';
import { INITIAL_CASES } from '@/lib/mock-data';
import { 
  Plus, Search, Filter, ShieldAlert, FolderOpen, Calendar, 
  FileText, ArrowRightLeft, Database, CheckCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [cases, setCases] = useState<CompleteCase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.officer.NAMA.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.metadata.NO_RUJ_FAIL_JPA.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.officer.NO_KP.includes(searchTerm);
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && c.workflow.STATUS_KATEGORI_UTAMA === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    if (status.includes('Klarifikasi')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (status.includes('Penentuan') || status.includes('Lulus PP')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (status.includes('Pertuduhan')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    } else if (status.includes('Hukuman') || status.includes('Lembaga')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    } else {
      return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getHrmisBadge = (status: string) => {
    switch (status) {
      case 'Incomplete':
        return 'bg-slate-100 text-slate-600';
      case 'SP Updated':
        return 'bg-purple-100 text-purple-700';
      case 'SK Updated':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

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

      {/* Filter and Table Panel */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Tools */}
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
            <input
              type="text"
              placeholder="Cari Nama / No. Rujukan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 focus:ring-1 focus:ring-gov-blue-500 transition-all bg-slate-50"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
            <Filter className="text-slate-400 h-4 w-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all bg-slate-50 cursor-pointer"
            >
              <option value="ALL">Semua Fasa Aliran</option>
              <option value="Klarifikasi & Perincian Kesalahan">1.0 Klarifikasi Kes</option>
              <option value="Penentuan Pengerusi">2.0 Penentuan Pengerusi</option>
              <option value="Surat Pertuduhan (SP)">3.0 Surat Pertuduhan</option>
              <option value="Penyerahan Hukuman & Keputusan Lembaga (PH/LTT)">4.0 Sidang Lembaga</option>
            </select>
          </div>
        </div>

        {/* Data Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="py-4.5 px-6">No. Rujukan Fail</th>
                <th className="py-4.5 px-6">Pegawai Awam</th>
                <th className="py-4.5 px-6">Skim / Gred</th>
                <th className="py-4.5 px-6">Kategori Kesalahan</th>
                <th className="py-4.5 px-6">Fasa / Kategori Utama</th>
                <th className="py-4.5 px-6">Status HRMIS</th>
                <th className="py-4.5 px-6 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {filteredCases.length > 0 ? (
                filteredCases.map((c) => (
                  <tr key={c.metadata.NO_RUJ_FAIL_JPA} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-gov-blue-700 text-[11px] font-bold">
                      {c.metadata.NO_RUJ_FAIL_JPA}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-800 font-bold block">{c.officer.NAMA}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">KP: {c.officer.NO_KP}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="block">{c.officer.JAWATAN}</span>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono inline-block mt-0.5">Gred {c.officer.GRED}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {c.details.JENIS_KESALAHAN.slice(0, 2).map((jk, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded-full">
                            {jk}
                          </span>
                        ))}
                        {c.details.JENIS_KESALAHAN.length > 2 && (
                          <span className="bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded-full font-bold">
                            +{c.details.JENIS_KESALAHAN.length - 2} lagi
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider ${getStatusBadge(c.workflow.STATUS_KATEGORI_UTAMA)}`}>
                        {c.workflow.STATUS_KATEGORI_UTAMA}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getHrmisBadge(c.workflow.STATUS_KEMASKINI_KES_DI_HRMIS)}`}>
                        {c.workflow.STATUS_KEMASKINI_KES_DI_HRMIS}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {c.metadata.URL_LINK_GD && (
                          <a 
                            href={c.metadata.URL_LINK_GD}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-gov-blue-700 bg-slate-50 hover:bg-gov-blue-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="Buka Folder Drive"
                          >
                            <FolderOpen className="h-4 w-4" />
                          </a>
                        )}
                        <span className="text-[10px] text-slate-400 block px-2 py-1 bg-slate-50 rounded border border-slate-200 font-mono">
                          {c.workflow.TAHUN_TERIMA}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                    <Database className="h-8 w-8 mx-auto text-slate-300 mb-2.5" />
                    <span>Tiada rekod kes tatatertib dijumpai.</span>
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
