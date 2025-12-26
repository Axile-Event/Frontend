"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A14] text-white p-4 text-center">
      <div className="bg-rose-500/10 p-6 rounded-full mb-6">
        <AlertTriangle className="h-16 w-16 text-rose-500" />
      </div>
      <h1 className="text-6xl font-bold mb-2 text-rose-500">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-gray-400 mb-8 max-w-md text-sm md:text-base">
        Oops! The page you are looking for seems to have wandered off into the unknown.
        Let's get you back to safety.
      </p>
      <Link href="/">
        <Button className="bg-rose-600 hover:bg-rose-700 gap-2">
          <Home className="h-4 w-4" />
          Return Home
        </Button>
      </Link>
    </div>
  );
}
