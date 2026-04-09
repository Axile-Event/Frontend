"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // When the route changes, we trigger a short animation
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // Duration of the animation

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{ scaleX: 0, opacity: 0, originX: 0 }}
          animate={{ 
            scaleX: [0, 0.7, 0.9, 1], 
            opacity: 1 
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.8, 
            times: [0, 0.2, 0.8, 1],
            ease: "easeInOut" 
          }}
          className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-rose-500 via-rose-600 to-rose-400 z-[9999] shadow-[0_0_15px_rgba(225,29,72,0.6)]"
        />
      )}
    </AnimatePresence>
  );
}
