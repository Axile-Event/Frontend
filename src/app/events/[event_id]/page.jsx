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
import { Loader2, MapPin, Calendar, Clock, Ticket, Info, Share2, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "@/store/authStore";
import { getImageUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const EventDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const eventId = decodeURIComponent(params.event_id);
  const { token } = useAuthStore();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Booking state
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;

      try {
        const response = await api.get(`/events/${eventId}/details/`);
        setEvent(response.data);
        
        let cats = [];
        if (response.data.ticket_categories) {
           cats = response.data.ticket_categories;
        } else {
           try {
             // Fallback to fetch categories if not present in details response
             const catRes = await api.get(`/tickets/categories/?event_id=${eventId}`);
             cats = catRes.data.categories || [];
           } catch (err) {
             console.warn("Failed to fetch categories separately", err);
           }
        }
        setCategories(cats);

        if (cats.length > 0) {
          // Priority: Regular (if available) -> First Available -> First (fallback)
          const regular = cats.find(c => c.name.toLowerCase().includes('regular') && !c.is_sold_out);
          const firstAvailable = cats.find(c => !c.is_sold_out);
          setSelectedCategory(regular || firstAvailable || cats[0]);
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
    if (!token) {
      toast.error("Please login to book tickets");
      const callbackUrl = encodeURIComponent(`/events/${eventId}`);
      setTimeout(() => {
        router.push(`/login?callbackUrl=${callbackUrl}`);
      }, 1500);
      return;
    }

    if (quantity < 1) {
      toast.error("Please select at least one ticket");
      return;
    }

    setBookingLoading(true);
    const toastId = toast.loading("Processing booking...");

    try {
      const payload = {
        event_id: event?.event_id || event?.id || eventId,
        quantity: parseInt(quantity),
        category_name: selectedCategory ? selectedCategory.name : undefined
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 pt-24 md:pt-32">
          <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
            {/* Hero Skeleton */}
            <Skeleton className="w-full h-[200px] md:h-[400px] rounded-xl md:rounded-2xl" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Main Content Skeleton */}
              <div className="md:col-span-2 space-y-6">
                <div className="space-y-4">
                  <Skeleton className="h-8 md:h-12 w-3/4" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                </div>
              </div>

              {/* Sidebar Skeleton */}
              <div className="md:col-span-1 space-y-6">
                <Card>
                  <CardHeader className="p-4 md:p-6 space-y-2">
                     <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 space-y-4">
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 pt-24 md:pt-32">
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">

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
              <span className={`px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold shadow-lg ${event.pricing_type === 'free'
                  ? 'bg-green-500 text-white'
                  : 'bg-primary text-primary-foreground'
                }`}>
                {event.pricing_type === 'free' ? 'Free' : `₦${event.price}`}
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
                        😔 This ticket category is sold out
                      </div>
                    )}

                    {/* Category Selector */}
                    {(categories.length > 0 || event.pricing_type === 'paid') && (
                      <div className="space-y-3">
                        <Label className="text-xs md:text-sm">Ticket Category</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {/* Regular/Base Price Option */}
                          {event.pricing_type === 'paid' && (
                            <button
                              onClick={() => setSelectedCategory(null)}
                              className={`flex flex-col p-3 rounded-xl border text-left transition-all ${!selectedCategory
                                  ? "border-rose-600 bg-rose-600/5 ring-1 ring-rose-600"
                                  : "border-gray-600 bg-gray-600/5 hover:border-gray-500"
                                }`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className={`text-sm font-bold ${!selectedCategory ? "text-rose-500" : "text-white"}`}>
                                  Regular
                                </span>
                                <span className="text-xs font-bold text-white">₦{parseFloat(event.price).toLocaleString()}</span>
                              </div>
                              <p className="text-[10px] text-gray-500 line-clamp-1">Standard ticket</p>
                            </button>
                          )}
                          
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
                                <span className="text-xs font-bold text-white">₦{parseFloat(cat.price).toLocaleString()}</span>
                              </div>
                              {cat.description && <p className="text-[10px] text-gray-500 line-clamp-1">{cat.description}</p>}
                              {cat.is_sold_out && <span className="text-[10px] text-rose-500 font-bold uppercase mt-1">Sold Out</span>}
                            </button>
                          ))}
                        </div>
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
                            ? `₦${parseFloat(selectedCategory.price).toLocaleString()}`
                            : (event.pricing_type === 'free' ? 'Free' : `₦${parseFloat(event.price).toLocaleString()}`)}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-base md:text-lg">
                        <span>Total</span>
                        <span className="text-rose-500">
                          {event.pricing_type === 'free' && !selectedCategory
                            ? 'Free'
                            : `₦${(((selectedCategory ? parseFloat(selectedCategory.price) : parseFloat(event.price)) * quantity)).toLocaleString()}`}
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
                <Card className="overflow-hidden">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Share2 className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm md:text-base">Share this event</h3>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-muted px-3 py-2 rounded-md text-xs md:text-sm text-muted-foreground truncate border border-border">
                        {typeof window !== 'undefined' ? `${window.location.origin}/events/${eventId}` : ''}
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
    </div>
  );
};

export default EventDetailsPage;
