import React from 'react';
import { CreditCard, Banknote } from 'lucide-react';

const PaymentTabs = ({ activeTab, onChange, allowedMethods = ["paystack"] }) => {
  // Ensure we have an array for easier checking
  const methods = Array.isArray(allowedMethods) 
    ? allowedMethods 
    : (typeof allowedMethods === 'string' ? allowedMethods.split(',') : ["paystack"]);

  const hasPaystack = methods.includes('paystack');
  const hasManual = methods.includes('manual_bank_transfer');

  // If only one method is allowed, we don't necessarily need to see the tabs, 
  // but it's good for clarity.
  
  return (
    <div className="flex p-1 bg-muted/30 rounded-lg md:rounded-xl border border-border/50">
      {hasPaystack && (
        <button
          onClick={() => onChange('paystack')}
          className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 py-2 md:py-3 px-3 md:px-4 rounded-md md:rounded-lg text-sm md:text-base transition-all ${
            activeTab === 'paystack'
              ? 'bg-rose-600 text-white shadow-md font-bold'
              : 'text-muted-foreground hover:bg-muted/50'
          }`}
        >
          <CreditCard size={16} className="md:w-[18px] md:h-[18px]" />
          <span className="font-medium">Pay With Paystack</span>
        </button>
      )}

      {hasManual && (
        <button
          onClick={() => onChange('manual_bank_transfer')}
          className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 py-2 md:py-3 px-3 md:px-4 rounded-md md:rounded-lg text-sm md:text-base transition-all ${
            activeTab === 'manual_bank_transfer'
              ? 'bg-rose-600 text-white shadow-md font-bold'
              : 'text-muted-foreground hover:bg-muted/50'
          }`}
        >
          <Banknote size={16} className="md:w-[18px] md:h-[18px]" />
          <span className="font-medium">Manual Transfer</span>
        </button>
      )}
    </div>
  );
};

export default PaymentTabs;
