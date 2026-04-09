"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText, Bell, Globe } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "Introduction",
      icon: <FileText className="h-6 w-6 text-primary" />,
      content: "Welcome to Axile. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us."
    },
    {
      title: "Information We Collect",
      icon: <Eye className="h-6 w-6 text-purple-500" />,
      content: "We collect personal information that you provide to us such as name, address, contact information, passwords and security data, and payment information when you register on our platform."
    },
    {
      title: "How We Use Your Info",
      icon: <Lock className="h-6 w-6 text-green-500" />,
      content: "We use personal information collected via our platform for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations."
    },
    {
      title: "Data Security",
      icon: <Shield className="h-6 w-6 text-blue-500" />,
      content: "We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-20">
      {/* Background Decor */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Privacy <span className="text-primary">Policy</span>
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
          <h3 className="text-xl font-bold mb-4">Have questions?</h3>
          <p className="text-muted-foreground mb-6">
            If you have questions or comments about this policy, you may email us at axile.nig@gmail.com
          </p>
          <Link href="/contact">
            <Button className="rounded-full px-8">Contact Support</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
