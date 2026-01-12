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
        const response = await api.get('/events/');
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

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Enhanced Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-primary">Nigeria's #1 Campus Ticketing Platform</span>
            </motion.div>
            
            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1]">
              Experience Events
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-primary animate-gradient-x">
                Like Never Before
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The all-in-one platform connecting <span className="text-foreground font-semibold">students</span> to unforgettable events and empowering <span className="text-foreground font-semibold">organizers</span> to sell out shows.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/events">
                <Button size="lg" className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all">
                  Explore Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-border hover:bg-muted group">
                  Start Selling Tickets
                  <TrendingUp className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
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
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <StatCard icon={<Calendar className="h-6 w-6" />} value={stats.events} label="Events Hosted" />
            <StatCard icon={<Users className="h-6 w-6" />} value={stats.tickets} label="Tickets Sold" />
            <StatCard icon={<Award className="h-6 w-6" />} value={stats.organizers} label="Organizers" />
            <StatCard icon={<Star className="h-6 w-6" />} value={stats.satisfaction} label="Satisfaction" />
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Trending Events</h2>
                <p className="text-lg text-muted-foreground">
                  Discover the hottest events happening right now on campus
                </p>
              </motion.div>
            </div>
            <Link href="/events">
              <Button variant="outline" size="lg" className="border-border hover:bg-muted group">
                View All Events
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {loadingEvents ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/5] rounded-3xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event, index) => (
                <motion.div
                  key={event.event_id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/events/${event.event_id}`}>
                    <div className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
                      {/* Image */}
                      <div className="absolute inset-0">
                        {event.event_image ? (
                          <img 
                            src={getImageUrl(event.event_image)} 
                            alt={event.event_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-background">
                            <Calendar className="h-20 w-20 text-muted-foreground/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                      </div>

                      {/* Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                          {event.event_type}
                        </span>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md ${
                          event.pricing_type === 'free' 
                            ? 'bg-green-500/90 text-white' 
                            : 'bg-black/60 text-white border border-white/20'
                        }`}>
                          {event.pricing_type === 'free' ? 'FREE' : `₦${parseFloat(event.event_price).toLocaleString()}`}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(event.event_date).toLocaleDateString('en-US', { 
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}</span>
                            <span className="mx-2">•</span>
                            <Clock className="h-4 w-4" />
                            <span>{new Date(event.event_date).toLocaleTimeString('en-US', { 
                              hour: 'numeric', minute: '2-digit'
                            })}</span>
                          </div>
                          
                          <h3 className="text-2xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                            {event.event_name}
                          </h3>
                          
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">{event.event_location}</span>
                          </div>

                          <div className="pt-2 flex items-center text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                            Get Tickets <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-3xl border border-border">
              <Calendar className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No upcoming events at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Everything you need to succeed
              </h2>
              <p className="text-xl text-muted-foreground">
                Whether you're discovering your next favorite event or selling out your biggest show yet, Radar has you covered.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <FeatureCard 
              icon={<Calendar className="h-10 w-10" />}
              title="Smart Discovery"
              description="AI-powered recommendations help you find events that match your interests. Never miss what matters to you."
              color="text-primary"
            />
            <FeatureCard 
              icon={<QrCode className="h-10 w-10" />}
              title="Digital Tickets"
              description="Instant QR code tickets delivered to your phone. No printing, no hassle, just scan and enter."
              color="text-purple-500"
            />
            <FeatureCard 
              icon={<ShieldCheck className="h-10 w-10" />}
              title="Secure Checkout"
              description="Bank-grade encryption and Paystack integration ensure your payments are always safe and instant."
              color="text-green-500"
            />
            <FeatureCard 
              icon={<BarChart3 className="h-10 w-10" />}
              title="Real-time Analytics"
              description="Track ticket sales, revenue, and attendee data in real-time. Make data-driven decisions for your events."
              color="text-orange-500"
            />
            <FeatureCard 
              icon={<Users className="h-10 w-10" />}
              title="Community Hub"
              description="Connect with fellow students, discover communities, and build lasting networks through shared experiences."
              color="text-blue-500"
            />
            <FeatureCard 
              icon={<Zap className="h-10 w-10" />}
              title="Lightning Setup"
              description="Create and publish your event in under 5 minutes. Customize everything from ticket tiers to pricing."
              color="text-yellow-500"
            />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Trusted by the OAU community
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of students and organizers who've made Radar their go-to platform
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <TestimonialCard 
              quote="Radar made selling tickets for our tech conference so easy. Real-time analytics helped us make better decisions!"
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
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 relative overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <h2 className="text-5xl md:text-6xl font-black tracking-tight">
              Ready to transform your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                event experience?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join our community today and discover why Radar is the #1 choice for campus events.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/signup">
                <Button size="lg" className="h-16 px-12 text-xl rounded-full bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all">
                  Get Started Free
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/events">
                <Button size="lg" variant="outline" className="h-16 px-12 text-xl rounded-full border-border hover:bg-muted">
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

const StatCard = ({ icon, value, label }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="text-center space-y-2"
  >
    <div className="flex items-center justify-center text-primary mb-2">
      {icon}
    </div>
    <div className="text-4xl md:text-5xl font-black text-foreground">
      {value}
    </div>
    <div className="text-sm text-muted-foreground font-medium">
      {label}
    </div>
  </motion.div>
);

const FeatureCard = ({ icon, title, description, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -8 }}
    className="p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group"
  >
    <div className={`mb-6 p-4 rounded-2xl bg-muted w-fit ${color} group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">{title}</h3>
    <p className="text-muted-foreground leading-relaxed text-lg">
      {description}
    </p>
  </motion.div>
);

const TestimonialCard = ({ quote, author, role }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -5 }}
    className="p-8 rounded-3xl bg-card border border-border hover:border-primary/30 transition-all space-y-6"
  >
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
      ))}
    </div>
    <p className="text-lg leading-relaxed text-foreground/90">
      "{quote}"
    </p>
    <div className="pt-4 border-t border-border">
      <div className="font-bold text-foreground">{author}</div>
      <div className="text-sm text-muted-foreground">{role}</div>
    </div>
  </motion.div>
);

export default LandingPage;