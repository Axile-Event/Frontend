"use client";

import { SkeletonBox, SkeletonLine, SkeletonCircle } from "../primitives";

/**
 * StudentDashboardSkeleton
 * Matches the exact layout of /dashboard/student/page.jsx:
 * - Welcome section with header + button (flex row on desktop)
 * - Upcoming tickets section with cards grid (1/2/3 cols)
 */
export const StudentDashboardSkeleton = () => {
  return (
    <div className="min-h-screen p-4 md:p-4 space-y-6 md:space-y-8 pt-6 md:pt-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="space-y-2">
          <SkeletonLine width="280px" height="2rem" />
          <SkeletonLine width="220px" height="1rem" />
        </div>
        <SkeletonBox width="160px" height="48px" borderRadius="0.5rem" />
      </div>

      {/* Upcoming Tickets Section */}
      <div className="bg-[#111] rounded-xl p-6 border border-gray-800/50">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <SkeletonLine width="180px" height="1.5rem" />
            <SkeletonBox width="32px" height="20px" borderRadius="999px" />
          </div>
          <SkeletonLine width="80px" height="1rem" />
        </div>

        {/* Ticket Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="bg-[#1a1a1a] p-5 rounded-xl border border-gray-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 space-y-2">
                  <SkeletonLine width="70%" height="1.25rem" />
                  <div className="flex items-center gap-2">
                    <SkeletonBox width="14px" height="14px" />
                    <SkeletonLine width="100px" height="0.875rem" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                <div className="space-y-1">
                  <SkeletonLine width="50px" height="0.625rem" />
                  <SkeletonLine width="70px" height="0.75rem" />
                </div>
                <SkeletonBox width="32px" height="32px" borderRadius="0.5rem" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardSkeleton;
