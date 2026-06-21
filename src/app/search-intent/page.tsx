import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import type { CSSProperties } from "react";
import { MobileShell } from "@/components/mobile-shell";
import { searchIntentRiskNotice } from "@/lib/content";
import { createWebPageJsonLd, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "宠物走失搜索入口｜找猫找狗寻宠问题汇总 - 鲸伴",
  description: "鲸伴整理猫丢了怎么办、狗丢了怎么办、附近找猫、附近找狗、宠物走失信息怎么发、寻宠启事怎么写等常见问题入口，帮助宠物主快速找到寻宠指南、发布入口和城市寻宠页面。",
};

const entries = [
  ["猫丢了怎么办", "/guide/cat-lost"],
  ["狗丢了怎么办", "/guide/dog-lost"],
  ["附近猫丢了怎么找", "/search-intent/cat-lost-nearby"],
  ["附近狗丢了怎么找", "/search-intent/dog-lost-nearby"],
  ["宠物走失信息怎么发", "/search-intent/pet-lost-post"],
  ["寻宠启事怎么写", "/search-intent/lost-pet-notice"],
  ["寻宠文案模板", "/templates"],
  ["发布寻宠信息", "/lost/new"],
];

export default function SearchIntentPage() {
  const jsonLd = createWebPageJsonLd("宠物走失常见问题入口", "/search-intent", metadata.description as string);
  return (
    <MobileShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <div className="form-page">
        <header className="page-heading">
          <span className="eyebrow"><Search size={14} /> 常见问题搜索入口</span>
          <h1>宠物走失常见问题入口</h1>
          <p>宠物走失时，很多人会先搜索“猫丢了怎么办”“狗丢了怎么办”“附近猫丢了怎么找”等问题。鲸伴整理了常见入口，帮助宠物主快速找到对应指南、文案模板和发布寻宠入口。</p>
        </header>
        <section className="identity-section" style={{ display: "grid", gap: 8 }}>
          {entries.map(([label, href]) => <Link className="secondary-button" href={href} key={href} style={{ justifyContent: "space-between" }}>{label}<ArrowRight size={16} /></Link>)}
        </section>
        <aside style={riskStyle}>{searchIntentRiskNotice}</aside>
      </div>
    </MobileShell>
  );
}

const riskStyle: CSSProperties = { margin: 14, padding: 13, color: "#665711", background: "#fff7d6", borderLeft: "3px solid var(--yellow)", fontSize: 11, lineHeight: 1.65 };
