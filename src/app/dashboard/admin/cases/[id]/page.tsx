'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CompleteCase } from '@/lib/types';
import { INITIAL_CASES } from '@/lib/mock-data';
import { 
  ArrowLeft, CircleUser, FileText, ExternalLink, Calendar, 
  MapPin, ShieldAlert, BadgeInfo, CheckSquare, FolderGit2, Database
} from 'lucide-react';

export default function OfficerProfileDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [cases, setCases] = useState<CompleteCase[]>([]);
  const [officerCases, setOfficerCases] = useState<CompleteCase[]>([]);
  const [officerProfile, setOfficerProfile] = useState<CompleteCase['officer'] | null>(null);

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
              <h3 className="text-lg font-black text-white">{officerProfile.NAMA}</h3>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
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
            <table className="w-full text-left border-collapse min-w-[1400px]">
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
                        <span className="text-slate-600 line-clamp-3 leading-relaxed" title={c.details.RINGKASAN_KESALAHAN}>
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 font-semibold">
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
    </div>
  );
}
