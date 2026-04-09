"use client";

import { SkeletonBox, SkeletonLine } from "../primitives";

export const AdminDashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border/40 bg-card/50 p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <SkeletonLine width="70px" height="0.625rem" />
                <SkeletonLine width="100px" height="1.5rem" />
                <SkeletonLine width="120px" height="0.625rem" />
              </div>
              <SkeletonBox width="40px" height="40px" borderRadius="0.5rem" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-xl border border-border/40 bg-card/50">
          <div className="p-5 pb-3 flex items-center justify-between border-b border-border/40">
            <SkeletonLine width="100px" height="0.875rem" />
            <SkeletonLine width="60px" height="0.75rem" />
          </div>
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 -mx-3 rounded-lg">
                <div className="space-y-1.5 flex-1">
                  <SkeletonLine width="180px" height="0.875rem" />
                  <SkeletonLine width="120px" height="0.625rem" />
                </div>
                <SkeletonBox width="70px" height="22px" borderRadius="0.25rem" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-2 rounded-xl border border-border/40 bg-card/50">
          <div className="p-5 pb-3 border-b border-border/40">
            <SkeletonLine width="100px" height="0.875rem" />
          </div>
          <div className="p-5 space-y-4">
            <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
              <div className="flex items-center gap-2">
                <SkeletonBox width="16px" height="16px" borderRadius="0.25rem" />
                <SkeletonLine width="120px" height="0.875rem" />
              </div>
              <SkeletonLine width="80px" height="0.625rem" className="mt-2" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/40">
                  <div className="flex items-center gap-2.5">
                    <SkeletonBox width="16px" height="16px" borderRadius="0.25rem" />
                    <SkeletonLine width="100px" height="0.875rem" />
                  </div>
                  <SkeletonBox width="16px" height="16px" borderRadius="0.25rem" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardSkeleton;
