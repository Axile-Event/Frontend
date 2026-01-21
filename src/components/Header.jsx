"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Menu, X, User, LogOut, LayoutDashboard, Home, Calendar, Ticket, Zap } from "lucide-react";
import Logo from "./Logo";
import { Button } from "./ui/button";
import useAuthStore from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, role, logout, isAuthenticated, setUser, hydrated, token } = useAuthStore();

  React.useEffect(() => {
    // Wait for store hydration and ensure we have a valid token before fetching
    if (!hydrated || !token) return;
    
    if (isAuthenticated && user && !user.firstname && !user.Firstname && !user.Preferred_name && !user.Organization_Name) {
      const fetchUserData = async () => {
        try {
          const endpoint = role?.toLowerCase() === 'organizer' ? '/organizer/profile/' : '/student/profile/';
          const response = await api.get(endpoint);
          const data = response.data.profile || response.data.Org_profile || response.data;
          setUser(data);
        } catch (e) {
          // Silently ignore 401 errors - token may not be valid yet after signup
          if (e?.response?.status !== 401) {
            console.error("Failed to fetch user data for header", e);
          }
        }
      };
      fetchUserData();
    }
  }, [hydrated, token, isAuthenticated, user, role, setUser]);

  if (pathname.startsWith('/dashboard/org') || pathname === '/dashboard' || pathname.startsWith('/lighthouse')) return null;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Capitalize role for display
  const displayRole = role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : "User";

  const studentLinks = [
    { name: "Overview", href: "/dashboard/student", icon: <Home className="h-5 w-5" /> },
    { name: "Events", href: "/dashboard/student/events", icon: <Calendar className="h-5 w-5" /> },
    { name: "My Tickets", href: "/dashboard/student/my-tickets", icon: <Ticket className="h-5 w-5" /> },
    { name: "Profile", href: "/dashboard/student/profile", icon: <User className="h-5 w-5" /> },
  ];

  const organizerLinks = [
    { name: "Overview", href: "/dashboard/org", icon: <Home className="h-5 w-5" /> },
    { name: "My Events", href: "/dashboard/org/my-event", icon: <Calendar className="h-5 w-5" /> },
    { name: "Create Event", href: "/dashboard/org/create-event", icon: <Calendar className="h-5 w-5" /> },
    { name: "Profile", href: "/dashboard/org/profile", icon: <User className="h-5 w-5" /> },
  ];

  const sidebarLinks = role?.toLowerCase() === "organizer" ? organizerLinks : studentLinks;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" onClick={closeMenu}>
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/events" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Find Events
            </Link>
            <Link href="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            {user ? (
              <>
                {!pathname.startsWith('/dashboard') && (
                  <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                )}
                <div className="flex items-center gap-4 ml-2">
                  <span className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full border border-border">
                    Hi, {user.Preferred_name || user.firstname || user.Firstname || user.Organization_Name || user.email?.split('@')[0]}
                  </span>
                  {!pathname.startsWith('/dashboard') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-primary hover:bg-primary/90 text-white px-6">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Hamburger Menu Button */}
          {/* <button
          className="md:hidden p-2 text-gray-300 hover:text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button> */}

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-2">

            {/* Student Mobile Logout */}
            {isAuthenticated && role === 'student' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}

            {/* Mobile Hamburger Menu Button - Hidden for Students */}
            {(!isAuthenticated || (isAuthenticated && role !== 'student')) && (
              <button
                className="p-2 text-gray-300 hover:text-white focus:outline-none"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Slider Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 right-0 h-full w-[80%] bg-[#111] z-[100] border-l border-gray-800"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <span className="font-bold text-lg text-white">Menu</span>
                  <button
                    onClick={closeMenu}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
                  {isAuthenticated && user ? (
                    <>
                      <div className="flex items-center gap-3 px-2 py-2 border-b border-gray-800 mb-2 shrink-0">
                        <div className="h-10 w-10 rounded-full bg-rose-600 flex items-center justify-center text-white font-bold text-lg">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-medium text-white truncate">
                            {user.Preferred_name || user.firstname || user.Firstname || user.Organization_Name || user.email}
                          </span>
                          <span className="text-xs text-gray-500">{user.email}</span>
                          <span className="text-xs text-gray-500">{displayRole}</span>
                        </div>
                      </div>

                      {/* Dashboard Links */}
                      <div className="space-y-1">
                        <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu</p>
                        <Link
                          href="/"
                          onClick={closeMenu}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full ${pathname === "/"
                            ? "bg-rose-600/10 text-rose-500"
                            : "hover:bg-gray-800 text-gray-300 hover:text-white"
                            }`}
                        >
                          <Home className="h-5 w-5" />
                          Home
                        </Link>
                        <Link
                          href="/features"
                          onClick={closeMenu}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full ${pathname === "/features"
                            ? "bg-rose-600/10 text-rose-500"
                            : "hover:bg-gray-800 text-gray-300 hover:text-white"
                            }`}
                        >
                          <Zap className="h-5 w-5" />
                          Features
                        </Link>
                        {sidebarLinks.map((link) => (
                          <Link
                            key={link.name}
                            href={link.href}
                            onClick={closeMenu}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full ${pathname === link.href
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
                          handleLogout();
                          closeMenu();
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors w-full text-left"
                      >
                        <LogOut className="h-5 w-5" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3 mt-4">
                      <Link
                        href="/"
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors w-full"
                      >
                        <Home className="h-5 w-5" />
                        Home
                      </Link>
                      <Link
                        href="/features"
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors w-full"
                      >
                        <Zap className="h-5 w-5" />
                        Features
                      </Link>
                      <Link
                        href="/events"
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors w-full"
                      >
                        <Calendar className="h-5 w-5" />
                        Discover Events
                      </Link>
                      <Link href="/login" onClick={closeMenu}>
                        <Button variant="outline" className="w-full border-gray-700 text-gray-300 h-12">
                          Login
                        </Button>
                      </Link>
                      <Link href="/signup" onClick={closeMenu}>
                        <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white h-12">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
