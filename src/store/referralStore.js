import { create } from "zustand";
import { persist } from "zustand/middleware";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Utility to clean event IDs by removing 'event:' prefix if present.
 */
const cleanId = (id) => {
  if (!id) return "";
  return String(id).replace("event:", "");
};

const useReferralStore = create(
  persist(
    (set, get) => ({
      referralCode: null,
      eventId: null,
      timestamp: null,
      hydrated: false,

      setReferral: (code, eventId) => {
        if (!code) return;
        set({
          referralCode: code,
          eventId: cleanId(eventId) || null,
          timestamp: Date.now(),
        });
      },

      clearReferral: () =>
        set({
          referralCode: null,
          eventId: null,
          timestamp: null,
        }),

      setHydrated: () => set({ hydrated: true }),

      /**
       * Returns referral code if valid for the eventId and not expired.
       * Otherwise clears state and returns null.
       */
      getValidReferral: (currentEventId) => {
        const { referralCode, eventId, timestamp } = get();

        // If no code or timestamp, nothing to validate
        if (!referralCode || !timestamp) return null;

        // Check expiry (7 days)
        const isExpired = Date.now() - timestamp > SEVEN_DAYS_MS;
        if (isExpired) return null;

        // Check event match - compare cleaned IDs
        const matched = cleanId(eventId) === cleanId(currentEventId);
        if (!matched) return null;

        return referralCode;
      },

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
        state?.setHydrated?.();
        if (state?.timestamp && Date.now() - state.timestamp > SEVEN_DAYS_MS) {
          state.clearReferral();
        }
      },
    }
  )
);

export default useReferralStore;
