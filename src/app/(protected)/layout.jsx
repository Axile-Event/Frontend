"use client";

import { Loader2 } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

export default function ProtectedLayout({ children }) {
  const { loading, authenticated } = useAuth();

  if (loading) return (
   <div className="flex items-center justify-center min-h-screen">
     <Loader2 className="mr-2 h-10 w-10 animate-spin" />
   </div>
  );

  if (!authenticated) return null; // layout won't render until redirect happens

  return (
    <>
    <div>{children}</div>
    </>
  );
}
