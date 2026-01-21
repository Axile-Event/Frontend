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
import { Loader2, MapPin, Calendar, Clock, Ticket, Info, CheckCircle2, Share2, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { getImageUrl, generateEventSlug } from "@/lib/utils";
import { EventDetailsSkeleton } from "@/components/skeletons";

const EventDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  // Handle potential URL encoding
  const slug = decodeURIComponent(params.event_id);

  const [event, setEvent] = useState(null);
  const [eventId, setEventId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Booking state
  const [quantity, setQuantity] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    // Generate slug-based URL for sharing (name only)
    const eventSlug = event ? generateEventSlug(event.name) : slug;
    const link = `${window.location.origin}/events/${eventSlug}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!slug) return;
      
      try {
        let eventData = null;
        let foundEventId = null;

        // Check if slug is already an event ID (legacy support)
        if (slug.startsWith("event:") || slug.startsWith("event%3A")) {
          const decodedId = decodeURIComponent(slug);
          const response = await api.get(`/events/${decodedId}/details/`);
          eventData = response.data;
          foundEventId = decodedId;
        } else {
          // Fetch all events and find by slug match
          const allEventsRes = await api.get("/event/");
          const eventsData = Array.isArray(allEventsRes.data) 
            ? allEventsRes.data 
            : (allEventsRes.data.events || []);
          
          // Normalize the URL slug for comparison
          const normalizedSlug = slug.toLowerCase().trim();
          
          // Find event where generated slug matches the URL slug
          const matchedEvent = eventsData.find(ev => {
            const eventName = ev.name || ev.event_name;
            const eventSlug = generateEventSlug(eventName);
            return eventSlug === normalizedSlug;
          });
          
          if (matchedEvent) {
            const detailsRes = await api.get(`/events/${matchedEvent.event_id}/details/`);
            eventData = detailsRes.data;
            foundEventId = matchedEvent.event_id;
          } else {
            // Try direct lookup as fallback (in case slug IS the event ID)
            try {
              const directRes = await api.get(`/events/${slug}/details/`);
              if (directRes.data) {
                eventData = directRes.data;
                foundEventId = slug;
              }
            } catch {
              toast.error("Event not found");
              setLoading(false);
              return;
            }
          }
        }

        if (!eventData) {
          toast.error("Event not found");
          setLoading(false);
          return;
        }

        setEvent(eventData);
        setEventId(foundEventId);
        
        // Set default category if available
        if (eventData.ticket_categories && eventData.ticket_categories.length > 0) {
          const activeCategories = eventData.ticket_categories.filter(c => c.is_active && !c.is_sold_out);
          if (activeCategories.length > 0) {
            setSelectedCategory(activeCategories[0]);
          }
        } else if (eventData.ticket_categories?.length > 0) {
           // If no active/unsold categories, select the first one anyway so we can show it's sold out
           setSelectedCategory(eventData.ticket_categories[0]);
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        toast.error("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleBookTicket = async () => {
    if (quantity < 1) {
      toast.error("Please select at least one ticket");
      return;
    }

    // Migration: category_name is REQUIRED for booking
    if (!selectedCategory?.name) {
      toast.error("Please select a ticket category");
      return;
    }

    setBookingLoading(true);
    const toastId = toast.loading("Processing booking...");

    try {
      const payload = {
        event_id: event.event_id || event.id || eventId,
        quantity: parseInt(quantity),
        category_name: selectedCategory?.name,
      };

      const response = await api.post("/tickets/book/", payload);
      
      // Handle Paid Event (Redirect to Paystack)
      if (response.data.payment_url) {
        toast.success("Redirecting to payment...", { id: toastId });
        window.location.href = response.data.payment_url;
        return;
      }

      // Handle Free Event (Success)
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

  if (loading) {
    return <EventDetailsSkeleton />;
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <Info className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Event not found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const isSoldOut = selectedCategory?.is_sold_out;

  const activeCategories = Array.isArray(event.ticket_categories)
    ? event.ticket_categories.filter((c) => c?.is_active !== false)
    : [];
  const categoryPrices = activeCategories
    .map((c) => parseFloat(String(c?.price ?? "0")))
    .filter((n) => Number.isFinite(n) && n >= 0);
  const minCategoryPrice = categoryPrices.length ? Math.min(...categoryPrices) : 0;
  const displayEventPrice =
    typeof event?.event_price !== "undefined" && event?.event_price !== null
      ? Number(event.event_price)
      : minCategoryPrice;

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-20">
      {/* Hero Section */}
      <div className="relative w-full h-[200px] md:h-[400px] rounded-xl md:rounded-2xl overflow-hidden bg-muted">
        {event.image ? (
          <img 
            src={getImageUrl(event.image)} 
            alt={event.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <Calendar className="h-12 w-12 md:h-20 md:w-20 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute top-3 right-3 md:top-4 md:right-4">
          <span className={`px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold shadow-lg ${
            event.pricing_type === 'free' 
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
                <Card>
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg md:text-xl">Book Tickets</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 pt-0 md:pt-0">
                    {/* Sold Out Banner */}
                    {isSoldOut && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center animate-in fade-in zoom-in-95 duration-300">
                        😔 No more tickets available for this category
                      </div>
                    )}
                    
                    {/* Quantity Selector */}
                    <div className="space-y-2">
                      <Label className="text-xs md:text-sm text-muted-foreground">Quantity</Label>
                      <Select
                        value={quantity.toString()}
                        onValueChange={(val) => setQuantity(parseInt(val))}
                        disabled={bookingLoading}
                      >
                        <SelectTrigger className="h-10">
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

                    {/* Category Selector */}
                    {event.ticket_categories?.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-xs md:text-sm">Ticket Category</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {event.ticket_categories?.map((cat) => (
                            <button
                              key={cat.category_id}
                              type="button"
                              disabled={!cat.is_active || cat.is_sold_out}
                              onClick={() => setSelectedCategory(cat)}
                              className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                                selectedCategory?.category_id === cat.category_id
                                  ? "border-rose-600 bg-rose-600/5 ring-1 ring-rose-600"
                                  : "border-gray-600 bg-gray-600/5 hover:border-gray-500"
                              } ${(!cat.is_active || cat.is_sold_out) ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className={`text-sm font-bold ${selectedCategory?.category_id === cat.category_id ? "text-rose-500" : "text-white"}`}>
                                  {cat.name}
                                </span>
                                <span className="text-xs font-bold text-white">₦{(parseFloat(cat.price) || 0).toLocaleString()}</span>
                              </div>
                              {cat.description && <p className="text-[10px] text-muted-foreground line-clamp-2">{cat.description}</p>}
                              {cat.is_sold_out && <span className="text-[10px] text-rose-500 font-bold uppercase mt-1">Sold Out</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {!event.ticket_categories?.length && event.pricing_type === 'paid' && (
                      <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs text-center">
                        No ticket categories available yet.
                      </div>
                    )}

                    {/* Price Summary */}
                    <div className="pt-4 border-t border-gray-600 space-y-2">
                      <div className="flex justify-between text-xs md:text-sm text-gray-400">
                        <span>Price per ticket</span>
                        <span className="text-gray-200">
                          {event.pricing_type === 'free'
                            ? 'Free'
                            : selectedCategory
                              ? `₦${Number(selectedCategory.price).toLocaleString()}`
                              : `From ₦${displayEventPrice.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-base md:text-lg text-white">
                        <span>Total</span>
                        <span className="text-rose-500">
                          {event.pricing_type === 'free' 
                            ? 'Free' 
                            : `₦${(parseFloat(String(selectedCategory?.price ?? displayEventPrice)) * quantity).toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 md:p-6 pt-0 md:pt-0 flex flex-col gap-3">
                    <Button 
                      className="w-full h-11 md:h-12 text-sm md:text-base font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg hover:shadow-xl transition-all" 
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
                <Card className="border-secondary/50 shadow-lg overflow-hidden">
                  <CardContent className="p-5 md:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Share2 className="h-5 w-5 text-rose-500" />
                      <h3 className="font-bold text-sm md:text-base">Share this event</h3>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-secondary/30 px-4 py-3 rounded-xl text-xs md:text-sm text-gray-300 truncate border border-gray-600 hover:border-gray-500 transition-colors">
                        {typeof window !== 'undefined' ? `${window.location.origin}/events/${event ? generateEventSlug(event.name) : slug}` : ''}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleCopyLink}
                        className="shrink-0 border-gray-600 hover:bg-rose-500/10 hover:border-rose-500/50 transition-all"
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
  );
};

export default EventDetailsPage;
