import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Ticket, Info, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentSummary = ({ summary, onPay, loading = false }) => {
  const { 
    ticketNumber, 
    event_name,
    items = [], // Array of ticket categories
    quantity = 1,
    subtotal = 0,
    serviceFee = 0, // Platform service fee (₦80)
    paystackFee = 0, // Paystack processing fee
    totalPaystack = 0,
  } = summary || {};

  const currentTotal = totalPaystack || (subtotal + serviceFee + paystackFee);

  return (
    <Card className="border-border/70 bg-card/90 shadow-xl overflow-hidden">
      <CardHeader className="pb-3 bg-muted/20">
        <CardTitle className="text-xl flex items-center gap-2">
          <Ticket className="h-5 w-5 text-rose-500" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Event Details */}
        {event_name && (
          <div className="space-y-1">
            <p className="font-bold text-foreground text-lg tracking-tight">{event_name}</p>
            <p className="text-sm text-muted-foreground font-medium">{quantity} ticket{quantity > 1 ? 's' : ''}</p>
          </div>
        )}

        <Separator className="bg-border/50" />

        {/* Booking Reference */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground font-medium">Booking Reference</span>
          <span className="font-mono font-black text-rose-500 text-xs tracking-wider bg-rose-500/5 px-2 py-1 rounded">
            {ticketNumber || "N/A"}
          </span>
        </div>
        
        <Separator className="bg-border/50" />
        
        {/* Ticket Categories Breakdown */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-start text-sm">
              <div>
                <span className="text-foreground font-bold">{item.name}</span>
                <span className="text-muted-foreground ml-2 font-medium">×{item.quantity}</span>
              </div>
              <span className="text-foreground font-mono font-bold">
                ₦{(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
          
          {items.length > 1 && (
            <>
              <Separator className="bg-border/30" />
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground tracking-tight uppercase text-[10px] font-bold">Subtotal</span>
                <span className="text-foreground font-mono">₦{subtotal?.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        <Separator className="bg-border/50" />

        {/* Fee Breakdown Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">
            <span className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              Fee Breakdown
            </span>
          </div>
          
          {serviceFee > 0 && (
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Service Fee</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground/70 font-bold uppercase tracking-tighter">
                  Platform
                </span>
              </div>
              <span className="text-foreground font-mono font-medium">₦{serviceFee?.toLocaleString()}</span>
            </div>
          )}
          
          {paystackFee > 0 && (
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Processing Fee</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-tighter">
                  Paystack
                </span>
              </div>
              <span className="text-foreground font-mono font-medium">₦{paystackFee?.toLocaleString()}</span>
            </div>
          )}
        </div>

        <Separator className="bg-border/50" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-base font-black uppercase tracking-tight">Total Amount</span>
          <div className="text-right">
            <span className="text-3xl font-black text-rose-500 font-mono tracking-tighter">
              ₦{currentTotal?.toLocaleString()}
            </span>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter mt-1">
              Includes ₦{(serviceFee + paystackFee).toLocaleString()} in fees
            </p>
          </div>
        </div>

        {/* Action Button - Desktop Only */}
        <div className="hidden lg:block pt-2 space-y-3">
          <Button 
            onClick={onPay}
            disabled={loading}
            className="w-full h-14 text-sm font-black uppercase tracking-widest shadow-xl shadow-rose-600/20 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Complete Order
              </>
            )}
          </Button>
          <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
            <div className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-500" />
              Secured by Paystack
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSummary;
