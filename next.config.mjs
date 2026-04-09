import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get hostname for CSP and Image Remote Patterns
const getHostname = (url) => {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

const apiHostname = getHostname(process.env.NEXT_PUBLIC_API_URL);
const devHostname = "axile-dev-env.onrender.com";

// Combine hostnames for CSP (unique values only)
const trustedHostnames = [...new Set([apiHostname, devHostname].filter(Boolean))].join(' ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set explicit Turbopack root to prevent scanning parent directories
  turbopack: {
    root: __dirname,
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=(self)",
          },
          {
            key: "Content-Security-Policy",
            value:
              `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: ${trustedHostnames} https://*.googleusercontent.com https://res.cloudinary.com https://*.cloudinary.com; connect-src 'self' ${trustedHostnames} https://nubapi.com https://accounts.google.com https://va.vercel-scripts.com https://vitals.vercel-insights.com; frame-src https://accounts.google.com;`,
          },
        ],
      },
    ];
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      ...(apiHostname ? [{ protocol: "https", hostname: apiHostname, pathname: "/**" }] : []),
      {
        protocol: "https",
        hostname: devHostname,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
