import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Search } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { createWebPageJsonLd, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "寻宠启事模板｜微信群朋友圈小红书寻宠文案 - 鲸伴",
  description: "鲸伴整理适合微信群、朋友圈和小红书的寻宠启事模板，帮助宠物主在猫狗走失后快速制作清晰、可转发的扩散文案。",
};

const templates = [
  ["微信群寻宠模板", "【寻宠求助】我的{宠物类型}{宠物名}于{走失时间}在{走失地点}附近走失，特征是{明显特征}。如有看到，请通过寻宠页面提交线索：{详情链接}"],
  ["朋友圈寻宠模板", "请朋友们帮忙留意和转发。{宠物名}在{城市}{走失地点}附近走失，时间是{走失时间}，明显特征为{明显特征}。线索入口：{详情链接}"],
  ["小红书寻宠标题模板", "{城市}{走失地点}寻宠｜{宠物名}走失，请附近朋友帮忙留意"],
  ["小红书寻宠正文模板", "📍城市：{城市}\n📍走失地点：{走失地点}\n⏰走失时间：{走失时间}\n🐾宠物：{宠物名}\n🔎明显特征：{明显特征}\n看到相似宠物请通过详情页提交线索：{详情链接}"],
  ["紧急寻宠模板", "紧急寻宠：{宠物名}在{城市}{走失地点}附近走失。时间：{走失时间}。特征：{明显特征}。如看到请先记录位置，不要贸然追赶。线索入口：{详情链接}"],
  ["找回后感谢模板", "【好消息】{宠物名}已经平安回家。感谢所有帮忙留意、转发和提供线索的朋友，也祝愿更多走失宠物早日回家。"],
];

export default function TemplatesPage() {
  const jsonLd = createWebPageJsonLd("寻宠启事与扩散文案模板", "/templates", metadata.description as string);
  return (
    <MobileShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <div className="form-page">
        <header className="page-heading"><span className="eyebrow"><FileText size={14} /> 通用占位符模板</span><h1>寻宠启事与扩散文案模板</h1><p>按平台选择合适版本，再将花括号中的占位内容替换为真实寻宠信息。</p></header>
        <section className="identity-section" style={{ display: "grid", gap: 10 }}>{templates.map(([title, text]) => <article key={title} style={{ padding: 14, background: "#f7faf9", border: "1px solid var(--line)", borderRadius: 7 }}><h2 style={{ margin: "0 0 8px", fontSize: 17 }}>{title}</h2><p style={{ margin: 0, color: "#46535c", fontSize: 12, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{text}</p></article>)}</section>
        <section className="identity-section"><Link className="primary-button" style={{ width: "100%" }} href="/lost/new"><Search size={17} /> 发布寻宠信息</Link></section>
      </div>
    </MobileShell>
  );
}
