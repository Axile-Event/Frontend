"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ShieldCheck, 
  BarChart3, 
  Ticket, 
  Smartphone, 
  Users, 
  QrCode,
  ArrowRight,
  Globe,
  Bell
} from 'lucide-react';

const FEATURE_GRID = [
  {
    icon: QrCode,
    title: "Smart QR Ticketing",
    description: "Instantly generated, encrypted QR codes for every ticket. Say goodbye to fraud and long queues with lightning-fast scanning.",
    delay: 0.1
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track ticket sales, attendee demographics, and revenue in real-time. Make data-driven decisions to grow your audience.",
    delay: 0.2
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Enterprise-grade encryption for all transactions. We support various payment methods with instant payouts for organizers.",
    delay: 0.3
  },
  {
    icon: Users,
    title: "Community Engine",
    description: "Build a loyal following. Engage with your attendees through built-in messaging, newsletters, and social features.",
    delay: 0.4
  },
  {
    icon: Globe,
    title: "Global Scale",
    description: "Host events for 10 or 10,000 people. Our infrastructure scales automatically to handle high-demand ticket drops.",
    delay: 0.5
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Managing events on the go? Our organizer app gives you full control right from your pocket, anywhere in the world.",
    delay: 0.6
  }
];

const DETAILED_FEATURES = [
  {
    id: 'ticketing',
    icon: Ticket,
    color: 'blue',
    title: 'Digital-First',
    subtitle: 'Ticketing Evolution',
    description: 'Experience the most seamless ticket purchasing flow ever created for the 2026 season. From discovery to checkout in under 30 seconds. Your tickets are stored securely in your Axile wallet and accessible offline.',
    points: [
      'Offline-ready digital tickets',
      'Apple & Google Wallet integration',
      'Dynamic pricing capabilities for 2026',
      'One-click ticket transfers'
    ],
    image: '/assets/features/ticketing_v2.png',
    reverse: false
  },
  {
    id: 'analytics',
    icon: BarChart3,
    color: 'purple',
    title: 'Organizer',
    subtitle: 'Command Center',
    description: 'Get a 360-degree view of your event performance in 2026. Our proprietary analytics engine processes thousands of data points to give you insights that actually matter for your growth.',
    points: [
      'Real-time revenue tracking',
      'Heatmaps for attendee locations',
      'Conversion rate optimization tools',
      'Automated payout settlement'
    ],
    image: '/assets/features/analytics_v2.png',
    reverse: true
  },
  {
    id: 'discovery',
    icon: Bell,
    color: 'primary',
    title: 'Stay in',
    subtitle: 'The Loop',
    description: 'Never miss an event you love in 2026. Our smart discovery engine learns your preferences and notifies you about upcoming shows, early-bird deals, and exclusive VIP access.',
    points: [
      'Personalized event feed',
      'Push notifications for favorites',
      'Waitlist for sold-out events',
      'Exclusive member-only deals'
    ],
    image: '/assets/features/discovery_v2.png',
    reverse: false
  }
];

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="group p-8 rounded-3xl bg-secondary/30 backdrop-blur-xl border border-border hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(225,29,72,0.1)]"
  >
    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
      <Icon className="text-primary" size={28} />
    </div>
    <h3 className="text-xl font-bold mb-4 text-foreground">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </motion.div>
);

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <main className="pt-32 pb-20 overflow-hidden">
        {/* Hero Section */}
        <section className="container mx-auto px-6 mb-32 relative">
          <div className="absolute -top-40 -left-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
          <div className="absolute top-20 -right-20 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />

          <div className="max-w-4xl mx-auto text-center">

            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight"
            >
              Powerful Features for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400">
                Modern Event Experiences
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Everything you need to host, manage, and attend world-class events in 2026. 
              Built with cutting-edge technology for speed and security.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-6"
            >
              <Link href="/signup">
                <button className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20 flex items-center gap-2">
                  Get Started Free <ArrowRight size={20} />
                </button>
              </Link>
              <Link href="/events">
                <button className="px-8 py-4 bg-secondary text-foreground rounded-2xl font-bold hover:bg-secondary/80 transition-all border border-border">
                  Explore Events
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="container mx-auto px-6 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURE_GRID.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </section>

        {/* Highlight Sections */}
        <section className="container mx-auto px-6 mb-40">
          {DETAILED_FEATURES.map((feature) => (
            <div 
              key={feature.id}
              className={`flex flex-col lg:flex-row ${feature.reverse ? 'lg:flex-row-reverse' : ''} items-center gap-16 mb-40 last:mb-0`}
            >
              <motion.div 
                initial={{ opacity: 0, x: feature.reverse ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1 space-y-8"
              >
                <div className={`inline-block p-3 rounded-2xl bg-${feature.color}-500/10 text-${feature.color}-500`}>
                  <feature.icon size={32} className={feature.color === 'primary' ? 'text-primary' : ''} />
                </div>
                <h2 className="text-4xl md:text-5xl font-black">
                  {feature.title} <br />
                  <span className={feature.color === 'primary' ? 'text-primary' : `text-${feature.color}-500`}>
                    {feature.subtitle}
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-4">
                  {feature.points.map((point, i) => (
                    <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                      <div className={`w-6 h-6 rounded-full bg-${feature.color}-500/20 flex items-center justify-center`}>
                        <Zap size={12} className={feature.color === 'primary' ? 'text-primary' : `text-${feature.color}-500`} />
                      </div>
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex-1 relative"
              >
                <div className={`absolute inset-0 bg-${feature.color}-500/20 blur-[100px] rounded-full -z-10`} />
                <div className="rounded-[40px] overflow-hidden border border-border shadow-2xl bg-secondary/20">
                  <Image 
                    src={feature.image} 
                    alt={feature.title} 
                    width={800} 
                    height={800} 
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </motion.div>
            </div>
          ))}
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-16 rounded-[48px] bg-gradient-to-br from-primary to-rose-600 text-white text-center relative overflow-hidden"
          >
            {/* African Topographic Contour Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-[1]" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
              {/* Large flowing contours - left side */}
              <path d="M-50 150 Q50 80 150 120 T350 100" fill="none" stroke="white" strokeWidth="1.5" opacity="0.25"/>
              <path d="M-50 170 Q50 100 150 140 T350 120" fill="none" stroke="white" strokeWidth="1.2" opacity="0.2"/>
              <path d="M-50 190 Q50 120 150 160 T350 140" fill="none" stroke="white" strokeWidth="1" opacity="0.15"/>
              
              {/* Concentric hill formation - right side */}
              <ellipse cx="380" cy="80" rx="80" ry="40" fill="none" stroke="white" strokeWidth="1.5" opacity="0.2"/>
              <ellipse cx="380" cy="80" rx="60" ry="30" fill="none" stroke="white" strokeWidth="1.2" opacity="0.18"/>
              <ellipse cx="380" cy="80" rx="40" ry="20" fill="none" stroke="white" strokeWidth="1" opacity="0.15"/>
              <ellipse cx="380" cy="80" rx="20" ry="10" fill="none" stroke="white" strokeWidth="0.8" opacity="0.12"/>
              
              {/* Bottom terrain lines */}
              <path d="M0 280 Q100 240 200 260 T400 240" fill="none" stroke="white" strokeWidth="1.2" opacity="0.18"/>
              <path d="M0 295 Q100 255 200 275 T400 255" fill="none" stroke="white" strokeWidth="1" opacity="0.15"/>
              
              {/* Scattered elevation markers */}
              <circle cx="60" cy="60" r="25" fill="none" stroke="white" strokeWidth="1.2" opacity="0.15"/>
              <circle cx="60" cy="60" r="15" fill="none" stroke="white" strokeWidth="1" opacity="0.12"/>
              
              {/* Additional flowing line */}
              <path d="M-20 220 Q80 180 180 200 T380 180" fill="none" stroke="white" strokeWidth="1" opacity="0.15"/>
            </svg>
            
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-black/20 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10">Start Your 2026 Season Today</h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto relative z-10">
              Join thousands of organizers and attendees already using Axile to power their experiences in 2026.
            </p>
            <div className="flex flex-wrap justify-center gap-6 relative z-10">
              <Link href="/signup">
                <button className="px-10 py-5 bg-white text-primary rounded-2xl font-black hover:bg-white/90 transition-all hover:scale-105 shadow-xl">
                  Create Your Account
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-10 py-5 bg-black/20 text-white rounded-2xl font-black hover:bg-black/30 transition-all border border-white/20">
                  Contact Sales
                </button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default FeaturesPage;
