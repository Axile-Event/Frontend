"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../../lib/axios";
import { Loader2, Copy, Check, ExternalLink, Plus, Clock, Search } from "lucide-react";
import toast from "react-hot-toast";
import { getImageUrl } from "../../../../../lib/utils";
import { Input } from "@/components/ui/input";
import { OrganizerEventsPageSkeleton } from "@/components/skeletons";

const MyEvent = () => {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [localImages, setLocalImages] = useState({});
  const [brokenImages, setBrokenImages] = useState({});
  const isMountedRef = useRef(true);

  // Filter effect
  useEffect(() => {
    if (!events) {
        setFilteredEvents([]);
        return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = events.filter(ev => 
        (ev.name && ev.name.toLowerCase().includes(lowerQuery)) ||
        (ev.event_type && ev.event_type.toLowerCase().includes(lowerQuery)) ||
        (ev.location && ev.location.toLowerCase().includes(lowerQuery))
    );
    setFilteredEvents(filtered);
  }, [searchQuery, events]);

  const fetchEvents = useCallback(async () => {
    if (!isMountedRef.current) return;
    setLoading(true);
    try {
      const res = await api.get("/organizer/events/");
      const payload = res?.data;
      let list = [];
      if (Array.isArray(payload)) list = payload;
      else if (Array.isArray(payload?.events)) list = payload.events;
      else if (Array.isArray(payload?.data)) list = payload.data;
      else list = [];
      
      // Fetch fresh ticket statistics for each event
      const eventsWithStats = await Promise.all(
        list.map(async (event) => {
          const eventId = event.event_id ?? event.id;
          try {
            const ticketsRes = await api.get(`/tickets/organizer/${eventId}/tickets/`);
            const stats = ticketsRes.data?.statistics || {};
            // Override with fresh statistics - map API fields correctly
            return {
              ...event,
              ticket_stats: {
                confirmed_tickets: stats.confirmed || 0,
                pending_tickets: stats.pending || 0,
                total_revenue: stats.total_revenue || 0,
                available_spots: stats.available_spots ?? "∞"
              }
            };
          } catch (ticketErr) {
            console.warn(`Could not fetch ticket stats for event ${eventId}:`, ticketErr);
            // Keep existing ticket_stats or set defaults
            return {
              ...event,
              ticket_stats: event.ticket_stats || {
                confirmed_tickets: 0,
                pending_tickets: 0,
                total_revenue: 0,
                available_spots: "∞"
              }
            };
          }
        })
      );
      
      // Sort events by created_at in descending order (latest created first)
      const sortedList = [...eventsWithStats].sort((a, b) => {
        const dateA = new Date(a.created_at || a.date);
        const dateB = new Date(b.created_at || b.date);
        return dateB - dateA;
      });
      
      if (isMountedRef.current) setEvents(sortedList);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        (err?.response?.data ? JSON.stringify(err.response.data) : null) ||
        err?.message ||
        "Failed to load events";
      if (isMountedRef.current) {
        toast.error(msg);
      }
      console.error("Error fetching events:", msg);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchEvents();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchEvents]);

  // ... (localImages effect remains same)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const map = {};
    for (const ev of events) {
      const id = ev?.event_id ?? ev?.id;
      if (!id) continue;

      const hasServerImage = Boolean(ev?.event_image || ev?.image);
      const storageKey = `created-event-image:${id}`;

      try {
        if (hasServerImage) {
          sessionStorage.removeItem(storageKey);
          continue;
        }
        const stored = sessionStorage.getItem(storageKey);
        if (stored) map[id] = stored;
      } catch {
        // ignore
      }
    }
    setLocalImages(map);
  }, [events]);

  const formattedDate = (iso) => {
    if (!iso) return "TBD";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const handleCopyLink = (e, eventId) => {
    e.stopPropagation();
    const link = `${window.location.origin}/events/${eventId}`;
    navigator.clipboard.writeText(link).then(() => {
      toast.success("Link copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-1">
            Your Events
          </h1>
          <p className="text-gray-400 text-xs">Manage events and view ticket stats.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative grow md:grow-0">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
             <input 
                type="text"
                placeholder="Search events..."
                className="pl-9 pr-4 py-2.5 bg-[#0A0A0A] border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-rose-500/50 w-full md:w-48 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>

          <button
            onClick={() => router.push("/dashboard/org/create-event")}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-95 font-semibold text-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Create
          </button>
          <button
            onClick={fetchEvents}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2.5 rounded-xl transition-all active:scale-95 font-semibold text-xs"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <OrganizerEventsPageSkeleton />
      ) : events.length === 0 ? (
        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-16 text-center space-y-6 max-w-2xl mx-auto shadow-2xl">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
            <Plus className="w-10 h-10 text-gray-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">No events created yet</h2>
            <p className="text-gray-400 text-sm">
              Ready to host your next big thing? Create your first event and start selling tickets across the platform.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/org/create-event")}
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-8 py-3.5 rounded-2xl transition-all shadow-xl shadow-rose-600/20 font-bold active:scale-[0.98]"
          >
            Create Your First Event
          </button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 border border-white/5 rounded-3xl bg-white/5 mx-auto max-w-4xl">
            <Search className="w-12 h-12 text-gray-700" />
            <div className="space-y-1">
                <p className="text-white font-semibold text-lg">No events found</p>
                <p className="text-gray-500 text-sm">No events match your search query &quot;{searchQuery}&quot;</p>
            </div>
            <button 
                onClick={() => setSearchQuery("")}
                className="text-rose-500 hover:text-rose-400 text-sm font-medium transition-colors"
            >
                Clear Search
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredEvents.map((ev, index) => {
            const id = ev.event_id ?? ev.id;
            const key = id ?? `${ev?.name ?? "event"}-${ev?.date ?? "no-date"}-${index}`;
            const rawImage = ev?.event_image ?? ev?.image;
            const resolvedImage = getImageUrl(rawImage);
            const sessionPreview = id ? localImages[id] : null;
            const imageSrc = resolvedImage
              ? `${resolvedImage}${resolvedImage.includes("?") ? "&" : "?"}v=${encodeURIComponent(
                  String(id ?? index)
                )}`
              : sessionPreview;

            const isBroken = id ? Boolean(brokenImages[id]) : false;
            const showImage = Boolean(imageSrc) && !isBroken;
            return (
              <article
                key={key}
                onClick={() => router.push(`/dashboard/org/my-event/${id}`)}
                className="group relative bg-[#0A0A0A] border border-white/5 rounded-[2rem] overflow-hidden hover:border-rose-500/30 transition-all duration-500 shadow-xl hover:shadow-rose-600/5 cursor-pointer flex flex-col"
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  {showImage ? (
                    <img
                      key={imageSrc}
                      src={imageSrc}
                      alt={ev.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      onError={(e) => {
                        e.stopPropagation();
                        if (!id) return;
                        setBrokenImages((prev) => ({ ...prev, [id]: true }));
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 gap-2 bg-white/5">
                      <Plus className="w-10 h-10" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {imageSrc ? "Image Failed To Load" : "No Cover Image"}
                      </span>
                    </div>
                  )}
                  
                  {/* Glass Overlays */}
                  <div className="absolute inset-x-3 top-3 flex items-center justify-between">
                    <div className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest backdrop-blur-xl border flex items-center gap-1.5 ${
                      ev.status === 'verified' 
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                      : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    }`}>
                      {ev.status === 'verified' ? <Check className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                      {ev.status === 'verified' ? 'Verified' : (ev.status || 'Pending')}
                    </div>
                    
                    <div className="px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest backdrop-blur-xl bg-black/40 border border-white/10 text-white">
                      {ev.pricing_type === "paid" 
                        ? (() => {
                            // Get price from ticket_categories (lowest price) or fallback to event price
                            const categories = ev.ticket_categories || [];
                            const categoryPrices = categories.map(c => parseFloat(c.price) || 0).filter(p => p > 0);
                            const lowestCategoryPrice = categoryPrices.length > 0 ? Math.min(...categoryPrices) : null;
                            const eventPrice = ev.price ?? ev.event_price ?? 0;
                            const displayPrice = lowestCategoryPrice ?? eventPrice;
                            return displayPrice > 0 
                              ? `From ₦${Number(displayPrice).toLocaleString()}` 
                              : "PAID";
                          })()
                        : "FREE"}
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-linear-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute bottom-4 left-5 right-5">
                    <p className="text-rose-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1">{ev.event_type?.replace('_', ' ') || "GENERAL EVENT"}</p>
                    <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-rose-400 transition-colors">
                      {ev.name}
                    </h3>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 space-y-4 flex-1 flex flex-col">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 text-gray-400">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-[11px] font-semibold">{formattedDate(ev.date)}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-400">
                      <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-[11px] font-semibold line-clamp-1">{ev.location || "Venue TBD"}</span>
                    </div>
                  </div>

                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 italic opacity-80">
                    {ev.description || "No event description provided yet..."}
                  </p>

                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                    <div className={`flex-1 grid gap-4 ${ev.pricing_type === "paid" ? "grid-cols-2" : "grid-cols-1"}`}>
                      <div>
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-0.5">Bookings</p>
                        <p className="text-base font-bold text-white leading-none">
                          {(ev.ticket_stats?.confirmed_tickets ?? 0).toLocaleString()}
                          <span className="text-[9px] text-gray-500 font-medium ml-1">/ {typeof ev.ticket_stats?.available_spots === 'number' ? ev.ticket_stats.available_spots.toLocaleString() : (ev.ticket_stats?.available_spots ?? '∞')}</span>
                        </p>
                      </div>
                      {ev.pricing_type === "paid" && (
                        <div>
                          <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-0.5">Revenue</p>
                          <p className="text-base font-bold text-emerald-400 leading-none">
                            ₦{(ev.ticket_stats?.total_revenue ?? 0).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => ev.status === 'verified' ? handleCopyLink(e, id) : e.stopPropagation()}
                      disabled={ev.status !== 'verified'}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg transition-all font-medium ${
                        ev.status === 'verified'
                          ? 'bg-rose-500/5 hover:bg-rose-500/15 border-rose-500/30 hover:border-rose-500/50 group/copy cursor-pointer'
                          : 'bg-gray-900/30 border-gray-700 cursor-not-allowed opacity-50'
                      }`}
                      title={ev.status === 'verified' ? 'Copy Event Link' : 'Event must be verified to share'}
                    >
                      <Copy className={`w-3.5 h-3.5 transition-colors ${
                        ev.status === 'verified' ? 'text-rose-500 group-hover/copy:text-rose-400' : 'text-gray-600'
                      }`} />
                      <span className={`text-[10px] transition-colors font-bold uppercase tracking-wider ${
                        ev.status === 'verified' ? 'text-rose-500 group-hover/copy:text-rose-400' : 'text-gray-600'
                      }`}>Copy Link</span>
                    </button>
                  </div>
                </div>

                {/* Hover progress bar effect */}
                <div className="absolute bottom-0 left-0 h-0.5 bg-rose-600 w-0 group-hover:w-full transition-all duration-500" />
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyEvent;
