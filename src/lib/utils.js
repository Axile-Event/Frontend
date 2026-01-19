import useAuthStore from "@/store/authStore";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error) {
  if (!error) return "An unknown error occurred";

  if (typeof error === "string") return error;

  if (error.response && error.response.data) {
    const data = error.response.data;

    // Check for 'detail' (common in DRF)
    if (data.detail) return data.detail;

    // Check for 'error' key
    if (data.error) return data.error;

    // Check for 'message' key
    if (data.message) return data.message;

    // Check for field errors (arrays)
    // e.g. { email: ["Invalid email"], password: ["Too short"] }
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const firstError = data[firstKey];
      if (Array.isArray(firstError)) {
        return `${firstKey}: ${firstError[0]}`;
      }
      if (typeof firstError === "string") {
        return `${firstKey}: ${firstError}`;
      }
    }
  }

  return error.message || "Something went wrong";
}

export function getImageUrl(path) {
  if (!path) return null;

  // Handle case where path might be an object or have different property names
  let imagePath = path;
  if (typeof path === "object") {
    imagePath =
      path.url ||
      path.secure_url ||
      path.image ||
      path.event_image ||
      path.profile_image;
  }

  // Ensure we have a string
  if (typeof imagePath !== "string") return null;

  // Normalize common insecure URLs to https so they work with CSP and avoid mixed content.
  // Cloudinary supports https; some backends accidentally return http links.
  if (imagePath.startsWith("http://res.cloudinary.com/")) {
    imagePath = imagePath.replace("http://", "https://");
  }
  if (imagePath.startsWith("http://") && imagePath.includes("cloudinary.com")) {
    imagePath = imagePath.replace("http://", "https://");
  }

  // Handle Cloudinary URLs explicitly if they don't have protocol
  if (imagePath.includes("cloudinary.com") && !imagePath.startsWith("http")) {
    return `https://${imagePath}`;
  }

  // Detect Cloudinary path pattern (missing domain but has Cloudinary structure)
  // Pattern: /image/upload/... or /video/upload/... or starts with image/upload or video/upload
  if (imagePath.match(/^\/?(?:image|video)\/upload\//)) {
    // Use the Cloudinary cloud name from environment or default
    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dyup8vl0j";
    const cleanPath = imagePath.startsWith("/")
      ? imagePath.substring(1)
      : imagePath;
    return `https://res.cloudinary.com/${cloudName}/${cleanPath}`;
  }

  // If it's already a full URL, return it
  if (imagePath.startsWith("http") || imagePath.startsWith("//"))
    return imagePath;

  // Use dynamic base URL from environment or fallback
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "https://radar-ufvb.onrender.com";
  const baseUrl = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;

  // Ensure we don't have double slashes
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Formats a number as currency with proper comma separators
 * @param {number|string} value - The value to format
 * @param {boolean} includeDecimals - Whether to include decimal places (default: true)
 * @param {string} currency - Currency symbol (default: '₦')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, includeDecimals = true, currency = "₦") {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num) || num === null || num === undefined) {
    return `${currency}0`;
  }

  // Use en-US locale for consistent formatting with commas
  const formatted = num.toLocaleString("en-US", {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  });

  return `${currency}${formatted}`;
}

/**
 * Formats a number with comma separators (no currency symbol)
 * @param {number|string} value - The value to format
 * @returns {string} Formatted number string
 */
export function formatNumber(value) {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num) || num === null || num === undefined) {
    return "0";
  }

  return num.toLocaleString("en-NG");
}
