"use client";

import React, { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  MapPin,
  Clock,
  Briefcase,
  Users,
  ArrowRight,
  Zap,
  TrendingUp,
  Award,
  Heart,
  Globe,
  BookOpen,
} from "lucide-react";
import { hiringRoles } from "@/data/hiringRoles";

// Optimized variants with hardware acceleration
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: i * 0.05, // Faster stagger for mobile snappiness
      duration: 0.4, 
      ease: [0.25, 0.1, 0.25, 1.0] // Smoother cubic-bezier
    },
  }),
};

export default function HiringPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-20 selection:bg-primary/30 overflow-x-hidden">
      {/* Background Decor - Optimized for performance */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none -z-10">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ willChange: "transform, opacity" }}
          className="absolute top-32 left-10 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/5 rounded-full blur-[80px] md:blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          style={{ willChange: "transform, opacity" }}
          className="absolute bottom-40 right-10 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-500/5 rounded-full blur-[80px] md:blur-[120px]"
        />
      </div>

      <div className="container mx-auto px-4">
        {/* ── Hero Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ willChange: "transform, opacity" }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium mb-6 md:mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-primary">We&apos;re Hiring</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Join the <span className="text-primary">Axile</span> Team
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Help us build the future of event ticketing in Nigeria. We&apos;re
            looking for passionate individuals ready to make an impact.
          </p>
        </motion.div>

        {/* ── About Axile.NG ── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeUp}
          style={{ willChange: "transform, opacity" }}
          className="max-w-4xl mx-auto mb-16 md:mb-20"
        >
          <div className="p-6 md:p-10 rounded-3xl bg-card border border-border overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-primary/10">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">
                About Axile.NG
              </h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Axile.ng is a fast-growing event ticketing and management
                platform built for Nigeria. We help event organizers sell
                tickets, manage attendance, and grow their audiences — while
                making it easy for attendees to discover and book amazing
                experiences.
              </p>
              <p className="hidden md:block">
                We&apos;re a young, ambitious team passionate about events,
                technology, and building products that solve real problems. From
                intimate concerts to city-wide festivals, Axile is becoming the
                go-to platform for events in Nigeria.
              </p>
              <p>
                We believe in learning by doing, moving fast, and empowering
                every team member to take ownership. If you&apos;re excited
                about the intersection of tech, events, and culture — we&apos;d
                love to have you on board.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ── What You'll Gain ── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-4xl mx-auto mb-16 md:mb-20"
        >
          <motion.div variants={fadeUp} style={{ willChange: "transform, opacity" }} className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              What You&apos;ll Gain
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              More than just an internship — a launchpad for your career.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <Zap className="h-5 w-5" />,
                text: "Hands-on experience at a real startup",
                color: "bg-amber-500/10 text-amber-500",
              },
              {
                icon: <BookOpen className="h-5 w-5" />,
                text: "Mentorship from experienced leads",
                color: "bg-blue-500/10 text-blue-500",
              },
              {
                icon: <TrendingUp className="h-5 w-5" />,
                text: "Build a strong portfolio to showcase",
                color: "bg-green-500/10 text-green-500",
              },
              {
                icon: <Award className="h-5 w-5" />,
                text: "Letter of recommendation (on completion)",
                color: "bg-purple-500/10 text-purple-500",
              },
              {
                icon: <Heart className="h-5 w-5" />,
                text: "Flexible, remote-friendly work culture",
                color: "bg-pink-500/10 text-pink-500",
              },
              {
                icon: <Users className="h-5 w-5" />,
                text: "Opportunity for transition into paid roles",
                color: "bg-primary/10 text-primary",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                style={{ willChange: "transform, opacity" }}
                className="flex items-start gap-3 p-5 rounded-2xl bg-card border border-border hover:border-primary/20 transition-colors group"
              >
                <div
                  className={`p-2.5 rounded-xl ${item.color} shrink-0 group-hover:scale-105 transition-transform duration-300`}
                >
                  {item.icon}
                </div>
                <p className="text-sm leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Open Positions ── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-5xl mx-auto"
        >
          <motion.div variants={fadeUp} style={{ willChange: "transform, opacity" }} className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Open Positions
            </h2>
            <p className="text-muted-foreground">
              {hiringRoles.length} open roles — find your perfect fit.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {hiringRoles.map((role, i) => (
              <motion.div 
                key={role.slug} 
                custom={i} 
                variants={fadeUp}
                style={{ willChange: "transform, opacity" }}
              >
                <RoleCard role={role} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

/* ── Role Card ── */
// Memoized to prevent unnecessary re-renders when parent state updates
const RoleCard = memo(({ role }) => {
  return (
    <Link href={`/hiring/${role.slug}`} className="block group">
      <div className="p-6 rounded-3xl bg-card border border-border hover:border-primary/30 transition-all duration-300 h-full flex flex-col hover:shadow-lg hover:shadow-primary/5">
        {/* Team badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Users className="h-3 w-3" />
            {role.team}
          </span>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full capitalize">
            {role.roleType.replace('_', '-')}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">
          {role.title}
        </h3>

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 mb-5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {role.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            {role.employmentType}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {role.duration}
          </span>
        </div>

        {/* CTA */}
        <div className="mt-auto pt-4 border-t border-border">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all duration-300">
            View Details
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
});

RoleCard.displayName = "RoleCard";
