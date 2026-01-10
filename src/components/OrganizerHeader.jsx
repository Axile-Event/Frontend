"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, User, LogOut, Settings, Home, Calendar, Plus, Wallet } from "lucide-react";
import Logo from "./Logo";
import { Button } from "./ui/button";
import useAuthStore from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";

const OrganizerHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Capitalize role for display
  const displayRole = role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : "User";

  const organizerLinks = [
    { name: "Overview", href: "/dashboard/org", icon: <Home className="h-5 w-5" /> },
    { name: "My Events", href: "/dashboard/org/my-event", icon: <Calendar className="h-5 w-5" /> },
    { name: "Create Event", href: "/dashboard/org/create-event", icon: <Plus className="h-5 w-5" /> },
    { name: "Profile", href: "/dashboard/org/profile", icon: <User className="h-5 w-5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-black border-b border-gray-900 backdrop-blur-md md:pl-64">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo - Hidden on desktop as it's in the sidebar */}
        <Link href="/" onClick={closeMenu} className="md:hidden">
          <Logo className="text-white" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/events" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Discover Events
          </Link>

          {user && (
            <>
              <div className="flex items-center gap-4">
                 <span className="text-sm text-muted-foreground">Hi, {user.email?.split('@')[0]}</span>
                  <Link href="/dashboard/org/settings">
                    <Button
                       variant="ghost"
                       size="sm"
                       className="text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                       <Settings className="h-4 w-4 mr-2" />
                       Settings
                    </Button>
                  </Link>
                 <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                 >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                 </Button>
              </div>
            </>
          )}
        </nav>

        {/* Mobile Settings and Logout */}
        <div className="md:hidden flex items-center gap-2">
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
