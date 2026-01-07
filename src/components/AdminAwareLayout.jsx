"use client";

import { usePathname } from "next/navigation";
import { GoogleOAuthProvider as GoogleAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";

export function AdminAwareLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/lighthouse");

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <GoogleAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
        <Toaster position="top-center" />
        {!isAdmin && <Header />}
        <main className="grow">
          {children}
        </main>
        {!isAdmin && <Footer />}
      </GoogleAuthProvider>
    </ThemeProvider>
  );
}
