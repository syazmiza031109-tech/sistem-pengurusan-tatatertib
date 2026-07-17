import { CompleteCase } from './types';

export const GRADES = [
  '19', '22', '24', '29', '32', '36', '41', '44', '48', '52', '54', '56',
  'JUSA C', 'JUSA B', 'JUSA A', 'TURUS III', 'TURUS II', 'TURUS I'
];

export const MINISTRIES = [
  'JPM - Jabatan Perdana Menteri',
  'KKM - Kementerian Kesihatan Malaysia',
  'KPM - Kementerian Pendidikan Malaysia',
  'KDN - Kementerian Dalam Negeri',
  'JPA - Jabatan Perkhidmatan Awam',
  'MOF - Kementerian Kewangan',
  'MINDEF - Kementerian Pertahanan',
  'MOSTI - Kementerian Sains, Teknologi dan Inovasi',
  'KLN - Kementerian Luar Negeri',
  'MITI - Kementerian Pelaburan, Perdagangan dan Industri',
  'KKR - Kementerian Kerja Raya',
  'MOT - Kementerian Pengangkutan',
  'KBS - Kementerian Belia dan Sukan',
  'KSM - Kementerian Sumber Manusia',
  'KPWKM - Kementerian Pembangunan Wanita, Keluarga dan Masyarakat',
  'KPT - Kementerian Pendidikan Tinggi',
  'KPKT - Kementerian Perumahan dan Kerajaan Tempatan',
  'MAFS - Kementerian Pertanian dan Keterjaminan Makanan',
  'NRES - Kementerian Sumber Asli dan Kelestarian Alam',
  'PETRA - Kementerian Peralihan Tenaga dan Transformasi Air',
  'KEM. DIGITAL - Kementerian Digital',
  'KEM. KOMUNIKASI - Kementerian Komunikasi',
  'SPRM - Suruhanjaya Pencegahan Rasuah Malaysia',
  'SPA - Suruhanjaya Perkhidmatan Awam',
  'SPP - Suruhanjaya Perkhidmatan Pendidikan',
  'LAIN-LAIN'
];

export const STATES = [
  'W.P. KUALA LUMPUR',
  'W.P. PUTRAJAYA',
  'W.P. LABUAN',
  'JOHOR',
  'KEDAH',
  'KELANTAN',
  'MELAKA',
  'NEGERI SEMBILAN',
  'PAHANG',
  'PERAK',
  'PERLIS',
  'PULAU PINANG',
  'SABAH',
  'SARAWAK',
  'SELANGOR',
  'TERENGGANU'
];

export const KAUM = [
  'MELAYU',
  'CINA',
  'INDIA',
  'BUMIPUTERA SABAH',
  'BUMIPUTERA SARAWAK',
  'ORANG ASLI',
  'SIKH',
  'LAIN-LAIN KAUM'
];

export const STATUS_JAWATAN = [
  'HAKIKI',
  'MEMANGKU',
  'KUP (Khas Untuk Penyandang)',
  'KONTRAK',
  'LAIN-LAIN'
];

export const PUNCA_KES = [
  'JABATAN',
  'JK SIASATAN',
  'MOF',
  'LPBI',
  'LSPRM',
  'AUDIT',
  'NAZIRAN',
  'INSOLVENSI',
  'ADUAN',
  'LKAN',
  'MAHKAMAH (SPRM)'
];

export const JENIS_KESALAHAN = [
  'Kewangan/ Perolehan',
  'Tidak Hadir Bertugas',
  'Tidak Berada Di Tempat Bertugas',
  'Tidak Ketik Kad Perakam Waktu',
  'Gagal Lapor Diri',
  'Hadir Lewat Ke Pejabat/ Pulang Awal Dari Pejabat',
  'Mengambil Cuti Rehat Melebihi Kelayakan',
  'Pecah Kecil Perolehan',
  'Gangguan Seksual',
  'Salah Guna Kuasa',
  'Bankrap',
  'Gagal Menyelia',
  'Keluar Negara Tanpa Kebenaran',
  'Pemalsuan Dokumen/ Maklumat',
  'Kecuaian Perubatan',
  'Menggunakan Pengaruh Luar',
  'Pekerjaan Luar Tanpa Kebenaran',
  'Terlibat Dalam Politik',
  'Tatacara Berpakaian',
  'Penyalahgunaan Dadah',
  'Penerimaan Hadiah',
  'Penerimaan Keraian',
  'Gagal Isytihar Harta',
  'Keterhutangan Serius',
  'Meminjamkan Wang Dengan Faedah',
  'Keterlibatan Dalam Pasaran Niaga Hadapan',
  'Mengelola Cabutan Hadiah Dan Loteri Bukan Tujuan Untuk Kebajikan',
  'COVID-19',
  'Penerbitan Berdasarkan Maklumat Rasmi Terperingkat',
  'Pernyataan Awam Tanpa Kebenaran',
  'Penyuntingan Dan Penerbitan Tanpa Kebenaran',
  'LKAN',
  'Lain-Lain Kesalahan',
  'Surcaj',
  'Mencemar Nama Perkhidmatan Awam',
  'Ingkar Perintah',
  'Tuntutan Palsu',
  'Salah Guna Kenderaan Jabatan',
  'Cuai Dalam Melaksanakan Tugas',
  'Tidak Bertanggungjawab',
  'Tidak Jujur Atau Tidak Amanah',
  'Kurang Cekap Atau Kurang Berusaha',
  'Mengeluarkan Sijil Cuti Sakit Palsu',
  'Kemuka Sijil Cuti Sakit Palsu',
  'Kesalahan Berkaitan Penglibatan Dalam Aktiviti Politik',
  'Tidak Melengkapkan Buku Rekod Mengajar',
  'Berkaitan Jenayah SPRM',
  'Berkaitan Jenayah - Seksual Terhadap Kanak-Kanak'
];

