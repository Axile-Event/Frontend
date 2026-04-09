"use client";

import { SkeletonBox, SkeletonLine } from "../primitives";

export const AdminEventDetailsSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <SkeletonBox width="36px" height="36px" borderRadius="0.5rem" />
        <div className="flex-1 space-y-1.5">
          <SkeletonLine width="200px" height="1.125rem" />
          <SkeletonLine width="140px" height="0.875rem" />
        </div>
        <SkeletonBox width="80px" height="28px" borderRadius="0.25rem" />
        <SkeletonBox width="36px" height="36px" borderRadius="0.375rem" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SkeletonBox height="200px" borderRadius="0.75rem" className="w-full aspect-[2/1]" />

          <div className="rounded-xl border border-border/40 bg-card/50">
            <div className="p-5 pb-3 border-b border-border/40">
              <SkeletonLine width="100px" height="0.875rem" />
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <SkeletonBox width="36px" height="36px" borderRadius="0.5rem" />
                    <div className="space-y-1.5 pt-0.5">
                      <SkeletonLine width="50px" height="0.5rem" />
                      <SkeletonLine width="120px" height="0.875rem" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-border/40 space-y-2">
                <SkeletonLine width="70px" height="0.5rem" />
                <SkeletonLine height="0.875rem" />
                <SkeletonLine height="0.875rem" />
                <SkeletonLine width="80%" height="0.875rem" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border/40 bg-card/50">
            <div className="p-5 pb-3 border-b border-border/40">
              <SkeletonLine width="80px" height="0.875rem" />
            </div>
            <div className="p-5 space-y-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border/40 text-center">
                <SkeletonLine width="80px" height="0.5rem" className="mx-auto mb-2" />
                <SkeletonBox width="80px" height="28px" borderRadius="0.25rem" className="mx-auto" />
              </div>
              <div className="space-y-2">
                <SkeletonBox height="40px" borderRadius="0.5rem" />
                <SkeletonBox height="40px" borderRadius="0.5rem" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/40 bg-card/50">
            <div className="p-5 pb-3 border-b border-border/40">
              <SkeletonLine width="70px" height="0.875rem" />
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <SkeletonBox width="40px" height="40px" borderRadius="50%" />
                <div className="space-y-1.5">
                  <SkeletonLine width="100px" height="0.875rem" />
                  <SkeletonLine width="70px" height="0.625rem" />
                </div>
              </div>
              <div className="space-y-2 pt-3 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <SkeletonBox width="16px" height="16px" borderRadius="0.25rem" />
                  <SkeletonLine width="140px" height="0.75rem" />
                </div>
                <div className="flex items-center gap-2">
                  <SkeletonBox width="16px" height="16px" borderRadius="0.25rem" />
                  <SkeletonLine width="100px" height="0.75rem" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/40 bg-card/50">
            <div className="p-5 pb-3 border-b border-border/40">
              <SkeletonLine width="70px" height="0.875rem" />
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border/40 text-center">
                    <SkeletonBox width="16px" height="16px" borderRadius="0.25rem" className="mx-auto mb-1" />
                    <SkeletonLine width="50px" height="1.25rem" className="mx-auto mb-1" />
                    <SkeletonLine width="60px" height="0.5rem" className="mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminSettingsSkeleton = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-border/40 bg-card/50">
          <div className="p-5 pb-3 border-b border-border/40 space-y-1">
            <SkeletonLine width="80px" height="0.875rem" />
            <SkeletonLine width="180px" height="0.625rem" />
          </div>
          <div className="p-5 space-y-3">
            {i === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((j) => (
                  <div key={j} className="space-y-2">
                    <SkeletonLine width="100px" height="0.625rem" />
                    <SkeletonBox height="40px" borderRadius="0.5rem" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                    <div className="space-y-1">
                      <SkeletonLine width="120px" height="0.875rem" />
                      <SkeletonLine width="160px" height="0.625rem" />
                    </div>
                    <SkeletonBox width="44px" height="24px" borderRadius="9999px" />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      ))}

      <div className="flex justify-end pt-2">
        <SkeletonBox width="140px" height="40px" borderRadius="0.5rem" />
      </div>
    </div>
  );
};

export default AdminEventDetailsSkeleton;
