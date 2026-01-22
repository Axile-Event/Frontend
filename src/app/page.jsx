"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Calendar, QrCode, ShieldCheck, Zap, Users, BarChart3, ArrowRight, 
  Sparkles, TrendingUp, Award, CheckCircle2, Star, MapPin, Clock
} from "lucide-react";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { getImageUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const LandingPage = () => {
  const { token } = useAuthStore();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [stats] = useState({
    events: "500+",
    tickets: "10K+",
    organizers: "100+",
    satisfaction: "98%"
  });

  useEffect(() => {
    if (token) {
      router.replace("/dashboard");
    }
  }, [token, router]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/event/');
        const eventsData = Array.isArray(response.data) ? response.data : (response.data.events || []);
        const verifiedEvents = eventsData.filter(event => !event.status || event.status === 'verified');
        setEvents(verifiedEvents.slice(0, 6)); 
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  const fadeInScale = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">
      {/* Enhanced Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" 
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            {/* Badge */}
            <motion.div
              variants={fadeInScale}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-primary">Nigeria's #1 Campus Ticketing Platform</span>
            </motion.div>
            
            {/* Main Headline */}
            <motion.h1 
              variants={fadeInScale}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1]"
            >
              Experience Events
              <br />
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="text-primary"
              >
                Like Never Before
              </motion.span>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p 
              variants={fadeInScale}
              className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              The all-in-one platform connecting <span className="text-foreground font-semibold">students</span> to unforgettable events and empowering <span className="text-foreground font-semibold">organizers</span> to sell out shows.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeInScale} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/events">
                <Button size="lg" className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all rounded-2xl">
                  Explore Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/signup?tab=organizer">
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-border hover:bg-muted group rounded-2xl">
                  Start Selling Tickets
                  <TrendingUp className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div variants={fadeInScale} className="pt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Instant QR Tickets</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>24/7 Support</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto"
          >
            <StatCard icon={<Calendar className="h-6 w-6" />} value={stats.events} label="Events Hosted" />
            <StatCard icon={<Users className="h-6 w-6" />} value={stats.tickets} label="Tickets Sold" />
            <StatCard icon={<Award className="h-6 w-6" />} value={stats.organizers} label="Organizers" />
            <StatCard icon={<Star className="h-6 w-6" />} value={stats.satisfaction} label="Satisfaction" />
          </motion.div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-4 italic">Trending Events</h2>
                <p className="text-lg text-muted-foreground">
                  Discover the hottest events happening right now in 2026.
                </p>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Link href="/events">
                <Button variant="outline" size="lg" className="border-border hover:bg-muted group rounded-2xl">
                  View All Events
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {loadingEvents ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-3xl" />
              ))}
            </div>
          ) : events.length > 0 ? (
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {events.map((event, index) => (
                <motion.div
                  key={event.event_id}
                  variants={fadeInScale}
                >
                  <Link href={`/events/${event.event_slug || event.event_id}`}>
                    <div className="group relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-card border border-border hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
                      {/* Image */}
                      <div className="absolute inset-0">
                        {event.event_image ? (
                          <img 
                            src={getImageUrl(event.event_image)} 
                            alt={event.event_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-background">
                            <Calendar className="h-20 w-20 text-muted-foreground/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>

                      {/* Badges */}
                      <div className="absolute top-6 left-6 right-6 flex items-start justify-between gap-2 z-10">
                        <span className="px-4 py-1.5 rounded-full bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-sm">
                          {event.event_type}
                        </span>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black shadow-lg backdrop-blur-md ${
                          event.pricing_type === 'free' 
                            ? 'bg-green-500/90 text-white' 
                            : 'bg-white/10 text-white border border-white/20'
                        }`}>
                          {event.pricing_type === 'free' ? 'FREE' : `₦${parseFloat(event.event_price).toLocaleString()}`}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 text-xs font-medium text-white/70">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              <span>{new Date(event.event_date).toLocaleDateString('en-US', { 
                                month: 'short', day: 'numeric'
                              })}</span>
                            </div>
                            <div className="h-3 w-px bg-white/20" />
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              <span>{new Date(event.event_date).toLocaleTimeString('en-US', { 
                                hour: 'numeric', minute: '2-digit'
                              })}</span>
                            </div>
                          </div>
                          
                          <h3 className="text-2xl font-black leading-tight group-hover:text-primary transition-colors duration-300">
                            {event.event_name}
                          </h3>
                          
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">{event.event_location}</span>
                          </div>

                          <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="flex items-center text-xs font-black uppercase tracking-widest text-primary gap-2">
                              Secure Your Spot <ArrowRight className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20 bg-card rounded-[2.5rem] border border-border">
              <Calendar className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No upcoming events at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                Everything you need to succeed
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Whether you're discovering your next favorite event or selling out your biggest show yet, Axile has you covered.
              </p>
            </motion.div>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          >
            <FeatureCard 
              icon={<Calendar className="h-10 w-10" />}
              title="Smart Discovery"
              description="AI-powered recommendations help you find events that match your interests. Never miss what matters to you."
              color="bg-primary/10 text-primary"
            />
            <FeatureCard 
              icon={<QrCode className="h-10 w-10" />}
              title="Digital Tickets"
              description="Instant QR code tickets delivered to your phone. No printing, no hassle, just scan and enter."
              color="bg-purple-500/10 text-purple-500"
            />
            <FeatureCard 
              icon={<ShieldCheck className="h-10 w-10" />}
              title="Secure Checkout"
              description="Bank-grade encryption and Paystack integration ensure your payments are always safe and instant."
              color="bg-green-500/10 text-green-500"
            />
            <FeatureCard 
              icon={<BarChart3 className="h-10 w-10" />}
              title="Real-time Analytics"
              description="Track ticket sales, revenue, and attendee data in real-time. Make data-driven decisions for your events."
              color="bg-orange-500/10 text-orange-500"
            />
            <FeatureCard 
              icon={<Users className="h-10 w-10" />}
              title="Community Hub"
              description="Connect with fellow students, discover communities, and build lasting networks through shared experiences."
              color="bg-blue-500/10 text-blue-500"
            />
            <FeatureCard 
              icon={<Zap className="h-10 w-10" />}
              title="Lightning Setup"
              description="Create and publish your event in under 5 minutes. Customize everything from ticket tiers to pricing."
              color="bg-yellow-500/10 text-yellow-500"
            />
          </motion.div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                Trusted by the community
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of students and organizers who've made Axile their go-to platform for the 2026 season.
              </p>
            </motion.div>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            <TestimonialCard 
              quote="Axile made selling tickets for our tech conference so easy. Real-time analytics helped us make better decisions!"
              author="Adewale Johnson"
              role="Tech Community Lead"
            />
            <TestimonialCard 
              quote="I love how easy it is to discover events. The QR code ticketing is super convenient - no more paper tickets!"
              author="Chioma Okafor"
              role="Final Year Student"
            />
            <TestimonialCard 
              quote="As an event organizer, having all my ticket sales and attendee data in one place has been a game-changer."
              author="Kunle Adeyemi"
              role="Event Organizer"
            />
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 relative overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
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
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl mx-auto space-y-10"
          >
            <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
              Ready to transform your
              <br />
              <span className="text-primary italic">
                event experience?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join our community today and discover why Axile is the #1 choice for campus events in 2026.
            </p>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link href="/signup">
                <Button size="lg" className="h-16 px-12 text-xl rounded-[1.2rem] bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all font-black">
                  Get Started Free
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/events">
                <Button size="lg" variant="outline" className="h-16 px-12 text-xl rounded-[1.2rem] border-border hover:bg-muted font-black">
                  Browse Events
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon, value, label }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    }}
    className="text-center space-y-2 p-6 rounded-3xl bg-secondary/20 border border-border/50 hover:border-primary/30 transition-colors group relative overflow-hidden"
  >
    {/* Subtle African Elevation Lines */}
    <div className="absolute inset-0 pointer-events-none opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-amber-600"/>
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-amber-600"/>
        <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-500"/>
        <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="0.4" className="text-amber-500"/>
      </svg>
    </div>
    
    <div className="relative z-10 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="relative z-10 text-4xl md:text-5xl font-black text-foreground">
      {value}
    </div>
    <div className="relative z-10 text-xs text-muted-foreground font-black uppercase tracking-widest opacity-60">
      {label}
    </div>
  </motion.div>
);

const FeatureCard = ({ icon, title, description, color }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 30, scale: 0.95 },
      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6 } }
    }}
    whileHover={{ y: -12, transition: { duration: 0.3 } }}
    className="p-10 rounded-[2.5rem] bg-card border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(225,29,72,0.08)] group relative overflow-hidden"
  >
    {/* African Topographic Contour Lines */}
    <div className="absolute inset-0 pointer-events-none opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-700">
      <svg className="w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
        <path d="M-20,100 Q30,40 100,60 Q170,80 220,30" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-600"/>
        <path d="M-20,120 Q40,60 100,80 Q160,100 220,50" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-600"/>
        <path d="M-20,140 Q50,80 100,100 Q150,120 220,70" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-600"/>
        <path d="M-20,160 Q60,100 100,120 Q140,140 220,90" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-600"/>
        <path d="M-20,180 Q70,120 100,140 Q130,160 220,110" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-amber-500"/>
        <path d="M-20,200 Q80,140 100,160 Q120,180 220,130" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-amber-500"/>
        <circle cx="160" cy="40" r="25" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-amber-600"/>
        <circle cx="160" cy="40" r="18" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-amber-600"/>
        <circle cx="160" cy="40" r="10" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-amber-600"/>
      </svg>
    </div>
    
    <div className={`relative z-10 mb-8 p-5 rounded-2xl w-fit ${color} group-hover:scale-110 transition-transform duration-500 group-hover:rotate-6 shadow-sm`}>
      {icon}
    </div>
    <h3 className="relative z-10 text-2xl font-black tracking-tight mb-4 group-hover:text-primary transition-colors duration-300">{title}</h3>
    <p className="relative z-10 text-muted-foreground leading-relaxed text-lg opacity-80 group-hover:opacity-100 transition-opacity">
      {description}
    </p>
  </motion.div>
);

const TestimonialCard = ({ quote, author, role }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
    }}
    whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
    className="p-10 rounded-[2.5rem] bg-card border border-border hover:border-primary/20 transition-all duration-500 space-y-8 relative overflow-hidden group shadow-sm hover:shadow-xl"
  >
    {/* African River & Terrain Contour Lines */}
    <div className="absolute inset-0 pointer-events-none opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700">
      <svg className="w-full h-full" viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice">
        <path d="M0,200 Q40,180 60,190 Q100,210 140,180 Q180,150 200,160" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-amber-700"/>
        <path d="M0,210 Q50,190 70,200 Q110,220 150,190 Q190,160 200,170" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-600"/>
        <path d="M0,220 Q60,200 80,210 Q120,230 160,200 Q200,170 220,180" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-amber-600"/>
        <path d="M0,230 Q70,210 90,220 Q130,240 170,210 Q210,180 230,190" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-amber-500"/>
        <ellipse cx="30" cy="50" rx="20" ry="30" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-amber-600" transform="rotate(-15 30 50)"/>
        <ellipse cx="30" cy="50" rx="14" ry="22" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-amber-600" transform="rotate(-15 30 50)"/>
        <ellipse cx="30" cy="50" rx="8" ry="14" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-amber-500" transform="rotate(-15 30 50)"/>
        <path d="M150,0 Q160,30 155,60 Q150,90 160,120" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-amber-500"/>
        <path d="M160,0 Q170,30 165,60 Q160,90 170,120" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-amber-500"/>
      </svg>
    </div>
    
    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
      <Star size={80} className="fill-primary text-primary" />
    </div>
    <div className="flex gap-1.5 relative z-10">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
      ))}
    </div>
    <p className="text-xl leading-relaxed text-foreground font-medium relative z-10">
      "{quote}"
    </p>
    <div className="pt-6 border-t border-border flex items-center gap-4 relative z-10">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary">
        {author.charAt(0)}
      </div>
      <div>
        <div className="font-black text-foreground text-sm tracking-tight">{author}</div>
        <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">{role}</div>
      </div>
    </div>
  </motion.div>
);

export default LandingPage;