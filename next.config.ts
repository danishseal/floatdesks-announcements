import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects() {
    return [
      { source: "/markets", destination: "/", permanent: false },
      { source: "/market", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
