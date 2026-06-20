import type { Metadata, Viewport } from "next";
import { ReferralCapture } from "@/components/referral-capture";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "鲸伴科技 | 宠物数字身份", template: "%s | 鲸伴科技" },
  description: "为宠物建立数字身份，快速生成宠物身份证、寻宠启事和趣味人格报告。",
  metadataBase: new URL(process.env.API_URL || "https://jingbantech.com"),
  openGraph: {
    title: "鲸伴科技 · 宠物数字身份",
    description: "让每一份陪伴，都有迹可循。",
    siteName: "鲸伴科技",
    locale: "zh_CN",
    type: "website",
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
