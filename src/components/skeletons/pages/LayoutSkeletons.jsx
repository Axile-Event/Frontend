"use client";

import { SkeletonBox, SkeletonLine, SkeletonCircle } from "../primitives";

export const DashboardHeaderSkeleton = () => (
  <header className="h-16 border-b border-border/40 px-4 md:px-6 flex items-center justify-between bg-card/30 backdrop-blur-sm">
    <div className="flex items-center gap-4">
      <SkeletonBox width="36px" height="36px" borderRadius="0.5rem" className="md:hidden" />
      <div className="space-y-1">
        <SkeletonLine width="100px" height="1rem" />
        <SkeletonLine width="160px" height="0.75rem" className="hidden sm:block" />
      </div>
    </div>
    <div className="flex items-center gap-3">
      <SkeletonBox width="36px" height="36px" borderRadius="0.5rem" />
      <div className="h-8 w-px bg-border/40 hidden sm:block" />
      <div className="flex items-center gap-2.5">
        <SkeletonLine width="50px" height="0.875rem" className="hidden sm:block" />
        <SkeletonCircle size="36px" />
      </div>
    </div>
  </header>
);

export const SidebarSkeleton = () => (
  <div className="flex flex-col w-60 border-r border-border/40 bg-card/50 backdrop-blur-sm h-full">
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
    <div className="p-3 border-t border-border/40">
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
        <SkeletonBox width="18px" height="18px" borderRadius="0.25rem" />
        <SkeletonLine width="60px" height="0.8rem" />
      </div>
    </div>
  </div>
);

export const DashboardLayoutSkeleton = ({ children }) => (
  <div className="min-h-screen bg-background">
    <DashboardHeaderSkeleton />
    <div className="flex">
      <div className="hidden md:block w-64">
        <SidebarSkeleton />
      </div>
      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  </div>
);

export const AdminLayoutSkeleton = ({ children }) => (
  <div className="flex h-screen bg-background overflow-hidden">
    <div className="hidden md:flex h-screen sticky top-0">
      <SidebarSkeleton />
    </div>
    
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <DashboardHeaderSkeleton />
      
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
