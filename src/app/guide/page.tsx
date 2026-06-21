import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { createWebPageJsonLd, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "宠物走失怎么办｜找猫找狗应急指南 - 鲸伴",
  description: "宠物走失后应该先做什么？鲸伴整理找猫、找狗、发布寻宠信息、制作扩散文案、收集线索和城市协作的实用指南，帮助宠物主冷静处理走失情况。",
};

const topics = [
  { title: "猫丢了怎么办", text: "先从楼道、地下室、绿化带和熟悉气味区域安静排查。", href: "/guide/cat-lost" },
  { title: "狗丢了怎么办", text: "尽快确认最后出现地点、活动方向、附近监控和人流区域。", href: "/guide/dog-lost" },
  { title: "宠物走失后前30分钟怎么做", text: "记录时间地点、组织分区寻找、调取附近监控，并准备清晰照片。" },
  { title: "如何写一条有效寻宠启事", text: "写清照片、名字、特征、时间、地点和安全的线索提交方式。", href: "/guide/pet-lost" },
  { title: "如何在微信群、朋友圈、小红书扩散", text: "针对不同平台调整长度和重点，保留同一个详情页与线索入口。", href: "/templates" },
  { title: "如何保护联系方式和隐私", text: "避免公开过多个人信息，优先通过统一线索入口接收目击信息。" },
];

export default function GuidePage() {
  const jsonLd = createWebPageJsonLd("宠物走失应急指南", "/guide", metadata.description as string);
  return (
    <MobileShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <div className="form-page">
        <header className="page-heading"><span className="eyebrow"><BookOpen size={14} /> 寻宠知识入口</span><h1>宠物走失应急指南</h1><p>宠物走失时先保持冷静，按步骤记录信息、排查附近区域、发布寻宠内容并持续收集线索。</p></header>
        <section className="identity-section" style={{ display: "grid", gap: 10 }}>
          {topics.map((topic) => (
            <article key={topic.title} style={{ padding: 14, background: "#fff", border: "1px solid var(--line)", borderRadius: 7 }}>
              <h2 style={{ margin: "0 0 7px", fontSize: 17 }}>{topic.title}</h2>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: 12, lineHeight: 1.65 }}>{topic.text}</p>
              {topic.href && <Link href={topic.href} style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 9, color: "var(--teal)", fontSize: 12, fontWeight: 800 }}>查看指南 <ArrowRight size={14} /></Link>}
            </article>
          ))}
        </section>
        <section className="identity-section" style={{ display: "grid", gap: 8 }}>
          <Link className="primary-button" href="/lost/new"><Search size={17} /> 发布寻宠信息</Link>
          <Link className="secondary-button" href="/lost">查看全国寻宠</Link>
          <Link className="secondary-button" href="/success">查看成功案例</Link>
        </section>
      </div>
    </MobileShell>
  );
}
