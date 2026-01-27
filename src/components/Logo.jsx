import React from "react";
import { cn } from "@/lib/utils";

const Logo = ({ className, iconSize = "h-14 w-auto", style }) => {
  return (
    <div 
      className={cn("flex items-center justify-center", className)} 
      style={{ isolation: 'isolate', ...style }}
    >
        <img 
          src="/axile-logo-main.png?v=9" 
          alt="Axile Logo" 
          className={cn("object-contain origin-center transform-gpu", iconSize)}
        />
    </div>
  );
};

export default Logo;
