"use client";

import React, { useRef, memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Briefcase,
  Users,
  CheckCircle2,
  Star,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import HiringApplicationForm from "@/components/hiring/HiringApplicationForm";

// Hardware accelerated variants
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: i * 0.05, 
      duration: 0.4, 
      ease: [0.25, 0.1, 0.25, 1.0] 
    },
  }),
};

// Memoized static sections to prevent re-renders
const SectionCard = memo(({ children, title, icon: Icon, iconColor = "text-primary", delay = 1 }) => (
  <motion.div
    custom={delay}
    initial="hidden"
    animate="visible"
    variants={fadeUp}
    style={{ willChange: "transform, opacity" }}
    className="mb-8"
  >
    <div className="p-6 md:p-8 rounded-3xl bg-card border border-border">
      <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
        {title}
      </h2>
      {children}
    </div>
  </motion.div>
));
SectionCard.displayName = "SectionCard";

export default function JobDetailClient({ role }) {
  const applyRef = useRef(null);

  const scrollToApply = () => {
    applyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-20 selection:bg-primary/30 overflow-x-hidden">
      {/* Background Decor - Optimized */}
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
        <div className="max-w-4xl mx-auto">
          {/* ── Back Link ── */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Link
              href="/hiring"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to all positions
            </Link>
          </motion.div>

          <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8">
            {/* ── Main Content ── */}
            <div>
              {/* Header */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                style={{ willChange: "transform, opacity" }}
                className="mb-8"
              >
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    <Users className="h-3 w-3" />
                    {role.team}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full capitalize">
                    {role.roleType.replace('_', '-')}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                  {role.title}
                </h1>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary/70" />
                    {role.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-primary/70" />
                    {role.employmentType}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary/70" />
                    {role.duration}
                  </span>
                </div>
              </motion.div>

              {/* Description */}
              <SectionCard title="About the Role" delay={1}>
                <p className="text-muted-foreground leading-relaxed">
                  {role.description}
                </p>
              </SectionCard>

              {/* Responsibilities */}
              <SectionCard title="Key Responsibilities" delay={2}>
                <ul className="space-y-3">
                  {role.responsibilities.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </SectionCard>

              {/* Requirements */}
              <SectionCard title="Requirements" delay={3}>
                <ul className="space-y-3">
                  {role.requirements.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-xs text-muted-foreground/70 italic leading-relaxed">
                  PS – You don&apos;t have to meet all the requirements. As long as you&apos;re ready to learn, we&apos;re willing to make you a pro.
                </p>
              </SectionCard>

              {/* Nice to Have */}
              {role.niceToHave && role.niceToHave.length > 0 && (
                <SectionCard title="Nice to Have" delay={4}>
                  <ul className="space-y-3">
                    {role.niceToHave.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Star className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              {/* ── Application Form ── */}
              <motion.div
                custom={5}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                style={{ willChange: "transform, opacity" }}
                ref={applyRef}
                className="scroll-mt-24"
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                  Apply for this Role
                </h2>
                <HiringApplicationForm
                  defaultPosition={role.title}
                  roleType={role.roleType}
                />
              </motion.div>
            </div>

            {/* ── Sticky Sidebar (Desktop) ── */}
            <div className="hidden lg:block">
              <div className="sticky top-28">
                <motion.div
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  style={{ willChange: "transform, opacity" }}
                  className="p-6 rounded-3xl bg-card border border-border space-y-5"
                >
                  <h3 className="font-bold text-lg">Quick Info</h3>

                  <div className="space-y-4 text-sm">
                    {[
                      { label: "Team", value: role.team },
                      { label: "Location", value: role.location },
                      { label: "Type", value: role.employmentType },
                      { label: "Duration", value: role.duration },
                      { label: "Role Type", value: role.roleType.replace('_', '-'), capitalize: true },
                    ].map((item, i) => (
                      <div key={i}>
                        <p className="text-muted-foreground mb-1">{item.label}</p>
                        <p className={`font-semibold ${item.capitalize ? 'capitalize' : ''}`}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={scrollToApply}
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-bold text-sm"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Apply Now
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Sticky Apply Button ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border z-40">
        <Button
          onClick={scrollToApply}
          className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold text-base"
        >
          <Send className="h-5 w-5 mr-2" />
          Apply Now
        </Button>
      </div>
    </div>
  );
}
