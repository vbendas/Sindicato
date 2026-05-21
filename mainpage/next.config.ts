import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["@neondatabase/serverless"],
  async redirects() {
    return [
      {
        source: "/remote-workers/:slug",
        destination: "/workers/:slug",
        permanent: true,
      },
      {
        source: "/remote-workers",
        destination: "/workers",
        permanent: true,
      },
      {
        source: "/gig-workers/:slug",
        destination: "/gig/:slug",
        permanent: true,
      },
      {
        source: "/gig-workers",
        destination: "/gig",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
