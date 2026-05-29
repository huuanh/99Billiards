import type { NextConfig } from "next";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

loadRootEnv();

const nextConfig: NextConfig = {
  transpilePackages: ["@99billiards/db", "@99billiards/config", "@99billiards/ui"],
  // Cho phép truy cập từ IP máy local (LAN) khi test trên mobile cùng wifi.
  // HMR sẽ bị block nếu không khai báo origin của thiết bị truy cập.
  allowedDevOrigins: ["192.168.1.42"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;

function loadRootEnv() {
  const envPath = resolve(process.cwd(), "../../.env");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}
