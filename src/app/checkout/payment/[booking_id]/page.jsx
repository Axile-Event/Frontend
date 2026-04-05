"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Ticket,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from "lucide-react";
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
  const fee = amount * 0.015 + 100;
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

      const decodedBookingId = decodeURIComponent(booking_id);

      try {
        let storedBooking = localStorage.getItem(`booking_${decodedBookingId}`);
        if (!storedBooking) {
          storedBooking = localStorage.getItem(`booking_${booking_id}`);
        }

        if (storedBooking) {
          const parsed = JSON.parse(storedBooking);

          let subtotal = 0;
          let totalQuantity = 0;
          let items = [];

          if (parsed.items && Array.isArray(parsed.items)) {
            items = parsed.items;
            subtotal = parsed.subtotal || items.reduce((sum, item) => sum + (item.total || item.price * item.quantity), 0);
            totalQuantity = parsed.total_quantity || items.reduce((sum, item) => sum + item.quantity, 0);
          } else {
            const quantity = parsed.quantity || 1;
            const pricePerTicket = parseFloat(parsed.price_per_ticket || 0);
            subtotal = pricePerTicket * quantity;
            totalQuantity = quantity;
            items = [{ name: parsed.category_name, price: pricePerTicket, quantity, total: subtotal }];
          }

          const serviceFee = subtotal > 0 ? PLATFORM_FEE : 0;
          const paystackFee = calculatePaystackFee(subtotal + serviceFee);
          const totalPaystack = subtotal + serviceFee + paystackFee;
          const totalManual = subtotal + serviceFee;

          setBookingData({
            booking_id: parsed.booking_id,
            ticketNumber: parsed.booking_id?.replace("booking:", "") || decodedBookingId.replace("booking:", ""),
            event_name: parsed.event_name,
            items,
            quantity: totalQuantity,
            subtotal,
            serviceFee,
            paystackFee,
            totalPaystack,
            totalManual,
            payment_url: parsed.payment_url,
            payment_reference: parsed.payment_reference,
            allowedMethods: parsed.payment_methods_allowed || ["paystack"],
            pricing_type: parsed.pricing_type || "paid"
          });
          
          // Set default tab based on first allowed method if paystack not available
          const allowed = parsed.payment_methods_allowed || ["paystack"];
          if (!allowed.includes('paystack') && allowed.includes('manual_bank_transfer')) {
            setActiveTab('manual_bank_transfer');
          }
          
          setLoading(false);
          return;
        }

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
      if (bookingData.payment_url) {
        window.location.href = bookingData.payment_url;
        return;
      }
      const response = await api.post("/tickets/initialize-payment/", {
        booking_id: booking_id,
        redirect_url: `${window.location.origin}/payment`,
        callback_url: `${window.location.origin}/payment`,
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
            <Button onClick={() => router.push("/dashboard/student/events")}>
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

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShieldCheck size={14} />
              <span className="hidden sm:inline">Secure Checkout</span>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Total
              </p>
              <p className="font-bold text-rose-500">
                ₦{(activeTab === "paystack" ? bookingData?.totalPaystack : bookingData?.totalManual)?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Details */}
          <div className="hidden md:block mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Secure your tickets</h1>
                <p className="text-sm text-muted-foreground font-medium">
                  {bookingData?.event_name}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8">
            {/* Left: Payment Options */}
            <div className="lg:col-span-3 space-y-4">
              <PaymentTabs 
                activeTab={activeTab} 
                onChange={setActiveTab} 
                allowedMethods={bookingData?.allowedMethods} 
              />
              
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
                    bookingId={decodeURIComponent(booking_id)}
                    paymentReference={bookingData?.payment_reference}
                  />
                )}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-20 space-y-4">
                <PaymentSummary summary={bookingData} activeTab={activeTab}/>

                {/* Trust Section */}
                <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">
                        {activeTab === 'paystack' ? 'Instant Confirmation' : 'Manual Verification'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {activeTab === 'paystack' 
                          ? 'Your tickets will be delivered immediately after successful payment' 
                          : 'Admin will verify your transfer and confirm tickets within 12-24 hours'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-3 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      <span>{activeTab === 'paystack' ? 'Pay with Card, Bank Transfer, or USSD' : 'No extra processing fees'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      <span>{activeTab === 'paystack' ? 'Secured by Paystack' : 'Direct bank transfer to Axile'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Sticky Bottom Summary */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/50 p-4 z-40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Amount</p>
            <p className="text-lg font-bold text-rose-500">
              ₦{(activeTab === "paystack" ? bookingData?.totalPaystack : bookingData?.totalManual)?.toLocaleString()}
            </p>
          </div>
          {activeTab === "paystack" ? (
            <Button
              onClick={handlePayWithPaystack}
              disabled={paymentLoading}
              className="h-12 px-8 text-sm font-bold bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20"
            >
              {paymentLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                "Pay Now"
              )}
            </Button>
          ) : (
            <div className="text-[10px] text-muted-foreground font-medium text-right leading-tight max-w-[120px]">
              Use button above to confirm transfer
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden h-24" />
    </div>
  );
}
