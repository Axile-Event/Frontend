import React from "react";
import { cn } from "@/lib/utils";

const Logo = ({
  className,
  iconSize = "h-10 w-10",
  textSize = "text-xl",
  showText = true,
}) => {
  return (
    <div className={cn("flex items-center gap-2 text-foreground", className)}>
      <img
        src="/Axile logo.png"
        alt="Axile"
        className={cn("object-contain", iconSize)}
      />
      {showText && (
        <span className={cn("font-bold tracking-tight", textSize)}>Axile</span>
      )}
    </div>
  );
};

export default Logo;
