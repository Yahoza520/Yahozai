import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-hosting (Hostinger VPS) için: derleme sonucu küçük, taşınabilir bir
  // sunucu paketi (.next/standalone) üretir. pm2/systemd ile kolay çalışır.
  output: "standalone",
};

export default nextConfig;
