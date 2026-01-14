"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

const Footer = () => {
  const pathname = usePathname();
  if (pathname.startsWith('/dashboard/org')) return null;
  return (
    <footer className="w-full py-8 bg-background border-t border-border text-center text-muted-foreground text-sm">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Logo textSize="text-lg" iconSize="h-5 w-5" />
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} Radar. All rights reserved.</span>
        </div>
        
        <div className="flex gap-6 text-xs md:text-sm">
          <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
