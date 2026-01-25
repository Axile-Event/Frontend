import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const Logo = ({ className, iconSize = "h-6 w-auto", scale = "scale-[3]" }) => {
  return (
    <div className={cn("flex items-center justify-center overflow-visible", className)} style={{ isolation: 'isolate' }}>
        <Image 
          src="/axile-logo-main.png" 
          alt="Axile Logo" 
          width={220} 
          height={75} 
          className={cn("object-contain origin-center transform-gpu", iconSize, scale)}
          style={{ margin: 0, padding: 0 }}
          priority
        />
    </div>
  );
};

export default Logo;
