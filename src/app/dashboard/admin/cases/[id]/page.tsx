'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CompleteCase } from '@/lib/types';
import { 
  INITIAL_CASES, GRADES, MINISTRIES, STATES, KAUM, STATUS_JAWATAN, PUNCA_KES 
} from '@/lib/mock-data';
import { 
  ArrowLeft, CircleUser, ExternalLink, Calendar, 
  MapPin, Database, FolderGit2,
  Edit, CloudLightning, FileSpreadsheet, RefreshCw, X, Check,
  Presentation, Folder, Search
} from 'lucide-react';

const getEmbedUrl = (url: string | undefined) => {
  if (!url) return '';
  if (url.includes('drive.google.com/file/d/')) {
    return url.replace(/\/view\??.*/, '/preview');
  }
  if (url.includes('docs.google.com/presentation/d/')) {
    return url.replace(/\/edit\??.*/, '/embed');
  }
  return url;
};

export default function OfficerProfileDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [cases, setCases] = useState<CompleteCase[]>([]);
  const [officerCases, setOfficerCases] = useState<CompleteCase[]>([]);
  const [officerProfile, setOfficerProfile] = useState<CompleteCase['officer'] | null>(null);

  // New tab state for case presentation and file table selection
  const [activeSubTab, setActiveSubTab] = useState<'senarai' | 'pembentangan'>('senarai');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');

  // Google connectivity simulation states
  const [connectedEmail, setConnectedEmail] = useState<string>('');
  const [connectingEmail, setConnectingEmail] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('syazmiza0304@gmail.com');
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);

  // Searchable select component states & ref
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

  const filteredCasesForSelect = officerCases.filter(c => {
    const term = dropdownSearch.toLowerCase();
    return (
      c.metadata.NO_RUJ_FAIL_JPA.toLowerCase().includes(term) ||
      c.workflow.STATUS_KATEGORI_UTAMA.toLowerCase().includes(term)
    );
  });

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
    const filtered = allCases.filter(c => c.officer.NO_KP === id);

    setTimeout(() => {
      setCases(allCases);
      setOfficerCases(filtered);
      if (filtered.length > 0) {
        setOfficerProfile(filtered[0].officer);
        setSelectedCaseId(filtered[0].metadata.NO_RUJ_FAIL_JPA);
      }
    }, 0);
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

  // Google connectivity simulator handler
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

  const activeCase = officerCases.find(c => c.metadata.NO_RUJ_FAIL_JPA === selectedCaseId) || officerCases[0];

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

      {/* Tab Navigation Menu */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveSubTab('senarai')}
          className={`pb-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'senarai'
              ? 'border-gov-blue-700 text-gov-blue-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Senarai Fail Kes Tatatertib
        </button>
        <button
          onClick={() => setActiveSubTab('pembentangan')}
          className={`pb-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'pembentangan'
              ? 'border-gov-blue-700 text-gov-blue-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Presentation className="h-4 w-4" />
          Pembentangan Kes (Google Slides)
        </button>
      </div>

      {activeSubTab === 'senarai' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
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
                        <td className="py-4.5 px-6 font-mono text-gov-blue-700 font-bold sticky left-0 bg-white hover:bg-slate-50 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] border-r border-slate-100">
                          {c.metadata.NO_RUJ_FAIL_JPA}
                        </td>
                        <td className="py-4.5 px-6">
                          <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                            {c.details.JENIS_KESALAHAN.map((jk, idx) => (
                              <span key={idx} className="bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded-full block border border-slate-200">
                                {jk}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4.5 px-6">
                          <span className={`inline-block whitespace-nowrap px-2.5 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider ${getStatusBadge(c.workflow.STATUS_KATEGORI_UTAMA)}`}>
                            {c.workflow.STATUS_KATEGORI_UTAMA}
                          </span>
                        </td>
                        <td className="py-4.5 px-6 max-w-[280px]">
                          <span className="text-slate-600 line-clamp-3 leading-relaxed font-normal" title={c.details.RINGKASAN_KESALAHAN}>
                            {c.details.RINGKASAN_KESALAHAN}
                          </span>
                        </td>
                        <td className="py-4.5 px-6 font-bold text-slate-600">
                          {c.details.PUNCA_KES}
                        </td>
                        <td className="py-4.5 px-6 max-w-[300px]">
                          <p className="text-slate-500 line-clamp-3 leading-relaxed font-normal" title={c.details.ULASAN_URUS_SETIA}>
                            {c.details.ULASAN_URUS_SETIA}
                          </p>
                        </td>
                        <td className="py-4.5 px-6">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getHrmisBadge(c.workflow.STATUS_KEMASKINI_KES_DI_HRMIS)}`}>
                            {c.workflow.STATUS_KEMASKINI_KES_DI_HRMIS}
                          </span>
                        </td>
                        <td className="py-4.5 px-6 text-slate-600 space-y-0.5">
                          {c.workflow.PEGAWAI_KES && <span className="block text-[10px] font-bold"><strong className="text-[8px] text-slate-400 block">PEG. KES:</strong> {c.workflow.PEGAWAI_KES}</span>}
                          {c.workflow.SME && <span className="block text-[10px]"><strong className="text-[8px] text-slate-400 block">SME:</strong> {c.workflow.SME}</span>}
                          {c.workflow.PEGAWAI_PENYEMAK && <span className="block text-[10px]"><strong className="text-[8px] text-slate-400 block">PENYEMAK:</strong> {c.workflow.PEGAWAI_PENYEMAK}</span>}
                        </td>
                        <td className="py-4.5 px-6 font-mono text-[10px] text-slate-500">
                          {c.workflow.TARIKH_TERIMA_PERAKUAN || '-'}
                        </td>
                        <td className="py-4.5 px-6">
                          <div className="flex flex-col gap-1.5 max-w-[200px]">
                            {c.metadata.URL_LINK_GD && (
                              <a href={c.metadata.URL_LINK_GD} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-[9px] font-bold bg-slate-100 hover:bg-gov-blue-50 text-slate-600 hover:text-gov-blue-700 rounded-lg flex items-center justify-between border border-slate-200 transition-colors">
                                <span>Folder Fail (Drive)</span>
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            )}
                            {c.metadata.URL_LINK_PP && (
                              <a href={c.metadata.URL_LINK_PP} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-[9px] font-bold bg-slate-100 hover:bg-gov-blue-50 text-slate-600 hover:text-gov-blue-700 rounded-lg flex items-center justify-between border border-slate-200 transition-colors">
                                <span>Kertas Makluman (PP)</span>
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            )}
                            {c.metadata.URL_LINK_SP && (
                              <a href={c.metadata.URL_LINK_SP} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-[9px] font-bold bg-slate-100 hover:bg-gov-blue-50 text-slate-600 hover:text-gov-blue-700 rounded-lg flex items-center justify-between border border-slate-200 transition-colors">
                                <span>Surat Pertuduhan (SP)</span>
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            )}
                          </div>
                        </td>
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
      )}

      {activeSubTab === 'pembentangan' && activeCase && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Presentation className="h-5 w-5 text-gov-blue-700" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">Urus Setia Pembentangan Slaid Kes</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Paparan Window Interaktif Google Workspace</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-slate-500 font-bold shrink-0">Cari & Pilih Fail Kes:</span>
              <div className="relative w-[320px] md:w-[420px]" ref={dropdownRef}>
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder={activeCase ? `${activeCase.metadata.NO_RUJ_FAIL_JPA} (${activeCase.workflow.STATUS_KATEGORI_UTAMA})` : "Cari fail kes..."}
                    value={dropdownSearch}
                    onChange={(e) => {
                      setDropdownSearch(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full px-3.5 py-1.5 pr-10 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all bg-slate-50 text-slate-700 placeholder-slate-700 font-sans"
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
            <div className="md:col-span-8 space-y-4">
              {!connectedEmail ? (
                /* Simulated Google Auth Portal */
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-center space-y-4 flex flex-col items-center justify-center aspect-video shadow-inner">
                  <div className="h-12 w-12 rounded-full bg-gov-blue-50 text-gov-blue-700 flex items-center justify-center animate-pulse">
                    <Database className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800 font-sans">Uji Sambungan Google Slides Portal Tatatertib</h4>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto">
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
                </div>
              )}
              <div className="p-4 bg-gov-blue-50/50 border border-gov-blue-100/50 rounded-2xl flex items-start gap-3">
                <Database className="h-4.5 w-4.5 text-gov-blue-700 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-gov-blue-900 block">Autentikasi Kredensial SSO Google Workspace</span>
                  <p className="text-[9px] text-slate-500 font-medium leading-relaxed">Sesi pembentangan di atas disegerakkan dengan e-mel rasmi penjawat awam secara Single-Sign-On (SSO). Kebenaran membaca dan mengedit draf slaid adalah terikat kepada tetapan kebenaran Google Workspace & Drive rasmi anda.</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
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
      )}

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
