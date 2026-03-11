"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Calendar as CalendarIcon, Search, ArrowLeft, Star, Sparkles, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/utils";
import { EventsGridSkeleton } from "@/components/skeletons";

const PublicEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); 

  const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/event/");
        const eventsData = Array.isArray(response.data) ? response.data : (response.data.events || []);
        // Only show verified events to public
        const verifiedEvents = eventsData.filter(event => !event.status || event.status === 'verified');
        // Randomize initial load
        setEvents(shuffleArray([...verifiedEvents]));
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getFilteredAndSortedEvents = () => {
    let filtered = events.filter((event) =>
      event.event_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply pricing filter
    if (filter === 'paid') {
      filtered = filtered.filter(event => event.pricing_type === 'paid');
    } else if (filter === 'free') {
      filtered = filtered.filter(event => event.pricing_type === 'free');
    }

    if (filter === 'latest') {
       return [...filtered].sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
    } else if (filter === 'popular') {
       // Sort by is_popular first, then by views_count if available
       return [...filtered].sort((a, b) => {
         if (a.is_popular !== b.is_popular) {
           return a.is_popular ? -1 : 1;
         }
         return (b.views_count || 0) - (a.views_count || 0);
       });
    } else {
       // 'all' - return the randomized list
       return filtered;
    }
  };

  const featuredEvents = events.filter(e => e.is_featured);

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

        {/* Featured Section */}
        {featuredEvents.length > 0 && !searchQuery && filter === 'all' && (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Featured Events</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
               {featuredEvents.slice(0, 2).map((event, idx) => (
                 <motion.div
                   key={`featured-${event.event_id}`}
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: idx * 0.1 }}
                 >
                   <Link href={`/events/${event.event_slug || event.event_id}`}>
                     <div className="group relative aspect-[21/9] overflow-hidden rounded-[2rem] bg-[#0F0F16] border border-white/10 cursor-pointer hover:border-primary/50 transition-all duration-500 shadow-2xl">
                        {event.event_image ? (
                          <img
                            src={getImageUrl(event.event_image)}
                            alt={event.event_name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full bg-[#1A1A24] flex items-center justify-center">
                             <CalendarIcon className="h-16 w-16 text-gray-700 opacity-50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        
                        <div className="absolute top-6 left-6 flex gap-2">
                           <div className="px-4 py-1.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                             <Star className="h-3 w-3 fill-black" />
                             Featured
                           </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                          <h3 className="text-2xl md:text-3xl font-black mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                            {event.event_name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-300">
                             <div className="flex items-center gap-2">
                               <MapPin className="h-4 w-4 text-primary" />
                               <span className="opacity-90">{event.event_location}</span>
                             </div>
                             <div className="flex items-center gap-2">
                               <CalendarIcon className="h-4 w-4 text-primary" />
                               <span className="opacity-90">
                                  {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                               </span>
                             </div>
                          </div>
                        </div>
                     </div>
                   </Link>
                 </motion.div>
               ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {['all', 'latest', 'popular', 'paid', 'free'].map((f) => (
             <button
               key={f}
               onClick={() => {
                 setFilter(f);
                 if (f === 'all') {
                    // Re-shuffle on explicit 'All' click to give a fresh look
                    setEvents(prev => shuffleArray([...prev]));
                 }
               }}
               className={`px-6 py-2 rounded-full text-sm font-semibold capitalize transition-all duration-300 whitespace-nowrap ${
                 filter === f 
                   ? "bg-white text-black shadow-lg shadow-white/10 scale-105" 
                   : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
               }`}
             >
               {f}
             </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <EventsGridSkeleton showBackButton />
        )
 : events.length === 0 ? (
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
                    <Link href={`/events/${event.event_slug || event.event_id}`}>
                      <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#0F0F16] border border-white/10 cursor-pointer hover:border-primary/50 transition-all duration-300 shadow-xl">
                        {/* Background Image */}
                        {event.event_image ? (
                          <img
                            src={getImageUrl(event.event_image)}
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
                        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                           <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs font-semibold border border-white/10 text-white shadow-lg">
                             {event.pricing_type === 'free' ? 'Free' : `From ₦${parseFloat(event.event_price).toLocaleString()}`}
                           </div>
                           {event.status === 'verified' && (
                             <div className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg backdrop-blur-sm">
                               <CheckCircle className="h-3 w-3" />
                               Verified
                             </div>
                           )}
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
