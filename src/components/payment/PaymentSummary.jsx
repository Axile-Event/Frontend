import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const PaymentSummary = ({ summary }) => {
  const { ticketNumber, subtotal, vat, total } = summary;

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Checkout Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Ticket Number</span>
          <span className="font-mono font-medium text-foreground">{ticketNumber || "N/A"}</span>
        </div>
        
        <Separator className="bg-border/50" />
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">₦{subtotal?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">VAT (7.5%)</span>
            <span className="text-foreground">₦{vat?.toLocaleString()}</span>
          </div>
        </div>

        <Separator className="bg-border/50" />

        <div className="flex justify-between items-center">
          <span className="text-base font-semibold">Total Amount</span>
          <span className="text-2xl font-bold text-rose-500">₦{total?.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSummary;
