import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

// Import token refresh timer functions (dynamic import to avoid circular dependency)
let startTokenRefreshTimer, stopTokenRefreshTimer;
if (typeof window !== "undefined") {
  import("../lib/axios").then((module) => {
    startTokenRefreshTimer = module.startTokenRefreshTimer;
    stopTokenRefreshTimer = module.stopTokenRefreshTimer;
  });
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

        if (startTokenRefreshTimer) {
          startTokenRefreshTimer();
        }
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
              if (startTokenRefreshTimer) startTokenRefreshTimer();
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
      },
    }
  )
);

export default useAuthStore;
