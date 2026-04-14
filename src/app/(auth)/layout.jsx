'use client'
import { useEffect, useState } from "react";
import useAuthStore from "../../store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'

const AuthLayoutContent = ({children}) => {
    const role = useAuthStore(state => state.role)
    const token = useAuthStore(state => state.token)
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isRedirecting, setIsRedirecting] = useState(false)
    
    useEffect(() => {
        // Only redirect if user was already logged in when they landed on auth page
        // Check both token and role - case insensitive
        const normalizedRole = String(role || '').toLowerCase().trim()
        const isLoggedIn = token && (normalizedRole === 'student' || normalizedRole === 'organizer')
        
        if(isLoggedIn && !isRedirecting) {
            setIsRedirecting(true)
            // Preserve callbackUrl if present
            const callbackUrl = searchParams.get('callbackUrl')
            if (callbackUrl) {
                router.replace(decodeURIComponent(callbackUrl))
            } else {
                // Route to appropriate dashboard
                if (normalizedRole === 'organizer') {
                    router.replace('/dashboard/org')
                } else {
                    router.replace('/dashboard/user')
                }
            }
        }
    },[token, role, router, searchParams, isRedirecting])

    // Show loading while redirecting or if not logged in
    if (token && (String(role || '').toLowerCase().trim() === 'student' || String(role || '').toLowerCase().trim() === 'organizer')) {
       return (
          <div className="flex items-center justify-center min-h-screen">
             <Loader2 className="animate-spin w-8 h-8 text-primary" />
          </div>
       )
    }

    return (
        <>
            {children}
        </>
    )
}

const AuthLayout = ({children}) => {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>}>
            <AuthLayoutContent>{children}</AuthLayoutContent>
        </Suspense>
    )
}

export default AuthLayout;
