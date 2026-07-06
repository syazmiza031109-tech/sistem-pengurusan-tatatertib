'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { 
  Shield, Users, Key, LogOut, LayoutDashboard, 
  FilePlus2, ClipboardCheck, Bell, CircleUserRound,
  Menu, LineChart
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
              existing.officer.NEGERI !== initCase.officer.NEGERI
            ) {
              updated = true;
              return {
                ...existing,
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
    <div className="flex-1 flex h-screen overflow-hidden bg-[#f8fafc] font-sans">
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
        <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}

