import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Ticket } from "lucide-react";

const PaymentSummary = ({ summary, activeTab }) => {
  const { 
    ticketNumber, 
    event_name,
    items = [], // Array of ticket categories
    quantity = 1,
    subtotal = 0,
    platformFee = 0, 
    totalPaystack= 0,
    totalManual= 0 
  } = summary || {};

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
          
          {platformFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee</span>
              <span className="text-foreground">₦{platformFee?.toLocaleString()}</span>
            </div>
          )}
        </div>

        <Separator className="bg-border/50" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-base font-semibold">Total Amount</span>
          <span className="text-2xl font-bold text-rose-500">₦{activeTab === "paystack" ? totalPaystack?.toLocaleString() : totalManual?.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSummary;
