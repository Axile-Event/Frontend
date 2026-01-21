"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Info, 
  Plus, 
  Zap, 
  ShieldCheck, 
  CreditCard,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  Coins
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";

const PRICING_PLANS = [
  {
    name: "Free Events",
    price: "₦0",
    description: "Perfect for community gatherings and student meetups.",
    features: [
      "No platform fees",
      "Unlimited tickets",
      "Digital QR scanning",
      "Event analytics",
      "Community messaging",
      "24/7 Student support"
    ],
    cta: "Start for Free",
    href: "/signup",
    highlight: false,
    color: "blue"
  },
  {
    name: "Paid Events",
    price: "6%",
    suffix: "+ ₦80 / ticket",
    description: "Built for concerts, conferences, and high-impact shows.",
    features: [
      "Everything in Free",
      "Instant payouts",
      "Secure payment escrow",
      "CSV Attendee exports",
      "Custom ticket tiers",
      "Advanced marketing tools"
    ],
    cta: "Grow Your Event",
    href: "/signup?tab=organizer",
    highlight: true,
    color: "primary"
  }
];

const FAQS = [
  {
    question: "When do I get paid?",
    answer: "Funds from ticket sales are held for 7 days as protection for your attendees, then become available for withdrawal. Once requested, funds typically arrive in your bank account within 1-3 business days."
  },
  {
    question: "Can the platform fee be customized?",
    answer: "For the 2026 season, our standard fee is 6% + ₦80. However, if you are a high-volume organizer or hosting a non-profit event, reach out to our team for custom partner rates."
  },
  {
    question: "What about refunds?",
    answer: "Axile provides a full refund mechanism. If you issue a refund, the platform fee is returned to the payout pool, and the customer receives their total payment back seamlessly."
  },
  {
    question: "Are there any monthly costs?",
    answer: "Absolutely not. Axile is strictly 'pay-as-you-sell'. No setup fees, no monthly subscriptions, and no hidden maintenance charges ever."
  }
];

const PricingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 overflow-hidden">
      <main className="pt-32 pb-20">
        {/* Background Accents */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-6 mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8"
          >
            <Coins size={16} className="text-primary" />
            <span className="text-sm font-medium">Transparent 2026 Pricing</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight"
          >
            Simple. Scaleable. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400">
              Zero Hidden Fees.
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            We believe in clear, honest pricing. You only pay when you sell tickets. 
            Free events stay free forever.
          </motion.p>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto px-6 mb-32">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          >
            {PRICING_PLANS.map((plan, index) => (
              <motion.div
                key={plan.name}
                variants={itemVariants}
                className={`relative p-8 md:p-12 rounded-[2.5rem] bg-secondary/30 backdrop-blur-xl border-2 transition-all duration-500 hover:shadow-2xl overflow-hidden group ${
                  plan.highlight 
                    ? 'border-primary shadow-primary/10 scale-105 z-10' 
                    : 'border-border hover:border-blue-500/50'
                }`}
              >
                {/* African Topographic Contour Lines */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-700">
                  <svg className="w-full h-full" viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice">
                    <path d="M-20,250 Q40,200 100,220 Q160,240 220,190" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-600"/>
                    <path d="M-20,270 Q50,220 100,240 Q150,260 220,210" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-amber-600"/>
                    <path d="M-20,290 Q60,240 100,260 Q140,280 220,230" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-amber-500"/>
                    <ellipse cx="170" cy="50" rx="25" ry="35" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-amber-600" transform="rotate(20 170 50)"/>
                    <ellipse cx="170" cy="50" rx="18" ry="26" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-amber-600" transform="rotate(20 170 50)"/>
                    <ellipse cx="170" cy="50" rx="10" ry="16" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-500" transform="rotate(20 170 50)"/>
                    <path d="M20,0 Q30,40 25,80 Q20,120 30,160" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-500"/>
                    <path d="M30,0 Q40,40 35,80 Q30,120 40,160" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-500"/>
                  </svg>
                </div>
                
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg z-20">
                    Most Popular
                  </div>
                )}

                <div className="mb-10">
                  <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-6xl font-black">{plan.price}</span>
                    <span className="text-muted-foreground font-medium">{plan.suffix}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed italic">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-10">
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full bg-${plan.color === 'primary' ? 'primary' : 'blue-500'}/10 flex items-center justify-center shrink-0`}>
                        <CheckCircle2 size={14} className={plan.color === 'primary' ? 'text-primary' : 'text-blue-500'} />
                      </div>
                      <span className="text-foreground font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href={plan.href} className="block">
                  <button className={`w-full py-5 rounded-2xl font-black transition-all hover:scale-[1.02] shadow-xl ${
                    plan.highlight 
                      ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20' 
                      : 'bg-white text-black hover:bg-white/90 shadow-white/5'
                  }`}>
                    {plan.cta}
                  </button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Calculation Breakdown */}
        <section className="container mx-auto px-6 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto p-10 md:p-16 rounded-[3rem] bg-gradient-to-br from-secondary/50 to-background border border-border relative overflow-hidden group"
          >
            {/* African Landscape Contour Lines */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04] group-hover:opacity-[0.07] transition-opacity duration-700">
              <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
                <path d="M0,150 Q50,120 100,140 Q150,160 200,130 Q250,100 300,120 Q350,140 400,110" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-amber-700"/>
                <path d="M0,165 Q60,135 110,155 Q160,175 210,145 Q260,115 310,135 Q360,155 410,125" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-600"/>
                <path d="M0,180 Q70,150 120,170 Q170,190 220,160 Q270,130 320,150 Q370,170 420,140" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-amber-600"/>
                <ellipse cx="60" cy="50" rx="30" ry="40" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-amber-600" transform="rotate(-10 60 50)"/>
                <ellipse cx="60" cy="50" rx="22" ry="30" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-amber-600" transform="rotate(-10 60 50)"/>
                <ellipse cx="60" cy="50" rx="14" ry="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-500" transform="rotate(-10 60 50)"/>
                <ellipse cx="340" cy="70" rx="25" ry="35" fill="none" stroke="currentColor" strokeWidth="0.7" className="text-amber-600" transform="rotate(15 340 70)"/>
                <ellipse cx="340" cy="70" rx="17" ry="25" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-500" transform="rotate(15 340 70)"/>
              </svg>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <TrendingUp size={120} className="text-primary" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row gap-16 items-center">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Info size={24} className="text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black">How Payouts Work</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We maintain total transparency in how your earnings are calculated. 
                  Fees are automatically handled so you can focus on the show.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <Zap size={16} className="text-primary" />
                    <span>No waiting for monthly cycles</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <Zap size={16} className="text-primary" />
                    <span>Instant receipt generation for attendees</span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-[400px] p-8 rounded-3xl bg-black border border-white/10 shadow-2xl space-y-6">
                <div className="text-xs font-black uppercase tracking-widest text-primary mb-4">Example Breakdown</div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-white/60">Ticket Price</span>
                    <span className="text-white text-lg">₦1,000</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-white/60">Platform Fee (6%)</span>
                    <span className="text-white">₦60</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-white/60">Service Charge</span>
                    <span className="text-white">₦80</span>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-white font-black">You Receive</span>
                    <span className="text-green-400 text-2xl font-black">₦940</span>
                  </div>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed italic text-center">
                  *Attendee pays ₦1,080. You receive ₦940 net profit per ticket.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* FAQs */}
        <section className="container mx-auto px-6 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground italic">Got questions? We've got answers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {FAQS.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-3xl bg-secondary/20 border border-border/50 hover:border-primary/20 transition-all group relative overflow-hidden"
              >
                {/* African Terrain Contour Lines */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
                  <svg className="w-full h-full" viewBox="0 0 150 100" preserveAspectRatio="xMidYMid slice">
                    <path d="M0,80 Q30,60 60,70 Q90,80 120,60 Q150,40 180,50" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-amber-600"/>
                    <path d="M0,90 Q35,70 65,80 Q95,90 125,70 Q155,50 185,60" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-amber-500"/>
                    <circle cx="130" cy="25" r="15" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-amber-600"/>
                    <circle cx="130" cy="25" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-500"/>
                  </svg>
                </div>
                
                <div className="flex gap-4 relative z-10">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <HelpCircle size={18} className="text-primary" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-foreground">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-16 rounded-[3rem] bg-gradient-to-br from-primary to-rose-600 text-white text-center relative overflow-hidden"
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
            
            <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10">Host Your Biggest Show Yet</h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed">
              Join thousands of organizers powering their 2026 events with Axile's industry-leading payment engine.
            </p>
            <div className="flex flex-wrap justify-center gap-6 relative z-10">
              <Link href="/signup">
                <button className="px-10 py-5 bg-white text-primary rounded-2xl font-black hover:bg-white/90 transition-all hover:scale-105 shadow-xl">
                  Get Started Now
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-10 py-5 bg-black/20 text-white rounded-2xl font-black hover:bg-black/30 transition-all border border-white/20">
                  Talk to Sales
                </button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default PricingPage;
