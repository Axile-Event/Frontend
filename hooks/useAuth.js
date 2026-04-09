"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);

 useEffect(() => {
  if (!hydrated) return; // Waitt until the store is hydrated

      if (!token) {
        setAuthenticated(false);
        setLoading(false);
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          router.replace("/login");
        }
      } else {
        setAuthenticated(true);
        setLoading(false);
      }
    }, [hydrated, token, router]);

  return { loading, authenticated };
}
