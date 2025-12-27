import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", ],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400",],
  display: "swap",
});


import { GoogleAuthProvider } from "@/components/GoogleAuthProvider";

export const metadata = {
  title: "Radar",
  description: "Ticket app",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${geistMono.variable} antialiased bg-background text-foreground flex flex-col min-h-screen`}
      >
        <GoogleAuthProvider>
          <Toaster position="top-center" />
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </GoogleAuthProvider>
      </body>
    </html>
  );
}


