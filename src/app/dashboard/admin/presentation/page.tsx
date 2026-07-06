'use client';

import React, { useState } from 'react';
import { CompleteCase } from '@/lib/types';
import { INITIAL_CASES } from '@/lib/mock-data';
import { 
  Presentation, Database, Folder, ExternalLink, 
  FolderGit2, CircleUser
} from 'lucide-react';

const getEmbedUrl = (url: string | undefined) => {
  if (!url) return '';
  if (url.includes('drive.google.com/file/d/')) {
    return url.replace(/\/view\??.*/, '/preview');
  }
  if (url.includes('docs.google.com/presentation/d/')) {
    return url.replace(/\/edit\??.*/, '/embed');
  }
  return url;
};

export default function PresentationPage() {
  const [cases, setCases] = useState<CompleteCase[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('spt_cases');
      return stored ? JSON.parse(stored) : INITIAL_CASES;
    }
    return INITIAL_CASES;
  });
  
  const [selectedCaseId, setSelectedCaseId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('spt_cases');
      const allCases = stored ? JSON.parse(stored) : INITIAL_CASES;
      return allCases.length > 0 ? allCases[0].metadata.NO_RUJ_FAIL_JPA : '';
    }
    return INITIAL_CASES.length > 0 ? INITIAL_CASES[0].metadata.NO_RUJ_FAIL_JPA : '';
  });
  
  // Google connectivity simulation states
  const [connectedEmail, setConnectedEmail] = useState<string>('');
  const [connectingEmail, setConnectingEmail] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('syazmiza0304@gmail.com');
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);

  const activeCase = cases.find(c => c.metadata.NO_RUJ_FAIL_JPA === selectedCaseId) || cases[0];

  const handleConnectGoogle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setConnectingEmail(true);
    setConnectionLogs([]);

    const logs = [
      'Menghubungi Pelayan Google Workspace JPA...',
      'Melakukan Pengesahan Token OAuth2...',
      `Menyemak akses bagi akaun: ${emailInput}...`,
      'Kebenaran Google Slides & Drive Diluluskan!'
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setConnectionLogs(prev => [...prev, `[OAuth] ${log}`]);
        if (index === logs.length - 1) {
          setTimeout(() => {
            setConnectedEmail(emailInput);
            setConnectingEmail(false);
          }, 600);
        }
      }, (index + 1) * 800);
    });
  };

  return (
    <div className="space-y-6 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-gov-blue-700 tracking-tight flex items-center gap-2.5">
          <Presentation className="h-6 w-6" />
          Pembentangan Kes Tatatertib
        </h2>
        <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mt-0.5">
          Portal Urus Setia & Pegawai Kes Tatatertib JPA
        </p>
      </div>

      {activeCase && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
          {/* Section Header with Case Selector */}
          <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <FolderGit2 className="h-5 w-5 text-gov-blue-700" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">Pembentangan Slaid & Dokumen Kes</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                  Pilih fail tatatertib untuk dipersembahkan
                </p>
              </div>
            </div>
            
            {/* Sibling dropdown selector */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-slate-500 font-bold">Pilih Fail Kes Tatatertib:</span>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all bg-slate-50 cursor-pointer text-slate-700"
              >
                {cases.map((c) => (
                  <option key={c.metadata.NO_RUJ_FAIL_JPA} value={c.metadata.NO_RUJ_FAIL_JPA}>
                    {c.metadata.NO_RUJ_FAIL_JPA} - {c.officer.NAMA} ({c.workflow.STATUS_KATEGORI_UTAMA})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-6 items-stretch">
            {/* Left Embed Panel */}
            <div className="md:col-span-8 space-y-4">
              {!connectedEmail ? (
                /* Simulated Google Auth Portal */
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-center space-y-4 flex flex-col items-center justify-center aspect-video shadow-inner">
                  <div className="h-12 w-12 rounded-full bg-gov-blue-50 text-gov-blue-700 flex items-center justify-center animate-pulse">
                    <Database className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800 font-sans">Uji Sambungan Google Slides Portal Tatatertib</h4>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
                      Sila hubungkan akaun Google Workspace JPA anda untuk memaparkan draf kertas cadangan slaid secara interaktif dalam sistem.
                    </p>
                  </div>
                  
                  {connectingEmail ? (
                    <div className="w-full max-w-xs bg-slate-900 text-left font-mono text-[9px] p-4 rounded-xl border border-slate-700 text-slate-300 space-y-1 shadow-md">
                      {connectionLogs.map((log, idx) => (
                        <p key={idx} className="animate-fade-in text-emerald-400">{log}</p>
                      ))}
                      <p className="text-gov-gold-400 animate-pulse mt-1">[Proses] Mengesahkan...</p>
                    </div>
                  ) : (
                    <form onSubmit={handleConnectGoogle} className="flex gap-2.5 max-w-md w-full justify-center">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="Masukkan emel Google Workspace"
                        className="px-4 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-gov-blue-500 bg-white min-w-[240px] font-bold text-slate-700"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gov-blue-700 hover:bg-gov-blue-800 text-white text-xs font-bold rounded-xl transition-all shadow cursor-pointer whitespace-nowrap hover:scale-[1.02]"
                      >
                        Hubung Google Account
                      </button>
                    </form>
                  )}
                </div>
              ) : activeCase.metadata.URL_LINK_PP ? (
                /* Embedded Google Slides Window */
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner w-full aspect-video">
                  <iframe
                    src={getEmbedUrl(activeCase.metadata.URL_LINK_PP)}
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              ) : (
                /* Slide Setup Fallback */
                <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-12 text-center space-y-3 flex flex-col items-center justify-center aspect-video">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Presentation className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">Pautan Slaid Tidak Hubung</h4>
                    <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1">Kes ini belum mempunyai pautan Google Slides (Kertas Makluman / Cadangan) berdaftar di JPA.</p>
                  </div>
                  <button
                    onClick={() => {
                      const updated = cases.map(c => {
                        if (c.metadata.NO_RUJ_FAIL_JPA === activeCase.metadata.NO_RUJ_FAIL_JPA) {
                          return {
                            ...c,
                            metadata: {
                              ...c.metadata,
                              URL_LINK_PP: 'https://docs.google.com/presentation/d/1t_z2l-Hsh9T-6XhG_9pS8fL9CgH-8rK9/edit'
                            }
                          };
                        }
                        return c;
                      });
                      localStorage.setItem('spt_cases', JSON.stringify(updated));
                      setCases(updated);
                    }}
                    className="px-3.5 py-2 bg-gov-blue-50 hover:bg-gov-blue-100 text-gov-blue-700 text-[10px] font-bold rounded-xl transition-all cursor-pointer border border-gov-blue-100"
                  >
                    Simulasi Hubungan Slaid JPA
                  </button>
                </div>
              )}
              
              <div className="p-4 bg-gov-blue-50/50 border border-gov-blue-100/50 rounded-2xl flex items-start gap-3">
                <Database className="h-4.5 w-4.5 text-gov-blue-700 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-gov-blue-900 block">Autentikasi Kredensial SSO Google Workspace</span>
                  <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                    Sesi pembentangan di atas disegerakkan dengan e-mel rasmi penjawat awam secara Single-Sign-On (SSO). Kebenaran membaca dan mengedit draf slaid adalah terikat kepada tetapan kebenaran Google Workspace & Drive rasmi anda.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Sidebar Info Panel */}
            <div className="md:col-span-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* Profile Widget */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center gap-3">
                  <div className="h-10 w-10 bg-gov-blue-50 border border-gov-blue-100 text-gov-blue-700 rounded-xl flex items-center justify-center shrink-0">
                    <CircleUser className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] text-slate-400 font-bold block">Pegawai Terlibat</span>
                    <span className="text-xs font-extrabold text-slate-800 block truncate">{activeCase.officer.NAMA}</span>
                    <span className="text-[9px] text-slate-400 font-mono block mt-0.5">KP: {activeCase.officer.NO_KP}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Fasa Kes Semasa</span>
                  <span className="text-xs font-extrabold text-slate-800 block mt-0.5">{activeCase.workflow.STATUS_KATEGORI_UTAMA}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Kertas Cadangan / Slaid MKSN</span>
                  <span className="text-xs font-bold text-slate-700 block mt-0.5">{activeCase.workflow.STATUS_DRAF_PP_DAN_SLAID_MKSN || 'Sedia Untuk Mesyuarat'}</span>
                </div>

                <div className="border-t border-slate-200/60 pt-4 space-y-3">
                  <span className="text-[10px] font-bold text-slate-800 block uppercase">Pautan Integrasi Luar</span>
                  <div className="space-y-1.5">
                    {activeCase.metadata.URL_LINK_GD && (
                      <a href={activeCase.metadata.URL_LINK_GD} target="_blank" rel="noreferrer" className="w-full flex items-center justify-between p-2.5 bg-white border border-slate-200 hover:border-gov-blue-500 hover:text-gov-blue-700 text-[10px] font-bold rounded-xl transition-all text-slate-600 group">
                        <span className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-amber-500" />
                          Folder Google Drive Fail Kes
                        </span>
                        <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-gov-blue-700" />
                      </a>
                    )}
                    {activeCase.metadata.URL_LINK_PP && (
                      <a href={activeCase.metadata.URL_LINK_PP} target="_blank" rel="noreferrer" className="w-full flex items-center justify-between p-2.5 bg-white border border-slate-200 hover:border-gov-blue-500 hover:text-gov-blue-700 text-[10px] font-bold rounded-xl transition-all text-slate-600 group">
                        <span className="flex items-center gap-2">
                          <Presentation className="h-4 w-4 text-gov-blue-700" />
                          Buka Google Slides Penuh
                        </span>
                        <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-gov-blue-700" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="border-t border-slate-200/60 pt-4 space-y-2">
                  <span className="text-[9px] text-slate-400 font-bold block">Status Sambungan Google:</span>
                  {connectedEmail ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-800 text-[10px] font-bold">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                        <span className="truncate">{connectedEmail}</span>
                      </div>
                      <button
                        onClick={() => setConnectedEmail('')}
                        className="w-full text-center text-[9px] font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
                      >
                        Putuskan Sambungan
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-[10px] text-slate-500 font-bold text-center">
                      Akaun Belum Dihubungkan
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200/60 pt-4 space-y-2">
                  <span className="text-[9px] text-slate-400 font-bold block">Urus Setia Kes Tatatertib:</span>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 flex items-center gap-2">
                    <div className="h-5 w-5 bg-gov-gold-100 text-gov-gold-800 rounded-full flex items-center justify-center font-bold text-[8px]">OA</div>
                    <span className="truncate">{activeCase.workflow.PEGAWAI_KES}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
