import apiClient from "./client";

/**
 * ORGANIZER ENDPOINTS
 */

// Create a coupon for an event (organizer only)
export const createEventCoupon = async (eventId, data) => {
  const response = await apiClient.post("/tickets/organizer/coupons/", {
    event_id: eventId,
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    category_id: data.category_id || null,
    starts_at: data.starts_at || null,
    ends_at: data.ends_at || null,
    max_redemptions: data.max_redemptions || null,
  });
  return response.data;
};

// List coupons for an event (organizer only)
export const getEventCoupons = async (eventId) => {
  const response = await apiClient.get(
    `/tickets/organizer/coupons/?event_id=${eventId}`
  );
  return response.data; // { coupons: [], count: number }
};

/**
 * ATTENDEE ENDPOINTS
 */

// Validate a coupon (attendee side)
export const validateCoupon = async (code, eventId) => {
  const response = await apiClient.post("/tickets/coupons/validate/", {
    code,
    event_id: eventId,
  });
  return response.data;
};
