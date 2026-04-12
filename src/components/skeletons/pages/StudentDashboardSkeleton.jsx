"use client";

import { SkeletonBox, SkeletonLine, SkeletonCircle } from "../primitives";

/**
 * StudentDashboardSkeleton
 * Matches the exact layout of /dashboard/user/page.jsx:
 * - Welcome section with header + button (flex row on desktop)
 * - Upcoming tickets section with cards grid (1/2/3 cols)
 */
export const StudentDashboardSkeleton = () => {
  return (
    <div className="min-h-screen space-y-6 md:space-y-10 pt-4 md:pt-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <SkeletonLine width="300px" height="2.5rem" />
          <SkeletonLine width="200px" height="1rem" />
        </div>
        <SkeletonBox width="140px" height="48px" borderRadius="0.75rem" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#111] border border-gray-800/50 p-6 rounded-2xl flex items-center justify-between">
            <div className="space-y-2">
              <SkeletonLine width="60px" height="0.75rem" />
              <SkeletonLine width="40px" height="2rem" />
            </div>
            <SkeletonBox width="44px" height="44px" borderRadius="0.75rem" />
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <SkeletonLine width="180px" height="1.5rem" />
            <SkeletonLine width="60px" height="1rem" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#111] border border-gray-800/50 p-6 rounded-2xl h-32 flex items-center gap-4">
                <SkeletonBox width="80px" height="80px" borderRadius="0.75rem" className="flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <SkeletonLine width="80%" height="1.25rem" />
                    <SkeletonLine width="40%" height="0.75rem" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6 text-white ">
          <SkeletonLine width="150px" height="1.5rem" />
          <div className="space-y-3">
            <SkeletonBox width="100%" height="72px" borderRadius="1.25rem" />
            <SkeletonBox width="100%" height="72px" borderRadius="1.25rem" />
          </div>
          <SkeletonBox width="100%" height="200px" borderRadius="1.5rem" />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardSkeleton;
