import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Search } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { createWebPageJsonLd, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "宠物走失信息怎么发｜寻宠启事内容模板 - 鲸伴",
  description: "一条有效的寻宠信息应该包含宠物照片、名字、品种、特征、走失时间、走失地点、联系方式和线索提交方式。鲸伴帮助宠物主快速生成寻宠页和扩散文案。",
};

const sections = [
  ["必填信息清单", "准备宠物名字、类型或品种、明显特征、走失时间、走失地点、最后出现位置、近期照片和安全的线索提交方式。"],
  ["高质量照片建议", "优先使用近期、光线清楚、能看清脸部与全身特征的原图，可补充不同角度和佩戴物照片。"],
  ["走失地点如何描述", "从城市、区县、街道、小区或地标逐级描述，并区分走失地点与最后一次被看到的位置。"],
  ["宠物特征如何写", "写清毛色、体型、花纹、耳朵尾巴特征、项圈衣物、性格以及是否容易受惊。"],
  ["联系方式和隐私保护", "避免在公开文案里展示过多个人信息，优先通过统一详情页收集位置、时间、照片和联系线索。"],
  ["寻宠文案模板", "【寻宠求助】{宠物名}于{走失时间}在{走失地点}附近走失，明显特征为{明显特征}。如有看到，请通过详情页提交位置和时间线索。"],
];

export default function PetLostGuidePage() {
  const jsonLd = createWebPageJsonLd("宠物走失后如何发布有效寻宠信息", "/guide/pet-lost", metadata.description as string);
  return (
    <MobileShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <div className="form-page">
        <header className="page-heading"><span className="eyebrow"><FileText size={14} /> 寻宠信息指南</span><h1>宠物走失后如何发布有效寻宠信息</h1><p>信息越清楚，附近爱心人士越容易快速识别、转发并提交有用线索。</p></header>
        <section className="identity-section" style={{ display: "grid", gap: 14 }}>{sections.map(([title, text], index) => <article key={title}><h2 style={{ margin: "0 0 6px", fontSize: 17 }}>{index + 1}. {title}</h2><p style={{ margin: 0, color: "#4c5961", fontSize: 12, lineHeight: 1.7 }}>{text}</p></article>)}</section>
        <section className="identity-section"><Link className="primary-button" style={{ width: "100%" }} href="/lost/new"><Search size={17} /> 发布寻宠信息</Link></section>
      </div>
    </MobileShell>
  );
}
