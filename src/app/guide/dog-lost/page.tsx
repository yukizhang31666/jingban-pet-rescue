import type { Metadata } from "next";
import Link from "next/link";
import { Dog, Search } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { createWebPageJsonLd, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "狗丢了怎么办｜找狗应急步骤与寻狗启事发布 - 鲸伴",
  description: "狗走失后应尽快确认最后出现地点、活动方向、附近监控和人流区域，同时发布寻狗启事、扩散文案并收集线索。鲸伴提供找狗应急步骤和城市寻宠协作工具。",
};

const sections = [
  ["狗走失后的前30分钟", "留人在最后出现地点等候，其他人沿可能路线分区寻找，同时联系物业、门岗和附近商户查看监控。"],
  ["如何判断可能活动方向", "结合狗狗性格、熟悉路线、道路出口、人流、食物气味和目击时间，按时间顺序标记移动方向。"],
  ["如何写寻狗启事", "使用全身与脸部清晰照片，写明名字、体型、毛色、项圈、性格、走失地点时间和明显特征。"],
  ["如何扩散到本地群", "先发送小区群、业主群和附近宠物群，再发布朋友圈；内容保持简洁，并附统一寻宠详情链接。"],
  ["如何收集目击线索", "请目击者记录具体位置、时间、移动方向和现场状态；胆小或警惕的狗不要贸然围堵追赶。"],
  ["如何使用鲸伴发布寻狗信息", "进入发布页填写城市、地点、时间、照片和特征，生成适合多平台转发的寻狗页和线索入口。"],
];

export default function DogLostGuidePage() {
  const jsonLd = createWebPageJsonLd("狗丢了怎么办？找狗应急步骤", "/guide/dog-lost", metadata.description as string);
  return <MobileShell><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} /><div className="form-page"><header className="page-heading"><span className="eyebrow"><Dog size={14} /> 找狗指南</span><h1>狗丢了怎么办？找狗应急步骤</h1><p>尽快确认活动方向与关键时间点，组织分区寻找，并让线索持续汇总到同一寻宠页面。</p></header><section className="identity-section" style={{ display: "grid", gap: 14 }}>{sections.map(([title, text], index) => <article key={title}><h2 style={{ margin: "0 0 6px", fontSize: 17 }}>{index + 1}. {title}</h2><p style={{ margin: 0, color: "#4c5961", fontSize: 12, lineHeight: 1.7 }}>{text}</p></article>)}</section><aside style={{ margin: 14, padding: 13, color: "#665711", background: "#fff7d6", borderLeft: "3px solid var(--yellow)", fontSize: 11, lineHeight: 1.65 }}>风险说明：平台不对找回结果作出承诺，不提供动物诊疗或线下搜寻服务。涉及道路、陌生区域或其他危险环境时，请优先保障人员安全。</aside><section className="identity-section"><Link className="primary-button" style={{ width: "100%" }} href="/lost/new"><Search size={17} /> 发布寻狗信息</Link></section></div></MobileShell>;
}
