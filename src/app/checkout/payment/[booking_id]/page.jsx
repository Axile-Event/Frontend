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
import Loading from "@/components/ui/Loading";
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

  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("paystack");

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
          let totalManual = subtotal + serviceFee;
          const serverManualRaw =
            parsed.total_manual_amount ?? parsed.total_amount;
          if (
            parsed.payment_method === "manual_bank_transfer" &&
            serverManualRaw != null &&
            serverManualRaw !== ""
          ) {
            const n = parseFloat(serverManualRaw);
            if (!Number.isNaN(n)) totalManual = n;
          }

          const allowedMethodsRaw =
            parsed.payment_methods_allowed ||
            parsed.allowed_payment_methods ||
            ["paystack"];
          const allowedMethods = Array.isArray(allowedMethodsRaw) 
            ? allowedMethodsRaw 
            : (typeof allowedMethodsRaw === 'string' ? allowedMethodsRaw.split(',') : ["paystack"]);
          
          // DEBUG: Log to help verify
          console.log('🔍 DEBUG - Booking Payment Methods:', {
            allowedMethodsRaw,
            allowedMethods,
            willShowTabs: allowedMethods.length > 1,
            bookingId: parsed.booking_id
          });

          const resolvedMethod = parsed.payment_method;
          if (
            resolvedMethod &&
            allowedMethods.includes(resolvedMethod)
          ) {
            setActiveTab(resolvedMethod);
          } else if (!allowedMethods.includes("paystack") && allowedMethods.length > 0) {
            setActiveTab(allowedMethods[0]);
          }

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
            allowedMethods,
            pricing_type: parsed.pricing_type || "paid"
          });

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
        payment_method: activeTab,
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
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Unable to Load Booking</h2>
          <p className="text-sm text-muted-foreground font-medium">{error}</p>
          <div className="flex gap-3 justify-center pt-4">
            <Button variant="outline" onClick={() => router.back()} className="rounded-xl border-white/10 text-white hover:bg-white/5 uppercase text-xs font-bold px-6 h-12">
              Go Back
            </Button>
            <Button onClick={() => router.push("/dashboard/student/events")} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white uppercase text-xs font-bold px-6 h-12">
              Browse Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentTotal = activeTab === 'manual_bank_transfer' ? bookingData.totalManual : bookingData.totalPaystack;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* Left Side: Payment Details */}
            <div className="flex-1 space-y-8 order-2 lg:order-1">
              {/* Header */}
              <div className="hidden lg:block space-y-2">
                <h1 className="text-4xl font-black tracking-tight text-white uppercase">Complete Payment</h1>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg inline-block">
                  Ref: {bookingData.ticketNumber}
                </p>
              </div>

              {/* Tabs Section */}
              {bookingData?.allowedMethods?.length > 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-rose-500" />
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Select Payment Method</h3>
                  </div>
                  <PaymentTabs 
                    activeTab={activeTab} 
                    onChange={setActiveTab} 
                    allowedMethods={bookingData.allowedMethods} 
                  />
                </div>
              )}

              {/* Tab Content */}
              <div className="min-h-[300px]">
                {activeTab === 'paystack' ? (
                  <PaystackTab 
                    summary={bookingData} 
                    onPay={handlePayWithPaystack} 
                    loading={paymentLoading} 
                  />
                ) : (
                  <ManualTransferTab 
                    summary={bookingData} 
                    bookingId={booking_id} 
                    paymentReference={bookingData.payment_reference} 
                  />
                )}
              </div>
            </div>

            {/* Right Side: Order Summary Card (Sticky on desktop) */}
            <div className="lg:w-[380px] order-1 lg:order-2">
              <div className="lg:sticky lg:top-8">
                <PaymentSummary 
                  summary={bookingData} 
                  onPay={handlePayWithPaystack}
                  loading={paymentLoading}
                  paymentMethod={activeTab}
                  showActionButton={activeTab === 'paystack'}
                />
              </div>
            </div>
          </div>
      </div>

      {/* Mobile: Sticky Bottom Action for Paystack only */}
      {activeTab === 'paystack' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/50 p-4 z-40">
          <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Amount</p>
              <p className="text-xl font-black text-rose-500 italic">
                ₦{currentTotal?.toLocaleString()}
              </p>
            </div>
            <Button
              onClick={handlePayWithPaystack}
              disabled={paymentLoading}
              className="h-14 px-10 text-sm font-black uppercase italic bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-600/20 active:scale-95 transition-all rounded-2xl"
            >
              {paymentLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                "Pay Now"
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="lg:hidden h-24" />
    </div>
  );
}
