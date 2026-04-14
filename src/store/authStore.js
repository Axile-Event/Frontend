import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

// Import token refresh timer functions (dynamic import to avoid circular dependency)
let startTokenRefreshTimer, stopTokenRefreshTimer;

// Max wait for dynamic import to complete
const MAX_IMPORT_WAIT = 5000;
let importPromise = null;

if (typeof window !== "undefined") {
  importPromise = import("../lib/axios").then((module) => {
    startTokenRefreshTimer = module.startTokenRefreshTimer;
    stopTokenRefreshTimer = module.stopTokenRefreshTimer;
    return true;
  });
}

/**
 * Ensures timer functions are available and starts the refresh timer
 */
async function ensureTimerAndStart() {
  if (startTokenRefreshTimer) {
    startTokenRefreshTimer();
    return;
  }

  // Wait for dynamic import up to MAX_IMPORT_WAIT
  if (importPromise) {
    try {
      await Promise.race([
        importPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Import timeout")), MAX_IMPORT_WAIT)
        )
      ]);
      if (startTokenRefreshTimer) {
        startTokenRefreshTimer();
      }
    } catch (e) {
      console.warn("Failed to start token refresh timer:", e);
    }
  }
}

/**
 * Get the correct cookie domain for cross-subdomain sharing.
 * Production (.axile.ng): returns ".axile.ng"
 * Dev/Vercel/localhost: returns undefined (current domain only)
 */
function getCookieDomain() {
  if (typeof window === "undefined") return undefined;
  const hostname = window.location.hostname;
  if (hostname.endsWith(".axile.ng") || hostname === "axile.ng") {
    return ".axile.ng";
  }
  return undefined;
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      token: null,
      refreshToken: null,
      hydrated: false,
      isAuthenticated: false,
      login: (userData, token, refresh, role) => {
        // Shared cookie for cross-subdomain auth
        if (typeof window !== "undefined") {
          const cookieData = { token, refreshToken: refresh, role };
          const cookieOpts = { 
            expires: 7,
            sameSite: 'Lax',
            secure: window.location.protocol === 'https:'
          };
          const domain = getCookieDomain();
          if (domain) cookieOpts.domain = domain;
          
          Cookies.set("axile_shared_auth", JSON.stringify(cookieData), cookieOpts);

          localStorage.removeItem("organizer-storage");
          localStorage.removeItem("Axile_pin_reminder_dismissed");

          const authData = {
            state: {
              user: userData,
              token,
              refreshToken: refresh,
              role,
              isAuthenticated: true,
              hydrated: true,
            },
            version: 0,
          };
          localStorage.setItem("auth-storage", JSON.stringify(authData));
        }

        set({
          user: userData,
          token,
          refreshToken: refresh,
          role,
          isAuthenticated: true,
        });

        // Use the async function to start timer
        ensureTimerAndStart();
      },
      logout: () => {
        if (typeof window !== "undefined") {
          // 1. Remove from parent domain (.axile.ng)
          const domain = getCookieDomain();
          if (domain) {
            Cookies.remove("axile_shared_auth", { domain });
          }
          // 2. Remove from current subdomain (just in case)
          Cookies.remove("axile_shared_auth", { path: '/' });
        }

        if (stopTokenRefreshTimer) {
          stopTokenRefreshTimer();
        }

        set({
          user: null,
          role: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
      setHydrated: () => set({ hydrated: true }),
      setUser: (userData) =>
        set((state) => ({
          user: { ...state.user, ...userData },
        })),
      
      // Sync state from shared cookie if localStorage is empty
      syncWithCookie: () => {
        if (typeof window === "undefined" || get().token) return;
        
        const shared = Cookies.get("axile_shared_auth");
        if (shared) {
          try {
            // Handle URL encoded cookies
            const decoded = shared.startsWith("%") ? decodeURIComponent(shared) : shared;
            const { token, refreshToken, role } = JSON.parse(decoded);
            if (token) {
              set({ token, refreshToken, role, isAuthenticated: true });
              ensureTimerAndStart();
            }
          } catch (e) {
            console.error("Failed to sync shared auth", e);
          }
        }
      }
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state.setHydrated();
        
        // Check for shared cookie on hydration
        state.syncWithCookie();
        
        // Restart refresh timer if user is authenticated
        if (state.token && state.refreshToken) {
          ensureTimerAndStart();
        }
      },
    }
  )
);

export default useAuthStore;
