"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import { Loader2, CheckCircle2, XCircle, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const VerifyPaymentContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const trxref = searchParams.get("trxref");
  
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("Verifying your payment...");
  const [ticketDetails, setTicketDetails] = useState(null);
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const verifyPayment = async () => {
      // Use reference (standard Paystack) or trxref (sometimes passed)
      const paystackReference = reference || trxref;

      if (!paystackReference) {
        setStatus("error");
        setMessage("No payment reference found. Please contact support if you were charged.");
        return;
      }

      // Prevent duplicate verification in StrictMode
      if (verificationAttempted.current) return;
      verificationAttempted.current = true;

      try {
        const response = await api.post("/tickets/verify-payment/", { 
          reference: paystackReference 
        });
        
        setStatus("success");
        setMessage("Payment verified successfully!");
        setTicketDetails(response.data.ticket);
        toast.success("Payment verified!");
        if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("tickets-updated"));

        // Auto redirect after 5 seconds
        setTimeout(() => {
          router.push("/dashboard/student/my-tickets");
        }, 5000);

      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        const errorMsg = error.response?.data?.error || "Payment verification failed. Please check your ticket status in 'My Tickets'.";
        setMessage(errorMsg);
        toast.error("Verification failed");
      }
    };

    verifyPayment();
  }, [reference, trxref, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="w-full max-w-md p-8 rounded-3xl border bg-card shadow-lg space-y-6">
        {status === "verifying" && (
          <>
            <div className="flex justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Verifying Payment</h1>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Payment Successful!</h1>
            <p className="text-muted-foreground">Your ticket has been confirmed.</p>
            
            {ticketDetails && (
              <div className="p-4 rounded-xl bg-muted/50 text-left space-y-2">
                <p className="text-sm font-medium">Event: <span className="font-bold">{ticketDetails.event_name}</span></p>
                <p className="text-sm font-medium">Ticket ID: <span className="font-mono text-xs">{ticketDetails.ticket_id}</span></p>
                <p className="text-sm font-medium">Status: <span className="text-green-500 font-bold uppercase">{ticketDetails.status}</span></p>
              </div>
            )}

            <div className="pt-4 flex flex-col gap-2">
              <Button onClick={() => router.push("/dashboard/student/my-tickets")} className="w-full">
                View My Tickets
              </Button>
              <p className="text-[10px] text-muted-foreground">Redirecting in a few seconds...</p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-red-500/10">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Verification Failed</h1>
            <p className="text-muted-foreground">{message}</p>
            
            <div className="pt-4 flex flex-col gap-2">
              <Button onClick={() => router.push("/dashboard/student/my-tickets")} className="w-full">
                Check My Tickets
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard/student/events")} className="w-full">
                Back to Events
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const VerifyPaymentPage = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyPaymentContent />
    </Suspense>
  );
};

export default VerifyPaymentPage;
