"use client";

import { SkeletonBox, SkeletonLine } from "../primitives";

/**
 * EventCardSkeleton
 * Single event card skeleton for reuse in grids
 * Matches the aspect-[4/3] card layout used in public/student events pages
 */
export const EventCardSkeleton = () => {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#0F0F16] border border-white/10">
      <SkeletonBox height="100%" borderRadius="0" />
      
      {/* Badges */}
      <div className="absolute top-4 right-4">
        <SkeletonBox width="70px" height="28px" borderRadius="999px" />
      </div>
      <div className="absolute top-4 left-4">
        <SkeletonBox width="80px" height="26px" borderRadius="999px" />
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
        <SkeletonLine width="80%" height="1.5rem" className="mb-3" />
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <SkeletonBox width="16px" height="16px" />
            <SkeletonLine width="120px" height="0.875rem" />
          </div>
          <div className="flex items-center gap-2.5">
            <SkeletonBox width="16px" height="16px" />
            <SkeletonLine width="140px" height="0.875rem" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * EventsGridSkeleton
 * Full events page skeleton with header, filters, and cards grid
 * Matches /events/page.jsx and /dashboard/student/events/page.jsx
 */
export const EventsGridSkeleton = ({ showBackButton = false }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          {showBackButton && (
            <SkeletonBox width="120px" height="32px" className="mb-2" />
          )}
          <SkeletonLine width="200px" height="1.75rem" />
          {showBackButton && <SkeletonLine width="280px" height="1rem" />}
        </div>
        <SkeletonBox width="100%" height="44px" borderRadius="0.75rem" className="md:w-72" />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonBox 
            key={i} 
            width={i === 1 ? "60px" : "70px"} 
            height="36px" 
            borderRadius="999px" 
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
