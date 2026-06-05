import React from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const SavingsCallout = ({ savings, className }) => {
  if (!savings || savings <= 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium",
        className
      )}
    >
      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      <span>You&apos;re saving ₦{savings.toLocaleString()} on this order!</span>
    </div>
  );
};
