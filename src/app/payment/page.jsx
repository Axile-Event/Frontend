
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ArrowRight, Mail, UserCheck, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user, role } = useAuthStore();
  
  const [status, setStatus] = useState("verifying"); // verifying, success, failed
  const [message, setMessage] = useState("Verifying your payment...");
  const [ticketData, setTicketData] = useState(null);
  const [organizerBooking, setOrganizerBooking] = useState(null);

  // Read organizer booking context IMMEDIATELY on mount
  useEffect(() => {
    // Check if this was an organizer booking - do this first
    // Using localStorage because sessionStorage may not persist after Paystack redirect
    try {
      const storedBooking = localStorage.getItem('organizer_booking');
      console.log("Raw localStorage organizer_booking:", storedBooking);
      if (storedBooking) {
        const parsed = JSON.parse(storedBooking);
        console.log("Parsed organizer booking:", parsed);
        
        // Only use if it's recent (within last 30 minutes) to avoid stale data
        const isRecent = parsed.timestamp && (Date.now() - parsed.timestamp) < 30 * 60 * 1000;
        if (isRecent || !parsed.timestamp) {
          setOrganizerBooking(parsed);
        } else {
          console.log("Organizer booking is stale, ignoring");
          localStorage.removeItem('organizer_booking');
        }
      } else {
        console.log("No organizer_booking found in localStorage");
      }
    } catch (e) {
      console.warn("Could not parse organizer booking:", e);
    }
  }, []); // Separate useEffect just for reading localStorage

  useEffect(() => {
    const verifyPayment = async () => {
      // Get payment reference from URL
      const reference = searchParams.get("reference") || searchParams.get("trxref");
      
      // Log for debugging
      console.log("Payment callback URL params:", {
        reference: searchParams.get("reference"),
        trxref: searchParams.get("trxref"),
        status: searchParams.get("status"),
        allParams: Object.fromEntries(searchParams.entries())
      });
      
      // Check if payment was cancelled or failed based on query params
      const queryStatus = searchParams.get("status") || searchParams.get("");
      
      // Handle explicit failure/cancellation
      if (queryStatus === "failed" || queryStatus === "cancelled") {
        setStatus("failed");
        setMessage("Payment was cancelled or failed. No charges were made.");
        return;
      }

      // If no reference, payment wasn't completed
      if (!reference) {
        setStatus("failed");
        setMessage("No payment reference found. Please try again.");
        return;
      }

      // Verify payment with backend using POST request
      try {
        console.log("Verifying payment with reference:", reference);
        const response = await api.post(`/tickets/verify-payment/`, {
          reference: reference
        });

        console.log("Verification response:", response.data);

        // Check if verification was successful
        if (response.data.message && response.data.message.includes("verified successfully")) {
          setStatus("success");
          setMessage(response.data.message);
          
          // Extract ticket data
          const tickets = response.data.tickets || [];
          if (tickets.length > 0) {
            setTicketData({
              event_name: tickets[0].event_name,
              quantity: tickets.length,
              amount: tickets.reduce((sum, ticket) => sum + parseFloat(ticket.total_price || 0), 0),
              tickets: tickets
            });
          }
        } else {
          setStatus("failed");
          setMessage(response.data.message || "Payment verification failed. Please contact support.");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        
        const errorData = error.response?.data;
        const errorMessage = errorData?.error || errorData?.message || errorData?.detail || "";
        
        // Handle specific case where payment was verified but tickets already processed (webhook already handled it)
        if (errorMessage.includes("no pending tickets") || errorMessage.includes("already confirmed")) {
          setStatus("success");
          setMessage("Payment successful! Your tickets have been confirmed. Check your email or dashboard for details.");
        } else {
          setStatus("failed");
          
          // Provide friendly error messages
          let friendlyMessage = "We couldn't verify your payment at this time.";
          
          if (error.response?.status === 404) {
            friendlyMessage = "Payment record not found. If you were charged, please contact support with your payment reference.";
          } else if (error.response?.status === 500) {
            friendlyMessage = "Our payment system is experiencing issues. Please try again in a few minutes or contact support.";
          } else if (errorMessage) {
            friendlyMessage = errorMessage;
          } else if (!error.response) {
            friendlyMessage = "Network error. Please check your connection and try again.";
          }
          
          setMessage(friendlyMessage);
        }
      }
    };

    verifyPayment();
  }, [searchParams, token, router]);

  const handleContinue = () => {
    // Clear organizer booking context
    localStorage.removeItem('organizer_booking');
    
    if (status === "success") {
      // If this was an organizer booking, redirect back to their event page
      if (organizerBooking?.returnUrl) {
        toast.success(`Ticket sent to ${organizerBooking.attendeeEmail}`);
        router.push(organizerBooking.returnUrl);
        return;
      }
      
      // Determine user role from multiple sources (Zustand store + localStorage fallback)
      let userRole = role?.toLowerCase() || user?.role?.toLowerCase() || user?.user_type?.toLowerCase() || '';
      
      // Fallback: Check localStorage directly if Zustand hasn't hydrated
      if (!userRole && typeof window !== 'undefined') {
        try {
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            const storedRole = parsed?.state?.role || parsed?.state?.user?.role || parsed?.state?.user?.user_type || '';
            userRole = storedRole.toLowerCase();
          }
        } catch (e) {
          console.warn("Could not parse auth storage:", e);
        }
      }
      
      // Check if user is an organizer
      const isOrganizer = userRole === 'organizer' || userRole === 'org';
      
      if (isOrganizer) {
        // Organizer: go to organizer dashboard
        router.push("/dashboard/org/my-event");
      } else if (token) {
        // Student with token: go to student tickets
        router.push("/dashboard/student/my-tickets");
      } else {
        // No token: prompt login then redirect to student tickets
        router.push(`/login?callbackUrl=${encodeURIComponent("/dashboard/student/my-tickets")}`);
      }
    } else {
      // Payment failed/cancelled
      if (organizerBooking?.returnUrl) {
        // Organizer booking failed: go back to event page
        router.push(organizerBooking.returnUrl);
      } else {
        // Regular user: go to events page
        router.push("/events");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl">
          {/* ORGANIZER BOOKING SUCCESS - Special UI */}
          {organizerBooking && status === "success" ? (
            <>
              {/* Success Icon with Email */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center animate-in zoom-in-95 duration-300">
                    <UserCheck className="w-10 h-10 text-emerald-500" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Organizer Booking Success Message */}
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-foreground">
                  Ticket Purchased Successfully!
                </h1>
                
                <p className="text-muted-foreground">
                  You have successfully purchased ticket(s) for <span className="text-emerald-400 font-semibold">{organizerBooking.attendeeName}</span>.
                </p>

                {/* Attendee Info Card */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 space-y-3 mt-6">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold">
                    <Mail className="w-4 h-4" />
                    Ticket Sent To
                  </div>
                  
                  <div className="bg-black/20 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="text-foreground font-medium">{organizerBooking.attendeeName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="text-emerald-400 font-medium">{organizerBooking.attendeeEmail}</span>
                    </div>
                    {ticketData?.quantity && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tickets:</span>
                        <span className="text-foreground font-medium">{ticketData.quantity} ticket{ticketData.quantity > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {ticketData?.amount !== undefined && ticketData.amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount Paid:</span>
                        <span className="text-foreground font-medium">₦{Number(ticketData.amount).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Important Notice */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mt-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-200 text-left">
                      <span className="font-semibold">Please inform the attendee</span> to check their email ({organizerBooking.attendeeEmail}) to view and confirm their ticket. This ticket will not appear in your account as it belongs to the attendee.
                    </p>
                  </div>
                </div>

                {/* Payment Reference */}
                {searchParams.get("reference") && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Payment Reference</p>
                    <p className="text-sm font-mono text-foreground break-all bg-muted px-3 py-2 rounded-lg">
                      {searchParams.get("reference") || searchParams.get("trxref")}
                    </p>
                  </div>
                )}
              </div>

              {/* Back to Event Button */}
              <div className="mt-8">
                <Button
                  onClick={handleContinue}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
                  size="lg"
                >
                  Back to Event
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          ) : organizerBooking && status === "failed" ? (
            <>
              {/* ORGANIZER BOOKING FAILED - Special UI */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center animate-in zoom-in-95 duration-300">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
              </div>

              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-foreground">
                  Payment Failed
                </h1>
                
                <p className="text-muted-foreground">
                  The payment for <span className="text-red-400 font-semibold">{organizerBooking.attendeeName}</span>'s ticket could not be completed.
                </p>

                <p className="text-sm text-muted-foreground">
                  {message}
                </p>

                {/* Payment Reference */}
                {searchParams.get("reference") && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Payment Reference</p>
                    <p className="text-sm font-mono text-foreground break-all bg-muted px-3 py-2 rounded-lg">
                      {searchParams.get("reference") || searchParams.get("trxref")}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-3">
                <Button
                  onClick={handleContinue}
                  className="w-full h-12"
                  size="lg"
                >
                  Back to Event
                </Button>
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="w-full h-12"
                  size="lg"
                >
                  Try Again
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* REGULAR PAYMENT FLOW - Original UI */}
              {/* Status Icon */}
              <div className="flex justify-center mb-6">
                {status === "verifying" && (
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  </div>
                )}
                {status === "success" && (
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center animate-in zoom-in-95 duration-300">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                )}
                {status === "failed" && (
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center animate-in zoom-in-95 duration-300">
                    <XCircle className="w-10 h-10 text-red-500" />
                  </div>
                )}
              </div>

              {/* Status Message */}
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-foreground">
                  {status === "verifying" && "Verifying Payment"}
                  {status === "success" && "Payment Successful!"}
                  {status === "failed" && "Payment Failed"}
                </h1>
                
                <p className="text-muted-foreground">
                  {message}
                </p>

                {/* Payment Reference */}
                {searchParams.get("reference") && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Payment Reference</p>
                    <p className="text-sm font-mono text-foreground break-all bg-muted px-3 py-2 rounded-lg">
                      {searchParams.get("reference") || searchParams.get("trxref")}
                    </p>
                  </div>
                )}

                {/* Ticket Details */}
                {ticketData && status === "success" && (
                  <div className="pt-4 border-t border-border space-y-2 text-left">
                    <p className="text-xs text-muted-foreground mb-2">Ticket Details</p>
                    {ticketData.event_name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Event:</span>
                        <span className="text-foreground font-medium">{ticketData.event_name}</span>
                      </div>
                    )}
                    {ticketData.quantity && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tickets:</span>
                        <span className="text-foreground font-medium">{ticketData.quantity} ticket{ticketData.quantity > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {ticketData.amount !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount Paid:</span>
                        <span className="text-foreground font-medium">₦{Number(ticketData.amount).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {status !== "verifying" && (
                <div className="mt-8 space-y-3">
                  <Button
                    onClick={handleContinue}
                    className="w-full h-12"
                    size="lg"
                  >
                    {status === "success" ? (
                      <>
                        View My Tickets
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      "Browse Events"
                    )}
                  </Button>
                  
                  {status === "failed" && (
                    <Button
                      onClick={() => router.back()}
                      variant="outline"
                      className="w-full h-12"
                      size="lg"
                    >
                      Go Back
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Help Text */}
        {status === "failed" && (
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Need help? Contact support with your payment reference.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading fallback component
function PaymentFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
        <p className="text-muted-foreground">Loading payment details...</p>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentCallback() {
  return (
    <Suspense fallback={<PaymentFallback />}>
      <PaymentCallbackContent />
    </Suspense>
  );
}
