"use client";

import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { Tag, Calendar, Layers, CheckCircle2, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select-component";
import DateTimePicker from "@/components/ui/DateTimePicker";
import { Badge } from "@/components/ui/badge";

export const CouponSetup = ({ 
  control, 
  watch, 
  setValue, 
  existingCoupons = [], 
  ticketCategories = []
}) => {
  const enableCoupon = watch("enable_coupon");
  const discountType = watch("discount_type") || "percent";
  const discountValue = watch("discount_value");
  const startsAt = watch("starts_at");
  const endsAt = watch("ends_at");

  const getPreviewText = () => {
    if (!discountType || !discountValue) return null;
    const valueStr = discountType === "percent" ? `${discountValue}%` : `₦${Number(discountValue).toLocaleString()}`;
    return `Buyers get ${valueStr} off the subtotal`;
  };

  const validateDates = () => {
    if (startsAt && endsAt) {
      if (new Date(endsAt) <= new Date(startsAt)) {
        return "End date must be after start date";
      }
    }
    return true;
  };

  return (
    <div className="space-y-4 pt-4 border-t border-white/5">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-2">
        <Tag className="w-4 h-4 text-rose-500" />
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          Coupon / Discount
        </h3>
      </div>

      {/* Toggle Row */}
      <Controller
        name="enable_coupon"
        control={control}
        render={({ field }) => (
          <div
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
              field.value
                ? "bg-rose-500/5 border-rose-500/20"
                : "bg-white/5 border-white/10"
            } cursor-pointer`}
            onClick={() => field.onChange(!field.value)}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl transition-colors ${
                  field.value
                    ? "bg-rose-500/10 text-rose-500"
                    : "bg-white/5 text-gray-500"
                }`}
              >
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Enable Coupon Codes</p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                  Allow buyers to use discount codes during checkout
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`text-[10px] font-bold uppercase tracking-widest ${field.value ? 'text-rose-500' : 'text-gray-600'}`}>
                {field.value ? "Enabled" : "Disabled"}
              </div>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                className="data-[state=checked]:bg-rose-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      />
      
      {enableCoupon && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300 mt-4">
          {/* Existing Coupons List */}
          {existingCoupons.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Coupons</h4>
              <div className="grid gap-3">
                {existingCoupons.map((coupon) => (
                  <div 
                    key={coupon.code}
                    className="flex flex-col p-4 rounded-xl bg-white/5 border border-white/10 hover:border-rose-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                          <Tag className="w-5 h-5 text-rose-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-mono text-white font-bold tracking-wider text-base uppercase">{coupon.code}</span>
                          <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest">
                            {coupon.discount_type === "percent" ? `${coupon.discount_value}% OFF` : `₦${Number(coupon.discount_value).toLocaleString()} OFF`}
                          </span>
                        </div>
                      </div>
                      <Badge variant={coupon.is_active ? "success" : "secondary"} className={coupon.is_active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-white/5 text-gray-500 border-white/10"}>
                        {coupon.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter flex items-center gap-1">
                          <Layers className="w-2.5 h-2.5" /> Scope
                        </span>
                        <span className="text-[10px] text-gray-300 font-medium">
                          {coupon.category_id ? (ticketCategories.find(c => c.category_id === coupon.category_id)?.name || "Specific Category") : "All categories"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Uses
                        </span>
                        <span className="text-[10px] text-gray-300 font-medium">
                          {coupon.redemptions_count} / {coupon.max_redemptions || "∞"} used
                        </span>
                      </div>
                      {(coupon.starts_at || coupon.ends_at) && (
                        <div className="col-span-2 flex flex-col gap-1">
                          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> Validity
                          </span>
                          <span className="text-[10px] text-gray-300 font-medium">
                            {coupon.starts_at ? new Date(coupon.starts_at).toLocaleDateString() : "Now"} – {coupon.ends_at ? new Date(coupon.ends_at).toLocaleDateString() : "Forever"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Coupon Form Fields */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2.5">
                <Label className="text-sm font-semibold text-gray-300">Discount Type</Label>
                <Controller
                  name="discount_type"
                  control={control}
                  rules={{ required: enableCoupon }}
                  defaultValue="percent"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || "percent"}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-rose-500/50">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#121212] border-white/10 text-white">
                        <SelectItem value="percent">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Flat Amount (₦)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-sm font-semibold text-gray-300">Discount Value</Label>
                <div className="relative">
                  <Controller
                    name="discount_value"
                    control={control}
                    rules={{ 
                      required: enableCoupon ? "Discount value is required" : false,
                      min: { value: 0.01, message: "Value must be at least 0.01" },
                      max: discountType === "percent" ? { value: 100, message: "Max 100%" } : undefined
                    }}
                    render={({ field, fieldState }) => (
                      <>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder={discountType === "percent" ? "10" : "500"}
                          className={`bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-rose-500/50 pr-10 ${fieldState.error ? 'border-rose-500/50' : ''}`}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none font-bold">
                          {discountType === "percent" ? "%" : "₦"}
                        </div>
                        {fieldState.error && (
                          <p className="text-[10px] text-rose-500 mt-1.5 font-medium ml-1">{fieldState.error.message}</p>
                        )}
                      </>
                    )}
                  />
                </div>
              </div>

              {ticketCategories.length > 0 && (
                <div className="space-y-2.5 md:col-span-2">
                  <Label className="text-sm font-semibold text-gray-300">Apply to</Label>
                  <Controller
                    name="category_id"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-rose-500/50">
                          <SelectValue placeholder="All ticket categories" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#121212] border-white/10 text-white">
                          <SelectItem value="">All ticket categories</SelectItem>
                          {ticketCategories.map((cat) => (
                            <SelectItem key={cat.category_id || cat.id} value={cat.category_id || cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}

              <div className="space-y-2.5">
                <Label className="text-sm font-semibold text-gray-300">Valid from (Optional)</Label>
                <Controller
                  name="starts_at"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Start date & time"
                    />
                  )}
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-sm font-semibold text-gray-300">Valid until (Optional)</Label>
                <Controller
                  name="ends_at"
                  control={control}
                  rules={{ validate: validateDates }}
                  render={({ field, fieldState }) => (
                    <>
                      <DateTimePicker
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="End date & time"
                        hasError={!!fieldState.error}
                      />
                      {fieldState.error && (
                        <p className="text-[10px] text-rose-500 mt-1.5 font-medium ml-1">{fieldState.error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>

              <div className="space-y-2.5 md:col-span-2">
                <Label className="text-sm font-semibold text-gray-300">Max uses (leave blank for unlimited)</Label>
                <Controller
                  name="max_redemptions"
                  control={control}
                  rules={{ min: { value: 1, message: "Min 1 redemption" } }}
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Unlimited"
                        className={`bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-rose-500/50 ${fieldState.error ? 'border-rose-500/50' : ''}`}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                        value={field.value || ""}
                      />
                      {fieldState.error && (
                        <p className="text-[10px] text-rose-500 mt-1.5 font-medium ml-1">{fieldState.error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>
            </div>

            {getPreviewText() && (
              <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <p className="text-sm text-gray-300">
                  <span className="font-bold text-rose-500 uppercase text-[10px] tracking-widest mr-2">Preview</span> 
                  {getPreviewText()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
