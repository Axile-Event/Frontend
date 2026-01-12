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

  // Handle Cloudinary URLs explicitly if they don't have protocol
  if (imagePath.includes("cloudinary.com") && !imagePath.startsWith("http")) {
    return `https://${imagePath}`;
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
