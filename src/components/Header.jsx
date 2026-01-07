"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, User, LogOut, LayoutDashboard, Home, Calendar, Ticket } from "lucide-react";
import Logo from "./Logo";
import { Button } from "./ui/button";
import useAuthStore from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, role, logout } = useAuthStore();

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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" onClick={closeMenu}>
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/events" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Discover Events
          </Link>
          
          {user ? (
            <>
              {!pathname.startsWith('/dashboard') && (
                <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              )}
              <div className="flex items-center gap-4">
                 <span className="text-sm text-muted-foreground">Hi, {user.email?.split('@')[0]}</span>
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
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="md:hidden fixed top-0 right-0 h-full w-[80%] max-w-sm bg-background border-l shadow-2xl z-[100]"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <span className="font-bold text-lg bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Menu
                  </span>
                  <Button variant="ghost" size="icon" onClick={closeMenu}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="p-4 flex flex-col gap-2 overflow-y-auto">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-2 py-3 mb-2 bg-muted/50 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                            {user.email?.[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate">{user.email}</span>
                            <span className="text-xs text-muted-foreground">{displayRole}</span>
                        </div>
                      </div>
                      
                      {/* Navigation Links */}
                      <div className="space-y-1">
                        <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Navigation</p>
                        {sidebarLinks.map((link) => (
                          <Link
                            key={link.name}
                            href={link.href}
                            onClick={closeMenu}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full text-sm font-medium ${
                              pathname === link.href 
                                ? "bg-primary/10 text-primary" 
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {link.icon}
                            {link.name}
                          </Link>
                        ))}
                         <Link
                            href="/events"
                            onClick={closeMenu}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full text-sm font-medium hover:bg-muted text-muted-foreground hover:text-foreground`}
                          >
                            <Calendar className="h-5 w-5" />
                            Discover Events
                          </Link>
                      </div>

                      <div className="border-t my-4"></div>

                      <button
                        onClick={() => {
                          handleLogout();
                          closeMenu();
                        }}
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-50 text-red-500 transition-colors w-full text-left text-sm font-medium"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-4 mt-2">
                       <Link 
                         href="/events" 
                         onClick={closeMenu}
                         className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors w-full text-sm font-medium"
                       >
                         <Calendar className="h-5 w-5" />
                         Discover Events
                       </Link>
                      <Link href="/login" onClick={closeMenu}>
                        <Button variant="outline" className="w-full h-10 font-semibold">
                          Login
                        </Button>
                      </Link>
                      <Link href="/signup" onClick={closeMenu}>
                        <Button className="w-full h-10 font-semibold">
                          Sign Up
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
    </header>
  );
};

export default Header;
