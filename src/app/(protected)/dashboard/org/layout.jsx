import Sidebar from '@/components/organizersDashboardComponents/Sidebar'
import React from 'react'

const organizersDashboardLayout = ({children}) => {
  return (
   <>
    <section className='flex flex-col md:flex-row gap-2'>
      {/* sidebar content */}
      <nav className='fixed bottom-0 w-full mt-20 p-2 rounded-xl md:mt-0 md:left-0 md:pt-10 md:w-66 lg:w-65 border border-gray-800 md:min-h-screen order-1'>
        <Sidebar />
      </nav>
      {/* main content */}
      <main className='md:ml-70'>
        {children}
      </main>
    </section>
   </>
  )
}

export default organizersDashboardLayout
