import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Banknote, 
  ShieldCheck, 
  Loader2, 
  Clock, 
  Info, 
  CheckCircle2, 
  Copy, 
  Check,
  AlertCircle
} from 'lucide-react';
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import ManualConfirmationModal from './ManualConfirmationModal';

const ManualTransferTab = ({ summary, bookingId, paymentReference }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { 
    subtotal = 0, 
    serviceFee = 0,
    totalManual = subtotal + serviceFee 
  } = summary || {};

  const bankDetails = {
    bankName: "Zenith bank",
    accountNumber: "1311804312",
    accountName: "Axile solution limited"
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankDetails.accountNumber).then(() => {
      setCopiedAccount(true);
      toast.success("Account number copied!");
      setTimeout(() => setCopiedAccount(false), 2000);
    });
  };

  const handleInitiateConfirmation = () => {
    setShowConfirmation(true);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Bank Details Card */}
      <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-rose-500 font-bold">
          <Banknote size={20} />
          <span>Manual Bank Transfer</span>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Please transfer <span className="text-rose-500 font-mono font-bold">₦{totalManual?.toLocaleString()}</span> to this account:
          </p>


          <div className="grid grid-cols-1 gap-2">
            <div className="bg-background/50 p-4 rounded-xl border border-border/50 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Bank Name</span>
                <p className="text-sm font-bold">{bankDetails.bankName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Account Name</span>
                <p className="text-sm font-bold">{bankDetails.accountName}</p>
              </div>
              <div className="space-y-1 bg-black/20 p-3 rounded-lg border border-white/5 relative">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Account Number</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-mono font-black tracking-widest text-rose-500">{bankDetails.accountNumber}</span>
                  <button 
                    onClick={handleCopyAccount}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-all active:scale-95"
                  >
                    {copiedAccount ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Card */}
      <div className="bg-muted/30 border border-border/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Info className="text-rose-500" size={16} />
          <span>How it works</span>
        </div>
        
        <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
          <li className="flex gap-2">
            <div className="w-4 h-4 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0 mt-0.5">1</div>
            <span>Complete the transfer from your banking app.</span>
          </li>
          <li className="flex gap-2">
            <div className="w-4 h-4 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0 mt-0.5">2</div>
            <span>Click the "I have made the transfer" button below.</span>
          </li>
          <li className="flex gap-2">
            <div className="w-4 h-4 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0 mt-0.5">3</div>
            <span>Wait for admin verification (usually within 12-24 hours).</span>
          </li>
          <li className="flex gap-2 text-rose-500 font-medium">
             <AlertCircle size={12} className="shrink-0 mt-0.5" />
             <span>Your ticket will remain "Pending" until the payment is verified.</span>
          </li>
        </ul>
      </div>

      {/* Confirm Button */}
      <div className="space-y-3 pt-2">
        <Button 
          onClick={handleInitiateConfirmation}
          className="w-full h-12 text-sm shadow-md bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          I have made the transfer
        </Button>
        
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            Secure Verification
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            12-24h Processing
          </div>
        </div>
      </div>

      {/* Mobile Disclaimer */}
      <div className="lg:hidden h-20" />

      {/* Confirmation Overlay */}
      <ManualConfirmationModal 
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        totalAmount={totalManual}
        bookingId={bookingId}
        paymentReference={paymentReference}
        bankDetails={bankDetails}
      />
    </div>
  );
};

export default ManualTransferTab;
