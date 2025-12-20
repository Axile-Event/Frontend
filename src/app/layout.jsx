import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { GoogleAuthProvider } from "../components/GoogleAuthProvider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata = {
  title: "Radar",
  description: "Ticket app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAuthProvider>
          <Toaster position="top-center" />
          {children}
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
