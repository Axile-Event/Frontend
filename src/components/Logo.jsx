import React from "react";
import { cn } from "@/lib/utils";

const Logo = ({
  className,
  iconSize = "h-8 w-8",
  textSize = "text-xl",
  showText = true,
}) => {
  return (
    <div className={cn("flex items-center gap-2 text-foreground", className)}>
      {showText ? (
        <img
          src="/axile frame 2 (1).png"
          alt="Axile"
          className={cn("h-8 w-auto object-contain", className)}
          style={{ height: "32px" }}
        />
      ) : (
        <img
          src="/Axile logo.png"
          alt="Axile"
          className={cn("object-contain", iconSize)}
        />
      )}
    </div>
  );
};

export default Logo;
