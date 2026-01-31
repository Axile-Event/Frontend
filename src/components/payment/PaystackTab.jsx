import React from 'react';
import { Button } from "@/components/ui/button";
import { CreditCard, ShieldCheck, Loader2, Lock } from 'lucide-react';

const PaystackTab = ({ summary, onPay, loading = false }) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
              Pay ₦{summary?.totalPaystack?.toLocaleString()}
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
    </div>
  );
};

export default PaystackTab;
