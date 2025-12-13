import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Server Actions from any origin in development
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "fvc2k82b-3000.asse.devtunnels.ms",
      ],
    },
  },
};

export default nextConfig;
