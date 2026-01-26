"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import toast from "react-hot-toast";

// Custom Components
import PaymentSummary from "@/components/payment/PaymentSummary";
import PaymentTabs from "@/components/payment/PaymentTabs";
import PaystackTab from "@/components/payment/PaystackTab";
import ManualTransferTab from "@/components/payment/ManualTransferTab";

// Platform service fee (charged to customer)
const PLATFORM_FEE = 80;

// Paystack fee calculation helper
// 1.5% + ₦100, fee waived under ₦2500, capped at ₦2000
const calculatePaystackFee = (amount) => {
  if (amount < 2500) {
    // Fee waived for transactions under ₦2500
    return Math.min(amount * 0.015, 2000);
  }
  const fee = (amount * 0.015) + 100;
  return Math.min(fee, 2000); // Cap at ₦2000
};

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const { booking_id } = useParams();
  
  const [activeTab, setActiveTab] = useState("paystack");
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingData = async () => {
      if (!booking_id) {
        setError("No booking ID provided");
        setLoading(false);
        return;
      }

      // Decode the booking_id in case it's URL encoded
      const decodedBookingId = decodeURIComponent(booking_id);

      try {
        // Try to get from localStorage (stored during booking)
        // Check both encoded and decoded versions
        let storedBooking = localStorage.getItem(`booking_${decodedBookingId}`);
        if (!storedBooking) {
          storedBooking = localStorage.getItem(`booking_${booking_id}`);
        }
        
        if (storedBooking) {
          const parsed = JSON.parse(storedBooking);
          const quantity = parsed.quantity || 1;
          const pricePerTicket = parseFloat(parsed.price_per_ticket || 0);
          const subtotal = pricePerTicket * quantity;
          const serviceFee = subtotal > 0 ? PLATFORM_FEE : 0; // ₦80 service fee for paid tickets
          const paystackFee = calculatePaystackFee(subtotal); // Calculate on subtotal only
          const platformFee = serviceFee + paystackFee; // Combined: ₦80 + Paystack fee
          const total = subtotal + platformFee;

          setBookingData({
            booking_id: parsed.booking_id,
            ticketNumber: parsed.booking_id?.replace('booking:', '') || decodedBookingId.replace('booking:', ''),
            event_name: parsed.event_name,
            category_name: parsed.category_name,
            quantity: quantity,
            price_per_ticket: pricePerTicket,
            subtotal: subtotal,
            platformFee: platformFee,
            total: total,
            payment_url: parsed.payment_url,
            payment_reference: parsed.payment_reference
          });
          setLoading(false);
          return;
        }

        // No localStorage data found - show error with helpful message
        // The booking data should have been stored when the user initiated the booking
        setError("Booking session expired or not found. Please go back to the event page and try booking again.");
        setLoading(false);
      } catch (err) {
        console.error("Error loading booking:", err);
        setError("Unable to load booking details. Please try booking again from the event page.");
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [booking_id]);

  const handlePayWithPaystack = async () => {
    if (!bookingData) return;

    setPaymentLoading(true);

    try {
      // If we already have a payment_url, redirect directly
      if (bookingData.payment_url) {
        window.location.href = bookingData.payment_url;
        return;
      }

      // Otherwise, initialize payment
      const response = await api.post('/tickets/initialize-payment/', { 
        booking_id: booking_id 
      });
      
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error(error.response?.data?.error || "Failed to initialize payment. Please try again.");
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-rose-500 animate-spin mx-auto" />
          <p className="text-muted-foreground">Preparing your checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold">Unable to Load Booking</h2>
          <p className="text-muted-foreground">{error}</p>
          <div className="flex gap-3 justify-center pt-4">
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
            <Button onClick={() => router.push("/events")}>
              Browse Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-24 md:pt-32">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="rounded-full"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Complete Payment</h1>
              <p className="text-sm text-muted-foreground">
                {bookingData?.event_name} • {bookingData?.quantity} ticket{bookingData?.quantity > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Transaction Summary */}
          <PaymentSummary summary={bookingData} />

          {/* Tab Selection */}
          <div className="space-y-6">
            <PaymentTabs activeTab={activeTab} onChange={setActiveTab} />
            
            <div className="mt-4">
              {activeTab === "paystack" ? (
                <PaystackTab 
                  summary={bookingData} 
                  onPay={handlePayWithPaystack}
                  loading={paymentLoading}
                />
              ) : (
                <ManualTransferTab 
                  summary={bookingData} 
                />
              )}
            </div>
          </div>

          {/* Footer Info */}
          <p className="text-center text-xs text-muted-foreground px-8">
            All transactions are secure and encrypted. Need help? 
            <button className="text-primary ml-1 hover:underline">Contact Support</button>
          </p>

        </div>
      </div>
    </div>
  );
}
