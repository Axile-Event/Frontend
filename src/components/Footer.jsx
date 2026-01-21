"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Twitter, Instagram, Linkedin, Github, ChevronRight } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  const pathname = usePathname();
  
  // Hide footer on organizer dashboard
  if (pathname?.startsWith('/dashboard/org')) return null;

  const productLinks = [
    { label: 'Find Events', href: '/events' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Features', href: '/features' },
  ];

  const supportLinks = [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Help Center', href: '/help' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ];

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
  ];

  return (
    <footer className="w-full bg-background border-t border-border pt-16 pb-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-block">
              <Logo textSize="text-2xl" iconSize="h-8 w-8" />
            </Link>
            <p className="text-muted-foreground text-base max-w-xs leading-relaxed">
              Empowering event organizers and attendees with a seamless, 
              tech-driven experience. Your Axile for the best events.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3 }}
                  className="p-2 rounded-full bg-secondary/50 text-muted-foreground hover:text-primary hover:bg-secondary transition-all border border-transparent hover:border-primary/20"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold text-foreground mb-6 uppercase tracking-wider text-xs">Product</h4>
            <ul className="space-y-4">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-6 uppercase tracking-wider text-xs">Support</h4>
            <ul className="space-y-4">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-6 uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-4">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-6">
            <h4 className="font-semibold text-foreground uppercase tracking-wider text-xs">Stay Updated</h4>
            <p className="text-sm text-muted-foreground">Subscribe to get event updates and news delivered to your inbox.</p>
            <form className="relative group" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-secondary/30 backdrop-blur-sm border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-12 text-foreground"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center group-hover:scale-105 active:scale-95"
              >
                <ChevronRight size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span>© {new Date().getFullYear()}</span>
            <span className="font-bold text-foreground">Axile</span>
            <span className="mx-2">•</span>
            <span>All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground/40">
            <span>Built with</span>
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-primary"
            >
              ❤
            </motion.span>
            <span>by Team Axile</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
