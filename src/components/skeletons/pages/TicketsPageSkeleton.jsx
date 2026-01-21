"use client";

import { SkeletonBox, SkeletonLine } from "../primitives";

/**
 * TicketsPageSkeleton
 * Matches the exact layout of /dashboard/student/my-tickets/page.jsx:
 * - Header with title and search
 * - Ticket cards grid (1/2/3 cols) with QR preview
 */
export const TicketsPageSkeleton = () => {
  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 md:gap-2">
          <SkeletonLine width="160px" height="2rem" />
          <SkeletonLine width="320px" height="1rem" />
        </div>
        <SkeletonBox width="100%" height="40px" borderRadius="0.5rem" className="md:w-72" />
      </div>

      {/* Ticket Cards Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="h-full flex flex-col overflow-hidden border border-border rounded-xl border-l-4 border-l-primary bg-card"
          >
            {/* Card Header */}
            <div className="pb-2 p-4 md:p-6">
              <div className="flex justify-between items-start gap-2">
                <SkeletonLine width="70%" height="1.25rem" />
                <SkeletonBox width="70px" height="20px" borderRadius="999px" />
              </div>
              <SkeletonLine width="80px" height="0.75rem" className="mt-2" />
            </div>

            {/* Card Content */}
            <div className="flex-1 space-y-4 p-4 pt-0 md:p-6 md:pt-0">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <SkeletonBox width="16px" height="16px" />
                  <SkeletonLine width="140px" height="0.875rem" />
                </div>
                <div className="flex items-center gap-2">
                  <SkeletonBox width="16px" height="16px" />
                  <SkeletonLine width="120px" height="0.875rem" />
                </div>
              </div>

              {/* QR Code Preview */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg">
                <SkeletonBox width="80px" height="80px" borderRadius="0.25rem" />
                <SkeletonLine width="80px" height="0.625rem" className="mt-2" />
              </div>
            </div>

            {/* Card Footer */}
            <div className="bg-muted/50 pt-4 p-4 md:p-6">
              <div className="flex justify-between items-center w-full">
                <SkeletonLine width="100px" height="0.875rem" />
                <SkeletonLine width="80px" height="1.25rem" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketsPageSkeleton;
