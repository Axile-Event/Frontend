import React from 'react'

const StudentDashboardLayout = ({children}) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Student specific navigation/sidebar can go here */}
      <main className="container mx-auto py-6">
        {children}
      </main>
    </div>
  )
}

export default StudentDashboardLayout