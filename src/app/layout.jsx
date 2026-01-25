import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAuthProvider } from "@/components/GoogleAuthProvider";
import { Toaster } from "react-hot-toast";
import NavigationProgressBar from "@/components/NavigationProgressBar";
import { Suspense } from "react";
import AdminAwareLayout from "@/components/AdminAwareLayout";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
    default: "Axile | Event Ticketing and Management Platform for Nigeria",
    template: "%s | Axile",
  },
  description: "Discover popular events or host your own. Axile provides secure digital ticketing, event analytics, and seamless payments for organizers across Nigeria.",
  keywords: ["event ticketing Nigeria", "buy tickets online Nigeria", "event management software", "Lagos events", "Nigerian ticketing platform", "secure event payments"],
  authors: [{ name: "Axile Team" }],
  creator: "Axile",
  publisher: "Axile",
  metadataBase: new URL('https://axile.ng'),
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://axile.ng",
    title: "Axile | Sell and Discover Events in Nigeria",
    description: "The unified platform for Nigerian events. Manage ticket sales, track attendance, and discover the best experiences around you.",
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
    title: "Axile | Modern Event Ticketing for Nigeria",
    description: "Create events and sell tickets securely. Discover and book experiences across Nigeria with the Axile event platform.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/axile-logo.png",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Axile",
              "url": "https://axile.ng",
              "description": "A comprehensive event management and ticketing platform designed for Nigeria, enabling organizers to host events and attendees to book tickets securely.",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "areaServed": {
                "@type": "Country",
                "name": "Nigeria"
              }
            })
          }}
        />
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
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}


