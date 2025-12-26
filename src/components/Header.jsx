"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, LogOut, LayoutDashboard, Home, Calendar, Ticket } from "lucide-react";
import Logo from "./Logo";
import { Button } from "./ui/button";
import useAuthStore from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  // Don't show header on auth pages if you prefer, but user asked for "all devices"
  // Usually auth pages (login/signup) are standalone. 
  // Let's keep it simple and show it everywhere, or maybe hide on specific paths if needed.
  // For now, I'll render it.

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const studentLinks = [
    { name: "Overview", href: "/dashboard/student", icon: <Home className="h-5 w-5" /> },
    { name: "Events", href: "/dashboard/student/events", icon: <Calendar className="h-5 w-5" /> },
    { name: "My Tickets", href: "/dashboard/student/my-tickets", icon: <Ticket className="h-5 w-5" /> },
    { name: "Profile", href: "/dashboard/student/profile", icon: <User className="h-5 w-5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#0A0A14]/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" onClick={closeMenu}>
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <div className="flex items-center gap-4">
                 <span className="text-sm text-gray-400">Hi, {user.email?.split('@')[0]}</span>
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={logout}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                 >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                 </Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-rose-600 hover:bg-rose-700 text-white">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Hamburger Menu Button */}
        <button
          className="md:hidden p-2 text-gray-300 hover:text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-800 bg-[#0A0A14]"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-2 py-2 border-b border-gray-800 mb-2">
                    <div className="h-8 w-8 rounded-full bg-rose-600 flex items-center justify-center text-white font-bold">
                        {user.email?.[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{user.email}</span>
                        <span className="text-xs text-gray-500">Student</span>
                    </div>
                  </div>
                  
                  {/* Student Dashboard Links */}
                  <div className="space-y-1">
                    <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu</p>
                    {studentLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={closeMenu}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          pathname === link.href 
                            ? "bg-rose-600/10 text-rose-500" 
                            : "hover:bg-gray-800 text-gray-300 hover:text-white"
                        }`}
                      >
                        {link.icon}
                        {link.name}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-gray-800 my-2"></div>

                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors w-full text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={closeMenu}>
                    <Button variant="outline" className="w-full border-gray-700 text-gray-300">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={closeMenu}>
                    <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
