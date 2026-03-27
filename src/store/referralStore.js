import { create } from "zustand";
import { persist } from "zustand/middleware";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const useReferralStore = create(
  persist(
    (set, get) => ({
      referralCode: null,
      eventId: null,
      timestamp: null,

      setReferral: (code, eventId) => {
        if (!code) return;
        set({
          referralCode: code,
          eventId: eventId || null,
          timestamp: Date.now(),
        });
      },

      clearReferral: () =>
        set({
          referralCode: null,
          eventId: null,
          timestamp: null,
        }),

      isExpired: () => {
        const { timestamp } = get();
        if (!timestamp) return true;
        return Date.now() - timestamp > SEVEN_DAYS_MS;
      },
    }),
    {
      name: "axile-referral-storage",
      // Auto-clear expired data on rehydration
      onRehydrateStorage: () => (state) => {
        if (state?.timestamp && Date.now() - state.timestamp > SEVEN_DAYS_MS) {
          state.clearReferral();
        }
      },
    }
  )
);

export default useReferralStore;
