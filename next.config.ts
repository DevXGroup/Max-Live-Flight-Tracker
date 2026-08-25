import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the dev server to serve its internal assets (HMR, chunks) to
  // devices hitting it over the LAN, e.g. a phone at http://192.168.x.x:3000.
  // Without this, Next 16 treats the LAN origin as cross-origin in dev, blocks
  // those requests, and the page never hydrates — so forms silently reload
  // instead of running their handlers. Dev-only; ignored in production builds.
  allowedDevOrigins: ["192.168.1.229", "192.168.1.0/24"],
};

export default nextConfig;
