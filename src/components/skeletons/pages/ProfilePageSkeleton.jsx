"use client";

import { SkeletonBox, SkeletonLine, SkeletonCircle } from "../primitives";

/**
 * ProfilePageSkeleton
 * Matches the exact layout of organizer profile page:
 * - Header with title
 * - Side profile card + form layout
 */
export const ProfilePageSkeleton = () => {
  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <SkeletonLine width="100px" height="1.75rem" />
        <SkeletonLine width="320px" height="0.75rem" />
      </div>

      <div className="py-4">
        <div className="max-w-4xl">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Card */}
            <div className="w-full md:w-1/3 bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 text-center space-y-4">
              {/* Avatar */}
              <div className="relative w-24 h-24 mx-auto">
                <SkeletonCircle size="96px" className="mx-auto" />
              </div>
              
              <div className="space-y-2">
                <SkeletonLine width="60%" height="1.25rem" className="mx-auto" />
                <SkeletonLine width="100px" height="0.625rem" className="mx-auto" />
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                <div className="text-center space-y-1">
                  <SkeletonLine width="50px" height="0.75rem" className="mx-auto" />
                  <SkeletonLine width="60px" height="0.875rem" className="mx-auto" />
                </div>
                <div className="text-center border-l border-white/5 space-y-1">
                  <SkeletonLine width="40px" height="0.75rem" className="mx-auto" />
                  <SkeletonLine width="70px" height="0.875rem" className="mx-auto" />
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-6">
                <SkeletonBox width="32px" height="32px" borderRadius="0.5rem" />
                <SkeletonLine width="120px" height="1.25rem" />
              </div>
              
              <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 space-y-5">
                {/* Organization name input */}
                <div className="space-y-1.5">
                  <SkeletonLine width="120px" height="0.75rem" />
                  <SkeletonBox height="48px" borderRadius="0.75rem" />
                </div>
                
                {/* Email and Phone grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <SkeletonLine width="100px" height="0.75rem" />
                    <SkeletonBox height="48px" borderRadius="0.75rem" />
                  </div>
                  <div className="space-y-1.5">
                    <SkeletonLine width="100px" height="0.75rem" />
                    <SkeletonBox height="48px" borderRadius="0.75rem" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <SkeletonBox width="160px" height="48px" borderRadius="0.75rem" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * SettingsPageSkeleton
 * Matches the exact layout of organizer settings page:
 * - Header with title
 * - Tabs
 * - Form sections
 */
export const SettingsPageSkeleton = () => {
  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <SkeletonLine width="100px" height="1.75rem" />
        <SkeletonLine width="320px" height="0.75rem" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <SkeletonBox width="14px" height="14px" />
          <SkeletonLine width="80px" height="0.875rem" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBox width="14px" height="14px" />
          <SkeletonLine width="100px" height="0.875rem" />
        </div>
      </div>

      <div className="py-4 max-w-2xl">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-6">
          <SkeletonBox width="32px" height="32px" borderRadius="0.5rem" />
          <SkeletonLine width="160px" height="1.25rem" />
        </div>
        
        {/* Form Card */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 space-y-5">
          {/* Password inputs */}
          <div className="space-y-1.5">
            <SkeletonLine width="120px" height="0.75rem" />
            <SkeletonBox height="48px" borderRadius="0.75rem" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <SkeletonLine width="100px" height="0.75rem" />
              <SkeletonBox height="48px" borderRadius="0.75rem" />
            </div>
            <div className="space-y-1.5">
              <SkeletonLine width="140px" height="0.75rem" />
              <SkeletonBox height="48px" borderRadius="0.75rem" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <SkeletonBox width="160px" height="48px" borderRadius="0.75rem" />
        </div>
      </div>
    </div>
  );
};

export default ProfilePageSkeleton;
