import { CreditCard, ShieldCheck, Lock, Zap, CheckCircle2 } from 'lucide-react';

const PaystackTab = ({ summary, onPay, loading = false }) => {
  // Extract fee values
  const { 
    subtotal = 0, 
    serviceFee = 0, 
    paystackFee = 0, 
    totalPaystack = 0 
  } = summary || {};

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Paystack Info Card */}
      <div className="bg-muted/10 border border-border/30 rounded-2xl p-8 flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500">
           <CreditCard size={32} />
        </div>
        <div>
          <h3 className="text-lg font-bold">Pay with Paystack</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
            Complete your purchase securely via card, bank transfer, or USSD using Paystack.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
          <div className="flex flex-col items-center gap-1.5">
            <ShieldCheck size={20} className="text-emerald-500" />
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Secured</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Lock size={20} className="text-rose-500" />
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Encrypted</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Zap size={20} className="text-blue-500" />
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Instant</span>
          </div>
        </div>
      </div>

      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex gap-3 items-start">
         <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
         <p className="text-xs text-muted-foreground leading-relaxed">
           Your tickets will be generated and sent to your email <span className="text-emerald-500 font-bold">immediately</span> after successful payment.
         </p>
      </div>
    </div>
  );
};

export default PaystackTab;
