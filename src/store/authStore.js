import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      role: null,
      token: null,
      refreshToken: null,
      hydrated: false,
      isAuthenticated: false,
      login: (userData, token, refresh, role) => {
        // FIRST: Clear organizer store and user-specific data BEFORE setting new user
        if (typeof window !== 'undefined') {
          // Clear the organizer Zustand store
          localStorage.removeItem('organizer-storage');
          
          // Clear welcome flags for different users
          const welcomeFlagKeys = Object.keys(localStorage).filter(key => 
            key.startsWith('radar_org_first_welcome:')
          );
          
          welcomeFlagKeys.forEach(key => {
            const parts = key.split(':');
            // Guard against unexpected key formats (e.g., missing email segment)
            if (parts.length < 2) {
              return;
            }
            const emailInKey = parts[1];
            if (emailInKey && emailInKey.toLowerCase() !== userData.email.toLowerCase()) {
              localStorage.removeItem(key);
            }
          });
          
          // IMPORTANT: Clear PIN reminder dismissal so new users see it
          localStorage.removeItem('radar_pin_reminder_dismissed');
        }
        
        // THEN: Set new user data
        set({
          user: userData,
          token,
          refreshToken: refresh,
          role,
          isAuthenticated: true,
        });
      },
      logout: () =>
        set({
          user: null,
          role: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      setHydrated: () => set({ hydrated: true }),
      setUser: (userData) =>
        set((state) => ({
          user: { ...state.user, ...userData },
        })),
    }),
    {
      name: "auth-storage", // name of the item in the storage (e need dey unique)
      onRehydrateStorage: () => (state) => {
        state.setHydrated();
      },
    }
  )
);

export default useAuthStore;
