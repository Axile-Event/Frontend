import React from 'react';
import { Button } from "@/components/ui/button";
import { CreditCard, ShieldCheck, Loader2 } from 'lucide-react';

const PaystackTab = ({ summary, onPay, loading = false }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="text-rose-500" size={24} />
        </div>
        <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Pay securely via Paystack. Your ticket will be confirmed immediately after payment.
        </p>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={onPay}
          disabled={loading}
          className="w-full h-14 text-lg bg-rose-600 hover:bg-rose-700 shadow-rose-600/20 shadow-lg disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>Pay ₦{summary?.total?.toLocaleString()} with Paystack</>
          )}
        </Button>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck size={14} />
          Secured by Paystack
        </div>
      </div>
    </div>
  );
};

export default PaystackTab;
