"use client";

import { useEffect } from "react";
import useReferralStore from "@/store/referralStore";

/**
 * Utility to clean event IDs by removing 'event:' prefix if present.
 */
export const cleanEventId = (id) => {
  if (!id) return "";
  return String(id).replace("event:", "");
};

/**
 * Hook to manage referral state.
 * Handles hydration, expiry validation, and Zustand sync.
 */
export function useReferral() {
  const {
    referralCode,
    setReferral,
    getValidReferral,
    clearReferral,
    isExpired
  } = useReferralStore();

  // On mount: validate expiry and auto-clear if stale
  useEffect(() => {
    // Note: referralStore uses persist middleware which rehydrates automatically.
    // We run an explicit check on mount to ensure stale data is cleared.
    if (referralCode && isExpired()) {
      clearReferral();
    }
  }, [referralCode, isExpired, clearReferral]);

  return {
    referralCode, // Added for UI checks like the banner
    setReferral,
    getValidReferral,
    clearReferral,
  };
}

export default useReferral;
