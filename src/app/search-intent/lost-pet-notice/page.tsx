import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Search } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { searchIntentRiskNotice } from "@/lib/content";
import { createWebPageJsonLd, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "寻宠启事怎么写｜找猫找狗启事模板与注意事项 - 鲸伴",
  description: "寻宠启事应清楚写明宠物照片、名字、走失地点、走失时间、明显特征和线索提交方式。鲸伴整理适合微信群、朋友圈和小红书的寻宠启事写法。",
};

const sections = [
  ["寻宠启事的基本结构", "由清晰标题、核心信息、明显特征、行动提醒和统一线索入口组成，优先让读者快速判断地点与宠物特征。"],
  ["标题怎么写", "标题可包含城市或地点、宠物类型和求助动作，例如“深圳南山区寻猫｜请附近朋友帮忙留意”。"],
  ["正文必须包含哪些信息", "写清照片、名字、类型、走失时间、地点、最后出现位置、明显特征和线索提交方式。"],
  ["特征描述怎么写", "使用毛色、花纹、体型、项圈、衣物、性格等可观察信息，避免只写“很可爱”等主观描述。"],
  ["如何避免隐私泄露", "公开内容以寻宠所需信息为主，联系方式可由平台线索入口中转，不展示不必要的住址和个人资料。"],
  ["不同平台的文案差异", "微信群要简短直接，朋友圈可增加求助语气，小红书正文适合分行展示城市、地点、时间、特征和详情入口。"],
];

export default function LostPetNoticePage() {
  const jsonLd = createWebPageJsonLd("寻宠启事怎么写？", "/search-intent/lost-pet-notice", metadata.description as string);
  return (
    <MobileShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <div className="form-page">
        <header className="page-heading"><span className="eyebrow"><FileText size={14} /> 寻宠启事写法</span><h1>寻宠启事怎么写？</h1><p>用真实、清晰、便于识别的内容说明宠物在哪里、什么时候走失，以及如何提交线索。</p></header>
        <section className="identity-section" style={{ display: "grid", gap: 14 }}>{sections.map(([heading, text], index) => <article key={heading}><h2 style={{ margin: "0 0 6px", fontSize: 17 }}>{index + 1}. {heading}</h2><p style={{ margin: 0, color: "#4c5961", fontSize: 12, lineHeight: 1.7 }}>{text}</p></article>)}<article style={{ padding: 13, background: "#f7faf9", border: "1px solid var(--line)", borderRadius: 7 }}><h2 style={{ margin: "0 0 7px", fontSize: 17 }}>7. 通用模板</h2><p style={{ margin: 0, color: "#46535c", fontSize: 12, lineHeight: 1.7 }}>【寻宠求助】我的{`{宠物类型}{宠物名}`}于{`{走失时间}`}在{`{走失地点}`}附近走失，特征是{`{明显特征}`}。如有看到，请通过寻宠页面提交线索。</p></article></section>
        <aside style={{ margin: 14, padding: 13, color: "#665711", background: "#fff7d6", borderLeft: "3px solid var(--yellow)", fontSize: 11, lineHeight: 1.65 }}>{searchIntentRiskNotice}</aside>
        <section className="identity-section" style={{ display: "grid", gap: 8 }}><Link className="primary-button" href="/lost/new"><Search size={17} /> 发布寻宠信息</Link><Link className="secondary-button" href="/templates">查看完整模板</Link></section>
      </div>
    </MobileShell>
  );
}
