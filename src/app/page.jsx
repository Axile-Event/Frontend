'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import useAuthStore from '@/store/authStore'

export default function RootPage() {
  const router = useRouter()
  const token = useAuthStore((state) => state.token)
  const role = useAuthStore((state) => state.role)
  const hydrated = useAuthStore((state) => state.hydrated)
  const redirectedRef = useRef(false)

  useEffect(() => {
    if (!hydrated) return
    
    // Prevent multiple redirects
    if (redirectedRef.current) return
    redirectedRef.current = true

    if (!token) {
      // User not authenticated, go to login
      router.replace('/login')
    } else {
      // User authenticated, route to appropriate dashboard
      const normalizedRole = String(role || '').toLowerCase().trim()
      if (normalizedRole === 'organizer') {
        router.replace('/dashboard/org')
      } else {
        // Default to student/user dashboard
        router.replace('/dashboard/user')
      }
    }
  }, [hydrated, token, role, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="mr-2 h-10 w-10 animate-spin" />
    </div>
  )
}