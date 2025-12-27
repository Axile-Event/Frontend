"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Ticket, Calendar, History, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import useAuthStore from "@/store/authStore";

const StudentDashboardOverview = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, ticketsRes] = await Promise.all([
          api.get("/student/profile/"),
          api.get("/tickets/my-tickets/"),
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
             // Fallback or empty
            setTickets([]);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculations
  const upcomingEventsCount = tickets.filter((ticket) => {
    const eventDate = new Date(ticket.event_date);
    return eventDate > new Date();
  }).length;

  const pastEventsCount = tickets.filter((ticket) => {
    const eventDate = new Date(ticket.event_date);
    return eventDate < new Date();
  }).length;

  const totalSpent = tickets.reduce((acc, ticket) => {
      return acc + (parseFloat(ticket.total_price) || 0);
  }, 0);

  // Name Logic: Try all possible variations based on API inconsistencies
  const displayName = profile?.firstname || 
                      profile?.Firstname || 
                      profile?.first_name || 
                      profile?.Preferred_name ||
                      "Student";

  // Animation Variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col gap-1 md:gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight capitalize">
          Welcome back, {displayName}! 👋
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Here's what's happening with your events.
        </p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* Total Tickets */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">
                Total Tickets
              </CardTitle>
              <Ticket className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">{tickets.length}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                Lifetime tickets purchased
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">
                Upcoming Events
              </CardTitle>
              <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">{upcomingEventsCount}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                Events you are attending soon
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Events Attended */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">
                Events Attended
              </CardTitle>
              <History className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">{pastEventsCount}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                Past events you attended
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Spent */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">
                Total Spent
              </CardTitle>
              <CreditCard className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">₦{totalSpent.toLocaleString()}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                Total amount spent
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StudentDashboardOverview;