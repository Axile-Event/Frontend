import React from 'react';
import { Button } from "@/components/ui/button";
import { CreditCard, ShieldCheck, Loader2, Lock, Receipt } from 'lucide-react';

const PaystackTab = ({ summary, onPay, loading = false }) => {
  // Extract fee values
  const { 
    subtotal = 0, 
    serviceFee = 0, 
    paystackFee = 0, 
    totalPaystack = 0 
  } = summary || {};

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Payment Breakdown Card */}
      <div className="bg-muted/30 border border-border/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Receipt className="text-muted-foreground" size={16} />
          <span>Payment Breakdown</span>
        </div>
        
        <div className="space-y-2 text-sm">
          {/* Ticket Subtotal */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Ticket Subtotal</span>
            <span className="text-foreground">₦{subtotal?.toLocaleString()}</span>
          </div>
          
          {/* Service Fee */}
          {serviceFee > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Service Fee</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground/70">
                  Platform
                </span>
              </div>
              <span className="text-foreground">₦{serviceFee?.toLocaleString()}</span>
            </div>
          )}
          
          {/* Paystack Fee */}
          {paystackFee > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Processing Fee</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Paystack
                </span>
              </div>
              <span className="text-foreground">₦{paystackFee?.toLocaleString()}</span>
            </div>
          )}
          
          {/* Divider */}
          <div className="border-t border-border/50 my-2"></div>
          
          {/* Total Amount */}
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total to Pay</span>
            <span className="font-bold text-rose-500 text-lg">₦{totalPaystack?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Desktop Pay Button - Hidden on mobile (shown in sticky footer) */}
      <div className="hidden lg:block space-y-3">
        <Button 
          onClick={onPay}
          disabled={loading}
          className="w-full h-14 text-base shadow-lg disabled:opacity-70 bg-rose-600 hover:bg-rose-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Redirecting to Paystack...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Pay ₦{totalPaystack?.toLocaleString()}
            </>
          )}
        </Button>
        
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            Secured by Paystack
          </div>
          <div className="flex items-center gap-1.5">
            <CreditCard size={14} />
            Card, Bank, USSD
          </div>
        </div>
      </div>

      {/* Mobile View - Show total summary */}
      <div className="lg:hidden">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground py-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            Secured by Paystack
          </div>
          <div className="flex items-center gap-1.5">
            <CreditCard size={14} />
            Card, Bank, USSD
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaystackTab;
