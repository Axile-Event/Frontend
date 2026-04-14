"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/store/authStore";

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const redirectedRef = useRef(false);

  useEffect(() => {
    // Wait for hydration before checking auth
    if (!hydrated) {
      setLoading(true);
      return;
    }

    if (!token) {
      // User not authenticated - redirect only once
      setAuthenticated(false);
      setLoading(false);
      
      if (!redirectedRef.current) {
        redirectedRef.current = true;
        const callbackUrl = encodeURIComponent(pathname);
        router.replace(`/login?callbackUrl=${callbackUrl}`);
      }
    } else {
      // User authenticated
      setAuthenticated(true);
      setLoading(false);
      redirectedRef.current = false; // Reset if token comes back
    }
  }, [token, hydrated, router, pathname]);

  return { loading, authenticated };
}
