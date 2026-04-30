import apiClient from "./client";

export const createEventCoupon = async (eventId, data) => {
  // POST /events/{event_id}/coupons/
  // data: { discount_type, discount_value, coupon_code, usage_limit, expiry_date }
  // TODO: implement when backend is ready
  throw new Error("Not implemented");
};

export const getEventCoupons = async (eventId) => {
  // GET /events/{event_id}/coupons/
  // Returns: array of coupon objects
  throw new Error("Not implemented");
};

export const deleteCoupon = async (couponCode) => {
  // DELETE /coupons/{coupon_code}/
  throw new Error("Not implemented");
};
