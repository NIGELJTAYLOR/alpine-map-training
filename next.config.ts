import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Permit the dev server to accept HMR/font requests from other devices
  // on the LAN (so the app can be tested on phones / tablets while
  // running `next dev --hostname 0.0.0.0`). Next.js 15+ blocks these by
  // default for security. A wildcard covers the whole 192.168.* range
  // so we do not have to update this every time DHCP issues a new IP.
  allowedDevOrigins: ["192.168.1.*", "192.168.0.*", "10.0.0.*"],
};

export default nextConfig;
