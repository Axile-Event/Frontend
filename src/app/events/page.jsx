"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Calendar as CalendarIcon, Search, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PublicEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/create-event/");
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) =>
    event.event_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0A0A14] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
      <div className="container mx-auto px-4 pt-20 pb-12 md:pt-28 md:pb-16">
        {/* Header & Search */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12">
          <div className="space-y-4">
            <Link href="/">
              <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary mb-2 -ml-2 text-gray-400">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
               <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2">Explore Events</h1>
               <p className="text-gray-400 text-lg">Discover the latest events happening on campus.</p>
            </div>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by event name..."
              className="pl-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 h-12 rounded-xl text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
             <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
               {[1, 2, 3, 4, 5, 6].map((i) => (
                 <div key={i} className="aspect-[4/3] rounded-2xl bg-white/5 animate-pulse" />
               ))}
             </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl bg-white/5 border border-white/10">
            <div className="h-20 w-20 rounded-full bg-black/40 flex items-center justify-center">
                <CalendarIcon className="h-10 w-10 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">No Events Found</h2>
            <p className="text-gray-400 max-w-md">We couldn't find any events at the moment. Please check again later.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEvents.length === 0 ? (
               <div className="text-center py-20">
                  <p className="text-xl text-gray-400">No events match "{searchQuery}"</p>
                  <Button 
                    variant="link" 
                    onClick={() => setSearchQuery("")}
                    className="text-primary mt-2"
                  >
                    Clear Search
                  </Button>
               </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.event_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link href={`/dashboard/student/events/${event.event_id}`}>
                      <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#0F0F16] border border-white/10 cursor-pointer hover:border-primary/50 transition-all duration-300 shadow-xl">
                        {/* Background Image */}
                        {event.event_image ? (
                          <img
                            src={event.event_image}
                            alt={event.event_name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="h-full w-full bg-[#1A1A24] flex items-center justify-center">
                             <CalendarIcon className="h-16 w-16 text-gray-700 opacity-50" />
                          </div>
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                        {/* Badges */}
                        <div className="absolute top-4 right-4 flex gap-2">
                           <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs font-semibold border border-white/10 text-white">
                             {event.pricing_type === 'free' ? 'Free' : `₦${event.event_price}`}
                           </div>
                        </div>
                        
                         <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-primary/90 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20">
                            {event.event_type}
                         </div>

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 text-white transform transition-transform duration-300">
                          <h3 className="text-xl font-bold leading-tight mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                            {event.event_name}
                          </h3>
                          
                          <div className="flex flex-col gap-2.5 text-sm text-gray-300">
                            <div className="flex items-center gap-2.5">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="line-clamp-1 opacity-90">{event.event_location}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                                  <span className="opacity-90">
                                    {new Date(event.event_date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      weekday: 'short'
                                    })}
                                    {' • '}
                                    {new Date(event.event_date).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicEventsPage;
