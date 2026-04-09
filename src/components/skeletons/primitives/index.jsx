"use client";

import { cn } from "@/lib/utils";

/**
 * SkeletonBox - Universal rectangular skeleton primitive
 * Accepts width, height, borderRadius for complete flexibility
 */
export const SkeletonBox = ({ 
  className, 
  width, 
  height, 
  borderRadius = "0.5rem",
  ...props 
}) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted/50 rounded-lg",
        className
      )}
      style={{
        width: width || "100%",
        height: height || "1rem",
        borderRadius,
      }}
      {...props}
    />
  );
};

/**
 * SkeletonLine - Text line skeleton primitive
 * For representing single or multiple lines of text
 */
export const SkeletonLine = ({ 
  className, 
  width = "100%", 
  height = "0.875rem",
  ...props 
}) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted/50 rounded",
        className
      )}
      style={{
        width,
        height,
      }}
      {...props}
    />
  );
};

/**
 * SkeletonCircle - Circular skeleton primitive
 * For avatars, icons, and circular elements
 */
export const SkeletonCircle = ({ 
  className, 
  size = "2.5rem",
  ...props 
}) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted/50 rounded-full shrink-0",
        className
      )}
      style={{
        width: size,
        height: size,
      }}
      {...props}
    />
  );
};
