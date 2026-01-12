"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, Wallet } from "lucide-react";
import Logo from "./Logo";
import { Button } from "./ui/button";
import useAuthStore from "@/store/authStore";
import useOrganizerStore from "@/store/orgStore";

const OrganizerHeader = () => {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { clearStore } = useOrganizerStore();

  const handleLogout = () => {
    // Clear stores
    logout();
    clearStore();
    
    // Selectively clear localStorage, preserving user-specific PIN data
    if (typeof window !== 'undefined') {
      // Preserve email-specific PIN keys (radar_pin_*:email) and welcome flags
      const allKeys = Object.keys(localStorage);
      const keysToPreserve = allKeys.filter(key => 
        key.startsWith('radar_pin_salt:') || 
        key.startsWith('radar_pin_hash:') || 
        key.startsWith('radar_has_pin:') ||
        key.startsWith('radar_org_first_welcome:')
      );
      
      const keysToRemove = allKeys.filter(key => !keysToPreserve.includes(key));
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-black border-b border-gray-900 backdrop-blur-md md:hidden">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo */}
          <Link href="/">
            <Logo className="text-white" textSize="text-lg" iconSize="h-5 w-5" />
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-1">
          <Link href="/dashboard/org/payout">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-800 p-2"
            >
              <Wallet className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/dashboard/org/settings">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-800 p-2"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default OrganizerHeader;
