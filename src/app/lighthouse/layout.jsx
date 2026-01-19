"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "../../store/authStore";
import { Menu, X } from "lucide-react";
import { ModeToggle } from "../../components/ModeToggle";
import { Button } from "../../components/ui/button";
import { ConfirmModalProvider } from "../../components/ui/confirmation-modal";
import { AnimatePresence, motion } from "framer-motion";
import { AdminSidebar } from "../../components/admin/Sidebar";
import { 
  AdminLayoutSkeleton,
  AdminDashboardSkeleton 
} from "@/components/skeletons";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, role, isAuthenticated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isLoginPage = pathname === "/lighthouse/login";

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isClient) return;

    const isAdmin = token && (role === 'Admin' || role === 'admin' || role?.toLowerCase().includes('admin'));
    
    if (!isAdmin) {
      if (!isLoginPage) {
        router.push("/lighthouse/login");
        return;
      }
    } else {
      if (isLoginPage) {
        router.push("/lighthouse/dashboard");
        return;
      }
    }
    
    setLoadingAuth(false);
  }, [isClient, token, role, isLoginPage, router]);


  const getPageInfo = () => {
    const routes = {
      "/lighthouse/dashboard": { title: "Dashboard", description: "Platform overview and key metrics" },
      "/lighthouse/users": { title: "Users", description: "Manage registered users" },
      "/lighthouse/events": { title: "Events", description: "Moderate and manage events" },
      "/lighthouse/revenue": { title: "Revenue", description: "Financial analytics and reports" },
      "/lighthouse/tickets": { title: "Tickets", description: "All platform tickets" },
      "/lighthouse/withdrawals": { title: "Withdrawals", description: "Manage payout requests" },
      "/lighthouse/settings": { title: "Settings", description: "System configuration" },
      "/lighthouse/audit-logs": { title: "Audit Logs", description: "Activity history" },
    };
    
    for (const [path, info] of Object.entries(routes)) {
      if (pathname.startsWith(path)) return info;
    }
    return { title: "Admin", description: "" };
  };

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        {children}
      </div>
    );
  }

  if (loadingAuth || !isClient) {
    return (
      <AdminLayoutSkeleton>
        <AdminDashboardSkeleton />
      </AdminLayoutSkeleton>
    );
  }

  const pageInfo = getPageInfo();

  return (
    <ConfirmModalProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        <div className="hidden md:flex h-screen sticky top-0">
          <AdminSidebar className="h-full" />
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                className="fixed inset-y-0 left-0 z-50 w-[280px] bg-card border-r shadow-xl md:hidden"
              >
                <div className="absolute right-3 top-3 z-50">
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="h-8 w-8">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <AdminSidebar className="h-full w-full pt-10 border-none" />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-16 border-b border-border/40 px-4 md:px-6 flex items-center justify-between bg-card/30 backdrop-blur-sm shrink-0 overflow-visible relative z-10">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden h-9 w-9 text-muted-foreground" 
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-base font-semibold text-foreground">{pageInfo.title}</h1>
                {pageInfo.description && (
                  <p className="text-xs text-muted-foreground hidden sm:block">{pageInfo.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ModeToggle />
              <div className="h-8 w-px bg-border/40 hidden sm:block" />
              <div className="flex items-center gap-2.5">
                <span className="hidden sm:inline text-sm font-medium text-muted-foreground">Admin</span>
                <div className="h-9 w-9 rounded-full bg-foreground flex items-center justify-center text-background text-xs font-semibold">
                  A
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-6 lg:p-8">
              <div className="max-w-6xl mx-auto">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ConfirmModalProvider>
  );
}