export const KEPUTUSAN_PERTUDUHAN = [
  'Bebas',
  'Amaran',
  'Denda (1 hari)',
  'Denda (2 hari)',
  'Denda (3 hari)',
  'Denda (4 hari)',
  'Denda (5 hari)',
  'Denda (6 hari)',
  'Denda (7 hari)',
  'Lucut Hak Emolumen',
  'Tangguh Pergerakan Gaji (3 bulan)',
  'Tangguh Pergerakan Gaji (6 bulan)',
  'Tangguh Pergerakan Gaji (9/12 bulan)',
  'Turun Gaji 1 pergerakan (12 bulan)',
  'Turun Gaji 1 pergerakan (24 bulan)',
  'Turun Gaji 2 pergerakan (12 bulan)',
  'Turun Pangkat',
  'Buang Kerja',
  'Surcaj (Bertanggungan)',
  'Surcaj (Tidak Bertanggungan)',
  'Dalam Penelitian SPA/ SPP',
  'Letak Jawatan (Tutup Kes)',
  'Bersara (Tutup Kes)',
  'Tarik Kes (Tutup Kes)',
  'Perintah Tahan Kerja P43',
  'Perintah Tahan Kerja P44',
  'Perintah Gantung Kerja P45'
];

export const PEGAWAI_KES_OPTIONS = [
  'Ezly bin Ahmad (KPP OA1)',
  'Shahriman bin Zakaria (KPP OA2)',
  'Faezah binti Md Nor (KPP OA3)',
  'Elmi bin Yusof (OA)',
  'Lain-lain Pegawai Urus Setia'
];

