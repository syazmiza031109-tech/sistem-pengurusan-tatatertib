'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { 
  CircleUser, Mail, Shield, User, Landmark, 
  Fingerprint, Lock, Edit, X, Check, AlertCircle, Eye, EyeOff, RefreshCw 
} from 'lucide-react';

export default function UserProfilePage() {
  const { user, updateUser } = useAuth();
  
  // Profile form states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [noKpInput, setNoKpInput] = useState('');
  const [deptInput, setDeptInput] = useState('');
  const [gradeInput, setGradeInput] = useState('');
  
  // Status messages
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isProfileSyncing, setIsProfileSyncing] = useState(false);

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [passCooldown, setPassCooldown] = useState<number | null>(null); // days remaining

  // Initialize form
  useEffect(() => {
    if (user) {
      setNameInput(user.name || '');
      setEmailInput(user.email || '');
      setNoKpInput(user.noKp || '');
      setDeptInput(user.department || '');
      setGradeInput(user.grade || '');
    }
  }, [user, showEditModal]);

  // Check password change cooldown on mount
  useEffect(() => {
    checkPasswordCooldown();
  }, []);

  const checkPasswordCooldown = () => {
    const lastChangeStr = localStorage.getItem('spt_last_password_change');
    if (lastChangeStr) {
      const lastChange = parseInt(lastChangeStr, 10);
      const now = Date.now();
      const diffTime = now - lastChange;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      if (diffDays < 30) {
        setPassCooldown(Math.ceil(30 - diffDays));
      } else {
        setPassCooldown(null);
      }
    } else {
      setPassCooldown(null);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gov-blue-700"></div>
      </div>
    );
  }

  // Handle Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setIsProfileSyncing(true);

    if (!nameInput.trim() || !emailInput.trim() || !noKpInput.trim() || !deptInput.trim() || !gradeInput.trim()) {
      setProfileError('Sila isi semua maklumat profil.');
      setIsProfileSyncing(false);
      return;
    }

    const updatedUser = {
      ...user,
      name: nameInput.trim(),
      email: emailInput.trim(),
      noKp: noKpInput.trim(),
      department: deptInput.trim(),
      grade: gradeInput.trim(),
    };

    // Google Sheet Live Sync
    const liveUrl = localStorage.getItem('spt_gsheet_url');
    if (liveUrl) {
      try {
        await fetch(liveUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'update_profile',
            user: {
              name: updatedUser.name,
              email: updatedUser.email,
              noKp: updatedUser.noKp,
              department: updatedUser.department,
              grade: updatedUser.grade,
              role: updatedUser.role
            }
          })
        });
      } catch (err) {
        console.error('Failed to sync profile update to Google Sheets:', err);
      }
    }

    // Save locally
    if (updateUser) {
      updateUser(updatedUser);
    }
    
    // Trigger custom event to notify layout/sidebar
    window.dispatchEvent(new Event('storage_updated'));
    
    setProfileSuccess('Profil anda telah berjaya dikemaskini dan disegerakkan dengan Google Sheets.');
    setIsProfileSyncing(false);
    setShowEditModal(false);
  };

  // Handle Password Submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    // Re-verify cooldown
    const lastChangeStr = localStorage.getItem('spt_last_password_change');
    if (lastChangeStr) {
      const lastChange = parseInt(lastChangeStr, 10);
      const diffDays = (Date.now() - lastChange) / (1000 * 60 * 60 * 24);
      if (diffDays < 30) {
        setPassError(`Anda hanya boleh menukar kata laluan setiap 30 hari. Cooldown aktif: ${Math.ceil(30 - diffDays)} hari lagi.`);
        return;
      }
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError('Sila isi semua ruangan kata laluan.');
      return;
    }

    const storedPass = localStorage.getItem('spt_user_password') || 'darkdekomori12';
    if (currentPassword !== storedPass) {
      setPassError('Kata laluan semasa anda tidak tepat.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('Kata laluan baharu mestilah sekurang-kurangnya 6 aksara.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('Kata laluan baharu dan pengesahan kata laluan tidak sepadan.');
      return;
    }

    // Google Sheet Live Sync for password change
    const liveUrl = localStorage.getItem('spt_gsheet_url');
    if (liveUrl) {
      try {
        await fetch(liveUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'update_password',
            email: user.email,
            noKp: user.noKp,
            timestamp: Date.now()
          })
        });
      } catch (err) {
        console.error('Failed to sync password update to Google Sheets:', err);
      }
    }

    // Update password & last change timestamp
    localStorage.setItem('spt_user_password', newPassword);
    localStorage.setItem('spt_last_password_change', Date.now().toString());

    setPassSuccess('Kata laluan anda berjaya dikemaskini.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(false);
    checkPasswordCooldown();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Success banner profile */}
      {profileSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4.5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center shrink-0">
              <Check className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-bold leading-normal">{profileSuccess}</span>
          </div>
          <button onClick={() => setProfileSuccess(null)} className="text-emerald-500 hover:text-emerald-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Success banner password */}
      {passSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4.5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center shrink-0">
              <Check className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-bold leading-normal">{passSuccess}</span>
          </div>
          <button onClick={() => setPassSuccess(null)} className="text-emerald-500 hover:text-emerald-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gov-blue-700 tracking-tight">Profil Pengguna Portal</h2>
          <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mt-0.5">Maklumat Peribadi & Akses Sistem</p>
        </div>
      </div>

      {/* Official's Profile Details */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Profile Card Header */}
        <div className="bg-slate-900 px-8 py-6 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-gov-blue-800 border border-slate-700 flex items-center justify-center text-gov-gold-400 shadow-inner shrink-0">
              <CircleUser className="h-10 w-10" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-black text-white">{user.name}</h3>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="bg-gov-gold-500 hover:bg-gov-gold-600 text-gov-blue-900 text-[10px] font-bold px-3 py-1.5 rounded-xl shadow transition-all duration-200 flex items-center gap-1 hover:scale-[1.02] cursor-pointer"
                  >
                    <Edit className="h-3 w-3" />
                    <span>Edit Profil</span>
                  </button>
                  
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-xl shadow transition-all duration-200 flex items-center gap-1 hover:scale-[1.02] cursor-pointer"
                  >
                    <Lock className="h-3 w-3 text-gov-gold-500" />
                    <span>Tukar Kata Laluan</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-slate-400">
                {user.noKp && (
                  <span className="font-mono bg-slate-800 text-gov-gold-400 px-2 py-0.5 rounded border border-slate-700">
                    No. KP: {user.noKp}
                  </span>
                )}
                <span className="font-bold bg-slate-800 px-2.5 py-0.5 rounded-full text-[10px] text-gov-gold-400 tracking-wider uppercase">
                  Akses: {user.role}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 border border-slate-700/60 p-4 rounded-2xl text-right md:min-w-[180px] w-full md:w-auto">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Gred Jawatan</span>
            <span className="text-2xl font-black text-gov-gold-400 font-mono block mt-0.5">{user.grade}</span>
            <span className="text-[10px] text-slate-400 block truncate font-medium mt-0.5">Pengguna Sistem</span>
          </div>
        </div>

        {/* Profile Card Fields Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Penuh</span>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-1">
              <User className="h-3.5 w-3.5 text-gov-blue-700" />
              {user.name}
            </span>
          </div>

          <div className="space-y-1 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Alamat Emel</span>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-1">
              <Mail className="h-3.5 w-3.5 text-gov-blue-700" />
              {user.email || 'tiada emel berdaftar'}
            </span>
          </div>

          <div className="space-y-1 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">No. Kad Pengenalan</span>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-1">
              <Fingerprint className="h-3.5 w-3.5 text-gov-blue-700" />
              {user.noKp || 'tiada no. kp berdaftar'}
            </span>
          </div>

          <div className="space-y-1 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors col-span-1 md:col-span-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bahagian / Jabatan</span>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-1">
              <Landmark className="h-3.5 w-3.5 text-gov-blue-700" />
              {user.department}
            </span>
          </div>

          <div className="space-y-1 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Peranan Akses Portal</span>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-1">
              <Shield className="h-3.5 w-3.5 text-gov-blue-700" />
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-extrabold text-slate-800">Kemaskini Maklumat Profil Pengguna</h4>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-650 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {profileError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex gap-2 items-center">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Nama Penuh</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Alamat Emel</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">No. Kad Pengenalan</label>
                <input
                  type="text"
                  value={noKpInput}
                  onChange={(e) => setNoKpInput(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Bahagian / Jabatan</label>
                <input
                  type="text"
                  value={deptInput}
                  onChange={(e) => setDeptInput(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Gred Jawatan</label>
                <input
                  type="text"
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 font-semibold"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProfileSyncing}
                  className="flex-1 bg-gov-blue-700 hover:bg-gov-blue-800 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-gov-blue-700/20 hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer text-xs animate-pulse-subtle"
                >
                  {isProfileSyncing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyegerak...</span>
                    </>
                  ) : (
                    <span>Simpan & Segerak Sheets</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <Lock className="h-4.5 w-4.5 text-gov-gold-600 animate-pulse" />
                Tukar Kata Laluan
              </h4>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-650 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {passError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex gap-2 items-center">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Kata Laluan Semasa</label>
                <input
                  type="password"
                  placeholder="Masukkan kata laluan semasa"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={passCooldown !== null}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Kata Laluan Baharu</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Masukkan kata laluan baharu"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={passCooldown !== null}
                    className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 font-semibold pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    disabled={passCooldown !== null}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Sahkan Kata Laluan Baharu</label>
                <input
                  type="password"
                  placeholder="Masukkan semula kata laluan baharu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={passCooldown !== null}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 font-semibold"
                />
              </div>

              {passCooldown !== null && (
                <div className="p-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-[10px] font-semibold flex gap-2 items-start leading-relaxed">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    Pilihan ditutup sementara. Penukaran kata laluan seterusnya dibenarkan dalam tempoh <strong>{passCooldown} hari lagi</strong>.
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={passCooldown !== null}
                  className="flex-1 bg-gov-blue-700 hover:bg-gov-blue-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-gov-blue-700/20 hover:scale-[1.02] flex items-center justify-center cursor-pointer text-xs"
                >
                  Sahkan & Tukar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
