import { create } from "zustand";
import { persist } from "zustand/middleware";

const useTempBookingStore = create(
  persist(
    (set) => ({
      bookingId: null,
      hydrated: false,
      
      setBookingId: (id) => set({ bookingId: id }),
      
      clearBookingId: () => set({ bookingId: null }),
      
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "temp-booking-storage", // Unique name for local storage
      onRehydrateStorage: () => (state) => {
        state.setHydrated();
      },
    }
  )
);

export default useTempBookingStore;
