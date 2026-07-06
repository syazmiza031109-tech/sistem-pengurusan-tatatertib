'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { 
  Shield, Users, Key, LogOut, LayoutDashboard, 
  FilePlus2, ClipboardCheck, Bell, CircleUserRound,
  Menu, LineChart, Presentation
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { INITIAL_CASES } from '@/lib/mock-data';
import { CompleteCase } from '@/lib/types';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Google Sheets Backend Integration states
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [gsheetUrl, setGsheetUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('spt_gsheet_url') || '';
    }
    return '';
  });

  // Redirect to landing page if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Central Mock Data Merging and Synchronization
  useEffect(() => {
    const stored = localStorage.getItem('spt_cases');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CompleteCase[];
        let updated = false;

        // Map and update existing mock cases to ensure they have correct retirement dates & details
        const merged = INITIAL_CASES.map(initCase => {
          const existing = parsed.find(c => c.officer.NO_KP === initCase.officer.NO_KP);
          if (existing) {
            // Check if updates are needed (e.g. changed retirement date, jaws, ulasan)
            if (
              existing.officer.TARIKH_BERSARA !== initCase.officer.TARIKH_BERSARA ||
              existing.details.ULASAN_URUS_SETIA !== initCase.details.ULASAN_URUS_SETIA ||
              existing.officer.JAWATAN !== initCase.officer.JAWATAN ||
              existing.officer.NEGERI !== initCase.officer.NEGERI ||
              existing.metadata.URL_LINK_PP !== initCase.metadata.URL_LINK_PP
            ) {
              updated = true;
              return {
                ...existing,
                metadata: {
                  ...existing.metadata,
                  URL_LINK_PP: initCase.metadata.URL_LINK_PP
                },
                officer: {
                  ...existing.officer,
                  TARIKH_BERSARA: initCase.officer.TARIKH_BERSARA,
                  NAMA: initCase.officer.NAMA,
                  JAWATAN: initCase.officer.JAWATAN,
                  GRED: initCase.officer.GRED,
                  NEGERI: initCase.officer.NEGERI,
                  KEMENTERIAN: initCase.officer.KEMENTERIAN
                },
                details: {
                  ...existing.details,
                  RINGKASAN_KESALAHAN: initCase.details.RINGKASAN_KESALAHAN,
                  ULASAN_URUS_SETIA: initCase.details.ULASAN_URUS_SETIA
                },
                workflow: {
                  ...existing.workflow,
                  STATUS_KATEGORI: initCase.workflow.STATUS_KATEGORI,
                  STATUS_KATEGORI_UTAMA: initCase.workflow.STATUS_KATEGORI_UTAMA,
                  TARIKH_TERIMA_PERAKUAN: initCase.workflow.TARIKH_TERIMA_PERAKUAN,
                  TARIKH_SERAHAN_KEPADA_PEGAWAI_KES: initCase.workflow.TARIKH_SERAHAN_KEPADA_PEGAWAI_KES,
                  PEGAWAI_KES: initCase.workflow.PEGAWAI_KES
                }
              };
            }
            return existing;
          }
          updated = true;
          return initCase;
        });

        // Add any user-registered cases that do not match the standard mock KPs
        parsed.forEach(p => {
          if (!INITIAL_CASES.some(i => i.officer.NO_KP === p.officer.NO_KP)) {
            merged.push(p);
          }
        });

        if (updated || parsed.length !== merged.length) {
          localStorage.setItem('spt_cases', JSON.stringify(merged));
          window.dispatchEvent(new Event('storage_updated'));
        }
      } catch {
        localStorage.setItem('spt_cases', JSON.stringify(INITIAL_CASES));
        window.dispatchEvent(new Event('storage_updated'));
      }
    } else {
      localStorage.setItem('spt_cases', JSON.stringify(INITIAL_CASES));
      window.dispatchEvent(new Event('storage_updated'));
    }
  }, []);

  if (loading || !user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-gov-blue-700 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-slate-500">Mengesahkan Kredensial Pengguna...</span>
        </div>
      </div>
    );
  }

  // Sidebar Links based on role
  const menuItems = [
    {
      title: 'Urus Setia (Admin)',
      role: 'Pegawai Kes',
      links: [
        { name: 'Papan Pemuka Kes', href: '/dashboard/admin', icon: LayoutDashboard },
        { name: 'Senarai Kes', href: '/dashboard/admin/cases', icon: Users },
        { name: 'Pendaftaran Kes Baru', href: '/dashboard/admin/register', icon: FilePlus2 },
        { name: 'Analitis Grafik', href: '/dashboard/admin/analytics', icon: LineChart },
        { name: 'Pembentangan Kes', href: '/dashboard/admin/presentation', icon: Presentation },
      ]
    },
    {
      title: 'Pengarah (Management)',
      role: 'Pengarah',
      links: [
        { name: 'Kelulusan Kertas (PP)', href: '/dashboard/management', icon: ClipboardCheck },
      ]
    },
    {
      title: 'Lembaga Tatatertib (Executive)',
      role: 'Lembaga Tatatertib',
      links: [
        { name: 'Persidangan & Hukuman', href: '/dashboard/executive', icon: Key },
      ]
    }
  ];

  const filteredMenuItems = menuItems.filter(group => {
    if (user.role === 'Super Admin' || user.isMaster) return true;
    return group.role === user.role;
  });

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-[#f8fafc] font-sans">
      {/* Sidebar Panel */}
      <aside className={`h-full dark-glass-panel text-slate-300 flex flex-col justify-between shrink-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
        <div>
          {/* Logo Brand */}
          <div className={`h-20 border-b border-slate-800 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-6'}`}>
            <div className="h-9 w-9 bg-gov-blue-800 rounded-lg flex items-center justify-center border border-slate-700 shrink-0">
              <Shield className="h-5 w-5 text-gov-gold-400" />
            </div>
            {!isCollapsed && (
              <div className="animate-fade-in">
                <span className="text-sm font-bold text-white tracking-tight block">Sistem SPT JPA</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-gov-gold-500">Portal Pengurusan</span>
              </div>
            )}
          </div>
 
          {/* Nav Items */}
          <div className="p-4 space-y-6">
            {filteredMenuItems.map((group, idx) => (
              <div key={idx} className="space-y-1.5">
                {!isCollapsed && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 animate-fade-in block">
                    {group.title}
                  </span>
                )}
                <div className="space-y-0.5">
                  {group.links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        title={isCollapsed ? link.name : undefined}
                        className={`w-full flex items-center transition-all duration-200 ${
                          isCollapsed ? 'justify-center p-2.5 rounded-xl mx-auto w-12 h-10' : 'gap-3 px-3.5 py-2.5 rounded-xl'
                        } text-xs font-semibold tracking-wide ${
                          isActive 
                            ? 'bg-gov-gold-500 text-gov-blue-900 shadow-md shadow-gov-gold-500/20' 
                            : 'hover:bg-slate-800 hover:text-white text-slate-400'
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5 shrink-0" />
                        {!isCollapsed && <span className="animate-fade-in">{link.name}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar User Footer */}
        <div className={`p-4 border-t border-slate-800 space-y-4 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          <div 
            title={isCollapsed ? `${user.name} (${user.department})` : undefined}
            className={`bg-gov-blue-900/60 border border-slate-800 flex items-center ${
              isCollapsed ? 'p-2 rounded-xl justify-center w-12 h-10' : 'p-3.5 rounded-xl gap-3'
            }`}
          >
            <div className="h-9 w-9 rounded-full bg-gov-blue-800 flex items-center justify-center shrink-0 border border-slate-700">
              <CircleUserRound className="h-5 w-5 text-gov-gold-400" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1 animate-fade-in">
                <span className="text-xs font-bold text-white block truncate">{user.name}</span>
                <span className="text-[9px] text-slate-500 block truncate font-medium">{user.department}</span>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            title={isCollapsed ? 'Log Keluar Sesi' : undefined}
            className={`flex items-center justify-center border border-slate-800 hover:bg-red-950/20 hover:border-red-900 hover:text-red-400 text-slate-400 text-xs font-bold transition-all duration-200 cursor-pointer ${
              isCollapsed ? 'w-12 h-10 p-0 rounded-xl' : 'w-full gap-2.5 py-2.5 rounded-xl'
            }`}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="animate-fade-in">Log Keluar Sesi</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header navbar */}
        <header className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-8 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-10 w-10 rounded-xl hover:bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title={isCollapsed ? "Buka Menu" : "Tutup Menu"}
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Mod {user.role} Aktif
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Google Sheets Backend Sync Indicator */}
            <button
              onClick={() => setShowSetupModal(true)}
              title={gsheetUrl ? "Google Sheets Backend: AKTIF & LIVE. Klik untuk tetapan." : "Google Sheets Backend: SIMULASI SAHAJA. Klik untuk tetapan."}
              className={`h-10 px-3.5 rounded-xl flex items-center gap-2 text-[10px] font-extrabold transition-all cursor-pointer shadow-sm hover:scale-[1.02] border ${
                gsheetUrl 
                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800' 
                  : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
              }`}
            >
              <span className={`h-2 w-2 rounded-full shrink-0 ${gsheetUrl ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`}></span>
              <span className="uppercase tracking-wider">
                {gsheetUrl ? 'Sheets Backend Live' : 'Sheets Backend Offline'}
              </span>
            </button>

            {/* Notification mock */}
            <button className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 relative transition-colors cursor-pointer">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* Profile Dropdown badge */}
            <div className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-700">
              <span className="text-slate-400 font-medium">Gred:</span>
              <span className="bg-gov-blue-50 text-gov-blue-700 px-2 py-0.5 rounded font-mono">
                {user.grade}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable container */}
        <main className="flex-1 overflow-y-auto p-8 max-w-[1700px] w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

      {/* Google Sheets Connection Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-2xl space-y-5 animate-scale-up max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-3 text-emerald-700 border-b border-slate-100 pb-3 justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">Sambungan Google Sheets Live (Backend Mode)</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Penetapan Sambungan Web App Google Apps Script</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSetupModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] leading-relaxed text-amber-800 font-medium">
                💡 <strong>Info:</strong> Secara lalai, sistem ini menggunakan <strong>Mod Simulasi Offline</strong> untuk menunjukkan aliran kemasukan data. Anda boleh menyambungkannya terus ke Google Sheets anda secara LIVE menggunakan Google Apps Script dalam 1 minit.
              </div>

              <div className="space-y-2.5">
                <span className="font-bold text-slate-800 block text-xs">Langkah Penyediaan Live Connection:</span>
                <ol className="list-decimal list-inside space-y-2 text-slate-600 pl-1 leading-relaxed">
                  <li>Buka fail Google Sheets anda: <a href="https://docs.google.com/spreadsheets/d/1WoTd1AOQ-dDSYv9O3eSBzien1bVtGMvqE93i6AKW6o4/edit" target="_blank" rel="noopener noreferrer" className="text-gov-blue-700 font-bold underline">Live Data TT Fey</a>.</li>
                  <li>Pergi ke menu atas: <strong>Extensions &gt; Apps Script</strong>.</li>
                  <li>Padam semua kod sedia ada, dan tampal kod Apps Script di bawah:</li>
                </ol>

                <div className="bg-slate-900 rounded-2xl p-4 font-mono text-[9px] text-emerald-400 relative border border-slate-800 shadow-inner">
                  <span className="absolute top-2 right-3 text-[8px] text-slate-500 uppercase font-sans font-bold">Google Apps Script</span>
                  <pre className="overflow-x-auto leading-relaxed">{`function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Senarai Kes") || SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var rows = sheet.getDataRange().getValues();
    var kpToFind = data.row[13]; // Column N (Index 13) is NO. K.P.
    var foundIndex = -1;
    
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][13] == kpToFind) {
        foundIndex = i + 1;
        break;
      }
    }
    
    if (foundIndex > -1) {
      sheet.getRange(foundIndex, 1, 1, data.row.length).setValues([data.row]);
    } else {
      sheet.appendRow(data.row);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true, updated: foundIndex > -1 })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`}</pre>
                </div>

                <ol start={4} className="list-decimal list-inside space-y-2 text-slate-600 pl-1 leading-relaxed">
                  <li>Klik butang <strong>Deploy &gt; New Deployment</strong> di atas.</li>
                  <li>Pilih jenis (Gear icon): <strong>Web App</strong>.</li>
                  <li>Tetapkan <strong>Execute as:</strong> <span className="font-bold">Me (syazmiza031109@gmail.com)</span>.</li>
                  <li>Tetapkan <strong>Who has access:</strong> <span className="font-bold text-red-600">Anyone</span> (supaya aplikasi web boleh menghantar permohonan API).</li>
                  <li>Klik <strong>Deploy</strong>, luluskan keizinan akaun Google anda jika diminta, kemudian salin <strong>Web App URL</strong> yang dihasilkan.</li>
                </ol>
              </div>

              <div className="space-y-1.5 border-t border-slate-100 pt-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Tampal Web App URL Di Sini:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={gsheetUrl}
                    onChange={(e) => setGsheetUrl(e.target.value)}
                    placeholder="Contoh: https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-slate-50 font-mono text-[10px]"
                  />
                  {gsheetUrl && (
                    <button
                      onClick={() => {
                        setGsheetUrl('');
                        localStorage.removeItem('spt_gsheet_url');
                      }}
                      className="px-3 bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 font-medium">Sistem akan secara automatik membuat panggilan POST ke URL ini setiap kali fail kes didaftarkan atau keputusan lembaga direkodkan.</p>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-150">
              <button
                onClick={() => setShowSetupModal(false)}
                className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (gsheetUrl.trim()) {
                    localStorage.setItem('spt_gsheet_url', gsheetUrl.trim());
                  } else {
                    localStorage.removeItem('spt_gsheet_url');
                  }
                  setShowSetupModal(false);
                  window.location.reload();
                }}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-emerald-700/20 hover:scale-[1.02] cursor-pointer text-xs"
              >
                Simpan & Aktifkan Live Sync
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
