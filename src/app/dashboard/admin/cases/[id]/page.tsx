'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CompleteCase } from '@/lib/types';
import { 
  INITIAL_CASES, GRADES, MINISTRIES, STATES, KAUM, STATUS_JAWATAN, PUNCA_KES, JENIS_KESALAHAN 
} from '@/lib/mock-data';
import { 
  ArrowLeft, CircleUser, FileText, ExternalLink, Calendar, 
  MapPin, ShieldAlert, Database, CheckSquare, FolderGit2,
  Edit, CloudLightning, FileSpreadsheet, RefreshCw, X, Check
} from 'lucide-react';

export default function OfficerProfileDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [cases, setCases] = useState<CompleteCase[]>([]);
  const [officerCases, setOfficerCases] = useState<CompleteCase[]>([]);
  const [officerProfile, setOfficerProfile] = useState<CompleteCase['officer'] | null>(null);

  // Editing Modals State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [editingCase, setEditingCase] = useState<CompleteCase | null>(null);

  // Form States
  const [profileForm, setProfileForm] = useState<CompleteCase['officer'] | null>(null);
  const [caseForm, setCaseForm] = useState<CompleteCase | null>(null);

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('spt_cases');
    const allCases: CompleteCase[] = stored ? JSON.parse(stored) : INITIAL_CASES;
    setCases(allCases);

    const filtered = allCases.filter(c => c.officer.NO_KP === id);
    setOfficerCases(filtered);

    if (filtered.length > 0) {
      setOfficerProfile(filtered[0].officer);
    }
  }, [id]);

  // Form Initializers
  const openEditProfileModal = () => {
    if (officerProfile) {
      setProfileForm({ ...officerProfile });
      setShowProfileModal(true);
    }
  };

  const openEditCaseModal = (c: CompleteCase) => {
    setEditingCase(c);
    setCaseForm(JSON.parse(JSON.stringify(c))); // deep copy
    setShowCaseModal(true);
  };

  // Profile Save Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm) return;

    // Update the profile of this officer in all cases sharing their ID
    const updatedCases = cases.map(c => {
      if (c.officer.NO_KP === id) {
        return {
          ...c,
          officer: { ...profileForm }
        };
      }
      return c;
    });

    localStorage.setItem('spt_cases', JSON.stringify(updatedCases));
    setCases(updatedCases);
    setOfficerProfile(profileForm);
    setOfficerCases(updatedCases.filter(c => c.officer.NO_KP === profileForm.NO_KP));
    setShowProfileModal(false);

    // Show success banner
    setSaveSuccess('Profil Pegawai telah berjaya dikemaskini dan disegerakkan.');
    setTimeout(() => setSaveSuccess(null), 4000);

    // If ID changed, redirect to new ID page
    if (profileForm.NO_KP !== id) {
      router.push(`/dashboard/admin/cases/${profileForm.NO_KP}`);
    }
  };

  // Case Save Handler
  const handleSaveCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseForm || !editingCase) return;

    // Update the specific case matching the primary key NO_RUJ_FAIL_JPA
    const updatedCases = cases.map(c => {
      if (c.metadata.NO_RUJ_FAIL_JPA === editingCase.metadata.NO_RUJ_FAIL_JPA) {
        return { ...caseForm };
      }
      return c;
    });

    localStorage.setItem('spt_cases', JSON.stringify(updatedCases));
    setCases(updatedCases);
    setOfficerCases(updatedCases.filter(c => c.officer.NO_KP === id));
    setShowCaseModal(false);
    setEditingCase(null);

    // Show success banner
    setSaveSuccess('Rekod Fail Kes telah berjaya dikemaskini dan disegerakkan.');
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  // Simulated Google Sheets & Data Studio webhook sync trigger
  const triggerGoogleSheetsSync = () => {
    setSyncing(true);
    setSyncMessage('Menyambung ke Google Sheets & Looker Studio API...');
    
    setTimeout(() => {
      setSyncMessage('Mengesahkan Kredensial Portal Urus Setia JPA...');
    }, 1000);

    setTimeout(() => {
      setSyncMessage(`Menyegerakkan ${cases.length} rekod fail kes aktif...`);
    }, 2000);

    setTimeout(() => {
      setSyncing(false);
      setSyncMessage('Penyegerakan Berjaya! Google Sheets dan Data Studio (Looker Studio) telah dikemaskini.');
      setTimeout(() => setSyncMessage(null), 5000);
    }, 3800);
  };

  // Dynamic CSV formatting and export tool
  const exportToCSV = () => {
    const headers = [
      'No. Rujukan Fail JPA', 'Nama Pegawai', 'No. KP', 'Jawatan', 'Gred', 
      'Kementerian', 'Negeri', 'Jenis Kesalahan', 'Fasa Aliran Utama', 'Status HRMIS', 'Pegawai Kes'
    ];
    
    const rows = cases.map(c => [
      `"${c.metadata.NO_RUJ_FAIL_JPA}"`,
      `"${c.officer.NAMA}"`,
      `"${c.officer.NO_KP}"`,
      `"${c.officer.JAWATAN}"`,
      `"${c.officer.GRED}"`,
      `"${c.officer.KEMENTERIAN}"`,
      `"${c.officer.NEGERI}"`,
      `"${c.details.JENIS_KESALAHAN.join(', ')}"`,
      `"${c.workflow.STATUS_KATEGORI_UTAMA}"`,
      `"${c.workflow.STATUS_KEMASKINI_KES_DI_HRMIS}"`,
      `"${c.workflow.PEGAWAI_KES}"`
    ]);
    
    const csvContent = "\ufeff" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `spt_data_tatatertib_sheets_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!officerProfile) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-gov-blue-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Senarai Kes
        </button>
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
          <CircleUser className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">Profil Pegawai Tidak Dijumpai</h3>
          <p className="text-xs text-slate-400 mt-1">Tiada rekod pegawaian dengan No. Kad Pengenalan {id} dijumpai dalam sistem.</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    if (status.includes('Klarifikasi')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (status.includes('Penentuan') || status.includes('Lulus PP')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (status.includes('Pertuduhan')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    } else if (status.includes('Hukuman') || status.includes('Lembaga')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    } else {
      return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getHrmisBadge = (status: string) => {
    switch (status) {
      case 'Incomplete':
        return 'bg-slate-100 text-slate-600';
      case 'SP Updated':
        return 'bg-purple-100 text-purple-700';
      case 'SK Updated':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Save success banner */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4.5 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center shrink-0">
              <Check className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-bold leading-normal">{saveSuccess}</span>
          </div>
          <button onClick={() => setSaveSuccess(null)} className="text-emerald-500 hover:text-emerald-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header with Back Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button 
            onClick={() => router.push('/dashboard/admin/cases')}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-gov-blue-700 transition-colors cursor-pointer mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Senarai Kes
          </button>
          <h2 className="text-2xl font-black text-gov-blue-700 tracking-tight">Profil & Maklumat Kes Pegawai</h2>
          <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mt-0.5">Urus Setia & Pegawai Kes (Admin)</p>
        </div>
      </div>

      {/* CONTAINER 1: Official's Profile Details */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Profile Card Header */}
        <div className="bg-slate-900 px-8 py-6 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-gov-blue-800 border border-slate-700 flex items-center justify-center text-gov-gold-400 shadow-inner shrink-0">
              <CircleUser className="h-10 w-10" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-black text-white">{officerProfile.NAMA}</h3>
                <button
                  onClick={openEditProfileModal}
                  className="bg-gov-gold-500 hover:bg-gov-gold-600 text-gov-blue-900 text-[10px] font-bold px-3 py-1 rounded-xl shadow transition-all duration-200 flex items-center gap-1 hover:scale-[1.02] cursor-pointer"
                >
                  <Edit className="h-3 w-3" />
                  <span>Edit Profil</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-slate-400">
                <span className="font-mono bg-slate-800 text-gov-gold-400 px-2 py-0.5 rounded border border-slate-700">No. KP: {officerProfile.NO_KP}</span>
                <span className="font-bold bg-slate-800 px-2.5 py-0.5 rounded-full text-[10px] text-slate-300 tracking-wider uppercase">{officerProfile.JANTINA === 'L' ? 'Lelaki' : 'Perempuan'}</span>
                <span className="font-bold text-slate-400">• {officerProfile.KAUM}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 border border-slate-700/60 p-4 rounded-2xl text-right md:min-w-[180px] w-full md:w-auto">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Gred Jawatan</span>
            <span className="text-2xl font-black text-gov-gold-400 font-mono block mt-0.5">{officerProfile.GRED}</span>
            <span className="text-[10px] text-slate-400 block truncate font-medium mt-0.5">{officerProfile.JAWATAN}</span>
          </div>
        </div>

        {/* Profile Card Fields Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Skim Perkhidmatan</span>
            <span className="text-xs font-bold text-slate-800 block">{officerProfile.SKIM}</span>
            <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono inline-block mt-1">{officerProfile.STATUS_JAWATAN}</span>
          </div>

          <div className="space-y-1 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tempat Bertugas / Kementerian</span>
            <span className="text-xs font-bold text-slate-800 block truncate" title={officerProfile.TEMPAT_BERTUGAS}>{officerProfile.TEMPAT_BERTUGAS}</span>
            <span className="text-[9px] text-slate-400 font-bold block mt-1">{officerProfile.KEMENTERIAN}</span>
          </div>

          <div className="space-y-1 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Negeri & Wilayah</span>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-gov-blue-700" />
              {officerProfile.NEGERI}
            </span>
          </div>

          <div className="space-y-1 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tarikh Lahir</span>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {officerProfile.TARIKH_LAHIR}
            </span>
          </div>

          <div className="space-y-1 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pilihan Umur Persaraan</span>
            <span className="text-xs font-bold text-slate-800 block">{officerProfile.PILIHAN_UMUR_PERSARAAN} Tahun</span>
          </div>

          <div className="space-y-1 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tarikh Bersara Wajib</span>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-red-500" />
              {officerProfile.TARIKH_BERSARA}
            </span>
          </div>
        </div>
      </div>

      {/* CONTAINER 2: Case Details (Vertically and Horizontally Scrollable Table) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Container Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FolderGit2 className="h-5 w-5 text-gov-blue-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Senarai Fail Kes Tatatertib Berdaftar</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Senarai rekod aduan dan tindakan undang-undang rasmi</p>
            </div>
          </div>
          <span className="bg-gov-blue-50 text-gov-blue-700 px-3 py-1 rounded-full text-[10px] font-bold border border-gov-blue-100">
            {officerCases.length} Fail Kes
          </span>
        </div>

        {/* Scrollable Table Wrapper */}
        <div className="p-6">
          <div className="overflow-auto max-h-[380px] border border-slate-200 rounded-2xl shadow-inner scrollbar-thin scrollbar-thumb-slate-300">
            <table className="w-full text-left border-collapse min-w-[1550px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 sticky top-0 z-10">
                  <th className="py-4 px-6 bg-slate-50">No. Rujukan Fail JPA</th>
                  <th className="py-4 px-6 bg-slate-50">Kategori Kesalahan</th>
                  <th className="py-4 px-6 bg-slate-50">Fasa Aliran Utama</th>
                  <th className="py-4 px-6 bg-slate-50">Ringkasan Ringkas Kes</th>
                  <th className="py-4 px-6 bg-slate-50">Punca Kes</th>
                  <th className="py-4 px-6 bg-slate-50">Ulasan Urus Setia</th>
                  <th className="py-4 px-6 bg-slate-50">Status HRMIS</th>
                  <th className="py-4 px-6 bg-slate-50">Pegawai Kes / SME / Penyemak</th>
                  <th className="py-4 px-6 bg-slate-50">Tarikh Penerimaan Perakuan</th>
                  <th className="py-4 px-6 bg-slate-50">Dokumen / Pautan Google Drive</th>
                  <th className="py-4 px-6 bg-slate-50 text-center sticky right-0 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] border-l border-slate-100">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700 bg-white">
                {officerCases.length > 0 ? (
                  officerCases.map((c) => (
                    <tr key={c.metadata.NO_RUJ_FAIL_JPA} className="hover:bg-slate-50/50 transition-colors">
                      {/* No Ruj Fail JPA */}
                      <td className="py-4.5 px-6 font-mono text-gov-blue-700 font-bold sticky left-0 bg-white hover:bg-slate-50 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] border-r border-slate-100">
                        {c.metadata.NO_RUJ_FAIL_JPA}
                      </td>

                      {/* Kategori Kesalahan */}
                      <td className="py-4.5 px-6">
                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                          {c.details.JENIS_KESALAHAN.map((jk, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded-full block border border-slate-200">
                              {jk}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Fasa Aliran Utama */}
                      <td className="py-4.5 px-6">
                        <span className={`px-2.5 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider inline-block ${getStatusBadge(c.workflow.STATUS_KATEGORI_UTAMA)}`}>
                          {c.workflow.STATUS_KATEGORI_UTAMA}
                        </span>
                      </td>

                      {/* Ringkasan Kes */}
                      <td className="py-4.5 px-6 max-w-[280px]">
                        <span className="text-slate-600 line-clamp-3 leading-relaxed font-normal" title={c.details.RINGKASAN_KESALAHAN}>
                          {c.details.RINGKASAN_KESALAHAN}
                        </span>
                      </td>

                      {/* Punca Kes */}
                      <td className="py-4.5 px-6 font-bold text-slate-600">
                        {c.details.PUNCA_KES}
                      </td>

                      {/* Ulasan Urus Setia */}
                      <td className="py-4.5 px-6 max-w-[300px]">
                        <p className="text-slate-500 line-clamp-3 leading-relaxed font-normal" title={c.details.ULASAN_URUS_SETIA}>
                          {c.details.ULASAN_URUS_SETIA}
                        </p>
                      </td>

                      {/* Status HRMIS */}
                      <td className="py-4.5 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getHrmisBadge(c.workflow.STATUS_KEMASKINI_KES_DI_HRMIS)}`}>
                          {c.workflow.STATUS_KEMASKINI_KES_DI_HRMIS}
                        </span>
                      </td>

                      {/* Pegawai Kes / SME / Penyemak */}
                      <td className="py-4.5 px-6 text-slate-600 space-y-0.5">
                        {c.workflow.PEGAWAI_KES && <span className="block text-[10px] font-bold"><strong className="text-[8px] text-slate-400 block">PEG. KES:</strong> {c.workflow.PEGAWAI_KES}</span>}
                        {c.workflow.SME && <span className="block text-[10px]"><strong className="text-[8px] text-slate-400 block">SME:</strong> {c.workflow.SME}</span>}
                        {c.workflow.PEGAWAI_PENYEMAK && <span className="block text-[10px]"><strong className="text-[8px] text-slate-400 block">PENYEMAK:</strong> {c.workflow.PEGAWAI_PENYEMAK}</span>}
                      </td>

                      {/* Tarikh Penerimaan */}
                      <td className="py-4.5 px-6 font-mono text-[10px] text-slate-500">
                        {c.workflow.TARIKH_TERIMA_PERAKUAN || '-'}
                      </td>

                      {/* Documents / Google Drive */}
                      <td className="py-4.5 px-6">
                        <div className="flex flex-col gap-1.5 max-w-[200px]">
                          {c.metadata.URL_LINK_GD && (
                            <a 
                              href={c.metadata.URL_LINK_GD}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 text-[9px] font-bold bg-slate-100 hover:bg-gov-blue-50 text-slate-600 hover:text-gov-blue-700 rounded-lg flex items-center justify-between border border-slate-200 transition-colors"
                            >
                              <span>Folder Fail (Drive)</span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          )}
                          {c.metadata.URL_LINK_PP && (
                            <a 
                              href={c.metadata.URL_LINK_PP}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 text-[9px] font-bold bg-slate-100 hover:bg-gov-blue-50 text-slate-600 hover:text-gov-blue-700 rounded-lg flex items-center justify-between border border-slate-200 transition-colors"
                            >
                              <span>Kertas Makluman (PP)</span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          )}
                          {c.metadata.URL_LINK_SP && (
                            <a 
                              href={c.metadata.URL_LINK_SP}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 text-[9px] font-bold bg-slate-100 hover:bg-gov-blue-50 text-slate-600 hover:text-gov-blue-700 rounded-lg flex items-center justify-between border border-slate-200 transition-colors"
                            >
                              <span>Surat Pertuduhan (SP)</span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* EDIT ACTION BUTTON */}
                      <td className="py-4.5 px-6 text-center sticky right-0 bg-white hover:bg-slate-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] border-l border-slate-100">
                        <button
                          onClick={() => openEditCaseModal(c)}
                          className="bg-gov-blue-50 text-gov-blue-800 hover:bg-gov-blue-700 hover:text-white border border-gov-blue-200 px-3 py-1.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Ubah</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400 font-semibold">
                      <Database className="h-8 w-8 mx-auto text-slate-300 mb-2.5" />
                      <span>Tiada sebarang rekod kes bagi pegawai ini.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CONTAINER 3: Google Sheets & Data Studio Integration Sync Panel */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">Sambungan API Aktif</span>
          </div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <CloudLightning className="h-4.5 w-4.5 text-gov-gold-500" />
            Integrasi Google Sheets & Looker Studio
          </h3>
          <p className="text-xs text-slate-500 max-w-xl font-normal leading-relaxed">
            Data portal ini dikonfigurasikan untuk segerak terus ke hamparan Google Sheets dan laporan Data Studio. Segerakkan data setempat selepas melakukan pengemaskinian profil untuk memastikan data visual di Looker Studio dikemaskini.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 shrink-0 w-full md:w-auto">
          {/* CSV Export Button */}
          <button
            onClick={exportToCSV}
            className="flex-1 md:flex-none bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-600" />
            <span>Eksport CSV Sheets</span>
          </button>

          {/* Sync Button */}
          <button
            onClick={triggerGoogleSheetsSync}
            disabled={syncing}
            className="flex-1 md:flex-none bg-gov-blue-700 hover:bg-gov-blue-800 text-white disabled:bg-slate-300 px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-gov-blue-700/10 hover:scale-[1.01]"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Menyegerak...' : 'Picu Segerak Google Sheets'}</span>
          </button>
        </div>
      </div>

      {/* Sync Status Overlay Alert */}
      {syncMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-slate-800 p-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-fade-in max-w-sm">
          <div className="h-9 w-9 bg-gov-gold-500/20 text-gov-gold-400 rounded-xl flex items-center justify-center shrink-0">
            <RefreshCw className="h-5 w-5 animate-spin" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-gov-gold-400 uppercase tracking-wider block">Proses Integrasi</span>
            <p className="text-xs text-slate-300 font-semibold leading-normal mt-0.5">{syncMessage}</p>
          </div>
        </div>
      )}

      {/* MODAL 1: Edit Profile Modal */}
      {showProfileModal && profileForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <CircleUser className="h-5 w-5 text-gov-gold-400" />
                <h3 className="text-sm font-bold">Kemaskini Profil Pegawai Awam</h3>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NAMA */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Nama Penuh (seperti MyKad)</label>
                  <input
                    type="text"
                    required
                    value={profileForm.NAMA}
                    onChange={(e) => setProfileForm({ ...profileForm, NAMA: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 bg-slate-55 font-semibold text-slate-800"
                  />
                </div>

                {/* NO_KP */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">No. Kad Pengenalan</label>
                  <input
                    type="text"
                    required
                    value={profileForm.NO_KP}
                    onChange={(e) => setProfileForm({ ...profileForm, NO_KP: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 bg-slate-50 font-semibold text-slate-800"
                  />
                </div>

                {/* JAWATAN */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Nama Jawatan</label>
                  <input
                    type="text"
                    required
                    value={profileForm.JAWATAN}
                    onChange={(e) => setProfileForm({ ...profileForm, JAWATAN: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 bg-slate-50 font-semibold text-slate-800"
                  />
                </div>

                {/* SKIM */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Skim Perkhidmatan</label>
                  <input
                    type="text"
                    required
                    value={profileForm.SKIM}
                    onChange={(e) => setProfileForm({ ...profileForm, SKIM: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 bg-slate-50 font-semibold text-slate-800"
                  />
                </div>

                {/* GRED */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Gred Jawatan</label>
                  <select
                    value={profileForm.GRED}
                    onChange={(e) => setProfileForm({ ...profileForm, GRED: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold text-slate-800"
                  >
                    {GRADES.map(g => (
                      <option key={g} value={g}>Gred {g}</option>
                    ))}
                  </select>
                </div>

                {/* STATUS JAWATAN */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Status Pelantikan</label>
                  <select
                    value={profileForm.STATUS_JAWATAN}
                    onChange={(e) => setProfileForm({ ...profileForm, STATUS_JAWATAN: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold text-slate-800"
                  >
                    {STATUS_JAWATAN.map(sj => (
                      <option key={sj} value={sj}>{sj}</option>
                    ))}
                  </select>
                </div>

                {/* KEMENTERIAN */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-slate-600 block">Kementerian / Jabatan</label>
                  <select
                    value={profileForm.KEMENTERIAN}
                    onChange={(e) => setProfileForm({ ...profileForm, KEMENTERIAN: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold text-slate-800"
                  >
                    {MINISTRIES.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* TEMPAT BERTUGAS */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-slate-600 block">Alamat / Tempat Bertugas Spesifik</label>
                  <input
                    type="text"
                    required
                    value={profileForm.TEMPAT_BERTUGAS}
                    onChange={(e) => setProfileForm({ ...profileForm, TEMPAT_BERTUGAS: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 bg-slate-55 font-semibold text-slate-800"
                  />
                </div>

                {/* NEGERI */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Negeri Penempatan</label>
                  <select
                    value={profileForm.NEGERI}
                    onChange={(e) => setProfileForm({ ...profileForm, NEGERI: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold text-slate-800"
                  >
                    {STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* KAUM */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Kaum / Etnik</label>
                  <select
                    value={profileForm.KAUM}
                    onChange={(e) => setProfileForm({ ...profileForm, KAUM: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold text-slate-800"
                  >
                    {KAUM.map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>

                {/* JANTINA */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Jantina</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-1.5 font-semibold">
                      <input
                        type="radio"
                        name="jantina"
                        value="L"
                        checked={profileForm.JANTINA === 'L'}
                        onChange={() => setProfileForm({ ...profileForm, JANTINA: 'L' })}
                      />
                      <span>Lelaki</span>
                    </label>
                    <label className="flex items-center gap-1.5 font-semibold">
                      <input
                        type="radio"
                        name="jantina"
                        value="P"
                        checked={profileForm.JANTINA === 'P'}
                        onChange={() => setProfileForm({ ...profileForm, JANTINA: 'P' })}
                      />
                      <span>Perempuan</span>
                    </label>
                  </div>
                </div>

                {/* TARIKH LAHIR */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Tarikh Lahir</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15-SEP-1978"
                    value={profileForm.TARIKH_LAHIR}
                    onChange={(e) => setProfileForm({ ...profileForm, TARIKH_LAHIR: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 bg-slate-50 font-semibold text-slate-800"
                  />
                </div>

                {/* PILIHAN UMUR PERSARAAN */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Pilihan Umur Persaraan</label>
                  <input
                    type="number"
                    required
                    value={profileForm.PILIHAN_UMUR_PERSARAAN}
                    onChange={(e) => setProfileForm({ ...profileForm, PILIHAN_UMUR_PERSARAAN: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 bg-slate-50 font-semibold text-slate-800"
                  />
                </div>

                {/* TARIKH BERSARA */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Tarikh Bersara Wajib</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15-SEP-2036"
                    value={profileForm.TARIKH_BERSARA}
                    onChange={(e) => setProfileForm({ ...profileForm, TARIKH_BERSARA: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 bg-slate-50 font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-gov-blue-700 hover:bg-gov-blue-800 text-white px-5 py-2.5 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Simpan Kemaskini
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Case Details Modal */}
      {showCaseModal && caseForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-5 w-5 text-gov-gold-400" />
                <h3 className="text-sm font-bold">Kemaskini Fail Kes Tatatertib</h3>
              </div>
              <button 
                onClick={() => {
                  setShowCaseModal(false);
                  setEditingCase(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveCase} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NO RUJ FAIL JPA */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">No. Rujukan Fail JPA</label>
                  <input
                    type="text"
                    required
                    value={caseForm.metadata.NO_RUJ_FAIL_JPA}
                    onChange={(e) => setCaseForm({ 
                      ...caseForm, 
                      metadata: { ...caseForm.metadata, NO_RUJ_FAIL_JPA: e.target.value } 
                    })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 bg-slate-50 font-semibold text-slate-800"
                  />
                </div>

                {/* PUNCA KES */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Punca Kes / Aduan</label>
                  <select
                    value={caseForm.details.PUNCA_KES}
                    onChange={(e) => setCaseForm({ 
                      ...caseForm, 
                      details: { ...caseForm.details, PUNCA_KES: e.target.value } 
                    })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold text-slate-800"
                  >
                    {PUNCA_KES.map(pk => (
                      <option key={pk} value={pk}>{pk}</option>
                    ))}
                  </select>
                </div>

                {/* STATUS KATEGORI UTAMA (Workflow Phase) */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-slate-600 block">Fasa Aliran Utama</label>
                  <select
                    value={caseForm.workflow.STATUS_KATEGORI_UTAMA}
                    onChange={(e) => setCaseForm({ 
                      ...caseForm, 
                      workflow: { ...caseForm.workflow, STATUS_KATEGORI_UTAMA: e.target.value } 
                    })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold text-slate-800"
                  >
                    <option value="Klarifikasi & Perincian Kesalahan">1.0 Klarifikasi & Perincian Kesalahan</option>
                    <option value="Penentuan Pengerusi">2.0 Penentuan Pengerusi</option>
                    <option value="Surat Pertuduhan (SP)">3.0 Surat Pertuduhan (SP)</option>
                    <option value="Penyerahan Hukuman & Keputusan Lembaga (PH/LTT)">4.0 Penyerahan Hukuman & Keputusan Lembaga (PH/LTT)</option>
                  </select>
                </div>

                {/* STATUS KEMASKINI DI HRMIS */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Status Kemaskini HRMIS</label>
                  <select
                    value={caseForm.workflow.STATUS_KEMASKINI_KES_DI_HRMIS}
                    onChange={(e) => setCaseForm({ 
                      ...caseForm, 
                      workflow: { 
                        ...caseForm.workflow, 
                        STATUS_KEMASKINI_KES_DI_HRMIS: e.target.value as CompleteCase['workflow']['STATUS_KEMASKINI_KES_DI_HRMIS'] 
                      } 
                    })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold text-slate-800"
                  >
                    <option value="Incomplete">Incomplete</option>
                    <option value="SP Updated">SP Updated</option>
                    <option value="SK Updated">SK Updated</option>
                  </select>
                </div>

                {/* PEGAWAI KES */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Pegawai Kes Mengurus</label>
                  <input
                    type="text"
                    value={caseForm.workflow.PEGAWAI_KES}
                    onChange={(e) => setCaseForm({ 
                      ...caseForm, 
                      workflow: { ...caseForm.workflow, PEGAWAI_KES: e.target.value } 
                    })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 bg-slate-50 font-semibold text-slate-800"
                  />
                </div>

                {/* RINGKASAN KESALAHAN */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-slate-600 block">Ringkasan Ringkas Kesalahan</label>
                  <textarea
                    rows={3}
                    value={caseForm.details.RINGKASAN_KESALAHAN}
                    onChange={(e) => setCaseForm({ 
                      ...caseForm, 
                      details: { ...caseForm.details, RINGKASAN_KESALAHAN: e.target.value } 
                    })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 bg-slate-50 font-semibold text-slate-800"
                  />
                </div>

                {/* ULASAN URUS SETIA */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-slate-600 block">Ulasan Urus Setia</label>
                  <textarea
                    rows={3}
                    value={caseForm.details.ULASAN_URUS_SETIA}
                    onChange={(e) => setCaseForm({ 
                      ...caseForm, 
                      details: { ...caseForm.details, ULASAN_URUS_SETIA: e.target.value } 
                    })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 bg-slate-50 font-semibold text-slate-800"
                  />
                </div>

                {/* Google Drive links */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-slate-600 block">Pautan Google Drive Fail (Folder)</label>
                  <input
                    type="url"
                    value={caseForm.metadata.URL_LINK_GD}
                    onChange={(e) => setCaseForm({ 
                      ...caseForm, 
                      metadata: { ...caseForm.metadata, URL_LINK_GD: e.target.value } 
                    })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 bg-slate-50 font-semibold text-slate-800"
                  />
                </div>

                {/* Kertas Makluman (PP) link */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Pautan Kertas Makluman (PP)</label>
                  <input
                    type="url"
                    value={caseForm.metadata.URL_LINK_PP || ''}
                    onChange={(e) => setCaseForm({ 
                      ...caseForm, 
                      metadata: { ...caseForm.metadata, URL_LINK_PP: e.target.value } 
                    })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 bg-slate-50 font-semibold text-slate-800"
                  />
                </div>

                {/* Surat Pertuduhan (SP) link */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Pautan Surat Pertuduhan (SP)</label>
                  <input
                    type="url"
                    value={caseForm.metadata.URL_LINK_SP || ''}
                    onChange={(e) => setCaseForm({ 
                      ...caseForm, 
                      metadata: { ...caseForm.metadata, URL_LINK_SP: e.target.value } 
                    })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-gov-blue-500 bg-slate-50 font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCaseModal(false);
                    setEditingCase(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-gov-blue-700 hover:bg-gov-blue-800 text-white px-5 py-2.5 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Simpan Kemaskini
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
