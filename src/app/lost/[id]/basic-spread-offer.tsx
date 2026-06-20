"use client";

import { CheckCircle2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { apiUrl } from "@/lib/api-url";
import { platformContact } from "@/lib/site-config";

const benefits = [
  "微信群扩散文案",
  "朋友圈扩散文案",
  "小红书扩散文案",
  "寻宠详情页链接",
  "平台人工协助检查文案一次",
];

export function BasicSpreadOffer() {
  const pathname = usePathname();
  const lostReportId = pathname.split("/").filter(Boolean).at(-1) || "";
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  return (
    <section className="product-offer">
      <header>
        <span>基础扩散服务</span>
        <h2>需要更多人看到这条寻宠信息？</h2>
      </header>
      <h3 style={{ margin: "0 0 7px", fontSize: 18 }}>29元基础扩散包</h3>
      <p style={{ margin: "0 0 15px", color: "var(--muted)", fontSize: 12, lineHeight: 1.65 }}>
        适合刚发布寻宠信息、希望快速生成多平台扩散内容的宠物主。
      </p>
      <ul>
        {benefits.map((benefit) => <li key={benefit}><CheckCircle2 size={16} /> {benefit}</li>)}
      </ul>
      <div style={{ display: "grid", gap: 6, marginBottom: 14, padding: 13, color: "#315f58", background: "#eaf6f3", borderLeft: "3px solid var(--teal)", fontSize: 12, lineHeight: 1.6 }}>
        <strong>平台人工开通方式：</strong>
        <span>微信：{platformContact.wechat}</span>
        <span>手机：{platformContact.phone}</span>
        <span>添加备注：{platformContact.note}</span>
      </div>
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
          {status === "success" && <p style={{ margin: 0, color: "var(--teal)", fontSize: 12, lineHeight: 1.6 }} role="status">咨询已提交，平台会尽快联系你确认 29 元基础扩散服务。</p>}
          {status === "error" && <p className="form-error" role="alert">提交失败，请稍后重试。</p>}
          <button className="primary-button" type="submit" disabled={busy}>{busy ? "正在提交..." : "提交咨询"}</button>
          <button className="secondary-button" type="button" onClick={() => { setFormOpen(false); setStatus("idle"); }}>取消</button>
        </form>
      )}
      <small>平台不会承诺一定找回宠物，扩散服务仅用于提高信息传播效率。</small>
    </section>
  );
}
