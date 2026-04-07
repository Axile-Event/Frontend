"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Percent, ChevronDown, Check } from "lucide-react";
import { fetchReferralRewardTypes } from "@/lib/referral";

/**
 * Referral config fields: reward type select + value input.
 * Only renders when referral is enabled.
 */
export default function ReferralConfigFields({
  rewardType = "",
  rewardAmount = "",
  rewardPercentage = "",
  onTypeChange,
  onAmountChange,
  onPercentageChange,
  errors = {},
}) {
  const [rewardTypes, setRewardTypes] = useState([
    { value: "flat", label: "Flat amount" },
    { value: "percentage", label: "Percentage" },
  ]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    fetchReferralRewardTypes()
      .then((types) => {
        if (mounted && types.length > 0) setRewardTypes(types);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const selectedType = rewardTypes.find((t) => t.value === rewardType);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="space-y-4"
      style={{ overflow: "visible" }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Reward Type Select */}
        <div className="space-y-1.5 relative" ref={dropdownRef}>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Reward Type <span className="text-rose-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between transition-all ${
              dropdownOpen
                ? "border-rose-500/50 ring-1 ring-rose-500/20"
                : errors.referral_reward_type
                ? "border-rose-500/50"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            <span className="flex items-center gap-2 text-white">
              {selectedType ? (
                <>
                  {selectedType.value === "flat" ? (
                    <DollarSign className="w-3.5 h-3.5 text-rose-500" />
                  ) : (
                    <Percent className="w-3.5 h-3.5 text-rose-500" />
                  )}
                  {selectedType.label}
                </>
              ) : (
                <span className="text-gray-500">Select reward type</span>
              )}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180 text-rose-500" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute z-[100] w-full mt-1 bg-[#0C0C0C] border border-white/10 rounded-xl shadow-2xl shadow-black/80 backdrop-blur-xl"
                style={{ top: "100%" }}
              >
                <div className="p-1.5">
                  {rewardTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        onTypeChange(type.value);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm flex items-center justify-between transition-all ${
                        rewardType === type.value
                          ? "bg-rose-600/10 text-rose-500"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {type.value === "flat" ? (
                          <DollarSign className="w-3.5 h-3.5" />
                        ) : (
                          <Percent className="w-3.5 h-3.5" />
                        )}
                        {type.label}
                      </span>
                      {rewardType === type.value && (
                        <Check className="w-3.5 h-3.5 text-rose-500" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {errors.referral_reward_type && (
            <p className="text-[10px] text-rose-500 font-bold">
              {errors.referral_reward_type}
            </p>
          )}
        </div>

        {/* Reward Value Input */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            {rewardType === "percentage" ? "Percentage (0–100)" : "Amount (₦)"}{" "}
            <span className="text-rose-500">*</span>
          </label>
          {rewardType === "flat" ? (
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">
                ₦
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={rewardAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, "");
                  onAmountChange(val);
                }}
                placeholder="e.g. 500"
                className={`w-full pl-8 bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all ${
                  errors.referral_reward_amount
                    ? "border-rose-500/50 focus:border-rose-500"
                    : "border-white/10 focus:border-rose-500"
                }`}
              />
            </div>
          ) : rewardType === "percentage" ? (
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={rewardPercentage}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || (Number(val) >= 0 && Number(val) <= 100)) {
                    onPercentageChange(val);
                  }
                }}
                placeholder="e.g. 10"
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all pr-10 ${
                  errors.referral_reward_percentage
                    ? "border-rose-500/50 focus:border-rose-500"
                    : "border-white/10 focus:border-rose-500"
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">
                %
              </span>
            </div>
          ) : (
            <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-600 italic">
              Select a reward type first
            </div>
          )}

          {errors.referral_reward_amount && rewardType === "flat" && (
            <p className="text-[10px] text-rose-500 font-bold">
              {errors.referral_reward_amount}
            </p>
          )}
          {errors.referral_reward_percentage && rewardType === "percentage" && (
            <p className="text-[10px] text-rose-500 font-bold">
              {errors.referral_reward_percentage}
            </p>
          )}
        </div>
      </div>

      {/* Summary hint */}
      {rewardType && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-2 px-3 py-2.5 bg-rose-500/5 border border-rose-500/10 rounded-xl"
        >
          <p className="text-[10px] text-rose-300 font-medium leading-relaxed">
            {rewardType === "flat"
              ? rewardAmount
                ? `Referees earn ₦${Number(rewardAmount).toLocaleString()} per ticket sold through their link.`
                : "Referees will earn a fixed amount per ticket sold."
              : rewardPercentage
              ? `Referees earn ${rewardPercentage}% of each ticket price sold through their link.`
              : "Referees will earn a percentage of each ticket price."}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
