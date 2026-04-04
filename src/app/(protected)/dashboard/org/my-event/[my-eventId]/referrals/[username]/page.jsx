"use client";

import React, { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { queryKeys } from "@/lib/query-keys";
import { fetchReferralStats } from "@/lib/referral";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Ticket,
  Search,
  Download,
  Calendar,
  MapPin,
  Megaphone,
  UserCheck,
  ChevronRight,
  Info
} from "lucide-react";
import toast from "react-hot-toast";
import Loading from "@/components/ui/Loading";
import ReferralBadge from "@/components/organizer/ReferralBadge";

export default function RefereeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.["my-eventId"] ?? params?.id;
  const username = params?.username;

  // 1. Fetch event details for context and reward config
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: queryKeys.organizer.eventDetail(eventId),
    queryFn: async () => {
      // First try to find it in the organizer's event list (this contains the reward block for organizers)
      let eventData = null;
      try {
        const orgRes = await api.get("/organizer/events/");
        const list = Array.isArray(orgRes.data) ? orgRes.data : (orgRes.data?.events ?? []);
        eventData = list.find((e) => String(e.event_id ?? e.id) === String(eventId));
      } catch (err) {
        console.warn("Could not fetch organizer list for event detail:", err);
      }

      // Then fetch specific details (and merge if needed, but prioritize organizer field names)
      try {
        const detailRes = await api.get(`/events/${eventId}/details/`);
        const fullDetail = detailRes?.data;
        if (fullDetail) {
          eventData = eventData ? { ...fullDetail, ...eventData } : fullDetail;
        }
      } catch (err) {
        if (!eventData) throw err;
      }

      return eventData;
    },
    enabled: !!eventId,
  });

  // 2. Fetch specific stats for this referee
  const {
    data: referralStats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["organizer", "referral", eventId, username],
    queryFn: async () => {
      try {
        const stats = await fetchReferralStats(eventId, [{ username }]);
        const data = Array.isArray(stats) ? stats : stats?.stats || stats?.data || [];
        return data[0] || null; // Expected to return an array, we take the first matching referee
      } catch (err) {
        console.error("Referral detail stats error:", err);
        return null;
      }
    },
    enabled: !!eventId && !!username,
  });

  // 3. Fetch all event tickets to filter for this referee's specific sales
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: queryKeys.organizer.analytics(eventId),
    queryFn: async () => {
      const res = await api.get(`/analytics/event/${eventId}/`);
      return res.data.analytics || res.data;
    },
    enabled: !!eventId,
  });

  // 4. Filter tickets for this specific referee
  const refereeTickets = useMemo(() => {
    if (!analytics?.tickets_list || !username) return [];
    
    return analytics.tickets_list.filter(t => {
      const refToken = (t.referral || t.referral_username || t.referrer_username || t.referral_name || t.username || t.referral_source || t.referral_payload || t.ref_code || t.referral_code || "").toString();
      return refToken.toLowerCase() === username.toLowerCase();
    });
  }, [analytics, username]);

  // 5. Calculate estimated commission based on actual rewarded tickets
  const totalRevenue = referralStats?.referral_revenue || 0;
  const ticketsSold = referralStats?.tickets_sold || 0;
  
  const estimatedCommission = useMemo(() => {
    if (!event || !referralStats) return 0;
    
    if (event.referral_reward_type === "flat") {
      const amount = Number(event.referral_reward_amount) || 0;
      return amount * ticketsSold;
    } else if (event.referral_reward_type === "percentage") {
      const pctValue = Number(event.referral_reward_percentage) || 0;
      const pct = pctValue / 100;
      return totalRevenue * pct;
    }
    return 0;
  }, [event, referralStats, ticketsSold, totalRevenue]);

  const formattedDate = (iso) => {
    if (!iso) return "TBD";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  if (eventLoading || statsLoading || analyticsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <Loading />
        <p className="text-gray-500 text-sm mt-4 animate-pulse uppercase tracking-[0.2em] font-black">
          Generating Referee Audit...
        </p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black space-y-4">
        <p className="text-gray-500 text-lg font-bold">Event not found</p>
        <button onClick={() => router.back()} className="px-6 py-3 bg-rose-600 rounded-xl text-white font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-10 max-w-7xl mx-auto text-white pb-32">
      {/* Header */}
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Analytics
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-2xl shadow-rose-500/20 border border-white/10 uppercase">
                  {username?.slice(0, 2)}
               </div>
               <div className="space-y-1">
                 <div className="flex items-center gap-3">
                   <h1 className="text-3xl font-black tracking-tight">{username}</h1>
                   <div className="px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-[10px] font-black text-rose-500 uppercase tracking-widest">
                     Referee
                   </div>
                 </div>
                 <p className="text-gray-500 text-sm font-medium flex items-center gap-2">
                   <Megaphone size={14} className="text-rose-500" /> Performance for {event.name}
                 </p>
               </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 text-right">
             <ReferralBadge
                useReferral={event.use_referral}
                rewardType={event.referral_reward_type}
                rewardAmount={event.referral_reward_amount}
                rewardPercentage={event.referral_reward_percentage}
                size="lg"
             />
             <div className="space-y-1">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Program Policy</p>
                <p className="text-xs text-white/60 font-medium">
                  {event.referral_reward_type === "flat"
                    ? `₦${Number(event.referral_reward_amount || 0).toLocaleString()} flat per ticket`
                    : `${event.referral_reward_percentage || 0}% of sale value`}
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Tickets" 
          value={ticketsSold} 
          icon={<Ticket className="w-5 h-5 text-rose-500" />} 
          sub="Confirmed conversions"
        />
        <StatCard 
          label="Sales Revenue" 
          value={`₦${Number(totalRevenue).toLocaleString()}`} 
          icon={<TrendingUp className="w-5 h-5 text-emerald-500" />} 
          sub="Basis for commission"
        />
        <StatCard 
          label="Payout Due" 
          value={`₦${estimatedCommission.toLocaleString()}`} 
          icon={<div className="font-black text-xs text-blue-500">₦</div>} 
          sub="Estimated commission"
          highlight
        />
        <StatCard 
          label="Avg. Conversion" 
          value={ticketsSold > 0 ? `₦${Math.round(totalRevenue / ticketsSold).toLocaleString()}` : "₦0"} 
          icon={<Info className="w-5 h-5 text-gray-600" />} 
          sub="Value per ticket"
        />
      </div>

      {/* Transactions Table Section */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
             <UserCheck size={20} className="text-rose-500" />
             <h2 className="text-xl font-bold">Attributed Transactions</h2>
             <span className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">
               {refereeTickets.length} Sales
             </span>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5">
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Buyer</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Category</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Qty</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Value</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Date</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {refereeTickets.length > 0 ? refereeTickets.map((t, idx) => (
                       <tr key={idx} className="hover:bg-white/[0.01] transition-colors group">
                          <td className="px-8 py-6">
                             <div className="flex flex-col">
                                <span className="text-sm font-bold text-white group-hover:text-rose-500 transition-colors">{t.student_full_name}</span>
                                <span className="text-[10px] text-gray-500 font-medium lowercase italic opacity-60">{t.student_email}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-xs font-bold text-gray-300">{t.category_name || "General"}</span>
                          </td>
                          <td className="px-8 py-6 text-center">
                             <span className="text-sm font-black text-white/50">{t.quantity || 1}</span>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-sm font-black text-white">₦{Number(t.total_price || t.price_per_ticket || 0).toLocaleString()}</span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <span className="text-[11px] text-gray-500 font-medium">
                                {t.created_at ? new Date(t.created_at).toLocaleDateString() : "TBD"}
                             </span>
                          </td>
                       </tr>
                    )) : (
                       <tr>
                          <td colSpan={5} className="py-20 text-center space-y-4">
                             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                                <Search size={32} />
                             </div>
                             <p className="text-gray-500 text-sm font-medium">No attributed tickets found in regular analytics logs.</p>
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, sub, highlight = false }) {
  return (
    <div className={`bg-[#0A0A0A] border rounded-3xl p-6 space-y-4 transition-all hover:translate-y-[-2px] ${highlight ? 'border-rose-500/30 bg-rose-500/[0.02]' : 'border-white/5 hover:border-white/10'}`}>
      <div className="flex items-center justify-between">
        <div className="p-3 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
          {icon}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-800" />
      </div>
      <div>
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{label}</p>
        <h3 className={`text-2xl font-black ${highlight ? 'text-rose-500' : 'text-white'}`}>{value}</h3>
        <p className="text-[10px] text-gray-600 font-medium italic">{sub}</p>
      </div>
    </div>
  );
}
