"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import { getImageUrl } from "@/lib/utils";

const EventDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  // Handle potential URL encoding of the ID
  const eventId = decodeURIComponent(params.event_id);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Booking state
  const [quantity, setQuantity] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/events/${eventId}`;
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
        // Set default category if available
        if (response.data.ticket_categories && response.data.ticket_categories.length > 0) {
          const activeCategories = response.data.ticket_categories.filter(c => c.is_active && !c.is_sold_out);
          if (activeCategories.length > 0) {
            setSelectedCategory(activeCategories[0]);
          }
        } else if (response.data.ticket_categories?.length > 0) {
           // If no active/unsold categories, select the first one anyway so we can show it's sold out
           setSelectedCategory(response.data.ticket_categories[0]);
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
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
                        😔 No more tickets available for this category
                      </div>
                    )}
                    
                    {/* Quantity Selector - RESTRICTED TO 1 */}
                    <div className="space-y-2">
                      <Label className="text-xs md:text-sm text-muted-foreground">Quantity</Label>
                      <div className="h-9 md:h-10 w-full flex items-center px-3 border rounded-md bg-muted/50 text-muted-foreground text-sm md:text-base cursor-not-allowed">
                        1 Ticket (Maximum per transaction)
                      </div>
                      <p className="text-[10px] md:text-xs text-muted-foreground/80 italic">
                        💡 Need more tickets? You can make another booking after this one.
                      </p>
                    </div>

                    {/* Category Selector */}
                    {event.ticket_categories && event.ticket_categories.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-xs md:text-sm">Ticket Category</Label>
                        <Select 
                          value={selectedCategory?.name || ""} 
                          onValueChange={(val) => {
                            const cat = event.ticket_categories.find(c => c.name === val);
                            setSelectedCategory(cat);
                          }}
                        >
                          <SelectTrigger id="category" className="h-9 md:h-10 text-sm md:text-base w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {event.ticket_categories.map((cat) => (
                              <SelectItem 
                                key={cat.category_id} 
                                value={cat.name}
                                disabled={!cat.is_active || cat.is_sold_out}
                              >
                                {cat.name} - ₦{parseFloat(cat.price).toLocaleString()} {cat.is_sold_out ? "(Sold Out)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedCategory?.description && (
                          <p className="text-[10px] md:text-xs text-muted-foreground italic">
                            {selectedCategory.description}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Price Summary */}
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between text-xs md:text-sm">
                        <span>Price per ticket</span>
                        <span>{event.pricing_type === 'free' ? 'Free' : `₦${event.price}`}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base md:text-lg">
                        <span>Total</span>
                        <span>
                          {event.pricing_type === 'free' 
                            ? 'Free' 
                            : `₦${((selectedCategory ? parseFloat(selectedCategory.price) : event.price) * quantity).toLocaleString()}`}
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
  );
};

export default EventDetailsPage;
