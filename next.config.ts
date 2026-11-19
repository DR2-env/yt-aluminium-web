import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  // Keep links from the old Wix site (and Google's index of it) working.
  async redirects() {
    return [
      { source: "/contact-us.html", destination: "/contact", permanent: true },
      { source: "/about-us.html", destination: "/about", permanent: true },
      { source: "/our-products.html", destination: "/products", permanent: true },
      { source: "/new-stock.html", destination: "/products?tag=new", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
