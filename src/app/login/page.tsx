'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { 
  Shield, Mail, Lock, Eye, EyeOff, AlertCircle, 
  ArrowLeft, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { loginWithCredentials } = useAuth();
  const router = useRouter();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRequestPermissionModal, setShowRequestPermissionModal] = useState(false);
  const [requestEmail, setRequestEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Pre-fill remembered identifier on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('spt_remembered_identifier');
      const shouldRemember = localStorage.getItem('spt_remember_me') === 'true';
      if (saved && shouldRemember) {
        setIdentifier(saved);
        setRememberMe(true);
      }
    }
  }, []);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    if (!identifier) {
      setErrorMsg('Sila masukkan Alamat Emel atau No. Kad Pengenalan anda.');
      setIsSubmitting(false);
      return;
    }

    if (!password) {
      setErrorMsg('Sila masukkan kata laluan anda.');
      setIsSubmitting(false);
      return;
    }

    // Try logging in using credentials
    setTimeout(() => {
      const res = loginWithCredentials(identifier, password);
      if (res.success) {
        if (typeof window !== 'undefined') {
          if (rememberMe) {
            localStorage.setItem('spt_remembered_identifier', identifier);
            localStorage.setItem('spt_remember_me', 'true');
          } else {
            localStorage.removeItem('spt_remembered_identifier');
            localStorage.removeItem('spt_remember_me');
          }
        }
        setSuccessMsg('Log masuk berjaya! Menghala ke papan pemuka...');
        setTimeout(() => {
          router.push('/dashboard/admin');
        }, 800);
      } else {
        setErrorMsg(res.error || 'Ralat log masuk.');
        setIsSubmitting(false);
        if (res.notFound) {
          setShowRequestPermissionModal(true);
          setRequestEmail(identifier.includes('@') ? identifier : '');
        }
      }
    }, 600); // Small delay for nice transition and loading visual
  };

  return (
    <div className="flex-1 flex min-h-screen bg-[#f8fafc] font-sans">
      {/* Back button home */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-gov-blue-700 transition-colors bg-white/80 backdrop-blur border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm hover:shadow-md cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Laman Utama</span>
        </Link>
      </div>

      <div className="w-full grid lg:grid-cols-12 min-h-screen">
        {/* Left Side: Brand Panel */}
        <div className="hidden lg:flex lg:col-span-5 blue-gradient-bg text-white p-12 flex-col justify-between relative overflow-hidden">
          {/* Subtle grid mesh background */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          {/* Top Branding */}
          <div className="flex items-center gap-3.5 z-10">
            <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center border border-slate-700 shadow-xl p-1 overflow-hidden">
              <img src="/jpa-logo.png" alt="JPA Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight block">Sistem Pengurusan Tatatertib</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-gov-gold-500">Jabatan Perkhidmatan Awam Malaysia</span>
            </div>
          </div>

          {/* Core Content */}
          <div className="space-y-6 max-w-sm my-auto z-10">
            <h2 className="text-3xl font-black leading-tight tracking-tight text-white">
              Sistem Portal <br/>
              Selamat Kerajaan
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Sila log masuk menggunakan kredensial berdaftar anda untuk mengakses papan pemuka tatatertib JPA, fail kertas cadangan pertuduhan, dan rekod siasatan kes.
            </p>
            <div className="h-1 w-12 bg-gov-gold-500 rounded"></div>
          </div>

          {/* Footer Info */}
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider z-10">
            Kerangka Keselamatan Gred JPA • SSL Disulitkan
          </div>
        </div>

        {/* Right Side: Log In Form Card */}
        <div className="col-span-12 lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 md:p-20 bg-slate-50">
          <div className="w-full max-w-md space-y-8 animate-slide-up">
            {/* Header for mobile view or clean style */}
            <div className="text-center lg:text-left space-y-2">
              <div className="lg:hidden inline-flex h-14 w-14 bg-white rounded-2xl items-center justify-center shadow-lg p-1 border border-slate-200 overflow-hidden mb-3">
                <img src="/jpa-logo.png" alt="JPA Logo" className="h-full w-full object-contain" />
              </div>
              <h1 className="text-2xl font-black text-gov-blue-700 tracking-tight">Selamat Datang Ke Portal SPT</h1>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Log Masuk Dengan Akaun Anda</p>
            </div>

            {/* Official Credentials Form */}
            <form onSubmit={handleCredentialsSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex gap-3 items-start animate-fade-in">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex gap-3 items-start animate-fade-in">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="identifier" className="text-xs font-bold text-slate-600 block">
                  Alamat Emel atau No. KP
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="identifier"
                    type="text"
                    placeholder="Masukkan Alamat Emel atau No. KP anda"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full text-sm py-3 pl-11 pr-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gov-blue-500 focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-bold text-slate-600 block">
                  Kata Laluan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan kata laluan"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full text-sm py-3 pl-11 pr-12 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gov-blue-500 focus:border-transparent transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center pt-1 text-left">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-350 text-gov-blue-750 focus:ring-gov-blue-500 cursor-pointer accent-gov-blue-700"
                  />
                  <span>Ingat saya</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 bg-gov-blue-700 hover:bg-gov-blue-800 disabled:bg-gov-blue-300 text-white py-3.5 rounded-2xl text-xs font-bold transition-all duration-200 shadow-md shadow-gov-blue-500/10 hover:scale-[1.01] flex justify-center items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Log Masuk Akaun</span>
                )}
              </button>
            </form>

            {/* Quick-Fill Demo Accounts Panel */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3.5 shadow-sm text-left">
              <div className="flex items-center gap-2 text-slate-600 font-extrabold border-b border-slate-100 pb-2">
                <Shield className="h-4 w-4 text-gov-gold-500" />
                <span className="text-[10px] uppercase tracking-wider">Akaun Demo / Quick-Fill</span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    name: 'Puan Syazmiza (Super Admin)',
                    role: 'Super Admin',
                    email: 'syazmiza0304@gmail.com',
                    pass: 'darkdekomori12'
                  },
                  {
                    name: 'Faezah binti Md Nor (Pegawai Kes)',
                    role: 'Pegawai Kes (KPP OA3)',
                    email: 'faezah@jpa.gov.my',
                    pass: 'faezah123'
                  },
                  {
                    name: 'Mohd Azhar bin Harun (Pegawai Kes)',
                    role: 'Pegawai Kes (KPP OA1)',
                    email: 'azhar@jpa.gov.my',
                    pass: 'azhar123'
                  }
                ].map((account, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIdentifier(account.email);
                      setPassword(account.pass);
                    }}
                    className="w-full text-left bg-slate-50 hover:bg-gov-blue-50/50 border border-slate-200 hover:border-gov-blue-200 p-3 rounded-2xl transition-all flex justify-between items-center group cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-black text-slate-800 block truncate group-hover:text-gov-blue-700 transition-colors">
                        {account.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Emel: {account.email} &bull; Pass: <span className="font-mono">{account.pass}</span>
                      </span>
                    </div>
                    <span className="text-[9px] bg-slate-200 text-slate-600 px-2.5 py-1 rounded-lg font-bold uppercase shrink-0 group-hover:bg-gov-blue-150 group-hover:text-gov-blue-700 transition-colors">
                      Pilih
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-medium text-center border-t border-slate-200/50 pt-5">
              Sistem Pengurusan Tatatertib JPA • Hak Cipta Terpelihara © {new Date().getFullYear()}
            </div>
          </div>
        </div>
      {/* Permission Request Modal */}
      {showRequestPermissionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-5 animate-scale-up text-left">
            <div className="flex items-center gap-3 text-gov-blue-700 border-b border-slate-100 pb-3 justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5.5 w-5.5 text-gov-gold-500" />
                <h4 className="text-xs font-black text-slate-850 uppercase tracking-tight">Ask admin permission to create an account?</h4>
              </div>
              <button 
                onClick={() => setShowRequestPermissionModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {!requestSuccess ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Akaun dengan Alamat Emel / No. KP <strong className="text-slate-800 font-bold">{identifier || 'anda'}</strong> tidak dijumpai di dalam pangkalan data. Adakah anda mahu meminta kebenaran admin untuk mencipta akaun?
                </p>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Masukkan Alamat Emel:</label>
                  <input
                    type="email"
                    placeholder="Contoh: user@example.com"
                    value={requestEmail}
                    onChange={(e) => setRequestEmail(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gov-blue-500 font-medium"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestPermissionModal(false)}
                    className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!requestEmail.trim() || !requestEmail.includes('@')) {
                        alert('Sila masukkan emel yang sah.');
                        return;
                      }
                      const newRequest = {
                        id: Date.now(),
                        email: requestEmail.trim(),
                        status: 'pending',
                        timestamp: new Date().toISOString()
                      };
                      const existing = localStorage.getItem('spt_user_requests');
                      const list = existing ? JSON.parse(existing) : [];
                      list.push(newRequest);
                      localStorage.setItem('spt_user_requests', JSON.stringify(list));
                      
                      // Also write a system audit log for simulated email
                      const emailLogsRaw = localStorage.getItem('spt_email_logs');
                      const emailLogs = emailLogsRaw ? JSON.parse(emailLogsRaw) : [];
                      emailLogs.unshift({
                        id: Date.now(),
                        recipient: 'syazmiza0304@gmail.com', // Sent to Super Admin notifying them
                        subject: 'Permohonan Pendaftaran Akaun Baharu',
                        body: `Pengguna dengan emel ${requestEmail.trim()} telah memohon kebenaran pendaftaran akaun. Sila semak permohonan di panel notifikasi anda.`,
                        timestamp: new Date().toISOString()
                      });
                      localStorage.setItem('spt_email_logs', JSON.stringify(emailLogs));

                      setRequestSuccess(true);
                    }}
                    className="flex-1 py-2.5 bg-gov-blue-700 hover:bg-gov-blue-800 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-gov-blue-500/10 cursor-pointer"
                  >
                    Hantar Permohonan
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-150 text-emerald-950 text-xs font-semibold leading-relaxed">
                  🎉 Permohonan pendaftaran telah berjaya dihantar ke notifikasi Super Admin!
                  <br/><br/>
                  Status permohonan anda diproses di bawah fasa <strong>"Pending Account Creation"</strong>. Anda akan dimaklumkan melalui emel sebaik sahaja pentadbir meluluskan permohonan.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestPermissionModal(false);
                    setRequestSuccess(false);
                  }}
                  className="w-full py-2.5 bg-gov-blue-700 hover:bg-gov-blue-800 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Tutup Dialog
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
