"use client";

import { SkeletonBox, SkeletonLine } from "../primitives";

/**
 * EventCardSkeleton
 * Single event card skeleton for reuse in grids
 * Matches the aspect-[4/3] card layout used in public/student events pages
 */
export const EventCardSkeleton = () => {
  return (
    <div className="bg-[#111] border border-gray-800/50 rounded-2xl overflow-hidden flex flex-col h-[380px]">
      <div className="relative aspect-[16/10] bg-zinc-950">
        <SkeletonBox height="100%" borderRadius="0" />
      </div>

      <div className="p-5 md:p-6 space-y-6 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <SkeletonLine width="90%" height="1.5rem" />
          <div className="flex gap-4">
             <SkeletonLine width="60px" height="0.75rem" />
             <SkeletonLine width="50px" height="0.75rem" />
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
          <SkeletonLine width="100px" height="0.75rem" />
          <SkeletonBox width="32px" height="32px" borderRadius="100%" />
        </div>
      </div>
    </div>
  );
};

/**
 * EventsGridSkeleton
 * Full events page skeleton with header, filters, and cards grid
 * Matches /events/page.jsx and /dashboard/user/events/page.jsx
 */
export const EventsGridSkeleton = ({ showBackButton = false }) => {
  return (
    <div className="space-y-6 md:space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <SkeletonLine width="200px" height="2.5rem" />
          <SkeletonLine width="280px" height="1rem" />
        </div>
        <SkeletonBox width="100%" height="56px" borderRadius="1rem" className="md:w-80" />
      </div>

      {/* Filters */}
      <div className="flex gap-2 pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonBox 
            key={i} 
            width={i === 1 ? "80px" : "100px"} 
            height="44px" 
            borderRadius="0.75rem" 
          />
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export default EventsGridSkeleton;
