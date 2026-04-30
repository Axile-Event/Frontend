"use client";

import React from "react";
import { Controller } from "react-hook-form";
import { Tag, Trash2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select-component";
import { generateCouponCode } from "@/lib/utils/coupon";
import DateTimePicker from "@/components/ui/DateTimePicker";

export const CouponSetup = ({ 
  control, 
  watch, 
  setValue, 
  existingCoupons = [], 
  onDeleteCoupon 
}) => {
  const enableCoupon = watch("enable_coupon");
  const discountType = watch("discount_type") || "percentage";
  const discountValue = watch("discount_value");
  const couponCode = watch("coupon_code");

  const handleGenerateCode = () => {
    const code = generateCouponCode();
    setValue("coupon_code", code, { shouldValidate: true });
  };

  const getPreviewText = () => {
    if (!discountType || !discountValue || !couponCode) return null;
    const valueStr = discountType === "percentage" ? `${discountValue}%` : `₦${Number(discountValue).toLocaleString()}`;
    return `Buyers get ${valueStr} off with code ${couponCode}`;
  };

  return (
    <Card className="border-white/10 bg-white/5 text-white overflow-hidden mt-8">
      <CardHeader className="border-b border-white/10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-500/20 rounded-lg">
              <Tag className="w-5 h-5 text-rose-500" />
            </div>
            <CardTitle className="text-xl font-bold">Coupon / Discount</CardTitle>
          </div>
          <Controller
            name="enable_coupon"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <Label htmlFor="enable_coupon" className="cursor-pointer text-xs font-medium uppercase tracking-wider text-gray-400">
                  {field.value ? "Enabled" : "Disabled"}
                </Label>
                <Switch
                  id="enable_coupon"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-rose-500"
                />
              </div>
            )}
          />
        </div>
      </CardHeader>
      
      {enableCoupon && (
        <CardContent className="p-6 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Existing Coupons List */}
          {existingCoupons.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Coupons</h4>
              <div className="grid gap-3">
                {existingCoupons.map((coupon) => (
                  <div 
                    key={coupon.coupon_code}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-rose-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                        <Tag className="w-5 h-5 text-rose-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-mono text-white font-bold tracking-wider">{coupon.coupon_code}</span>
                        <span className="text-xs text-gray-400">
                          {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `₦${Number(coupon.discount_value).toLocaleString()}`} discount
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteCoupon(coupon.coupon_code)}
                      className="text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-gray-300">Discount Type</Label>
              <Controller
                name="discount_type"
                control={control}
                rules={{ required: enableCoupon }}
                defaultValue="percentage"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || "percentage"}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-rose-500/50">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#121212] border-white/10 text-white">
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="flat">Flat Amount (₦)</SelectItem>
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
                    min: { value: 1, message: "Value must be greater than 0" },
                    max: discountType === "percentage" ? { value: 100, message: "Max 100%" } : undefined
                  }}
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        {...field}
                        type="number"
                        placeholder={discountType === "percentage" ? "10" : "500"}
                        className={`bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-rose-500/50 pr-10 ${fieldState.error ? 'border-rose-500/50' : ''}`}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none font-bold">
                        {discountType === "percentage" ? "%" : "₦"}
                      </div>
                      {fieldState.error && (
                        <p className="text-[10px] text-rose-500 mt-1.5 font-medium ml-1">{fieldState.error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-gray-300">Coupon Code</Label>
              <div className="flex gap-2">
                <Controller
                  name="coupon_code"
                  control={control}
                  rules={{ required: enableCoupon ? "Coupon code is required" : false }}
                  render={({ field, fieldState }) => (
                    <div className="flex-1">
                      <Input
                        {...field}
                        placeholder="e.g. SAVE20"
                        className={`bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-rose-500/50 uppercase font-mono tracking-widest ${fieldState.error ? 'border-rose-500/50' : ''}`}
                      />
                      {fieldState.error && (
                        <p className="text-[10px] text-rose-500 mt-1.5 font-medium ml-1">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleGenerateCode}
                  className="h-12 border-white/10 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 text-white rounded-xl transition-all"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-gray-300">Usage Limit (Optional)</Label>
              <Controller
                name="usage_limit"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder="Unlimited"
                    className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-rose-500/50"
                    onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                    value={field.value || ""}
                  />
                )}
              />
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-gray-300">Expiry Date (Optional)</Label>
              <Controller
                name="expiry_date"
                control={control}
                render={({ field, fieldState }) => (
                  <DateTimePicker
                    selected={field.value}
                    onChange={field.onChange}
                    placeholder="Select expiry date"
                    hasError={!!fieldState.error}
                  />
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
        </CardContent>
      )}
    </Card>
  );
};
