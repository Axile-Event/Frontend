import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (userData, token,refresh) =>
        set({ user: userData, token, refreshToken: refresh, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage", // name of the item in the storage (e need dey unique)
    }
  )
);

export default useAuthStore;
