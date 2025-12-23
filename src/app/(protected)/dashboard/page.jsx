"use client";

import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React from "react";

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const router = useRouter()
  const role = "organizer"; //dummy data

 useEffect(() => {
    if (role === "organizer") {
      router.replace("/dashboard/org");
    } else {
      // add student dashboard here
      router.replace("/dashboard");
    }
  }, [user, router]);

  return (
    <div>
      {/* student dashboard */}
      <p>Student</p>
    </div>
  );
};

export default DashboardPage;
