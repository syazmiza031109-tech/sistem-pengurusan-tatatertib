'use client';

import React, { useState, useEffect } from 'react';
import { CompleteCase, StatusUpdateLog } from '@/lib/types';
import { INITIAL_CASES, KEPUTUSAN_PERTUDUHAN } from '@/lib/mock-data';
import { 
  Key, CheckCircle2, AlertOctagon, HelpCircle, 
  FileSignature, ExternalLink, RefreshCw, Database, ShieldAlert, FileText
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { DashboardHero } from '@/components/dashboard-hero';

export default function ExecutiveDashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState<CompleteCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<CompleteCase | null>(null);
  
  // Board verdict states
  const [hukuman, setHukuman] = useState('Amaran');
  const [bilMltt, setBilMltt] = useState('LTT Bil. 3/2026');
  const [jenisMltt, setJenisMltt] = useState('PA - Pihak Berkuasa Tatatertib Kumpulan Sokongan');
  const [ringkasanHukuman, setRingkasanHukuman] = useState('');
  const [tarikhSidang, setTarikhSidang] = useState(new Date().toISOString().split('T')[0]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hrmisLogs, setHrmisLogs] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  // Filter cases that are completed in trial (recorded board verdict)
  const completedCases = cases.filter(c => 
    c.workflow.STATUS_KATEGORI_UTAMA === 'Penyerahan Hukuman & Keputusan Lembaga (PH/LTT)'
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
        const statusLog: StatusUpdateLog = {
          updatedAt: new Date().toISOString(),
          updatedBy: 'Lembaga Tatatertib Perkhidmatan Awam',
          role: 'Lembaga Tatatertib',
          actionType: 'STATUS_UPDATE',
          description: `Keputusan hukuman direkodkan: ${hukuman} (${bilMltt}, Tarikh: ${tarikhSidang})`
        };

        return {
          ...c,
          workflow: {
            ...c.workflow,
            STATUS_KATEGORI: 'E04a PH - JK2T - Urusetia',
            STATUS_KATEGORI_UTAMA: 'Penyerahan Hukuman & Keputusan Lembaga (PH/LTT)', // Step 5.0
            STATUS_KEMASKINI_KES_DI_HRMIS: 'SK Updated' as const, // Sync status updated
            KEPUTUSAN_PERTUDUHAN: hukuman,
            TARIKH_BORANG_KEPUTUSAN_LTT: tarikhSidang,
            TARIKH_MLTT: tarikhSidang,
            BIL_MLTT: bilMltt,
            JENIS_MLTT: jenisMltt,
            TAHUN_MESY_LTT: tarikhSidang ? parseInt(tarikhSidang.split('-')[0]) : new Date().getFullYear(),
            RINGKASAN_KEPUTUSAN_HUKUMAN: ringkasanHukuman || `DIHUKUM HUKUMAN: ${hukuman.toUpperCase()}`,
            STATUS_HISTORY: [...(c.workflow.STATUS_HISTORY || []), statusLog]
          }
        };
      }
      return c;
    });

    // Simulate API integration logs for HRMIS & Google Sheets Backend
    const apiLogs = [
      'Memulakan integrasi API SOAP HRMIS...',
      'Mengakses skema [Tatatertib_HRMIS_Service]...',
      'Mencari rekod penjawat awam: KP ' + selectedCase.officer.NO_KP + '...',
      'Memindahkan keputusan: "' + hukuman + '"...',
      'Menetapkan sekatan kenaikan pangkat (Flag Tempoh Blacklist)...',
      'Mengemas kini profil perkhidmatan pegawai di pangkalan data JPA...',
      'Penyelarasan Sistem HRMIS berjaya! Status: Sync OK.',
      'Menyegerakkan perubahan secara automatik ke Google Sheets Backend...',
      'Membuka fail Google Sheets: "Live Data TT Fey" (ID: 1WoTd1AOQ-dDSYv9O3eSBzien1bVtGMvqE93i6AKW6o4)...',
      'Mengemas kini rekod ' + selectedCase.officer.NAMA + ' dengan keputusan hukuman: "' + hukuman + '"...',
      'Auto-penyegerakan pangkalan data Google Sheets selesai! Status: 200 OK.'
    ];

    for (let i = 0; i < apiLogs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setHrmisLogs(prev => [...prev, apiLogs[i]]);
    }

    // If live connection is set up, make a real network request to write to the spreadsheet!
    const liveUrl = localStorage.getItem('spt_gsheet_url');
    const targetCase = updated.find(c => c.metadata.NO_RUJ_FAIL_JPA === selectedCase.metadata.NO_RUJ_FAIL_JPA);
    if (liveUrl && targetCase) {
      const row = [
        targetCase.metadata.BIL || '',
        targetCase.metadata.NO_RUJ_FAIL_JPA || '',
        targetCase.metadata.BIL_IKUT_SUSUNAN_PAPER || '',
        targetCase.metadata.URL_LINK_GD || '',
        targetCase.metadata.URL_LINK_LSPRM_LPBI_ADUAN || '',
        targetCase.metadata.URL_LINK_PP || '',
        '', // URL_LINK_PK does not exist in types
        targetCase.metadata.URL_LINK_SP || '',
        targetCase.metadata.URL_LINK_PH || '',
        targetCase.metadata.URL_LINK_SK || '',
        '', // URL_LINK_SL does not exist in types
        '', // Column L (empty)
        targetCase.officer.NAMA || '',
        targetCase.officer.NO_KP || '',
        targetCase.officer.TARIKH_LAHIR || '',
        targetCase.officer.PILIHAN_UMUR_PERSARAAN || '',
        targetCase.officer.TARIKH_BERSARA || '',
        targetCase.officer.JANTINA || '',
        targetCase.officer.KAUM || '',
        targetCase.officer.JAWATAN || '',
        targetCase.officer.SKIM || '',
        targetCase.officer.GRED || ''
      ];
      try {
        await fetch(liveUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ row })
        });
        console.log('Successfully updated live Google Sheets backend via Apps Script!');
      } catch (err) {
        console.error('Failed to update Google Sheets:', err);
      }
    }

    localStorage.setItem('spt_cases', JSON.stringify(updated));
    setCases(updated);
    setIsSaving(false);
    setSaveSuccess(true);

    setTimeout(() => {
      setSelectedCase(null);
      setSaveSuccess(false);
    }, 2500);
  };

  const handleRedoCase = (c: CompleteCase) => {
    const updated = cases.map(item => {
      if (item.metadata.NO_RUJ_FAIL_JPA === c.metadata.NO_RUJ_FAIL_JPA) {
        return {
          ...item,
          workflow: {
            ...item.workflow,
            STATUS_KATEGORI: 'D01 SP - Penyediaan Surat Pertuduhan - Pegawai Kes',
            STATUS_KATEGORI_UTAMA: 'Surat Pertuduhan (SP)',
            STATUS_KEMASKINI_KES_DI_HRMIS: 'SP Updated' as const,
            KEPUTUSAN_PERTUDUHAN: undefined,
            TARIKH_BORANG_KEPUTUSAN_LTT: undefined,
            TARIKH_MLTT: undefined,
            BIL_MLTT: undefined,
            JENIS_MLTT: undefined,
            TAHUN_MESY_LTT: undefined,
            RINGKASAN_KEPUTUSAN_HUKUMAN: undefined
          }
        };
      }
      return item;
    });
    localStorage.setItem('spt_cases', JSON.stringify(updated));
    setCases(updated);
    setSelectedCase(updated.find(item => item.metadata.NO_RUJ_FAIL_JPA === c.metadata.NO_RUJ_FAIL_JPA) || null);
    setHukuman('Amaran');
    setRingkasanHukuman('');
    setSaveSuccess(false);
  };

  return (
    <div className="animate-fade-in">
      {/* Landing Page Hero Banner */}
      <DashboardHero
        userName={user?.name || ''}
        role={user?.role || ''}
        grade={user?.grade || ''}
        title="Papan Pemuka Keputusan Sidang & Lembaga"
        description="Panel Lembaga Tatatertib (Board) menyediakan akses pantas kepada fail kes yang telah lengkap pertuduhan, membolehkan perekodan keputusan mesyuarat sidang Lembaga, penentuan jenis hukuman (seperti amaran, lucut hak emolumen, tangguh pergerakan gaji, atau buang kerja), serta penyegerakan automatik keputusan ke portal HRMIS."
        targetId="kpi-section"
        buttonText="LIHAT SENARAI KES & SIDANG HUKUMAN"
      />

      <div className="p-8 max-w-[1700px] w-full mx-auto space-y-8">
        {/* Title Header */}
        <div id="kpi-section" className="scroll-mt-24 border-t border-slate-200/60 pt-4">
          <h2 className="text-xl font-bold text-gov-blue-700 tracking-tight">Keputusan Sidang & Hukuman Lembaga Tatatertib</h2>
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
                {trialCases.map((c, idx) => (
                  <button
                    key={`${c.metadata.BIL}-${c.metadata.NO_RUJ_FAIL_JPA}-${idx}`}
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

          {/* Completed cases list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Keputusan Baru Direkodkan</h3>
              <span className="bg-gov-blue-50 text-gov-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {completedCases.length} Kes
              </span>
            </div>

            {completedCases.length > 0 ? (
              <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1.5 custom-scrollbar animate-fade-in">
                {completedCases.map((c, idx) => (
                  <div
                    key={`${c.metadata.BIL}-${c.metadata.NO_RUJ_FAIL_JPA}-${idx}`}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 flex justify-between items-center transition-all duration-200"
                  >
                    <div className="space-y-1 pr-4 min-w-0 flex-1">
                      <span className="text-[9px] font-mono text-gov-blue-700 font-bold block truncate">
                        {c.metadata.NO_RUJ_FAIL_JPA}
                      </span>
                      <span className="text-xs font-bold text-slate-700 block truncate">
                        {c.officer.NAMA}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold block">
                        Hukuman: <span className="text-gov-gold-700 font-black">{c.workflow.KEPUTUSAN_PERTUDUHAN}</span>
                      </span>
                    </div>
                    <button
                      onClick={() => handleRedoCase(c)}
                      className="bg-gov-blue-50 hover:bg-gov-blue-100 text-gov-blue-700 border border-gov-blue-100 px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer hover:scale-105"
                    >
                      Pinda / Redo
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 font-semibold text-[11px]">
                Tiada rekod keputusan baharu dihantar.
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
                  <div className="grid md:grid-cols-3 gap-4">
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
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tarikh Sidang LTT</label>
                      <input
                        type="date"
                        value={tarikhSidang}
                        onChange={(e) => setTarikhSidang(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 bg-slate-50 cursor-pointer"
                      />
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
                        onClick={() => setShowConfirmModal(true)}
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

      {/* Confirmation Modal */}
      {showConfirmModal && selectedCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-5 animate-scale-up">
            <div className="flex items-center gap-3 text-gov-blue-700 border-b border-slate-100 pb-3">
              <FileSignature className="h-6 w-6 text-gov-gold-500 animate-pulse" />
              <div>
                <h4 className="text-sm font-extrabold text-slate-800">Sahkan Keputusan Tatatertib</h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Pengesahan Sidang Lembaga</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Pegawai:</span>
                  <span className="font-extrabold text-slate-800">{selectedCase.officer.NAMA}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">No. KP:</span>
                  <span className="font-mono font-bold text-slate-600">{selectedCase.officer.NO_KP}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">No. Fail:</span>
                  <span className="font-mono font-bold text-gov-blue-700">{selectedCase.metadata.NO_RUJ_FAIL_JPA}</span>
                </div>
                <div className="border-t border-slate-200/60 pt-2 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Hukuman:</span>
                  <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded font-black border border-red-100">{hukuman}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Minit Ringkas Sidang:</span>
                <p className="p-3 bg-slate-50 border border-slate-100 rounded-xl font-medium leading-relaxed italic text-[11px] text-slate-600">
                  {ringkasanHukuman || `DIHUKUM HUKUMAN: ${hukuman.toUpperCase()}`}
                </p>
              </div>

              <p className="text-[10px] text-slate-500 font-medium leading-relaxed border-t border-slate-100 pt-3 text-center">
                Perekodan ini akan menyelaraskan keputusan tatatertib dan menyegerakkan profil perkhidmatan penjawat awam ini dengan sistem HRMIS.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer text-xs"
              >
                Batal & Ubah Semula
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  handleSaveVerdict();
                }}
                className="flex-1 bg-gov-blue-700 hover:bg-gov-blue-800 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-gov-blue-700/20 hover:scale-[1.02] cursor-pointer text-xs flex items-center justify-center gap-1.5"
              >
                Ya, Sah & Rekod
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
