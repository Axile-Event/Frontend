"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = () => {
  return (
    <div className="flex h-full w-full items-center justify-center py-12">
      <div className="relative">
        {/* Subtle glowing ring */}
        <div className="absolute inset-0 bg-rose-500/10 blur-lg rounded-full scale-150 animate-pulse"></div>
        
        {/* Spinner */}
        <Loader2 className="w-6 h-6 text-rose-500 animate-spin relative z-10" />
      </div>
    </div>
  );
};

export default Loading;
