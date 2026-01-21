"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Loader2, Ticket, Calendar, ArrowRight, User } from "lucide-react";
import { motion } from "framer-motion";
import useAuthStore from "@/store/authStore";
import Link from "next/link";
import toast from "react-hot-toast";
import { StudentDashboardSkeleton } from "@/components/skeletons";

const StudentDashboardOverview = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, ticketsRes] = await Promise.all([
          api.get("student/profile/"),
          api.get("tickets/my-tickets/"),
        ]);

        // Handle Profile Data
        if (profileRes.data && profileRes.data.profile) {
            setProfile(profileRes.data.profile);
        } else if (profileRes.data) {
            setProfile(profileRes.data);
        }

        // Handle Tickets Data
        if (ticketsRes.data && Array.isArray(ticketsRes.data.tickets)) {
            setTickets(ticketsRes.data.tickets);
        } else if (Array.isArray(ticketsRes.data)) {
             setTickets(ticketsRes.data);
        } else {
            setTickets([]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <StudentDashboardSkeleton />;
  }

  // Calculations
  const upcomingTickets = tickets.filter((ticket) => {
    const eventDate = new Date(ticket.event_date);
    return eventDate > new Date();
  });

  const upcomingEventsCount = upcomingTickets.length;

  // Name Logic
  const displayName = profile?.firstname || 
                      profile?.Firstname || 
                      profile?.first_name || 
                      profile?.Preferred_name ||
                      "Student";

  return (
    <div className="min-h-screen p-4 md:p-4 space-y-6 md:space-y-8 pt-6 md:pt-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-white mb-2">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Here's an overview of your event activity
          </p>
        </div>
        <Link href="/events" className="inline-flex">
          <button
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg transition-colors font-medium text-sm md:text-base whitespace-nowrap"
          >
            <Calendar className="w-4 h-4 md:w-5 md:h-5" />
            Discover Events
          </button>
        </Link>
      </div>

      {/* Upcoming Tickets Section */}
      <div className="bg-[#111] rounded-xl p-6 border border-gray-800/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-white text-xl font-semibold">Your Upcoming Events</h2>
            <span className="bg-rose-500/10 text-rose-500 text-xs px-2 py-0.5 rounded-full font-medium">
              {upcomingEventsCount}
            </span>
          </div>
          <Link href="/dashboard/student/my-tickets" className="text-rose-400 hover:text-rose-300 text-sm font-medium flex items-center gap-1 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {upcomingTickets.length === 0 ? (
          <div className="text-center py-12 bg-[#1a1a1a]/50 rounded-lg border border-dashed border-gray-800">
            <Ticket className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No upcoming events</p>
            <p className="text-gray-500 text-sm mt-2">Ready for your next adventure? Browse available events!</p>
            <Link href="/events" className="mt-6 inline-block">
               <span className="text-rose-500 hover:underline">Explore Events</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingTickets.slice(0, 3).map((ticket) => (
              <div
                key={ticket.ticket_id || ticket.id}
                className="bg-[#1a1a1a] p-5 rounded-xl border border-gray-800 hover:border-gray-700 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-rose-400 transition-colors">
                      {ticket.event_name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(ticket.event_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800">
                   <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Status</p>
                      <span className={`text-xs font-bold ${ticket.status === 'confirmed' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {ticket.status?.toUpperCase() || 'CONFIRMED'}
                      </span>
                   </div>
                   <Link href={`/dashboard/student/my-tickets`} className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors">
                      <ArrowRight className="w-4 h-4" />
                   </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};



export default StudentDashboardOverview;