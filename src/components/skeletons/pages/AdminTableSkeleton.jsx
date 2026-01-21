"use client";

import { SkeletonBox, SkeletonLine } from "../primitives";

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

export default AdminTableSkeleton;
