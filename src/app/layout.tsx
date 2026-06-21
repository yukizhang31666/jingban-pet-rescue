import type { Metadata, Viewport } from "next";
import { ReferralCapture } from "@/components/referral-capture";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

export const metadata: Metadata = {
  title: siteConfig.defaultTitle,
  description: siteConfig.defaultDescription,
  metadataBase: new URL(siteConfig.url),
  keywords: ["鲸伴科技", "宠物走失", "宠物公益", "宠物互助", "寻宠", "深圳宠物", "宠物训练", "宠物摄影", "宠物寄养", "宠物服务平台"],
  openGraph: {
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    siteName: siteConfig.name,
    url: siteConfig.url,
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body><ReferralCapture />{children}</body>
    </html>
  );
}
