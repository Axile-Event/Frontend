"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Calendar as CalendarIcon, Search, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/event/");
        const eventsData = Array.isArray(response.data) ? response.data : (response.data.events || []);
        // Only show verified events to students
        const verifiedEvents = eventsData.filter(event => !event.status || event.status === 'verified'); 
        setEvents(verifiedEvents);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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

      {/* Content */}
      {events.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-3 md:space-y-4">
          <CalendarIcon className="h-16 w-16 md:h-24 md:w-24 text-muted-foreground/50" />
          <h2 className="text-xl md:text-2xl font-bold text-foreground">No Events Yet</h2>
        </div>
      ) : (
        // Events Grid
        <div className="space-y-4 md:space-y-6">
          <h2 className="text-lg md:text-xl font-semibold">Upcoming Events</h2>
          
          {filteredEvents.length === 0 ? (
             <div className="text-center py-8 md:py-10">
                <p className="text-sm md:text-base text-muted-foreground">No events match your search.</p>
             </div>
          ) : (
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.event_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link href={`/dashboard/student/events/${event.event_id}`}>
                    <div className="group relative aspect-[4/3] overflow-hidden rounded-xl md:rounded-2xl bg-muted cursor-pointer">
                      {/* Background Image */}
                      {event.event_image ? (
                        <img
                          src={event.event_image}
                          alt={event.event_name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-800 flex items-center justify-center">
                           <CalendarIcon className="h-10 w-10 md:h-12 md:w-12 text-gray-600" />
                        </div>
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                      {/* Content Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="text-lg font-bold leading-tight mb-2">
                          {event.event_name}
                        </h3>
                        
                        <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs text-gray-300 mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1 max-w-[120px]">{event.event_location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            <span>
                              {new Date(event.event_date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1 text-xs text-gray-300">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(event.event_date).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                          </div>
                          
                          <span className={`font-bold text-sm ${
                            event.pricing_type === 'free' ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {event.pricing_type === 'free' ? 'Free' : `₦${event.event_price}`}
                          </span>
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
  );
};

export default EventsPage;
