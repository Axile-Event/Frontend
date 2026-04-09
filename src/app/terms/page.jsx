"use client";

import React from "react";
import { motion } from "framer-motion";
import { Scale, Users, Ticket, AlertCircle, RefreshCw, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
  const sections = [
    {
      title: "Agreement to Terms",
      icon: <Scale className="h-6 w-6 text-primary" />,
      content: "By accessing and using Axile, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you are prohibited from using the platform."
    },
    {
      title: "User Accounts",
      icon: <Users className="h-6 w-6 text-purple-500" />,
      content: "When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms."
    },
    {
      title: "Ticketing & Payments",
      icon: <Ticket className="h-6 w-6 text-green-500" />,
      content: "All ticket sales are final. Axile acts as an intermediary between event organizers and attendees. We are not responsible for event cancellations but will facilitate communication between parties."
    },
    {
      title: "Prohibited Activities",
      icon: <AlertCircle className="h-6 w-6 text-red-500" />,
      content: "You may not use the Service for any illegal or unauthorized purpose. You agree to comply with all laws, rules and regulations applicable to your use of the Service."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-20">
      {/* Background Decor */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none -z-10">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Terms of <span className="text-primary">Service</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Last updated: January 20, 2026
          </p>
        </motion.div>

        <div className="space-y-12">
          {sections.map((section, index) => (
            <motion.section
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </motion.section>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center"
        >
          <h3 className="text-xl font-bold mb-4">Questions about Terms?</h3>
          <p className="text-muted-foreground mb-6">
            If you have any questions regarding these terms, please reach out to our legal team.
          </p>
          <Link href="/contact">
            <Button className="rounded-full px-8">Contact Us</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;
