import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Ticket } from "lucide-react";

const PaymentSummary = ({ summary }) => {
  const { 
    ticketNumber, 
    event_name,
    category_name,
    quantity = 1,
    price_per_ticket = 0,
    subtotal = 0,
    platformFee = 0, 
    total = 0 
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
        {/* Event & Category Details */}
        {event_name && (
          <div className="space-y-1">
            <p className="font-semibold text-foreground">{event_name}</p>
            {category_name && (
              <p className="text-sm text-muted-foreground">{category_name}</p>
            )}
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
        
        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Ticket Price {quantity > 1 ? `(×${quantity})` : ''}
            </span>
            <span className="text-foreground">
              ₦{price_per_ticket?.toLocaleString()}{quantity > 1 ? ` × ${quantity}` : ''}
            </span>
          </div>
          
          {quantity > 1 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">₦{subtotal?.toLocaleString()}</span>
            </div>
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
          <span className="text-2xl font-bold text-rose-500">₦{total?.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSummary;
