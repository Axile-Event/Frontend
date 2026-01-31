import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Ticket, Info } from "lucide-react";

const PaymentSummary = ({ summary, activeTab }) => {
  const { 
    ticketNumber, 
    event_name,
    items = [], // Array of ticket categories
    quantity = 1,
    subtotal = 0,
    serviceFee = 0, // Platform service fee (₦80)
    paystackFee = 0, // Paystack processing fee
    platformFee = 0, // Combined fees (fallback)
    totalPaystack = 0,
    totalManual = 0 
  } = summary || {};

  // Determine which fees to show based on active tab
  const isPaystack = activeTab === "paystack";
  const currentTotal = isPaystack ? totalPaystack : totalManual;

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Ticket className="h-5 w-5 text-rose-500" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Event Details */}
        {event_name && (
          <div className="space-y-1">
            <p className="font-semibold text-foreground">{event_name}</p>
            <p className="text-sm text-muted-foreground">{quantity} ticket{quantity > 1 ? 's' : ''}</p>
          </div>
        )}

        <Separator className="bg-border/50" />

        {/* Booking Reference */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Booking Reference</span>
          <span className="font-mono font-medium text-foreground text-xs">
            {ticketNumber || "N/A"}
          </span>
        </div>
        
        <Separator className="bg-border/50" />
        
        {/* Ticket Categories Breakdown */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-start text-sm">
              <div>
                <span className="text-foreground font-medium">{item.name}</span>
                <span className="text-muted-foreground ml-2">×{item.quantity}</span>
              </div>
              <span className="text-foreground">
                ₦{(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
          
          {items.length > 1 && (
            <>
              <Separator className="bg-border/30" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">₦{subtotal?.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        <Separator className="bg-border/50" />

        {/* Fee Breakdown Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Info className="h-3.5 w-3.5" />
            <span>Fee Breakdown</span>
          </div>
          
          {/* Service Fee - always shown for paid tickets */}
          {serviceFee > 0 && (
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Service Fee</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground/70">
                  Platform
                </span>
              </div>
              <span className="text-foreground">₦{serviceFee?.toLocaleString()}</span>
            </div>
          )}
          
          {/* Paystack Fee - only shown when Paystack tab is active */}
          {isPaystack && paystackFee > 0 && (
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Payment Processing</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Paystack
                </span>
              </div>
              <span className="text-foreground">₦{paystackFee?.toLocaleString()}</span>
            </div>
          )}

          {/* Show note for manual transfer */}
          {!isPaystack && (
            <div className="mt-2 text-xs text-muted-foreground/70 italic">
              No payment processing fee for bank transfer
            </div>
          )}
        </div>

        <Separator className="bg-border/50" />

        {/* Total */}
        <div className="flex justify-between items-center pt-1">
          <span className="text-base font-semibold">Total Amount</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-rose-500">
              ₦{currentTotal?.toLocaleString()}
            </span>
            {isPaystack && paystackFee > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Includes ₦{(serviceFee + paystackFee).toLocaleString()} in fees
              </p>
            )}
            {!isPaystack && serviceFee > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Includes ₦{serviceFee.toLocaleString()} service fee
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSummary;
