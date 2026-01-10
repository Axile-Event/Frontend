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
      login: (userData, token, refresh, role) =>
        set({
          user: userData,
          token,
          refreshToken: refresh,
          role,
          isAuthenticated: true,
        }),
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
