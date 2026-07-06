'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { 
  Shield, Mail, Lock, Eye, EyeOff, AlertCircle, 
  ArrowLeft, UserCheck, ShieldAlert, Key, HelpCircle,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { login, loginWithCredentials } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'credentials' | 'simulation'>('credentials');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setSuccessMsg('Log masuk berjaya! Menghala ke papan pemuka...');
        setTimeout(() => {
          router.push('/dashboard/admin');
        }, 800);
      } else {
        setErrorMsg(res.error || 'Ralat log masuk.');
        setIsSubmitting(false);
      }
    }, 600); // Small delay for nice transition and loading visual
  };

  const fillMasterCredentials = () => {
    setIdentifier('syazmiza0304@gmail.com');
    setPassword('darkdekomori12');
    setErrorMsg('');
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
            <div className="h-11 w-11 bg-gov-blue-800 rounded-xl flex items-center justify-center border border-slate-700 shadow-xl">
              <Shield className="h-6 w-6 text-gov-gold-400" />
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
              <div className="lg:hidden inline-flex h-12 w-12 bg-gov-blue-700 rounded-2xl items-center justify-center shadow-lg shadow-gov-blue-700/20 mb-3">
                <Shield className="h-6.5 w-6.5 text-gov-gold-400" />
              </div>
              <h1 className="text-2xl font-black text-gov-blue-700 tracking-tight">Selamat Datang Ke Portal SPT</h1>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Log Masuk Dengan Akaun Anda</p>
            </div>

            {/* Toggle Tabs */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/40">
              <button
                onClick={() => {
                  setActiveTab('credentials');
                  setErrorMsg('');
                }}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === 'credentials' 
                    ? 'bg-white text-gov-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Kredensial Rasmi
              </button>
              <button
                onClick={() => {
                  setActiveTab('simulation');
                  setErrorMsg('');
                }}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === 'simulation' 
                    ? 'bg-white text-gov-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Simulasi Peranan
              </button>
            </div>

            {activeTab === 'credentials' ? (
              /* Official Credentials Form */
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
                      placeholder="contoh: syazmiza0304@gmail.com atau 030415130390"
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

                {/* Master Account Info Card / Helper */}
                <div 
                  onClick={fillMasterCredentials}
                  className="p-4 mt-6 bg-gov-gold-50/50 hover:bg-gov-gold-50 border border-gov-gold-100 rounded-2xl cursor-pointer hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-gov-gold-700 uppercase tracking-wide">Akaun Master Admin (Klik untuk auto-isi)</span>
                    <span className="text-[9px] bg-gov-gold-100 text-gov-gold-700 px-2 py-0.5 rounded font-bold uppercase group-hover:scale-105 transition-transform">Demo</span>
                  </div>
                  <div className="text-[11px] space-y-1 text-slate-600 font-medium leading-relaxed">
                    <div><span className="font-bold text-slate-700">Email:</span> syazmiza0304@gmail.com</div>
                    <div><span className="font-bold text-slate-700">No. KP:</span> 030415130390</div>
                    <div><span className="font-bold text-slate-700">Gred Cadangan:</span> M54 (Pegawai Tadbir & Diplomat)</div>
                    <div><span className="font-bold text-slate-700">Kata Laluan:</span> darkdekomori12</div>
                  </div>
                </div>
              </form>
            ) : (
              /* Simulation Roles */
              <div className="space-y-4">
                {/* Pegawai Kes Button */}
                <button
                  onClick={() => login('Pegawai Kes')}
                  className="w-full flex items-start gap-4 p-4 rounded-2xl text-left border border-slate-200 hover:border-gov-blue-200 bg-white hover:bg-gov-blue-50/20 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                >
                  <div className="h-10 w-10 bg-gov-blue-100 rounded-xl flex items-center justify-center text-gov-blue-700 group-hover:bg-gov-blue-700 group-hover:text-white transition-colors shrink-0">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-sm block group-hover:text-gov-blue-700">Pegawai Kes / Urus Setia (Admin)</span>
                    <span className="text-xs text-slate-500 font-medium leading-relaxed block mt-0.5">Mendaftarkan kes, mengemaskini perincian perakuan kesalahan, dan melacak fail dokumen tatatertib.</span>
                  </div>
                </button>

                {/* Pengarah / Ketua Jabatan Button */}
                <button
                  onClick={() => login('Pengarah')}
                  className="w-full flex items-start gap-4 p-4 rounded-2xl text-left border border-slate-200 hover:border-amber-200 bg-white hover:bg-amber-50/20 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                >
                  <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 group-hover:bg-amber-500 group-hover:text-white transition-colors shrink-0">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-sm block group-hover:text-amber-700">Pengarah / Ketua Jabatan</span>
                    <span className="text-xs text-slate-500 font-medium leading-relaxed block mt-0.5">Menyemak draf kertas cadangan makluman, menentukan laluan perundangan tatatertib (P36 / P37).</span>
                  </div>
                </button>

                {/* Lembaga Tatatertib Button */}
                <button
                  onClick={() => login('Lembaga Tatatertib')}
                  className="w-full flex items-start gap-4 p-4 rounded-2xl text-left border border-slate-200 hover:border-emerald-200 bg-white hover:bg-emerald-50/20 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                >
                  <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-sm block group-hover:text-emerald-700">Lembaga Tatatertib (LTT)</span>
                    <span className="text-xs text-slate-500 font-medium leading-relaxed block mt-0.5">Mendengar representasi pembelaan kes, merekod keputusan hukuman pertuduhan dan tarikh borang tamat kes.</span>
                  </div>
                </button>

                <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl text-xs text-slate-500 text-center flex items-center gap-2 justify-center">
                  <HelpCircle className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <span>Simulasi ini membenarkan anda menelusuri aliran tanpa memasukkan kredensial.</span>
                </div>
              </div>
            )}

            <div className="text-[10px] text-slate-400 font-medium text-center border-t border-slate-200/50 pt-5">
              Sistem Pengurusan Tatatertib JPA • Hak Cipta Terpelihara © {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
