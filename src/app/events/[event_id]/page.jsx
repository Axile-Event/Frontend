import { getImageUrl } from "@/lib/utils";
import EventDetailsClient from "./EventDetailsClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://radar-ufvb.onrender.com/";

// Helper function to fetch event data server-side by event ID
async function getEventById(eventId) {
  try {
    const decodedId = decodeURIComponent(eventId);
    
    const res = await fetch(`${API_BASE_URL}events/${decodedId}/details/`, {
      next: { revalidate: 60 },
    });
    
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

// Generate dynamic metadata for social sharing
export async function generateMetadata({ params }) {
  const { event_id } = await params;
  const eventId = decodeURIComponent(event_id);
  const event = await getEventById(eventId);
  
  if (!event) {
    return {
      title: "Event Not Found | Axile",
      description: "The event you're looking for could not be found.",
    };
  }

  const eventName = event.name || event.event_name;
  const title = `${eventName} | Axile`;
  const description = event.description 
    ? event.description.substring(0, 160) + (event.description.length > 160 ? "..." : "")
    : `Get tickets for ${eventName} on Axile - Your event ticketing platform.`;
  const imageUrl = event.image ? getImageUrl(event.image) : null;
  const eventDate = event.event_date_time || event.date;

  return {
    title,
    description,
    openGraph: {
      title: eventName,
      description,
      type: "website",
      siteName: "Axile",
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: eventName,
          },
        ],
      }),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: eventName,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
    other: {
      ...(event.location && { "og:locality": event.location }),
      ...(eventDate && { "event:start_time": eventDate }),
    },
  };
}

// Server Component - renders the client component
export default async function Page({ params }) {
  const { event_id } = await params;
  const eventId = decodeURIComponent(event_id);
  const initialEvent = await getEventById(eventId);
  
  return <EventDetailsClient event_id={eventId} initialEvent={initialEvent} />;
}
