"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { queryKeys } from "@/lib/query-keys";
import { fetchReferralStats } from "@/lib/referral";
import {
  ArrowLeft,
  Megaphone,
  Calendar,
  MapPin,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import Loading from "@/components/ui/Loading";
import ReferralStatsTable from "@/components/organizer/ReferralStatsTable";
import ReferralBadge from "@/components/organizer/ReferralBadge";

export default function ReferralAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.["my-eventId"] ?? params?.id;

  // Fetch event details first
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: queryKeys.organizer.eventDetail(eventId),
    queryFn: async () => {
      const res = await api.get(`/events/${eventId}/details/`);
      return res?.data;
    },
    enabled: !!eventId,
  });

  // Fetch referral stats
  const {
    data: referralData,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: queryKeys.organizer.referralStats(eventId),
    queryFn: async () => {
      // We need referee IDs to query — get them from the event's referral_referee_ids
      // or fallback to empty (backend should return what it can)
      const refereeIds = event?.referral_referee_ids || [];
      const referrals = refereeIds.map((id) => ({ referee_id: id }));

      try {
        const stats = await fetchReferralStats(eventId, referrals);
        return Array.isArray(stats) ? stats : stats?.stats || stats?.data || [];
      } catch (err) {
        // If the endpoint fails with empty referrals, return empty
        console.error("Referral stats error:", err);
        return [];
      }
    },
    enabled: !!eventId && !!event,
  });

  const formattedDate = (iso) => {
    if (!iso) return "TBD";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <Loading />
        <p className="text-gray-500 text-sm mt-4 animate-pulse uppercase tracking-[0.2em] font-black">
          Loading Event...
        </p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black space-y-4">
        <p className="text-gray-500 text-lg font-bold">Event not found</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-rose-600 hover:bg-rose-700 rounded-xl text-white font-bold transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!event.use_referral) {
    return (
      <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto text-white">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Event
        </button>

        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-16 text-center space-y-6 max-w-2xl mx-auto shadow-2xl">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
            <Megaphone className="w-10 h-10 text-gray-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Referral Not Enabled</h2>
            <p className="text-gray-400 text-sm">
              This event does not have referral rewards enabled. Enable referral
              rewards in event settings to track referral performance.
            </p>
          </div>
          <button
            onClick={() =>
              router.push(`/dashboard/org/edit-event/${eventId}`)
            }
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-8 py-3.5 rounded-2xl transition-all shadow-xl shadow-rose-600/20 font-bold active:scale-[0.98]"
          >
            Enable Referral
          </button>
        </div>
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
          Back to Event
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 rounded-xl">
                <Megaphone className="w-5 h-5 text-rose-500" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black">
                Referral Analytics
              </h1>
            </div>
            <h2 className="text-lg font-bold text-gray-300">
              {event.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-gray-500 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                {formattedDate(event.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {event.location || "TBD"}
              </span>
            </div>
          </div>

          {/* Reward config info */}
          <div className="flex flex-col items-end gap-2">
            <ReferralBadge
              useReferral={event.use_referral}
              rewardType={event.referral_reward_type}
              rewardAmount={event.referral_reward_amount}
              rewardPercentage={event.referral_reward_percentage}
              size="md"
            />
            <p className="text-[10px] text-gray-600 font-medium">
              {event.referral_reward_type === "flat"
                ? `₦${Number(event.referral_reward_amount || 0).toLocaleString()} per referral ticket`
                : `${event.referral_reward_percentage || 0}% per referral ticket`}
            </p>
          </div>
        </div>
      </div>

      {/* Stats error notice */}
      {statsError && (
        <div className="flex items-start gap-2 px-4 py-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
          <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-400 font-medium">
            Could not load referral statistics. The data may not be available
            yet if no referrals have been made.
          </p>
        </div>
      )}

      {/* Referral Stats Table */}
      <ReferralStatsTable
        stats={referralData || []}
        loading={statsLoading}
        eventName={event.name}
      />
    </div>
  );
}
