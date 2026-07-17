export interface ProfilPegawai {
  NAMA: string;
  NO_KP: string; // IC Number (Primary Key)
  TARIKH_LAHIR: string;
  PILIHAN_UMUR_PERSARAAN: number;
  TARIKH_BERSARA: string;
  JANTINA: 'L' | 'P';
  KAUM: string;
  JAWATAN: string;
  SKIM: string;
  GRED: string;
  STATUS_JAWATAN: string;
  TEMPAT_BERTUGAS: string;
  NEGERI: string;
  KEMENTERIAN: string;
}

export interface SystemReferenceMetadata {
  BIL: number;
  NO_RUJ_FAIL_JPA: string; // Reference case number (Primary Key for Case)
  BIL_IKUT_SUSUNAN_PAPER: string;
  URL_LINK_GD: string; // Google Drive folder path
  URL_LINK_LSPRM_LPBI_ADUAN?: string;
  URL_LINK_PP?: string;
  URL_LINK_PP_KSN?: string;
  URL_LINK_SP?: string;
  URL_LINK_PH?: string;
  URL_LINK_SK?: string;
  URL_LINK_SK_SPA_SPP?: string;
  URL_LINK_SK_LRTT?: string;
}

export interface CaseDetails {
  KESALAHAN_ALL: string;
  JENIS_KESALAHAN: string[]; // Options array (multi-select)
  RINGKASAN_KESALAHAN: string;
  ULASAN_URUS_SETIA: string;
  PUNCA_KES: string;
  CATATAN?: string;
  LINK_PINDA_CATATAN?: string;
  TARIKH_KEMUKA_PINDA_KERTAS?: string;
}

export interface WorkflowKPIStatus {
  GETLINK_STATUS?: string;
  STATUS_KATEGORI: string;
  STATUS_KATEGORI_UTAMA: string;
  STATUS_KEMASKINI_KES_DI_HRMIS: 'Incomplete' | 'SP Updated' | 'SK Updated';
  PEGAWAI_KES: string;
  SME?: string;
  PEGAWAI_PENYEMAK?: string;
  TAHUN_TERIMA: number;
  TARIKH_TERIMA_PERAKUAN: string;
  TAHUN_KPI: number;
  TARIKH_SERAHAN_KEPADA_PEGAWAI_KES?: string;
  TARIKH_DOKUMEN_LENGKAP?: string;
  
  // 3.0 Penentuan Pengerusi
  TARIKH_LULUS_PP?: string;
  TARIKH_KEMUKA_PP_KE_KPP?: string;
  TARIKH_KEMUKA_PP_KE_TPB?: string;
  TARIKH_KEMUKA_PP_KE_TPBK?: string;
  STATUS_DRAF_PP_DAN_SLAID_MKSN?: string;
  TARIKH_MESY_JK2T_MKSN?: string;
  TARIKH_LULUS_PP_OLEH_JK2T?: string;
  BIL_MESY_MKSN_MPP?: string;
  TARIKH_HANTAR_PP_KE_KSN?: string;
  TARIKH_PENENTUAN_PENGERUSI?: string;
  PENENTUAN?: 'P36 - Wujud Kesalahan' | 'P36 - Tidak Wujud Kesalahan' | 'P37 - Wujud Kesalahan' | string;
  TARIKH_KEMUKA_KE_SPA_P37?: string;
  TARIKH_TERIMA_PP_KSN?: string;

  // 4.0 Surat Pertuduhan (SP)
  TARIKH_KEMUKA_SP_KE_URUSETIA?: string;
  TARIKH_KEMUKA_DRAF_SP_KE_PUU?: string;
  TARIKH_KEMUKA_SP_KE_TPB?: string;
  TARIKH_SP?: string;
  TARIKH_SURAT_REP?: string;
  TARIKH_TERIMA_SURAT_REP?: string;
  TARIKH_TERIMA_SURAT_REP_OLEH_PEGAWAI_KES?: string;

  // 5.0 Penyerahan Hukuman & Keputusan Lembaga (PH/LTT)
  STATUS_KJH_DAN_DRAF_SURAT_KEPUTUSAN?: string;
  TARIKH_KEMUKA_PH_KE_KPP?: string;
  TARIKH_KEMUKA_PH_KE_TPB?: string;
  TARIKH_KEMUKA_PH_KE_TPBK?: string;
  TARIKH_LULUS_PH_TPBK?: string;
  TARIKH_MESY_PRA_JK2T_LTT?: string;
  TARIKH_MESY_JK2T_LTT?: string;
  TARIKH_LULUS_PH_OLEH_JK2T?: string;
  JENIS_MLTT?: string;
  BIL_MLTT?: string;
  TARIKH_MLTT?: string;
  TAHUN_MESY_LTT?: number;
  KEPUTUSAN_PERTUDUHAN?: string; // Options like Bebas, Amaran, Denda, etc.
  TARIKH_BORANG_KEPUTUSAN_LTT?: string;

  // 6.0 Surat Keputusan, Rayuan & Impak (SK/LRTT)
  TARIKH_KEMUKA_SK_KE_TPB?: string;
  TARIKH_SK?: string;
  RINGKASAN_KEPUTUSAN_HUKUMAN?: string;
  TARIKH_TERIMA_RAYUAN?: string;
  TARIKH_HANTAR_RAYUAN_KE_SPA_SPP?: string;
  KEPUTUSAN_RAYUAN?: string;
  TARIKH_MLRTT?: string;
  TEMPOH_TIDAK_LAYAK_NAIK_PANGKAT?: number;
  CURRENT_PP_BODY?: PPBodyRole | 'COMPLETED';
  PP_HISTORY?: PPActionLog[];
  STATUS_HISTORY?: StatusUpdateLog[];
}

export interface StatusUpdateLog {
  updatedAt: string;
  updatedBy: string;
  role: string;
  actionType: 'STATUS_UPDATE' | 'DATE_UPDATE' | 'CASE_EDIT' | 'WORKFLOW_ACTION';
  description: string;
}

export type PPBodyRole = 
  | 'Pegawai Kes' 
  | 'KPP' 
  | 'TPB(K)OA' 
  | 'TPB(K)O' 
  | 'Urus Setia' 
  | 'PBK' 
  | 'TKPPA(P)' 
  | 'KPPA' 
  | 'KSN';

export interface PPActionLog {
  body: PPBodyRole;
  actionDate: string;
  status: string;
  ulasan: string;
  updatedBy: string;
}


export interface CompleteCase {
  metadata: SystemReferenceMetadata;
  officer: ProfilPegawai;
  details: CaseDetails;
  workflow: WorkflowKPIStatus;
}
