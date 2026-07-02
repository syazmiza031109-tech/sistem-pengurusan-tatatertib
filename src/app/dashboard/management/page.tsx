'use client';

import React, { useState, useEffect } from 'react';
import { CompleteCase } from '@/lib/types';
import { INITIAL_CASES } from '@/lib/mock-data';
import { 
  ClipboardCheck, UserCheck, AlertTriangle, FileText, CheckCircle2,
  Lock, Calendar, FolderOpen, ScrollText, Database, ShieldAlert
} from 'lucide-react';

export default function ManagementDashboard() {
  const [cases, setCases] = useState<CompleteCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<CompleteCase | null>(null);
  
  // Action sheet form state
  const [penentuan, setPenentuan] = useState('P36 - Wujud Kesalahan');
  const [ulasan, setUlasan] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [approveSuccess, setApproveSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('spt_cases');
    if (stored) {
      setCases(JSON.parse(stored));
    } else {
      localStorage.setItem('spt_cases', JSON.stringify(INITIAL_CASES));
      setCases(INITIAL_CASES);
    }
  }, []);

  // Filter cases that are in "Penentuan Pengerusi" phase (meaning they need Director sign-off)
  const pendingCases = cases.filter(c => 
    c.workflow.STATUS_KATEGORI_UTAMA === 'Penentuan Pengerusi' && 
    !c.workflow.TARIKH_PENENTUAN_PENGERUSI
  );

  // KPIs / Analytics Calculations
  const totalCases = cases.length;
  const pendingPenentuan = cases.filter(c => c.workflow.STATUS_KATEGORI_UTAMA === 'Klarifikasi & Perincian Kesalahan').length;
  const pendingSP = cases.filter(c => c.workflow.STATUS_KATEGORI_UTAMA === 'Penentuan Pengerusi').length;
  const pendingLembaga = cases.filter(c => c.workflow.STATUS_KATEGORI_UTAMA === 'Surat Pertuduhan (SP)').length;

  const handleSelectCase = (c: CompleteCase) => {
    setSelectedCase(c);
    setUlasan(c.details.ULASAN_URUS_SETIA || '');
    setApproveSuccess(false);
  };

  const handleApproveCase = async () => {
    if (!selectedCase) return;
    setIsApproving(true);

    // Simulate signing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update case in array
    const updatedCases = cases.map(c => {
      if (c.metadata.NO_RUJ_FAIL_JPA === selectedCase.metadata.NO_RUJ_FAIL_JPA) {
        return {
          ...c,
          workflow: {
            ...c.workflow,
            STATUS_KATEGORI: 'B07e PP - Keputusan PP Oleh KSN (Wujud P37) - Urusetia',
            STATUS_KATEGORI_UTAMA: 'Surat Pertuduhan (SP)', // Advances to Step 4.0
            PENENTUAN: penentuan,
            TARIKH_PENENTUAN_PENGERUSI: new Date().toISOString().split('T')[0],
            TARIKH_LULUS_PP: new Date().toISOString().split('T')[0]
          },
          details: {
            ...c.details,
            ULASAN_URUS_SETIA: ulasan
          }
        };
      }
      return c;
    });

    localStorage.setItem('spt_cases', JSON.stringify(updatedCases));
    setCases(updatedCases);
    setIsApproving(false);
    setApproveSuccess(true);

    // Reset after showing success
    setTimeout(() => {
      setSelectedCase(null);
      setApproveSuccess(false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-black text-gov-blue-700 tracking-tight">Pengesahan Kertas Makluman & Penentuan Pengerusi</h2>
        <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mt-0.5">Ketua Jabatan / Pengarah (Management / Approver)</p>
      </div>

      {/* KPI Cards / Analytics */}
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
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Pending List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Kertas Cadangan Menunggu Kelulusan</h3>
              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {pendingCases.length} Tugasan
              </span>
            </div>

            {pendingCases.length > 0 ? (
              <div className="space-y-3">
                {pendingCases.map((c) => (
                  <button
                    key={c.metadata.NO_RUJ_FAIL_JPA}
                    onClick={() => handleSelectCase(c)}
                    className={`w-full text-left p-4 rounded-xl border flex justify-between items-start transition-all duration-200 cursor-pointer ${
                      selectedCase?.metadata.NO_RUJ_FAIL_JPA === c.metadata.NO_RUJ_FAIL_JPA
                        ? 'border-gov-blue-700 bg-gov-blue-50/50 shadow-sm'
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1 pr-4">
                      <span className="text-[10px] font-mono text-gov-blue-700 font-bold block">
                        {c.metadata.NO_RUJ_FAIL_JPA}
                      </span>
                      <span className="text-xs font-bold text-slate-800 block">
                        {c.officer.NAMA} (Gred {c.officer.GRED})
                      </span>
                      <span className="text-[11px] text-slate-500 line-clamp-1 font-medium leading-relaxed">
                        {c.details.RINGKASAN_KESALAHAN}
                      </span>
                    </div>
                    <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-bold border border-amber-200 shrink-0 uppercase tracking-wider">
                      DRAF PP READY
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 font-semibold space-y-2">
                <ClipboardCheck className="h-8 w-8 mx-auto text-slate-300" />
                <p className="text-xs">Tiada kertas cadangan yang memerlukan pengesahan atau kelulusan anda buat masa ini.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Approval Detail Sheet */}
        <div className="lg:col-span-5">
          {selectedCase ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Tindakan Kelulusan Kertas</h3>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{selectedCase.metadata.NO_RUJ_FAIL_JPA}</span>
                </div>
                <span className="bg-gov-blue-50 text-gov-blue-700 px-2.5 py-0.5 rounded font-mono text-[9px] font-bold">
                  Kertas Pengerusi
                </span>
              </div>

              {approveSuccess ? (
                <div className="py-12 text-center space-y-3 animate-fade-in">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-800">Tandatangan Digital Berjaya!</h4>
                  <p className="text-xs text-emerald-600 font-medium">Kes telah diluluskan di bawah {penentuan} dan diajukan ke peringkat Surat Pertuduhan.</p>
                </div>
              ) : (
                <div className="space-y-5 text-xs">
                  {/* Officer Details */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex gap-3.5 items-center">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 uppercase">
                        {selectedCase.officer.NAMA[0]}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">{selectedCase.officer.NAMA}</span>
                        <span className="text-[10px] text-slate-400 font-medium block">KP: {selectedCase.officer.NO_KP} | Gred: {selectedCase.officer.GRED}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium border-t border-slate-200 pt-2 leading-relaxed">
                      <span className="font-bold text-slate-600">Perincian Kesalahan:</span> {selectedCase.details.KESALAHAN_ALL}
                    </div>
                  </div>

                  {/* Pathway Decision Form */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <ScrollText className="h-4 w-4 text-gov-blue-700" />
                        <span>Tentukan Laluan Peraturan Tatatertib (PENENTUAN)</span>
                      </label>
                      <select
                        value={penentuan}
                        onChange={(e) => setPenentuan(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 bg-slate-50 cursor-pointer"
                      >
                        <option value="P36 - Wujud Kesalahan">Peraturan 36 (P36) - Wujud Kesalahan (Tindakan Bukan Turun Pangkat/Buang)</option>
                        <option value="P36 - Tidak Wujud Kesalahan">Peraturan 36 (P36) - Tiada Prima Facie / Tutup Kes</option>
                        <option value="P37 - Wujud Kesalahan">Peraturan 37 (P37) - Wujud Kesalahan Berat (Boleh Turun Pangkat/Buang)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">Ulasan Ketua Jabatan / Ulasan Urus Setia Tambahan</label>
                      <textarea
                        value={ulasan}
                        onChange={(e) => setUlasan(e.target.value)}
                        rows={3}
                        placeholder="Masukkan catatan kelulusan atau arahan pembaikan untuk urus setia..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 bg-slate-50"
                      ></textarea>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedCase(null)}
                      className="flex-1 py-3.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors text-center cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleApproveCase}
                      disabled={isApproving}
                      className="flex-1 bg-gov-blue-700 hover:bg-gov-blue-800 text-white font-bold py-3.5 rounded-xl shadow-md shadow-gov-blue-700/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Lock className="h-4 w-4 text-gov-gold-400" />
                      <span>{isApproving ? 'Menandatangani...' : 'Luluskan & Tandatangan'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-100 rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-400 font-semibold space-y-2.5">
              <FileText className="h-8 w-8 mx-auto text-slate-300" />
              <p className="text-xs leading-relaxed max-w-xs mx-auto">Sila pilih salah satu kertas cadangan di sebelah kiri untuk menyemak dan memberi kelulusan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
