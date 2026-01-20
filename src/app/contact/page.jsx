"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-20">
      {/* Background Decor */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none -z-10">
        <div className="absolute top-40 left-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-40 right-10 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Have a question about an event or need help with your tickets?
            Our team is here to support you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Contact Information</h2>
              <p className="text-muted-foreground">
                Feel free to reach out via any of these channels. We typically respond within 24 hours.
              </p>
            </div>

            <div className="space-y-4">
              <ContactCard
                icon={<Mail className="h-6 w-6 text-primary" />}
                title="Email Us"
                description="axile.nig@gmail.com"
              />
              <ContactCard
                icon={<MessageSquare className="h-6 w-6 text-purple-500" />}
                title="Support Chat"
                description="Available 9am - 5pm"
              />
              <ContactCard
                icon={<MapPin className="h-6 w-6 text-green-500" />}
                title="Office"
                description="OAU Campus, Ile-Ife"
              />
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-8 rounded-3xl bg-card border border-border"
          >
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input placeholder="John Doe" className="bg-muted/50 border-border" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input type="email" placeholder="john@example.com" className="bg-muted/50 border-border" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="How can we help?" className="bg-muted/50 border-border" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  placeholder="Tell us more about your inquiry..." 
                  className="min-h-[150px] bg-muted/50 border-border"
                />
              </div>

              <Button className="w-full h-12 text-lg rounded-xl flex items-center gap-2">
                Send Message
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const ContactCard = ({ icon, title, description }) => (
  <div className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all">
    <div className="p-3 rounded-xl bg-muted">
      {icon}
    </div>
    <div>
      <h3 className="font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default ContactPage;
