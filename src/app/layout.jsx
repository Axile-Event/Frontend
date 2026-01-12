import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAuthProvider } from "@/components/GoogleAuthProvider";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";

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
    default: "Radar - Modern Event Ticketing Platform",
    template: "%s | Radar",
  },
  description: "Discover and book tickets for the hottest events. Radar is your go-to platform for seamless event management and ticket purchasing.",
  keywords: ["events", "tickets", "event management", "ticket booking", "concerts", "festivals", "campus events"],
  authors: [{ name: "Radar Team" }],
  creator: "Radar",
  publisher: "Radar",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://radar-events.app'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Radar - Modern Event Ticketing Platform",
    description: "Discover and book tickets for the hottest events. Radar is your go-to platform for seamless event management and ticket purchasing.",
    siteName: "Radar",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Radar Event Ticketing Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Radar - Modern Event Ticketing Platform",
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
            <ErrorBoundary>
              <Toaster position="top-center" />
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </ErrorBoundary>
          </ThemeProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}


