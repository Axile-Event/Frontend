// lib/axios.ts
import axios from "axios";
import useAuthStore from "../store/authStore";

const api = axios.create({
  // Prefer NEXT_PUBLIC_API_URL from environment; fall back to the provided endpoint
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "https://radar-ufvb.onrender.com/",
  headers: {
    "Content-Type": "application/json", // Axios will override if FormData is used
  },
});

// --------------------
// Automatic Token Refresh (Proactive)
// --------------------
let refreshInterval = null;

function startTokenRefreshTimer() {
  // Clear any existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  // Refresh token every 14 minutes (before 15min expiration)
  const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes in milliseconds

  refreshInterval = setInterval(async () => {
    const refreshToken = getRefreshToken();
    const token = getToken();

    // Only refresh if user is logged in
    if (!refreshToken || !token) {
      clearInterval(refreshInterval);
      return;
    }

    try {
      const refreshUrl = `${api.defaults.baseURL?.replace(
        /\/$/,
        ""
      )}/token/refresh/`;
      const res = await axios.post(refreshUrl, { refresh: refreshToken });
      const newAccess = res?.data?.access;

      if (newAccess) {
        // Update token in localStorage
        const raw = localStorage.getItem("auth-storage");
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.state.token = newAccess;
          localStorage.setItem("auth-storage", JSON.stringify(parsed));
        }

        // Update default header
        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;

        console.log("✅ Token auto-refreshed successfully");
      }
    } catch (err) {
      console.error("❌ Auto-refresh failed:", err);
      // If refresh fails, user will get logged out on next API call
      clearInterval(refreshInterval);
    }
  }, REFRESH_INTERVAL);
}

function stopTokenRefreshTimer() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

// Start timer when module loads (if user is already logged in)
if (typeof window !== "undefined") {
  const token = getToken();
  const refreshToken = getRefreshToken();
  if (token && refreshToken) {
    startTokenRefreshTimer();
  }
}

// --------------------
// Helper functions
// --------------------
function getToken() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch (err) {
    console.error("Failed to read access token", err);
    return null;
  }
}

function getRefreshToken() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.refreshToken ?? null;
  } catch (err) {
    console.error("Failed to read refresh token", err);
    return null;
  }
}

function isTokenNotValidResponse(response) {
  const detail = response?.data?.detail;
  const code = response?.data?.code;
  return (
    response?.status === 401 &&
    (detail === "Given token not valid for any token type" ||
      code === "token_not_valid")
  );
}

// --------------------
// Request interceptor
// --------------------
api.interceptors.request.use(
  (config) => {
    // If sending FormData, don't force a JSON/multipart content-type.
    // The browser will set the correct multipart boundary.
    if (typeof FormData !== "undefined" && config?.data instanceof FormData) {
      const headers = config.headers;
      if (headers) {
        // Axios v1 may use AxiosHeaders (has .delete/.set).
        if (typeof headers.delete === "function") {
          headers.delete("Content-Type");
          headers.delete("content-type");
        }
        if (typeof headers.set === "function") {
          // Ensure nothing re-adds it later in the pipeline.
          headers.set("Content-Type", undefined);
          headers.set("content-type", undefined);
        }

        // Also handle plain object headers.
        try {
          delete headers["Content-Type"];
          delete headers["content-type"];
        } catch {
          // ignore
        }
      }
    }

    const token = getToken();
    // Do not attach token for auth endpoints
    const isAuthEndpoint =
      config.url?.includes("/login/") ||
      config.url?.includes("/signup/") ||
      config.url?.includes("/token/refresh/");

    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --------------------
// Response interceptor (refresh token handling)
// --------------------
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh the token FIRST (don't immediately logout on token_not_valid)
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      const refreshUrl = `${api.defaults.baseURL?.replace(
        /\/$/,
        ""
      )}/token/refresh/`;

      return new Promise((resolve, reject) => {
        axios
          .post(refreshUrl, { refresh: refreshToken })
          .then((res) => {
            const newAccess = res?.data?.access;
            if (!newAccess)
              throw new Error("No access token in refresh response");

            // Persist new token in local storage
            try {
              const raw = localStorage.getItem("auth-storage");
              if (raw) {
                const parsed = JSON.parse(raw);
                parsed.state.token = newAccess;
                localStorage.setItem("auth-storage", JSON.stringify(parsed));
              }
            } catch {}

            // Update default header for future requests
            api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;

            // Process queued requests
            processQueue(null, newAccess);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            resolve(api(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);

            // ONLY logout if refresh token itself is invalid
            if (isTokenNotValidResponse(err?.response)) {
              useAuthStore.getState().logout();
              localStorage.removeItem("auth-storage");

              // Define public paths that shouldn't force a redirect to login
              const publicPaths = [
                "/",
                "/events",
                "/login",
                "/signup",
                "/verify-otp",
              ];
              const currentPath =
                typeof window !== "undefined" ? window.location.pathname : "";
              const isPublicPath =
                publicPaths.includes(currentPath) ||
                currentPath.startsWith("/events/");

              if (typeof window !== "undefined" && !isPublicPath) {
                window.location.href = "/login";
              }
            }

            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

// Export functions to control token refresh timer
export { startTokenRefreshTimer, stopTokenRefreshTimer };
export default api;
