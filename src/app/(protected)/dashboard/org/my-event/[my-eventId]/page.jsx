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
  Edit2,
  MapPin, 
  Users,
  CreditCard,
  Share2,
  X,
  UserPlus,
  Loader2,
  Mail,
  User,
  Minus,
  Plus
} from "lucide-react";
import toast from "react-hot-toast";
import { getImageUrl, generateEventSlug } from "../../../../../../lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import CustomDropdown from "@/components/ui/CustomDropdown";

// Book for Attendee Modal Component
function BookForAttendeeModal({ isOpen, onClose, event, eventId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    category_name: '',
    quantity: 1
  });

  const isPaidEvent = event?.pricing_type === "paid";
  const categories = event?.ticket_categories || [];

  // For free events, use the first category's name (backend creates one automatically)
  // For paid events, use the selected category from form
  const freeEventCategoryName = categories.length > 0 ? categories[0].name : "General Admission";
  const effectiveCategoryName = isPaidEvent ? formData.category_name : freeEventCategoryName;

  // Generate quantity options (1-10)
  const quantityOptions = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} ${i === 0 ? 'Ticket' : 'Tickets'}`
  }));

  // Generate category options for dropdown
  const categoryOptions = categories.map(cat => ({
    value: cat.name,
    label: `${cat.name} - ₦${cat.price?.toLocaleString() || 0}`
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstname.trim() || !formData.lastname.trim() || !formData.email.trim()) {
      toast.error("Please fill in all attendee details");
      return;
    }

    if (isPaidEvent && !formData.category_name) {
      toast.error("Please select a ticket category");
      return;
    }

    setLoading(true);

    try {
      // Ensure event_id is properly decoded (handles URL encoding like event%3ATE-12345)
      const decodedEventId = decodeURIComponent(eventId);
      
      const payload = {
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        event_id: decodedEventId,
        category_name: effectiveCategoryName,
        quantity: formData.quantity
      };

      console.log("Booking payload:", payload);

      const response = await api.post('/tickets/organizer/book-for-attendee/', payload);
      const result = response.data;

      // Check if it's a paid event with payment URL
      if (result.payment_url) {
        // Store organizer booking context for payment callback
        // Using localStorage because sessionStorage may not persist after Paystack redirect
        localStorage.setItem('organizer_booking', JSON.stringify({
          eventId: decodedEventId,
          attendeeEmail: formData.email,
          attendeeName: `${formData.firstname} ${formData.lastname}`,
          returnUrl: window.location.pathname,
          timestamp: Date.now() // For cleanup of old entries
        }));
        
        toast.success("Redirecting to payment...");
        window.location.href = result.payment_url;
        return;
      }

      // Free event - tickets created immediately
      toast.success(`${result.ticket_count || formData.quantity} ticket(s) sent to ${result.attendee_email || formData.email}`);
      
      // Reset form and close modal
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        category_name: '',
        quantity: 1
      });
      
      onSuccess?.();
      onClose();

    } catch (error) {
      console.error("Book for attendee error:", error);
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || "Failed to book ticket";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedCategory = categories.find(c => c.name === formData.category_name);
  const totalPrice = (selectedCategory?.price || 0) * formData.quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-linear-to-b from-[#111111] to-[#0A0A0A] border border-white/10 rounded-2xl sm:rounded-4xl w-full max-w-md shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header with gradient accent */}
        <div className="relative px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-500 via-green-500 to-teal-500" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-2.5 bg-linear-to-br from-emerald-500/20 to-green-500/20 rounded-lg sm:rounded-xl border border-emerald-500/20">
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Book for Attendee</h2>
                <p className="text-[10px] sm:text-[11px] text-gray-500">Issue tickets on behalf of someone</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg sm:rounded-xl transition-colors group"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4 max-h-[calc(95vh-100px)] sm:max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Attendee Info Card */}
          <div className="bg-white/2 border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">
              <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Attendee Information
            </div>
            
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="space-y-1 sm:space-y-1.5">
                <label className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/5 rounded-lg sm:rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  required
                />
              </div>
              <div className="space-y-1 sm:space-y-1.5">
                <label className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/5 rounded-lg sm:rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1 sm:space-y-1.5">
              <label className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="attendee@example.com"
                  className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white/5 border border-white/5 rounded-lg sm:rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  required
                />
              </div>
              <p className="text-[9px] sm:text-[10px] text-gray-600 ml-1 flex items-center gap-1">
                <Ticket className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Ticket(s) will be sent to this email
              </p>
            </div>
          </div>

          {/* Ticket Selection Card */}
          <div className="bg-white/2 border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">
              <Ticket className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Ticket Selection
            </div>

            {/* Category Selection - Only for paid events */}
            {isPaidEvent && categories.length > 0 && (
              <CustomDropdown
                label="Ticket Category"
                value={formData.category_name}
                onChange={(value) => setFormData(prev => ({ ...prev, category_name: value }))}
                options={categoryOptions}
                placeholder="Select a category"
              />
            )}

            {/* Free event info */}
            {!isPaidEvent && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                  <span className="text-xs sm:text-sm text-emerald-400 font-medium">Free Event</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-gray-500 mt-1 ml-5 sm:ml-6">{freeEventCategoryName} - Tickets sent immediately</p>
              </div>
            )}

            {/* Quantity with Custom Dropdown */}
            <CustomDropdown
              label="Number of Tickets"
              value={formData.quantity}
              onChange={(value) => setFormData(prev => ({ ...prev, quantity: value }))}
              options={quantityOptions}
              placeholder="Select quantity"
            />
          </div>

          {/* Price Summary for paid events */}
          {isPaidEvent && formData.category_name && (
            <div className="bg-linear-to-br from-rose-500/10 to-red-500/5 border border-rose-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-rose-400 uppercase tracking-widest">
                <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Order Summary
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400">{formData.category_name}</span>
                  <span className="text-gray-300">₦{selectedCategory?.price?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400">Quantity</span>
                  <span className="text-gray-300">× {formData.quantity}</span>
                </div>
                <div className="h-px bg-white/10 my-1.5 sm:my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-medium text-gray-300">Total</span>
                  <span className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-linear-to-r from-rose-400 to-red-400">
                    ₦{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-600/50 text-white text-sm sm:text-base font-bold transition-all shadow-xl shadow-rose-600/20 active:scale-[0.98] disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span className="text-sm sm:text-base">Processing...</span>
              </>
            ) : (
              <>
                <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">{isPaidEvent ? 'Proceed to Payment' : 'Issue Ticket'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.["my-eventId"] ?? params?.id;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coverBroken, setCoverBroken] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
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
    // Generate slug-based URL for sharing (name only)
    const slug = generateEventSlug(event.name);
    const link = `${window.location.origin}/events/${slug}`;
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
      // First, try to get event from organizer endpoint
      const orgRes = await api.get("/organizer/events/");
      const list = Array.isArray(orgRes.data) ? orgRes.data : (orgRes.data?.events ?? []);
      const found = list.find((e) => String(e.event_id ?? e.id) === String(id));
      
      let eventData = found;
      
      if (!found) {
        // Not in organizer events, try public endpoint
        const publicRes = await api.get(`/events/${id}/details/`);
        eventData = publicRes?.data;
      }
      
      // Always fetch fresh ticket statistics for this event
      if (eventData) {
        try {
          const ticketsRes = await api.get(`/tickets/organizer/${id}/tickets/`);
          const stats = ticketsRes.data?.statistics || {};
          // Override with fresh statistics - map API fields correctly
          eventData.ticket_stats = {
            confirmed_tickets: stats.confirmed || 0,
            pending_tickets: stats.pending || 0,
            total_revenue: stats.total_revenue || 0,
            available_spots: stats.available_spots ?? "∞"
          };
        } catch (ticketErr) {
          console.warn("Could not fetch ticket stats:", ticketErr);
          // Keep existing ticket_stats if available
          if (!eventData.ticket_stats) {
            eventData.ticket_stats = {
              confirmed_tickets: 0,
              pending_tickets: 0,
              total_revenue: 0,
              available_spots: "∞"
            };
          }
        }
        
        // Fetch fresh ticket categories
        try {
          const catRes = await api.get(`/tickets/categories/?event_id=${id}`);
          console.log("Categories fetched:", catRes.data);
          // Handle both array and object response formats
          const categoriesData = Array.isArray(catRes.data) 
            ? catRes.data 
            : (catRes.data.categories || []);
          eventData.ticket_categories = categoriesData;
        } catch (catErr) {
          console.warn("Could not fetch ticket categories:", catErr);
          // Try to get from event details endpoint as fallback
          if (!eventData.ticket_categories) {
            try {
              const detailsRes = await api.get(`/events/${id}/details/`);
              eventData.ticket_categories = detailsRes.data?.ticket_categories || [];
            } catch {
              eventData.ticket_categories = [];
            }
          }
        }
        
        if (isMountedRef.current) setEvent(eventData);
      }
    } catch (err) {
      console.error("Error fetching event:", err);
      if (isMountedRef.current) {
        toast.error("Failed to load event details");
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
    <div className="min-h-screen p-4 md:p-10 max-w-7xl mx-auto text-white pb-32 space-y-12">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-white/5 pb-10">
        <div className="space-y-4 max-w-3xl w-full">
          <Skeleton className="h-4 w-24" />
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-10 md:h-14 w-64 md:w-96" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-1.5 w-1.5 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <Skeleton className="h-12 w-40 rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-12">
          {/* Cover Image Skeleton */}
          <Skeleton className="aspect-video w-full rounded-[2.5rem]" />

          {/* Schedule & Location Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-5 w-40" />
            </div>
          </div>

          {/* Description Skeleton */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-10 space-y-6">
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded" />
              <Skeleton className="h-7 w-48" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </div>

        {/* Right Column - Stats Skeleton */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </div>
          <Skeleton className="h-48 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );

  if (!event) return null;

  const showCover = Boolean(coverSrc) && !coverBroken;
  const isPaidEvent = event.pricing_type === "paid";
  const categories = event?.ticket_categories || [];
  const freeEventCategoryName = categories.length > 0 ? categories[0].name : "General Admission";

  const stats = [
    { label: "Bookings", value: event.ticket_stats?.confirmed_tickets ?? 0, icon: <Ticket className="w-5 h-5 text-rose-500" />, color: "rose" },
    { label: "Available", value: event.ticket_stats?.available_spots ?? "∞", icon: <Users className="w-5 h-5 text-emerald-500" />, color: "emerald" },
    // Only show revenue for paid events
    ...(isPaidEvent ? [{ label: "Revenue", value: `₦${(event.ticket_stats?.total_revenue ?? 0).toLocaleString()}`, icon: <CreditCard className="w-5 h-5 text-blue-500" />, color: "blue" }] : []),
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
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                {(() => {
                  const words = event.name.split(' ');
                  if (words.length === 1) {
                    return event.name;
                  }
                  // Determine which word to highlight based on word count
                  let highlightIndex;
                  if (words.length === 2) {
                    highlightIndex = 1; // Last word (2nd)
                  } else if (words.length === 3) {
                    highlightIndex = 1; // Middle word (2nd)
                  } else if (words.length === 4) {
                    highlightIndex = 2; // Third word
                  } else {
                    // For 5+ words, highlight the middle word
                    highlightIndex = Math.floor(words.length / 2);
                  }
                  return words.map((word, idx) => (
                    <span key={idx}>
                      {idx > 0 && ' '}
                      {idx === highlightIndex ? (
                        <span className="relative inline-block text-amber-400">
                          <span className="relative z-10">{word}</span>
                          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 100 40" preserveAspectRatio="none">
                            <path d="M0,20 Q25,5 50,20 Q75,35 100,20" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-300"/>
                            <path d="M0,25 Q25,10 50,25 Q75,40 100,25" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-300"/>
                            <path d="M0,15 Q25,0 50,15 Q75,30 100,15" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-300"/>
                          </svg>
                        </span>
                      ) : (
                        word
                      )}
                    </span>
                  ));
                })()}
              </h1>
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
                {event.pricing_type === "paid"
                  ? "Paid Event"
                  : "Free Event"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <button
            onClick={() => router.push(`/dashboard/org/edit-event/${event.event_id ?? event.id}`)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all active:scale-95 text-sm shadow-lg shadow-rose-600/20"
            title="Edit event details"
          >
            <Edit2 className="w-4 h-4" /> Edit Event
          </button>
          <button
            onClick={event.status === 'verified' ? () => setShowBookModal(true) : null}
            disabled={event.status !== 'verified'}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
              event.status === 'verified'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-95 cursor-pointer'
                : 'bg-emerald-600/30 text-gray-400 shadow-none cursor-not-allowed opacity-50'
            }`}
            title={event.status === 'verified' ? 'Book tickets for an attendee' : 'Event must be verified to book tickets'}
          >
            <UserPlus className="w-4 h-4" /> Book for Attendee
          </button>
          <button
            onClick={event.status === 'verified' ? handleCopyLink : null}
            disabled={event.status !== 'verified'}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-bold text-sm transition-all ${
              event.status === 'verified'
                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 active:scale-95 cursor-pointer'
                : 'bg-white/2 border-white/5 text-gray-600 cursor-not-allowed opacity-50'
            }`}
            title={event.status === 'verified' ? 'Copy Event Link' : 'Event must be verified to share link'}
          >
            <Copy className="w-4 h-4" /> {event.status === 'verified' ? 'Copy Link' : 'Not Available'}
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column - Image & Details */}
        <div className="lg:col-span-8 space-y-12">
          {/* Cover Image */}
          <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden group shadow-2xl">
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

          {/* Ticket Categories - Show "General Admission" for free events or actual categories for paid */}
          {isPaidEvent ? (
            event.ticket_categories && event.ticket_categories.length > 0 && (
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
                            <span className="text-gray-400 font-medium">Max: {category.max_tickets.toLocaleString()}</span>
                          </div>
                        )}
                        {category.max_quantity_per_booking && (
                          <div className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs">
                            <Users className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-600" />
                            <span className="text-gray-400 font-medium">Per Booking: {category.max_quantity_per_booking.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-white/5">
                  <button
                    onClick={() => router.push(`/dashboard/org/my-event/${event.event_id ?? event.id}/tickets`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 hover:text-rose-300 font-bold text-xs md:text-sm transition-all"
                    title="Manage ticket categories"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Manage Categories
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl md:rounded-[2.5rem] p-5 md:p-10 space-y-4 md:space-y-6 shadow-xl">
              <div className="flex items-center gap-2 md:gap-3">
                <Ticket className="w-5 h-5 md:w-6 md:h-6 text-rose-500" />
                <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter italic">Ticket</h2>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm md:text-lg">{freeEventCategoryName}</h3>
                    <p className="text-[10px] md:text-xs text-gray-500 font-medium">Free entry to this event</p>
                  </div>
                  <span className="text-emerald-500 font-black text-base md:text-xl">FREE</span>
                </div>
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

            <div className="space-y-3 pt-6 border-t border-white/5">
              <button 
                onClick={() => router.push(`/dashboard/org/my-event/${event.event_id ?? event.id}/analytics`)}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-all shadow-lg shadow-rose-600/20 active:scale-95 flex items-center justify-center gap-2 group"
              >
                Detailed Analytics <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              {isPaidEvent ? (
                <button 
                  onClick={() => router.push(`/dashboard/org/my-event/${event.event_id ?? event.id}/tickets`)}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" /> Manage Categories
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl bg-white/2 border border-white/5 text-gray-600 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                  <Ticket className="w-4 h-4" /> Free Event - No Categories
                </div>
              )}
            </div>
          </div>

          <div className="bg-linear-to-br from-rose-500/10 to-transparent border border-white/5 rounded-3xl p-6 text-center">
            <p className="text-xs text-gray-400 font-medium">Need help managing your event?</p>
            <p className="text-xs text-rose-500 font-bold mt-1 cursor-pointer hover:underline">Contact Support</p>
          </div>
        </div>
      </div>

      {/* Book for Attendee Modal */}
      <BookForAttendeeModal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        event={event}
        eventId={event?.event_id || event?.id || id}
        onSuccess={fetchEvent}
      />
    </div>
  );
}
