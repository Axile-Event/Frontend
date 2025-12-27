import Sidebar from '@/components/studentDashboardComponents/Sidebar'
import React from 'react'

const StudentDashboardLayout = ({children}) => {
  return (
   <>
    <section className='flex flex-col md:flex-row min-h-screen'>
      {/* sidebar content - Hidden on mobile, shown on desktop */}
      <nav className='hidden md:block fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] border-r border-gray-800 bg-black z-40 overflow-y-auto py-6'>
        <Sidebar />
      </nav>
      {/* main content */}
      <main className='w-full md:ml-64 p-4 md:p-8'>
        {children}
      </main>
    </section>
   </>
  )
}

export default StudentDashboardLayout