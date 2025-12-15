'use client'
import useAuthStore from "@/store/authStore"
import { useRouter } from "next/navigation"

const authLayout = ({children}) => {
    const router = useRouter()
    const user = useAuthStore(state => state.user)

    if(user) {
     router.push('/dashboard')
     return null
    }

    return (
        {children}
    )
}
export default authLayout