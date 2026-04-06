import api from "./axios";

/**
 * Fetch referral reward types from config endpoint.
 * Returns array: [{ value: "flat", label: "Flat amount" }, ...]
 */
export async function fetchReferralRewardTypes() {
  const res = await api.get("/config/");
  return res?.data?.referral_reward_types || [
    { value: "flat", label: "Flat amount" },
    { value: "percentage", label: "Percentage" },
  ];
}

/**
 * Fetch referral stats for an event (organizer).
 * Returns all referrers for the event with their usernames and stats.
 * Uses POST /organiser/{event_id}/referral-stats/ with empty referrals array.
 * @param {string} eventId
 * @param {Array} referrals - Optional array of {username: string} to filter results
 */
export async function getReferralStats(eventId, usernames = []) {
  // USER UPDATED FORMAT: Use "event:EV-XXXXX" directly in path (no re-encoding)
  const cleanId = decodeURIComponent(eventId);
  
  const url = `/organizer/${cleanId}/referral-stats/`;
  
  const body = {
    referrals: usernames.map(u => typeof u === 'string' ? { username: u } : u)
  };

  try {
    const res = await api.post(url, body);
    return res?.data;
  } catch (err) {
    throw err;
  }
}

// Alias for backwards compatibility or alternative naming
export const fetchReferralStats = getReferralStats;

/**
 * Build referral FormData fields for event create/update.
 * Appends to existing FormData instance.
 * @param {FormData} formData
 * @param {Object} referralConfig
 */
export function appendReferralFields(formData, referralConfig) {
  const { use_referral, referral_reward_type, referral_reward_amount, referral_reward_percentage } = referralConfig;

  formData.append("use_referral", use_referral ? "true" : "false");

  if (!use_referral) return;

  // Always append these fields if use_referral is true to satisfy backend 'required' rules
  formData.append("referral_reward_type", referral_reward_type || "flat");
  
  // Send the appropriate value or 0 if not the active type
  const amount = (referral_reward_type === "flat" && referral_reward_amount) ? referral_reward_amount : "0";
  const percentage = (referral_reward_type === "percentage" && referral_reward_percentage) ? referral_reward_percentage : "0";

  formData.append("referral_reward_amount", String(amount));
  formData.append("referral_reward_percentage", String(percentage));
}

/**
 * Validate referral config fields.
 * @param {Object} referralConfig
 * @param {string} pricingType - "free" | "paid"
 * @param {Array} categories - ticket categories (for flat validation)
 * @returns {Object} errors object - empty if valid
 */
export function validateReferralConfig(referralConfig, pricingType, categories = []) {
  const errors = {};

  if (!referralConfig.use_referral) return errors;

  if (pricingType === "free") {
    errors.referral = "Referral rewards cannot be enabled for free events";
    return errors;
  }

  if (!referralConfig.referral_reward_type) {
    errors.referral_reward_type = "Reward type is required";
    return errors;
  }

  if (referralConfig.referral_reward_type === "flat") {
    const amount = parseFloat(referralConfig.referral_reward_amount);
    if (isNaN(amount) || amount <= 0) {
      errors.referral_reward_amount = "Reward amount must be greater than 0";
    } else {
      // Validate flat amount doesn't exceed lowest ticket price
      const prices = categories
        .filter((c) => (c?.name || "").trim())
        .map((c) => Number(String(c?.price ?? "").replace(/,/g, "")))
        .filter((n) => Number.isFinite(n) && n > 0);

      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        if (amount > minPrice) {
          errors.referral_reward_amount = `Amount cannot exceed lowest ticket price (₦${minPrice.toLocaleString()})`;
        }
      }
    }
  }

  if (referralConfig.referral_reward_type === "percentage") {
    const pct = parseFloat(referralConfig.referral_reward_percentage);
    if (isNaN(pct) || pct <= 0) {
      errors.referral_reward_percentage = "Percentage must be greater than 0";
    } else if (pct > 100) {
      errors.referral_reward_percentage = "Percentage cannot exceed 100";
    }
  }

  return errors;
}
