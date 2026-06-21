import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Search } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { searchIntentRiskNotice } from "@/lib/content";
import { createWebPageJsonLd, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "宠物走失信息怎么发｜寻宠发布内容清单 - 鲸伴",
  description: "宠物走失信息应包含清晰照片、宠物名字、品种、特征、走失时间、走失地点、联系方式和线索提交方式。鲸伴帮助宠物主快速发布寻宠页并生成扩散文案。",
};

const sections = [
  ["一条有效寻宠信息应包含什么", "至少包含清晰照片、宠物名字、类型或品种、明显特征、走失时间、地点和安全的线索提交方式。"],
  ["清晰照片建议", "选择近期、光线清楚、能看清脸部与全身特征的照片，避免只使用滤镜过重或距离太远的图片。"],
  ["宠物名字、类型、品种怎么写", "使用日常呼唤的名字，并准确填写猫、狗或其他宠物类型；品种不确定时不要猜测。"],
  ["明显特征怎么写", "描述毛色、花纹、体型、耳朵尾巴、项圈衣物、性格和容易被识别的身体特征。"],
  ["走失时间和地点怎么描述", "写明日期与大致时间，从城市、区县、街道、小区或地标逐级描述地点。"],
  ["联系方式和隐私保护", "避免在公开文案中展示过多个人信息，可通过统一详情页接收位置、时间、照片和联系线索。"],
  ["线索提交方式", "请目击者尽量提供看到的位置、时间、移动方向、宠物状态和现场照片。"],
];

export default function PetLostPostPage() {
  const jsonLd = createWebPageJsonLd("宠物走失信息怎么发才有效？", "/search-intent/pet-lost-post", metadata.description as string);
  const actions = [["发布寻宠信息", "/lost/new"], ["查看寻宠模板", "/templates"], ["查看发布指南", "/guide/pet-lost"]];
  return (
    <MobileShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <div className="form-page">
        <header className="page-heading"><span className="eyebrow"><FileText size={14} /> 寻宠发布清单</span><h1>宠物走失信息怎么发才有效？</h1><p>把真实信息整理清楚，并让所有扩散内容指向同一个可更新、可提交线索的寻宠页面。</p></header>
        <section className="identity-section" style={{ display: "grid", gap: 14 }}>{sections.map(([heading, text], index) => <article key={heading}><h2 style={{ margin: "0 0 6px", fontSize: 17 }}>{index + 1}. {heading}</h2><p style={{ margin: 0, color: "#4c5961", fontSize: 12, lineHeight: 1.7 }}>{text}</p></article>)}</section>
        <aside style={{ margin: 14, padding: 13, color: "#665711", background: "#fff7d6", borderLeft: "3px solid var(--yellow)", fontSize: 11, lineHeight: 1.65 }}>{searchIntentRiskNotice}</aside>
        <section className="identity-section" style={{ display: "grid", gap: 8 }}>{actions.map(([label, href], index) => <Link className={index === 0 ? "primary-button" : "secondary-button"} href={href} key={href}>{index === 0 && <Search size={17} />}{label}</Link>)}</section>
      </div>
    </MobileShell>
  );
}
