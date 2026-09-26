import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  images: {
    // Next.js 16 restricts allowed quality values (default [75]).
    // Whitelist the higher values we use via the `quality` prop.
    qualities: [75, 90, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/sign/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
