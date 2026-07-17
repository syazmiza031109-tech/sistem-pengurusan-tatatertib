'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { 
  Shield, Users, Key, LogOut, LayoutDashboard, 
  FilePlus2, ClipboardCheck, Bell, CircleUserRound,
  Menu, LineChart, Presentation, ChevronDown, AlertCircle
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
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  // Sidebar Links based on role
  const menuItems = [
    {
      title: 'Urus Setia (Admin)',
      role: 'Pegawai Kes',
      links: [
        { 
          name: 'Papan Pemuka Kes', 
          href: '/dashboard/admin', 
          icon: LayoutDashboard,
          subLinks: [
            { name: 'Ringkasan Utama', href: '/dashboard/admin' },
            { name: 'Tindakan Segera', href: '/dashboard/admin?filter=immediate' }
          ]
        },
        { 
          name: 'Senarai Kes', 
          href: '/dashboard/admin/cases', 
          icon: Users,
          subLinks: [
            { name: 'Semua Fail Kes', href: '/dashboard/admin/cases' },
            { name: 'Kes Fasa PP', href: '/dashboard/admin/cases?status=PP' },
            { name: 'Kes Fasa SP', href: '/dashboard/admin/cases?status=SP' }
          ]
        },
        { 
          name: 'Pengurusan Kes', 
          href: '/dashboard/admin/register', 
          icon: FilePlus2,
          subLinks: [
            { name: 'Penentuan Pengerusi', href: '/dashboard/admin/register', isSubHeader: true },
            { name: 'Pendaftaran Kes', href: '/dashboard/admin/register', isSubSubLink: true },
            { name: 'Surat Pertuduhan', href: '/dashboard/admin/register?tab=surat_petuduhan', isSubHeader: true },
            { name: 'Surat Pertuduhan', href: '/dashboard/admin/register?tab=surat_petuduhan', isSubSubLink: true }
          ]
        },
        { 
          name: 'Analitis Grafik', 
          href: '/dashboard/admin/analytics', 
          icon: LineChart,
          subLinks: [
            { name: 'Persaraan & KPI', href: '/dashboard/admin/analytics?tab=kpi' },
            { name: 'Taburan Demografi', href: '/dashboard/admin/analytics?tab=demografi' }
          ]
        },
        { name: 'Pembentangan Kes', href: '/dashboard/admin/presentation', icon: Presentation },
        { name: 'Daftar Pengguna', href: '/dashboard/admin/users', icon: Users, isSuperAdminOnly: true },
      ]
    }
  ];

  // Auto expand menu items containing active sub-links
  useEffect(() => {
    const newExpanded: Record<string, boolean> = {};
    menuItems.forEach(group => {
      group.links.forEach(link => {
        const isActive = pathname === link.href || link.subLinks?.some(sub => pathname === sub.href);
        if (isActive && link.subLinks) {
          newExpanded[link.name] = true;
        }
      });
    });
    setExpandedMenus(prev => ({ ...prev, ...newExpanded }));
  }, [pathname]);

  // Google Sheets Backend Integration states
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [gsheetUrl, setGsheetUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('spt_gsheet_url') || '';
    }
    return '';
  });

  const [showNotifications, setShowNotifications] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);

  const loadRequests = () => {
    // 1. Load registration requests (Super Admin only)
    const storedRegs = localStorage.getItem('spt_user_requests');
    let regList: any[] = [];
    if (storedRegs) {
      try {
        regList = JSON.parse(storedRegs) as any[];
        regList = regList.filter((r) => r.status === 'pending');
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Load permission requests (all users)
    const storedPerms = localStorage.getItem('spt_permission_requests');
    let permList: any[] = [];
    if (storedPerms && user) {
      try {
        const allPerms = JSON.parse(storedPerms) as any[];
        
        // Filter incoming requests where user is the assigned officer
        const cleanUserName = user.name.toLowerCase().replace(/puan|encik/g, '').replace(/\(.*\)/g, '').trim();
        const incoming = allPerms.filter(r => {
          if (r.status !== 'PENDING') return false;
          
          const cleanHandling = r.handlingPegawaiName.toLowerCase().trim();
          if (cleanHandling.includes(cleanUserName) || cleanUserName.includes(cleanHandling)) {
            return true;
          }
          if (r.handlingPegawaiEmail === user.email) {
            return true;
          }
          return false;
        }).map(r => ({ ...r, type: 'permission_incoming' }));

        // Filter outgoing requests that were approved/declined and not yet dismissed by this requestor
        const outgoing = allPerms.filter(r => 
          r.requestorEmail === user.email && 
          (r.status === 'APPROVED' || r.status === 'DECLINED') && 
          !r.dismissedByRequestor
        ).map(r => ({ ...r, type: 'permission_status_update' }));

        permList = [...incoming, ...outgoing];
      } catch (e) {
        console.error(e);
      }
    }

    // 3. Load Chairman Determination Tasks for the logged-in body
    let ppTaskList: any[] = [];
    if (user) {
      const storedCases = localStorage.getItem('spt_cases');
      if (storedCases) {
        try {
          const caseList = JSON.parse(storedCases) as any[];
          const pendingForUser = caseList.filter(c => 
            c.workflow && c.workflow.STATUS_KATEGORI_UTAMA === 'Penentuan Pengerusi' && c.workflow.CURRENT_PP_BODY === user.role
          );
          ppTaskList = pendingForUser.map(c => ({
            id: `pp-${c.metadata.NO_RUJ_FAIL_JPA}`,
            caseId: c.metadata.NO_RUJ_FAIL_JPA,
            officerName: c.officer.NAMA,
            type: 'pp_task',
            timestamp: new Date().toISOString()
          }));
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Combine notifications based on role
    const combined: any[] = [];
    if (user && (user.role === 'Super Admin' || user.isMaster)) {
      combined.push(...regList.map(r => ({ ...r, type: 'registration' })));
    }
    combined.push(...permList);
    combined.push(...ppTaskList);
    setRequests(combined);
  };

  const handleApprovePermission = (reqId: string) => {
    const stored = localStorage.getItem('spt_permission_requests');
    if (stored) {
      const list = JSON.parse(stored) as any[];
      const req = list.find(r => r.id === reqId);
      if (req) {
        const approvedAt = new Date().toISOString();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        
        const updated = list.map(r => r.id === reqId ? {
          ...r,
          status: 'APPROVED',
          approvedAt,
          expiresAt,
          dismissedByRequestor: false
        } : r);
        localStorage.setItem('spt_permission_requests', JSON.stringify(updated));

        // Create simulated email in logs
        const emailLogsRaw = localStorage.getItem('spt_email_logs');
        const emailLogs = emailLogsRaw ? JSON.parse(emailLogsRaw) : [];
        emailLogs.unshift({
          id: Date.now(),
          recipient: req.requestorEmail,
          subject: `[SPT JPA] Kelulusan Kebenaran Mengakses Fail Kes: ${req.caseId}`,
          body: `Assalamualaikum / Salam Sejahtera,\n\nPermohonan anda untuk mengakses dan meminda fail kes bagi ${req.caseOfficerName} (Fail: ${req.caseId}) telah DILULUSKAN oleh Pegawai Kes assigned (${user?.name}).\n\nKebenaran ini aktif untuk tempoh 24 JAM dan akan tamat secara automatik pada: ${new Date(expiresAt).toLocaleString('ms-MY')}.\n\nHak Cipta Urus Setia Tatatertib JPA.`,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('spt_email_logs', JSON.stringify(emailLogs));
      }
    }
    loadRequests();
    window.dispatchEvent(new CustomEvent('spt_permission_changed'));
  };

  const handleDeclinePermission = (reqId: string) => {
    const stored = localStorage.getItem('spt_permission_requests');
    if (stored) {
      const list = JSON.parse(stored) as any[];
      const req = list.find(r => r.id === reqId);
      if (req) {
        const updated = list.map(r => r.id === reqId ? {
          ...r,
          status: 'DECLINED',
          dismissedByRequestor: false
        } : r);
        localStorage.setItem('spt_permission_requests', JSON.stringify(updated));

        // Create simulated email in logs
        const emailLogsRaw = localStorage.getItem('spt_email_logs');
        const emailLogs = emailLogsRaw ? JSON.parse(emailLogsRaw) : [];
        emailLogs.unshift({
          id: Date.now(),
          recipient: req.requestorEmail,
          subject: `[SPT JPA] Permohonan Izin Edit Fail Kes DITOLAK: ${req.caseId}`,
          body: `Assalamualaikum / Salam Sejahtera,\n\nDukacita dimaklumkan bahawa permohonan anda untuk mengakses fail kes ${req.caseOfficerName} (Fail: ${req.caseId}) telah DITOLAK oleh Pegawai Kes assigned (${user?.name}).\n\nHak Cipta Urus Setia Tatatertib JPA.`,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('spt_email_logs', JSON.stringify(emailLogs));
      }
    }
    loadRequests();
    window.dispatchEvent(new CustomEvent('spt_permission_changed'));
  };

  const handleDismissStatusUpdate = (reqId: string) => {
    const stored = localStorage.getItem('spt_permission_requests');
    if (stored) {
      const list = JSON.parse(stored) as any[];
      const updated = list.map(r => r.id === reqId ? { ...r, dismissedByRequestor: true } : r);
      localStorage.setItem('spt_permission_requests', JSON.stringify(updated));
    }
    loadRequests();
    window.dispatchEvent(new CustomEvent('spt_permission_changed'));
  };

  useEffect(() => {
    loadRequests();
    window.addEventListener('storage', loadRequests);
    window.addEventListener('storage_updated', loadRequests);
    window.addEventListener('spt_permission_changed', loadRequests);
    const interval = setInterval(loadRequests, 3500);
    return () => {
      window.removeEventListener('storage', loadRequests);
      window.removeEventListener('storage_updated', loadRequests);
      window.removeEventListener('spt_permission_changed', loadRequests);
      clearInterval(interval);
    };
  }, [user?.email]);

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
            let existingPPBody = existing.workflow.CURRENT_PP_BODY;
            if (existing.workflow.STATUS_KATEGORI_UTAMA === 'Penentuan Pengerusi' && !existingPPBody) {
              existingPPBody = 'Pegawai Kes';
              updated = true;
            }
            // Check if updates are needed (e.g. changed retirement date, jaws, ulasan)
            if (
              existing.officer.TARIKH_BERSARA !== initCase.officer.TARIKH_BERSARA ||
              existing.details.ULASAN_URUS_SETIA !== initCase.details.ULASAN_URUS_SETIA ||
              existing.officer.JAWATAN !== initCase.officer.JAWATAN ||
              existing.officer.NEGERI !== initCase.officer.NEGERI ||
              existing.metadata.URL_LINK_PP !== initCase.metadata.URL_LINK_PP ||
              existing.workflow.CURRENT_PP_BODY !== existingPPBody
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
                  PEGAWAI_KES: initCase.workflow.PEGAWAI_KES,
                  CURRENT_PP_BODY: existingPPBody
                }
              };
            }
            return existing;
          }
          updated = true;
          return {
            ...initCase,
            workflow: {
              ...initCase.workflow,
              CURRENT_PP_BODY: initCase.workflow.STATUS_KATEGORI_UTAMA === 'Penentuan Pengerusi' ? 'Pegawai Kes' : undefined
            }
          };
        });

        // Add any user-registered cases that do not match the standard mock KPs
        parsed.forEach(p => {
          if (!INITIAL_CASES.some(i => i.officer.NO_KP === p.officer.NO_KP)) {
            if (p.workflow.STATUS_KATEGORI_UTAMA === 'Penentuan Pengerusi' && !p.workflow.CURRENT_PP_BODY) {
              p.workflow.CURRENT_PP_BODY = 'Pegawai Kes';
              updated = true;
            }
            merged.push(p);
          }
        });

        if (updated || parsed.length !== merged.length) {
          localStorage.setItem('spt_cases', JSON.stringify(merged));
          window.dispatchEvent(new Event('storage_updated'));
        }
      } catch {
        const seeded = INITIAL_CASES.map(c => {
          if (c.workflow.STATUS_KATEGORI_UTAMA === 'Penentuan Pengerusi' && !c.workflow.CURRENT_PP_BODY) {
            return {
              ...c,
              workflow: {
                ...c.workflow,
                CURRENT_PP_BODY: 'Pegawai Kes' as const
              }
            };
          }
          return c;
        });
        localStorage.setItem('spt_cases', JSON.stringify(seeded));
        window.dispatchEvent(new Event('storage_updated'));
      }
    } else {
      const seeded = INITIAL_CASES.map(c => {
        if (c.workflow.STATUS_KATEGORI_UTAMA === 'Penentuan Pengerusi' && !c.workflow.CURRENT_PP_BODY) {
          return {
            ...c,
            workflow: {
              ...c.workflow,
              CURRENT_PP_BODY: 'Pegawai Kes' as const
            }
          };
        }
        return c;
      });
      localStorage.setItem('spt_cases', JSON.stringify(seeded));
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

  const isGovBody = user ? ['Pegawai Kes', 'KPP', 'TPB(K)OA', 'TPB(K)O', 'Urus Setia', 'PBK', 'TKPPA(P)', 'KPPA', 'KSN'].includes(user.role) : false;

  const filteredMenuItems = menuItems.map(group => {
    const filteredLinks = group.links.filter(link => {
      const anyLink = link as any;
      if (anyLink.isSuperAdminOnly) {
        return user.role === 'Super Admin' || user.isMaster;
      }
      return true;
    });
    return { ...group, links: filteredLinks };
  }).filter(group => {
    if (user.role === 'Super Admin' || user.isMaster) return true;
    if (group.role === 'Pegawai Kes' && isGovBody) return true;
    return group.role === user.role;
  });

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#f8fafc] font-sans">
      <header className="h-20 bg-slate-900 flex items-center justify-between px-8 z-40 shrink-0 relative">
        {/* Continual moving gradient wave bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-gov-blue-600 via-gov-gold-400 to-gov-blue-600 animate-shimmer-wave"></div>
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border border-slate-700 p-0.5 shrink-0 overflow-hidden">
            <img src="/jpa-logo.png" alt="JPA Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight block">Sistem SPT JPA</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-gov-gold-500">Portal Pengurusan</span>
          </div>
        </div>

        {/* Center: Top Level Menu Bar */}
        <nav className="flex items-center gap-2 h-full">
          {filteredMenuItems.map((group) =>
            group.links.map((link) => {
              const Icon = link.icon;
              const isMainActive = pathname === link.href || link.subLinks?.some(sub => pathname === sub.href);
              const hasSubLinks = !!link.subLinks && link.subLinks.length > 0;

              return (
                <div key={link.href} className="relative h-20 flex items-center">
                  <Link
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isMainActive
                        ? 'bg-gov-gold-500 text-gov-blue-900 shadow-md shadow-gov-gold-500/20 font-bold'
                        : 'hover:bg-slate-800 hover:text-white text-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.name}</span>
                  </Link>
                </div>
              );
            })
          )}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          
          {/* User Profile Badge */}
          <Link 
            href="/dashboard/profile"
            className="bg-gov-blue-900/60 border border-slate-800 flex items-center hover:bg-gov-blue-850 hover:border-slate-700 transition-all duration-200 cursor-pointer p-2.5 rounded-xl gap-2.5"
          >
            <div className="h-7 w-7 rounded-full bg-gov-blue-800 flex items-center justify-center shrink-0 border border-slate-700">
              <CircleUserRound className="h-4 w-4 text-gov-gold-400" />
            </div>
            <div className="text-left hidden md:block">
              <span className="text-[11px] font-bold text-white block truncate max-w-[120px]">{user.name}</span>
              <span className="text-[9px] text-slate-500 block truncate max-w-[120px] font-medium">{user.department}</span>
            </div>
          </Link>

          {/* User Role Tag */}
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold bg-slate-850 border border-slate-800 px-3 py-2 rounded-xl text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span className="uppercase tracking-wider">{user.role}</span>
          </div>

          {/* Gred Indicator */}
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold bg-slate-850 border border-slate-800 px-3 py-2 rounded-xl text-slate-400">
            <span>Gred:</span>
            <span className="text-gov-gold-400 font-mono font-black">{user.grade}</span>
          </div>

          {/* Notification Bell (Visible for all logged-in users) */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`h-10 w-10 border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${requests.length > 0 ? 'animate-shake' : ''}`}
              >
                <Bell className="h-4.5 w-4.5" />
                {requests.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-slate-900 animate-pulse">
                    {requests.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 space-y-3 z-50 text-left text-xs font-semibold animate-scale-up">
                  <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                    <span className="font-extrabold text-slate-800">Notifikasi Portal</span>
                    <span className="text-[9px] bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Masa Nyata</span>
                  </div>

                  <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                    {requests.length === 0 ? (
                      <p className="text-slate-405 font-bold text-center py-6 text-slate-400 text-[10px]">Tiada notifikasi baharu</p>
                    ) : (
                      requests.map((req) => {
                        if (req.type === 'registration') {
                          return (
                            <div key={req.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2.5">
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-slate-400 font-bold block">Pendaftaran Akaun Baharu</span>
                                <span className="text-slate-850 font-extrabold block truncate text-slate-800">{req.email}</span>
                                <span className="text-[8px] text-slate-400 font-mono block">Masa: {new Date(req.timestamp).toLocaleString('ms-MY')}</span>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    const stored = localStorage.getItem('spt_user_requests');
                                    if (stored) {
                                      const list = JSON.parse(stored) as any[];
                                      const updated = list.map(r => r.id === req.id ? { ...r, status: 'rejected' } : r);
                                      localStorage.setItem('spt_user_requests', JSON.stringify(updated));
                                    }
                                    const emailLogsRaw = localStorage.getItem('spt_email_logs');
                                    const emailLogs = emailLogsRaw ? JSON.parse(emailLogsRaw) : [];
                                    emailLogs.unshift({
                                      id: Date.now(),
                                      recipient: req.email,
                                      subject: 'Permohonan Pendaftaran Akaun Ditolak',
                                      body: `Dukacita dimaklumkan bahawa permohonan pendaftaran akaun anda untuk emel ${req.email} telah ditolak oleh Pentadbir. Sila hubungi urus setia JPA untuk maklumat lanjut.`,
                                      timestamp: new Date().toISOString()
                                    });
                                    localStorage.setItem('spt_email_logs', JSON.stringify(emailLogs));
                                    loadRequests();
                                  }}
                                  className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-750 font-extrabold rounded-lg text-[10px] transition-all cursor-pointer text-center text-red-700"
                                >
                                  Tolak
                                </button>
                                <button
                                  onClick={() => {
                                    const stored = localStorage.getItem('spt_user_requests');
                                    if (stored) {
                                      const list = JSON.parse(stored) as any[];
                                      const updated = list.map(r => r.id === req.id ? { ...r, status: 'approved' } : r);
                                      localStorage.setItem('spt_user_requests', JSON.stringify(updated));
                                    }
                                    const emailLogsRaw = localStorage.getItem('spt_email_logs');
                                    const emailLogs = emailLogsRaw ? JSON.parse(emailLogsRaw) : [];
                                    emailLogs.unshift({
                                      id: Date.now(),
                                      recipient: req.email,
                                      subject: 'Permohonan Pendaftaran Akaun Diluluskan',
                                      body: `Tahniah! Permohonan pendaftaran akaun anda untuk emel ${req.email} telah diluluskan. Akaun anda sedang dalam proses pendaftaran oleh Pentadbir di bawah fasa urus setia.`,
                                      timestamp: new Date().toISOString()
                                    });
                                    localStorage.setItem('spt_email_logs', JSON.stringify(emailLogs));
                                    loadRequests();
                                    setShowNotifications(false);
                                    router.push(`/dashboard/admin/users?email=${encodeURIComponent(req.email)}`);
                                  }}
                                  className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-lg text-[10px] transition-all cursor-pointer text-center"
                                >
                                  Luluskan
                                </button>
                              </div>
                            </div>
                          );
                        }

                        if (req.type === 'pp_task') {
                          return (
                            <div key={req.id} className="bg-purple-50 border border-purple-100 rounded-xl p-3 space-y-2 text-left">
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-purple-700 font-bold block">Tugasan Penentuan Pengerusi</span>
                                <span className="text-slate-800 font-extrabold block text-[11px] leading-tight text-purple-950">
                                  Sila semak & kemaskini kes {req.officerName} ({req.caseId})
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setShowNotifications(false);
                                  router.push(`/dashboard/admin/cases/${req.caseId}`);
                                }}
                                className="w-full py-1.5 bg-purple-750 hover:bg-purple-800 text-white font-extrabold rounded-lg text-[10px] transition-all cursor-pointer text-center"
                              >
                                Buka Sesi Pembentangan
                              </button>
                            </div>
                          );
                        }

                        if (req.type === 'permission_incoming') {
                          return (
                            <div key={req.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2.5">
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-amber-600 font-bold block">Permohonan Izin Edit Kes</span>
                                <span className="text-slate-800 font-extrabold block text-[11px] leading-tight">
                                  {req.requestorName} memohon untuk kes {req.caseOfficerName} ({req.caseId})
                                </span>
                                <span className="text-[8px] text-slate-400 font-mono block">Masa: {new Date(req.timestamp).toLocaleString('ms-MY')}</span>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleDeclinePermission(req.id)}
                                  className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-750 font-extrabold rounded-lg text-[10px] transition-all cursor-pointer text-center text-red-700"
                                >
                                  Tolak
                                </button>
                                <button
                                  onClick={() => handleApprovePermission(req.id)}
                                  className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-lg text-[10px] transition-all cursor-pointer text-center"
                                >
                                  Luluskan
                                </button>
                              </div>
                            </div>
                          );
                        }

                        if (req.type === 'permission_status_update') {
                          const isApproved = req.status === 'APPROVED';
                          return (
                            <div key={req.id} className={`border rounded-xl p-3 space-y-2 ${isApproved ? 'bg-emerald-50/50 border-emerald-100 text-emerald-950' : 'bg-red-50/50 border-red-100 text-red-950'}`}>
                              <div className="space-y-0.5">
                                <span className={`text-[10px] font-bold block ${isApproved ? 'text-emerald-600' : 'text-red-650'}`}>
                                  Permohonan Izin Edit {isApproved ? 'Diluluskan' : 'Ditolak'}
                                </span>
                                <p className="text-[10px] leading-tight font-medium text-slate-700">
                                  Permohonan anda untuk meminda fail kes bagi <strong>{req.caseOfficerName}</strong> ({req.caseId}) telah {isApproved ? 'diluluskan untuk 24 jam' : 'ditolak'}.
                                </p>
                              </div>
                              <button
                                onClick={() => handleDismissStatusUpdate(req.id)}
                                className="w-full py-1 text-center bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 cursor-pointer transition-colors"
                              >
                                Ketahui / Tutup
                              </button>
                            </div>
                          );
                        }

                        return null;
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Log Out button */}
          <button
            onClick={logout}
            title="Log Keluar Sesi"
            className="h-10 w-10 border border-slate-800 bg-slate-900 hover:bg-red-950/20 hover:border-red-900 hover:text-red-400 text-slate-400 rounded-xl flex items-center justify-center transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

      </header>

      <main className="flex-1 overflow-y-auto flex flex-col justify-between min-w-0">
        {pathname === '/dashboard/admin' || pathname === '/dashboard/management' || pathname === '/dashboard/executive' || pathname === '/dashboard/admin/users' ? (
          <div className="animate-fade-in flex-1 min-w-0">
            {children}
          </div>
        ) : (
          <div className="p-8 max-w-[1700px] w-full mx-auto animate-fade-in flex-1 min-w-0">
            {children}
          </div>
        )}
        
        {/* Government Footer */}
        <footer className="w-full bg-slate-900 text-slate-400 py-4 px-8 text-left text-xs font-semibold tracking-wide shrink-0 border-t border-slate-800">
          <div className="max-w-[1700px] mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>Hak Cipta Terpelihara <strong className="font-extrabold text-gov-gold-400">Jabatan Perkhidmatan Awam</strong> &copy; 2026</span>
            <span className="text-[10px] text-slate-500 font-medium">Sistem Pengurusan Tatatertib (SPT) v1.2.0</span>
          </div>
        </footer>
      </main>

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
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Handle Profile Update
    if (data.action === "update_profile") {
      var sheet = ss.getSheetByName("Pengguna") || ss.getSheetByName("Users") || ss.getSheets()[0];
      var rows = sheet.getDataRange().getValues();
      var foundIndex = -1;
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][2] == data.user.noKp) { // Column C (Index 2) is NO_KP
          foundIndex = i + 1;
          break;
        }
      }
      var profileRow = [data.user.name, data.user.email, data.user.noKp, data.user.department, data.user.grade];
      if (foundIndex > -1) {
        sheet.getRange(foundIndex, 1, 1, profileRow.length).setValues([profileRow]);
      } else {
        sheet.appendRow(profileRow);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, action: "update_profile" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. Handle Surat Pertuduhan
    if (data.action === "surat_pertuduhan") {
      var sheet = ss.getSheetByName("Surat Pertuduhan") || ss.getSheetByName("Letters") || ss.getSheets()[0];
      var letterRow = [data.caseId, data.refNo, data.letterDate, data.officerName, data.officerKp, data.chargeDetails];
      sheet.appendRow(letterRow);
      return ContentService.createTextOutput(JSON.stringify({ success: true, action: "surat_pertuduhan" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. Handle Case Row sync (Default)
    if (data.row) {
      var sheet = ss.getSheetByName("Senarai Kes") || ss.getSheets()[0];
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
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Invalid action or payload" })).setMimeType(ContentService.MimeType.JSON);
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
