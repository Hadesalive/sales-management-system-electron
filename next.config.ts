import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: 'export' to allow dynamic routes in development
  // output: 'export', // Only needed for static site generation
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  basePath: '',
  distDir: 'out',
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Include database files in server build
      config.externals = config.externals || [];
      config.externals.push({
        'better-sqlite3': 'commonjs better-sqlite3',
      });
    }
    return config;
  }
};

export default nextConfig;
