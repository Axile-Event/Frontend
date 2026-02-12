"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WHATSAPP_GROUP_LINK } from "@/lib/whatsapp";

const WHATSAPP_ICON_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

const FloatingWhatsApp = () => {
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [justCollapsed, setJustCollapsed] = useState(false);
  
  const collapseTimerRef = useRef(null);
  const switchTimerRef = useRef(null);
  const isReload = useRef(false);

  useEffect(() => {
    setMounted(true);

    // Immediate reload detection on mount
    let reloadDetected = false;
    if (typeof window !== "undefined") {
      try {
        const nav = performance.getEntriesByType("navigation");
        if (nav.length > 0) {
          reloadDetected = nav[0].type === "reload";
        } else {
          reloadDetected = window.performance?.navigation?.type === 1;
        }
      } catch {
        reloadDetected = window.performance?.navigation?.type === 1;
      }
    }
    isReload.current = reloadDetected;

    if (reloadDetected) {
      setCollapsed(true);
      setShowCard(false);
    } else {
      setShowCard(true);
      setCollapsed(false);

      // Auto-collapse after 10 seconds
      collapseTimerRef.current = setTimeout(() => {
        handleCollapse();
      }, 10000);
    }

    return () => {
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
    };
  }, []);

  const handleCollapse = () => {
    setShowCard(false);
    // Wait for the card's exit animation before showing the icon
    switchTimerRef.current = setTimeout(() => {
      setCollapsed(true);
      setJustCollapsed(true);
      // Reset the bounce flag after animation
      setTimeout(() => setJustCollapsed(false), 1000);
    }, 400);
  };

  const handleJoinClick = () => {
    window.open(WHATSAPP_GROUP_LINK, "_blank");
    // Collapse immediately if button is clicked
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    handleCollapse();
  };

  const handleIconClick = () => {
    window.open(WHATSAPP_GROUP_LINK, "_blank");
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[999999] md:bottom-10 md:right-10">
      <AnimatePresence>
        {!collapsed && showCard && (
          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 22,
            }}
            className="bg-[#25D366] rounded-2xl p-4 shadow-2xl w-[280px]"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                  <path d={WHATSAPP_ICON_PATH} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white leading-snug">
                  Join our WhatsApp community channel
                </p>
                <p className="text-[11px] text-white/80 mt-1 leading-snug">
                  For more updates about events
                </p>
              </div>
            </div>

            <button
              onClick={handleJoinClick}
              className="w-full mt-3 py-2.5 px-4 bg-white hover:bg-white/90 text-[#25D366] text-sm font-semibold rounded-xl transition-colors active:scale-[0.97]"
            >
              Join Community
            </button>
          </motion.div>
        )}

        {collapsed && (
          <motion.button
            key="icon"
            initial={{ opacity: 0, scale: isReload.current ? 1 : 0.5 }}
            animate={{
              opacity: 1,
              scale: justCollapsed ? [0.5, 1.2, 1] : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleIconClick}
            className="w-14 h-14 bg-[#25D366] hover:bg-[#20BD5A] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_25px_rgba(37,211,102,0.5)] transition-all duration-200"
            aria-label="Join WhatsApp Community"
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current">
              <path d={WHATSAPP_ICON_PATH} />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingWhatsApp;
