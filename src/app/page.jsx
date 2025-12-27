"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, QrCode, ShieldCheck, Zap, Users, BarChart3, ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

const LandingPage = () => {
  const { token } = useAuthStore();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    if (token) {
      router.replace("/dashboard");
    }
  }, [token, router]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/create-event/');
        setEvents(response.data.slice(0, 6)); 
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);




  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">

        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-sm text-muted-foreground mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live on OAU Campus
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                Campus Events
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover, book, and experience events like never before. 
              The all-in-one ticketing platform for students and organizers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/events">
                <Button size="lg" className="h-12 px-8 text-base bg-primary hover:bg-primary/90">
                  Start Exploring
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border bg-transparent text-foreground hover:bg-muted">
                  Organizer Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Discover Events Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Discover Events</h2>
              <p className="text-muted-foreground">Explore trending events happening around you</p>
            </div>
            <Link href="/events">
              <Button variant="outline" className="hidden md:flex border-border hover:bg-muted text-foreground">
                View All Events
              </Button>
            </Link>
          </div>

          {loadingEvents ? (
             <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-96 rounded-2xl bg-muted animate-pulse" />
                ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link href={`/dashboard/student/events/${event.event_id}`} key={event.event_id}>
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="group h-full rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/50 transition-colors"
                  >
                    <div className="aspect-video relative bg-muted">
                      {event.event_image ? (
                        <img 
                          src={event.event_image} 
                          alt={event.event_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                          <Calendar className="h-12 w-12 opacity-20" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-medium border border-white/10">
                        {event.pricing_type === 'free' ? 'Free' : `₦${event.event_price}`}
                      </div>
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary/90 text-white text-xs font-bold uppercase tracking-wider">
                        {event.event_type}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="text-sm text-primary mb-2 font-medium flex items-center gap-2">
                         <Calendar className="h-3.5 w-3.5" />
                         {new Date(event.event_date).toLocaleDateString(undefined, { 
                           month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                         })}
                      </div>
                      <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {event.event_name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {event.event_location}
                      </p>
                      <div className="flex items-center text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        Get Tickets <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
               <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
               <p className="text-muted-foreground">No upcoming events found at the moment.</p>
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Link href="/events">
              <Button size="lg" className="w-full border-white/20 bg-white/5 hover:bg-white/10 text-white">
                View All Events
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you're hosting a massive concert or looking for the next tech meetup, 
              Radar has the tools to make it happen.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard 
              icon={<Calendar className="h-8 w-8 text-primary" />}
              title="Easy Discovery"
              description="Find events that match your interests. From tech talks to music festivals, never miss out."
            />
            <FeatureCard 
              icon={<QrCode className="h-8 w-8 text-purple-500" />}
              title="Seamless Entry"
              description="Forget paper tickets. Get a unique QR code for instant check-in at the venue."
            />
            <FeatureCard 
              icon={<ShieldCheck className="h-8 w-8 text-green-500" />}
              title="Secure Payments"
              description="Safe and fast transactions. Pay with card or transfer and get your ticket instantly."
            />
            <FeatureCard 
              icon={<BarChart3 className="h-8 w-8 text-orange-500" />}
              title="Real-time Analytics"
              description="Organizers get live insights on ticket sales, revenue, and attendee demographics."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-blue-500" />}
              title="Community Focused"
              description="Built for the campus community. Connect with peers and grow your network."
            />
            <FeatureCard 
              icon={<Zap className="h-8 w-8 text-yellow-500" />}
              title="Instant Setup"
              description="Create an event in minutes. Customize ticket types, prices, and details effortlessly."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of students and organizers transforming the event experience today.
          </p>
          <Link href="/signup">
            <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-foreground text-background hover:bg-foreground/90">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}

    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors"
  >
    <div className="mb-4 p-3 rounded-xl bg-muted w-fit">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">
      {description}
    </p>
  </motion.div>
);

export default LandingPage;