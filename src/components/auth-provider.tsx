'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  name: string;
  role: 'Pegawai Kes' | 'Pengarah' | 'Lembaga Tatatertib' | 'Public' | 'Super Admin' | 'KPP' | 'TPB(K)OA' | 'TPB(K)O' | 'Urus Setia' | 'PBK' | 'TKPPA(P)' | 'KPPA' | 'KSN';
  grade: string;
  department: string;
  email?: string;
  noKp?: string;
  isMaster?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (role: 'Pegawai Kes' | 'Pengarah' | 'Lembaga Tatatertib' | 'Public' | 'Super Admin' | 'KPP' | 'TPB(K)OA' | 'TPB(K)O' | 'Urus Setia' | 'PBK' | 'TKPPA(P)' | 'KPPA' | 'KSN') => void;
  loginWithCredentials: (identifier: string, password: string) => { success: boolean; error?: string; notFound?: boolean };
  logout: () => void;
  switchRole: (role: 'Pegawai Kes' | 'Pengarah' | 'Lembaga Tatatertib' | 'Public' | 'Super Admin' | 'KPP' | 'TPB(K)OA' | 'TPB(K)O' | 'Urus Setia' | 'PBK' | 'TKPPA(P)' | 'KPPA' | 'KSN') => void;
  updateUser: (updatedUser: User) => void;
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
    
    // Seed default sample users in localStorage if not present
    const createdUsersRaw = localStorage.getItem('spt_created_users');
    const createdUsers = createdUsersRaw ? JSON.parse(createdUsersRaw) : [];
    
    const defaultSampleUsers = [
      {
        id: 10001,
        name: 'Faezah binti Md Nor (Pegawai Kes)',
        email: 'faezah@jpa.gov.my',
        noKp: '880203145522',
        role: 'Pegawai Kes',
        department: 'Urus Setia Tatatertib JPA (KPP OA3)',
        grade: 'M48',
        password: 'faezah123',
        createdDate: new Date().toISOString()
      },
      {
        id: 10002,
        name: 'Mohd Azhar bin Harun',
        email: 'azhar@jpa.gov.my',
        noKp: '850412145520',
        role: 'Pegawai Kes',
        department: 'Urus Setia Tatatertib JPA (KPP OA1)',
        grade: 'M48',
        password: 'azhar123',
        createdDate: new Date().toISOString()
      },
      {
        id: 10003,
        name: 'Mohd Ezly bin Ahmad',
        email: 'ezly@jpa.gov.my',
        noKp: '860920145531',
        role: 'Pegawai Kes',
        department: 'Urus Setia Tatatertib JPA (KPP OA1)',
        grade: 'M48',
        password: 'ezly123',
        createdDate: new Date().toISOString()
      },
      {
        id: 10004,
        name: 'Mohd Shahriman bin Zakaria',
        email: 'shahriman@jpa.gov.my',
        noKp: '840714145511',
        role: 'Pegawai Kes',
        department: 'Urus Setia Tatatertib JPA (KPP OA2)',
        grade: 'M48',
        password: 'shahriman123',
        createdDate: new Date().toISOString()
      },
      {
        id: 10005,
        name: 'Mohd Elmi bin Yusof',
        email: 'elmi@jpa.gov.my',
        noKp: '891105145543',
        role: 'Pegawai Kes',
        department: 'Urus Setia Tatatertib JPA (OA)',
        grade: 'M44',
        password: 'elmi123',
        createdDate: new Date().toISOString()
      }
    ];

    let updated = false;
    defaultSampleUsers.forEach(sample => {
      const idx = createdUsers.findIndex((u: any) => u.email === sample.email);
      if (idx > -1) {
        if (createdUsers[idx].name !== sample.name || createdUsers[idx].department !== sample.department) {
          createdUsers[idx].name = sample.name;
          createdUsers[idx].department = sample.department;
          updated = true;
        }
      } else {
        createdUsers.push(sample);
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem('spt_created_users', JSON.stringify(createdUsers));
    }

    setTimeout(() => {
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    }, 0);
  }, []);

  const login = (role: 'Pegawai Kes' | 'Pengarah' | 'Lembaga Tatatertib' | 'Public' | 'Super Admin' | 'KPP' | 'TPB(K)OA' | 'TPB(K)O' | 'Urus Setia' | 'PBK' | 'TKPPA(P)' | 'KPPA' | 'KSN') => {
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
      } else if (role === 'KPP') {
        mockUser = {
          name: 'Tuan Haji Nazri bin Ahmad (KPP)',
          role: 'KPP',
          grade: 'M52',
          department: 'Ketua Penolong Pengarah / Urus Setia Tatatertib',
          email: 'nazri@jpa.gov.my',
          noKp: '750612145533'
        };
      } else if (role === 'TPB(K)OA') {
        mockUser = {
          name: 'Dr. Hajah Fauziah binti Mohd (TPB(K)OA)',
          role: 'TPB(K)OA',
          grade: 'JUSA C',
          department: 'Timbalan Pengarah Bahagian (Kanan) Operasi & Analitis',
          email: 'fauziah@jpa.gov.my',
          noKp: '710314145522'
        };
      } else if (role === 'TPB(K)O') {
        mockUser = {
          name: 'Encik Kamaruddin bin Ismail (TPB(K)O)',
          role: 'TPB(K)O',
          grade: 'JUSA B',
          department: 'Timbalan Pengarah Bahagian (Kanan) Operasi',
          email: 'kamaruddin@jpa.gov.my',
          noKp: '690820145511'
        };
      } else if (role === 'Urus Setia') {
        mockUser = {
          name: 'Puan Siti Aminah binti Yusuf (Urus Setia)',
          role: 'Urus Setia',
          grade: 'M44',
          department: 'Unit Urus Setia Utama Tatatertib JPA',
          email: 'sitiaminah@jpa.gov.my',
          noKp: '820412145533'
        };
      } else if (role === 'PBK') {
        mockUser = {
          name: 'Datuk Ahmad Zaki bin Haron (PBK)',
          role: 'PBK',
          grade: 'JUSA A',
          department: 'Pengarah Bahagian Perkhidmatan & Kakitangan',
          email: 'ahmadzaki@jpa.gov.my',
          noKp: '670912145544'
        };
      } else if (role === 'TKPPA(P)') {
        mockUser = {
          name: "Dato' Sri Dr. Mohd Mokhtar (TKPPA(P))",
          role: 'TKPPA(P)',
          grade: 'TURUS II',
          department: 'Timbalan Ketua Pengarah Perkhidmatan Awam (Pembangunan)',
          email: 'mohd_mokhtar@jpa.gov.my',
          noKp: '640228145588'
        };
      } else if (role === 'KPPA') {
        mockUser = {
          name: 'Tan Sri Wan Ahmad Dahlan (KPPA)',
          role: 'KPPA',
          grade: 'TURUS I',
          department: 'Ketua Pengarah Perkhidmatan Awam Malaysia',
          email: 'wan_ahmad@jpa.gov.my',
          noKp: '611115145566'
        };
      } else if (role === 'KSN') {
        mockUser = {
          name: "Tan Sri Dato' Seri Shamsul Azri (KSN)",
          role: 'KSN',
          grade: 'UTAMA',
          department: 'Ketua Setiausaha Negara Malaysia',
          email: 'shamsul_azri@gov.my',
          noKp: '590918145599'
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
      const isGovBody = ['Pegawai Kes', 'KPP', 'TPB(K)OA', 'TPB(K)O', 'Urus Setia', 'PBK', 'TKPPA(P)', 'KPPA', 'KSN', 'Super Admin'].includes(role);
      if (isGovBody) router.push('/dashboard/admin');
      else if (role === 'Pengarah') router.push('/dashboard/management');
      else if (role === 'Lembaga Tatatertib') router.push('/dashboard/executive');
    } else {
      localStorage.removeItem('spt_user');
      setUser(null);
      router.push('/');
    }
    setLoading(false);
  };

  const loginWithCredentials = (identifier: string, password: string): { success: boolean; error?: string; notFound?: boolean } => {
    setLoading(true);
    const cleanId = identifier.trim().toLowerCase();
    
    const isMasterEmail = cleanId === 'syazmiza0304@gmail.com';
    const isMasterKp = identifier.trim() === '030415130390';
    
    const storedPassword = typeof window !== 'undefined' ? localStorage.getItem('spt_user_password') || 'darkdekomori12' : 'darkdekomori12';
    
    if ((isMasterEmail || isMasterKp) && password === storedPassword) {
      let mockUser: User;
      const stored = typeof window !== 'undefined' ? localStorage.getItem('spt_user') : null;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.role === 'Super Admin' || parsed.isMaster || parsed.email === 'syazmiza0304@gmail.com' || parsed.noKp === '030415130390')) {
            mockUser = parsed;
          } else {
            throw new Error('Stored user is not Super Admin');
          }
        } catch {
          mockUser = {
            name: 'Puan Syazmiza (Master Admin)',
            role: 'Super Admin',
            grade: 'M54',
            department: 'Kementerian Perkhidmatan Awam / Urus Setia Utama',
            email: 'syazmiza0304@gmail.com',
            noKp: '030415130390',
            isMaster: true
          };
        }
      } else {
        mockUser = {
          name: 'Puan Syazmiza (Master Admin)',
          role: 'Super Admin',
          grade: 'M54',
          department: 'Kementerian Perkhidmatan Awam / Urus Setia Utama',
          email: 'syazmiza0304@gmail.com',
          noKp: '030415130390',
          isMaster: true
        };
      }
      localStorage.setItem('spt_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setLoading(false);
      router.push('/dashboard/admin');
      return { success: true };
    }

    // Now look in custom registered users
    if (typeof window !== 'undefined') {
      const createdUsersRaw = localStorage.getItem('spt_created_users');
      if (createdUsersRaw) {
        try {
          const createdUsers = JSON.parse(createdUsersRaw) as any[];
          const matchedUser = createdUsers.find(
            (u) => u.email.trim().toLowerCase() === cleanId || u.noKp?.trim() === cleanId
          );
          if (matchedUser) {
            // Check password
            if (password === matchedUser.password) {
              const mockUser: User = {
                name: matchedUser.name,
                role: matchedUser.role,
                grade: matchedUser.grade || 'M41',
                department: matchedUser.department || 'JPA',
                email: matchedUser.email,
                noKp: matchedUser.noKp || ''
              };
              localStorage.setItem('spt_user', JSON.stringify(mockUser));
              setUser(mockUser);
              setLoading(false);
              
              // Redirect depending on role
              if (matchedUser.role === 'Super Admin' || matchedUser.role === 'Pegawai Kes') {
                router.push('/dashboard/admin');
              } else if (matchedUser.role === 'Pengarah') {
                router.push('/dashboard/management');
              } else if (matchedUser.role === 'Lembaga Tatatertib') {
                router.push('/dashboard/executive');
              }
              return { success: true };
            } else {
              setLoading(false);
              return { success: false, error: 'Kata laluan salah. Sila cuba lagi.' };
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    
    setLoading(false);
    return { success: false, notFound: true, error: 'Kredensial tidak sah. Sila semak semula Email/No.KP dan Kata Laluan.' };
  };

  const logout = () => {
    localStorage.removeItem('spt_user');
    setUser(null);
    router.push('/');
  };

  const switchRole = (role: 'Pegawai Kes' | 'Pengarah' | 'Lembaga Tatatertib' | 'Public' | 'Super Admin' | 'KPP' | 'TPB(K)OA' | 'TPB(K)O' | 'Urus Setia' | 'PBK' | 'TKPPA(P)' | 'KPPA' | 'KSN') => {
    login(role);
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem('spt_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, loginWithCredentials, updateUser, loading }}>
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
