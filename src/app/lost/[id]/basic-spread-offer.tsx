"use client";

import { CheckCircle2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { apiUrl } from "@/lib/api-url";
import { platformContact } from "@/lib/site-config";

const servicePackages = [
  {
    name: "29 元基础寻宠扩散包",
    price: "29 元 / 次",
    badge: "入门",
    audience: "刚发现宠物走失，希望快速整理信息并开始扩散的宠物主。",
    benefits: ["寻宠信息人工整理", "微信群 / 朋友圈 / 小红书扩散文案", "基础寻宠海报 1 张", "公益寻宠详情页链接", "线索提交入口与后台中转提醒"],
    color: "var(--teal)",
  },
  {
    name: "199 元安心扩散包",
    price: "199 元 / 次",
    badge: "推荐",
    audience: "希望有人帮忙更完整整理、优化和跟进扩散素材的宠物主。",
    benefits: ["基础包全部内容", "高级寻宠海报 2 张", "小红书标题和正文优化", "紧急版传播文案优化", "24 小时内优先处理", "线索整理提醒"],
    color: "var(--coral)",
  },
  {
    name: "699 元城市协助包",
    price: "699 元 / 3 天",
    badge: "人工协助",
    audience: "宠物走失时间紧急，希望获得更系统的信息整理和持续跟进协助的宠物主。",
    benefits: ["安心扩散包全部内容", "3 天寻宠信息跟进", "每日线索整理提醒", "寻宠页信息更新协助", "扩散清单建议", "一对一人工沟通协助"],
    color: "var(--violet)",
  },
];

export function BasicSpreadOffer() {
  const pathname = usePathname();
  const lostReportId = pathname.split("/").filter(Boolean).at(-1) || "";
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const contactNote = platformContact.note.replace(/^添加时请备注[：:]\s*/, "");

  return (
    <section className="product-offer">
      <header>
        <span>人工扩散协助</span>
        <h2>寻宠扩散协助服务</h2>
      </header>
      <p style={{ margin: "0 0 15px", color: "var(--muted)", fontSize: 12, lineHeight: 1.65 }}>
        根据紧急程度选择适合的服务。平台提供信息整理、扩散文案、海报和线索中转工具，不对找回结果作出承诺。
      </p>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {servicePackages.map((item) => (
          <article style={{ padding: 14, background: "#fff", border: `1px solid ${item.color}`, borderTop: `4px solid ${item.color}`, borderRadius: 7 }} key={item.name}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>{item.name}</h3>
              {item.badge && <span style={{ flex: "0 0 auto", padding: "4px 7px", color: "#fff", background: item.color, borderRadius: 4, fontSize: 10, fontWeight: 800 }}>{item.badge}</span>}
            </div>
            <strong style={{ display: "block", margin: "7px 0", color: item.color, fontSize: 18 }}>{item.price}</strong>
            <p style={{ margin: "0 0 11px", color: "var(--muted)", fontSize: 11, lineHeight: 1.6 }}>适合：{item.audience}</p>
            <ul style={{ marginBottom: 0 }}>
              {item.benefits.map((benefit) => <li key={benefit}><CheckCircle2 size={15} /> {benefit}</li>)}
            </ul>
          </article>
        ))}
      </div>
      <div style={{ display: "grid", gap: 6, marginBottom: 14, padding: 13, color: "#315f58", background: "#eaf6f3", borderLeft: "3px solid var(--teal)", fontSize: 12, lineHeight: 1.6 }}>
        <strong>平台人工开通方式：</strong>
        <span>微信：{platformContact.wechat}</span>
        <span>手机：{platformContact.phone}</span>
        <span>备注：{contactNote}</span>
      </div>
      <p style={{ margin: "0 0 12px", color: "#765f25", background: "#fff7d6", padding: 10, fontSize: 11, lineHeight: 1.6 }}>
        提交咨询时请在备注中写明想咨询的服务包：29 / 199 / 699。
      </p>
      {!formOpen ? (
        <button className="primary-button" style={{ width: "100%" }} type="button" onClick={() => setFormOpen(true)}>联系平台开通</button>
      ) : (
        <form
          style={{ display: "grid", gap: 9 }}
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setStatus("idle");
            const formElement = event.currentTarget;
            const form = new FormData(formElement);
            try {
              const response = await fetch(apiUrl("/api/spread-inquiries"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lostReportId, contact: form.get("contact"), note: form.get("note") }),
              });
              if (!response.ok) throw new Error("提交失败");
              formElement.reset();
              setStatus("success");
            } catch {
              setStatus("error");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 800 }}>
            联系方式
            <input name="contact" required placeholder="手机号或微信号" style={{ minHeight: 44, padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 6 }} />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 800 }}>
            备注（可选）
            <textarea name="note" maxLength={500} placeholder="请补充你的扩散需求" style={{ minHeight: 80, padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 6, resize: "vertical" }} />
          </label>
          {status === "success" && <p style={{ margin: 0, color: "var(--teal)", fontSize: 12, lineHeight: 1.6 }} role="status">咨询已提交，平台会尽快联系你确认寻宠扩散服务。</p>}
          {status === "error" && <p className="form-error" role="alert">提交失败，请稍后重试。</p>}
          <button className="primary-button" type="submit" disabled={busy}>{busy ? "正在提交..." : "提交咨询"}</button>
          <button className="secondary-button" type="button" onClick={() => { setFormOpen(false); setStatus("idle"); }}>取消</button>
        </form>
      )}
      <small style={{ lineHeight: 1.65 }}>
        服务说明：以上服务均为寻宠信息整理、线上扩散素材制作、线索收集和人工协助服务。平台不对找回结果作出承诺，不提供线下搜寻、上门抓捕、医疗救治或动物诊疗服务。如涉及盗窃、纠纷或危险情况，请及时联系物业、社区或报警处理。
      </small>
    </section>
  );
}
