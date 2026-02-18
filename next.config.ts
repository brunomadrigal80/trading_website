import type { NextConfig } from "next";
import { createRequire } from "module";

const nextConfig: NextConfig = {
  // Minimal set to fix WalletConnect/@noble ESM syntax; more packages slow first compile and can trigger "Request timed out"
  transpilePackages: ["@noble/curves", "ox"],
  experimental: {
    optimizePackageImports: ["@reown/appkit", "@reown/appkit/react", "wagmi", "viem", "lightweight-charts"],
  },
  turbopack: {},
  webpack: (config) => {
    // Load CommonJS-only module at runtime inside the webpack hook
    try {
      const require = createRequire(import.meta.url);
      const getPlugin = require("turbo-json-parser");
      const myPlugin = getPlugin();
      // use myPlugin if needed to modify config here
    } catch (err) {
      // non-fatal: continue without the plugin if it fails to load
    }
    config.externals.push("pino-pretty", "lokijs", "encoding", "myPlugin");
    config.resolve ??= {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
      "porto": false,
      "porto/internal": false,
    };
    return config;
  },
};

export default nextConfig;
