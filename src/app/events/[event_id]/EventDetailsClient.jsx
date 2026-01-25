"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-component";
import { Loader2, MapPin, Calendar, Clock, Ticket, Info, Share2, Copy, Check, X, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import useAuthStore from "@/store/authStore";
import { getImageUrl } from "@/lib/utils";
import { EventDetailsSkeleton } from "@/components/skeletons";

const EventDetailsClient = ({ event_id, initialEvent }) => {
  const router = useRouter();
  const eventId = event_id;
  const { token, hydrated } = useAuthStore();

  const [event, setEvent] = useState(initialEvent || null);
  const [loading, setLoading] = useState(!initialEvent);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Booking state
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Set share URL on client side only to avoid hydration mismatch
  useEffect(() => {
    if (event) {
      // Use event_slug if available, fallback to event_id
      const identifier = event.event_slug || event.event_id;
      setShareUrl(`${window.location.origin}/events/${identifier}`);
    }
  }, [event]);

  const handleCopyLink = () => {
    // Use event_slug if available, fallback to event_id
    const identifier = event?.event_slug || event?.event_id || eventId;
    const link = `${window.location.origin}/events/${identifier}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      // Skip fetching if we already have initialEvent from server
      if (initialEvent) {
        // Just set up categories from initialEvent
        let cats = [];
        if (Array.isArray(initialEvent.ticket_categories)) {
          cats = initialEvent.ticket_categories;
        }
        setCategories(cats);
        
        if (cats.length > 0) {
          const active = cats.filter((c) => c?.is_active !== false);
          const regular = active.find(
            (c) => (c?.name || "").toLowerCase().includes("regular") && !c?.is_sold_out
          );
          const firstAvailable = active.find((c) => !c?.is_sold_out);
          setSelectedCategory(regular || firstAvailable || active[0] || cats[0]);
        }
        setLoading(false);
        return;
      }
      
      if (!eventId) return;

      try {
        const response = await api.get(`/events/${eventId}/details/`);
        setEvent(response.data);
        
        let cats = [];
        if (Array.isArray(response.data.ticket_categories)) {
          cats = response.data.ticket_categories;
        } else {
           try {
             const catRes = await api.get(`/tickets/categories/?event_id=${eventId}`);
             if (Array.isArray(catRes.data)) {
               cats = catRes.data;
             } else {
               cats = catRes.data?.categories || [];
             }
           } catch (err) {
             console.warn("Failed to fetch categories separately", err);
           }
        }
        setCategories(cats);

        if (cats.length > 0) {
          const active = cats.filter((c) => c?.is_active !== false);
          const regular = active.find(
            (c) => (c?.name || "").toLowerCase().includes("regular") && !c?.is_sold_out
          );
          const firstAvailable = active.find((c) => !c?.is_sold_out);
          setSelectedCategory(regular || firstAvailable || active[0] || cats[0]);
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        toast.error("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, initialEvent]);

  const handleBookTicket = async () => {
    let isAuthenticated = hydrated ? !!token : false;
    
    if (!isAuthenticated && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('auth-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          isAuthenticated = !!parsed?.state?.token;
        }
      } catch (e) {
        // ignore
      }
    }

    if (!isAuthenticated) {
      toast.error("Please login to book tickets");
      const currentPath = window.location.pathname;
      const callbackUrl = encodeURIComponent(currentPath);
      setTimeout(() => {
        router.push(`/login?callbackUrl=${callbackUrl}`);
      }, 1500);
      return;
    }

    if (quantity < 1) {
      toast.error("Please select at least one ticket");
      return;
    }

    if (!selectedCategory?.name) {
      toast.error("Please select a ticket category");
      return;
    }

    setBookingLoading(true);
    const toastId = toast.loading("Processing booking...");

    try {
      const payload = {
        event_id: event?.event_id || event?.id || eventId,
        quantity: parseInt(quantity),
        category_name: selectedCategory.name,
      };

      const response = await api.post("/tickets/book/", payload);

      if (response.data.payment_url) {
        toast.success("Redirecting to payment...", { id: toastId });
        window.location.href = response.data.payment_url;
        return;
      }

      toast.success("Ticket booked successfully!", { id: toastId });
      router.push("/dashboard/student/my-tickets");

    } catch (error) {
      console.error("Booking error:", error);
      let errorMessage = error.response?.data?.error || "Failed to book ticket";

      if (errorMessage.toLowerCase().includes("only 0 tickets remaining")) {
         errorMessage = "No more tickets available";
      }

      toast.error(errorMessage, { id: toastId });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading && !event) {
    return <EventDetailsSkeleton />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4 pt-16">
          <Info className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Event not found</h2>
          <Button onClick={() => router.push('/events')}>Browse Events</Button>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const isSoldOut = selectedCategory?.is_sold_out;

  const categoryPrices = categories
    .filter((c) => c?.is_active !== false)
    .map((c) => parseFloat(String(c?.price ?? "0")))
    .filter((n) => Number.isFinite(n) && n >= 0);
  const minCategoryPrice = categoryPrices.length ? Math.min(...categoryPrices) : 0;
  const displayEventPrice =
    typeof event?.event_price !== "undefined" && event?.event_price !== null
      ? Number(event.event_price)
      : minCategoryPrice;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 pt-24 md:pt-32">
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">

          {/* Hero Section */}
          <div 
            className="relative w-full h-[200px] md:h-[400px] rounded-xl md:rounded-2xl overflow-hidden bg-muted cursor-pointer group"
            onClick={() => event.image && setIsImageExpanded(true)}
          >
            {event.image ? (
              <>
                <img
                  src={getImageUrl(event.image)}
                  alt={event.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-md p-3 rounded-full blur-none">
                    <Maximize2 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <Calendar className="h-12 w-12 md:h-20 md:w-20 text-muted-foreground/50" />
              </div>
            )}
            <div className="absolute top-3 right-3 md:top-4 md:right-4">
              <span className={`px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold shadow-lg ${event.pricing_type === 'free'
                  ? 'bg-green-500 text-white'
                  : 'bg-primary text-primary-foreground'
                }`}>
                {event.pricing_type === 'free' ? 'Free' : `From ₦${displayEventPrice.toLocaleString()}`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-4 md:space-y-6">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold mb-2">{event.name}</h1>
                <div className="flex flex-wrap gap-3 md:gap-4 text-muted-foreground text-sm md:text-base">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span>{eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span>{eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                <h3 className="text-lg md:text-xl font-semibold">About this Event</h3>
                <div className="prose dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap text-sm md:text-base">
                  {event.description}
                </div>
              </div>
            </div>

            {/* Booking Card & Share Section */}
            <div className="md:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card className="border-gray-700">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg md:text-xl">Book Tickets</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 pt-0 md:pt-0">
                    {/* Sold Out Banner */}
                    {isSoldOut && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center animate-in fade-in zoom-in-95 duration-300">
                        😔 This ticket category is sold out
                      </div>
                    )}

                    {/* Category Selector */}
                    {categories.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-xs md:text-sm mb-2">Ticket Category</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {categories.map((cat) => (
                            <button
                              key={cat.category_id}
                              disabled={cat.is_sold_out}
                              onClick={() => setSelectedCategory(cat)}
                              className={`flex flex-col p-3 rounded-xl border text-left transition-all ${selectedCategory?.category_id === cat.category_id
                                  ? "border-rose-600 bg-rose-600/5 ring-1 ring-rose-600"
                                  : "border-gray-600 bg-gray-600/5 hover:border-gray-500"
                                } ${cat.is_sold_out ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className={`text-sm font-bold ${selectedCategory?.category_id === cat.category_id ? "text-rose-500" : "text-white"}`}>
                                  {cat.name}
                                </span>
                                <span className="text-xs font-bold text-white">₦{(parseFloat(cat.price) || 0).toLocaleString()}</span>
                              </div>
                              {cat.description && <p className="text-[12px] text-white">{cat.description}</p>}
                              {cat.is_sold_out && <span className="text-[10px] text-rose-500 font-bold uppercase mt-1">Sold Out</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {categories.length === 0 && event.pricing_type === 'paid' && (
                      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm text-center">
                        No ticket categories available yet. Please check back later.
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-xs md:text-sm text-muted-foreground">Quantity</Label>
                      <Select
                        value={quantity.toString()}
                        onValueChange={(val) => setQuantity(parseInt(val))}
                        disabled={bookingLoading}
                      >
                        <SelectTrigger className="h-10 border-gray-600 bg-gray-600/5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: event?.max_quantity_per_booking || 3 }, (_, i) => i + 1).map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? 'Ticket' : 'Tickets'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] md:text-xs text-muted-foreground/80">
                        Maximum {event?.max_quantity_per_booking || 3} tickets per booking. Each ticket gets a unique QR code.
                      </p>
                    </div>

                    {/* Price Summary */}
                    <div className="pt-4 border-t border-gray-600 space-y-2">
                      <div className="flex justify-between text-xs md:text-sm text-gray-400">
                        <span>Price per ticket</span>
                        <span className="text-white">
                          {selectedCategory
                            ? `₦${Number(selectedCategory.price).toLocaleString()}`
                            : (event.pricing_type === 'free' ? 'Free' : `From ₦${displayEventPrice.toLocaleString()}`)}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-base md:text-lg">
                        <span>Total</span>
                        <span className="text-rose-500">
                          {event.pricing_type === 'free'
                            ? 'Free'
                            : `₦${(parseFloat(String(selectedCategory?.price ?? displayEventPrice)) * quantity).toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 md:p-6 pt-0 md:pt-0">
                    <Button
                      className="w-full h-10 md:h-11 text-sm md:text-base"
                      size="lg"
                      onClick={handleBookTicket}
                      disabled={bookingLoading || isSoldOut}
                    >
                      {bookingLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : isSoldOut ? (
                        <>
                           <Ticket className="mr-2 h-4 w-4" />
                           Sold Out
                        </>
                      ) : (
                        <>
                          <Ticket className="mr-2 h-4 w-4" />
                          {event.pricing_type === 'free' ? 'Get Ticket' : 'Proceed to Payment'}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                {/* Share Section */}
                <Card className="overflow-hidden border-gray-700">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Share2 className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm md:text-base">Share this event</h3>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-muted px-3 py-2 rounded-md text-xs md:text-sm text-muted-foreground truncate border border-gray-700">
                        {shareUrl || 'Loading...'}
                      </div>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={handleCopyLink}
                        className="shrink-0"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      <AnimatePresence>
        {isImageExpanded && event.image && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-10"
            onClick={() => setIsImageExpanded(false)}
          >
            <motion.button
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-5 right-5 z-[101] p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsImageExpanded(false);
              }}
            >
              <X className="h-6 w-6 text-white" />
            </motion.button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-7xl max-h-full overflow-hidden rounded-lg md:rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getImageUrl(event.image)}
                alt={event.name}
                className="w-full h-auto max-h-[90vh] object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventDetailsClient;
