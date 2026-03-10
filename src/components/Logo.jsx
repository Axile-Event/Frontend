"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const Logo = ({ className, iconSize = "h-16 w-auto", scale = "scale-100", style }) => {
  const { resolvedTheme } = useTheme();
  
  // Use different logo based on theme to ensure visibility
  const logoSrc = resolvedTheme === "dark" 
    ? "/axile-logo-main.png?v=9"  // Light colored logo for dark backgrounds
    : "/axile-logo-main.png?v=9"; // Same for now, can be changed if you have a dark variant
  
  return (
    <div 
      className={cn("flex items-center justify-center", className)} 
      style={{ isolation: 'isolate', ...style }}
    >
        <img 
          src={logoSrc}
          alt="Axile Logo" 
          className={cn("object-contain origin-center transform-gpu", iconSize, scale)}
        />
    </div>
  );
};

export default Logo;
