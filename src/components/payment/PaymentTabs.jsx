import React from 'react';
import { CreditCard, Banknote } from 'lucide-react';

const PaymentTabs = ({ activeTab, onChange }) => {
  return (
    <div className="flex p-1 bg-muted/30 rounded-xl border border-border/50">
      <button
        onClick={() => onChange('paystack')}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
          activeTab === 'paystack'
            ? 'bg-rose-600 text-white shadow-lg'
            : 'text-muted-foreground hover:bg-muted/50'
        }`}
      >
        <CreditCard size={18} />
        <span className="font-medium">Paystack</span>
      </button>
      <button
        onClick={() => onChange('manual')}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
          activeTab === 'manual'
            ? 'bg-rose-600 text-white shadow-lg'
            : 'text-muted-foreground hover:bg-muted/50'
        }`}
      >
        <Banknote size={18} />
        <span className="font-medium">Bank Transfer</span>
      </button>
    </div>
  );
};

export default PaymentTabs;
