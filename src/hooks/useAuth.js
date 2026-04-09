"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/store/authStore";

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (!hydrated) return;

    if (!token) {
      setAuthenticated(false);
      setLoading(false);
      const callbackUrl = encodeURIComponent(pathname);
      router.replace(`/login?callbackUrl=${callbackUrl}`);
    } else {
      setAuthenticated(true);
      setLoading(false);
    }
  }, [token, hydrated, router, pathname]);

  return { loading, authenticated };
}
