import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function Select({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option",
  className 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle options that are strings or objects { value, label }
  const getOptionLabel = (opt) => (typeof opt === 'object' ? opt.label : opt);
  const getOptionValue = (opt) => (typeof opt === 'object' ? opt.value : opt);

  const selectedOption = options.find(opt => getOptionValue(opt) === value);
  const displayValue = selectedOption ? getOptionLabel(selectedOption) : placeholder;

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {label && (
        <label className="block text-[10px] font-bold text-gray-500 mb-2">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-[#18181b] border rounded-xl px-4 py-3 text-left flex items-center justify-between transition-all duration-200",
          isOpen ? "border-rose-600 ring-1 ring-rose-600/50" : "border-white/10 hover:border-white/20",
          !selectedOption && "text-gray-500"
        )}
      >
        <span className="truncate text-white">{displayValue}</span>
        <ChevronDown 
          size={18} 
          className={cn("text-gray-500 transition-transform duration-200", isOpen && "rotate-180")} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
          >
            <div className="p-1">
              {options.map((option, idx) => {
                const optValue = getOptionValue(option);
                const optLabel = getOptionLabel(option);
                const isSelected = optValue === value;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onChange(optValue);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors",
                      isSelected 
                        ? "bg-rose-600 text-white font-medium" 
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span className="truncate">{optLabel}</span>
                    {isSelected && <Check size={16} />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
