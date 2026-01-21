"use client";

import { SkeletonBox, SkeletonLine } from "../primitives";

/**
 * OrganizerEventsPageSkeleton
 * Matches the exact layout of /dashboard/org/my-event/page.jsx:
 * - Header with title + search + buttons
 * - Event cards grid (1/2/3 cols) with images
 */
export const OrganizerEventsPageSkeleton = () => {
  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <SkeletonLine width="160px" height="1.5rem" />
          <SkeletonLine width="200px" height="0.75rem" />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <SkeletonBox width="192px" height="44px" borderRadius="0.75rem" className="grow md:grow-0" />
          <SkeletonBox width="90px" height="44px" borderRadius="0.75rem" />
          <SkeletonBox width="80px" height="44px" borderRadius="0.75rem" />
        </div>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={i} 
            className="bg-[#0A0A0A] border border-white/5 rounded-[2rem] overflow-hidden flex flex-col"
          >
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden">
              <SkeletonBox height="100%" borderRadius="0" />
              <div className="absolute inset-x-3 top-3 flex items-center justify-between">
                <SkeletonBox width="70px" height="24px" borderRadius="0.75rem" />
                <SkeletonBox width="60px" height="24px" borderRadius="0.75rem" />
              </div>
              <div className="absolute bottom-4 left-5 right-5 space-y-1">
                <SkeletonLine width="80px" height="0.5rem" />
                <SkeletonLine width="70%" height="1.25rem" />
              </div>
            </div>

            {/* Content Section */}
            <div className="p-5 space-y-4 flex-1 flex flex-col">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <SkeletonBox width="14px" height="14px" />
                  <SkeletonLine width="140px" height="0.75rem" />
                </div>
                <div className="flex items-center gap-2.5">
                  <SkeletonBox width="14px" height="14px" />
                  <SkeletonLine width="120px" height="0.75rem" />
                </div>
              </div>

              <SkeletonLine width="100%" height="0.75rem" />
              <SkeletonLine width="80%" height="0.75rem" />

              <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <SkeletonLine width="50px" height="0.5rem" />
                    <SkeletonLine width="60px" height="1rem" />
                  </div>
                  <div className="space-y-1">
                    <SkeletonLine width="50px" height="0.5rem" />
                    <SkeletonLine width="70px" height="1rem" />
                  </div>
                </div>
                <SkeletonBox width="100px" height="40px" borderRadius="0.75rem" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizerEventsPageSkeleton;
