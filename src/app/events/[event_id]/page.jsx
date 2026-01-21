import { getImageUrl, generateEventSlug } from "@/lib/utils";
import EventDetailsClient from "./EventDetailsClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://radar-ufvb.onrender.com/";

// Helper function to fetch event data server-side
async function getEventBySlug(slug) {
  try {
    // Check if slug is already an event ID (legacy support)
    if (slug.startsWith("event:") || slug.startsWith("event%3A")) {
      const decodedId = decodeURIComponent(slug);
      const res = await fetch(`${API_BASE_URL}events/${decodedId}/details/`, {
        next: { revalidate: 60 }, // Cache for 60 seconds
      });
      if (!res.ok) return null;
      return await res.json();
    }

    // Fetch all events and find by slug match
    const allEventsRes = await fetch(`${API_BASE_URL}event/`, {
      next: { revalidate: 60 },
    });
    
    if (!allEventsRes.ok) return null;
    
    const allEventsData = await allEventsRes.json();
    const eventsData = Array.isArray(allEventsData) 
      ? allEventsData 
      : (allEventsData.events || []);
    
    // Normalize the URL slug for comparison (uppercase for initials)
    const normalizedSlug = slug.toUpperCase().trim();
    
    // Find event where generated slug (initials) matches the URL slug
    const matchedEvent = eventsData.find(ev => {
      const eventName = ev.name || ev.event_name;
      const eventSlug = generateEventSlug(eventName);
      return eventSlug === normalizedSlug;
    });
    
    if (matchedEvent) {
      // Fetch full details using the event ID
      const detailsRes = await fetch(`${API_BASE_URL}events/${matchedEvent.event_id}/details/`, {
        next: { revalidate: 60 },
      });
      if (!detailsRes.ok) return null;
      return await detailsRes.json();
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching event for metadata:", error);
    return null;
  }
}

// Generate dynamic metadata for social sharing
export async function generateMetadata({ params }) {
  const { event_id } = await params;
  const slug = decodeURIComponent(event_id);
  const event = await getEventBySlug(slug);
  
  if (!event) {
    return {
      title: "Event Not Found | Axile",
      description: "The event you're looking for could not be found.",
    };
  }

  const title = `${event.name} | Axile`;
  const description = event.description 
    ? event.description.substring(0, 160) + (event.description.length > 160 ? "..." : "")
    : `Get tickets for ${event.name} on Axile - Your event ticketing platform.`;
  const imageUrl = event.image ? getImageUrl(event.image) : null;
  const eventDate = event.event_date_time || event.date;
  const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : null;

  return {
    title,
    description,
    openGraph: {
      title: event.name,
      description,
      type: "website",
      siteName: "Axile",
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: event.name,
          },
        ],
      }),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: event.name,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
    other: {
      ...(event.location && { "og:locality": event.location }),
      ...(formattedDate && { "event:start_time": eventDate }),
    },
  };
}

// Server Component - renders the client component
export default async function Page({ params }) {
  const { event_id } = await params;
  const slug = decodeURIComponent(event_id);
  const initialEvent = await getEventBySlug(slug);
  
  // Pass the event_id (slug) and initialEvent to the client component
  return <EventDetailsClient event_id={initialEvent?.event_id || slug} initialEvent={initialEvent} />;
}
