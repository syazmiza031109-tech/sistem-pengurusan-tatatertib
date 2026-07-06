'use client';

import React, { useState, useEffect } from 'react';
import { CompleteCase } from '@/lib/types';
import { INITIAL_CASES, KEPUTUSAN_PERTUDUHAN } from '@/lib/mock-data';
import { 
  Key, CheckCircle2, AlertOctagon, HelpCircle, 
  FileSignature, ExternalLink, RefreshCw, Database, ShieldAlert, FileText
} from 'lucide-react';

export default function ExecutiveDashboard() {
  const [cases, setCases] = useState<CompleteCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<CompleteCase | null>(null);
  
  // Board verdict states
  const [hukuman, setHukuman] = useState('Amaran');
  const [bilMltt, setBilMltt] = useState('LTT Bil. 3/2026');
  const [jenisMltt, setJenisMltt] = useState('PA - Pihak Berkuasa Tatatertib Kumpulan Sokongan');
  const [ringkasanHukuman, setRingkasanHukuman] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hrmisLogs, setHrmisLogs] = useState<string[]>([]);

  useEffect(() => {
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

  // Filter cases that are in "Surat Pertuduhan (SP)" state (meaning representation is received and ready for trial)
  const trialCases = cases.filter(c => 
    c.workflow.STATUS_KATEGORI_UTAMA === 'Surat Pertuduhan (SP)' &&
    !c.workflow.KEPUTUSAN_PERTUDUHAN
  );

  // KPIs / Analytics Calculations
  const totalCases = cases.length;
  const pendingPenentuan = cases.filter(c => c.workflow.STATUS_KATEGORI_UTAMA === 'Klarifikasi & Perincian Kesalahan').length;
  const pendingSP = cases.filter(c => c.workflow.STATUS_KATEGORI_UTAMA === 'Penentuan Pengerusi').length;
  const pendingLembaga = cases.filter(c => c.workflow.STATUS_KATEGORI_UTAMA === 'Surat Pertuduhan (SP)').length;

  const handleSelectCase = (c: CompleteCase) => {
    setSelectedCase(c);
    setHukuman('Amaran');
    setRingkasanHukuman('');
    setSaveSuccess(false);
    setHrmisLogs([]);
  };

  const handleSaveVerdict = async () => {
    if (!selectedCase) return;
    setIsSaving(true);
    setHrmisLogs([]);

    // 1. Update localStorage
    const updated = cases.map(c => {
      if (c.metadata.NO_RUJ_FAIL_JPA === selectedCase.metadata.NO_RUJ_FAIL_JPA) {
        return {
          ...c,
          workflow: {
            ...c.workflow,
            STATUS_KATEGORI: 'E04a PH - JK2T - Urusetia',
            STATUS_KATEGORI_UTAMA: 'Penyerahan Hukuman & Keputusan Lembaga (PH/LTT)', // Step 5.0
            STATUS_KEMASKINI_KES_DI_HRMIS: 'SK Updated' as const, // Sync status updated
            KEPUTUSAN_PERTUDUHAN: hukuman,
            TARIKH_BORANG_KEPUTUSAN_LTT: new Date().toISOString().split('T')[0],
            TARIKH_MLTT: new Date().toISOString().split('T')[0],
            BIL_MLTT: bilMltt,
            JENIS_MLTT: jenisMltt,
            TAHUN_MESY_LTT: new Date().getFullYear(),
            RINGKASAN_KEPUTUSAN_HUKUMAN: ringkasanHukuman || `DIHUKUM HUKUMAN: ${hukuman.toUpperCase()}`
          }
        };
      }
      return c;
    });

    // Simulate API integration logs for HRMIS
    const apiLogs = [
      'Memulakan integrasi API SOAP HRMIS...',
      'Mengakses skema [Tatatertib_HRMIS_Service]...',
      'Mencari rekod penjawat awam: KP ' + selectedCase.officer.NO_KP + '...',
      'Memindahkan keputusan: "' + hukuman + '"...',
      'Menetapkan sekatan kenaikan pangkat (Flag Tempoh Blacklist)...',
      'Mengemas kini profil perkhidmatan pegawai di pangkalan data JPA...',
      'Penyelarasan Sistem HRMIS berjaya! Status: Sync OK.'
    ];

    for (let i = 0; i < apiLogs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setHrmisLogs(prev => [...prev, apiLogs[i]]);
    }

    localStorage.setItem('spt_cases', JSON.stringify(updated));
    setCases(updated);
    setIsSaving(false);
    setSaveSuccess(true);

    setTimeout(() => {
      setSelectedCase(null);
      setSaveSuccess(false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-black text-gov-blue-700 tracking-tight">Keputusan Sidang & Hukuman Lembaga Tatatertib</h2>
        <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mt-0.5">Lembaga Tatatertib Perkhidmatan Awam (Board)</p>
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
        {/* Left Side: Cases List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Kes Sedia Untuk Persidangan & Hukuman</h3>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {trialCases.length} Kes
              </span>
            </div>

            {trialCases.length > 0 ? (
              <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1.5 custom-scrollbar">
                {trialCases.map((c) => (
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
                        Laluan: {c.workflow.PENENTUAN || 'P36 - Wujud Kesalahan'}
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200 shrink-0 uppercase tracking-wider">
                      TRIAL READY
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 font-semibold space-y-2">
                <Key className="h-8 w-8 mx-auto text-slate-300" />
                <p className="text-xs">Tiada kes dalam fasa perbicaraan sedia ada.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Verdict Panel */}
        <div className="lg:col-span-6">
          {selectedCase ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Kemasukan Keputusan Hukuman</h3>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{selectedCase.metadata.NO_RUJ_FAIL_JPA}</span>
                </div>
                <span className="bg-gov-gold-50 text-gov-gold-700 px-2.5 py-0.5 rounded font-mono text-[9px] font-bold border border-gov-gold-200">
                  LTT Bilik Sidang
                </span>
              </div>

              {saveSuccess ? (
                <div className="py-12 text-center space-y-3 animate-fade-in">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-800">Keputusan Lembaga Dihantar!</h4>
                  <p className="text-xs text-emerald-600 font-medium">Rekod tatatertib dan tempoh blacklist telah diselaraskan ke profil HRMIS pegawai awam.</p>
                </div>
              ) : (
                <div className="space-y-5 text-xs">
                  {/* Incident Summary */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-700 block">Keterangan Kes Pegawai:</span>
                    <span className="text-slate-600 leading-relaxed block">{selectedCase.details.KESALAHAN_ALL}</span>
                    {selectedCase.metadata.URL_LINK_GD && (
                      <a
                        href={selectedCase.metadata.URL_LINK_GD}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-gov-blue-700 font-bold mt-2 hover:underline"
                      >
                        <span>Semak Kertas & Bukti GD</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Meeting Details Form */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rujukan Mesyuarat LTT</label>
                      <input
                        type="text"
                        value={bilMltt}
                        onChange={(e) => setBilMltt(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Jenis Lembaga</label>
                      <select
                        value={jenisMltt}
                        onChange={(e) => setJenisMltt(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 bg-slate-50 cursor-pointer"
                      >
                        <option value="PA - Kumpulan Sokongan">Kumpulan Sokongan No. 1</option>
                        <option value="PA - Kumpulan Pengurusan">Kumpulan Pengurusan No. 2</option>
                      </select>
                    </div>
                  </div>

                  {/* Sentence Verdict */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <AlertOctagon className="h-4 w-4 text-gov-gold-500 animate-pulse" />
                        <span>Keputusan Hukuman Lembaga (KEPUTUSAN PERTUDUHAN)</span>
                      </label>
                      <select
                        value={hukuman}
                        onChange={(e) => setHukuman(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 bg-slate-50 cursor-pointer font-bold text-gov-blue-700"
                      >
                        {KEPUTUSAN_PERTUDUHAN.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">Ringkasan Keputusan Hukuman / Minit Ringkas Sidang</label>
                      <textarea
                        value={ringkasanHukuman}
                        onChange={(e) => setRingkasanHukuman(e.target.value)}
                        rows={3}
                        placeholder="Contoh: DIHUKUM AMARAN DAN LUCUT HAK EMOLUMEN SEBANYAK 3 HARI GAJI..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 bg-slate-50"
                      ></textarea>
                    </div>
                  </div>

                  {/* Sync Logs Widget */}
                  {isSaving && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-3.5 w-3.5 text-gov-blue-700 animate-spin" />
                          <span className="font-bold text-gov-blue-700">Penyelarasan Pangkalan Data HRMIS...</span>
                        </div>
                      </div>
                      <div className="bg-slate-900 p-3.5 rounded-lg font-mono text-[8px] text-slate-300 space-y-1 max-h-24 overflow-y-auto">
                        {hrmisLogs.map((log, idx) => (
                          <div key={idx}>➔ {log}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {!isSaving && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedCase(null)}
                        className="flex-1 py-3.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors text-center cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleSaveVerdict}
                        className="flex-1 bg-gov-blue-700 hover:bg-gov-blue-800 text-white font-bold py-3.5 rounded-xl shadow-md shadow-gov-blue-700/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <FileSignature className="h-4 w-4 text-gov-gold-400" />
                        <span>Rekodkan Keputusan</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-100 rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-400 font-semibold space-y-2.5">
              <HelpCircle className="h-8 w-8 mx-auto text-slate-300" />
              <p className="text-xs leading-relaxed max-w-xs mx-auto">Sila pilih fail kes tatatertib di sebelah kiri untuk melihat maklumat terperinci dan merekod keputusan sidang.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
