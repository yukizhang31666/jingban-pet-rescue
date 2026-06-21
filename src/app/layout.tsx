import type { Metadata, Viewport } from "next";
import { ReferralCapture } from "@/components/referral-capture";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

export const metadata: Metadata = {
  title: siteConfig.defaultTitle,
  description: siteConfig.defaultDescription,
  metadataBase: new URL(siteConfig.url),
  keywords: ["宠物走失", "寻宠", "找猫", "找狗", "宠物安全护照", "宠物数字档案", "城市寻宠", "深圳寻宠", "猫丢了怎么办", "狗丢了怎么办"],
  openGraph: {
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    siteName: siteConfig.name,
    url: `${siteConfig.url}/`,
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
