
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "../../store/authStore";
import { AdminSidebar } from "../../components/admin/Sidebar";
import { ModeToggle } from "../../components/ModeToggle";
import { Loader2, Bell } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, role, isAuthenticated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    if (pathname === "/lighthouse/login") return;

    if (!isAuthenticated || !token) {
      router.replace("/lighthouse/login");
      return;
    }

    if (role && role !== "admin") {
       router.replace("/lighthouse/login");
    }

  }, [isClient, pathname, isAuthenticated, token, role, router]);

  if (!isClient) return null;

  if (pathname === "/lighthouse/login") {
    return <>{children}</>;
  }

  if (!isAuthenticated && pathname !== "/lighthouse/login") {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
  }

  // Determine title based on path
  const getTitle = () => {
    if (pathname.includes("/dashboard")) return "Dashboard";
    if (pathname.includes("/users")) return "User Management";
    if (pathname.includes("/organizations")) return "Organizations";
    if (pathname.includes("/events")) return "Events";
    if (pathname.includes("/revenue")) return "Revenue & Analytics";
    if (pathname.includes("/tickets")) return "Tickets";
    return "Admin";
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navigation */}
        <header className="h-14 border-b px-4 flex items-center justify-between bg-card">
          <h2 className="font-semibold text-sm">{getTitle()}</h2>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Hi, Admin</span>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold border border-primary/20">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
