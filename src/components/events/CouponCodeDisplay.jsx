"use client";

import React, { useState } from "react";
import { Copy, Check, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export const CouponCodeDisplay = ({ code, discountSummary }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0D0D0D] border border-rose-500/20 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 shadow-2xl shadow-rose-900/10 relative overflow-hidden group">
      {/* Decorative Background */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-colors" />
      
      <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 mb-2">
        <Tag className="w-6 h-6 text-rose-500" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white tracking-tight">Coupon Created!</h3>
        <p className="text-xs text-gray-500 font-medium">{discountSummary}</p>
      </div>

      <div 
        onClick={handleCopy}
        className="w-full relative group/code cursor-pointer"
      >
        <div className="absolute inset-0 bg-rose-500/10 blur-xl opacity-0 group-hover/code:opacity-100 transition-opacity" />
        <div className="relative bg-white/5 border border-white/10 rounded-xl px-8 py-4 flex items-center justify-between hover:border-rose-500/50 transition-all active:scale-[0.98]">
          <span className="font-mono text-2xl font-black text-white tracking-[0.2em] uppercase">
            {code}
          </span>
          <div className="p-2 rounded-lg bg-white/5 text-gray-400 group-hover/code:text-rose-500 transition-colors">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
        Share this code with your attendees
      </p>
    </div>
  );
};
