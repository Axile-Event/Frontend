import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function Select({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option",
  className,
  searchable = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, searchable]);

  // Handle options that are strings or objects { value, label }
  const getOptionLabel = (opt) => (typeof opt === 'object' ? opt.label : opt);
  const getOptionValue = (opt) => (typeof opt === 'object' ? opt.value : opt);

  const selectedOption = options.find(opt => getOptionValue(opt) === value);
  const displayValue = selectedOption ? getOptionLabel(selectedOption) : placeholder;

  // Filter options based on search query
  const filteredOptions = searchable && searchQuery
    ? options.filter(opt => 
        getOptionLabel(opt).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {label && (
        <label className="block text-[10px] font-bold text-gray-500 mb-2">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearchQuery('');
        }}
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
            className="absolute z-50 w-full mt-2 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            {searchable && (
              <div className="p-2 border-b border-white/10 sticky top-0 bg-[#18181b]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600/50"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
            <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-6 text-center text-gray-500 text-sm">
                  No results found
                </div>
              ) : (
                filteredOptions.map((option, idx) => {
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
                        setSearchQuery('');
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
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
