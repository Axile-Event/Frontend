"use client";

import { SkeletonBox, SkeletonLine } from "../primitives";

/**
 * EventDetailsSkeleton
 * Matches the exact layout of /events/[event_id]/page.jsx:
 * - Hero image section
 * - 2/3 + 1/3 grid with content and booking card
 */
export const EventDetailsSkeleton = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 pt-24 md:pt-32">
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
          {/* Hero Section */}
          <div className="relative w-full h-[200px] md:h-[400px] rounded-xl md:rounded-2xl overflow-hidden">
            <SkeletonBox height="100%" borderRadius="0" />
            <div className="absolute top-3 right-3 md:top-4 md:right-4">
              <SkeletonBox width="100px" height="32px" borderRadius="999px" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-4 md:space-y-6">
              {/* Title & Meta */}
              <div className="space-y-4">
                <SkeletonLine width="85%" height="2.5rem" />
                <div className="flex flex-wrap gap-3 md:gap-4">
                  <div className="flex items-center gap-2">
                    <SkeletonBox width="16px" height="16px" />
                    <SkeletonLine width="180px" height="1rem" />
                  </div>
                  <div className="flex items-center gap-2">
                    <SkeletonBox width="16px" height="16px" />
                    <SkeletonLine width="80px" height="1rem" />
                  </div>
                  <div className="flex items-center gap-2">
                    <SkeletonBox width="16px" height="16px" />
                    <SkeletonLine width="120px" height="1rem" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3 md:space-y-4">
                <SkeletonLine width="180px" height="1.5rem" />
                <div className="space-y-2">
                  <SkeletonLine width="100%" height="1rem" />
                  <SkeletonLine width="100%" height="1rem" />
                  <SkeletonLine width="95%" height="1rem" />
                  <SkeletonLine width="80%" height="1rem" />
                  <SkeletonLine width="70%" height="1rem" />
                </div>
              </div>
            </div>

            {/* Booking Card & Share Section */}
            <div className="md:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Booking Card */}
                <div className="rounded-xl border border-gray-700 bg-card">
                  <div className="p-4 md:p-6">
                    <SkeletonLine width="120px" height="1.5rem" />
                  </div>
                  <div className="space-y-4 md:space-y-6 p-4 md:p-6 pt-0 md:pt-0">
                    {/* Category Selector */}
                    <div className="space-y-3">
                      <SkeletonLine width="100px" height="0.875rem" />
                      <div className="space-y-2">
                        {[1, 2].map((i) => (
                          <SkeletonBox key={i} height="64px" borderRadius="0.75rem" />
                        ))}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                      <SkeletonLine width="80px" height="0.875rem" />
                      <SkeletonBox height="40px" borderRadius="0.5rem" />
                      <SkeletonLine width="220px" height="0.625rem" />
                    </div>

                    {/* Price Summary */}
                    <div className="pt-4 border-t border-gray-600 space-y-2">
                      <div className="flex justify-between">
                        <SkeletonLine width="100px" height="0.875rem" />
                        <SkeletonLine width="80px" height="0.875rem" />
                      </div>
                      <div className="flex justify-between">
                        <SkeletonLine width="50px" height="1.25rem" />
                        <SkeletonLine width="100px" height="1.25rem" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 md:p-6 pt-0 md:pt-0">
                    <SkeletonBox height="44px" borderRadius="0.5rem" />
                  </div>
                </div>

                {/* Share Section */}
                <div className="rounded-xl border border-gray-700 bg-card p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <SkeletonBox width="16px" height="16px" />
                    <SkeletonLine width="120px" height="1rem" />
                  </div>
                  <div className="flex gap-2">
                    <SkeletonBox height="40px" className="flex-1" borderRadius="0.375rem" />
                    <SkeletonBox width="40px" height="40px" borderRadius="0.375rem" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsSkeleton;
