"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Calendar as CalendarIcon, Search, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getImageUrl, generateEventSlug } from "@/lib/utils";
import { EventsGridSkeleton } from "@/components/skeletons";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
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
        // Fetch all events from public endpoint
        const response = await api.get("/event/");
        const allEvents = Array.isArray(response.data) ? response.data : (response.data.events || []);
        
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // Filter into Upcoming and Past based on date and status
        const upcomingList = allEvents.filter(event => {
          if (event.status === 'closed') return false;
          if (!event.event_date) return true;
          const eventDate = new Date(event.event_date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= now;
        });

        const pastList = allEvents.filter(event => {
          if (event.status === 'closed') return true;
          if (!event.event_date) return false;
          const eventDate = new Date(event.event_date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate < now;
        });
        
        // Attempt to fetch extra closed events from admin endpoint if possible
        let closedAdmin = [];
        try {
          const adminResponse = await api.get("/api/admin/events/?status=closed");
          closedAdmin = adminResponse.data.events || [];
        } catch (adminError) {
          console.warn("Could not fetch extra closed events via admin endpoint:", adminError.message);
        }
        
        const combinedPast = [...pastList];
        closedAdmin.forEach(c => {
          if (!combinedPast.find(p => p.event_id === c.event_id)) {
            combinedPast.push(c);
          }
        });
        
        setEvents(shuffleArray([...upcomingList]));
        setPastEvents(shuffleArray([...combinedPast]));
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
       return filtered.sort((a, b) => {
          const dateA = new Date(a.created_at || a.event_date);
          const dateB = new Date(b.created_at || b.event_date);
          return dateB - dateA;
       });
    } else if (filter === 'popular') {
       return filtered; 
    } else {
       return filtered;
    }
  };

  const filteredEvents = getFilteredAndSortedEvents();
  const filteredPastEvents = pastEvents.filter((event) =>
    event.event_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <EventsGridSkeleton />;
  }

  return (
    <div className="space-y-4 md:space-y-8 pb-20 md:pb-12 pt-0 md:pt-2">
      {/* Header & Search */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-0.5">
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Discovery</h1>
          <p className="text-zinc-500 font-medium text-xs md:text-sm">Explore and book the best experiences near you.</p>
        </div>
        
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-rose-500 transition-colors" />
          <Input
            placeholder="Search events, venues..."
            className="pl-12 bg-zinc-900 border-zinc-800 focus:border-rose-500 focus:ring-0 text-white rounded-2xl h-12 md:h-14 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filters Container */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['all', 'latest', 'popular', 'paid', 'free'].map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  if (f === 'all') {
                    setEvents(prev => shuffleArray([...prev]));
                  }
                }}
                className={`px-5 py-2 rounded-lg text-[11px] md:text-xs font-bold transition-all whitespace-nowrap border ${
                  filter === f 
                    ? "bg-rose-600 text-white border-rose-500 scale-105" 
                    : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-white hover:border-zinc-700"
                }`}
              >
                {f}
              </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-12">
        {events.length === 0 && pastEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
            <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center border border-zinc-800">
              <CalendarIcon className="h-10 w-10 text-zinc-700" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">No Events Yet</h2>
              <p className="text-zinc-500 max-w-xs">Check back later or try adjusting your search filters.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Upcoming Events */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Upcoming Releases</h2>
                <div className="h-[1px] flex-1 bg-zinc-900"></div>
              </div>
              
              {filteredEvents.length === 0 && events.length > 0 ? (
                 <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-800">
                    <p className="text-zinc-500 font-medium">No active events match your current search criteria.</p>
                 </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredEvents.map((event, index) => (
                    <EventCard key={event.event_id} event={event} index={index} />
                  ))}
                </div>
              )}
            </div>

            {/* Past Events Section */}
            {filteredPastEvents.length > 0 && (
              <div className="space-y-6 pt-10">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-zinc-600">Archive</h2>
                  <div className="h-[1px] flex-1 bg-zinc-900"></div>
                </div>
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                  {filteredPastEvents.map((event, index) => (
                    <EventCard key={event.event_id} event={event} index={index} isPast />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const EventCard = ({ event, index, isPast = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
  >
    <Link href={`/dashboard/user/events/${event.event_slug || generateEventSlug(event.event_name)}`}>
      <div className={`group bg-zinc-900 border border-border rounded-2xl md:rounded-[2rem] overflow-hidden transition-all duration-300 hover:border-zinc-700 ${isPast ? 'grayscale opacity-60' : ''}`}>
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
          {getImageUrl(event.event_image || event.image) ? (
            <img
              src={getImageUrl(event.event_image || event.image)}
              alt={event.event_name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
               <CalendarIcon className="h-10 w-10 text-zinc-800" />
            </div>
          )}
          
          {/* Status Badge (Top Right) */}
          <div className="absolute top-4 right-4">
            <div className="px-3 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-bold text-white border border-white/10">
              {isPast ? 'Closed' : (event.pricing_type === 'free' ? 'Free' : `₦${event.event_price}`)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 md:p-6 space-y-4">
          <div className="space-y-2">
            <h3 className={`${isPast ? 'text-sm' : 'text-lg md:text-xl'} font-bold text-white leading-none tracking-tight group-hover:text-rose-500 transition-colors line-clamp-1`}>
              {event.event_name}
            </h3>
            
            <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-500">
               <div className="flex items-center gap-1.5">
                <CalendarIcon className="h-3 w-3 text-rose-500" />
                <span>
                  {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-rose-500" />
                <span>6:00 PM</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <MapPin className="h-3 w-3" />
              <span className="text-[10px] font-bold line-clamp-1 max-w-[120px]">
                {event.event_location}
              </span>
            </div>
            
            {!isPast && (
              <div className="w-8 h-8 rounded-full bg-zinc-950 flex items-center justify-center group-hover:bg-rose-600 transition-colors">
                 <ArrowRight className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default EventsPage;

