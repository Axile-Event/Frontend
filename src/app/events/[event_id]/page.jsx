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
import { getImageUrl, generateEventSlug } from "@/lib/utils";
import { EventDetailsSkeleton } from "@/components/skeletons";

const EventDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = decodeURIComponent(params.event_id);
  const { token, hydrated } = useAuthStore();

  const [event, setEvent] = useState(null);
  const [eventId, setEventId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Booking state
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quantity, setQuantity] = useState(1);
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
            // Fetch full details using the event ID
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
        
        let cats = [];
        if (Array.isArray(eventData?.ticket_categories)) {
          cats = eventData.ticket_categories;
        } else {
           try {
             // Fallback to fetch categories if not present in details response
             const catRes = await api.get(`/tickets/categories/?event_id=${foundEventId}`);
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
  }, [slug]);

  const handleBookTicket = async () => {
    // Check Zustand token first (if hydrated), then fallback to localStorage directly
    // This handles the race condition where Zustand hasn't hydrated yet after signup
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

    // Migration: category_name is REQUIRED for booking
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

  if (loading) {
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

  const title = `${event.name} | Axile`;
  const description = event.description || "Discover and book tickets for the hottest events.";
  const imageUrl = getImageUrl(event.image);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function Page({ params }) {
  const eventId = decodeURIComponent(params.event_id);
  const initialEvent = await getEvent(eventId);

  return <EventDetailsClient event_id={eventId} initialEvent={initialEvent} />;
}