export const INITIAL_CASES: CompleteCase[] = [
  {
    metadata: {
      BIL: 1,
      NO_RUJ_FAIL_JPA: 'JPA.C.P.100-2/4/12(15)',
      BIL_IKUT_SUSUNAN_PAPER: '2026/04/01',
      URL_LINK_GD: 'https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ',
      URL_LINK_LSPRM_LPBI_ADUAN: 'https://aduan.sprm.gov.my/case/sprm-2026-99182',
      URL_LINK_PP: 'https://docs.google.com/presentation/d/1wUMfOiibqpz3W-gbC1c0txTxUNZOAfHdN_ZWaopcA-8/edit?usp=sharing',
      URL_LINK_SP: 'https://drive.google.com/file/d/1XyZ_surat_pertuduhan/view',
      URL_LINK_PH: 'https://drive.google.com/file/d/1XyZ_surat_hukuman/view',
      URL_LINK_SK: 'https://drive.google.com/file/d/1XyZ_surat_keputusan/view'
    },
    officer: {
      NAMA: 'Ahmad bin Sulaiman',
      NO_KP: '820412145533',
      TARIKH_LAHIR: '12-APR-1982',
      PILIHAN_UMUR_PERSARAAN: 60,
      TARIKH_BERSARA: '31-AUG-2026',
      JANTINA: 'L',
      KAUM: 'MELAYU',
      JAWATAN: 'Pegawai Teknologi Maklumat',
      SKIM: 'F - Teknologi Maklumat dan Komunikasi',
      GRED: '48',
      STATUS_JAWATAN: 'HAKIKI',
      TEMPAT_BERTUGAS: 'Bahagian Pengurusan Maklumat, JPA Putrajaya',
      NEGERI: 'W.P. PUTRAJAYA',
      KEMENTERIAN: 'JPA - Jabatan Perkhidmatan Awam'
    },
    details: {
      KESALAHAN_ALL: 'Pegawai didapati tidak hadir bertugas selama 14 hari berturut-turut bermula dari 2 Mac 2026 hingga 15 Mac 2026 tanpa sebarang cuti atau kebenaran terlebih dahulu, serta gagal mengemukakan sijil sakit yang sah.',
      JENIS_KESALAHAN: ['Tidak Hadir Bertugas', 'Ingkar Perintah'],
      RINGKASAN_KESALAHAN: 'Ketidakhadiran bertugas tanpa cuti/kebenaran berturut-turut selama 14 hari.',
      ULASAN_URUS_SETIA: 'Urus Setia mendapati pegawai tidak mempunyai rekod kesalahan lampau. Walau bagaimanapun, tindakan tatatertib wajar diteruskan.',
      PUNCA_KES: 'JABATAN',
      CATATAN: 'Pegawai memberikan penjelasan lewat selepas surat tunjuk sebab dikeluarkan.',
      LINK_PINDA_CATATAN: 'https://drive.google.com/file/d/1catatan_pindahan_ahmad/view',
      TARIKH_KEMUKA_PINDA_KERTAS: '2026-05-10T09:00:00Z'
    },
    workflow: {
      STATUS_KATEGORI: 'B01 PP - Penyediaan PP - Pegawai Kes',
      STATUS_KATEGORI_UTAMA: 'Penentuan Pengerusi',
      STATUS_KEMASKINI_KES_DI_HRMIS: 'SP Updated',
      PEGAWAI_KES: 'Ezly bin Ahmad (KPP OA1)',
      SME: 'YUS YULANDY (OA)',
      PEGAWAI_PENYEMAK: '01) TPB - ROSMASHILAH (OA)',
      TAHUN_TERIMA: 2026,
      TARIKH_TERIMA_PERAKUAN: '2026-03-20',
      TAHUN_KPI: 2026,
      TARIKH_SERAHAN_KEPADA_PEGAWAI_KES: '2026-03-22',
      TARIKH_DOKUMEN_LENGKAP: '2026-03-28',
      TARIKH_LULUS_PP: '2026-04-15',
      TARIKH_KEMUKA_PP_KE_KPP: '2026-04-02',
      TARIKH_KEMUKA_PP_KE_TPB: '2026-04-05',
      TARIKH_KEMUKA_PP_KE_TPBK: '2026-04-08',
      STATUS_DRAF_PP_DAN_SLAID_MKSN: 'Selesai Edaran',
      TARIKH_MESY_JK2T_MKSN: '2026-04-12',
      TARIKH_LULUS_PP_OLEH_JK2T: '2026-04-15',
      BIL_MESY_MKSN_MPP: 'Bil 2/2026',
      TARIKH_HANTAR_PP_KE_KSN: '2026-04-20',
      TARIKH_PENENTUAN_PENGERUSI: '2026-04-25',
      PENENTUAN: 'P36 - Wujud Kesalahan',
      TARIKH_KEMUKA_SP_KE_URUSETIA: '2026-05-02',
      TARIKH_KEMUKA_DRAF_SP_KE_PUU: '2026-05-05',
      TARIKH_KEMUKA_SP_KE_TPB: '2026-05-10',
      TARIKH_SP: '2026-05-15',
      TARIKH_SURAT_REP: '2026-05-16',
      TARIKH_TERIMA_SURAT_REP: '2026-05-30',
      TARIKH_TERIMA_SURAT_REP_OLEH_PEGAWAI_KES: '2026-06-02'
    }
  },
  {
    metadata: {
      BIL: 2,
      NO_RUJ_FAIL_JPA: 'JPA.C.P.100-2/4/13(08)',
      BIL_IKUT_SUSUNAN_PAPER: '2026/05/12',
      URL_LINK_GD: 'https://drive.google.com/drive/folders/2dEfGhIjKlMnOpQrStUvWxYzAbC',
      URL_LINK_LSPRM_LPBI_ADUAN: '',
      URL_LINK_PP: 'https://drive.google.com/file/d/2AbCd_kertas_makluman/view',
      URL_LINK_SP: '',
      URL_LINK_PH: '',
      URL_LINK_SK: ''
    },
    officer: {
      NAMA: 'Fatimah binti Md Nor',
      NO_KP: '780915036688',
      TARIKH_LAHIR: '15-SEP-1978',
      PILIHAN_UMUR_PERSARAAN: 58,
      TARIKH_BERSARA: '15-APR-2026',
      JANTINA: 'P',
      KAUM: 'MELAYU',
      JAWATAN: 'Pegawai Tadbir dan Diplomatik',
      SKIM: 'M - Pentadbiran dan Sokongan',
      GRED: '52',
      STATUS_JAWATAN: 'HAKIKI',
      TEMPAT_BERTUGAS: 'Kementerian Pendidikan Malaysia, Putrajaya',
      NEGERI: 'W.P. PUTRAJAYA',
      KEMENTERIAN: 'KPM - Kementerian Pendidikan Malaysia'
    },
    details: {
      KESALAHAN_ALL: 'Pegawai disyaki menggunakan kedudukan rasminya untuk menyokong pelantikan syarikat milik adik kandungnya bagi pembekalan alat tulis di jabatan.',
      JENIS_KESALAHAN: ['Salah Guna Kuasa', 'Kewangan/ Perolehan'],
      RINGKASAN_KESALAHAN: 'Conflict of Interest dalam perolehan pembekalan alat tulis.',
      ULASAN_URUS_SETIA: 'Syor kes dibawa ke Lembaga Tatatertib Kumpulan Pengurusan (No. 1) untuk tindakan di bawah Peraturan 4(2)(d) iaitu membelakangkan kewajipan kepada awam demi kepentingan peribadi.',
      PUNCA_KES: 'ADUAN',
      CATATAN: 'Siasatan dalaman selesai, kes diklasifikasikan sebagai prima facie.',
      LINK_PINDA_CATATAN: '',
      TARIKH_KEMUKA_PINDA_KERTAS: ''
    },
    workflow: {
      STATUS_KATEGORI: 'B01 PP - Penyediaan PP - Pegawai Kes',
      STATUS_KATEGORI_UTAMA: 'Klarifikasi & Perincian Kesalahan',
      STATUS_KEMASKINI_KES_DI_HRMIS: 'Incomplete',
      PEGAWAI_KES: 'Faezah binti Md Nor (KPP OA3)',
      SME: 'RATINA (OA)',
      PEGAWAI_PENYEMAK: '01) TPB - ROSMASHILAH (OA)',
      TAHUN_TERIMA: 2026,
      TARIKH_TERIMA_PERAKUAN: '2026-05-10',
      TAHUN_KPI: 2026,
      TARIKH_SERAHAN_KEPADA_PEGAWAI_KES: '2026-05-12',
      TARIKH_DOKUMEN_LENGKAP: '2026-05-20',
      TARIKH_KEMUKA_PP_KE_KPP: '2026-06-01',
      STATUS_DRAF_PP_DAN_SLAID_MKSN: 'Penyediaan Draf',
      TARIKH_MESY_JK2T_MKSN: '',
      TARIKH_LULUS_PP_OLEH_JK2T: '',
      BIL_MESY_MKSN_MPP: '',
      TARIKH_HANTAR_PP_KE_KSN: '',
      TARIKH_PENENTUAN_PENGERUSI: '',
      PENENTUAN: ''
    }
  },
  {
    metadata: {
      BIL: 3,
      NO_RUJ_FAIL_JPA: 'JPA.C.P.100-2/4/14(11)',
      BIL_IKUT_SUSUNAN_PAPER: '2017/01/24',
      URL_LINK_GD: 'https://drive.google.com/drive/folders/3eFgHiJkLmNoPqRsTuVwXyZabCd',
      URL_LINK_LSPRM_LPBI_ADUAN: '',
      URL_LINK_PP: 'https://drive.google.com/file/d/3eFgHi_pp/view',
      URL_LINK_SP: '',
      URL_LINK_PH: '',
      URL_LINK_SK: ''
    },
    officer: {
      NAMA: 'Tan Lee Cheng',
      NO_KP: '671014075116',
      TARIKH_LAHIR: '14-OCT-1967',
      PILIHAN_UMUR_PERSARAAN: 60,
      TARIKH_BERSARA: '31-AUG-2023',
      JANTINA: 'P',
      KAUM: 'CINA',
      JAWATAN: 'Pegawai Perkhidmatan Pendidikan',
      SKIM: 'DG - Pendidikan',
      GRED: 'DG48',
      STATUS_JAWATAN: 'HAKIKI',
      TEMPAT_BERTUGAS: 'Sekolah Menengah Kebangsaan Perak',
      NEGERI: 'PERAK',
      KEMENTERIAN: 'KPM - Kementerian Pendidikan Malaysia'
    },
    details: {
      KESALAHAN_ALL: 'Mengalihkan peruntukan PCG ke LPBT tanpa kebenaran Ketua Jabatan.',
      JENIS_KESALAHAN: ['Kewangan/ Perolehan'],
      RINGKASAN_KESALAHAN: 'Pegawai didapati mengalihkan peruntukan Bantuan Per Kapita Untuk Sekolah (PCG) yang telah diluluskan bagi menjalankan program di bawah PCG Mata Pelajaran ke Lain-Lain Perbelanjaan Berulang Tahun (LPBT) tanpa kebenaran Ketua Jabatan.',
      ULASAN_URUS_SETIA: 'Walau pun pegawai telah mengalihkan peruntukan PCG ke LPBT bagi tujuan membayar kerja-kerja penyelenggaraan dan membaik pulih sekolah, namun adalah menjadi tanggungjawab pegawai untuk memohon kebenaran Ketua PTJ seperti yang dinyatakan dalam SPK Bil. 8 Tahun 2012.',
      PUNCA_KES: 'AUDIT',
      CATATAN: '',
      LINK_PINDA_CATATAN: '',
      TARIKH_KEMUKA_PINDA_KERTAS: ''
    },
    workflow: {
      STATUS_KATEGORI: 'B01 PP - Penyediaan PP - Pegawai Kes',
      STATUS_KATEGORI_UTAMA: 'Penentuan Pengerusi',
      STATUS_KEMASKINI_KES_DI_HRMIS: 'Incomplete',
      PEGAWAI_KES: 'Elmi bin Yusof (OA)',
      SME: 'RATINA (OA)',
      PEGAWAI_PENYEMAK: '01) TPB - ROSMASHILAH (OA)',
      TAHUN_TERIMA: 2026,
      TARIKH_TERIMA_PERAKUAN: '2017-01-24',
      TAHUN_KPI: 2026,
      TARIKH_SERAHAN_KEPADA_PEGAWAI_KES: '2017-01-26',
      TARIKH_DOKUMEN_LENGKAP: '2017-01-28',
      STATUS_DRAF_PP_DAN_SLAID_MKSN: 'Penyediaan Draf',
      TARIKH_MESY_JK2T_MKSN: '',
      TARIKH_LULUS_PP_OLEH_JK2T: '',
      BIL_MESY_MKSN_MPP: '',
      TARIKH_HANTAR_PP_KE_KSN: '',
      TARIKH_PENENTUAN_PENGERUSI: '',
      PENENTUAN: ''
    }
  },
  {
    metadata: {
      BIL: 4,
      NO_RUJ_FAIL_JPA: 'JPA.C.P.100-2/4/15(02)',
      BIL_IKUT_SUSUNAN_PAPER: '2017/10/13',
      URL_LINK_GD: 'https://drive.google.com/drive/folders/4fGhIjKlMnOpQrStUvWxYzAbCdE',
      URL_LINK_LSPRM_LPBI_ADUAN: '',
      URL_LINK_PP: 'https://drive.google.com/file/d/4fGh_pp/view',
      URL_LINK_SP: '',
      URL_LINK_PH: '',
      URL_LINK_SK: ''
    },
    officer: {
      NAMA: 'Kamal bin Ariffin',
      NO_KP: '850106105433',
      TARIKH_LAHIR: '06-JAN-1985',
      PILIHAN_UMUR_PERSARAAN: 60,
      TARIKH_BERSARA: '07-DEC-2041',
      JANTINA: 'L',
      KAUM: 'MELAYU',
      JAWATAN: 'Pegawai Tadbir dan Diplomatik',
      SKIM: 'M - Pentadbiran dan Sokongan',
      GRED: 'M48 (HAKIKI)',
      STATUS_JAWATAN: 'HAKIKI',
      TEMPAT_BERTUGAS: 'Bahagian Pentadbiran, JPM Kuala Lumpur',
      NEGERI: 'WILAYAH PERSEKUTUAN KUALA LUMPUR',
      KEMENTERIAN: 'JPM - Jabatan Perdana Menteri'
    },
    details: {
      KESALAHAN_ALL: 'Menjual lebihan pagar (welded mesh) tanpa kuasa atau arahan pihak atasan.',
      JENIS_KESALAHAN: ['Kewangan/ Perolehan', 'Salah Guna Kuasa'],
      RINGKASAN_KESALAHAN: "Menjual lebihan pagar (welded mesh) bagi Projek Pembinaan 'Park and Rides' Batu Tiga, Shah Alam, Selangor kepada Syarikat KP Daya Resources Sdn. Bhd. bagi tujuan pelupusan pada 02.05.2017 tanpa kuasa atau tanpa arahan daripada Pengurus Besar RAC.",
      ULASAN_URUS_SETIA: '1. Berdasarkan representasi, pegawai telah menafikan bahawa beliau telah mengeluarkan arahan bagi penjualan lebihan pagar kepada Syarikat KP Daya Resources Sdn. Bhd. kerana ia bukan di bawah bidang kuasa pegawai sebagai Pengurus Kanan Hartanah. Tiada pembuktian yang menunjukkan kepada penglibatan mahupun arahan pegawai bahawa lebihan pagar tersebut dijual kepada syarikat tersebut.\n2. Pihak RAC juga tidak dapat memberikan pengesahan berlakunya penjualan lebihan pagar kepada Syarikat KP Daya Resources Sdn. Bhd. kerana syarikat tersebut tidak berdaftar dengan pihak RAC.',
      PUNCA_KES: 'JABATAN',
      CATATAN: "Kes Puan Amimah OC. 13.06.2023 - Terima rep. 17.7.2023 - mohon maklumat emolumen dengan INTAN Kiara, due 21.7.2023. INTAN reply pada 17.7.2023. 17.7.2023 - mohon pengesahan pemindahan lebihan pagar oleh KP Daya Resources ke stor RAC di Chan Sow Lin. Due 21.7.2023. 26.7.2023 - submit slide PH kepada TPB. 31.7.2023 - selesai."
    },
    workflow: {
      STATUS_KATEGORI: 'B01 PP - Penyediaan PP - Pegawai Kes',
      STATUS_KATEGORI_UTAMA: 'Klarifikasi & Perincian Kesalahan',
      STATUS_KEMASKINI_KES_DI_HRMIS: 'Incomplete',
      PEGAWAI_KES: 'Shahriman bin Zakaria (KPP OA2)',
      TAHUN_TERIMA: 2026,
      TARIKH_TERIMA_PERAKUAN: '2017-10-13',
      TARIKH_SERAHAN_KEPADA_PEGAWAI_KES: '2017-10-13',
      TAHUN_KPI: 2026
    }
  },
  {
    metadata: {
      BIL: 5,
      NO_RUJ_FAIL_JPA: 'JPA.C.P.100-2/4/16(05)',
      BIL_IKUT_SUSUNAN_PAPER: '2026/02/10',
      URL_LINK_GD: '',
      URL_LINK_LSPRM_LPBI_ADUAN: '',
      URL_LINK_PP: '',
      URL_LINK_SP: '',
      URL_LINK_PH: '',
      URL_LINK_SK: ''
    },
    officer: {
      NAMA: 'Sarah binti Joseph',
      NO_KP: '900210145588',
      TARIKH_LAHIR: '10-FEB-1990',
      PILIHAN_UMUR_PERSARAAN: 60,
      TARIKH_BERSARA: '10-FEB-2027',
      JANTINA: 'P',
      KAUM: 'LAIN-LAIN KAUM',
      JAWATAN: 'Penolong Pegawai Tadbir Gred N29',
      SKIM: 'N - Pentadbiran dan Sokongan',
      GRED: '29',
      STATUS_JAWATAN: 'HAKIKI',
      TEMPAT_BERTUGAS: 'Kementerian Belia dan Sukan, Putrajaya',
      NEGERI: 'W.P. PUTRAJAYA',
      KEMENTERIAN: 'KBS - Kementerian Belia dan Sukan'
    },
    details: {
      KESALAHAN_ALL: 'Membuat aduan lisan yang mengandungi dakwaan palsu serta gangguan emosi kepada rakan sekerja.',
      JENIS_KESALAHAN: ['Gangguan Seksual', 'Mencemar Nama Perkhidmatan Awam'],
      RINGKASAN_KESALAHAN: 'Gangguan lisan dan sikap tidak profesional kepada rakan sekerja.',
      ULASAN_URUS_SETIA: 'Memerlukan keterangan lanjut bagi menentukan tindakan sewajarnya.',
      PUNCA_KES: 'ADUAN'
    },
    workflow: {
      STATUS_KATEGORI: 'B02 PP - Semakan PP - Penyemak Kes',
      STATUS_KATEGORI_UTAMA: 'Penentuan Pengerusi',
      STATUS_KEMASKINI_KES_DI_HRMIS: 'Incomplete',
      PEGAWAI_KES: 'Ezly bin Ahmad (KPP OA1)',
      TAHUN_TERIMA: 2026,
      TARIKH_TERIMA_PERAKUAN: '2026-02-10',
      TAHUN_KPI: 2026
    }
  },
  {
    metadata: {
      BIL: 6,
      NO_RUJ_FAIL_JPA: 'JPA.C.P.100-2/4/17(09)',
      BIL_IKUT_SUSUNAN_PAPER: '2026/04/07',
      URL_LINK_GD: '',
      URL_LINK_LSPRM_LPBI_ADUAN: '',
      URL_LINK_PP: '',
      URL_LINK_SP: '',
      URL_LINK_PH: '',
      URL_LINK_SK: ''
    },
    officer: {
      NAMA: 'Ganesan a/l Ramasamy',
      NO_KP: '750407106321',
      TARIKH_LAHIR: '07-APR-1975',
      PILIHAN_UMUR_PERSARAAN: 60,
      TARIKH_BERSARA: '07-APR-2027',
      JANTINA: 'L',
      KAUM: 'INDIA',
      JAWATAN: 'Pemandu Kenderaan Gred H11',
      SKIM: 'H - Kemahiran',
      GRED: '11',
      STATUS_JAWATAN: 'HAKIKI',
      TEMPAT_BERTUGAS: 'Bahagian Logistik, JPM Putrajaya',
      NEGERI: 'W.P. PUTRAJAYA',
      KEMENTERIAN: 'JPM - Jabatan Perdana Menteri'
    },
    details: {
      KESALAHAN_ALL: 'Tidak hadir bertugas tanpa cuti atau kebenaran selama 10 hari berturut-turut pada bulan Mac 2026.',
      JENIS_KESALAHAN: ['Tidak Hadir Bertugas'],
      RINGKASAN_KESALAHAN: 'Tidak hadir bertugas tanpa sebab munasabah selama 10 hari.',
      ULASAN_URUS_SETIA: 'Laporan polis dibuat oleh jabatan kerana pegawai gagal dikesan. Tindakan tatatertib dimulakan.',
      PUNCA_KES: 'JABATAN'
    },
    workflow: {
      STATUS_KATEGORI: 'B01 PP - Penyediaan PP - Pegawai Kes',
      STATUS_KATEGORI_UTAMA: 'Klarifikasi & Perincian Kesalahan',
      STATUS_KEMASKINI_KES_DI_HRMIS: 'Incomplete',
      PEGAWAI_KES: 'Faezah binti Md Nor (KPP OA3)',
      TAHUN_TERIMA: 2026,
      TARIKH_TERIMA_PERAKUAN: '2026-04-07',
      TAHUN_KPI: 2026
    }
  },
  {
    metadata: {
      BIL: 7,
      NO_RUJ_FAIL_JPA: 'JPA.C.P.100-2/4/18(12)',
      BIL_IKUT_SUSUNAN_PAPER: '2026/06/18',
      URL_LINK_GD: 'https://drive.google.com/drive/folders/7gHiJkLmNoPqRsTuVwXyZabCdEf',
      URL_LINK_LSPRM_LPBI_ADUAN: 'https://aduan.sprm.gov.my/case/sprm-2026-99221',
      URL_LINK_PP: 'https://docs.google.com/presentation/d/1wUMfOiibqpz3W-gbC1c0txTxUNZOAfHdN_ZWaopcA-8/edit?usp=sharing',
      URL_LINK_SP: 'https://drive.google.com/file/d/7sp_ahmad/view',
      URL_LINK_PH: '',
      URL_LINK_SK: ''
    },
    officer: {
      NAMA: 'Kamal bin Ariffin',
      NO_KP: '841102145321',
      TARIKH_LAHIR: '02-NOV-1984',
      PILIHAN_UMUR_PERSARAAN: 60,
      TARIKH_BERSARA: '02-NOV-2044',
      JANTINA: 'L',
      KAUM: 'MELAYU',
      JAWATAN: 'Penolong Pengarah Gred M41',
      SKIM: 'M - Pentadbiran dan Sokongan',
      GRED: '41',
      STATUS_JAWATAN: 'HAKIKI',
      TEMPAT_BERTUGAS: 'Kementerian Kesihatan Malaysia, Putrajaya',
      NEGERI: 'W.P. PUTRAJAYA',
      KEMENTERIAN: 'KKM - Kementerian Kesihatan Malaysia'
    },
    details: {
      KESALAHAN_ALL: 'Pegawai didakwa menerima suapan bernilai RM5,000 daripada pihak kontraktor sebagai balasan mempercepatkan kelulusan perolehan bekalan peranti perubatan.',
      JENIS_KESALAHAN: ['Salah Guna Kuasa', 'Rasuah/ Penyelewengan'],
      RINGKASAN_KESALAHAN: 'Penerimaan suapan peranti perubatan RM5,000.',
      ULASAN_URUS_SETIA: 'Kertas perakuan telah lengkap, draf surat pertuduhan (SP) sedia untuk tindakan Lembaga Tatatertib.',
      PUNCA_KES: 'SPRM'
    },
    workflow: {
      STATUS_KATEGORI: 'D01 SP - Penyediaan Surat Pertuduhan - Pegawai Kes',
      STATUS_KATEGORI_UTAMA: 'Surat Pertuduhan (SP)',
      STATUS_KEMASKINI_KES_DI_HRMIS: 'SP Updated',
      PEGAWAI_KES: 'Ezly bin Ahmad (KPP OA1)',
      TAHUN_TERIMA: 2026,
      TARIKH_TERIMA_PERAKUAN: '2026-06-18',
      TAHUN_KPI: 2026
    }
  },
  {
    metadata: {
      BIL: 8,
      NO_RUJ_FAIL_JPA: 'JPA.C.P.100-2/4/19(03)',
      BIL_IKUT_SUSUNAN_PAPER: '2026/06/25',
      URL_LINK_GD: 'https://drive.google.com/drive/folders/8hIjKlMnOpQrStUvWxYzAbCdEfG',
      URL_LINK_LSPRM_LPBI_ADUAN: '',
      URL_LINK_PP: 'https://docs.google.com/presentation/d/1wUMfOiibqpz3W-gbC1c0txTxUNZOAfHdN_ZWaopcA-8/edit?usp=sharing',
      URL_LINK_SP: 'https://drive.google.com/file/d/8sp_norzihan/view',
      URL_LINK_PH: '',
      URL_LINK_SK: ''
    },
    officer: {
      NAMA: 'Norzihan binti Ismail',
      NO_KP: '810612085442',
      TARIKH_LAHIR: '12-JUN-1981',
      PILIHAN_UMUR_PERSARAAN: 60,
      TARIKH_BERSARA: '12-JUN-2041',
      JANTINA: 'P',
      KAUM: 'MELAYU',
      JAWATAN: 'Pegawai Tadbir Gred N41',
      SKIM: 'N - Pentadbiran dan Sokongan',
      GRED: '41',
      STATUS_JAWATAN: 'HAKIKI',
      TEMPAT_BERTUGAS: 'Kementerian Dalam Negeri, Putrajaya',
      NEGERI: 'W.P. PUTRAJAYA',
      KEMENTERIAN: 'KDN - Kementerian Dalam Negeri'
    },
    details: {
      KESALAHAN_ALL: 'Membuat kenyataan awam yang memburukkan nama perkhidmatan awam dan jabatan di akaun media sosial Facebook peribadi berkaitan skim kenaikan pangkat.',
      JENIS_KESALAHAN: ['Mencemar Nama Perkhidmatan Awam', 'Ingkar Perintah'],
      RINGKASAN_KESALAHAN: 'Kenyataan awam memburukkan jabatan di Facebook.',
      ULASAN_URUS_SETIA: 'Ulasan bertulis pegawai telah ditolak oleh pengerusi. Sedia untuk perbicaraan dan keputusan hukuman.',
      PUNCA_KES: 'ADUAN'
    },
    workflow: {
      STATUS_KATEGORI: 'D01 SP - Penyediaan Surat Pertuduhan - Pegawai Kes',
      STATUS_KATEGORI_UTAMA: 'Surat Pertuduhan (SP)',
      STATUS_KEMASKINI_KES_DI_HRMIS: 'SP Updated',
      PEGAWAI_KES: 'Shahriman bin Zakaria (KPP OA2)',
      TAHUN_TERIMA: 2026,
      TARIKH_TERIMA_PERAKUAN: '2026-06-25',
      TAHUN_KPI: 2026
    }
  },
  {
    metadata: {
      BIL: 9,
      NO_RUJ_FAIL_JPA: 'JPA.C.P.100-2/4/20(15)',
      BIL_IKUT_SUSUNAN_PAPER: '2026/07/14',
      URL_LINK_GD: 'https://drive.google.com/drive/folders/9hIjKlMnOpQrStUvWxYzAbCdEfGHI',
      URL_LINK_LSPRM_LPBI_ADUAN: '',
      URL_LINK_PP: 'https://docs.google.com/presentation/d/1wUMfOiibqpz3W-gbC1c0txTxUNZOAfHdN_ZWaopcA-8/edit?usp=sharing',
      URL_LINK_SP: '',
      URL_LINK_PH: '',
      URL_LINK_SK: ''
    },
    officer: {
      NAMA: 'Puan Syazmiza (Master Admin)',
      NO_KP: '910311091234',
      TARIKH_LAHIR: '11-MAR-1991',
      PILIHAN_UMUR_PERSARAAN: 60,
      TARIKH_BERSARA: '11-MAR-2051',
      JANTINA: 'P',
      KAUM: 'MELAYU',
      JAWATAN: 'Pegawai Teknologi Maklumat Gred F44',
      SKIM: 'F - Teknologi Maklumat dan Komunikasi',
      GRED: '44',
      STATUS_JAWATAN: 'HAKIKI',
      TEMPAT_BERTUGAS: 'Bahagian Pengurusan Maklumat, JPA Putrajaya',
      NEGERI: 'W.P. PUTRAJAYA',
      KEMENTERIAN: 'JPA - Jabatan Perkhidmatan Awam'
    },
    details: {
      KESALAHAN_ALL: 'Pegawai disiasat berkaitan pembocoran kod sumber dan struktur pangkalan data sistem pengurusan tatatertib JPA kepada pihak luar tanpa kebenaran.',
      JENIS_KESALAHAN: ['Salah Guna Kuasa', 'Kewangan/ Perolehan'],
      RINGKASAN_KESALAHAN: 'Pembocoran kod sumber sistem pengurusan tatatertib.',
      ULASAN_URUS_SETIA: 'Siasatan awam menunjukkan prima facie pelanggaran integriti kod.',
      PUNCA_KES: 'JABATAN'
    },
    workflow: {
      STATUS_KATEGORI: 'A01 Agihan kes - Urusetia',
      STATUS_KATEGORI_UTAMA: 'Klarifikasi & Perincian Kesalahan',
      STATUS_KEMASKINI_KES_DI_HRMIS: 'Incomplete',
      PEGAWAI_KES: 'Faezah binti Md Nor (KPP OA3)',
      TAHUN_TERIMA: 2026,
      TARIKH_TERIMA_PERAKUAN: '2026-07-14',
      TAHUN_KPI: 2026
    }
  }
]
