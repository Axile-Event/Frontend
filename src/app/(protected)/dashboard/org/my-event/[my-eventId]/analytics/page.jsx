"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "../../../../../../../lib/axios";
import { 
  ArrowLeft, 
  Users, 
  Ticket, 
  Search, 
  Download, 
  ChevronRight,
  TrendingUp,
  CreditCard,
  UserCheck,
  Calendar
} from "lucide-react";
import toast from "react-hot-toast";
import Loading from "@/components/ui/Loading";

export default function AnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.["my-eventId"] ?? params?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAnalytics = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Use the dedicated analytics endpoint for richer data
      const res = await api.get(`/analytics/event/${id}/`);
      console.log("Analytics data received:", res.data);
      
      // Map the analytics response to our expected data structure
      const analyticsData = res.data.analytics || res.data;
      setData({
        event_id: analyticsData.event_info?.event_id || id,
        event_name: analyticsData.event_info?.name || analyticsData.event_info?.event_name || "Unknown Event",
        event_location: analyticsData.event_info?.location,
        event_date: analyticsData.event_info?.date,
        event_status: analyticsData.event_info?.status,
        pricing_type: analyticsData.event_info?.pricing_type,
        tickets: analyticsData.tickets_list || [],
        count: analyticsData.tickets_list?.length || 0,
        statistics: {
          confirmed: analyticsData.statistics?.total_tickets_sold || 0,
          pending: analyticsData.statistics?.pending_tickets || 0,
          cancelled: analyticsData.statistics?.cancelled_tickets || 0,
          used: analyticsData.statistics?.used_tickets || 0,
          total_revenue: analyticsData.statistics?.total_revenue || 0,
          available_spots: analyticsData.statistics?.available_spots ?? "∞"
        }
      });
    } catch (err) {
      console.error("Analytics endpoint error, falling back to tickets endpoint:", err);
      // Fallback to tickets endpoint if analytics endpoint fails
      try {
        const fallbackRes = await api.get(`/tickets/organizer/${id}/tickets/`);
        console.log("Fallback data received:", fallbackRes.data);
        setData(fallbackRes.data);
      } catch (fallbackErr) {
        const msg = fallbackErr?.response?.data?.detail || fallbackErr?.response?.data?.message || "Failed to load analytics data";
        toast.error(msg);
        console.error("Analytics error:", fallbackErr);
        // Set empty data so page still renders
        setData({
          event_id: id,
          event_name: "Unknown Event",
          tickets: [],
          count: 0,
          statistics: {
            confirmed: 0,
            pending: 0,
            cancelled: 0,
            used: 0,
            total_revenue: 0,
            available_spots: "∞"
          }
        });
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const filteredTickets = data?.tickets?.filter(t => 
    t.student_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.ticket_id?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const exportToCSV = () => {
    if (!data?.tickets || data.tickets.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Create CSV headers - includes category info from analytics endpoint
    const headers = ["Attendee Name", "Email", "Ticket ID", "Category", "Price", "Quantity", "Status", "Check-in Time", "Purchase Date"];
    
    // Create CSV rows
    const rows = data.tickets.map(ticket => [
      ticket.student_full_name || "N/A",
      ticket.student_email || "N/A",
      ticket.ticket_id || "N/A",
      ticket.category_name || "General",
      ticket.total_price || ticket.price_per_ticket || "0",
      ticket.quantity || 0,
      ticket.status || "N/A",
      ticket.checked_in_at ? new Date(ticket.checked_in_at).toLocaleString() : "Not Checked In",
      ticket.created_at ? new Date(ticket.created_at).toLocaleString() : "N/A"
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${data.event_name || 'event'}_attendees_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV exported successfully");
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <Loading />
      <p className="text-gray-500 text-sm mt-4 animate-pulse uppercase tracking-[0.2em] font-black">Analyzing Data...</p>
    </div>
  );

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black space-y-4">
        <p className="text-gray-500 text-lg font-bold">No analytics data available</p>
        <button 
          onClick={() => router.back()}
          className="px-6 py-3 bg-rose-600 hover:bg-rose-700 rounded-xl text-white font-bold transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Calculate total tickets by summing quantities (not counting records)
  const totalTickets = data.tickets?.reduce((sum, ticket) => sum + (ticket.quantity || 0), 0) || 0;
  const confirmedTickets = data.tickets?.filter(t => t.status === 'confirmed').reduce((sum, ticket) => sum + (ticket.quantity || 0), 0) || 0;
  const pendingTickets = data.tickets?.filter(t => t.status === 'pending').reduce((sum, ticket) => sum + (ticket.quantity || 0), 0) || 0;
  const usedTickets = data.tickets?.filter(t => t.status === 'used').reduce((sum, ticket) => sum + (ticket.quantity || 0), 0) || 0;
  const isPaidEvent = data.pricing_type === "paid";

  const stats = [
    { label: "Total Tickets", value: totalTickets, icon: <Ticket className="w-5 h-5 text-rose-500" />, sub: "All Bookings" },
    { label: "Checked In", value: usedTickets, icon: <UserCheck className="w-5 h-5 text-emerald-500" />, sub: "Attended" },
    // Only show revenue for paid events
    ...(isPaidEvent 
      ? [{ label: "Revenue", value: `₦${Number(data.statistics?.total_revenue || 0).toLocaleString()}`, icon: <TrendingUp className="w-5 h-5 text-blue-500" />, sub: "Gross Earnings" }]
      : []),
    { label: "Pending", value: pendingTickets, icon: <CreditCard className="w-5 h-5 text-amber-500" />, sub: isPaidEvent ? "Awaiting Payment" : "Awaiting Confirmation" },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-10 max-w-7xl mx-auto text-white pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Event
          </button>
          <h1 className="text-3xl md:text-4xl font-black">{data.event_name}</h1>
          <p className="text-gray-400 flex items-center gap-2 text-sm font-medium">
            <Calendar className="w-4 h-4 text-rose-500" /> Detailed Analytics & Attendee List
          </p>
        </div>

        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-3 rounded-2xl transition-all active:scale-95 font-bold text-sm"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 space-y-4 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                {s.icon}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-800" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{s.label}</p>
              <h3 className="text-2xl font-black">{s.value}</h3>
              <p className="text-[10px] text-gray-600 font-medium">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Attendee Table Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-bold">Attendee List</h2>
            <span className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-black text-gray-500">
              {filteredTickets.length} RESULT{filteredTickets.length !== 1 ? 'S' : ''}
            </span>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Search by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-rose-500 transition-all placeholder:text-gray-600"
            />
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/5 rounded-4x1 flow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Attendee</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Ticket ID</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Category</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Quantity</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Check-in</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length > 0 ? filteredTickets.map((t, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/2group transition-color">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-rose-500/20 to-purple-500/20 flex items-center justify-center text-xs font-black text-rose-500 border border-rose-500/20 uppercase">
                          {t.student_full_name?.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold group-hover:text-rose-500 transition-colors">{t.student_full_name}</p>
                          <p className="text-[10px] text-gray-500 font-medium">{t.student_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-mono text-gray-400">{t.ticket_id}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-medium text-gray-300">{t.category_name || "General"}</span>
                      {t.total_price && (
                        <p className="text-[10px] text-gray-500">₦{parseFloat(t.total_price).toLocaleString()}</p>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold">{t.quantity}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        t.status === 'confirmed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                        t.status === 'used' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                        'bg-amber-500/10 border-amber-500/20 text-amber-500'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs text-gray-500 font-medium">
                        {t.checked_in_at ? new Date(t.checked_in_at).toLocaleString() : 'Not Checked In'}
                      </p>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center space-y-3">
                      <Users className="w-10 h-10 text-gray-800 mx-auto" />
                      <p className="text-gray-500 font-medium">No attendees found matching your search.</p>
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
