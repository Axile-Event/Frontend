"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export const GoogleAuthProvider = ({ children }) => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    console.warn("Google Client ID is missing! key: NEXT_PUBLIC_GOOGLE_CLIENT_ID");
  }

  return (
    <GoogleOAuthProvider clientId={clientId || "missing-client-id"}>
      {children}
    </GoogleOAuthProvider>
  );
};
