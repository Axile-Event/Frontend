"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "../src/store/authStore";

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const token = useAuthStore((state) => state.token);

  useEffect(() => {

    if (!token) {
      router.replace("/login");
    } else {
      setAuthenticated(true);
    }

    setLoading(false);
  }, []);

  return { loading, authenticated };
}
