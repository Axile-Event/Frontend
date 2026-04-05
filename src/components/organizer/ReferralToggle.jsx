"use client";

import React from "react";
import { motion } from "framer-motion";
import { Megaphone, Info } from "lucide-react";

/**
 * Toggle switch for enabling/disabling referral rewards on an event.
 * Auto-disables for free events with appropriate messaging.
 *
 * @param {Object} props
 * @param {boolean} props.enabled - Current toggle state
 * @param {Function} props.onChange - Callback (boolean)
 * @param {boolean} props.isFreeEvent - Whether the event is free
 * @param {string} props.error - Error message
 */
export default function ReferralToggle({ enabled, onChange, isFreeEvent = false, error }) {
  const disabled = isFreeEvent;

  return (
    <div className="space-y-3">
      <div
        className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
          enabled && !disabled
            ? "bg-rose-500/5 border-rose-500/20"
            : "bg-white/5 border-white/10"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={() => !disabled && onChange(!enabled)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl transition-colors ${
              enabled && !disabled
                ? "bg-rose-500/10 text-rose-500"
                : "bg-white/5 text-gray-500"
            }`}
          >
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Enable Referral Rewards</p>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">
              Let users promote your event and earn when tickets are used
            </p>
          </div>
        </div>

        {/* Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={enabled && !disabled}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onChange(!enabled);
          }}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none ${
            enabled && !disabled ? "bg-rose-600" : "bg-white/10"
          } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 ${
              enabled && !disabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {disabled && (
        <div className="flex items-start gap-2 px-3 py-2 bg-amber-500/5 border border-amber-500/10 rounded-xl">
          <Info className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-[10px] text-amber-400 font-medium">
            Referral rewards are not available for free events. Switch to paid pricing to enable.
          </p>
        </div>
      )}

      {error && (
        <p className="text-[10px] text-rose-500 font-bold px-1">{error}</p>
      )}
    </div>
  );
}
