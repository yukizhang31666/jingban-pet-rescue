import type { Metadata } from "next";
import Link from "next/link";
import { Cat, Search } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { createWebPageJsonLd, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "猫丢了怎么办｜找猫应急步骤与寻猫启事发布 - 鲸伴",
  description: "猫走失后可以先从楼道、地下室、绿化带和熟悉气味区域排查，同时发布寻猫启事、生成扩散文案并收集线索。鲸伴提供找猫应急步骤和城市协作工具。",
};

const sections = [
  ["猫走失后的前30分钟", "先确认门窗、楼道和最后出现位置，减少嘈杂呼喊，带上手电、食物和熟悉气味物品在附近安静寻找。"],
  ["常见躲藏位置", "重点检查楼梯间、地下室、车底、灌木丛、设备间、管道附近和安静狭窄的遮挡区域。"],
  ["如何写寻猫启事", "使用近期清晰照片，写明名字、毛色、体型、明显特征、走失时间、地点和可能的移动方向。"],
  ["如何制作扩散文案", "微信群版本要简短直接，朋友圈强调地点和特征，小红书正文可加入城市、时间、照片与统一详情链接。"],
  ["如何收集线索", "请目击者提供看到的位置、时间、移动方向和照片，提醒对方不要突然追赶或惊吓猫咪。"],
  ["如何使用鲸伴发布寻猫信息", "进入发布页填写照片、城市、走失时间地点和特征，系统会生成可转发详情页、扩散文案与线索入口。"],
];

export default function CatLostGuidePage() {
  const jsonLd = createWebPageJsonLd("猫丢了怎么办？找猫应急步骤", "/guide/cat-lost", metadata.description as string);
  return <MobileShell><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} /><div className="form-page"><header className="page-heading"><span className="eyebrow"><Cat size={14} /> 找猫指南</span><h1>猫丢了怎么办？找猫应急步骤</h1><p>从最后出现位置开始安静排查，同时尽快整理寻猫信息并建立持续更新的线索入口。</p></header><section className="identity-section" style={{ display: "grid", gap: 14 }}>{sections.map(([title, text], index) => <article key={title}><h2 style={{ margin: "0 0 6px", fontSize: 17 }}>{index + 1}. {title}</h2><p style={{ margin: 0, color: "#4c5961", fontSize: 12, lineHeight: 1.7 }}>{text}</p></article>)}</section><aside style={{ margin: 14, padding: 13, color: "#665711", background: "#fff7d6", borderLeft: "3px solid var(--yellow)", fontSize: 11, lineHeight: 1.65 }}>风险说明：平台不对找回结果作出承诺，不提供动物诊疗或线下搜寻服务。涉及道路、陌生区域或其他危险环境时，请优先保障人员安全。</aside><section className="identity-section"><Link className="primary-button" style={{ width: "100%" }} href="/lost/new"><Search size={17} /> 发布寻猫信息</Link></section></div></MobileShell>;
}
