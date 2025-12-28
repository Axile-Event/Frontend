"use client";

import { useEffect, useState } from "react";
import api from "../../../../lib/axios";
import { Banknote, Ticket, Users, Calendar, TrendingUp, DollarSign, Clock, Plus } from "lucide-react";
import { useRouter } from "next/navigation";


export default function Overview() {
  const [analytics, setAnalytics] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchOverview() {
      try {
        // Fetch analytics data
        const analyticsRes = await api.get("/organizer/analytics/");
        setAnalytics(analyticsRes.data);

        // Fetch recent events
        const eventsRes = await api.get("/organizer/events/");
        const events = eventsRes.data.events || [];
        setRecentEvents(events.slice(0, 5));
         toast.success("Overview data loaded successfully");
         
        setLoading(false);
      } catch (err) {
        console.error("Overview fetch error:", err.response?.data || err.message);
        toast.error("Failed to load overview data");
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }

    fetchOverview();
  }, []);

  if (loading || !analytics) return <p className="text-white">Loading...</p>;

  return (
    <div className="min-h-screen p-4 md:p-4 space-y-5 md:space-y-6  pt-6 md:pt-10">
      {/* Welcome Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Here's an overview of your event performance
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/org/create-event')}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg transition-colors font-medium flex-nowrap"
        >
          <Plus className="w-5 h-5" />
          Create Event
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          icon={<DollarSign className="w-4 h-4 md:w-6 md:h-6 text-green-400" />}
          label="Total Revenue"
          value={`₦${analytics.total_revenue?.toLocaleString() || 0}`}
        />
        <StatCard
          icon={<Ticket className="w-4 h-4 md:w-6 md:h-6 text-blue-400" />}
          label="Tickets Sold"
          value={analytics.total_tickets_sold?.toLocaleString() || 0}
        />
        <StatCard
          icon={<Users className="w-4 h-4 md:w-6 md:h-6 text-purple-400" />}
          label="Total Events"
          value={analytics.total_events?.toLocaleString() || 0}
        />
        <StatCard
          icon={<Clock className="w-4 h-4 md:w-6 md:h-6 text-yellow-400" />}
          label="Pending Tickets"
          value={analytics.total_tickets_pending?.toLocaleString() || 0}
        />
      </div>

      {/* Recent Events - Full Width */}
      <div className="bg-[#111] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-semibold">Recent Events</h2>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        {recentEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No events yet</p>
            <p className="text-gray-500 text-sm mt-2">Create your first event to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentEvents.map((event, index) => (
              <div
                key={event.event_id}
                className="bg-[#1a1a1a] p-5 rounded-lg hover:bg-[#222] transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-white font-medium text-base mb-1">{event.name}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-lg font-semibold">
                      ₦{event.ticket_stats?.total_revenue?.toLocaleString() || 0}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {event.ticket_stats?.confirmed_tickets || 0} tickets sold
                    </p>
                  </div>
                  <div className="text-right">
                    <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, trendUp, delay = 0 }) {
  return (
    <div
      className="bg-[#111] p-6 rounded-xl hover:bg-[#1a1a1a] transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-[#1a1a1a] rounded-lg">
          {icon}
        </div>
        <div className={`flex items-center text-xs font-medium ${
          trendUp ? 'text-green-400' : 'text-red-400'
        }`}>
          <TrendingUp className={`w-3 h-3 mr-1 ${trendUp ? '' : 'rotate-180'}`} />
          {trend}
        </div>
      </div>
      <p className="text-2xl text-white font-bold mb-1">
        {value}
      </p>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}

function EventCard({ event, onViewDetails }) {
  return (
    <div className="bg-[#1a1a1a] p-5 rounded-lg hover:bg-[#222] transition-colors border border-gray-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg mb-1">{event.name}</h3>
          <p className="text-gray-400 text-sm mb-2">
            {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <p className="text-gray-500 text-sm">{event.location}</p>
        </div>
        <div className="text-right">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            event.pricing_type === 'free' ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'
          }`}>
            {event.pricing_type === 'free' ? 'Free' : 'Paid'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-green-400 text-lg font-semibold">
              ₦{event.ticket_stats?.total_revenue?.toLocaleString() || 0}
            </p>
            <p className="text-gray-500 text-xs">Revenue</p>
          </div>
          <div>
            <p className="text-blue-400 text-lg font-semibold">
              {event.ticket_stats?.confirmed_tickets || 0}
            </p>
            <p className="text-gray-500 text-xs">Tickets Sold</p>
          </div>
          <div>
            <p className="text-yellow-400 text-lg font-semibold">
              {event.capacity - (event.ticket_stats?.available_spots || event.capacity)}
            </p>
            <p className="text-gray-500 text-xs">Capacity</p>
          </div>
        </div>
        <button
          onClick={() => onViewDetails(event.event_id)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-[#111] p-6 rounded-xl">
      <p className="text-2xl text-white font-bold">{value}</p>
      <p className="text-gray-400">{label}</p>
    </div>
  );
}
