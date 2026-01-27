"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Calendar, Clock, Ticket, Info, Share2, Copy, Check, X, Maximize2, Plus, Minus, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import useAuthStore from "@/store/authStore";
import { getImageUrl } from "@/lib/utils";
import { EventDetailsSkeleton } from "@/components/skeletons";

// Platform fee constants
const PLATFORM_FEE = 80;
const calculatePaystackFee = (amount) => {
  if (amount <= 0) return 0;
  if (amount < 2500) {
    return Math.min(amount * 0.015, 2000);
  }
  const fee = (amount * 0.015) + 100;
  return Math.min(fee, 2000);
};

const EventDetailsClient = ({ event_id, initialEvent }) => {
  const router = useRouter();
  const eventId = event_id;
  const { token, hydrated } = useAuthStore();

  const [event, setEvent] = useState(initialEvent || null);
  const [loading, setLoading] = useState(!initialEvent);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Booking state - now tracks quantities per category
  const [categories, setCategories] = useState([]);
  const [ticketSelections, setTicketSelections] = useState({}); // { category_id: quantity }
  const [copied, setCopied] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Restore ticket selections from localStorage after login redirect
  useEffect(() => {
    if (eventId && typeof window !== 'undefined') {
      try {
        const savedSelections = localStorage.getItem(`pending_ticket_selections_${eventId}`);
        if (savedSelections) {
          const parsed = JSON.parse(savedSelections);
          // Only restore if it's recent (within 30 minutes)
          if (parsed.timestamp && (Date.now() - parsed.timestamp) < 30 * 60 * 1000) {
            setTicketSelections(parsed.selections || {});
            toast.success("Your ticket selections have been restored!");
          }
          // Clear the saved selections after restoring
          localStorage.removeItem(`pending_ticket_selections_${eventId}`);
        }
      } catch (e) {
        console.warn("Could not restore ticket selections:", e);
      }
    }
  }, [eventId]);

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
      } catch (error) {
        console.error("Error fetching event details:", error);
        toast.error("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, initialEvent]);

  // Calculate totals based on selections
  const orderSummary = useMemo(() => {
    const selectedItems = [];
    let subtotal = 0;
    let totalQuantity = 0;

    Object.entries(ticketSelections).forEach(([categoryId, qty]) => {
      if (qty > 0) {
        const category = categories.find(c => c.category_id === categoryId);
        if (category) {
          const price = parseFloat(category.price) || 0;
          const itemTotal = price * qty;
          subtotal += itemTotal;
          totalQuantity += qty;
          selectedItems.push({
            category_id: categoryId,
            name: category.name,
            price: price,
            quantity: qty,
            total: itemTotal
          });
        }
      }
    });

    const platformFee = subtotal > 0 ? PLATFORM_FEE + calculatePaystackFee(subtotal) : 0;
    const total = subtotal + platformFee;

    return { selectedItems, subtotal, platformFee, total, totalQuantity };
  }, [ticketSelections, categories]);

  // Handle quantity change for a category
  const handleQuantityChange = (categoryId, delta) => {
    const category = categories.find(c => c.category_id === categoryId);
    if (!category || category.is_sold_out) return;

    const currentQty = ticketSelections[categoryId] || 0;
    const newQty = Math.max(0, currentQty + delta);
    
    // Check max per booking
    const maxPerBooking = event?.max_quantity_per_booking || 10;
    const otherTicketsCount = orderSummary.totalQuantity - currentQty;
    const maxAllowed = Math.min(maxPerBooking - otherTicketsCount, category.available_quantity || maxPerBooking);
    
    if (newQty > maxAllowed) {
      toast.error(`Maximum ${maxAllowed} tickets available for ${category.name}`);
      return;
    }

    setTicketSelections(prev => ({
      ...prev,
      [categoryId]: newQty
    }));
  };

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
      // Save ticket selections before redirecting to login
      if (orderSummary.totalQuantity > 0) {
        const selectionsToSave = {
          selections: ticketSelections,
          timestamp: Date.now()
        };
        localStorage.setItem(`pending_ticket_selections_${eventId}`, JSON.stringify(selectionsToSave));
      }
      
      toast.error("Please login to book tickets");
      const currentPath = window.location.pathname;
      const callbackUrl = encodeURIComponent(currentPath);
      setTimeout(() => {
        router.push(`/login?callbackUrl=${callbackUrl}`);
      }, 1500);
      return;
    }

    if (orderSummary.totalQuantity < 1) {
      toast.error("Please select at least one ticket");
      return;
    }

    setBookingLoading(true);
    const toastId = toast.loading("Processing booking...");

    try {
      // Book tickets for each selected category
      // For now, we'll book the first selected category (backend may need update for multi-category)
      const firstSelection = orderSummary.selectedItems[0];
      
      const payload = {
        event_id: event?.event_id || event?.id || eventId,
        quantity: firstSelection.quantity,
        category_name: firstSelection.name,
      };

      const response = await api.post("/tickets/book/", payload);
      
      const bookingId = response.data.booking_id || response.data.id || response.data.data?.booking_id;
      const tickets = response.data.tickets || [];
      
      if (bookingId) {
        // Store booking data in localStorage for checkout page
        const bookingDataForCheckout = {
          booking_id: bookingId,
          event_name: event?.name || tickets[0]?.event_name || "Event",
          event_id: event?.event_id || event?.id || eventId,
          category_name: firstSelection.name,
          quantity: firstSelection.quantity,
          price_per_ticket: firstSelection.price,
          payment_url: response.data.payment_url,
          payment_reference: response.data.payment_reference,
          tickets: tickets,
          created_at: new Date().toISOString()
        };
        localStorage.setItem(`booking_${bookingId}`, JSON.stringify(bookingDataForCheckout));
        
        toast.success("Booking created! Redirecting to payment...", { id: toastId });
        router.push(`/checkout/payment/${bookingId}`);
        return;
      }

      // Fallback for cases where booking_id isn't directly returned but payment_url is
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
  const allSoldOut = categories.length > 0 && categories.every(c => c.is_sold_out);

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* Event Title & Info */}
              <div>
                <h1 className="text-2xl md:text-4xl font-bold mb-3">{event.name}</h1>
                <div className="flex flex-wrap gap-4 text-muted-foreground text-sm md:text-base">
                  <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full">
                    <Calendar className="h-4 w-4 text-rose-500" />
                    <span>{eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full">
                    <Clock className="h-4 w-4 text-rose-500" />
                    <span>{eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full">
                    <MapPin className="h-4 w-4 text-rose-500" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="space-y-3">
                <h2 className="text-lg md:text-xl font-semibold">About this Event</h2>
                <div className="prose dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                  {event.description}
                </div>
              </div>

              {/* Ticket Selection Section */}
              <div className="space-y-4">
                <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-rose-500" />
                  Select Tickets
                </h2>

                {/* All Sold Out Banner */}
                {allSoldOut && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center animate-in fade-in zoom-in-95 duration-300">
                    😔 All tickets are sold out for this event
                  </div>
                )}

                {/* Ticket Category Cards */}
                {categories.length > 0 && (
                  <div className="space-y-3">
                    {categories.map((cat) => {
                      const qty = ticketSelections[cat.category_id] || 0;
                      const price = parseFloat(cat.price) || 0;
                      const isCatSoldOut = cat.is_sold_out;
                      
                      return (
                        <div
                          key={cat.category_id}
                          className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                            qty > 0
                              ? "border-rose-500 bg-rose-500/5 shadow-lg shadow-rose-500/10"
                              : "border-border bg-card hover:border-border/80 hover:bg-card/80"
                          } ${isCatSoldOut ? "opacity-50 grayscale" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            {/* Category Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-bold text-base md:text-lg ${qty > 0 ? "text-rose-500" : "text-foreground"}`}>
                                  {cat.name}
                                </h3>
                                {isCatSoldOut && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 font-bold uppercase">
                                    Sold Out
                                  </span>
                                )}
                              </div>
                              <p className="text-xl md:text-2xl font-bold text-foreground">
                                {event.pricing_type === 'free' ? 'Free' : `₦${price.toLocaleString()}`}
                              </p>
                              {cat.description && (
                                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{cat.description}</p>
                              )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 bg-muted/30 rounded-full p-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-10 w-10 rounded-full transition-all ${
                                  qty > 0 
                                    ? "bg-rose-500 text-white hover:bg-rose-600" 
                                    : "hover:bg-muted"
                                }`}
                                onClick={() => handleQuantityChange(cat.category_id, -1)}
                                disabled={qty === 0 || isCatSoldOut || bookingLoading}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className={`w-8 text-center font-bold text-lg ${qty > 0 ? "text-rose-500" : "text-muted-foreground"}`}>
                                {qty}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-10 w-10 rounded-full transition-all ${
                                  qty > 0 
                                    ? "bg-rose-500 text-white hover:bg-rose-600" 
                                    : "hover:bg-muted"
                                }`}
                                onClick={() => handleQuantityChange(cat.category_id, 1)}
                                disabled={isCatSoldOut || bookingLoading}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {categories.length === 0 && event.pricing_type === 'paid' && (
                  <div className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm text-center">
                    <Info className="h-8 w-8 mx-auto mb-2 opacity-70" />
                    No ticket categories available yet. Please check back later.
                  </div>
                )}
              </div>

              {/* Share Section - Desktop */}
              <div className="hidden lg:block">
                <Card className="border-border/50 bg-card/50">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Share2 className="h-4 w-4 text-rose-500" />
                      <h3 className="font-semibold text-sm">Share this event</h3>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-muted/50 px-3 py-2 rounded-lg text-xs text-muted-foreground truncate border border-border/50">
                        {shareUrl || 'Loading...'}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleCopyLink}
                        className="shrink-0 border-border/50 hover:bg-rose-500/10 hover:border-rose-500/50"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column - Sticky Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Order Summary Card */}
                <Card className={`border-2 transition-all duration-300 ${
                  orderSummary.totalQuantity > 0 
                    ? "border-rose-500/50 bg-gradient-to-b from-rose-500/10 to-card shadow-xl shadow-rose-500/10" 
                    : "border-border/50 bg-card/80"
                }`}>
                  <CardHeader className="p-5 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShoppingCart className={`h-5 w-5 ${orderSummary.totalQuantity > 0 ? "text-rose-500" : "text-muted-foreground"}`} />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    {orderSummary.totalQuantity > 0 ? (
                      <div className="space-y-4">
                        {/* Selected Items */}
                        <div className="space-y-2">
                          {orderSummary.selectedItems.map((item) => (
                            <div key={item.category_id} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {item.name} × {item.quantity}
                              </span>
                              <span className="text-foreground font-medium">
                                ₦{item.total.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-border/50 pt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="text-foreground">₦{orderSummary.subtotal.toLocaleString()}</span>
                          </div>
                          {orderSummary.platformFee > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Platform Fee</span>
                              <span className="text-foreground">₦{Math.round(orderSummary.platformFee).toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        <div className="border-t border-border/50 pt-4">
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col items-end">
                              <span className="text-2xl font-bold text-rose-500">
                                ₦{Math.round(orderSummary.total).toLocaleString()}
                              </span>
                              {orderSummary.platformFee > 0 && (
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                  incl. ₦{Math.round(orderSummary.platformFee).toLocaleString()} booking fee
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No tickets selected</p>
                        <p className="text-xs mt-1 opacity-70">
                          <span className="hidden lg:inline">Select tickets from the left to continue</span>
                          <span className="lg:hidden">Select tickets above to continue</span>
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-5 pt-0">
                    <Button
                      className={`w-full h-12 text-base font-semibold transition-all ${
                        orderSummary.totalQuantity > 0
                          ? "bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/25"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      }`}
                      size="lg"
                      onClick={handleBookTicket}
                      disabled={bookingLoading || orderSummary.totalQuantity === 0}
                    >
                      {bookingLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : orderSummary.totalQuantity > 0 ? (
                        <>
                          <Ticket className="mr-2 h-5 w-5" />
                          {event.pricing_type === 'free' 
                            ? `Get ${orderSummary.totalQuantity} Ticket${orderSummary.totalQuantity > 1 ? 's' : ''}`
                            : `Pay ₦${Math.round(orderSummary.total).toLocaleString()}`
                          }
                        </>
                      ) : (
                        "Select Tickets"
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                {/* Share Section - Mobile */}
                <div className="lg:hidden">
                  <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Share2 className="h-4 w-4 text-rose-500" />
                        <h3 className="font-semibold text-sm">Share this event</h3>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-muted/50 px-3 py-2 rounded-lg text-xs text-muted-foreground truncate border border-border/50">
                          {shareUrl || 'Loading...'}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleCopyLink}
                          className="shrink-0 border-border/50 hover:bg-rose-500/10 hover:border-rose-500/50"
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
      </div>
      
      {/* Mobile Sticky Checkout Bar */}
      <AnimatePresence>
        {orderSummary.totalQuantity > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden p-4 bg-background/80 backdrop-blur-xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
          >
            <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {orderSummary.totalQuantity} Ticket{orderSummary.totalQuantity > 1 ? 's' : ''} Selected
                </span>
                <div className="flex flex-baseline gap-1">
                  <span className="text-xl font-bold text-rose-500">
                    ₦{Math.round(orderSummary.total).toLocaleString()}
                  </span>
                  {orderSummary.platformFee > 0 && (
                    <span className="text-[10px] text-muted-foreground font-medium self-end mb-1">
                      + ₦{Math.round(orderSummary.platformFee).toLocaleString()} booking fee
                    </span>
                  )}
                </div>
              </div>
              <Button
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-rose-600/20 active:scale-95 transition-transform"
                onClick={handleBookTicket}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Checkout</span>
                    <ShoppingCart className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
