import axios from "axios";

const api = axios.create({
  // Prefer NEXT_PUBLIC_API_URL from environment; fall back to the provided endpoint
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://radar-ufvb.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the auth token if available
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
