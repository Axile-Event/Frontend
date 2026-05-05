import React, { useState } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { validateCoupon } from "@/lib/api/coupons";

/**
 * CouponInput Component
 * 
 * Props:
 * - eventId (string)
 * - items (array of { category_name, quantity })
 * - onCouponApplied(result, code) - called when coupon is valid and applied
 * - onCouponRemoved() - called when user removes applied coupon
 * - disabled (boolean, optional) - disables input during booking submission
 */
export const CouponInput = ({
  eventId,
  items,
  onCouponApplied,
  onCouponRemoved,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [appliedResult, setAppliedResult] = useState(null);

  const handleApply = async () => {
    const code = inputValue.trim().toUpperCase();
    
    if (!code) {
      setError("Please enter a coupon code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Backend expects: { code: string, event_id: string }
      const result = await validateCoupon(code, eventId);
      
      // Success (2xx status) - we assume it's valid if request succeeds
      setAppliedResult(result);
      onCouponApplied(result, code);
      setError(null);
    } catch (err) {
      console.error("Coupon validation error:", err);
      // Backend returns 4xx with { error: "message" }
      const errorMsg = err?.response?.data?.error || err?.response?.data?.message || "Invalid or expired coupon code";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    setAppliedResult(null);
    setInputValue("");
    setError(null);
    onCouponRemoved();
  };

  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Enter coupon code"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={disabled || isLoading || !!appliedResult}
            className={cn(
              "uppercase font-medium tracking-wider",
              appliedResult && "bg-emerald-50 border-emerald-200 text-emerald-700",
              error && "border-red-300 focus-visible:ring-red-500"
            )}
          />
        </div>

        {!appliedResult && (
          <Button
            type="button"
            variant="outline"
            onClick={handleApply}
            disabled={disabled || isLoading || !inputValue.trim()}
            className="shrink-0 border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Apply"
            )}
          </Button>
        )}
      </div>

      {appliedResult && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
            <CheckCircle className="h-4 w-4" />
            <span>Coupon applied!</span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="text-xs text-muted-foreground hover:text-rose-600 underline transition-colors"
          >
            Remove
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-red-500 text-xs mt-1 animate-in fade-in slide-in-from-top-1">
          <XCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
