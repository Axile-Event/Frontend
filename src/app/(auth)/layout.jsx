'use client'
import { useEffect } from "react";
import useAuthStore from "../../store/authStore";
import { useRouter } from "next/navigation";
import { Loader2 } from 'lucide-react'


const authLayout = ({children}) => {
    const user = useAuthStore(state => state.user)
    const router = useRouter()
    useEffect(() => {
         if(user) {
         router.push('/dashboard')
    }

    },[user, router])

     if (user) return (
        <>
         <div className="animate-spin">
            <Loader2 />
         </div>
        </>
     )
    return children

}

export default authLayout;
