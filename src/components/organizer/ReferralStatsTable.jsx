"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, TrendingUp, Ticket, ChevronRight, Download } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Table displaying referral stats per referee for an event.
 *
 * @param {Object} props
 * @param {string} props.eventId - Current event ID for linking
 * @param {string} props.eventName - Event name for export
 */
export default function ReferralStatsTable({ 
  stats = [], 
  loading = false, 
  eventId = null, 
  eventName = "Event" 
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStats = stats.filter((s) =>
    (s.username || s.referral_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTickets = stats.reduce((sum, s) => sum + (s.tickets_sold || 0), 0);
  const totalNetRevenue = stats.reduce((sum, s) => sum + (Number(s.net_revenue || 0)), 0);

  const exportToCSV = () => {
    if (stats.length === 0) return;

    const headers = ["Referee Username", "Tickets Sold", "Gross Sales (₦)", "Commission (₦)", "Net Revenue (₦)"];
    const rows = filteredStats.map((s) => [
      s.username || s.referral_name || "Unknown",
      s.tickets_sold || 0,
      s.referral_revenue || 0,
      s.referral_payout || 0,
      s.net_revenue || 0,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Axile_${eventName}_referral_audit_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Summary cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 space-y-3">
              <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
              <div className="h-7 w-24 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
        {/* Table skeleton */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
              <Users className="w-4 h-4 text-rose-500" />
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-800" />
          </div>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Referees</p>
          <h3 className="text-2xl font-black text-white">{stats.length}</h3>
        </div>

        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
              <Ticket className="w-4 h-4 text-blue-500" />
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-800" />
          </div>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Tickets Sold</p>
          <h3 className="text-2xl font-black text-white">{totalTickets.toLocaleString()}</h3>
        </div>

        <div className="bg-[#0A0A0A] border border-emerald-500/30 rounded-2xl p-5 hover:border-emerald-500/50 transition-colors text-emerald-400 font-bold bg-emerald-500/[0.02] shadow-xl">
          <div className="flex items-center justify-between mb-3 text-white">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-800" />
          </div>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Net Revenue (Org Share)</p>
          <h3 className="text-2xl font-black text-white">₦{totalNetRevenue.toLocaleString()}</h3>
        </div>
      </div>

      {/* Header + Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-rose-500" />
          <h2 className="text-lg font-bold text-white">Referee Breakdown</h2>
          <span className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-black text-gray-500">
            {filteredStats.length} RESULT{filteredStats.length !== 1 ? "S" : ""}
          </span>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search referees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-rose-500 transition-all placeholder:text-gray-600"
            />
          </div>
          {stats.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2.5 rounded-xl transition-all text-xs font-bold shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Audit CSV
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Referee
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Tickets Sold
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Organizer's Net
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStats.length > 0 ? (
                filteredStats.map((s, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => eventId && router.push(`/dashboard/org/my-event/${eventId}/referrals/${s.username || s.referral_name}`)}
                    className="border-b border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500/20 to-purple-500/20 flex items-center justify-center text-[10px] font-black text-rose-500 border border-rose-500/20 uppercase">
                          {(s.username || s.referral_name || "")
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2) || "?"}
                        </div>
                        <span className="text-sm font-bold text-white group-hover:text-rose-500 transition-colors">
                          {s.username || s.referral_name || "Unknown Referee"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-white">
                        {(s.tickets_sold || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-emerald-400">
                        ₦{Number(s.net_revenue || 0).toLocaleString()}
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-16 text-center space-y-3">
                    <Users className="w-10 h-10 text-gray-800 mx-auto" />
                    <p className="text-gray-500 font-medium text-sm">
                      {searchTerm
                        ? "No referees found matching your search."
                        : "No referral data available for this event yet."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
