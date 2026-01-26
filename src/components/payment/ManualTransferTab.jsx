import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Check, Landmark, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import ManualConfirmationModal from './ManualConfirmationModal';

const ManualTransferTab = ({ summary }) => {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Example bank details - in a real app, these might come from an API or config
  const bankDetails = {
    accountName: "AXILE MULTIMEDIA LTD",
    accountNumber: "1234567890",
    bankName: "Example Bank PLC",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bankDetails.accountNumber);
    setCopied(true);
    toast.success("Account number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-muted/40 border border-border/50 rounded-2xl p-6 space-y-4">
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
            <span className="font-medium">{bankDetails.accountName}</span>
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
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Amount to Pay</span>
            <span className="font-bold text-rose-500 text-lg">₦{summary.total?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex gap-3">
        <Info className="text-amber-500 shrink-0" size={18} />
        <p className="text-xs text-amber-200/80 leading-relaxed">
          Please ensure you use your <strong>Ticket Number</strong> as the transfer reference to help us verify your payment faster.
        </p>
      </div>

      <Button 
        onClick={() => setIsModalOpen(true)}
        className="w-full h-14 text-lg variant-outline border-primary/20 hover:bg-primary/5 transition-all"
        variant="outline"
      >
        I’ve sent the money
      </Button>

      <ManualConfirmationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        totalAmount={summary.total}
      />
    </div>
  );
};

export default ManualTransferTab;
