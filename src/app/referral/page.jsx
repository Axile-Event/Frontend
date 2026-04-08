"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Gift,
  Share2,
  TrendingUp,
  ArrowRight,
  ChevronDown,
  Mail,
  Sparkles,
} from "lucide-react";
import BenefitCard from "@/components/BenefitCard";
import StepCard from "@/components/StepCard";
import * as Accordion from "@radix-ui/react-accordion";

const ReferralPage = () => {
  const [email, setEmail] = useState("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const fadeInScale = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-48 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            //done
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            {/* Badge */}
            <motion.div
              variants={fadeInScale}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-primary">Earn While You Share</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeInScale}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1]"
            >
              Share events.
              <br />
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-primary"
              >
                Earn rewards.
              </motion.span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInScale}
              className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              Invite friends to events and earn when they buy tickets. It's
              simple, secure, and rewarding.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInScale}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <a href="https://referral.axile.ng" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all rounded-2xl"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <Link href="#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-10 text-lg border-border hover:bg-muted group rounded-2xl"
                >
                  Learn How It Works
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicator */}
            <motion.div
              variants={fadeInScale}
              className="pt-8 text-sm text-muted-foreground font-medium"
            >
              ✓ Join thousands already earning by sharing events
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                Why Share With Axile?
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Get rewarded for doing what you love — sharing great events with
                your network.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <BenefitCard
              icon={Gift}
              title="Earn Cash or Credits"
              description="Get rewarded for every ticket sold through your referral link. Withdraw anytime or use credits for future events."
              delay={0}
            />
            <BenefitCard
              icon={Share2}
              title="Share Instantly"
              description="Share your link via WhatsApp, Twitter, email, or anywhere else. No limits on how many friends you can reach."
              delay={0.1}
            />
            <BenefitCard
              icon={TrendingUp}
              title="Track Your Earnings"
              description="See your clicks, conversions, and earnings in real-time on your dashboard. Complete transparency."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Get started in minutes. Three simple steps to start earning.
              </p>
            </motion.div>
          </div>

          {/* Steps Grid */}
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid md:grid-cols-3 gap-12 relative"
            >
              {/* Connecting Lines - Desktop Only */}
              <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary to-primary/20 -z-10" />

              <StepCard
                number="1"
                title="Create Your Link"
                description="Sign up or log in to get your unique referral link. No setup fees or complications."
                delay={0}
              />
              <StepCard
                number="2"
                title="Share With Friends"
                description="Share your link on social media, via messaging, email, or anywhere. The more you share, the more you earn."
                delay={0.15}
              />
              <StepCard
                number="3"
                title="Get Credited"
                description="When friends buy tickets through your link, you instantly get credited. Withdraw earnings whenever you want."
                delay={0.3}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Action Section */}
      <section id="create-link" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl mx-auto bg-card rounded-3xl border border-border p-8 md:p-12 shadow-lg"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-black mb-2">
                Ready to Earn?
              </h2>
              <p className="text-muted-foreground">
                Create your referral link in seconds
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-4 px-6 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <a href="https://referral.axile.ng" target="_blank" rel="noopener noreferrer" className="block">
                <Button
                  size="lg"
                  className="w-full h-14 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all rounded-xl"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Create My Link
                </Button>
              </a>

              <p className="text-center text-sm text-muted-foreground pt-2">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                Common Questions
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Everything you need to know about our referral program
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <Accordion.Root type="single" collapsible className="space-y-3">
              {/* FAQ Item 1 */}
              <Accordion.Item
                value="item-1"
                className="border border-border rounded-xl bg-card overflow-hidden hover:border-primary/30 transition-colors"
              >
                <Accordion.Trigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors group cursor-pointer">
                  <span className="text-left font-semibold text-foreground group-hover:text-primary transition-colors">
                    Do I need an account?
                  </span>
                  <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-300 group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
                <Accordion.Content className="px-6 py-4 border-t border-border bg-muted/20 text-muted-foreground leading-relaxed">
                  Yes, you'll need a quick account to get started. Sign up takes
                  less than 2 minutes, and you can start sharing immediately
                  after.
                </Accordion.Content>
              </Accordion.Item>

              {/* FAQ Item 2 */}
              <Accordion.Item
                value="item-2"
                className="border border-border rounded-xl bg-card overflow-hidden hover:border-primary/30 transition-colors"
              >
                <Accordion.Trigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors group cursor-pointer">
                  <span className="text-left font-semibold text-foreground group-hover:text-primary transition-colors">
                    When do I get paid?
                  </span>
                  <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-300 group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
                <Accordion.Content className="px-6 py-4 border-t border-border bg-muted/20 text-muted-foreground leading-relaxed">
                  Earnings appear in your dashboard instantly. You can withdraw
                  to your bank account once you reach the minimum amount. Check
                  your dashboard for payout details.
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 relative overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
            }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]"
          />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto space-y-10"
          >
            <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
              Start Earning Today
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join our community of referrers and start making money by sharing
              events you love.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a href="https://referral.axile.ng" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="h-16 px-12 text-xl rounded-[1.2rem] bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all font-black"
                >
                  Create Account
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </a>
              <Link href="/events">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 px-12 text-xl rounded-[1.2rem] border-border hover:bg-muted font-black"
                >
                  Browse Events
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ReferralPage;
