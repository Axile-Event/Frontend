"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { 
  Users, 
  Share2, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Plus, 
  Search,
  RefreshCw
} from "lucide-react";
import { queryKeys } from "@/lib/query-keys";
import { getImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ReferralsListPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: events = [], isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.organizer.events,
    queryFn: async () => {
      const res = await api.get("/organizer/events/");
      const payload = res?.data;
      let list = [];
      if (Array.isArray(payload)) list = payload;
      else if (Array.isArray(payload?.events)) list = payload.events;
      else if (Array.isArray(payload?.data)) list = payload.data;
      else list = [];
      
      // Filter client-side: only show events where use_referral === true
      return list.filter(event => event.use_referral === true);
    }
  });

  const filteredEvents = events.filter(event => 
    event.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formattedDate = (iso) => {
    if (!iso) return "TBD";
    try {
      return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return iso;
    }
  };

  const getInitials = (name) => {
    if (!name) return "AX";
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48 bg-white/5" />
          <Skeleton className="h-4 w-64 bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="p-4 bg-red-500/10 rounded-full">
          <RefreshCw className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white">Failed to load referrals</h2>
        <p className="text-gray-400">There was an error fetching your events.</p>
        <Button onClick={() => refetch()} variant="outline" className="border-white/10 hover:bg-white/5">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Referrals</h1>
          <p className="text-gray-400 text-sm">Track referral performance across your events</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0A0A0A] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-rose-500 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => router.push("/dashboard/org/create-event")}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Event
          </Button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 border border-dashed border-white/10 rounded-[2.5rem] bg-black/40">
          <div className="w-20 h-20 bg-rose-600/10 rounded-full flex items-center justify-center mb-6">
            <Share2 className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3">No referral-enabled events</h2>
          <p className="text-gray-400 max-w-md mb-8">
            When you create an event with referral rewards enabled, it will appear here.
          </p>
          <Button 
            onClick={() => router.push("/dashboard/org/create-event")}
            className="bg-rose-600 hover:bg-rose-700 h-12 px-8 text-lg font-bold rounded-2xl shadow-lg shadow-rose-600/20"
          >
            Create Event
          </Button>
        </div>
      ) : filteredEvents.length === 0 ? (
          <div className="py-20 text-center space-y-4 border border-white/5 rounded-[2.5rem] bg-white/5">
              <Search className="w-12 h-12 text-gray-700 mx-auto" />
              <div>
                  <p className="text-white font-semibold text-lg">No matches found</p>
                  <p className="text-gray-500 text-sm">No referral events match &quot;{searchQuery}&quot;</p>
              </div>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredEvents.map((event) => {
            const id = event.event_id ?? event.id;
            const rewardText = event.referral_reward_type === "flat" 
              ? `₦${Number(event.referral_reward_amount).toLocaleString()} flat reward`
              : `${event.referral_reward_percentage}% per ticket`;

            const rawImage = event.event_image ?? event.image;
            const imageSrc = getImageUrl(rawImage);

            return (
              <Card 
                key={id}
                onClick={() => router.push(`/dashboard/org/referrals/${id}`)}
                className="group bg-[#0A0A0A] border-white/5 rounded-[2rem] overflow-hidden hover:border-rose-500/30 transition-all duration-500 cursor-pointer shadow-xl hover:shadow-rose-600/5"
              >
                <div className="aspect-video relative overflow-hidden">
                  {imageSrc ? (
                    <img 
                      src={imageSrc} 
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-rose-500/20 to-purple-600/20 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white/20">{getInitials(event.name)}</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-rose-600 hover:bg-rose-600 text-white border-0 py-1.5 px-4 rounded-full text-xs font-bold shadow-lg shadow-rose-600/40">
                      {rewardText}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold truncate group-hover:text-rose-400 transition-colors">
                      {event.name}
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 text-gray-400 text-xs">
                      <Calendar className="w-4 h-4 text-rose-500" />
                      <span>{formattedDate(event.date || event.start_date)}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-400 text-xs">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <span className="truncate">{event.location || "Venue TBD"}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <Button variant="ghost" className="w-full flex items-center justify-between text-rose-500 hover:text-rose-400 hover:bg-rose-500/5 group/btn px-0">
                      <span className="font-bold text-xs uppercase tracking-widest">View Referrals</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReferralsListPage;
