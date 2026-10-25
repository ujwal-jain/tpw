import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pages read live from Postgres on every request, so component-level caching
  // is off: a filter change must hit the database, not a cached shell.
  cacheComponents: false,
  turbopack: {
    // Pin the workspace root; a stray package-lock.json above this folder
    // otherwise makes Turbopack guess wrong.
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
