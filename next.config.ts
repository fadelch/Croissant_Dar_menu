import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { networkInterfaces } from "node:os";

const withNextIntl = createNextIntlPlugin();

function isPrivateIpv4Address(address: string) {
  const parts = address.split(".").map(Number);

  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) {
    return false;
  }

  const [first, second] = parts;

  return (
    first === 10 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

const localNetworkOrigins = Object.values(networkInterfaces()).flatMap(
  (connections) =>
    connections?.flatMap((connection) =>
      connection.family === "IPv4" &&
      !connection.internal &&
      isPrivateIpv4Address(connection.address)
        ? [connection.address]
        : [],
    ) ?? [],
);

const nextConfig: NextConfig = {
  // Mobile browsers can send an Origin header when requesting development
  // chunks over the LAN. Without this, Next.js rejects those scripts with 403
  // and the page is visible but none of its client interactions hydrate.
  allowedDevOrigins: localNetworkOrigins,
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
