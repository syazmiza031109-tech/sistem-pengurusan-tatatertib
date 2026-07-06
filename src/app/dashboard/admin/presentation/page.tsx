'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CompleteCase } from '@/lib/types';
import { INITIAL_CASES } from '@/lib/mock-data';
import { 
  Presentation, Database, Folder, ExternalLink, 
  FolderGit2, CircleUser, Search
} from 'lucide-react';

const getEmbedUrl = (url: string | undefined) => {
  if (!url) return '';
  if (url.includes('drive.google.com/file/d/')) {
    return url.replace(/\/view\??.*/, '/preview');
  }
  // Keep/use the /edit path for Google Slides to preserve speaker notes and reviewer comments layout
  if (url.includes('docs.google.com/presentation/d/')) {
    if (url.includes('/embed')) {
      return url.replace('/embed', '/edit');
    }
    return url;
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
  const [emailInput, setEmailInput] = useState<string>('syazmiza031109@gmail.com');
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  const [showOneTap, setShowOneTap] = useState(false);

  useEffect(() => {
    if (!connectedEmail) {
      const timer = setTimeout(() => {
        setShowOneTap(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [connectedEmail]);

  // Searchable dropdown state variables & ref
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCasesForSelect = cases.filter(c => {
    const term = dropdownSearch.toLowerCase();
    return (
      c.metadata.NO_RUJ_FAIL_JPA.toLowerCase().includes(term) ||
      c.officer.NAMA.toLowerCase().includes(term) ||
      c.officer.NO_KP.toLowerCase().includes(term) ||
      c.workflow.STATUS_KATEGORI_UTAMA.toLowerCase().includes(term)
    );
  });

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
    <div className="relative space-y-6 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
      {/* Google One Tap Auto-Detect Overlay */}
      {showOneTap && !connectedEmail && (
        <div className="absolute top-0 right-4 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 w-[310px] z-50 animate-fade-in space-y-3 font-sans border-t-4 border-t-gov-blue-700">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.06-1.18-.35-1.69-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">Akaun Google Dikesan</span>
            </div>
            <button 
              onClick={() => setShowOneTap(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold shrink-0 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1">
            <h5 className="text-[11px] font-extrabold text-slate-800">Autentikasi Profil Google Chrome</h5>
            <p className="text-[9px] text-slate-500 font-medium">Portal tatatertib mengesan sesi aktif anda:</p>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl flex items-center gap-3 border border-slate-100">
            <div className="h-8 w-8 rounded-full bg-orange-700 text-white font-extrabold text-xs flex items-center justify-center border border-slate-200 shadow-inner">
              N
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-extrabold text-slate-800 block">Syazmiza</span>
              <span className="text-[10px] text-slate-500 block truncate font-mono">syazmiza031109@gmail.com</span>
            </div>
          </div>
          <button
            onClick={() => {
              setConnectedEmail('syazmiza031109@gmail.com');
              setEmailInput('syazmiza031109@gmail.com');
              setShowOneTap(false);
            }}
            className="w-full py-2 bg-gov-blue-700 hover:bg-gov-blue-800 text-white text-xs font-extrabold rounded-xl transition-all shadow hover:scale-[1.02] cursor-pointer"
          >
            Sahkan sebagai syazmiza031109
          </button>
        </div>
      )}

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
              <span className="text-xs text-slate-500 font-bold shrink-0">Cari & Pilih Fail Kes:</span>
              <div className="relative w-[320px] md:w-[420px]" ref={dropdownRef}>
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder={activeCase ? `${activeCase.metadata.NO_RUJ_FAIL_JPA} - ${activeCase.officer.NAMA}` : "Cari fail kes..."}
                    value={dropdownSearch}
                    onChange={(e) => {
                      setDropdownSearch(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full px-3.5 py-2 pr-10 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all bg-slate-50 text-slate-700 placeholder-slate-700 font-sans"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400">
                    <Search className="h-4 w-4" />
                  </div>
                </div>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto custom-scrollbar p-1.5 space-y-1 animate-fade-in">
                    {filteredCasesForSelect.length > 0 ? (
                      filteredCasesForSelect.map((c) => (
                        <button
                          type="button"
                          key={c.metadata.NO_RUJ_FAIL_JPA}
                          onClick={() => {
                            setSelectedCaseId(c.metadata.NO_RUJ_FAIL_JPA);
                            setDropdownSearch('');
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs flex flex-col gap-0.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                            selectedCaseId === c.metadata.NO_RUJ_FAIL_JPA ? 'bg-gov-blue-50/50 text-gov-blue-800 font-bold' : 'text-slate-700'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="font-extrabold text-[11px] truncate">{c.metadata.NO_RUJ_FAIL_JPA}</span>
                            <span className="text-[8px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase shrink-0">{c.workflow.STATUS_KATEGORI_UTAMA}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-0.5 font-medium w-full">
                            <span className="truncate font-bold text-slate-600">{c.officer.NAMA}</span>
                            <span className="font-mono text-[9px] shrink-0">KP: {c.officer.NO_KP}</span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-400 text-xs font-semibold">
                        Tiada fail kes sepadan
                      </div>
                    )}
                  </div>
                )}
              </div>
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
                    Sesi pembentangan di atas disegerakkan melalui Single-Sign-On (SSO) Google Workspace. Slaid dimuatkan dalam mod ulasan & editor (/edit) untuk membolehkan semakan Nota Pembentang (Speaker Notes) di bawah slaid serta kolaborasi ulasan (Reviewer Comments) secara langsung.
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
