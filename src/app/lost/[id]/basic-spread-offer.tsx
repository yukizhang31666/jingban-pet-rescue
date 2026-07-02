"use client";

import { CheckCircle2 } from "lucide-react";

const spreadChecklist = [
  {
    title: "微信群扩散",
    description: "复制寻宠文案，发送到小区群、宠物群和附近业主群。",
  },
  {
    title: "朋友圈扩散",
    description: "使用简短版本文案，配合宠物照片和走失地点发布。",
  },
  {
    title: "小红书扩散",
    description: "使用标题、地点、特征更清晰的版本，方便附近用户搜索。",
  },
  {
    title: "线索收集",
    description: "引导看到宠物的人回到页面提交线索，避免联系方式公开传播。",
  },
];

export function BasicSpreadOffer() {
  return (
    <section className="product-offer">
      <header>
        <span>免费自助工具</span>
        <h2>扩散素材自助清单</h2>
      </header>
      <p style={{ margin: "0 0 15px", color: "var(--muted)", fontSize: 12, lineHeight: 1.65 }}>
        你可以先使用这些免费工具，自行把寻宠信息扩散到更多本地渠道。
      </p>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {spreadChecklist.map((item) => (
          <article style={{ padding: 14, background: "#fff", border: "1px solid var(--line)", borderLeft: "4px solid var(--teal)", borderRadius: 7 }} key={item.title}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 7, margin: "0 0 7px", fontSize: 16 }}>
              <CheckCircle2 size={16} style={{ color: "var(--teal)", flex: "0 0 auto" }} />
              {item.title}
            </h3>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: 12, lineHeight: 1.65 }}>{item.description}</p>
          </article>
        ))}
      </div>
      <small style={{ lineHeight: 1.65 }}>
        鲸伴提供自助扩散工具，不承诺找回结果，不提供线下搜寻、抓捕或动物诊疗服务。
      </small>
    </section>
  );
}
