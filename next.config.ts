import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    // Enable experimental features if needed
  },
  // Remove deprecated options that are now default in Next.js 15
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
}

export default nextConfig
