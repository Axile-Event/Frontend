/**
 * Utility functions for generating dynamic metadata for pages
 */

/**
 * Generate metadata for event detail pages
 * @param {Object} event - Event object from API
 * @returns {Object} Next.js metadata object
 */
export function generateEventMetadata(event) {
  if (!event) {
    return {
      title: "Event Not Found",
      description: "The event you're looking for could not be found.",
    };
  }

  const eventDate = new Date(event.event_date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const description = event.event_description
    ? `${event.event_description.substring(0, 150)}...`
    : `Join us for ${event.event_name} on ${eventDate} at ${
        event.event_location
      }. ${
        event.pricing_type === "free"
          ? "Free entry!"
          : `Tickets from ₦${event.event_price}`
      }`;

  return {
    title: event.event_name,
    description,
    openGraph: {
      title: event.event_name,
      description,
      type: "website",
      images: event.event_image
        ? [
            {
              url: event.event_image.startsWith("http")
                ? event.event_image
                : `https://radar-ufvb.onrender.com${event.event_image}`,
              width: 1200,
              height: 630,
              alt: event.event_name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: event.event_name,
      description,
      images: event.event_image
        ? [
            event.event_image.startsWith("http")
              ? event.event_image
              : `https://radar-ufvb.onrender.com${event.event_image}`,
          ]
        : [],
    },
  };
}

/**
 * Generate metadata for user dashboard pages
 * @param {string} role - User role (student, organizer, admin)
 * @param {string} page - Page name
 * @returns {Object} Next.js metadata object
 */
export function generateDashboardMetadata(role, page = "Dashboard") {
  const roleMap = {
    student: "Student",
    org: "Organizer",
    organizer: "Organizer",
    admin: "Admin",
  };

  const roleName = roleMap[role] || "User";

  return {
    title: `${page} - ${roleName}`,
    description: `${roleName} dashboard for managing your TreEvents account and ${
      role === "org" || role === "organizer" ? "events" : "tickets"
    }.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

/**
 * Generate metadata for authentication pages
 * @param {string} page - Page name (login, signup, etc.)
 * @returns {Object} Next.js metadata object
 */
export function generateAuthMetadata(page) {
  const pageMap = {
    login: {
      title: "Login",
      description:
        "Sign in to your TreEvents account to manage events and tickets.",
    },
    signup: {
      title: "Sign Up",
      description:
        "Create your TreEvents account to start discovering and booking events.",
    },
    "verify-otp": {
      title: "Verify OTP",
      description: "Verify your one-time password to complete registration.",
    },
  };

  return (
    pageMap[page] || {
      title: page,
      description: "TreEvents Event Ticketing Platform",
    }
  );
}
