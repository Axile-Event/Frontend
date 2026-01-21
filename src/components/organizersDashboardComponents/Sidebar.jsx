"use client";

import React, { cloneElement } from "react";
import {
  LayoutDashboard,
  LogOut,
  PlusIcon,
  QrCodeIcon,
  Settings,
  User,
  Wallet,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "@/store/authStore";
import useOrganizerStore from "@/store/orgStore";
import { cn } from "@/lib/utils";

const OrganizationDashboardNavLinks = [
  { name: "Overview", link: "/dashboard/org", icon: <LayoutDashboard /> },
  {
    name: "Create Event",
    link: "/dashboard/org/create-event",
    icon: <PlusIcon />,
  },
  {
    name: "My Event",
    link: "/dashboard/org/my-event",
    icon: <Users />,
  },
  {
    name: "QR Scanner",
    link: "/dashboard/org/qr-scanner",
    icon: <QrCodeIcon />,
  },
  { name: "Profile", link: "/dashboard/org/profile", icon: <User /> },
  { name: "Payout", link: "/dashboard/org/payout", icon: <Wallet /> },
];

export default function Sidebar() {
  const location = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const clearOrgStore = useOrganizerStore((state) => state.clearStore);

  const handleLogout = () => {
    // Clear stores
    logout();
    clearOrgStore();
    
    // Selectively clear localStorage, preserving user-specific PIN data
    if (typeof window !== 'undefined') {
      // Preserve email-specific PIN keys (Axile_pin_*:email)
      const allKeys = Object.keys(localStorage);
      const keysToPreserve = allKeys.filter(key => 
        key.startsWith('Axile_pin_salt:') || 
        key.startsWith('Axile_pin_hash:') || 
        key.startsWith('Axile_has_pin:')
      );
      
      const keysToRemove = allKeys.filter(key => !keysToPreserve.includes(key));
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Bottom Nav - Premium Floating Dock */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-sm z-50">
        <nav className="flex flex-row justify-between items-center bg-black/80 backdrop-blur-2xl border border-white/10 px-2 py-1.5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-white/20">
          {OrganizationDashboardNavLinks.filter(link => link.name !== "Payout").map((link) => {
            const isActive = location === link.link;
            const mobileLabel = link.name === "Overview" ? "Home" :
                               link.name === "Create Event" ? "Create" : 
                               link.name === "My Event" ? "Events" : 
                               link.name === "QR Scanner" ? "Scan" : 
                               link.name;
            
            return (
              <Link
                href={link.link}
                key={link.name}
                className="flex flex-col items-center justify-center flex-1 min-w-0 py-1 group outline-hidden"
              >
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "p-2 rounded-2xl transition-all duration-300 relative",
                    isActive ? "bg-rose-600 text-white shadow-[0_5px_15px_rgba(225,29,72,0.4)]" : "text-gray-500 group-hover:text-gray-300"
                  )}
                >
                  {cloneElement(link.icon, { size: 18, strokeWidth: isActive ? 2.5 : 2 })}
                </motion.div>
                <span className={cn(
                  "text-[8px] font-bold uppercase tracking-wider mt-1 transition-colors whitespace-nowrap overflow-hidden text-ellipsis w-full text-center px-1",
                  isActive ? "text-rose-500" : "text-gray-600"
                )}>
                  {mobileLabel}
                </span>
                
                <AnimatePresence>
                  {isActive && (
                    <motion.div 
                      layoutId="activeDot"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -bottom-0.5 w-1 h-1 bg-rose-500 rounded-full shadow-[0_0_5px_rgba(225,29,72,0.8)]"
                    />
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-black border-r border-gray-900 text-white px-6 py-8 fixed left-0 top-0">
        <div className="mb-8 flex items-center px-2">
          <Logo className="text-white" textSize="text-2xl" />
        </div>
        <nav className="flex-1 flex flex-col gap-4">
          {OrganizationDashboardNavLinks.map((link) => (
            <Link
              key={link.name}
              href={link.link}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                location === link.link
                  ? 'bg-gray-200 text-gray-900 font-bold'
                  : 'text-gray-200 hover:bg-gray-800'
              }`}
            >
              {link.icon}
              <span className="text-xs">{link.name}</span>
            </Link>
          ))}
        </nav>
        <hr className="border-gray-800 w-full mb-4" />
        <div className="space-y-4">
          <Link
            href="/dashboard/org/settings"
            className={`flex items-center gap-3 p-2 rounded-lg ${
              location === '/dashboard/org/settings'
                ? 'bg-gray-200 text-gray-900 font-bold'
                : 'text-gray-200 hover:bg-gray-800'
            }`}
          >
            <Settings />
            <span className="text-xs">Settings</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="hover:bg-gray-200 p-2 md:p-2 hover:rounded-xl font-bold md:flex md:flex-row hidden md:gap-3 items-center text-red-500 cursor-pointer w-full text-left"
          >
            <LogOut />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
