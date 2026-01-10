import Sidebar from "@/components/organizersDashboardComponents/Sidebar"
import OrganizerHeader from "@/components/OrganizerHeader"
import React from 'react'

const organizersDashboardLayout = ({ children }) => {
  return (
    <>
      <OrganizerHeader />
      <section className='flex flex-col md:flex-row min-h-screen  bg-black border-r border-gray-900 md:p-5 text-foreground gap-6'>
        {/* sidebar content */}
        <nav className='fixed bottom-0 w-full p-2 rounded-xl md:mt-0 md:left-0 md:w-64 border-border md:min-h-screen order-1 z-10'>
          <Sidebar />
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 pb-24 md:pb-0 md:ml-64">
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </section>
    </>
  )
}

export default organizersDashboardLayout
