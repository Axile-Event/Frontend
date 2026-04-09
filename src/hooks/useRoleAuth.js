"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/store/authStore";

/**
 * Hook to protect routes based on user role
 * @param {string} requiredRole - The role required to access the route ("student" or "organizer")
 * @returns {object} - { loading, authorized, role }
 */
export function useRoleAuth(requiredRole) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return; // Wait until the store is hydrated

    // Not authenticated - redirect to login
    if (!token) {
      setAuthorized(false);
      setLoading(false);
      const callbackUrl = encodeURIComponent(pathname);
      router.replace(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    // Check role authorization
    const userRole = role?.toLowerCase();
    const required = requiredRole?.toLowerCase();

    if (userRole !== required) {
      // Role mismatch - redirect to correct dashboard
      setAuthorized(false);
      setLoading(false);
      
      if (userRole === 'organizer') {
        router.replace('/dashboard/org');
      } else if (userRole === 'student') {
        router.replace('/dashboard/student');
      } else {
        // Unknown role - redirect to login
        router.replace('/login');
      }
      return;
    }

    // Authorized
    setAuthorized(true);
    setLoading(false);
  }, [hydrated, token, role, requiredRole, router, pathname]);

  return { loading, authorized, role };
}
