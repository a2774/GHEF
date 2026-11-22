import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  experimental: {
    // Keep pages the visitor has already opened in the browser for 30 seconds, so going
    // back to them is instant. Any save or form action clears this cache straight away.
    staleTimes: { dynamic: 30 },
    // Set by `next upgrade --agent=security` (Next.js 16.4.3 to 16.4.6): tells the Next.js CLI which kind of
    // upgrade notice to show when a published security advisory affects the installed version.
    agentUpgrade: "security",
  },
  images: {
    // AVIF is smaller than WebP where the browser supports it; WebP is the fallback.
    formats: ["image/avif", "image/webp"],
    // The pictures in public/images change rarely, so an optimised copy is kept for a day
    // (the default is 4 hours). Replacing a picture shows up after that, or under a new name.
    minimumCacheTTL: 60 * 60 * 24,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // Files in public/ have no fingerprint in their name, so by default the browser asks the server
        // about each one on every page (an extra round trip). They change rarely (the hero photo files in
        // public/images/hero are made by hand), so keep them for a day and let a stale copy show for up to
        // a week while the browser refreshes it in the background.
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/brand-symbol.svg",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        condition: { not: "foreign" },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
