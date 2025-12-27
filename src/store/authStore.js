import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null, // Add role to state
      isAuthenticated: false,
      login: (userData, token, role) =>
        set({ user: userData, token, role, isAuthenticated: true }),
      logout: () => {
        set({ user: null, token: null, role: null, isAuthenticated: false });
        localStorage.removeItem("auth-storage");
      },
    }),
    {
      name: "auth-storage", // name of the item in the storage (e need dey unique)
    }
  )
);

export default useAuthStore;
