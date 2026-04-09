"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Calendar as CalendarIcon, Search, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getImageUrl } from "@/lib/utils";
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
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      {/* Header & Search */}
      <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Discovery Page</h1>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          <Input
            placeholder="Search for events"
            className="pl-8 md:pl-9 bg-secondary/50 border-0 text-sm md:text-base h-9 md:h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'latest', 'popular', 'paid', 'free'].map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                if (f === 'all') {
                  setEvents(prev => shuffleArray([...prev]));
                }
              }}
              className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-medium capitalize transition-all duration-300 whitespace-nowrap ${
                filter === f 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
              }`}
            >
              {f}
            </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-10">
        {events.length === 0 && pastEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-3 md:space-y-4">
            <CalendarIcon className="h-16 w-16 md:h-24 md:w-24 text-muted-foreground/50" />
            <h2 className="text-xl md:text-2xl font-bold text-foreground">No Events Yet</h2>
          </div>
        ) : (
          <>
            {/* Upcoming Events */}
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-lg md:text-xl font-semibold">Upcoming Events</h2>
              {filteredEvents.length === 0 && events.length > 0 ? (
                 <div className="text-center py-8 md:py-10">
                    <p className="text-sm md:text-base text-muted-foreground">No active events match your search.</p>
                 </div>
              ) : (
                <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredEvents.map((event, index) => (
                    <EventCard key={event.event_id} event={event} index={index} />
                  ))}
                </div>
              )}
            </div>

            {/* Past Events Section */}
            {filteredPastEvents.length > 0 && (
              <div className="space-y-4 md:space-y-6 pt-10 border-t border-border/50">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold opacity-70">Past & Concluded Events</h2>
                  <p className="text-xs text-muted-foreground">Relive the moments from events that have already ended.</p>
                </div>
                <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
                  {filteredPastEvents.map((event, index) => (
                    <EventCard key={event.event_id} event={event} index={index} isPast />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {filteredEvents.length === 0 && filteredPastEvents.length === 0 && (searchQuery) && (
           <div className="text-center py-10">
              <p className="text-sm md:text-base text-muted-foreground">No events match "{searchQuery}"</p>
           </div>
        )}
      </div>
    </div>
  );
};

const EventCard = ({ event, index, isPast = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
  >
<Link href={`/dashboard/student/events/${event.event_id}`}>
    <div className={`group relative aspect-4/3 overflow-hidden rounded-xl md:rounded-2xl bg-muted cursor-pointer transition-all duration-300 ${isPast ? 'grayscale opacity-70 hover:grayscale-0 hover:opacity-100' : ''}`}>
      {/* Background Image */}
      {event.event_image ? (
        <img
          src={getImageUrl(event.event_image)}
          alt={event.event_name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="h-full w-full bg-gray-800 flex items-center justify-center">
           <CalendarIcon className="h-10 w-10 md:h-12 md:w-12 text-gray-600" />
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

      {/* Badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-2">
        {!isPast && (
          <div className="px-2 py-0.5 rounded-lg bg-primary/90 text-white text-[9px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 w-fit">
            {event.event_type}
          </div>
        )}
      </div>

      <div className="absolute top-2 right-2">
         <div className={`px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[9px] font-semibold border border-gray-600/70 text-white ${isPast ? 'opacity-50' : ''}`}>
           {isPast ? 'Closed' : (event.pricing_type === 'free' ? 'Free' : `₦${event.event_price}`)}
         </div>
      </div>

      {/* Content Overlay */}
      <div className={`absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white ${isPast ? 'pb-2' : ''}`}>
        <h3 className={`${isPast ? 'text-xs md:text-sm' : 'text-base md:text-lg'} font-bold leading-tight mb-1 line-clamp-1`}>
          {event.event_name}
        </h3>
        
        <div className={`flex flex-wrap gap-y-0.5 gap-x-2 text-[10px] ${isPast ? 'opacity-60' : 'text-gray-300'} mb-1`}>
          <div className="flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5" />
            <span className="line-clamp-1 max-w-[80px]">{event.event_location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-1">
           <div className={`flex items-center gap-1 text-[10px] ${isPast ? 'opacity-50' : 'text-gray-300'}`}>
             <CalendarIcon className="h-2.5 w-2.5" />
             <span>
               {new Date(event.event_date).toLocaleDateString('en-US', {
                 month: 'short',
                 day: 'numeric'
               })}
             </span>
           </div>
           
           {!isPast && (
             <span className={`font-bold text-xs ${
               event.pricing_type === 'free' ? 'text-green-400' : 'text-yellow-400'
             }`}>
               {event.pricing_type === 'free' ? 'Free' : `₦${event.event_price}`}
             </span>
           )}
        </div>
      </div>
    </div>
  </Link>
  </motion.div>
);

export default EventsPage;
