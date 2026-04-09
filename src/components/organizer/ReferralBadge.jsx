"use client";

import React from "react";
import { Megaphone, X } from "lucide-react";

/**
 * Compact badge displaying referral config status on event cards.
 *
 * @param {Object} props
 * @param {boolean} props.useReferral - Whether referral is enabled
 * @param {string} props.rewardType - "flat" | "percentage"
 * @param {number|string} props.rewardAmount - Flat amount
 * @param {number|string} props.rewardPercentage - Percentage value
 * @param {string} props.size - "sm" | "md" (default: "sm")
 */
export default function ReferralBadge({
  useReferral,
  rewardType,
  rewardAmount,
  rewardPercentage,
  size = "sm",
}) {
  if (!useReferral) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-white/5 bg-white/5 ${
          size === "md" ? "text-xs" : "text-[9px]"
        } font-bold text-gray-500 uppercase tracking-wider`}
      >
        <X className="w-2.5 h-2.5" />
        Referral Off
      </span>
    );
  }

  const displayValue =
    rewardType === "flat"
      ? `₦${Number(rewardAmount || 0).toLocaleString()}`
      : `${rewardPercentage || 0}%`;

  const typeLabel = rewardType === "flat" ? "Flat" : "Pct";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border backdrop-blur-md ${
        size === "md" ? "text-xs px-3 py-1.5" : "text-[9px]"
      } font-bold uppercase tracking-wider bg-rose-500/10 border-rose-500/20 text-rose-400`}
    >
      <Megaphone className={size === "md" ? "w-3.5 h-3.5" : "w-2.5 h-2.5"} />
      <span>{displayValue}</span>
      <span className="text-rose-500/50">·</span>
      <span className="text-rose-500/70">{typeLabel}</span>
    </span>
  );
}
