import React from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const Logo = ({ className, iconSize = "h-6 w-6", textSize = "text-xl", showText = true }) => {
  return (
    <div className={cn("flex items-center gap-2 text-foreground", className)}>
      <div className="flex items-center justify-center">
        <Zap className={cn("fill-current", iconSize)} />
      </div>
      {showText && <span className={cn("font-bold tracking-tight", textSize)}>Radar</span>}
    </div>
  );
};

export default Logo;
