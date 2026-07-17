'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { CompleteCase } from '@/lib/types';
import { INITIAL_CASES } from '@/lib/mock-data';
import { Plus } from 'lucide-react';
import AdminCharts from '@/components/admin-charts';
import { useAuth } from '@/components/auth-provider';
import { DashboardHero } from '@/components/dashboard-hero';

export default function AdminDashboard() {
  const [cases, setCases] = useState<CompleteCase[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Load from localStorage or seed
    const stored = localStorage.getItem('spt_cases');
    setTimeout(() => {
      if (stored) {
        setCases(JSON.parse(stored));
      } else {
        localStorage.setItem('spt_cases', JSON.stringify(INITIAL_CASES));
        setCases(INITIAL_CASES);
      }
    }, 0);
  }, []);

  useEffect(() => {
    const syncAllToSheets = async () => {
      const liveUrl = localStorage.getItem('spt_gsheet_url');
      if (!liveUrl || cases.length === 0) return;

      console.log('Automated sync: Syncing all local cases to Google Sheets...');
      
      for (const c of cases) {
        const row = [
          c.metadata.BIL || '',
          c.metadata.NO_RUJ_FAIL_JPA || '',
          c.metadata.BIL_IKUT_SUSUNAN_PAPER || '',
          c.metadata.URL_LINK_GD || '',
          c.metadata.URL_LINK_LSPRM_LPBI_ADUAN || '',
          c.metadata.URL_LINK_PP || '',
          '',
          c.metadata.URL_LINK_SP || '',
          c.metadata.URL_LINK_PH || '',
          c.metadata.URL_LINK_SK || '',
          '',
          '',
          c.officer.NAMA || '',
          c.officer.NO_KP || '',
          c.officer.TARIKH_LAHIR || '',
          c.officer.PILIHAN_UMUR_PERSARAAN || '',
          c.officer.TARIKH_BERSARA || '',
          c.officer.JANTINA || '',
          c.officer.KAUM || '',
          c.officer.JAWATAN || '',
          c.officer.SKIM || '',
          c.officer.GRED || ''
        ];
        
        try {
          fetch(liveUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ row })
          });
        } catch (e) {
          console.error('Automated sync failed for BIL:', c.metadata.BIL, e);
        }
      }
    };
    syncAllToSheets();
  }, [cases]);

  const displayedCases = useMemo(() => {
    return cases;
  }, [cases]);

  return (
    <div className="animate-fade-in">
      {/* Landing Page Hero Banner */}
      <DashboardHero
        userName={user?.name || ''}
        role={user?.role || ''}
        grade={user?.grade || ''}
        title="Papan Pemuka Utama Urus Setia Tatatertib"
        description="Sistem Pengurusan Tatatertib (SPT) memudahkan pendaftaran kes, semakan fail perakuan, penyediaan surat pertuduhan, serta pemantauan garis masa KPI tatatertib secara berpusat bagi memelihara integriti dan ketelusan Jabatan Perkhidmatan Awam."
        targetId="charts-section"
        buttonText="LIHAT ANALITIS & CARTA GRAFIK"
      />

      <div className="p-8 max-w-[1700px] w-full mx-auto space-y-8">
        {/* Title Header */}
        <div id="charts-section" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 scroll-mt-24 border-t border-slate-200/60">
          <div>
            <h2 className="text-xl font-bold text-gov-blue-700 tracking-tight">Analitis Grafik & Trend Kes</h2>
            <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mt-0.5">Urus Setia & Pegawai Kes (Admin)</p>
          </div>

          <Link
            href="/dashboard/admin/register"
            className="bg-gov-gold-500 hover:bg-gov-gold-600 text-gov-blue-900 px-6 py-3.5 rounded-2xl text-xs font-bold shadow-lg shadow-gov-gold-500/20 hover:scale-[1.02] transition-all duration-200 flex items-center gap-2.5 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5 stroke-[3]" />
            <span>Daftar Kes Baharu</span>
          </Link>
        </div>

        {/* Analytics Charts */}
        <AdminCharts cases={displayedCases} />
      </div>
    </div>
  );
}
