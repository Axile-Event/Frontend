"use client";

import Sidebar from '@/components/studentDashboardComponents/Sidebar'
import { useRoleAuth } from '@/hooks/useRoleAuth'
import React from 'react'
import Logo from '@/components/Logo'
import { DashboardLayoutSkeleton, StudentDashboardSkeleton } from "@/components/skeletons";

const UserDashboardLayout = ({children}) => {
  const { loading, authorized } = useRoleAuth('student');

  if (loading || !authorized) {
    return (
      <DashboardLayoutSkeleton>
        <StudentDashboardSkeleton />
      </DashboardLayoutSkeleton>
    );
  }

  return (
   <>
    <section className='flex flex-col md:flex-row min-h-screen'>
      {/* sidebar content - Hidden on mobile, shown on desktop */}
      <nav className='hidden md:block fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] border-r border-border bg-background z-40 overflow-y-auto py-6'>
        <Sidebar />
      </nav>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 w-full z-50">
         <Sidebar mobile />
      </div>
      {/* main content */}
      <main className='w-full md:ml-64 px-3 md:px-6 pt-6 pb-24 md:py-6'>
        {children}
      </main>
    </section>
   </>
  )
}

export default UserDashboardLayout
