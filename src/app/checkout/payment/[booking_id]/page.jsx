"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle, Ticket, ShieldCheck, Zap, CheckCircle2 } from "lucide-react";
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
          
          // Handle multi-category bookings (new format with items array)
          let subtotal = 0;
          let totalQuantity = 0;
          let items = [];
          
          if (parsed.items && Array.isArray(parsed.items)) {
            // New format: multiple categories
            items = parsed.items;
            subtotal = parsed.subtotal || items.reduce((sum, item) => sum + (item.total || item.price * item.quantity), 0);
            totalQuantity = parsed.total_quantity || items.reduce((sum, item) => sum + item.quantity, 0);
          } else {
            // Legacy format: single category
            const quantity = parsed.quantity || 1;
            const pricePerTicket = parseFloat(parsed.price_per_ticket || 0);
            subtotal = pricePerTicket * quantity;
            totalQuantity = quantity;
            items = [{
              name: parsed.category_name,
              price: pricePerTicket,
              quantity: quantity,
              total: subtotal
            }];
          }
          
          const serviceFee = subtotal > 0 ? PLATFORM_FEE : 0; // ₦80 service fee for paid tickets
          // Paystack calculates fee on the total amount INCLUDING platform service fee
          const paystackFee = calculatePaystackFee(subtotal + serviceFee);
          const platformFee = serviceFee + paystackFee; // Combined: ₦80 + Paystack fee
          const total = subtotal + platformFee;

          setBookingData({
            booking_id: parsed.booking_id,
            ticketNumber: parsed.booking_id?.replace('booking:', '') || decodedBookingId.replace('booking:', ''),
            event_name: parsed.event_name,
            items: items, // Array of categories
            quantity: totalQuantity,
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
    <div className="min-h-screen bg-background">
      {/* Sticky Checkout Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Back</span>
            </button>
            
            {/* Checkout indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShieldCheck size={14} />
              <span className="hidden sm:inline">Secure Checkout</span>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</p>
              <p className="font-bold text-rose-500">₦{bookingData?.total?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Page Title - Desktop */}
          <div className="hidden md:block mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Secure your tickets</h1>
                <p className="text-sm text-muted-foreground">
                  {bookingData?.event_name}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile: Compact Event Info */}
          <div className="md:hidden mb-4">
            <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                <Ticket className="w-5 h-5 text-rose-500" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{bookingData?.event_name}</p>
                <p className="text-xs text-muted-foreground">
                  {bookingData?.quantity}x {bookingData?.category_name}
                </p>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8">
            {/* Left: Payment Options (wider) */}
            <div className="lg:col-span-3 space-y-3 md:space-y-4">
              <PaymentTabs activeTab={activeTab} onChange={setActiveTab} />
              
              <div>
                {activeTab === "paystack" ? (
                  <PaystackTab 
                    summary={bookingData} 
                    onPay={handlePayWithPaystack}
                    loading={paymentLoading}
                  />
                ) : (
                  <ManualTransferTab 
                    summary={bookingData}
                    bookingId={booking_id}
                  />
                )}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-20 space-y-4">
                <PaymentSummary summary={bookingData} />
                
                {/* Payment Info Card */}
                <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Instant Confirmation</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Your ticket will be delivered immediately after payment</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-border/50 pt-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      <span>Pay with Card, Bank Transfer, or USSD</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      <span>256-bit SSL encryption</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      <span>Secured by Paystack</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges - Desktop */}
          <div className="hidden md:flex items-center justify-center gap-6 mt-10 pt-6 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Ticket size={16} className="text-rose-500" />
              <span>Instant Delivery</span>
            </div>
          </div>

          {/* Footer Info */}
          <p className="text-center text-xs text-muted-foreground mt-6 md:mt-4">
            Need help? 
            <button className="text-primary ml-1 hover:underline">Contact Support</button>
          </p>

        </div>
      </div>
      
      {/* Mobile: Sticky Bottom Summary */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/50 p-3 z-40">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground">Total Amount</p>
            <p className="text-base font-bold">₦{bookingData?.total?.toLocaleString()}</p>
          </div>
          {activeTab === "paystack" && (
            <Button 
              onClick={handlePayWithPaystack}
              disabled={paymentLoading}
              className="h-10 px-6 text-sm bg-rose-600 hover:bg-rose-700 shadow-md"
            >
              {paymentLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Pay Now"
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Spacer for mobile sticky footer */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
