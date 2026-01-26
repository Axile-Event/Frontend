"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";

// Custom Components
import PaymentSummary from "@/components/payment/PaymentSummary";
import PaymentTabs from "@/components/payment/PaymentTabs";
import PaystackTab from "@/components/payment/PaystackTab";
import ManualTransferTab from "@/components/payment/ManualTransferTab";

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const { booking_id } = useParams();
  
  const [activeTab, setActiveTab] = useState("paystack");
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    // This is where you would fetch the actual booking details using the booking_id
    // Example: const fetchBooking = async () => { ... }
    
    // For now, we simulate a fetch with mock data
    const timer = setTimeout(() => {
      setBookingData({
        ticketNumber: booking_id || `AX-${Math.floor(1000 + Math.random() * 9000)}`,
        subtotal: 15000,
        vat: 1125, // 7.5%
        total: 16125,
        email: "user@example.com"
      });
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [booking_id]);

  const handlePayWithPaystack = () => {
    // Integration point: Trigger Paystack popup or redirect
    console.log("Initiating Paystack for booking:", booking_id);
    // In a real implementation:
    // const response = await api.post('/tickets/initialize-paystack/', { booking_id });
    // window.location.href = response.data.payment_url;
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
              <h1 className="text-2xl font-bold">Payment Method</h1>
              <p className="text-sm text-muted-foreground">Select how you'd like to pay for your ticket</p>
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
