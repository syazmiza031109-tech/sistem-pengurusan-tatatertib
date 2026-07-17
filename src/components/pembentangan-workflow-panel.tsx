'use client';

import React, { useState } from 'react';
import { CompleteCase, PPBodyRole, PPActionLog, StatusUpdateLog } from '@/lib/types';
import { 
  CheckCircle2, Clock, MessageSquare, 
  UserCheck, Shield, AlertCircle 
} from 'lucide-react';

const PP_FLOW_STEPS: PPBodyRole[] = [
  'Pegawai Kes', 
  'KPP', 
  'TPB(K)OA', 
  'TPB(K)O', 
  'Urus Setia', 
  'PBK', 
  'TKPPA(P)', 
  'KPPA', 
  'KSN'
];

interface PembentanganWorkflowPanelProps {
  caseData: CompleteCase;
  onActionSubmit: (updatedCase: CompleteCase) => void;
  userRole: string;
  userName: string;
}

export const PembentanganWorkflowPanel: React.FC<PembentanganWorkflowPanelProps> = ({
  caseData,
  onActionSubmit,
  userRole,
  userName
}) => {
  const currentBody = caseData.workflow.CURRENT_PP_BODY || 'Pegawai Kes';
  const history = caseData.workflow.PP_HISTORY || [];
  const isMyTurn = currentBody === userRole;

  const [status, setStatus] = useState<'lulus' | 'kembali_urusetia' | 'kembali_pegawai'>('lulus');
  const [ulasan, setUlasan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find index of current stage in flow
  const currentStepIdx = PP_FLOW_STEPS.indexOf(currentBody as PPBodyRole);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ulasan.trim()) {
      alert('Sila masukkan ulasan.');
      return;
    }
    
    setIsSubmitting(true);

    setTimeout(() => {
      let nextBody: PPBodyRole | 'COMPLETED' = currentBody;
      let actionStatus = '';

      if (status === 'lulus') {
        if (currentStepIdx < PP_FLOW_STEPS.length - 1) {
          nextBody = PP_FLOW_STEPS[currentStepIdx + 1];
          actionStatus = `Disokong & Dihantar ke ${nextBody}`;
        } else {
          nextBody = 'COMPLETED';
          actionStatus = 'Diluluskan oleh KSN - Selesai PP';
        }
      } else if (status === 'kembali_urusetia') {
        nextBody = 'Urus Setia';
        actionStatus = 'Dikembalikan ke Urus Setia Utama';
      } else if (status === 'kembali_pegawai') {
        nextBody = 'Pegawai Kes';
        actionStatus = 'Dikembalikan ke Pegawai Kes';
      }

      // Convert YYYY-MM-DD to DD/MM/YYYY
      const formatDateMalay = (dateStr: string) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
      };

      const timeStr = new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', hour12: true });
      const actionDateStr = `${formatDateMalay(tarikhTindakan)}, ${timeStr}`;

      // Create new action log
      const newLog: PPActionLog = {
        body: currentBody as PPBodyRole,
        actionDate: actionDateStr,
        status: actionStatus,
        ulasan: ulasan.trim(),
        updatedBy: userName
      };

      const updatedHistory = [...history, newLog];

      // Build dynamic workflow date update based on role
      const workflowUpdates: any = {};
      if (status === 'lulus') {
        if (currentBody === 'Pegawai Kes') {
          workflowUpdates.TARIKH_KEMUKA_PP_KE_KPP = tarikhTindakan;
        } else if (currentBody === 'KPP') {
          workflowUpdates.TARIKH_KEMUKA_PP_KE_TPB = tarikhTindakan;
        } else if (currentBody === 'TPB(K)OA') {
          workflowUpdates.TARIKH_KEMUKA_PP_KE_TPBK = tarikhTindakan;
        } else if (currentBody === 'TPB(K)O') {
          workflowUpdates.TARIKH_LULUS_PP_OLEH_JK2T = tarikhTindakan;
          workflowUpdates.TARIKH_MESY_JK2T_MKSN = tarikhTindakan;
        } else if (currentBody === 'Urus Setia') {
          workflowUpdates.TARIKH_HANTAR_PP_KE_KSN = tarikhTindakan;
        } else if (currentBody === 'PBK') {
          workflowUpdates.TARIKH_TERIMA_PP_KSN = tarikhTindakan;
        } else if (currentBody === 'KSN' || nextBody === 'COMPLETED') {
          workflowUpdates.TARIKH_PENENTUAN_PENGERUSI = tarikhTindakan;
          workflowUpdates.TARIKH_LULUS_PP = tarikhTindakan;
        }
      }

      // Record update in STATUS_HISTORY
      const statusLog: StatusUpdateLog = {
        updatedAt: new Date().toISOString(),
        updatedBy: userName,
        role: userRole,
        actionType: 'WORKFLOW_ACTION',
        description: `Tindakan dihantar oleh ${currentBody}: ${actionStatus} (Tarikh: ${formatDateMalay(tarikhTindakan)})`
      };

      const updatedStatusHistory = [
        ...(caseData.workflow.STATUS_HISTORY || []),
        statusLog
      ];

      // Build updated case data
      const updatedCase: CompleteCase = {
        ...caseData,
        workflow: {
          ...caseData.workflow,
          ...workflowUpdates,
          CURRENT_PP_BODY: nextBody,
          PP_HISTORY: updatedHistory,
          STATUS_HISTORY: updatedStatusHistory,
          // If completed, advance the overall category to Surat Pertuduhan (Step 4.0)
          ...(nextBody === 'COMPLETED' ? {
            STATUS_KATEGORI_UTAMA: 'Surat Pertuduhan (SP)',
            STATUS_KATEGORI: 'B07e PP - Keputusan PP Oleh KSN (Wujud P37) - Urusetia',
            TARIKH_PENENTUAN_PENGERUSI: tarikhTindakan,
            TARIKH_LULUS_PP: tarikhTindakan
          } : {})
        }
      };

      // Trigger callback to save case
      onActionSubmit(updatedCase);
      setUlasan('');
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* 1. Workflow Progress Indicator */}
      <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm text-left">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Laluan Penentuan Pengerusi</h4>
        
        {/* Horizontal Stepper */}
        <div className="overflow-x-auto pb-2 -mx-2 px-2 custom-scrollbar">
          <div className="flex items-center min-w-[900px] justify-between">
            {PP_FLOW_STEPS.map((step, idx) => {
              const isActive = step === currentBody;
              const isPast = PP_FLOW_STEPS.indexOf(currentBody as PPBodyRole) > idx || currentBody === 'COMPLETED';
              
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className={`h-8 w-8 rounded-full border flex items-center justify-center font-black text-xs transition-all ${
                      isActive 
                        ? 'bg-gov-blue-700 text-white border-gov-blue-700 shadow-md shadow-gov-blue-500/20 scale-105' 
                        : isPast 
                          ? 'bg-emerald-500 text-white border-emerald-500' 
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}>
                      {isPast ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : idx + 1}
                    </div>
                    <span className={`text-[10px] font-bold ${isActive ? 'text-gov-blue-700' : 'text-slate-400'}`}>
                      {step}
                    </span>
                  </div>
                  {idx < PP_FLOW_STEPS.length - 1 && (
                    <div className="flex-1 h-[2px] mx-2 bg-slate-100 relative">
                      <div className={`absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-300 ${
                        isPast ? 'w-full' : 'w-0'
                      }`} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Audit Log Timeline */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-left">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Kronologi Ulasan & Tindakan</h4>
        
        {history.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-semibold space-y-1">
            <MessageSquare className="h-5 w-5 mx-auto text-slate-300" />
            <p>Belum ada tindakan atau ulasan dicatatkan.</p>
          </div>
        ) : (
          <div className="relative border-l border-slate-150 pl-5 ml-2.5 space-y-5">
            {history.map((log, idx) => (
              <div key={idx} className="relative group">
                {/* Visual marker dot */}
                <span className="absolute -left-[26px] top-1.5 h-3.5 w-3.5 rounded-full border bg-white flex items-center justify-center text-[7px] text-gov-blue-700 shadow-sm">
                  ✓
                </span>
                
                <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-1.5">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="font-extrabold text-slate-800 text-xs block">{log.body}</span>
                      <span className="text-[10px] text-slate-400 font-semibold block">{log.updatedBy}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono font-bold shrink-0">{log.actionDate}</span>
                  </div>
                  
                  <div className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-150 p-2 rounded-lg inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gov-gold-500" />
                    <span>Tindakan: <strong className="text-gov-blue-800">{log.status}</strong></span>
                  </div>

                  <p className="text-xs text-slate-655 leading-relaxed font-semibold italic bg-slate-100 p-2.5 rounded-xl border border-slate-200 mt-1">
                    "{log.ulasan}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Action / Status Update Form */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden p-6 shadow-sm text-left">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3.5">Kemas kini Status (Tindakan Anda)</h4>
        
        {isMyTurn ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-600">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-gov-blue-700" />
                <span>Pilihan Tindakan Kelulusan</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-gov-blue-500 bg-slate-50 cursor-pointer"
              >
                <option value="lulus">
                  Lulus & Majukan ke {currentStepIdx < PP_FLOW_STEPS.length - 1 ? PP_FLOW_STEPS[currentStepIdx + 1] : 'Fasa Surat Pertuduhan (Selesai)'}
                </option>
                {currentStepIdx > 0 && (
                  <option value="kembali_urusetia">Pulangkan & Kembalikan ke Urus Setia Utama</option>
                )}
                {currentStepIdx > 0 && (
                  <option value="kembali_pegawai">Pulangkan & Kembalikan ke Pegawai Kes</option>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 block">Tarikh Tindakan / Kemas Kini Kes</label>
              <input
                type="date"
                value={tarikhTindakan}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold bg-slate-150 text-slate-400 cursor-not-allowed focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 block">Ulasan / Nota Keputusan Tatatertib</label>
              <textarea
                value={ulasan}
                onChange={(e) => setUlasan(e.target.value)}
                rows={4}
                placeholder={`Masukkan ulasan keputusan anda sebagai perwakilan bagi pihak ${currentBody}...`}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-gov-blue-500 bg-slate-50 leading-relaxed"
              ></textarea>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gov-blue-700 hover:bg-gov-blue-800 disabled:bg-gov-blue-300 text-white font-bold py-3.5 rounded-2xl shadow-md transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                {isSubmitting ? (
                  <div className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Shield className="h-4 w-4 text-gov-gold-400" />
                    <span>Luluskan & Hantar Sesi Tindakan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-[11px] leading-relaxed text-amber-800 font-semibold flex gap-2.5 items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              {caseData.workflow.CURRENT_PP_BODY === 'COMPLETED' ? (
                <span>🎉 Sesi Penentuan Pengerusi bagi kes ini telah <strong>Selesai (Completed)</strong>. Fail kes telah dimajukan ke Fasa Surat Pertuduhan.</span>
              ) : (
                <span>Menunggu giliran tindakan daripada <strong>{currentBody}</strong>. Peranan aktif anda sekarang ialah <strong>{userRole}</strong>, jadi anda hanya dibenarkan membaca sejarah ulasan di atas sahaja.</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
