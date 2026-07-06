'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  name: string;
  role: 'Pegawai Kes' | 'Pengarah' | 'Lembaga Tatatertib' | 'Public' | 'Super Admin';
  grade: string;
  department: string;
  email?: string;
  noKp?: string;
  isMaster?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (role: 'Pegawai Kes' | 'Pengarah' | 'Lembaga Tatatertib' | 'Public' | 'Super Admin') => void;
  loginWithCredentials: (identifier: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  switchRole: (role: 'Pegawai Kes' | 'Pengarah' | 'Lembaga Tatatertib' | 'Public' | 'Super Admin') => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('spt_user');
    setTimeout(() => {
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    }, 0);
  }, []);

  const login = (role: 'Pegawai Kes' | 'Pengarah' | 'Lembaga Tatatertib' | 'Public' | 'Super Admin') => {
    setLoading(true);
    let mockUser: User | null = null;

    if (role !== 'Public') {
      if (role === 'Super Admin') {
        mockUser = {
          name: 'Puan Syazmiza (Master Admin)',
          role: 'Super Admin',
          grade: 'M54',
          department: 'Kementerian Perkhidmatan Awam / Urus Setia Utama',
          email: 'syazmiza0304@gmail.com',
          noKp: '030415130390',
          isMaster: true
        };
      } else {
        mockUser = {
          name: role === 'Pegawai Kes' 
            ? 'Mohd Azhar bin Harun' 
            : role === 'Pengarah' 
              ? 'Datuk Dr. Shamsul Anuar' 
              : 'Tan Sri Chairman LTT',
          role,
          grade: role === 'Pegawai Kes' ? 'M48' : role === 'Pengarah' ? 'JUSA B' : 'TURUS I',
          department: role === 'Pegawai Kes' 
            ? 'Urus Setia Tatatertib JPA' 
            : role === 'Pengarah' 
              ? 'Ketua Jabatan / Pengarah Cawangan' 
              : 'Lembaga Tatatertib Perkhidmatan Awam'
        };
      }
      localStorage.setItem('spt_user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      // Redirect based on role
      if (role === 'Super Admin' || role === 'Pegawai Kes') router.push('/dashboard/admin');
      else if (role === 'Pengarah') router.push('/dashboard/management');
      else if (role === 'Lembaga Tatatertib') router.push('/dashboard/executive');
    } else {
      localStorage.removeItem('spt_user');
      setUser(null);
      router.push('/');
    }
    setLoading(false);
  };

  const loginWithCredentials = (identifier: string, password: string): { success: boolean; error?: string } => {
    setLoading(true);
    const cleanId = identifier.trim().toLowerCase();
    
    const isMasterEmail = cleanId === 'syazmiza0304@gmail.com';
    const isMasterKp = identifier.trim() === '030415130390';
    
    if ((isMasterEmail || isMasterKp) && password === 'darkdekomori12') {
      const mockUser: User = {
        name: 'Puan Syazmiza (Master Admin)',
        role: 'Super Admin',
        grade: 'M54',
        department: 'Kementerian Perkhidmatan Awam / Urus Setia Utama',
        email: 'syazmiza0304@gmail.com',
        noKp: '030415130390',
        isMaster: true
      };
      localStorage.setItem('spt_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setLoading(false);
      router.push('/dashboard/admin');
      return { success: true };
    }
    
    setLoading(false);
    return { success: false, error: 'Kredensial tidak sah. Sila semak semula Email/No.KP dan Kata Laluan.' };
  };

  const logout = () => {
    localStorage.removeItem('spt_user');
    setUser(null);
    router.push('/');
  };

  const switchRole = (role: 'Pegawai Kes' | 'Pengarah' | 'Lembaga Tatatertib' | 'Public' | 'Super Admin') => {
    login(role);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, loginWithCredentials, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
