"use client";

import React, { useEffect } from "react";
import api from "@/lib/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ticket, Calendar, ArrowRight, User } from "lucide-react";
import { motion } from "framer-motion";
import useAuthStore from "@/store/authStore";
import Link from "next/link";
import { StudentDashboardSkeleton } from "@/components/skeletons";
import { queryKeys } from "@/lib/query-keys";
import { getImageUrl } from "@/lib/utils";
import { MapPin } from "lucide-react";

const UserDashboardOverview = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading: loading } = useQuery({
    queryKey: queryKeys.student.dashboard,
    queryFn: async () => {
      const [profileRes, ticketsRes, eventsRes] = await Promise.all([
        api.get("student/profile/"),
        api.get("tickets/my-tickets/"),
        api.get("event/"),
      ]);
      const profile = profileRes.data?.profile ?? profileRes.data;
      const rawTickets = Array.isArray(ticketsRes.data?.tickets)
        ? ticketsRes.data.tickets
        : Array.isArray(ticketsRes.data)
          ? ticketsRes.data
          : [];
      
      const allEvents = Array.isArray(eventsRes.data) 
        ? eventsRes.data 
        : (eventsRes.data?.events || []);

      // Merge event images into tickets
      const tickets = rawTickets.map(ticket => {
        const eventData = allEvents.find(e => 
          e.event_id === ticket.event_id || 
          e.name === ticket.event_name ||
          e.id === ticket.event_id
        );
        return {
          ...ticket,
          event_image: ticket.event_image || eventData?.event_image || eventData?.image
        };
      });

      return { profile, tickets };
    },
    refetchOnWindowFocus: true
  });

  useEffect(() => {
    const onTicketsUpdated = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.student.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.myTickets });
    };
    window.addEventListener("tickets-updated", onTicketsUpdated);
    return () => window.removeEventListener("tickets-updated", onTicketsUpdated);
  }, [queryClient]);

  const profile = data?.profile ?? null;
  const tickets = data?.tickets ?? [];

  if (loading) {
    return <StudentDashboardSkeleton />;
  }

  // Calculations
  const now = new Date();
  const upcomingTickets = tickets.filter((ticket) => new Date(ticket.event_date) > now);

  // Name Logic
  const displayName = profile?.firstname || 
                      profile?.Firstname || 
                      profile?.first_name || 
                      profile?.Preferred_name ||
                      "User";

  return (
    <div className="min-h-screen space-y-4 md:space-y-8 pt-0 md:pt-2 pb-12">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Welcome back, {displayName}!
          </h1>
          <p className="text-zinc-500 text-xs md:text-sm font-medium">
            Everything is set. Here are your tickets and upcoming experiences.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <Link href="/dashboard/user/events">
            <button className="flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-all font-bold text-[10px] md:text-xs">
              <Calendar className="w-3.5 h-3.5" />
              Find Events
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Main: Upcoming Events */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Upcoming Events
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-md">{upcomingTickets.length}</span>
            </h2>
            <Link href="/dashboard/user/my-tickets" className="text-rose-500 hover:text-rose-400 text-xs font-bold flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800 text-center px-4">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
                <Ticket className="w-8 h-8 text-zinc-700 font-thin" />
              </div>
              <h3 className="text-white text-lg font-bold mb-2">No tickets found</h3>
              <p className="text-zinc-500 max-w-xs mb-8">
                Looks like you haven't booked any tickets yet. Let's find something exciting!
              </p>
              <Link href="/dashboard/user/events">
                <button className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-lg font-bold text-[10px] transition-all shadow-lg shadow-rose-600/20">
                  Browse Events
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingTickets.slice(0, 4).map((ticket, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  key={ticket.ticket_id || ticket.id}
                  className="bg-card border border-border p-5 rounded-2xl hover:border-zinc-700 transition-all group flex flex-col h-full"
                >
                  <div className="flex gap-4">
                    {/* Event Image Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0 border border-border">
                      {/* Robust image source check */}
                      {getImageUrl(ticket.event_image || ticket.image || ticket.event?.event_image || ticket.event?.image) ? (
                        <img 
                          src={getImageUrl(ticket.event_image || ticket.image || ticket.event?.event_image || ticket.event?.image)} 
                          alt={ticket.event_name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Ticket className="w-6 h-6 text-zinc-800" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="text-white font-bold text-base md:text-lg leading-tight group-hover:text-rose-500 transition-colors line-clamp-1">
                        {ticket.event_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 text-zinc-500 text-[10px] font-bold">
                        <Calendar className="w-3 h-3 text-rose-500" />
                        <span>{new Date(ticket.event_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                        <span className="mx-1 opacity-30">|</span>
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span className="line-clamp-1">{ticket.event_location || "TBA"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-zinc-800 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 font-bold leading-none mb-1">Status</span>
                        <span className={`text-xs font-bold ${ticket.status === 'confirmed' ? 'text-green-500' : 'text-amber-500'}`}>
                          {ticket.status || 'Ready'}
                        </span>
                     </div>
                     <Link href={`/dashboard/user/my-tickets`} className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:border-rose-500 transition-all group/btn">
                        <ArrowRight className="w-4 h-4 text-zinc-400 group-hover/btn:text-white" />
                     </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar/Right: Quick Actions & Profile */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/dashboard/user/profile" className="block">
              <button className="w-full bg-zinc-900 border border-border hover:bg-zinc-800 p-4 rounded-2xl flex items-center gap-4 transition-all text-left">
                <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
                  <User className="text-rose-500 w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Edit Profile</p>
                  <p className="text-zinc-500 text-xs">Update your details</p>
                </div>
              </button>
            </Link>
            
            <Link href="/dashboard/user/settings" className="block">
              <button className="w-full bg-zinc-900 border border-border hover:bg-zinc-800 p-4 rounded-2xl flex items-center gap-4 transition-all text-left">
                <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                  <Ticket className="text-zinc-400 w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Preferences</p>
                  <p className="text-zinc-500 text-xs">Manage notification settings</p>
                </div>
              </button>
            </Link>
          </div>

          {/* Mini Promotion or Help Box */}
          <div className="bg-rose-600 p-5 rounded-3xl space-y-3">
             <h3 className="text-white font-bold text-lg tracking-tight">Become a Host?</h3>
             <p className="text-rose-100 text-xs font-medium leading-relaxed">
               Organize your own events and sell tickets with Nigeria's most trusted platform.
             </p>
             <Link href="/dashboard/org" className="block">
                <button className="w-full bg-white text-rose-600 py-2.5 rounded-lg font-bold text-[11px] transition-transform active:scale-95">
                  Switch to Organizer
                </button>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};



export default UserDashboardOverview;
