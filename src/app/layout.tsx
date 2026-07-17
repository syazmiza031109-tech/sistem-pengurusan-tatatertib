import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { RoleSwitcher } from "@/components/role-switcher";
import InspectionProtector from "@/components/inspection-protector";

export const metadata: Metadata = {
  title: "Sistem Pengurusan Tatatertib (SPT)",
  description: "Platform berpusat kerajaan untuk pengurusan kes tatatertib dan digitalisasi aliran kerja pegawai awam.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-[#0f172a] font-sans">
        <AuthProvider>
          <InspectionProtector />
          {children}
          <RoleSwitcher />
        </AuthProvider>
      </body>
    </html>
  );
}
