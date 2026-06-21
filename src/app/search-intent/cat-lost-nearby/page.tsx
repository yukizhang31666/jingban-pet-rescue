import type { Metadata } from "next";
import Link from "next/link";
import { Cat, Search } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { searchIntentRiskNotice } from "@/lib/content";
import { createWebPageJsonLd, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "附近猫丢了怎么找｜寻猫步骤与信息发布 - 鲸伴",
  description: "附近猫丢了可以先排查楼道、地下室、绿化带、停车场和熟悉气味区域，同时发布寻猫信息、生成扩散文案并收集目击线索。",
};

const sections = [
  ["附近猫走失后先做什么", "先确认最后出现时间和位置，保持环境安静，带上手电、食物和熟悉气味物品，从近到远分区寻找。"],
  ["常见排查位置", "依次检查楼道、地下室、停车场、车底、绿化带、小区角落以及猫咪熟悉气味附近的遮挡区域。"],
  ["如何描述走失地点", "写清城市、区县、街道、小区或地标，并区分走失地点与最后一次目击位置。"],
  ["如何发布寻猫信息", "准备近期清晰照片，写明名字、毛色、体型、特征、走失时间地点和统一线索入口。"],
  ["如何扩散到本地群", "优先发送业主群、附近宠物群和朋友圈；小红书内容可加入城市、地点和清晰照片，但避免公开过多个人信息。"],
  ["如何收集目击线索", "请目击者提供具体位置、时间、移动方向和照片，提醒对方不要突然追赶或惊吓猫咪。"],
];

export default function CatLostNearbyPage() {
  const jsonLd = createWebPageJsonLd("附近猫丢了怎么找？", "/search-intent/cat-lost-nearby", metadata.description as string);
  return <SearchArticle icon={<Cat size={14} />} title="附近猫丢了怎么找？" intro="先从最后出现位置附近安静排查，再同步整理并发布可转发的寻猫信息。" sections={sections} jsonLd={jsonLd} actions={[["发布寻猫信息", "/lost/new"], ["查看寻猫指南", "/guide/cat-lost"], ["查看文案模板", "/templates"]]} />;
}

function SearchArticle({ icon, title, intro, sections, jsonLd, actions }: { icon: React.ReactNode; title: string; intro: string; sections: string[][]; jsonLd: object; actions: string[][] }) {
  return <MobileShell><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} /><div className="form-page"><header className="page-heading"><span className="eyebrow">{icon} 寻宠应急指南</span><h1>{title}</h1><p>{intro}</p></header><section className="identity-section" style={{ display: "grid", gap: 14 }}>{sections.map(([heading, text], index) => <article key={heading}><h2 style={{ margin: "0 0 6px", fontSize: 17 }}>{index + 1}. {heading}</h2><p style={{ margin: 0, color: "#4c5961", fontSize: 12, lineHeight: 1.7 }}>{text}</p></article>)}</section><aside style={{ margin: 14, padding: 13, color: "#665711", background: "#fff7d6", borderLeft: "3px solid var(--yellow)", fontSize: 11, lineHeight: 1.65 }}>{searchIntentRiskNotice}</aside><section className="identity-section" style={{ display: "grid", gap: 8 }}>{actions.map(([label, href], index) => <Link className={index === 0 ? "primary-button" : "secondary-button"} href={href} key={href}>{index === 0 && <Search size={17} />}{label}</Link>)}</section></div></MobileShell>;
}
