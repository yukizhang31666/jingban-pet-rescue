import type { Metadata } from "next";
import Link from "next/link";
import { Dog, Search } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { searchIntentRiskNotice } from "@/lib/content";
import { createWebPageJsonLd, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "附近狗丢了怎么找｜寻狗步骤与信息发布 - 鲸伴",
  description: "附近狗丢了应尽快确认最后出现地点、可能活动方向、附近监控和人流区域，同时发布寻狗信息、扩散到本地群并收集线索。",
};

const sections = [
  ["附近狗走失后先做什么", "留人在最后出现地点等候，其他人沿熟悉路线和可能出口分区寻找，同时准备近期照片和特征信息。"],
  ["如何确认最后出现地点", "按时间询问家人、门岗、商户和附近居民，记录最后一次确定看到狗狗的位置，而不是只写大概区域。"],
  ["如何判断可能活动方向", "结合狗狗性格、熟悉路线、道路出口、人流、食物气味以及连续目击时间判断移动方向。"],
  ["如何询问附近人员", "向门卫、商家、路人和保安出示清晰照片，简短说明时间和特征，并留下统一的线索提交入口。"],
  ["如何查看附近监控线索", "联系物业或相关管理方，在允许范围内核对出入口和关键路段的时间段，记录方向而非反复猜测。"],
  ["如何发布寻狗信息", "写明城市、地点、时间、名字、体型、毛色、佩戴物、性格和明显特征，并附可持续更新的详情页。"],
  ["如何扩散到本地群", "优先发送小区群、业主群、附近宠物群和朋友圈，保持文案简洁并统一线索入口。"],
];

export default function DogLostNearbyPage() {
  const jsonLd = createWebPageJsonLd("附近狗丢了怎么找？", "/search-intent/dog-lost-nearby", metadata.description as string);
  const actions = [["发布寻狗信息", "/lost/new"], ["查看寻狗指南", "/guide/dog-lost"], ["查看文案模板", "/templates"]];
  return (
    <MobileShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <div className="form-page">
        <header className="page-heading"><span className="eyebrow"><Dog size={14} /> 寻狗应急指南</span><h1>附近狗丢了怎么找？</h1><p>尽快确认最后出现地点和可能方向，再同步发布清晰的寻狗信息并持续汇总目击线索。</p></header>
        <section className="identity-section" style={{ display: "grid", gap: 14 }}>{sections.map(([heading, text], index) => <article key={heading}><h2 style={{ margin: "0 0 6px", fontSize: 17 }}>{index + 1}. {heading}</h2><p style={{ margin: 0, color: "#4c5961", fontSize: 12, lineHeight: 1.7 }}>{text}</p></article>)}</section>
        <aside style={{ margin: 14, padding: 13, color: "#665711", background: "#fff7d6", borderLeft: "3px solid var(--yellow)", fontSize: 11, lineHeight: 1.65 }}>{searchIntentRiskNotice}</aside>
        <section className="identity-section" style={{ display: "grid", gap: 8 }}>{actions.map(([label, href], index) => <Link className={index === 0 ? "primary-button" : "secondary-button"} href={href} key={href}>{index === 0 && <Search size={17} />}{label}</Link>)}</section>
      </div>
    </MobileShell>
  );
}
