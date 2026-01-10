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
import { Loader2, MapPin, Calendar, Clock, Ticket, Info, Share2, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import PublicNavbar from "@/components/PublicNavbar";
import useAuthStore from "@/store/authStore";
import { getImageUrl } from "@/lib/utils";

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
  const [selectedSeat, setSelectedSeat] = useState(null);
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
        const [eventRes, catRes] = await Promise.all([
          api.get(`/events/${eventId}/details/`),
          api.get(`/tickets/categories/?event_id=${eventId}`)
        ]);
        setEvent(eventRes.data);
        const cats = catRes.data.categories || [];
        setCategories(cats);
        // Default to Regular if exists, or first category, or null
        if (cats.length > 0) {
          const regular = cats.find(c => c.name.toLowerCase() === 'regular');
          setSelectedCategory(regular || cats[0]);
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
      const returnUrl = encodeURIComponent(`/events/${eventId}`);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    if (event.allows_seat_selection && !selectedSeat) {
      toast.error("Please select a seat");
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
        event_id: eventId,
        quantity: parseInt(quantity),
        seat_number: selectedSeat,
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
      const errorMessage = error.response?.data?.seat_number
        ? error.response.data.seat_number[0]
        : (error.response?.data?.error || "Failed to book ticket");

      toast.error(errorMessage, { id: toastId });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)] pt-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4 pt-16">
          <Info className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Event not found</h2>
          <Button onClick={() => router.push('/events')}>Browse Events</Button>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);

  return (
    <div className="min-h-screen bg-background pb-20">
      <PublicNavbar />

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

            {/* Booking Card */}
            <div className="md:col-span-1">
              <Card className="sticky top-24">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl">Book Tickets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 pt-0 md:pt-0">
                  {/* Category Selector */}
                  {categories.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-xs md:text-sm">Ticket Category</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {categories.map((cat) => (
                          <button
                            key={cat.category_id}
                            disabled={cat.is_sold_out}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex flex-col p-3 rounded-xl border text-left transition-all ${selectedCategory?.category_id === cat.category_id
                                ? "border-rose-600 bg-rose-600/5 ring-1 ring-rose-600"
                                : "border-white/10 bg-white/5 hover:border-white/20"
                              } ${cat.is_sold_out ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-sm font-bold ${selectedCategory?.category_id === cat.category_id ? "text-rose-500" : "text-white"}`}>
                                {cat.name}
                              </span>
                              <span className="text-xs font-bold text-white">₦{cat.price}</span>
                            </div>
                            {cat.description && <p className="text-[10px] text-gray-500 line-clamp-1">{cat.description}</p>}
                            {cat.is_sold_out && <span className="text-[10px] text-rose-500 font-bold uppercase mt-1">Sold Out</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-xs md:text-sm">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={selectedCategory?.max_quantity_per_booking || 10}
                      value={quantity}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        const max = selectedCategory?.max_quantity_per_booking || 10;
                        setQuantity(Math.min(val, max));
                      }}
                      className="h-9 md:h-10 text-sm md:text-base border-white/10 bg-white/5 text-white"
                    />
                  </div>

                  {/* Seat Selection */}
                  {event.allows_seat_selection && (
                    <div className="space-y-3">
                      <Label className="text-xs md:text-sm">Select a Seat</Label>
                      {event.available_seats && event.available_seats.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-1">
                          {event.available_seats.map((seat) => (
                            <button
                              key={seat}
                              onClick={() => setSelectedSeat(seat === selectedSeat ? null : seat)}
                              className={`p-2 text-xs md:text-sm rounded-md border transition-colors ${selectedSeat === seat
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "hover:bg-secondary border-input"
                                }`}
                            >
                              {seat}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs md:text-sm text-red-500">No seats available</p>
                      )}
                      {selectedSeat && (
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Selected Seat: <span className="font-bold text-foreground">{selectedSeat}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Price Summary */}
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <div className="flex justify-between text-xs md:text-sm text-gray-400">
                      <span>Price per ticket</span>
                      <span className="text-white">
                        {selectedCategory
                          ? `₦${selectedCategory.price}`
                          : (event.pricing_type === 'free' ? 'Free' : `₦${event.price}`)}
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
                    disabled={bookingLoading || (event.allows_seat_selection && !selectedSeat)}
                  >
                    {bookingLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
