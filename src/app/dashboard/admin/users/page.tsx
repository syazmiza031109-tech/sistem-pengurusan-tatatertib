'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { 
  UserPlus, Shield, Mail, 
  CheckCircle2, AlertCircle 
} from 'lucide-react';

export default function UsersRegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-bold animate-pulse">Memuatkan Pendaftaran Pengguna...</div>}>
      <UsersRegisterContent />
    </Suspense>
  );
}

function UsersRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const { user } = useAuth();

  // Redirect if not super admin
  useEffect(() => {
    if (user && user.role !== 'Super Admin' && !user.isMaster) {
      router.push('/dashboard/admin');
    }
  }, [user, router]);

  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [noKp, setNoKp] = useState('');
  const [role, setRole] = useState<'Pegawai Kes' | 'Pengarah' | 'Lembaga Tatatertib' | 'Super Admin'>('Pegawai Kes');
  const [department, setDepartment] = useState('');
  const [grade, setGrade] = useState('');

  // Results State
  const [createdUser, setCreatedUser] = useState<any | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Simulated Email Logs State
  const [emailLogs, setEmailLogs] = useState<any[]>([]);

  // Load pre-filled email from parameter
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // Load Email Logs and Users from localStorage
  const loadEmailLogs = () => {
    if (typeof window !== 'undefined') {
      const logs = localStorage.getItem('spt_email_logs');
      if (logs) {
        try {
          setEmailLogs(JSON.parse(logs));
        } catch {
          setEmailLogs([]);
        }
      }
    }
  };

  useEffect(() => {
    loadEmailLogs();
    const interval = setInterval(loadEmailLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRegisterUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setCreatedUser(null);

    if (!fullName.trim() || !email.trim() || !noKp.trim() || !department.trim() || !grade.trim()) {
      setErrorMsg('Sila isi semua ruangan maklumat yang wajib.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMsg('Sila masukkan alamat emel yang sah.');
      return;
    }

    if (noKp.length !== 12) {
      setErrorMsg('No. KP mestilah mengandungi 12 digit nombor sahaja.');
      return;
    }

    // Check if user already exists
    const existingRaw = localStorage.getItem('spt_created_users');
    const existingList = existingRaw ? JSON.parse(existingRaw) : [];
    if (existingList.some((u: any) => u.email.trim().toLowerCase() === email.trim().toLowerCase() || u.noKp === noKp.trim())) {
      setErrorMsg('Pengguna dengan Emel atau No. KP ini sudah pun berdaftar di dalam pangkalan data.');
      return;
    }

    // Generate secure temporary password
    const tempPassword = `SPT@Temp${Math.floor(Math.random() * 9000) + 1000}`;

    const newUser = {
      id: Date.now(),
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      noKp: noKp.trim(),
      role,
      department: department.trim(),
      grade: grade.trim().toUpperCase(),
      password: tempPassword,
      createdDate: new Date().toISOString()
    };

    // Save to users database
    existingList.push(newUser);
    localStorage.setItem('spt_created_users', JSON.stringify(existingList));

    // Save email notification transmission log
    const emailLogsRaw = localStorage.getItem('spt_email_logs');
    const logs = emailLogsRaw ? JSON.parse(emailLogsRaw) : [];
    logs.unshift({
      id: Date.now(),
      recipient: email.trim().toLowerCase(),
      subject: 'Akaun Sistem SPT JPA Berjaya Dicipta',
      body: `Pendaftaran akaun anda di bawah peranan "${role}" telah selesai.\n\nKata laluan sementara anda adalah: ${tempPassword}\n\nSila log masuk di portal rasmi SPT dan tukar kata laluan anda dengan segera.`,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('spt_email_logs', JSON.stringify(logs));
    loadEmailLogs();

    setCreatedUser(newUser);
    setSuccessMsg('Pendaftaran pengguna berjaya! Emel notifikasi berserta kata laluan sementara telah dihantar.');

    // Clear form inputs
    setFullName('');
    setEmail('');
    setNoKp('');
    setDepartment('');
    setGrade('');
  };

  const handleClearEmailLogs = () => {
    localStorage.removeItem('spt_email_logs');
    setEmailLogs([]);
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-80px)] text-left animate-fade-in items-stretch">
      {/* Left Side: Title & Form (70% width) */}
      <div className="w-full lg:w-[70%] p-8 md:p-12 flex flex-col gap-8 justify-start">
        {/* Title Header */}
        <div className="flex flex-col gap-1 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-black text-gov-blue-700 tracking-tight flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-gov-gold-500" />
            <span>Daftar Pengguna Baharu</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">
            Portal Super Admin &bull; Cipta & Kawal Selia Kebenaran Akses Portal
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl border-2 border-transparent moving-gradient-border shadow-sm p-6 sm:p-8 space-y-6">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Formulir Pendaftaran</h3>
          
          <form onSubmit={handleRegisterUser} className="space-y-4">
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex gap-2 animate-fade-in">
                <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-255 text-emerald-900 text-xs font-semibold flex gap-2 animate-fade-in">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Nama Penuh Pengguna:</label>
                <input
                  type="text"
                  placeholder="Contoh: Aminah binti Kassim"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs py-3 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gov-blue-500 font-bold"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Alamat Emel Rasmi:</label>
                <input
                  type="email"
                  placeholder="Contoh: aminah@jpa.gov.my"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs py-3 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gov-blue-500 font-bold"
                />
              </div>

              {/* No. KP */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">No. Kad Pengenalan (12 Digit):</label>
                <input
                  type="text"
                  maxLength={12}
                  placeholder="Contoh: 850422145520"
                  value={noKp}
                  onChange={(e) => setNoKp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-xs py-3 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gov-blue-500 font-mono font-bold"
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Peranan Sistem (Role):</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full text-xs py-3 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gov-blue-500 font-bold cursor-pointer"
                >
                  <option value="Pegawai Kes">Pegawai Kes (Urus Setia)</option>
                  <option value="Pengarah">Pengarah (Management)</option>
                  <option value="Lembaga Tatatertib">Lembaga Tatatertib (Executive)</option>
                  <option value="Super Admin">Super Admin (Urus Setia Utama)</option>
                </select>
              </div>

              {/* Grade */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Gred Jawatan:</label>
                <input
                  type="text"
                  placeholder="Contoh: M48 atau JUSA C"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full text-xs py-3 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gov-blue-500 font-bold"
                />
              </div>

              {/* Department */}
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Jabatan / Bahagian:</label>
                <input
                  type="text"
                  placeholder="Contoh: Bahagian Tatatertib, JPA"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs py-3 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gov-blue-500 font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-gov-blue-700 hover:bg-gov-blue-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-gov-blue-500/20 text-xs flex justify-center items-center gap-2 cursor-pointer hover:scale-[1.01]"
            >
              <UserPlus className="h-4 w-4" />
              <span>Daftar Pengguna Baharu</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right Side: Account Details Display or JPA Visual (30% width, full height and edge stretch) */}
      <div className="w-full lg:w-[30%] bg-slate-950 text-white p-8 relative overflow-hidden border-l border-slate-800 flex flex-col justify-between min-h-[480px] lg:min-h-0 animate-fade-in shrink-0">
          {/* Background Image Layer with custom database/data-entry visual */}
          <div className="absolute inset-0 z-0 opacity-45">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/register-bg.png')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/40 to-slate-950/90" />
          </div>
          
          {/* Abstract background vector patterns */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] z-0"></div>
          <div className="absolute -right-24 -bottom-24 w-80 h-80 bg-gov-blue-500/10 rounded-full blur-3xl pointer-events-none z-0"></div>
          <div className="absolute -left-24 -top-24 w-80 h-80 bg-gov-gold-500/10 rounded-full blur-3xl pointer-events-none z-0"></div>

          {/* Watermark Logo (Shield overlay with lowered opacity) */}
          <div className="absolute right-4 bottom-4 opacity-[0.03] pointer-events-none">
            <Shield className="w-72 h-72 text-gov-gold-400 stroke-[0.5]" />
          </div>

          <div className="space-y-6 z-10 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-850/60 border border-slate-800/80 rounded-xl text-gov-gold-400 text-[10px] font-black uppercase tracking-wider">
              <Shield className="h-3 w-3" />
              Sistem Pengurusan Tatatertib JPA
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white leading-tight">
                Sistem Pendaftaran Pengguna Portal
              </h3>
              <p className="text-slate-400 text-[11px] font-semibold leading-relaxed">
                Pendaftaran akaun baharu membolehkan kakitangan awam yang dilantik untuk melaksanakan tindakan urus setia, semakan atau persidangan kes mengikut bidang kuasa yang dibenarkan.
              </p>
            </div>
          </div>

          {/* Details or Empty state */}
          <div className="mt-8 z-10 w-full">
            {createdUser ? (
              <div className="bg-slate-850 border border-slate-800 rounded-2xl p-5 space-y-4 animate-scale-up">
                <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    <span>Kredensial Sesi Pengguna</span>
                  </h4>
                  <span className="text-[8px] bg-emerald-950 text-emerald-450 border border-emerald-900 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Berjaya</span>
                </div>

                <div className="space-y-2 text-xs text-slate-350 text-left">
                  <p className="font-semibold">Nama: <span className="font-extrabold text-white">{createdUser.name}</span></p>
                  <p className="font-semibold">Emel (ID Log Masuk): <span className="font-mono font-extrabold select-all bg-slate-900 text-gov-gold-400 px-2 py-1 border border-slate-800 rounded">{createdUser.email}</span></p>
                  <p className="font-semibold">No. KP: <span className="text-white font-mono">{createdUser.noKp}</span></p>
                  <p className="font-semibold">Peranan: <span className="bg-gov-blue-900 text-white font-bold px-2 py-0.5 rounded text-[10px]">{createdUser.role}</span></p>
                  
                  <div className="mt-4 p-3.5 bg-slate-955 border border-slate-900 text-white rounded-2xl space-y-1 relative">
                    <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wide">Kata Laluan Sementara:</span>
                    <span className="text-sm font-mono font-black tracking-widest text-gov-gold-400 select-all block bg-slate-900 p-1.5 rounded-xl border border-slate-850 text-center">
                      {createdUser.password}
                    </span>
                    <span className="text-[7.5px] text-slate-500 font-semibold block mt-1 text-center">
                      ⚠️ Salin kata laluan ini dan berikan kepada pengguna.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 border border-dashed border-slate-800 rounded-2xl text-center space-y-2.5 opacity-40">
                <Mail className="h-8 w-8 text-slate-550 mx-auto text-slate-500" />
                <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">Menunggu Kredensial Pengguna Baharu</span>
              </div>
            )}
          </div>

        </div>
    </div>
  );
}
