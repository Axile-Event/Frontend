import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAuthProvider } from "@/components/GoogleAuthProvider";
import { Toaster } from "react-hot-toast";
import NavigationProgressBar from "@/components/NavigationProgressBar";
import { Suspense } from "react";
import AdminAwareLayout from "@/components/AdminAwareLayout";

import { ThemeProvider } from "@/components/theme-provider";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Axile - Modern Event Ticketing Platform",
    template: "%s | Axile",
  },
  description: "Discover and book tickets for the hottest events. Axile is your go-to platform for seamless event management and ticket purchasing.",
  keywords: ["events", "tickets", "event management", "ticket booking", "concerts", "festivals", "campus events"],
  authors: [{ name: "Axile Team" }],
  creator: "Axile",
  publisher: "Axile",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://Axile-events.app'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Axile - Modern Event Ticketing Platform",
    description: "Discover and book tickets for the hottest events. Axile is your go-to platform for seamless event management and ticket purchasing.",
    siteName: "Axile",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Axile Event Ticketing Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Axile - Modern Event Ticketing Platform",
    description: "Discover and book tickets for the hottest events.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/logo.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",

};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a14" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Permissions-Policy" content="camera=(self), microphone=(self)" />
      </head>
      <body
        suppressHydrationWarning
        className={`${plusJakartaSans.variable} ${geistMono.variable} antialiased bg-background text-foreground flex flex-col min-h-screen`}
      >
        <GoogleAuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense fallback={null}>
              <NavigationProgressBar />
            </Suspense>
            <Toaster position="top-center" />
            <AdminAwareLayout>
              {children}
            </AdminAwareLayout>
          </ThemeProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}


