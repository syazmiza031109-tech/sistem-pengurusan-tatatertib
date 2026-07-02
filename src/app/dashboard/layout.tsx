'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { 
  Shield, Users, ShieldAlert, Key, LogOut, LayoutDashboard, 
  FilePlus2, ClipboardCheck, Settings, Bell, CircleUserRound 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

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
        { name: 'Pendaftaran Kes Baru', href: '/dashboard/admin/register', icon: FilePlus2 },
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
    <div className="flex-1 flex min-h-screen bg-[#f8fafc] font-sans">
      {/* Sidebar Panel */}
      <aside className="w-72 dark-glass-panel text-slate-300 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Brand */}
          <div className="h-20 border-b border-slate-800 flex items-center gap-3 px-6">
            <div className="h-9 w-9 bg-gov-blue-800 rounded-lg flex items-center justify-center border border-slate-700">
              <Shield className="h-5 w-5 text-gov-gold-400" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight block">Sistem SPT JPA</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-gov-gold-500">Portal Pengurusan</span>
            </div>
          </div>
 
          {/* Nav Items */}
          <div className="p-4 space-y-6">
            {filteredMenuItems.map((group, idx) => (
              <div key={idx} className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3">
                  {group.title}
                </span>
                <div className="space-y-0.5">
                  {group.links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                          isActive 
                            ? 'bg-gov-gold-500 text-gov-blue-900 shadow-md shadow-gov-gold-500/20' 
                            : 'hover:bg-slate-800 hover:text-white text-slate-400'
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5 shrink-0" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar User Footer */}
        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="bg-gov-blue-900/60 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gov-blue-800 flex items-center justify-center shrink-0 border border-slate-700">
              <CircleUserRound className="h-5 w-5 text-gov-gold-400" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white block truncate">{user.name}</span>
              <span className="text-[9px] text-slate-500 block truncate font-medium">{user.department}</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-slate-800 hover:bg-red-950/20 hover:border-red-900 hover:text-red-400 text-slate-400 text-xs font-bold transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Log Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header navbar */}
        <header className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-8 z-30">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Mod {user.role} Aktif
            </span>
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
