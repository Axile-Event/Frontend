"use client";

import { SkeletonBox, SkeletonLine } from "../primitives";

/**
 * WalletPageSkeleton
 * Matches the exact layout of /dashboard/org/payout/page.jsx:
 * - Header with title
 * - 4 stat cards grid
 * - 1/3 + 2/3 grid with withdrawal form and transactions table
 */
export const WalletPageSkeleton = () => {
  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="space-y-2">
        <SkeletonLine width="180px" height="1.75rem" />
        <SkeletonLine width="320px" height="0.75rem" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="bg-[#0A0A0A] border border-white/5 p-5 rounded-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <SkeletonBox width="44px" height="44px" borderRadius="0.75rem" />
              <div className="flex items-center gap-2">
                <SkeletonBox width="40px" height="20px" borderRadius="999px" />
                <SkeletonBox width="24px" height="24px" borderRadius="0.5rem" />
              </div>
            </div>
            <div className="space-y-2">
              <SkeletonLine width="100px" height="0.75rem" />
              <SkeletonLine width="140px" height="2rem" />
              <SkeletonLine width="120px" height="0.625rem" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Withdrawal Form */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <SkeletonBox width="16px" height="16px" />
              <SkeletonLine width="160px" height="1rem" />
            </div>

            {/* Bank Account Card */}
            <div className="mb-5 p-3.5 bg-white/5 border border-white/10 rounded-xl">
              <SkeletonLine width="100px" height="0.625rem" className="mb-2" />
              <div className="flex items-center gap-3">
                <SkeletonBox width="36px" height="36px" borderRadius="0.5rem" />
                <div className="space-y-1">
                  <SkeletonLine width="100px" height="0.875rem" />
                  <SkeletonLine width="80px" height="0.75rem" />
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-4">
              <div className="space-y-2">
                <SkeletonLine width="80px" height="0.75rem" />
                <SkeletonBox height="48px" borderRadius="0.75rem" />
                <SkeletonLine width="140px" height="0.625rem" />
              </div>
              <SkeletonBox height="48px" borderRadius="0.75rem" />
              <SkeletonLine width="180px" height="0.625rem" className="text-center mx-auto" />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="lg:col-span-2">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-xl overflow-hidden">
            {/* Tabs Header */}
            <div className="p-5 border-b border-white/5">
              <div className="flex items-center gap-4">
                <SkeletonBox width="160px" height="40px" borderRadius="0.75rem" />
                <SkeletonBox width="160px" height="40px" borderRadius="0.75rem" />
              </div>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.02] text-gray-400 text-[10px] font-bold">
                  <tr>
                    <th className="px-5 py-3"><SkeletonLine width="80px" height="0.75rem" /></th>
                    <th className="px-5 py-3"><SkeletonLine width="50px" height="0.75rem" /></th>
                    <th className="px-5 py-3"><SkeletonLine width="60px" height="0.75rem" /></th>
                    <th className="px-5 py-3"><SkeletonLine width="40px" height="0.75rem" /></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <SkeletonLine width="120px" height="0.875rem" />
                          <SkeletonLine width="160px" height="0.625rem" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <SkeletonBox width="70px" height="24px" borderRadius="0.375rem" />
                      </td>
                      <td className="px-6 py-4">
                        <SkeletonLine width="80px" height="0.875rem" />
                      </td>
                      <td className="px-6 py-4">
                        <SkeletonLine width="70px" height="0.875rem" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPageSkeleton;
