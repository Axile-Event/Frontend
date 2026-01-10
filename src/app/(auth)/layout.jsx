'use client'
import { useEffect } from "react";
import useAuthStore from "../../store/authStore";
import { useRouter } from "next/navigation";
import { Loader2 } from 'lucide-react'



const authLayout = ({children}) => {
    const user = useAuthStore(state => state.role === 'student' || state.role ==='organizer' ? state.user : null)
    const router = useRouter()
    useEffect(() => {
         if(user) {
         router.push('/dashboard')
    }

    },[user, router])

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

export default authLayout;
