"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Premium Custom Dropdown Component
 * @param {Object} props
 * @param {string} props.label - Optional label for the dropdown
 * @param {string|number} props.value - Current selected value
 * @param {Function} props.onChange - Handler for value change
 * @param {Array} props.options - Array of objects { value, label, icon? }
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.className - Additional class names for container
 * @param {boolean} props.searchable - Whether to enable search in options
 * @param {string} props.error - Error message if any
 */
export default function CustomDropdown({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  className = "",
  searchable = false,
  error = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle options format
  const getLabel = (opt) => (typeof opt === "object" ? opt.label : opt);
  const getValue = (opt) => (typeof opt === "object" ? opt.value : opt);

  const selectedOption = options.find((opt) => getValue(opt) === value);
  const displayLabel = selectedOption ? getLabel(selectedOption) : placeholder;

  const filteredOptions = searchable
    ? options.filter((opt) =>
        getLabel(opt).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  return (
    <div className={cn("relative w-full space-y-1.5", className)} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-white/5 border rounded-2xl px-5 py-3.5 text-sm text-left flex items-center justify-between transition-all duration-300 backdrop-blur-md",
          isOpen
            ? "border-rose-500/50 ring-4 ring-rose-500/10 shadow-lg shadow-rose-500/5"
            : error
            ? "border-rose-600/50"
            : "border-white/5 hover:border-white/10 hover:bg-white/[0.07]",
          !selectedOption && "text-gray-500 font-medium"
        )}
      >
        <span className="truncate pr-4 flex items-center gap-2">
          {selectedOption?.icon && <selectedOption.icon className="w-4 h-4 text-rose-500" />}
          {displayLabel}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-500 transition-transform duration-300 shrink-0",
            isOpen && "rotate-180 text-rose-500"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute z-50 w-full mt-2 bg-[#0C0C0C]/95 border border-white/5 rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-xl overflow-hidden ring-1 ring-white/10"
          >
            {searchable && (
              <div className="p-3 border-b border-white/5 relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500/50 transition-all font-medium"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            <div className="max-h-64 overflow-y-auto custom-scrollbar p-1.5">
              {filteredOptions.length === 0 ? (
                <div className="py-10 text-center text-gray-600 text-xs font-bold uppercase tracking-widest">
                  Nothing found
                </div>
              ) : (
                filteredOptions.map((option, idx) => {
                  const optValue = getValue(option);
                  const optLabel = getLabel(option);
                  const isSelected = optValue === value;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onChange(optValue);
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl text-sm flex items-center justify-between transition-all group relative overflow-hidden",
                        isSelected
                          ? "bg-rose-600/10 text-rose-500"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {option.icon && (
                          <option.icon className={cn("w-4 h-4", isSelected ? "text-rose-500" : "text-gray-500 group-hover:text-rose-400")} />
                        )}
                        <span className={cn("font-medium", isSelected && "font-bold")}>{optLabel}</span>
                      </div>
                      
                      {isSelected && (
                        <motion.div
                          layoutId="selected-indicator"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-rose-500/20 p-1 rounded-full"
                        >
                          <Check className="w-3.5 h-3.5 text-rose-500" />
                        </motion.div>
                      )}

                      {!isSelected && (
                        <div className="absolute inset-y-0 left-0 w-1 bg-rose-500 -translate-x-full group-hover:translate-x-0 transition-transform" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-[10px] text-rose-500 font-bold ml-1 animate-pulse">
          {error}
        </p>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
