import apiClient from "../axios";

export const validateCoupon = async (couponCode, eventId, items) => { 
  const response = await apiClient.post("/coupons/validate/", {
    coupon_code: couponCode,
    event_id: eventId,
    ticket_items: items,
  });
  return response.data;
};
