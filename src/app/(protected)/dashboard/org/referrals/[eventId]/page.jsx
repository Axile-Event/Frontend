"use client";

import React, { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  Users, 
  Ticket, 
  DollarSign,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { queryKeys } from "@/lib/query-keys";
import { getReferralStats } from "@/lib/referral";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ReferralDetailPage = () => {
  const router = useRouter();
  const { eventId } = useParams();

  // Fetch event details
  const { 
    data: event, 
    isLoading: eventLoading, 
    isError: eventError 
  } = useQuery({
    queryKey: queryKeys.organizer.eventDetail(eventId),
    queryFn: async () => {
      const decodedId = decodeURIComponent(eventId);
      
      // Call organizer profiles endpoint which is richer for organizers (includes referral configs)
      const res = await api.get("/organizer/events/");
      const payload = res?.data;
      
      let list = [];
      if (Array.isArray(payload)) list = payload;
      else if (Array.isArray(payload?.events)) list = payload.events;
      else if (Array.isArray(payload?.data)) list = payload.data;
      
      // Match with the current ID (after decoding)
      const found = list.find(e => {
        const entryId = String(e.event_id ?? e.id);
        return entryId === decodedId || entryId.replace("event:", "") === decodedId.replace("event:", "");
      });
      
      if (!found) {
        throw new Error("Event not found in your organizer profile");
      }
      
      return found;
    }
  });

  // Fetch referral stats
  const { 
    data: statsData, 
    isLoading: statsLoading, 
    isError: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: queryKeys.organizer.referralStats(eventId),
    queryFn: async () => {
      const decodedId = decodeURIComponent(eventId);
      const cleanId = decodedId.replace("event:", "");
      // Fetch all referral data for this event (no IDs required)
      const data = await getReferralStats(cleanId);
      return data;
    },
    enabled: !!eventId
  });

  const referrals = useMemo(() => {
    // Normalize response — handle both array and {referrals: [...]} shape
    const list = Array.isArray(statsData) 
      ? statsData 
      : statsData?.referrals ?? statsData?.stats ?? statsData?.data ?? [];
    
    return [...list].sort((a, b) => (b.tickets_sold || 0) - (a.tickets_sold || 0));
  }, [statsData]);

  const summary = useMemo(() => {
    return {
      totalReferrers: referrals.length,
      totalTickets: referrals.reduce((sum, r) => sum + (r.tickets_sold || 0), 0),
      totalRevenue: referrals.reduce((sum, r) => sum + (r.referral_revenue || 0), 0)
    };
  }, [referrals]);

  const formattedDate = (iso) => {
    if (!iso) return "TBD";
    try {
      return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        short: 'short',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return iso;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (eventLoading) {
    return (
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-24 bg-white/5" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 bg-white/5" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <Skeleton className="h-4 w-32 bg-white/5" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-2xl bg-white/5" />
          <Skeleton className="h-32 rounded-2xl bg-white/5" />
          <Skeleton className="h-32 rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (eventError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-white">Event not found</h2>
        <Button onClick={() => router.back()} variant="outline" className="border-white/10 hover:bg-white/5">
          Go Back
        </Button>
      </div>
    );
  }

  const rewardText = event?.referral_reward_type === "flat"
    ? `₦${Number(event?.referral_reward_amount).toLocaleString()}`
    : `${event?.referral_reward_percentage}% of ticket price`;

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto text-white pb-32">
      {/* Header Section */}
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/dashboard/org/referrals")}
          className="text-gray-400 hover:text-white px-0 hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Referrals
        </Button>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-bold">{event?.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-500" />
                <span>{formattedDate(event?.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>{event?.location || "Venue TBD"}</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-auto">
            <div className="bg-rose-600/10 border-l-4 border-rose-600 p-6 rounded-r-[1.5rem] flex flex-col md:flex-row md:items-center gap-6 shadow-xl backdrop-blur-sm">
              <div>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Reward per ticket</p>
                <h2 className="text-3xl font-black text-rose-500">{rewardText}</h2>
              </div>
              <div className="h-px md:h-12 w-full md:w-px bg-white/10 hidden md:block" />
              <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
                Referrers earn this when a ticket they referred is checked in.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Referrers", value: summary.totalReferrers, icon: Users, color: "text-blue-400" },
          { label: "Tickets via Referrals", value: summary.totalTickets, icon: Ticket, color: "text-amber-400" },
          { label: "Referral Revenue", value: formatCurrency(summary.totalRevenue), icon: DollarSign, color: "text-emerald-400" },
        ].map((stat, i) => (
          <Card key={i} className="bg-[#0A0A0A] border-white/5 rounded-3xl overflow-hidden shadow-2xl group hover:border-rose-500/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Referral Stats Table */}
      <Card className="bg-[#0A0A0A] border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-500" />
            Performance Detail
          </h3>
          <Button variant="ghost" size="sm" onClick={() => refetchStats()} className="text-gray-500 hover:text-white">
            <RefreshCw className={`w-4 h-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          {statsLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-white/5 rounded-xl" />
              ))}
            </div>
          ) : referrals.length === 0 ? (
            <div className="p-20 text-center space-y-6">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-gray-700" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold">No referral activity yet</h4>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                  Referral data will appear here as buyers use referral links for this event.
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-5 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Referrer</th>
                  <th className="px-6 py-5 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Tickets Sold</th>
                  <th className="px-8 py-5 text-gray-400 font-bold uppercase text-[10px] tracking-widest text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((row, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                    <td className="py-6 px-8">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-linear-to-br from-rose-500/20 to-purple-500/20 flex items-center justify-center text-[11px] font-black text-rose-500 border border-rose-500/20 uppercase">
                           {(row.referral_name || "Unknown")[0].toUpperCase()}
                         </div>
                         <div>
                            <p className="text-sm font-bold">{row.referral_name || "Unknown Referrer"}</p>
                         </div>
                       </div>
                    </td>
                    <td className="py-6 px-6">
                      <span className="text-lg font-bold">{row.tickets_sold}</span>
                    </td>
                    <td className="py-6 px-8 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-emerald-400 text-lg">{formatCurrency(row.referral_revenue)}</span>
                        <span className="text-[10px] text-gray-500 font-medium">Earned by Referrer</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ReferralDetailPage;
