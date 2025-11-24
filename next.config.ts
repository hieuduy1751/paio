import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["bcryptjs", "jsonwebtoken"],
};

export default nextConfig;