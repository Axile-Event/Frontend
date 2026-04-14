"use client";

import { Loader2 } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { useEffect, useState } from "react";

export default function ProtectedLayout({ children }) {
  const { loading, authenticated } = useAuth();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Only render children once confirmed as authenticated
    if (!loading && authenticated) {
      setShouldRender(true);
    } else if (!loading && !authenticated) {
      // Not authenticated will be handled by useAuth redirect
      setShouldRender(false);
    }
  }, [loading, authenticated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="mr-2 h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    // useAuth will redirect to login, show loading while that happens
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="mr-2 h-10 w-10 animate-spin" />
      </div>
    );
  }

  return <div>{children}</div>;
}
