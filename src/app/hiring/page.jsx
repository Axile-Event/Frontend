"use client";

import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Users, Sparkles } from "lucide-react";
import HiringApplicationForm from "@/components/hiring/HiringApplicationForm";

export default function HiringPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-20 selection:bg-primary/30">
      {/* Background Decor */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none -z-10">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-32 left-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-40 right-10 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]"
        />
      </div>

      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-primary">We're Hiring</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Join Our <span className="text-primary">Team</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Apply for full-time, internship, part-time or contract roles. Help us build the future of event ticketing in Nigeria.
          </p>
        </motion.div>

        {/* Why Join Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16"
        >
          <WhyCard
            icon={<Briefcase className="h-7 w-7" />}
            title="Impactful Work"
            description="Work on a platform serving thousands of students and event organizers."
            color="bg-primary/10 text-primary"
          />
          <WhyCard
            icon={<Users className="h-7 w-7" />}
            title="Great Culture"
            description="Join a young, passionate team building the next big thing out of Africa."
            color="bg-purple-500/10 text-purple-500"
          />
          <WhyCard
            icon={<Sparkles className="h-7 w-7" />}
            title="Grow With Us"
            description="Learn fast, take ownership, and grow your career from day one."
            color="bg-green-500/10 text-green-500"
          />
        </motion.div>

        {/* Application Form */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Apply Now</h2>
          <HiringApplicationForm />
        </motion.div>
      </div>
    </div>
  );
}

function WhyCard({ icon, title, description, color }) {
  return (
    <div className="p-6 rounded-3xl bg-card border border-border hover:border-primary/20 transition-all group">
      <div className={`mb-4 p-3 rounded-2xl w-fit ${color} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
