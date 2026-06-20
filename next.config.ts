import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{
      source: "/:path*",
      has: [{ type: "host", value: "www.jingbantech.com" }],
      destination: "https://jingbantech.com/:path*",
      permanent: true,
    }];
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL || "",
    NEXT_PUBLIC_WECHAT_PAYMENT_QR_URL: process.env.WECHAT_PAYMENT_QR_URL || "",
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
