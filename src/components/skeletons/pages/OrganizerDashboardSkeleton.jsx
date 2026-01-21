"use client";

import { SkeletonBox, SkeletonLine, SkeletonCircle } from "../primitives";

/**
 * OrganizerDashboardSkeleton
 * Matches the exact layout of /dashboard/org/page.jsx:
 * - Header with welcome text + create button
 * - 4 stat cards grid
 * - Event status overview section
 * - Recent events cards grid (1/2/3 cols)
 */
export const OrganizerDashboardSkeleton = () => {
  return (
    <div className="min-h-screen p-4 md:p-8 space-y-10 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <SkeletonLine width="280px" height="1.75rem" />
          <SkeletonLine width="240px" height="0.875rem" />
        </div>
        <SkeletonBox width="160px" height="44px" borderRadius="0.75rem" />
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="bg-[#0A0A0A] border border-white/5 p-5 rounded-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <SkeletonBox width="44px" height="44px" borderRadius="0.75rem" />
              <SkeletonBox width="40px" height="20px" borderRadius="999px" />
            </div>
            <div className="space-y-2">
              <SkeletonLine width="80px" height="0.75rem" />
              <SkeletonLine width="120px" height="2rem" />
              <SkeletonLine width="140px" height="0.625rem" />
            </div>
          </div>
        ))}
      </div>

      {/* Event Status Overview */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 md:p-6">
        <div className="flex items-center gap-2 mb-6">
          <SkeletonBox width="32px" height="32px" borderRadius="0.5rem" />
          <SkeletonLine width="180px" height="1.25rem" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col items-center justify-center text-center"
            >
              <SkeletonLine width="60px" height="2rem" className="mb-1" />
              <SkeletonLine width="80px" height="0.625rem" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Events Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SkeletonBox width="32px" height="32px" borderRadius="0.5rem" />
            <SkeletonLine width="140px" height="1.25rem" />
          </div>
          <SkeletonLine width="80px" height="0.875rem" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden"
            >
              <SkeletonBox height="160px" borderRadius="0" />
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <SkeletonLine width="85%" height="1.25rem" />
                  <div className="flex items-center gap-3">
                    <SkeletonLine width="100px" height="0.75rem" />
                    <SkeletonLine width="80px" height="0.75rem" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex gap-4">
                    <div className="space-y-1">
                      <SkeletonLine width="60px" height="0.875rem" />
                      <SkeletonLine width="50px" height="0.625rem" />
                    </div>
                    <div className="space-y-1">
                      <SkeletonLine width="40px" height="0.875rem" />
                      <SkeletonLine width="30px" height="0.625rem" />
                    </div>
                  </div>
                  <SkeletonBox width="20px" height="20px" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboardSkeleton;
