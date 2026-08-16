import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the local network IP to fetch chunks without being blocked by Next.js 15 CORS/Host checks
  // @ts-ignore - bypassing strict types just in case it's placed under experimental in future versions
  allowedDevOrigins: ['192.168.1.45'],
};

export default nextConfig;
