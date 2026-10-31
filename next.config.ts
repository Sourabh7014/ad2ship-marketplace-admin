import type { NextConfig } from "next";

import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

const normalizeUrl = (rawUrl?: string, fallback = "https://devapi.ad2ship.com") => {
  const url = (rawUrl || fallback).trim();
  if (!url) return fallback;
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
};

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const rawApiBase = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://devapi.ad2ship.com";
    const normalized = normalizeUrl(rawApiBase, "https://devapi.ad2ship.com");
    const apiBase = normalized.replace(/\/api\/?$/, "").replace(/\/+$/, "");
    return [
      {
        source: "/api/user/:path*",
        destination: `${apiBase}/user/:path*`,
      },
      {
        source: "/api/user-details/:path*",
        destination: `${apiBase}/user-details/:path*`,
      },
      {
        source: "/api/public/:path*",
        destination: `${apiBase}/public/:path*`,
      },
      {
        source: "/api/seller/public/:path*",
        destination: `${apiBase}/seller/public/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${apiBase}/admin/:path*`,
      },
      {
        source: "/seller-api/:path*",
        destination: `${apiBase}/seller/:path*`,
      },
      {
        source: "/storage/:path*",
        destination: `${apiBase}/storage/:path*`,
      },
      {
        source: "/broadcasting/:path*",
        destination: `${apiBase}/broadcasting/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiBase}/uploads/:path*`,
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default withNextIntl(nextConfig);
