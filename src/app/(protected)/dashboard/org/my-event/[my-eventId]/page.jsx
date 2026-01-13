"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "../../../../../../lib/axios";
import { 
  Copy, 
  ChevronLeft, 
  FileText, 
  BarChart3, 
  ArrowRight, 
  Ticket, 
  CheckCircle2, 
  Clock, 
  Edit, 
  MapPin, 
  Users,
  CreditCard,
  Share2
} from "lucide-react";
import toast from "react-hot-toast";
import { getImageUrl } from "../../../../../../lib/utils";
import Loading from "@/components/ui/Loading";

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.["my-eventId"] ?? params?.id;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coverBroken, setCoverBroken] = useState(false);
  const isMountedRef = useRef(true);

  const formattedDate = (iso) => {
    if (!iso) return "TBD";
    try {
      return new Date(iso).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  const handleCopyLink = () => {
    if (!event) return;
    const link = `${window.location.origin}/events/${id}`;
    navigator.clipboard.writeText(link).then(() => {
      toast.success("Link copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const fetchEvent = useCallback(async () => {
    if (!id) {
      toast.error("Invalid event id");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Use the canonical trailing-slash endpoint (matches API docs and other pages).
      const res = await api.get(`/events/${id}/details/`);
      if (isMountedRef.current) setEvent(res?.data ?? null);
    } catch (err) {
      // Fallback for organizers
      try {
        const fallback = await api.get("/organizer/events/");
        const list = Array.isArray(fallback.data) ? fallback.data : (fallback.data?.events ?? []);
        const found = list.find((e) => String(e.event_id ?? e.id) === String(id));
        if (isMountedRef.current) {
          if (found) setEvent(found);
          else toast.error("Event not found");
        }
      } catch (inner) {
        if (isMountedRef.current) {
          toast.error("Failed to load event details");
        }
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchEvent();
    return () => { isMountedRef.current = false; };
  }, [fetchEvent]);

  // --- Cover image resolution (must be computed before early returns so hooks stay in order) ---
  const rawCoverImage =
    event?.event_image ??
    event?.cover_image ??
    event?.banner_image ??
    event?.image;
  const resolvedCoverImage = getImageUrl(rawCoverImage);

  const isCloudinaryUrl = (url) =>
    typeof url === "string" && url.includes("cloudinary.com");

  let sessionPreview = null;
  if (!resolvedCoverImage && typeof window !== "undefined" && id) {
    try {
      sessionPreview = sessionStorage.getItem(`created-event-image:${id}`);
    } catch {
      sessionPreview = null;
    }
  }

  // Some CDNs (including Cloudinary) can behave unexpectedly with arbitrary query params.
  // Only apply our cache-buster to non-Cloudinary URLs.
  const coverSrc = resolvedCoverImage
    ? isCloudinaryUrl(resolvedCoverImage)
      ? resolvedCoverImage
      : `${resolvedCoverImage}${resolvedCoverImage.includes("?") ? "&" : "?"}v=${encodeURIComponent(
          String(id ?? "")
        )}`
    : sessionPreview;

  useEffect(() => {
    // Reset if image source changes (prevents a previous error from hiding a newly loaded cover).
    setCoverBroken(false);
  }, [coverSrc]);


  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loading />
    </div>
  );

  if (!event) return null;

  const showCover = Boolean(coverSrc) && !coverBroken;

  const stats = [
    { label: "Bookings", value: event.ticket_stats?.confirmed_tickets ?? 0, icon: <Ticket className="w-5 h-5 text-rose-500" />, color: "rose" },
    { label: "Available", value: event.ticket_stats?.available_spots ?? "∞", icon: <Users className="w-5 h-5 text-emerald-500" />, color: "emerald" },
    { label: "Revenue", value: `₦${(event.ticket_stats?.total_revenue ?? 0).toLocaleString()}`, icon: <CreditCard className="w-5 h-5 text-blue-500" />, color: "blue" },
  ];

  return (
    <div className="min-h-screen p-4 md:p-10 max-w-7xl mx-auto text-white pb-32 space-y-12">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-white/5 pb-10">
        <div className="space-y-4 max-w-3xl">
          <button 
            onClick={() => router.push('/dashboard/org/my-event')}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> All Events
          </button>
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">{event.name}</h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                event.status === 'verified' 
                ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" 
                : "text-amber-500 bg-amber-500/10 border-amber-500/20"
              }`}>
                {event.status === 'verified' ? 'Verified' : (event.status || 'Pending')}
              </span>
            </div>
            <p className="text-gray-400 font-medium flex items-center gap-3 text-sm md:text-base">
              <span className="text-rose-500 uppercase font-black text-xs tracking-widest">{event.event_type?.replace('_', ' ')}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span className={event.pricing_type === 'paid' ? 'text-blue-400' : 'text-emerald-400'}>
                {event.pricing_type === "paid" ? `Paid Event (₦${event.price})` : "Free Event"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          {/* <button
            onClick={() => router.push(`/dashboard/org/edit-event/${event.event_id ?? event.id}`)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-all active:scale-95 text-sm"
          >
            <Edit className="w-4 h-4" /> Edit Event
          </button> */}
          <button
            onClick={handleCopyLink}
            className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95"
            title="Share Link"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column - Image & Details */}
        <div className="lg:col-span-8 space-y-12">
          {/* Cover Image */}
          <div className="relative aspect-[16/9] w-full rounded-[2.5rem] overflow-hidden group shadow-2xl">
            {showCover ? (
              <img
                key={coverSrc}
                src={coverSrc}
                alt={event.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                onError={(e) => {
                  e.stopPropagation();
                  setCoverBroken(true);
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 gap-2 bg-white/5">
                <FileText className="w-10 h-10" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {coverSrc ? "Image Failed To Load" : "No Cover Image"}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 space-y-4">
              <div className="flex items-center gap-3 text-rose-500">
                <Clock className="w-5 h-5" />
                <h3 className="font-bold text-sm tracking-widest uppercase">Schedule</h3>
              </div>
              <p className="text-gray-300 font-medium leading-relaxed">{formattedDate(event.date)}</p>
            </div>
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 space-y-4">
              <div className="flex items-center gap-3 text-rose-500">
                <MapPin className="w-5 h-5" />
                <h3 className="font-bold text-sm tracking-widest uppercase">Location</h3>
              </div>
              <p className="text-gray-300 font-medium leading-relaxed">{event.location || "Venue to be announced"}</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-10 space-y-6 shadow-xl">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-rose-500" />
              <h2 className="text-2xl font-black uppercase tracking-tighter italic">About the event</h2>
            </div>
            <p className="text-gray-400 text-base leading-loose whitespace-pre-line font-medium opacity-80">
              {event.description || "No description provided for this event yet."}
            </p>
          </div>

          {/* Ticket Categories */}
          {event.ticket_categories && event.ticket_categories.length > 0 && (
            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl md:rounded-[2.5rem] p-5 md:p-10 space-y-4 md:space-y-6 shadow-xl">
              <div className="flex items-center gap-2 md:gap-3">
                <Ticket className="w-5 h-5 md:w-6 md:h-6 text-rose-500" />
                <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter italic">Ticket Categories</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {event.ticket_categories.map((category, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 space-y-2 md:space-y-3 hover:border-rose-500/30 transition-colors group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5 md:space-y-1 flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm md:text-lg truncate">{category.name}</h3>
                        {category.description && (
                          <p className="text-[10px] md:text-xs text-gray-500 font-medium line-clamp-2">{category.description}</p>
                        )}
                      </div>
                      <span className="text-rose-500 font-black text-base md:text-xl shrink-0">₦{category.price?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-3 pt-2 border-t border-white/5">
                      {category.max_tickets && (
                        <div className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs">
                          <Ticket className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-600" />
                          <span className="text-gray-400 font-medium">Max: {category.max_tickets}</span>
                        </div>
                      )}
                      {category.max_quantity_per_booking && (
                        <div className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs">
                          <Users className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-600" />
                          <span className="text-gray-400 font-medium">Per Booking: {category.max_quantity_per_booking}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Stats & Actions */}
        <div className="lg:col-span-4 lg:sticky lg:top-10 space-y-8">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-rose-500" /> Stats
              </h3>
              <div className="px-3 py-1 bg-rose-500/10 rounded-full text-[10px] font-black text-rose-500 uppercase">Live</div>
            </div>

            <div className="space-y-6">
              {stats.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors">
                      {s.icon}
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
                      <p className="text-lg font-bold text-white leading-none mt-1">{s.value}</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-800 rotate-180" />
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-white/5">
              <button 
                onClick={() => router.push(`/dashboard/org/my-event/${event.event_id ?? event.id}/analytics`)}
                className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-xl shadow-rose-600/20 active:scale-95 flex items-center justify-center gap-2 group"
              >
                Detailed Analytics <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => router.push(`/dashboard/org/my-event/${event.event_id ?? event.id}/tickets`)}
                className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4" /> Manage Categories
              </button>
            </div>
          </div>

          <div className="bg-linear-to-br from-rose-500/10 to-transparent border border-white/5 rounded-3xl p-6 text-center">
            <p className="text-xs text-gray-400 font-medium">Need help managing your event?</p>
            <p className="text-xs text-rose-500 font-bold mt-1 cursor-pointer hover:underline">Contact Support</p>
          </div>
        </div>
      </div>
    </div>
  );
}
