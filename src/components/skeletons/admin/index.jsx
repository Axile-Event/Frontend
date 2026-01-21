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

export const AdminTableSkeleton = ({ 
  columns = 5, 
  rows = 8,
  showFilters = true,
  showSearch = true 
}) => {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {showFilters && (
          <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-xl border border-border/40">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonBox key={i} width="70px" height="36px" borderRadius="0.5rem" />
            ))}
          </div>
        )}

        {showSearch && (
          <SkeletonBox width="288px" height="40px" borderRadius="0.5rem" className="w-full sm:w-72" />
        )}
      </div>

      <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40">
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="p-4">
                    <SkeletonLine width={i === 0 ? "80px" : "60px"} height="0.625rem" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {Array.from({ length: rows }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: columns }).map((_, j) => (
                    <td key={j} className="p-4">
                      {j === 0 ? (
                        <div className="flex items-center gap-3">
                          <SkeletonBox width="36px" height="36px" borderRadius="50%" />
                          <div className="space-y-1.5">
                            <SkeletonLine width="120px" height="0.875rem" />
                            <SkeletonLine width="80px" height="0.625rem" />
                          </div>
                        </div>
                      ) : j === columns - 1 ? (
                        <div className="flex justify-end gap-1">
                          <SkeletonBox width="32px" height="32px" borderRadius="0.375rem" />
                          <SkeletonBox width="32px" height="32px" borderRadius="0.375rem" />
                        </div>
                      ) : j === Math.floor(columns / 2) ? (
                        <SkeletonBox width="70px" height="22px" borderRadius="0.25rem" />
                      ) : (
                        <SkeletonLine width="90px" height="0.75rem" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-border/40">
          <SkeletonLine width="140px" height="0.75rem" />
          <div className="flex items-center gap-1">
            <SkeletonBox width="32px" height="32px" borderRadius="0.375rem" />
            <SkeletonLine width="50px" height="0.75rem" />
            <SkeletonBox width="32px" height="32px" borderRadius="0.375rem" />
          </div>
        </div>
      </div>
    </div>
  );
};

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

export const AdminRevenueSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border/40 bg-card/50 p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <SkeletonLine width="70px" height="0.625rem" />
                <SkeletonLine width="100px" height="1.5rem" />
                <SkeletonLine width="100px" height="0.625rem" />
              </div>
              <SkeletonBox width="40px" height="40px" borderRadius="0.5rem" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-border/40 bg-card/50">
            <div className="p-5 pb-3 border-b border-border/40">
              <SkeletonLine width="120px" height="0.875rem" />
            </div>
            <div className="p-5 space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-3">
                    <SkeletonBox width="36px" height="36px" borderRadius="0.5rem" />
                    <div className="space-y-1">
                      <SkeletonLine width="100px" height="0.875rem" />
                      <SkeletonLine width="80px" height="0.625rem" />
                    </div>
                  </div>
                  <SkeletonLine width="80px" height="1.125rem" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border/40 bg-card/50">
        <div className="p-5 pb-3 border-b border-border/40 flex items-center justify-between">
          <SkeletonLine width="140px" height="0.875rem" />
          <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonBox key={i} width="60px" height="28px" borderRadius="0.375rem" />
            ))}
          </div>
        </div>
        <div className="p-5">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <th key={i} className="pb-3 text-left">
                    <SkeletonLine width="80px" height="0.625rem" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <td key={j} className="py-3">
                      <SkeletonLine width={j === 1 ? "100px" : "70px"} height="0.75rem" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AdminLayoutSkeleton = ({ children }) => (
  <div className="flex h-screen bg-background overflow-hidden">
    <div className="hidden md:flex h-screen sticky top-0 w-60 border-r border-border/40 bg-card/50">
      <div className="flex flex-col w-full">
        <div className="p-5 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <SkeletonBox width="32px" height="32px" borderRadius="0.5rem" />
            <div className="space-y-1">
              <SkeletonLine width="80px" height="0.875rem" />
              <SkeletonLine width="60px" height="0.5rem" />
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-6">
          {[1, 2, 3, 4].map((group) => (
            <div key={group}>
              <SkeletonLine width="60px" height="0.5rem" className="px-3 mb-2" />
              <div className="space-y-1">
                {[1, 2].map((item) => (
                  <div key={item} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                    <SkeletonBox width="18px" height="18px" borderRadius="0.25rem" />
                    <SkeletonLine width="80px" height="0.8rem" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
    
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <header className="h-16 border-b border-border/40 px-4 md:px-6 flex items-center justify-between bg-card/30 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-4">
          <SkeletonBox width="36px" height="36px" borderRadius="0.5rem" className="md:hidden" />
          <div className="space-y-1">
            <SkeletonLine width="100px" height="1rem" />
            <SkeletonLine width="160px" height="0.75rem" className="hidden sm:block" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SkeletonBox width="36px" height="36px" borderRadius="0.5rem" />
          <SkeletonBox width="36px" height="36px" borderRadius="50%" />
        </div>
      </header>
      
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  </div>
);
