'use client'
import { useEffect, useState } from "react";
import useAuthStore from "../../store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'

const AuthLayoutContent = ({children}) => {
    const user = useAuthStore(state => state.role === 'student' || state.role ==='organizer' ? state.user : null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isRedirecting, setIsRedirecting] = useState(false)
    
    useEffect(() => {
        // Only redirect if user was already logged in when they landed on auth page
        // Don't redirect if they just completed login (the login/signup pages handle that)
        if(user && !isRedirecting) {
            setIsRedirecting(true)
            // Preserve callbackUrl if present
            const callbackUrl = searchParams.get('callbackUrl')
            if (callbackUrl) {
                router.replace(decodeURIComponent(callbackUrl))
            } else {
                router.replace('/dashboard')
            }
        }
    },[user, router, searchParams, isRedirecting])

    if (user) return (
       <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
       </div>
    )

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
