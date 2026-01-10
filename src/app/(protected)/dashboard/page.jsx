"use client";

import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React from "react";
import Loading from "@/components/ui/Loading";

const DashboardPage = () => {
  const role = useAuthStore((state) => state.role);
  const hydrated = useAuthStore((state) => state.hydrated);
  const router = useRouter();



  useEffect(() => {
    if (!hydrated) return;

    if (!role) {
      router.push("/login");
      return;
    }

    // Normalize role string to handle case sensitivity
    const normalizedRole = role.toLowerCase().trim();

    if (normalizedRole === "organizer" || normalizedRole === "org") {
      router.push("/dashboard/org");
    } else {
      router.push("/dashboard/student");
    }
  }, [role, router, hydrated]);

  // if (!hydrated) return <Loading />; // Or specific loader for hydration

  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full">
       <Loading />
    </div>
  );
};
export default DashboardPage;