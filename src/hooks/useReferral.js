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
  const { referralCode, eventId, timestamp, setReferral, clearReferral, isExpired } =
    useReferralStore();

  // On mount: validate expiry and auto-clear if stale
  useEffect(() => {
    if (referralCode && isExpired()) {
      clearReferral();
    }
  }, [referralCode, isExpired, clearReferral]);

  return {
    referralCode: referralCode && !isExpired() ? referralCode : null,
    eventId,
    timestamp,
    setReferral,
    clearReferral,
  };
}

/**
 * Returns a valid referral code ONLY if it matches the given eventId.
 * Returns null for mismatched events, expired referrals, or no referral.
 */
export function getValidReferral(currentEventId) {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("axile-referral-storage");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const state = parsed?.state;
    if (!state?.referralCode || !state?.timestamp) return null;

    // Check expiry (7 days)
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - state.timestamp > SEVEN_DAYS_MS) return null;

    // Check event match - compare cleaned IDs
    if (state.eventId && cleanEventId(state.eventId) !== cleanEventId(currentEventId)) return null;

    return state.referralCode;
  } catch {
    return null;
  }
}

export default useReferral;
