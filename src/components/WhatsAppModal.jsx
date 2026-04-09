"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WHATSAPP_GROUP_LINK } from '@/lib/whatsapp';

const WhatsAppModal = ({ show, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      const hasSeenModal = localStorage.getItem('whatsapp_modal_shown');
      if (!hasSeenModal) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [show]);

  const handleClose = () => {
    localStorage.setItem('whatsapp_modal_shown', 'true');
    setIsVisible(false);
    onClose?.();
  };

  const handleFollow = () => {
    localStorage.setItem('whatsapp_modal_shown', 'true');
    window.open(WHATSAPP_GROUP_LINK, '_blank');
    setIsVisible(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-sm"
          >
            <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>

              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center mx-auto">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Follow us on WhatsApp
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get updates on upcoming events and announcements
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    onClick={handleFollow}
                    className="w-full h-11 bg-[#25D366] hover:bg-[#20BD5A] text-white font-medium"
                  >
                    Follow Channel
                  </Button>
                  <button
                    onClick={handleClose}
                    className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Not now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WhatsAppModal;
