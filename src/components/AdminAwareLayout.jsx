"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AdminAwareLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/lighthouse");
  const isResetPin = pathname === "/reset-pin";
  const isStudentDashboard = pathname?.startsWith("/dashboard/student");

  return (
    <>
      {!isAdmin && !isResetPin && <Header />}
      <main className="grow">
        {children}
      </main>
      {!isAdmin && !isResetPin && !isStudentDashboard && <Footer />}
    </>
  );
}
