"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Ticket, Calendar } from "lucide-react";
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

        setProfile(profileRes.data);
        setTickets(ticketsRes.data.tickets || []);
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

  const upcomingEventsCount = tickets.filter((ticket) => {
    const eventDate = new Date(ticket.event_date);
    return eventDate > new Date();
  }).length;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col gap-1 md:gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Welcome back, {profile?.first_name || profile?.firstName || user?.email?.split('@')[0] || "Student"}! 👋
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Here's what's happening with your events.
        </p>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
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
      </div>
    </div>
  );
};

export default StudentDashboardOverview;