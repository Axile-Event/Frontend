import React from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const Logo = ({ className, iconSize = "h-5 w-5", textSize = "text-xl", showText = true }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
        <Zap className={cn("text-white fill-white", iconSize)} />
      </div>
      {showText && <span className={cn("font-bold tracking-tight", textSize)}>Radar</span>}
    </div>
  );
};

export default Logo;
