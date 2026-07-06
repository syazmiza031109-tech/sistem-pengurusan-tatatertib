'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GRADES, MINISTRIES, STATES, KAUM, STATUS_JAWATAN, 
  JENIS_KESALAHAN, PUNCA_KES, INITIAL_CASES
} from '@/lib/mock-data';
import { CompleteCase } from '@/lib/types';
import { 
  ChevronRight, ChevronLeft, Send, CheckCircle2, 
  Database, User, Info, FileCode2, ExternalLink
} from 'lucide-react';

function generateMockMetadata() {
  return {
    BIL: Date.now(),
    NO_RUJ_FAIL_JPA: `JPA.C.P.100-2/4/${Math.floor(Math.random() * 90) + 10}(${Math.floor(Math.random() * 90) + 10})`,
    BIL_IKUT_SUSUNAN_PAPER: `2026/${Math.floor(Math.random() * 9) + 1}/${Math.floor(Math.random() * 28) + 1}`
  };
}

export default function RegisterCase() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Autocomplete & Profile cache lookup states
  const [existingCases, setExistingCases] = useState<CompleteCase[]>([]);
  const [suggestions, setSuggestions] = useState<CompleteCase['officer'][]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [autofillSuccess, setAutofillSuccess] = useState(false);

  // Cache generated metadata to ensure purity during render passes
  const [generatedMetadata, setGeneratedMetadata] = useState<{
    BIL: number;
    NO_RUJ_FAIL_JPA: string;
    BIL_IKUT_SUSUNAN_PAPER: string;
  } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('spt_cases');
    setTimeout(() => {
      if (stored) {
        setExistingCases(JSON.parse(stored));
      } else {
        setExistingCases(INITIAL_CASES);
      }
    }, 0);
  }, []);


  const handleNoKpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, NO_KP: val }));

    if (errors.NO_KP) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs.NO_KP;
        return newErrs;
      });
    }

    if (val.length >= 3) {
      // Filter unique officers matching the search
      const uniqueMap = new Map<string, CompleteCase['officer']>();
      existingCases.forEach(c => {
        if (c.officer.NO_KP.includes(val)) {
          uniqueMap.set(c.officer.NO_KP, c.officer);
        }
      });
      const list = Array.from(uniqueMap.values());
      setSuggestions(list);
      setShowSuggestions(true);

      // Auto-select if exactly 12-digit match is typed
      const exactMatch = list.find(o => o.NO_KP === val);
      if (exactMatch) {
        selectOfficer(exactMatch);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectOfficer = (officer: CompleteCase['officer']) => {
    setFormData(prev => ({
      ...prev,
      NAMA: officer.NAMA,
      NO_KP: officer.NO_KP,
      TARIKH_LAHIR: officer.TARIKH_LAHIR,
      PILIHAN_UMUR_PERSARAAN: officer.PILIHAN_UMUR_PERSARAAN.toString(),
      TARIKH_BERSARA: officer.TARIKH_BERSARA,
      JANTINA: officer.JANTINA,
      KAUM: officer.KAUM,
      JAWATAN: officer.JAWATAN,
      SKIM: officer.SKIM,
      GRED: officer.GRED,
      STATUS_JAWATAN: officer.STATUS_JAWATAN,
      TEMPAT_BERTUGAS: officer.TEMPAT_BERTUGAS,
      NEGERI: officer.NEGERI,
      KEMENTERIAN: officer.KEMENTERIAN
    }));
    setSuggestions([]);
    setShowSuggestions(false);
    setAutofillSuccess(true);
    setTimeout(() => setAutofillSuccess(false), 4500);
  };

  // Form States
  const [formData, setFormData] = useState({
    // Step 1: Profil Pegawai
    NAMA: '',
    NO_KP: '',
    TARIKH_LAHIR: '',
    PILIHAN_UMUR_PERSARAAN: '60',
    TARIKH_BERSARA: '',
    JANTINA: 'L' as 'L' | 'P',
    KAUM: 'MELAYU',
    JAWATAN: '',
    SKIM: '',
    GRED: '41',
    STATUS_JAWATAN: 'HAKIKI',
    TEMPAT_BERTUGAS: '',
    NEGERI: 'W.P. PUTRAJAYA',
    KEMENTERIAN: 'JPA - Jabatan Perkhidmatan Awam',

    // Step 2: Klasifikasi & Perincian
    KESALAHAN_ALL: '',
    JENIS_KESALAHAN: [] as string[],
    RINGKASAN_KESALAHAN: '',
    ULASAN_URUS_SETIA: '',
    PUNCA_KES: 'JABATAN',
    CATATAN: '',
    URL_LINK_GD: '',
    URL_LINK_LSPRM_LPBI_ADUAN: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const handleCheckboxChange = (kesalahan: string) => {
    setFormData(prev => {
      const selected = prev.JENIS_KESALAHAN.includes(kesalahan)
        ? prev.JENIS_KESALAHAN.filter(item => item !== kesalahan)
        : [...prev.JENIS_KESALAHAN, kesalahan];
      return {
        ...prev,
        JENIS_KESALAHAN: selected
      };
    });
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.NAMA) newErrors.NAMA = 'Nama Pegawai wajib diisi';
      if (!formData.NO_KP || formData.NO_KP.length !== 12 || isNaN(Number(formData.NO_KP))) {
        newErrors.NO_KP = 'No. KP mestilah 12 digit nombor sahaja';
      }
      if (!formData.TARIKH_LAHIR) newErrors.TARIKH_LAHIR = 'Tarikh lahir wajib diisi';
      if (!formData.JAWATAN) newErrors.JAWATAN = 'Jawatan wajib diisi';
      if (!formData.SKIM) newErrors.SKIM = 'Skim perkhidmatan wajib diisi';
      if (!formData.TEMPAT_BERTUGAS) newErrors.TEMPAT_BERTUGAS = 'Tempat bertugas semasa wajib diisi';
    } else if (step === 2) {
      if (!formData.KESALAHAN_ALL) newErrors.KESALAHAN_ALL = 'Perincian kesalahan wajib diisi';
      if (formData.JENIS_KESALAHAN.length === 0) {
        newErrors.JENIS_KESALAHAN = 'Sila pilih sekurang-kurangnya satu jenis kesalahan';
      }
      if (!formData.RINGKASAN_KESALAHAN) newErrors.RINGKASAN_KESALAHAN = 'Ringkasan kesalahan wajib diisi';
      if (!formData.URL_LINK_GD || !formData.URL_LINK_GD.startsWith('http')) {
        newErrors.URL_LINK_GD = 'Pautan Google Drive wajib diisi dan bermula dengan http/https';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2 && !generatedMetadata) {
        setGeneratedMetadata(generateMockMetadata());
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const formatPayload = () => {
    // Generates a mock system metadata reference using cached state to prevent impure random numbers during render
    const meta = generatedMetadata || {
      BIL: 0,
      NO_RUJ_FAIL_JPA: 'JPA.C.P.100-2/4/PENDING',
      BIL_IKUT_SUSUNAN_PAPER: '2026/PENDING'
    };
    
    const payload: CompleteCase = {
      metadata: {
        BIL: meta.BIL,
        NO_RUJ_FAIL_JPA: meta.NO_RUJ_FAIL_JPA,
        BIL_IKUT_SUSUNAN_PAPER: meta.BIL_IKUT_SUSUNAN_PAPER,
        URL_LINK_GD: formData.URL_LINK_GD,
        URL_LINK_LSPRM_LPBI_ADUAN: formData.URL_LINK_LSPRM_LPBI_ADUAN || undefined,
        URL_LINK_PP: '',
        URL_LINK_SP: '',
        URL_LINK_PH: '',
        URL_LINK_SK: ''
      },
      officer: {
        NAMA: formData.NAMA,
        NO_KP: formData.NO_KP,
        TARIKH_LAHIR: formData.TARIKH_LAHIR,
        PILIHAN_UMUR_PERSARAAN: Number(formData.PILIHAN_UMUR_PERSARAAN),
        TARIKH_BERSARA: formData.TARIKH_BERSARA || '12-DEC-2045',
        JANTINA: formData.JANTINA,
        KAUM: formData.KAUM,
        JAWATAN: formData.JAWATAN,
        SKIM: formData.SKIM,
        GRED: formData.GRED,
        STATUS_JAWATAN: formData.STATUS_JAWATAN,
        TEMPAT_BERTUGAS: formData.TEMPAT_BERTUGAS,
        NEGERI: formData.NEGERI,
        KEMENTERIAN: formData.KEMENTERIAN
      },
      details: {
        KESALAHAN_ALL: formData.KESALAHAN_ALL,
        JENIS_KESALAHAN: formData.JENIS_KESALAHAN,
        RINGKASAN_KESALAHAN: formData.RINGKASAN_KESALAHAN,
        ULASAN_URUS_SETIA: formData.ULASAN_URUS_SETIA,
        PUNCA_KES: formData.PUNCA_KES,
        CATATAN: formData.CATATAN || undefined,
        LINK_PINDA_CATATAN: '',
        TARIKH_KEMUKA_PINDA_KERTAS: new Date().toISOString()
      },
      workflow: {
        STATUS_KATEGORI: 'A01 Agihan kes - Urusetia',
        STATUS_KATEGORI_UTAMA: 'Klarifikasi & Perincian Kesalahan',
        STATUS_KEMASKINI_KES_DI_HRMIS: 'Incomplete',
        PEGAWAI_KES: '17) LAIN-LAIN PEGAWAI URUS SETIA',
        TAHUN_TERIMA: new Date().getFullYear(),
        TARIKH_TERIMA_PERAKUAN: new Date().toISOString().split('T')[0],
        TAHUN_KPI: new Date().getFullYear(),
      }
    };
    return payload;
  };

  const handleSyncToSheets = async () => {
    setIsSyncing(true);
    setSyncLogs([]);
    
    const logs = [
      'Menyemak sambungan Google API OAuth2...',
      'Membuka fail Google Sheets: "SPT_Tatatertib_Data_Studio_Reporting"...',
      'Mengambil fail profil pegawai untuk No. KP: ' + formData.NO_KP + '...',
      'Memformat data payload JSON ke baris helaian (Row Payload Sync)...',
      'Menulis entri baharu ke Helaian [D1_Profil_Pegawai]...',
      'Menulis entri baharu ke Helaian [D2_Kes_Metadata]...',
      'Menetapkan pautan folder Google Drive: ' + formData.URL_LINK_GD + '...',
      'Berjaya mengemas kini helaian Google Sheets! Tindakan status: 200 OK.'
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setSyncLogs(prev => [...prev, logs[i]]);
    }

    setIsSyncing(false);
    setSyncSuccess(true);
    
    // Save to local storage
    const newCase = formatPayload();
    const stored = localStorage.getItem('spt_cases');
    const casesList: CompleteCase[] = stored ? JSON.parse(stored) : [];
    
    // Maintain database sync integrity by propagating profile updates
    const updatedList = casesList.map(c => {
      if (c.officer.NO_KP === newCase.officer.NO_KP) {
        return {
          ...c,
          officer: { ...newCase.officer }
        };
      }
      return c;
    });

    updatedList.unshift(newCase);
    localStorage.setItem('spt_cases', JSON.stringify(updatedList));

    // Wait a moment and redirect
    setTimeout(() => {
      router.push('/dashboard/admin');
    }, 1800);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-gov-blue-700 tracking-tight">Pendaftaran Kes Tatatertib Baharu</h2>
        <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mt-0.5">Borang Pendaftaran Multi-Langkah & Google Sheets Sync</p>
      </div>

      {/* Stepper Header */}
      <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        {[
          { step: 1, label: 'Profil Pegawai', icon: User },
          { step: 2, label: 'Perincian Kes', icon: Info },
          { step: 3, label: 'Pengesahan & Sync', icon: Database },
        ].map((s, idx) => {
          const isActive = currentStep === s.step;
          const isCompleted = currentStep > s.step;
          return (
            <React.Fragment key={s.step}>
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isActive 
                    ? 'bg-gov-blue-700 text-white shadow-md shadow-gov-blue-700/20' 
                    : isCompleted 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-100 text-slate-400'
                }`}>
                  {isCompleted ? '✓' : s.step}
                </div>
                <span className={`text-xs font-bold ${isActive ? 'text-gov-blue-700' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
              {idx < 2 && <div className="h-0.5 bg-slate-100 flex-1 mx-4 max-w-[80px]"></div>}
            </React.Fragment>
          );
        })}
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2.5">Langkah 1: Profil & Biodata Pegawai Awam</h3>

            {autofillSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Biodata pegawai berjaya dimuatkan dari rekod pangkalan data.</span>
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Nama */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">Nama Pegawai</label>
                <input
                  type="text"
                  name="NAMA"
                  value={formData.NAMA}
                  onChange={handleInputChange}
                  placeholder="Contoh: Ahmad bin Ismail"
                  className={`w-full px-4 py-3 rounded-xl border text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all ${
                    errors.NAMA ? 'border-red-500 bg-red-50/10' : 'border-slate-200'
                  }`}
                />
                {errors.NAMA && <span className="text-[10px] text-red-500 font-bold">{errors.NAMA}</span>}
              </div>

              {/* No KP */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-500 block">No. Kad Pengenalan (Tanpa Sengkang)</label>
                <div className="relative">
                  <input
                    type="text"
                    name="NO_KP"
                    maxLength={12}
                    value={formData.NO_KP}
                    onChange={handleNoKpChange}
                    placeholder="Contoh: 820412145533"
                    className={`w-full px-4 py-3 rounded-xl border text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all ${
                      errors.NO_KP ? 'border-red-500 bg-red-50/10' : 'border-slate-200'
                    }`}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-20 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {suggestions.map((s) => (
                        <div
                          key={s.NO_KP}
                          onClick={() => selectOfficer(s)}
                          className="p-3 hover:bg-slate-50 cursor-pointer text-xs flex justify-between items-center transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-800 block">{s.NAMA}</span>
                            <span className="text-[10px] text-slate-400 font-mono">KP: {s.NO_KP}</span>
                          </div>
                          <span className="text-[9px] bg-gov-blue-50 text-gov-blue-700 px-2 py-0.5 rounded font-bold border border-gov-blue-100">Wujud</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.NO_KP && <span className="text-[10px] text-red-500 font-bold">{errors.NO_KP}</span>}
              </div>

              {/* Tarikh Lahir */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">Tarikh Lahir</label>
                <input
                  type="date"
                  name="TARIKH_LAHIR"
                  value={formData.TARIKH_LAHIR}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all ${
                    errors.TARIKH_LAHIR ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.TARIKH_LAHIR && <span className="text-[10px] text-red-500 font-bold">{errors.TARIKH_LAHIR}</span>}
              </div>

              {/* Umur Persaraan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">Pilihan Umur Persaraan</label>
                <select
                  name="PILIHAN_UMUR_PERSARAAN"
                  value={formData.PILIHAN_UMUR_PERSARAAN}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all"
                >
                  <option value="55">55 Tahun</option>
                  <option value="56">56 Tahun</option>
                  <option value="58">58 Tahun</option>
                  <option value="60">60 Tahun</option>
                </select>
              </div>

              {/* Jantina */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">Jantina</label>
                <div className="flex gap-6 py-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="JANTINA"
                      value="L"
                      checked={formData.JANTINA === 'L'}
                      onChange={() => setFormData(p => ({ ...p, JANTINA: 'L' }))}
                      className="text-gov-blue-700 focus:ring-gov-blue-500"
                    />
                    <span>Lelaki</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="JANTINA"
                      value="P"
                      checked={formData.JANTINA === 'P'}
                      onChange={() => setFormData(p => ({ ...p, JANTINA: 'P' }))}
                      className="text-gov-blue-700 focus:ring-gov-blue-500"
                    />
                    <span>Perempuan</span>
                  </label>
                </div>
              </div>

              {/* Kaum */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">Kaum</label>
                <select
                  name="KAUM"
                  value={formData.KAUM}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all"
                >
                  {KAUM.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>

              {/* Jawatan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">Nama Jawatan</label>
                <input
                  type="text"
                  name="JAWATAN"
                  value={formData.JAWATAN}
                  onChange={handleInputChange}
                  placeholder="Contoh: Pegawai Teknologi Maklumat"
                  className={`w-full px-4 py-3 rounded-xl border text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all ${
                    errors.JAWATAN ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.JAWATAN && <span className="text-[10px] text-red-500 font-bold">{errors.JAWATAN}</span>}
              </div>

              {/* Skim */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">Skim Perkhidmatan</label>
                <input
                  type="text"
                  name="SKIM"
                  value={formData.SKIM}
                  onChange={handleInputChange}
                  placeholder="Contoh: F - Teknologi Maklumat dan Komunikasi"
                  className={`w-full px-4 py-3 rounded-xl border text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all ${
                    errors.SKIM ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.SKIM && <span className="text-[10px] text-red-500 font-bold">{errors.SKIM}</span>}
              </div>

              {/* Gred */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">Gred Jawatan</label>
                <select
                  name="GRED"
                  value={formData.GRED}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all"
                >
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* Status Jawatan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">Status Jawatan</label>
                <select
                  name="STATUS_JAWATAN"
                  value={formData.STATUS_JAWATAN}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all"
                >
                  {STATUS_JAWATAN.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Tempat Bertugas Semasa */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 block">Tempat Bertugas Semasa Perakuan Tatatertib Diterima JPA</label>
                <input
                  type="text"
                  name="TEMPAT_BERTUGAS"
                  value={formData.TEMPAT_BERTUGAS}
                  onChange={handleInputChange}
                  placeholder="Contoh: Bahagian Pengurusan Maklumat, JPA Putrajaya"
                  className={`w-full px-4 py-3 rounded-xl border text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all ${
                    errors.TEMPAT_BERTUGAS ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.TEMPAT_BERTUGAS && <span className="text-[10px] text-red-500 font-bold">{errors.TEMPAT_BERTUGAS}</span>}
              </div>

              {/* Negeri Bertugas */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">Negeri Tempat Bertugas</label>
                <select
                  name="NEGERI"
                  value={formData.NEGERI}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all"
                >
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Kementerian */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">Kementerian / Jabatan Pengawal</label>
                <select
                  name="KEMENTERIAN"
                  value={formData.KEMENTERIAN}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all"
                >
                  {MINISTRIES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2.5">Langkah 2: Klasifikasi & Perincian Kesalahan</h3>

            <div className="space-y-6">
              {/* Jenis Kesalahan (Multi-select) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 block">Jenis Kesalahan (Boleh pilih lebih dari satu)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  {JENIS_KESALAHAN.map(jk => {
                    const isChecked = formData.JENIS_KESALAHAN.includes(jk);
                    return (
                      <label 
                        key={jk}
                        className={`flex items-start gap-2.5 p-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all duration-200 ${
                          isChecked 
                            ? 'bg-gov-blue-50 border-gov-blue-200 text-gov-blue-800 shadow-sm' 
                            : 'border-transparent bg-white hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(jk)}
                          className="mt-0.5 rounded text-gov-blue-700 focus:ring-gov-blue-500"
                        />
                        <span>{jk}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.JENIS_KESALAHAN && <span className="text-[10px] text-red-500 font-bold block">{errors.JENIS_KESALAHAN}</span>}
              </div>

              {/* Perincian Kesalahan All */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">Keterangan Kesalahan Penuh (KESALAHAN ALL)</label>
                <textarea
                  name="KESALAHAN_ALL"
                  value={formData.KESALAHAN_ALL}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Keterangan terperinci tentang insiden tatatertib, contoh: ketidakhadiran berturut-turut, pemalsuan, conflict of interest..."
                  className={`w-full px-4 py-3 rounded-xl border text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all ${
                    errors.KESALAHAN_ALL ? 'border-red-500 bg-red-50/10' : 'border-slate-200'
                  }`}
                ></textarea>
                {errors.KESALAHAN_ALL && <span className="text-[10px] text-red-500 font-bold">{errors.KESALAHAN_ALL}</span>}
              </div>

              {/* Ringkasan Kesalahan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">Ringkasan Eksekutif Kesalahan</label>
                <textarea
                  name="RINGKASAN_KESALAHAN"
                  value={formData.RINGKASAN_KESALAHAN}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Ringkasan ringkas satu atau dua baris untuk paparan visual dashboard"
                  className={`w-full px-4 py-3 rounded-xl border text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all ${
                    errors.RINGKASAN_KESALAHAN ? 'border-red-500 bg-red-50/10' : 'border-slate-200'
                  }`}
                ></textarea>
                {errors.RINGKASAN_KESALAHAN && <span className="text-[10px] text-red-500 font-bold">{errors.RINGKASAN_KESALAHAN}</span>}
              </div>

              {/* Ulasan Urus Setia */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">Ulasan Urus Setia (Remarks)</label>
                <textarea
                  name="ULASAN_URUS_SETIA"
                  value={formData.ULASAN_URUS_SETIA}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Ulasan pentadbiran daripada urus setia kes..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all"
                ></textarea>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Punca Kes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 block">Punca Asal Kes (Root Cause)</label>
                  <select
                    name="PUNCA_KES"
                    value={formData.PUNCA_KES}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all"
                  >
                    {PUNCA_KES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* Google Drive Link */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 block">Pautan Google Drive Folder Kes</label>
                  <input
                    type="text"
                    name="URL_LINK_GD"
                    value={formData.URL_LINK_GD}
                    onChange={handleInputChange}
                    placeholder="Contoh: https://drive.google.com/drive/folders/..."
                    className={`w-full px-4 py-3 rounded-xl border text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all ${
                      errors.URL_LINK_GD ? 'border-red-500 bg-red-50/10' : 'border-slate-200'
                    }`}
                  />
                  {errors.URL_LINK_GD && <span className="text-[10px] text-red-500 font-bold">{errors.URL_LINK_GD}</span>}
                </div>

                {/* Catatan Tambahan */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 block">Catatan Tambahan</label>
                  <textarea
                    name="CATATAN"
                    value={formData.CATATAN}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="General tracking notes..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all"
                  ></textarea>
                </div>

                {/* External Agency Case Reference */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 block">Pautan Rujukan Agensi Luar (SPRM / Mahkamah / Aduan) - Jika Ada</label>
                  <input
                    type="text"
                    name="URL_LINK_LSPRM_LPBI_ADUAN"
                    value={formData.URL_LINK_LSPRM_LPBI_ADUAN}
                    onChange={handleInputChange}
                    placeholder="Contoh: https://aduan.sprm.gov.my/case/..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2.5">Langkah 3: Pengesahan Fail & Google Sheets API Payload Sync</h3>

            {/* Simulated Live Payload Console */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Draf Skema Payload Google Sheets API (JSON)</span>
                <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded font-mono text-[10px]">
                  REST Payload Format
                </span>
              </div>
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner">
                <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center gap-2">
                  <FileCode2 className="h-4 w-4 text-gov-gold-400" />
                  <span className="text-[10px] font-mono text-slate-300 font-bold uppercase tracking-wider">payload.json</span>
                </div>
                <pre className="p-4 text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-56 leading-relaxed">
                  {JSON.stringify(formatPayload(), null, 2)}
                </pre>
              </div>
            </div>

            {/* Sync Status Overlay / Progress Console */}
            {isSyncing && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 border-3 border-gov-blue-700 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-gov-blue-700">Menghantar Data Ke Helaian Google Sheets...</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Proses Berjalan</span>
                </div>
                
                {/* Sync Console Logs */}
                <div className="bg-slate-900 p-4 rounded-xl font-mono text-[9px] text-slate-300 space-y-1.5 max-h-36 overflow-y-auto">
                  {syncLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>
                      <span className={log.includes('Berjaya') ? 'text-emerald-400 font-bold' : ''}>➔ {log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {syncSuccess && (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-fade-in">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-800">Penyelarasan Google Sheets Berjaya!</h4>
                <p className="text-xs text-emerald-600 font-medium">Data kes telah diselaraskan ke helaian dan bersedia untuk visualisasi Data Studio.</p>
              </div>
            )}

            {/* Summary Grid View */}
            {!isSyncing && !syncSuccess && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-200">Rumusan Ringkas Maklumat</h4>
                
                <div className="grid md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold">NAMA PEGAWAI AWAM</span>
                    <span>{formData.NAMA} (KP: {formData.NO_KP})</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold">JAWATAN & GRED</span>
                    <span>{formData.JAWATAN} (Gred {formData.GRED})</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold">KEMENTERIAN & TEMPAT BERTUGAS</span>
                    <span className="block truncate">{formData.KEMENTERIAN}</span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{formData.TEMPAT_BERTUGAS}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold">KLASIFIKASI KESALAHAN</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {formData.JENIS_KESALAHAN.map(jk => (
                        <span key={jk} className="bg-slate-200 text-slate-700 text-[9px] px-2 py-0.5 rounded-full font-bold">
                          {jk}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <span className="text-[10px] text-slate-400 block font-bold">PAUTAN GOOGLE DRIVE FOLDER KES</span>
                    <span className="text-gov-blue-700 font-mono text-[10px] flex items-center gap-1.5">
                      {formData.URL_LINK_GD}
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Button Controls */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={currentStep === 1 ? () => router.push('/dashboard/admin') : handlePrev}
          disabled={isSyncing}
          className="flex items-center gap-2 px-5 py-3 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{currentStep === 1 ? 'Batal' : 'Kembali'}</span>
        </button>

        {currentStep < 3 ? (
          <button
            onClick={handleNext}
            className="bg-gov-blue-700 hover:bg-gov-blue-800 text-white flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold shadow-md shadow-gov-blue-500/20 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <span>Seterusnya</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSyncToSheets}
            disabled={isSyncing || syncSuccess}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
              syncSuccess 
                ? 'bg-slate-100 text-slate-400 shadow-none' 
                : 'bg-gov-gold-500 hover:bg-gov-gold-600 text-gov-blue-900 shadow-gov-gold-500/20 hover:scale-[1.02]'
            }`}
          >
            <Send className="h-4 w-4" />
            <span>{isSyncing ? 'Menghantar...' : 'Hantar & Sync ke Google Sheets'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
