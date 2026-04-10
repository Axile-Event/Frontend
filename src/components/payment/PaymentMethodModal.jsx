"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Banknote, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function PaymentMethodModal({ 
  isOpen, 
  onClose, 
  onSelectMethod,
  allowedMethods = ["paystack", "manual_bank_transfer"],
  loading = false 
}) {
  const hasPaystack = allowedMethods.includes('paystack');
  const hasManual = allowedMethods.includes('manual_bank_transfer');

  const handleSelect = (method) => {
    onSelectMethod(method);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={loading}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {/* Header */}
            <div className="mb-8 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-rose-500" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Select Payment Method</h2>
              </div>
              <p className="text-sm text-gray-400">Choose how you'd like to pay for your tickets</p>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
              {/* Paystack Option */}
              {hasPaystack && (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect('paystack')}
                  disabled={loading}
                  className="w-full p-5 rounded-3xl border-2 border-white/5 bg-white/[0.02] hover:border-rose-500/50 hover:bg-rose-500/5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-600/10 flex items-center justify-center group-hover:bg-rose-600/20 transition-colors shrink-0">
                      <CreditCard className="w-6 h-6 text-rose-500" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-base font-black text-white mb-1">Paystack</p>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                        Instant payment (credit card, bank transfer, etc.). Tickets issued immediately.
                      </p>
                      <div className="mt-3 flex items-center gap-1.5">
                        <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-widest">
                          ✓ Auto-confirmed
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              )}

              {/* Manual Transfer Option */}
              {hasManual && (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect('manual_bank_transfer')}
                  disabled={loading}
                  className="w-full p-5 rounded-3xl border-2 border-white/5 bg-white/[0.02] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors shrink-0">
                      <Banknote className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-base font-black text-white mb-1">Bank Transfer</p>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                        Manual verification (direct bank transfer, verified within 12-24 hours).
                      </p>
                      <div className="mt-3 flex items-center gap-1.5">
                        <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 uppercase tracking-widest">
                          ⏱ Manual verify
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              )}
            </div>


            {/* Info Box */}
            <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                Both methods are secure and safe. You'll receive a confirmation email with your tickets once payment is verified.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
