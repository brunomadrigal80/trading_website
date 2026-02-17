import type { NextConfig } from "next";
import getPlugin from "turbo-json-parse";

const nextConfig: NextConfig = {
  // Minimal set to fix WalletConnect/@noble ESM syntax; more packages slow first compile and can trigger "Request timed out"
  transpilePackages: ["@noble/curves", "ox", "getPlugin"],
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
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
