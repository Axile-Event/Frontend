
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "../../store/authStore";
import { useRef } from "react";
import { Loader2, Bell, Menu, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { AdminSidebar } from "../../components/admin/Sidebar";
import { ModeToggle } from "../../components/ModeToggle";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, role, isAuthenticated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isLoginPage = pathname === "/lighthouse/login";

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Wait for hydration
    if (!isClient) return;

    // Check auth
    // Note: Role check is case-sensitive, backend might return 'admin'.
    // Also, allow 'superuser' or other potential admin roles if applicable.
    // For now, checking 'Admin' and 'admin'.
    if (!token || (role !== 'Admin' && role !== 'admin' && !role?.toLowerCase().includes('admin'))) {
      if (!isLoginPage) {
        router.push("/lighthouse/login");
      }
    } else {
      // If authenticated and on login page, redirect to dashboard
      if (isLoginPage) {
        router.push("/lighthouse/dashboard");
      }
    }
  }, [isClient, token, role, isLoginPage, router]);


  // Determine title based on path
  const getTitle = () => {
    if (pathname.includes("/dashboard")) return "Dashboard";
    if (pathname.includes("/users")) return "User Management";
    if (pathname.includes("/organizations")) return "Organizations";
    if (pathname.includes("/events")) return "Events";
    if (pathname.includes("/revenue")) return "Revenue & Analytics";
    if (pathname.includes("/tickets")) return "Tickets";
    if (pathname.includes("/withdrawals")) return "Withdrawals";
    if (pathname.includes("/settings")) return "System Settings";
    if (pathname.includes("/audit-logs")) return "Audit Logs";
    return "Admin";
  };

  if (isLoginPage) {
      return (
          <div className="min-h-screen bg-background flex flex-col items-center justify-center">
             {children}
          </div>
      )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-screen sticky top-0">
        <AdminSidebar className="h-full" />
      </div>

      {/* Mobile Sidebar (Slider) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-[80%] max-w-sm bg-card border-r shadow-2xl md:hidden overflow-y-auto"
            >
               <div className="absolute right-4 top-4 z-50">
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
               </div>
               <AdminSidebar className="h-full w-full pt-12 border-none" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navigation */}
        <header className="h-14 border-b px-4 flex items-center justify-between bg-card">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="font-semibold text-sm">{getTitle()}</h2>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm font-medium">Hi, Admin</span>
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
