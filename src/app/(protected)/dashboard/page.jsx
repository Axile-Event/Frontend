"use client";

import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React from "react";

const DashboardPage = () => {
  const role = useAuthStore((state) => state.role);
  const router = useRouter();

  useEffect(() => {
    if (!role) return;

    // Normalize role string to handle case sensitivity
    const normalizedRole = role.toLowerCase();

    if (normalizedRole === "organizer") {
      router.replace("/dashboard/org");
    } else {
      router.replace("/dashboard/student");
    }
  }, [role, router]);

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="animate-pulse">Redirecting...</div>
    </div>
  );
};

export default DashboardPage;