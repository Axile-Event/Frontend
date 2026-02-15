import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Check, Landmark, Info, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import ManualConfirmationModal from './ManualConfirmationModal';

const ManualTransferTab = ({ summary, bookingId }) => {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  

  // Example bank details - in a real app, these might come from an API or config
  const bankDetails = {
    accountName: "Fawole Taiwo Oluwatomisin",
    accountNumber: "2005212352",
    bankName: "Kuda",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bankDetails.accountNumber);
    setCopied(true);
    toast.success("Account number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract fee values
  const { subtotal = 0, serviceFee = 0, totalManual = 0 } = summary || {};

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Bank Transfer Details Card */}
      <div className="bg-muted/40 border border-border/50 rounded-2xl p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Landmark className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="font-semibold">Bank Transfer Details</h3>
            <p className="text-xs text-muted-foreground">Transfer to the account below</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Bank Name</span>
            <span className="font-medium">{bankDetails.bankName}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Account Name</span>
            <span className="font-medium text-right text-xs sm:text-sm">{bankDetails.accountName}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Account Number</span>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 font-mono text-primary hover:underline group"
            >
              {bankDetails.accountNumber}
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="group-hover:scale-110 transition-transform" />}
            </button>
          </div>
        </div>
      </div>

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
          
          {/* No Paystack Fee note */}
          <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
            <div className="flex items-center gap-2">
              <span>Processing Fee</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10">
                Waived
              </span>
            </div>
            <span>₦0</span>
          </div>
          
          {/* Divider */}
          <div className="border-t border-border/50 my-2"></div>
          
          {/* Total Amount */}
          <div className="flex justify-between items-center">
            <span className="font-semibold">Amount to Pay</span>
            <span className="font-bold text-rose-500 text-lg">₦{totalManual?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Warning/Info Box */}
      <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex gap-3">
        <Info className="text-amber-500 shrink-0 mt-0.5" size={18} />
        <div className="text-xs text-amber-200/80 leading-relaxed space-y-1">
          <p>
            Please ensure you use your <strong>Ticket Number</strong> as the transfer reference to help us verify your payment faster.
          </p>
          <p className="text-amber-200/60">
            Your ticket number: <span className="font-mono font-medium text-amber-300">{summary?.ticketNumber || "N/A"}</span>
          </p>
        </div>
      </div>

      {/* Confirmation timing reassurance */}
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3">
        <Info className="text-primary shrink-0 mt-0.5" size={18} />
        <div className="text-xs text-muted-foreground leading-relaxed space-y-1">
          <p>
            Payment confirmation may take <strong>30 minutes to 2 hours</strong> while we verify your transfer. Once confirmed, your ticket will be sent to your email—please rest assured your booking is secure.
          </p>
        </div>
      </div>

      <Button 
        onClick={() => setIsModalOpen(true)}
        className="w-full h-11 md:h-14 text-sm md:text-base variant-outline border-primary/20 hover:bg-primary/5 transition-all"
        variant="outline"
      >
        I've sent the money
      </Button>

      <ManualConfirmationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        totalAmount={summary.totalManual}
        bookingId={bookingId}
      />
    </div>
  );
};

export default ManualTransferTab;
