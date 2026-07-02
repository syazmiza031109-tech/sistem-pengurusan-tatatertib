'use client';

import React, { useState } from 'react';
import { useAuth } from './auth-provider';
import { ShieldAlert, Users, ShieldCheck, HelpCircle, ChevronUp } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { user, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const baseRoles = [
    { name: 'Public (Homepage)', val: 'Public', icon: HelpCircle, color: 'text-slate-500' },
    { name: 'Pegawai Kes (Urus Setia)', val: 'Pegawai Kes', icon: Users, color: 'text-gov-blue-600' },
    { name: 'Pengarah (Management)', val: 'Pengarah', icon: ShieldAlert, color: 'text-amber-600' },
    { name: 'Lembaga Tatatertib (Board)', val: 'Lembaga Tatatertib', icon: ShieldCheck, color: 'text-emerald-600' },
  ] as const;

  const roles = user?.isMaster
    ? [
        { name: 'Super Admin (Master)', val: 'Super Admin' as const, icon: ShieldCheck, color: 'text-rose-600' },
        ...baseRoles
      ]
    : baseRoles;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in font-sans">
      <div className={`glass-panel shadow-2xl rounded-2xl border border-slate-200 transition-all duration-300 ${isOpen ? 'p-4 w-72' : 'p-2 w-auto'}`}>
        {isOpen ? (
          <div>
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Panel Simulasi Peranan</h4>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-medium px-2 py-0.5 rounded bg-slate-100"
              >
                Tutup
              </button>
            </div>
            
            <div className="space-y-1">
              {roles.map((r) => {
                const Icon = r.icon;
                const isActive = (r.val === 'Public' && !user) || (user && user.role === r.val);
                return (
                  <button
                    key={r.val}
                    onClick={() => {
                      switchRole(r.val);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all duration-200 ${
                      isActive 
                        ? 'bg-gov-blue-700 text-white shadow-md shadow-gov-blue-500/20' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-gov-gold-400' : r.color}`} />
                    <span>{r.name}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center">
              Pilih peranan untuk bertukar dashboard serta-merta.
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-gov-blue-700 hover:bg-gov-blue-800 text-white rounded-full font-semibold text-xs shadow-xl shadow-gov-blue-700/20 hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            <ShieldCheck className="h-4.5 w-4.5 text-gov-gold-400 animate-pulse" />
            <span>Simulasi Peranan ({user ? user.role : 'Public'})</span>
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
