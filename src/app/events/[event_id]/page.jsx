import { getImageUrl } from "@/lib/utils";
import EventDetailsClient from "./EventDetailsClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://radar-ufvb.onrender.com/";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.axile.ng";

// Helper function to fetch event data server-side by event ID or slug
async function getEventById(identifier) {
  try {
    const decodedId = decodeURIComponent(identifier);
    
    // Ensure the API URL doesn't have double slashes
    const apiUrl = `${API_BASE_URL.replace(/\/$/, '')}/events/${decodedId}/details/`;
    
    const res = await fetch(apiUrl, {
      next: { revalidate: 60 },
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch event: ${res.status} ${res.statusText}`);
      return null;
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

// Helper function to get event image from various possible fields
function getEventImage(event) {
  const imageFields = [
    event?.image,
    event?.event_image,
    event?.cover_image,
    event?.banner_image,
  ];
  
  for (const imageField of imageFields) {
    if (imageField) {
      const imageUrl = getImageUrl(imageField);
      if (imageUrl) {
        // Ensure absolute URL for Open Graph
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          return imageUrl;
        }
        // If relative URL, make it absolute using SITE_URL
        return imageUrl.startsWith('/') 
          ? `${SITE_URL}${imageUrl}` 
          : `${SITE_URL}/${imageUrl}`;
      }
    }
  }
  
  return null;
}

// Generate dynamic metadata for social sharing
export async function generateMetadata({ params }) {
  try {
  const { event_id } = await params;
    const identifier = decodeURIComponent(event_id);
    const event = await getEventById(identifier);
  
  if (!event) {
    return {
      title: "Event Not Found | Axile",
      description: "The event you're looking for could not be found.",
    };
  }

    const eventName = event.name || event.event_name || "Event";
    
    // Clean and truncate description
    let description = event.description || "";
    // Remove HTML tags if present
    description = description.replace(/<[^>]*>/g, "").trim();
    // Truncate to 160 characters for meta description
    if (description.length > 160) {
      description = description.substring(0, 157) + "...";
    }
    if (!description) {
      description = `Get tickets for ${eventName} on Axile - Your event ticketing platform.`;
    }
    
  const title = `${eventName} | Axile`;
    const imageUrl = getEventImage(event);
    const eventDate = event.event_date_time || event.date || event.event_date;
  
  // Use event_slug for canonical URL if available, fallback to event_id
    const canonicalIdentifier = event.event_slug || event.event_id || identifier;
    const canonicalUrl = `${SITE_URL}/events/${encodeURIComponent(canonicalIdentifier)}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: eventName,
      description,
      type: "website",
      siteName: "Axile",
      url: canonicalUrl,
        locale: "en_US",
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
  } catch (error) {
    console.error("Error generating metadata:", error);
    // Return default metadata if generation fails
    return {
      title: "Event | Axile",
      description: "Discover and book tickets for events on Axile.",
    };
  }
}

// Server Component - renders the client component
export default async function Page({ params }) {
  const { event_id } = await params;
  const identifier = decodeURIComponent(event_id);
  const initialEvent = await getEventById(identifier);
  
  return <EventDetailsClient event_id={identifier} initialEvent={initialEvent} />;
}
