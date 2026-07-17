'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  GRADES, MINISTRIES, STATES, KAUM, STATUS_JAWATAN, 
  JENIS_KESALAHAN, PUNCA_KES, INITIAL_CASES, PEGAWAI_KES_OPTIONS
} from '@/lib/mock-data';
import { CompleteCase } from '@/lib/types';
import { 
  ChevronRight, ChevronLeft, Send, CheckCircle2, 
  User, Info, Printer, FileText, RefreshCw, Shield,
  UserCheck, Gavel, Mail
} from 'lucide-react';

function generateMockMetadata() {
  return {
    BIL: Date.now(),
    NO_RUJ_FAIL_JPA: `JPA.C.P.100-2/4/${Math.floor(Math.random() * 90) + 10}(${Math.floor(Math.random() * 90) + 10})`,
    BIL_IKUT_SUSUNAN_PAPER: `2026/${Math.floor(Math.random() * 9) + 1}/${Math.floor(Math.random() * 28) + 1}`
  };
}

export default function RegisterCase() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-bold animate-pulse">Memuatkan Pendaftaran...</div>}>
      <RegisterCaseContent />
    </Suspense>
  );
}

function RegisterCaseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab');
  const [activeSubTab, setActiveSubTab] = useState<string | null>(initialTab);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Autocomplete & Profile cache lookup states
  const [existingCases, setExistingCases] = useState<CompleteCase[]>([]);
  const [autofillSuccess, setAutofillSuccess] = useState(false);

  // Lookup & Workflow States
  const [lookupKp, setLookupKp] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [hasPerformedLookup, setHasPerformedLookup] = useState(false);
  const [isNewOfficer, setIsNewOfficer] = useState(true);
  const [selectedCaseToEdit, setSelectedCaseToEdit] = useState<CompleteCase | null>(null);
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);
  const [lookupChecked, setLookupChecked] = useState(false);
  const [lookupResult, setLookupResult] = useState<{
    exists: boolean;
    officer?: CompleteCase['officer'];
    casesCount?: number;
  } | null>(null);

  // Cache generated metadata to ensure purity during render passes
  const [generatedMetadata, setGeneratedMetadata] = useState<{
    BIL: number;
    NO_RUJ_FAIL_JPA: string;
    BIL_IKUT_SUSUNAN_PAPER: string;
  } | null>(null);

  const handleLookup = () => {
    if (lookupKp.length !== 12) {
      setLookupError('Sila masukkan 12 digit No. KP yang sah (tanpa sengkang).');
      return;
    }
    setLookupError('');

    const matchingCases = existingCases.filter(c => c.officer.NO_KP === lookupKp);
    setLookupChecked(true);

    if (matchingCases.length > 0) {
      setLookupResult({
        exists: true,
        officer: matchingCases[0].officer,
        casesCount: matchingCases.length
      });
    } else {
      setLookupResult({
        exists: false
      });
    }
  };

  const handleConfirmLookup = () => {
    if (!lookupResult) return;

    setFormData(prev => ({ ...prev, NO_KP: lookupKp }));
    setHasPerformedLookup(true);

    if (lookupResult.exists && lookupResult.officer) {
      const officerInfo = lookupResult.officer;
      setFormData(prev => ({
        ...prev,
        NAMA: officerInfo.NAMA,
        TARIKH_LAHIR: officerInfo.TARIKH_LAHIR,
        PILIHAN_UMUR_PERSARAAN: officerInfo.PILIHAN_UMUR_PERSARAAN.toString(),
        TARIKH_BERSARA: officerInfo.TARIKH_BERSARA,
        JANTINA: officerInfo.JANTINA,
        KAUM: officerInfo.KAUM,
        JAWATAN: officerInfo.JAWATAN,
        SKIM: officerInfo.SKIM,
        GRED: officerInfo.GRED,
        STATUS_JAWATAN: officerInfo.STATUS_JAWATAN,
        TEMPAT_BERTUGAS: officerInfo.TEMPAT_BERTUGAS,
        NEGERI: officerInfo.NEGERI,
        KEMENTERIAN: officerInfo.KEMENTERIAN
      }));
      setIsNewOfficer(false);
      setCurrentStep(2);
      setShowNewCaseForm(false);
      setSelectedCaseToEdit(null);
    } else {
      // Clear out the profile details to make it a blank new officer form
      setFormData(prev => ({
        ...prev,
        NAMA: '',
        TARIKH_LAHIR: '',
        PILIHAN_UMUR_PERSARAAN: '60',
        TARIKH_BERSARA: '',
        JANTINA: 'L',
        KAUM: 'MELAYU',
        JAWATAN: '',
        SKIM: '',
        GRED: '41',
        STATUS_JAWATAN: 'HAKIKI',
        TEMPAT_BERTUGAS: '',
        NEGERI: 'W.P. PUTRAJAYA',
        KEMENTERIAN: 'KEMENTERIAN KESIHATAN'
      }));
      setIsNewOfficer(true);
      setCurrentStep(1);
    }
  };

  const handleEditCaseClick = (c: CompleteCase) => {
    setSelectedCaseToEdit(c);
    setFormData(prev => ({
      ...prev,
      NAMA: c.officer.NAMA,
      TARIKH_LAHIR: c.officer.TARIKH_LAHIR,
      PILIHAN_UMUR_PERSARAAN: c.officer.PILIHAN_UMUR_PERSARAAN.toString(),
      TARIKH_BERSARA: c.officer.TARIKH_BERSARA,
      JANTINA: c.officer.JANTINA,
      KAUM: c.officer.KAUM,
      JAWATAN: c.officer.JAWATAN,
      SKIM: c.officer.SKIM,
      GRED: c.officer.GRED,
      STATUS_JAWATAN: c.officer.STATUS_JAWATAN,
      TEMPAT_BERTUGAS: c.officer.TEMPAT_BERTUGAS,
      NEGERI: c.officer.NEGERI,
      KEMENTERIAN: c.officer.KEMENTERIAN,
      KESALAHAN_ALL: c.details.KESALAHAN_ALL || '',
      JENIS_KESALAHAN: c.details.JENIS_KESALAHAN || [],
      RINGKASAN_KESALAHAN: c.details.RINGKASAN_KESALAHAN || '',
      ULASAN_URUS_SETIA: c.details.ULASAN_URUS_SETIA || '',
      PUNCA_KES: c.details.PUNCA_KES || 'JABATAN',
      CATATAN: c.details.CATATAN || '',
      URL_LINK_GD: c.metadata.URL_LINK_GD || '',
      URL_LINK_LSPRM_LPBI_ADUAN: c.metadata.URL_LINK_LSPRM_LPBI_ADUAN || '',
      PEGAWAI_KES: c.workflow.PEGAWAI_KES || '17) LAIN-LAIN PEGAWAI URUS SETIA'
    }));
    setShowNewCaseForm(true);
  };

  const handleAddNewCaseClick = () => {
    setSelectedCaseToEdit(null);
    setFormData(prev => ({
      ...prev,
      KESALAHAN_ALL: '',
      JENIS_KESALAHAN: [],
      RINGKASAN_KESALAHAN: '',
      ULASAN_URUS_SETIA: '',
      PUNCA_KES: 'JABATAN',
      CATATAN: '',
      URL_LINK_GD: '',
      URL_LINK_LSPRM_LPBI_ADUAN: '',
      PEGAWAI_KES: '17) LAIN-LAIN PEGAWAI URUS SETIA'
    }));
    setShowNewCaseForm(true);
  };

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
    PEGAWAI_KES: '17) LAIN-LAIN PEGAWAI URUS SETIA',
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
    const meta = generatedMetadata || generateMockMetadata();
    
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
        PEGAWAI_KES: formData.PEGAWAI_KES || '17) LAIN-LAIN PEGAWAI URUS SETIA',
        TAHUN_TERIMA: new Date().getFullYear(),
        TARIKH_TERIMA_PERAKUAN: new Date().toISOString().split('T')[0],
        TAHUN_KPI: new Date().getFullYear(),
      }
    };
    return payload;
  };

  const handleSyncToSheets = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    setSyncLogs([]);

    const addLog = async (msg: string, delay = 500) => {
      setSyncLogs(prev => [...prev, msg]);
      await new Promise(resolve => setTimeout(resolve, delay));
    };

    await addLog('Menyemak sambungan Google API OAuth2 (syazmiza031109@gmail.com)...');

    // Save to local storage first
    const stored = localStorage.getItem('spt_cases');
    const casesList: CompleteCase[] = stored ? JSON.parse(stored) : [];

    let updatedList: CompleteCase[];
    let targetCase: CompleteCase;

    if (selectedCaseToEdit) {
      targetCase = {
        ...selectedCaseToEdit,
        officer: {
          ...selectedCaseToEdit.officer,
          NAMA: formData.NAMA,
          TARIKH_LAHIR: formData.TARIKH_LAHIR,
          PILIHAN_UMUR_PERSARAAN: Number(formData.PILIHAN_UMUR_PERSARAAN),
          TARIKH_BERSARA: formData.TARIKH_BERSARA || selectedCaseToEdit.officer.TARIKH_BERSARA,
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
          ...selectedCaseToEdit.details,
          KESALAHAN_ALL: formData.KESALAHAN_ALL,
          JENIS_KESALAHAN: formData.JENIS_KESALAHAN,
          RINGKASAN_KESALAHAN: formData.RINGKASAN_KESALAHAN,
          ULASAN_URUS_SETIA: formData.ULASAN_URUS_SETIA,
          PUNCA_KES: formData.PUNCA_KES,
          CATATAN: formData.CATATAN
        },
        metadata: {
          ...selectedCaseToEdit.metadata,
          URL_LINK_GD: formData.URL_LINK_GD,
          URL_LINK_LSPRM_LPBI_ADUAN: formData.URL_LINK_LSPRM_LPBI_ADUAN
        },
        workflow: {
          ...selectedCaseToEdit.workflow,
          PEGAWAI_KES: formData.PEGAWAI_KES || '17) LAIN-LAIN PEGAWAI URUS SETIA'
        }
      };

      updatedList = casesList.map(c => {
        if (c.metadata.BIL === selectedCaseToEdit.metadata.BIL) {
          return targetCase;
        }
        if (c.officer.NO_KP === targetCase.officer.NO_KP) {
          return {
            ...c,
            officer: { ...targetCase.officer }
          };
        }
        return c;
      });
    } else {
      targetCase = formatPayload();
      updatedList = casesList.map(c => {
        if (c.officer.NO_KP === targetCase.officer.NO_KP) {
          return {
            ...c,
            officer: { ...targetCase.officer }
          };
        }
        return c;
      });
      updatedList.unshift(targetCase);
    }

    await addLog('Mengambil fail profil pegawai untuk No. KP: ' + formData.NO_KP + '...');
    await addLog('Memformat data payload JSON ke baris helaian (Row Payload Sync)...');

    const liveUrl = localStorage.getItem('spt_gsheet_url');
    let syncFailed = false;

    if (liveUrl) {
      await addLog('Menyambung ke Google Sheets Web App: ' + liveUrl.substring(0, 45) + '...');
      
      const row = [
        targetCase.metadata.BIL || '',
        targetCase.metadata.NO_RUJ_FAIL_JPA || '',
        targetCase.metadata.BIL_IKUT_SUSUNAN_PAPER || '',
        targetCase.metadata.URL_LINK_GD || '',
        targetCase.metadata.URL_LINK_LSPRM_LPBI_ADUAN || '',
        targetCase.metadata.URL_LINK_PP || '',
        '', // URL_LINK_PK does not exist in types
        targetCase.metadata.URL_LINK_SP || '',
        targetCase.metadata.URL_LINK_PH || '',
        targetCase.metadata.URL_LINK_SK || '',
        '', // URL_LINK_SL does not exist in types
        '', // Column L (empty)
        targetCase.officer.NAMA || '',
        targetCase.officer.NO_KP || '',
        targetCase.officer.TARIKH_LAHIR || '',
        targetCase.officer.PILIHAN_UMUR_PERSARAAN || '',
        targetCase.officer.TARIKH_BERSARA || '',
        targetCase.officer.JANTINA || '',
        targetCase.officer.KAUM || '',
        targetCase.officer.JAWATAN || '',
        targetCase.officer.SKIM || '',
        targetCase.officer.GRED || ''
      ];

      try {
        await fetch(liveUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ row })
        });
        
        await addLog('Menulis entri kes baharu ke Helaian [Senarai Kes]...');
        await addLog('Menetapkan pautan folder Google Drive: ' + (formData.URL_LINK_GD || 'N/A') + '...');
      } catch (err: any) {
        syncFailed = true;
        await addLog('❌ Ralat: Gagal menulis ke Google Sheets. Sila pastikan Web App URL aktif dan sah.');
      }
    } else {
      await addLog('⚠️ Mod Offline: Tiada Live Web App URL dijumpai di tetapan. Data hanya disimpan secara lokal.');
    }

    if (!syncFailed) {
      await addLog('Auto-penyegerakan Google Sheets berjaya! Status: 200 OK.', 800);
      setIsSyncing(false);
      setSyncSuccess(true);
    } else {
      setIsSyncing(false);
      setSyncSuccess(false);
      return;
    }

    // Generate and send a simulated email notification for the case assignment
    const getPegawaiEmail = (pegInfo: string) => {
      const clean = pegInfo.toLowerCase();
      if (clean.includes('faezah')) return 'faezah@jpa.gov.my';
      if (clean.includes('ezly')) return 'ezly@jpa.gov.my';
      if (clean.includes('shahriman')) return 'shahriman@jpa.gov.my';
      if (clean.includes('elmi')) return 'elmi@jpa.gov.my';
      if (clean.includes('azhar')) return 'azhar@jpa.gov.my';
      return 'azhar@jpa.gov.my';
    };

    const assignedEmail = getPegawaiEmail(formData.PEGAWAI_KES);
    const emailLogsRaw = localStorage.getItem('spt_email_logs');
    const emailLogs = emailLogsRaw ? JSON.parse(emailLogsRaw) : [];

    emailLogs.unshift({
      id: Date.now() + 1,
      recipient: assignedEmail,
      subject: `[SPT JPA] Penugasan Fail Kes Baharu: ${formData.NO_KP}`,
      body: `Assalamualaikum / Salam Sejahtera,\n\nAnda telah ditugaskan sebagai Pegawai Kes bagi kes tatatertib berikut:\n\nNama Pegawai Awam: ${formData.NAMA}\nNo. Rujukan Fail: ${generatedMetadata?.NO_RUJ_FAIL_JPA || 'JPA.C.P.100-2/4/'}\n\nSila layari Papan Pemuka Kes anda di Portal SPT untuk memulakan tindakan lanjut.\n\nHak Cipta Urus Setia Tatatertib JPA.`,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('spt_email_logs', JSON.stringify(emailLogs));

    localStorage.setItem('spt_cases', JSON.stringify(updatedList));

    // Wait a moment and redirect
    setTimeout(() => {
      router.push('/dashboard/admin');
    }, 1800);
  };

  if (activeSubTab === null) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto animate-fade-in text-left py-6">
        <div className="text-center space-y-1.5 mb-10">
          <h2 className="text-2xl font-black text-gov-blue-700 tracking-tight">Portal Pengurusan Kes Tatatertib</h2>
          <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">Sila pilih untuk meneruskan tindakan urus setia</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Penentuan Pengerusi */}
          <div 
            onClick={() => {
              setHasPerformedLookup(false);
              setLookupKp('');
              setLookupChecked(false);
              setLookupResult(null);
              setActiveSubTab('register');
            }}
            className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-between text-center transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer hover:border-gov-gold-400 group h-80 shadow-sm"
          >
            <div className="h-16 w-16 bg-gov-blue-50 text-gov-blue-700 rounded-full flex items-center justify-center mb-4 group-hover:bg-gov-gold-50 group-hover:text-gov-gold-600 transition-colors">
              <UserCheck className="h-7 w-7" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight mb-2 group-hover:text-gov-blue-800 uppercase">Penentuan Pengerusi</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Pendaftaran kes baharu dan penentuan panel Pengerusi Lembaga Tatatertib.
              </p>
            </div>
            <div className="text-[10px] font-bold text-gov-blue-700 group-hover:text-gov-gold-600 transition-colors flex items-center gap-1.5 mt-4">
              <span>Buka Modul</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* Card 2: Surat Pertuduhan */}
          <div 
            onClick={() => setActiveSubTab('surat_petuduhan')}
            className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-between text-center transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer hover:border-gov-gold-400 group h-80 shadow-sm"
          >
            <div className="h-16 w-16 bg-gov-blue-50 text-gov-blue-700 rounded-full flex items-center justify-center mb-4 group-hover:bg-gov-gold-50 group-hover:text-gov-gold-600 transition-colors">
              <FileText className="h-7 w-7" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight mb-2 group-hover:text-gov-blue-800 uppercase">Surat Pertuduhan</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Penjanaan surat pertuduhan rasmi bagi kes tatatertib aktif untuk diserahkan kepada pegawai.
              </p>
            </div>
            <div className="text-[10px] font-bold text-gov-blue-700 group-hover:text-gov-gold-600 transition-colors flex items-center gap-1.5 mt-4">
              <span>Buka Modul</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* Card 3: Penentuan Hukuman */}
          <div 
            onClick={() => setActiveSubTab('hukuman')}
            className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-between text-center transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer hover:border-gov-gold-400 group h-80 shadow-sm"
          >
            <div className="h-16 w-16 bg-gov-blue-50 text-gov-blue-700 rounded-full flex items-center justify-center mb-4 group-hover:bg-gov-gold-50 group-hover:text-gov-gold-600 transition-colors">
              <Gavel className="h-7 w-7" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight mb-2 group-hover:text-gov-blue-800 uppercase">Penentuan Hukuman</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Perekodan keputusan persidangan lembaga tatatertib dan penentuan jenis hukuman.
              </p>
            </div>
            <div className="text-[10px] font-bold text-gov-blue-700 group-hover:text-gov-gold-600 transition-colors flex items-center gap-1.5 mt-4">
              <span>Buka Modul</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* Card 4: Surat Keputusan */}
          <div 
            onClick={() => setActiveSubTab('keputusan')}
            className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-between text-center transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer hover:border-gov-gold-400 group h-80 shadow-sm"
          >
            <div className="h-16 w-16 bg-gov-blue-50 text-gov-blue-700 rounded-full flex items-center justify-center mb-4 group-hover:bg-gov-gold-50 group-hover:text-gov-gold-600 transition-colors">
              <Mail className="h-7 w-7" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight mb-2 group-hover:text-gov-blue-800 uppercase">Surat Keputusan</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Penjanaan surat keputusan muktamad bagi memaklumkan hukuman rasmi lembaga kepada pegawai.
              </p>
            </div>
            <div className="text-[10px] font-bold text-gov-blue-700 group-hover:text-gov-gold-600 transition-colors flex items-center gap-1.5 mt-4">
              <span>Buka Modul</span>
              <span>&rarr;</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSubTab === 'surat_petuduhan') {
    return (
      <div className="space-y-6 animate-fade-in text-left">
        <div>
          <button
            onClick={() => setActiveSubTab(null)}
            className="flex items-center gap-1 text-xs font-bold text-slate-505 hover:text-slate-800 transition-all bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Kembali ke Menu Pengurusan</span>
          </button>
        </div>
        <SuratPetuduhanGenerator existingCases={existingCases} router={router} />
      </div>
    );
  }

  if (activeSubTab === 'hukuman') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in text-left">
        <div>
          <button
            onClick={() => setActiveSubTab(null)}
            className="flex items-center gap-1 text-xs font-bold text-slate-505 hover:text-slate-800 transition-all bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Kembali ke Menu Pengurusan</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-gov-blue-700 uppercase tracking-tight flex items-center gap-2">
              <Gavel className="h-5 w-5 text-gov-gold-500" />
              <span>Modul Penentuan Hukuman</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold tracking-wide uppercase mt-0.5">Tindakan Keputusan & Persidangan Lembaga Tatatertib</p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-3 leading-relaxed">
            <p className="font-extrabold text-[13px] text-amber-955 flex items-center gap-2">
              <span>💡 Peranan Pengguna & Aliran Kuasa Tatatertib:</span>
            </p>
            <p>
              Modul penentuan hukuman adalah sebahagian daripada persidangan rasmi <strong>Lembaga Tatatertib (Executive Role)</strong>. Mengikut prosedur tatatertib awam:
            </p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>Urus Setia menyediakan fail kes lengkap bagi fasa <strong>Pertuduhan (SP)</strong>.</li>
              <li>Ahli Lembaga bersidang untuk membuat keputusan bersalah/tidak bersalah.</li>
              <li>Hukuman diputuskan mengikut jenis instrumen di bawah Peraturan-Peraturan Pegawai Awam (Kelakuan dan Tatatertib) 1993.</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push('/dashboard/executive')}
              className="bg-gov-blue-700 hover:bg-gov-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-gov-blue-500/20 text-xs cursor-pointer"
            >
              Pergi ke Papan Lembaga Tatatertib
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeSubTab === 'keputusan') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in text-left">
        <div>
          <button
            onClick={() => setActiveSubTab(null)}
            className="flex items-center gap-1 text-xs font-bold text-slate-550 hover:text-slate-800 transition-all bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Kembali ke Menu Pengurusan</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-gov-blue-700 uppercase tracking-tight flex items-center gap-2">
              <Mail className="h-5 w-5 text-gov-gold-500" />
              <span>Modul Surat Keputusan Tatatertib</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold tracking-wide uppercase mt-0.5">Penjanaan Dokumen Penutupan Kes Awam</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs space-y-3 leading-relaxed">
            <p className="font-extrabold text-[13px] text-slate-900">
              ✉️ Penjanaan Surat Keputusan Lembaga Tatatertib:
            </p>
            <p>
              Selepas ahli lembaga memutuskan hukuman, urus setia akan menjana <strong>Surat Keputusan Tatatertib</strong> rasmi bagi memaklumkan keputusan bersidang, butir kesalahan yang disabitkan, dan hukuman yang dijatuhkan (contoh: Amaran, Denda, Pelucutan Hak Emolumen, Penurunan Pangkat, atau Buang Kerja).
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase block">Pilih Fail Kes yang Selesai:</label>
            <select className="w-full text-xs py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gov-blue-500/20 font-bold">
              <option>-- Tiada fail kes selesai ditemui untuk penjanaan surat keputusan --</option>
            </select>
          </div>

          <button
            disabled
            className="bg-slate-200 text-slate-400 font-bold py-3 px-6 rounded-xl text-xs cursor-not-allowed"
          >
            Jana Surat Keputusan (PDF)
          </button>
        </div>
      </div>
    );
  }

  if (!hasPerformedLookup) {
    return (
      <div className="space-y-6 max-w-xl mx-auto animate-fade-in py-6 text-left">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setActiveSubTab(null)}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-all bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Kembali ke Menu Pengurusan</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-655 block">Sila masukkan No. Kad Pengenalan Pegawai (12 Digit):</label>
            <input
              type="text"
              maxLength={12}
              placeholder="Contoh: 820412145533"
              value={lookupKp}
              onChange={(e) => {
                setLookupKp(e.target.value.replace(/\D/g, ''));
                setLookupChecked(false);
                setLookupResult(null);
                setLookupError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleLookup();
                }
              }}
              className={`w-full text-sm py-3 px-4 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-gov-blue-500/20 transition-all font-mono font-bold tracking-wider ${
                lookupError ? 'border-red-500 bg-red-50/10' : 'border-slate-200'
              }`}
            />
            {lookupError && (
              <span className="text-[10px] text-red-500 font-bold block mt-1">
                {lookupError}
              </span>
            )}
          </div>

          <button
            onClick={handleLookup}
            className="w-full bg-gov-blue-700 hover:bg-gov-blue-800 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-gov-blue-500/25 flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            <span>Semak No. KP Pegawai</span>
          </button>

          {lookupChecked && lookupResult && (
            <div className="space-y-4 pt-4 border-t border-slate-100 animate-fade-in">
              {lookupResult.exists ? (
                <div className="p-4.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 font-black text-emerald-800">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>Rekod Pegawai Ditemui!</span>
                  </div>
                  <p className="font-semibold">Nama: <span className="font-extrabold">{lookupResult.officer?.NAMA}</span></p>
                  <p className="font-semibold">Jawatan: {lookupResult.officer?.JAWATAN} (Gred {lookupResult.officer?.GRED})</p>
                  <p className="text-[10px] text-emerald-700 font-medium">Pegawai ini mempunyai <span className="font-bold">{lookupResult.casesCount} kes</span> sedia ada.</p>
                </div>
              ) : (
                <div className="p-4.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-955 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 font-black text-blue-800">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    <span>Pegawai Baharu (Tiada Rekod)</span>
                  </div>
                  <p className="text-[10px] text-blue-700 font-medium">No. KP {lookupKp} belum pernah didaftarkan. Profil pegawai baharu perlu diisi.</p>
                </div>
              )}

              <button
                onClick={handleConfirmLookup}
                className="w-full bg-gov-gold-500 hover:bg-gov-gold-600 text-gov-blue-900 font-bold py-3 rounded-xl transition-all shadow-md shadow-gov-gold-500/25 flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <span>Teruskan &rarr;</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      {/* Title */}
      <div className="flex justify-between items-center text-left">
        <div>
          <h2 className="text-2xl font-black text-gov-blue-700 tracking-tight">Pendaftaran Kes Tatatertib Baharu</h2>
          <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mt-0.5">Borang Pendaftaran Multi-Langkah & Google Sheets Sync</p>
        </div>
        <button
          onClick={() => {
            setHasPerformedLookup(false);
            setLookupKp('');
          }}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
        >
          Cari No. KP Lain
        </button>
      </div>

      {/* Stepper Header */}
      <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        {[
          { step: 1, label: 'Profil Pegawai', icon: User },
          { step: 2, label: 'Perincian Kes', icon: Info },
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
              {idx < 1 && <div className="h-0.5 bg-slate-100 flex-1 mx-4 max-w-[80px]"></div>}
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
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">No. Kad Pengenalan</label>
                <input
                  type="text"
                  name="NO_KP"
                  maxLength={12}
                  value={formData.NO_KP}
                  readOnly
                  placeholder="Contoh: 820412145533"
                  className="w-full px-4 py-3 rounded-xl border border-slate-150 text-slate-400 text-xs font-mono font-bold bg-slate-50 focus:outline-none"
                />
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

            {(isSyncing || (syncLogs.length > 0 && !syncSuccess)) && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fade-in text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isSyncing ? (
                      <div className="h-6 w-6 border-3 border-gov-blue-700 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">✕</div>
                    )}
                    <span className="text-xs font-bold text-slate-800">
                      {isSyncing ? 'Menghantar Data Ke Helaian Google Sheets...' : 'Penyegerakan Helaian Gagal'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase ${isSyncing ? 'text-slate-400' : 'text-red-500 font-extrabold'}`}>
                    {isSyncing ? 'Proses Berjalan' : 'Ralat Terjadi'}
                  </span>
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
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-emerald-800">Penyelarasan Google Sheets Berjaya!</h4>
                <p className="text-xs text-emerald-600 font-medium">Data kes telah diselaraskan ke helaian dan bersedia untuk visualisasi Data Studio.</p>
              </div>
            )}

            {!isSyncing && !syncSuccess && (
              <div className="space-y-6">
                
                {/* If the officer is not new, show their registered info and past cases */}
                {!isNewOfficer && (
                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 text-left">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Rekod Profil Pegawai Ditemui</span>
                        <h4 className="text-sm font-extrabold text-gov-blue-900">{formData.NAMA} (Gred {formData.GRED})</h4>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{formData.TEMPAT_BERTUGAS} &bull; {formData.KEMENTERIAN}</p>
                      </div>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="bg-slate-200 hover:bg-slate-350 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-slate-300 transition-all cursor-pointer"
                      >
                        Ubah Biodata Pegawai
                      </button>
                    </div>

                    {/* List of existing cases of this officer */}
                    <div className="space-y-3">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Kes Sedia Ada Pegawai Ini:</span>
                      {existingCases.filter(c => c.officer.NO_KP === formData.NO_KP).length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                          {existingCases.filter(c => c.officer.NO_KP === formData.NO_KP).map((c) => (
                            <div 
                              key={`${c.metadata.BIL || '0'}-${c.metadata.NO_RUJ_FAIL_JPA || 'pending'}`} 
                              className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                                selectedCaseToEdit?.metadata.BIL === c.metadata.BIL 
                                  ? 'bg-gov-gold-50 border-gov-gold-300 shadow-sm' 
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-[9px] font-bold text-slate-400 font-mono block">Ruj: {c.metadata.NO_RUJ_FAIL_JPA || 'Tiada No. Ruj'}</span>
                                <span className="text-[8px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-600 block">
                                  {c.workflow.STATUS_KATEGORI_UTAMA}
                                </span>
                              </div>
                              <p className="text-[11px] font-bold text-slate-800 line-clamp-1 mt-1">{c.details.RINGKASAN_KESALAHAN || 'Tiada ringkasan'}</p>
                              
                              <button
                                onClick={() => handleEditCaseClick(c)}
                                className="mt-2 text-[9px] font-extrabold text-gov-blue-700 hover:text-gov-blue-800 flex items-center gap-1.5 cursor-pointer"
                              >
                                ✎ Ubah Kes & Fail Ini
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Tiada fail kes terdahulu berdaftar.</p>
                      )}

                      {/* Add new case button */}
                      <button
                        onClick={handleAddNewCaseClick}
                        className={`w-full py-2.5 rounded-xl border border-dashed text-xs font-bold transition-all cursor-pointer ${
                          showNewCaseForm && !selectedCaseToEdit
                            ? 'bg-gov-blue-50 border-gov-blue-300 text-gov-blue-800' 
                            : 'bg-white border-slate-300 hover:border-slate-400 text-slate-600'
                        }`}
                      >
                        + Tambah Kes Baharu Untuk Pegawai Ini
                      </button>
                    </div>
                  </div>
                )}

                {/* Render form fields if it's a new officer OR they have selected to add/edit case */}
                {(isNewOfficer || showNewCaseForm) && (
                  <div className="space-y-6 border-t border-slate-200/60 pt-6 animate-fade-in text-left">
                    {selectedCaseToEdit && (
                      <div className="bg-gov-gold-50 border border-gov-gold-200 text-gov-gold-900 px-4 py-3 rounded-2xl text-[11px] font-bold flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-gov-gold-500 animate-pulse"></span>
                        <span>Anda sedang mengubah maklumat kes sedia ada (Ruj: {selectedCaseToEdit.metadata.NO_RUJ_FAIL_JPA})</span>
                      </div>
                    )}

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
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all bg-white"
                        >
                          {PUNCA_KES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>

                      {/* Pegawai Kes Assignment Dropdown */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 block">Pegawai Kes Mengurus</label>
                        <select
                          name="PEGAWAI_KES_SELECT"
                          value={PEGAWAI_KES_OPTIONS.includes(formData.PEGAWAI_KES) ? formData.PEGAWAI_KES : 'lain-lain'}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'lain-lain') {
                              setFormData(prev => ({ ...prev, PEGAWAI_KES: '' }));
                            } else {
                              setFormData(prev => ({ ...prev, PEGAWAI_KES: val }));
                            }
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all bg-white"
                        >
                          {PEGAWAI_KES_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                          <option value="lain-lain">Lain-lain (Sila Nyatakan...)</option>
                        </select>
                        
                        {!PEGAWAI_KES_OPTIONS.includes(formData.PEGAWAI_KES) && (
                          <input
                            type="text"
                            name="PEGAWAI_KES"
                            value={formData.PEGAWAI_KES}
                            onChange={handleInputChange}
                            placeholder="Sila masukkan nama Pegawai Kes"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-gov-blue-500 transition-all mt-2 animate-fade-in bg-white"
                          />
                        )}
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
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Button Controls */}
      {!isSyncing && !syncSuccess && (
        <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={currentStep === 1 ? () => { setHasPerformedLookup(false); setLookupKp(''); } : handlePrev}
            className="flex items-center gap-2 px-5 py-3 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>{currentStep === 1 ? 'Carian KP' : 'Kembali'}</span>
          </button>

          {currentStep === 1 ? (
            <button
              onClick={handleNext}
              className="bg-gov-blue-700 hover:bg-gov-blue-800 text-white flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold shadow-md shadow-gov-blue-500/20 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <span>Seterusnya</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            (isNewOfficer || showNewCaseForm) && (
              <button
                onClick={handleSyncToSheets}
                className="bg-gov-gold-500 hover:bg-gov-gold-600 text-gov-blue-900 flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold shadow-md shadow-gov-gold-500/20 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>{selectedCaseToEdit ? 'Simpan & Segerak Perubahan' : 'Daftar & Segerak ke Google Sheets'}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

function SuratPetuduhanGenerator({ existingCases, router }: { existingCases: CompleteCase[]; router: any }) {
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [selectedCase, setSelectedCase] = useState<CompleteCase | null>(null);
  
  const [refNo, setRefNo] = useState('');
  const [letterDate, setLetterDate] = useState('');
  const [chargeDetails, setChargeDetails] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (selectedCaseId) {
      const match = existingCases.find(c => c.metadata.BIL.toString() === selectedCaseId);
      if (match) {
        setSelectedCase(match);
        setRefNo(match.metadata.NO_RUJ_FAIL_JPA || 'JPA.C.P.100-2/4/32(41)');
        setLetterDate(new Date().toISOString().split('T')[0]);
        setChargeDetails(
          `Bahawa anda, ${match.officer.NAMA} (No. KP: ${match.officer.NO_KP}), selaku ${match.officer.JAWATAN} Gred ${match.officer.GRED} di ${match.officer.TEMPAT_BERTUGAS}, didapati telah melakukan pelanggaran tatatertib salah guna kuasa di bawah Peraturan-Peraturan Pegawai Awam (Kelakuan dan Tatatertib) 1993.`
        );
      }
    } else {
      setSelectedCase(null);
      setRefNo('');
      setLetterDate('');
      setChargeDetails('');
    }
  }, [selectedCaseId, existingCases]);

  const handleSaveAndSync = async () => {
    if (!selectedCase) return;
    setIsSaving(true);

    const stored = localStorage.getItem('spt_cases');
    if (stored) {
      const casesList: CompleteCase[] = JSON.parse(stored);
      const updated = casesList.map(c => {
        if (c.metadata.BIL === selectedCase.metadata.BIL) {
          return {
            ...c,
            metadata: {
              ...c.metadata,
              NO_RUJ_FAIL_JPA: refNo,
              URL_LINK_SP: 'https://drive.google.com/file/d/1XyZ_surat_pertuduhan/view'
            },
            workflow: {
              ...c.workflow,
              STATUS_KATEGORI_UTAMA: 'Surat Pertuduhan (SP)',
              STATUS_KATEGORI: 'D01 SP - Penyediaan Surat Pertuduhan - Pegawai Kes',
              ULASAN_URUS_SETIA: `Surat Pertuduhan (SP) telah draf dan dikeluarkan bagi fail rujukan ${refNo} bertarikh ${letterDate}.`
            }
          };
        }
        return c;
      });
      localStorage.setItem('spt_cases', JSON.stringify(updated));
    }

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
            action: 'surat_pertuduhan',
            caseId: selectedCase.metadata.BIL,
            refNo,
            letterDate,
            officerName: selectedCase.officer.NAMA,
            officerKp: selectedCase.officer.NO_KP,
            chargeDetails
          })
        });
      } catch (err) {
        console.error('Failed to sync to Google Sheets:', err);
      }
    }

    window.dispatchEvent(new Event('storage_updated'));

    setSaveSuccess(true);
    setIsSaving(false);
    setTimeout(() => {
      router.push('/dashboard/admin/cases');
    }, 1800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto print:space-y-0 print:p-0 print:bg-white print:text-black">
      <div className="print:hidden flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gov-blue-700 tracking-tight">Penjana Surat Pertuduhan Rasmi</h2>
          <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mt-0.5">Penetuan Pengerusi & Draf Surat Pertuduhan JPA</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 print:hidden">
        <label className="text-xs font-bold text-slate-600 block">Pilih Fail Kes untuk Penjanaan Surat Pertuduhan:</label>
        <select 
          value={selectedCaseId}
          onChange={(e) => setSelectedCaseId(e.target.value)}
          className="w-full text-xs py-2.5 px-3.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gov-blue-500/20 font-bold transition-all"
        >
          <option value="">-- Pilih Fail Kes --</option>
          {existingCases
            .filter(c => c.workflow.STATUS_KATEGORI_UTAMA !== 'Tutup')
            .map((c, index) => (
              <option key={`${c.metadata.BIL || '0'}-${c.officer.NO_KP}-${index}`} value={c.metadata.BIL}>
                {c.officer.NAMA} — Ruj: {c.metadata.NO_RUJ_FAIL_JPA || 'Tiada No. Rujukan'} (KP: {c.officer.NO_KP})
              </option>
            ))}
        </select>
      </div>

      {selectedCase ? (
        <div className="grid grid-cols-12 gap-8 items-start">
          <div className="col-span-12 lg:col-span-4 space-y-6 print:hidden">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-black uppercase text-gov-blue-700 tracking-wider pb-2 border-b border-slate-100">Pembolehubah Surat</h3>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Rujukan Fail JPA</label>
                <input
                  type="text"
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tarikh Surat dikeluarkan</label>
                <input
                  type="date"
                  value={letterDate}
                  onChange={(e) => setLetterDate(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Perincian Tuduhan</label>
                <textarea
                  rows={6}
                  value={chargeDetails}
                  onChange={(e) => setChargeDetails(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold leading-relaxed"
                />
              </div>
            </div>

            {saveSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-3xl text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                <h4 className="text-xs font-bold">Surat Pertuduhan Disimpan & Disegerakkan!</h4>
                <p className="text-[10px] text-emerald-600 font-medium">Fail kes kini ditukarkan ke Fasa SP (Surat Pertuduhan).</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSaveAndSync}
                  disabled={isSaving}
                  className="w-full bg-gov-gold-500 hover:bg-gov-gold-600 disabled:bg-slate-200 disabled:text-slate-400 text-gov-blue-900 font-bold py-3 rounded-xl transition-all shadow-md shadow-gov-gold-500/10 flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Menyegerak...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Simpan & Segerak Status SP</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrint}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <Printer className="h-4 w-4 text-gov-gold-500" />
                  <span>Cetak / Eksport PDF</span>
                </button>
              </div>
            )}
          </div>

          <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-10 md:p-12 space-y-6 print:shadow-none print:border-none print:p-0 print:m-0 font-serif">
            <div className="text-center space-y-1.5 border-b-2 border-double border-slate-800 pb-5">
              <div className="h-14 w-14 bg-gov-blue-900 rounded-full flex items-center justify-center text-gov-gold-400 mx-auto border border-slate-800 font-sans shadow-sm print:h-12 print:w-12 print:border">
                <Shield className="h-8 w-8 text-gov-gold-500" />
              </div>
              <h2 className="text-md font-bold uppercase tracking-tight text-slate-800">JABATAN PERKHIDMATAN AWAM MALAYSIA</h2>
              <p className="text-[10px] text-slate-500 font-sans font-semibold uppercase leading-normal tracking-wide">
                Bahagian Perkhidmatan Tatatertib &bull; Blok C1, Kompleks C &bull; Pusat Pentadbiran Kerajaan Persekutuan
              </p>
            </div>

            <div className="flex justify-between text-xs text-slate-700 font-sans font-bold">
              <div></div>
              <div className="space-y-1 text-right">
                <div>Ruj. Kami: {refNo}</div>
                <div>Tarikh: {letterDate ? new Date(letterDate).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</div>
              </div>
            </div>

            <div className="text-xs text-slate-800 leading-relaxed font-sans font-bold space-y-1">
              <div>SULIT</div>
              <div className="pt-2">{selectedCase.officer.NAMA}</div>
              <div>(No. KP: {selectedCase.officer.NO_KP})</div>
              <div>{selectedCase.officer.JAWATAN} (Gred {selectedCase.officer.GRED})</div>
              <div>{selectedCase.officer.TEMPAT_BERTUGAS}</div>
              <div>{selectedCase.officer.NEGERI}</div>
            </div>

            <div className="text-xs text-slate-800 font-sans font-bold pt-2">
              Tuan / Puan,
            </div>

            <div className="text-xs text-slate-800 font-bold border-b border-slate-300 pb-2 leading-relaxed uppercase">
              PERTUDUHAN TATATERTIB DI BAWAH PERATURAN-PERATURAN PEGAWAI AWAM (KELAKUAN DAN TATATERTIB) 1993
            </div>

            <div className="text-[11px] text-slate-800 font-sans space-y-4 leading-relaxed text-justify">
              <p>
                Saya dengan ini diarah merujuk kepada laporan tatatertib bertarikh <strong>{selectedCase.metadata.BIL_IKUT_SUSUNAN_PAPER}</strong> yang dikemukakan oleh Jabatan/Bahagian anda berkenaan kesalahan salah guna kuasa dan pematuhan pekeliling awam.
              </p>
              <p>
                2. Sila ambil perhatian bahawa pihak Lembaga Tatatertib Perkhidmatan Awam (Urus Setia Kumpulan Sokongan/Pengurusan) setelah menimbang segala fakta kes, mendapati ada prima facie di bawah tatatertib bagi merumuskan pertuduhan rasmi terhadap anda seperti berikut:
              </p>
              <div className="pl-6 pr-4 py-3 bg-slate-50 border-l-4 border-gov-gold-500 rounded-r-xl italic font-serif leading-relaxed text-xs print:bg-white print:border-l-2 print:pl-4 print:text-black">
                "{chargeDetails}"
              </div>
              <p>
                3. Oleh yang demikian, anda dengan ini dikehendaki mengemukakan <strong>Representasi Pembelaan Diri</strong> secara bertulis kepada Pengerusi Lembaga Tatatertib dalam tempoh <strong>dua puluh satu (21) hari</strong> dari tarikh penerimaan surat pertuduhan ini, menyatakan alasan pembelaan anda mengikut Peraturan 26 Peraturan-Peraturan Pegawai Awam (Kelakuan dan Tatatertib) 1993.
              </p>
              <p>
                4. Jika sekiranya anda gagal mengemukakan representasi pembelaan diri dalam tempoh yang dinyatakan di atas, pihak Lembaga Tatatertib akan terus membuat keputusan berdasarkan kepada segala dokumen dan fakta kes yang sedia ada tanpa merujuk lagi kepada pihak tuan.
              </p>
            </div>

            <div className="pt-8 text-xs text-slate-800 font-sans space-y-12">
              <div>
                Sekian, terima kasih.
                <div className="font-bold mt-1">"MALAYSIA MADANI"</div>
                <div className="font-bold">"BERKHIDMAT UNTUK NEGARA"</div>
              </div>
              
              <div className="font-bold">
                ( PUAN SYAZMIZA )
                <div className="font-medium text-slate-500">Pengerusi Jawatankuasa Urus Setia Tatatertib JPA</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-12 text-center text-slate-500 font-semibold space-y-2">
          <FileText className="h-10 w-10 text-slate-400 mx-auto" />
          <h4 className="text-sm">Tiada Fail Kes Dipilih</h4>
          <p className="text-xs text-slate-400">Sila pilih fail kes tatatertib aktif daripada menu di atas untuk memulakan draf surat pertuduhan rasmi.</p>
        </div>
      )}
    </div>
  );
}
