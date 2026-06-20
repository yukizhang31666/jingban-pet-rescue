"use client";

import { CircleCheck, LoaderCircle, MessageSquareText, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { apiUrl } from "@/lib/api-url";

export function LostClueForm({ lostId, petName }: { lostId: string; petName: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [clueId, setClueId] = useState("");

  if (clueId) {
    return (
      <section className="clue-success" id="clue-form" aria-live="polite">
        <CircleCheck size={42} />
        <h2>线索已由平台接收</h2>
        <p>编号 {clueId}。工作人员会核对后转交 {petName} 的主人，不会在公开页面展示你的信息。</p>
      </section>
    );
  }

  return (
    <section className="identity-section clue-section" id="clue-form">
      <span className="public-service-kicker"><ShieldCheck size={14} /> 隐私保护线索中转</span>
      <h2>我有关于 {petName} 的线索</h2>
      <p>无需公开身份。请尽量描述时间、位置和移动方向，平台后台会把有效线索转交主人。</p>
      <form
        className="clue-form"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          const form = new FormData(event.currentTarget);
          try {
            const response = await fetch(apiUrl(`/api/lost/${lostId}/clues`), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                message: form.get("message"),
                seenLocation: form.get("seenLocation"),
                seenTime: form.get("seenTime"),
                contact: form.get("contact"),
                company: form.get("company"),
              }),
            });
            const data = await response.json() as { clueId?: string; error?: string };
            if (!response.ok || !data.clueId) throw new Error(data.error || "线索提交失败");
            setClueId(data.clueId);
          } catch (caught) {
            setError(caught instanceof Error ? caught.message : "线索提交失败，请稍后重试");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label htmlFor="clue-message">线索描述<span> *</span></label>
        <textarea id="clue-message" name="message" minLength={5} maxLength={600} placeholder="例如：今天18:20在商场东门看到一只相似宠物，往地铁站方向移动" required />
        <div className="clue-grid">
          <div><label htmlFor="clue-location">看到的位置</label><input id="clue-location" name="seenLocation" maxLength={150} placeholder="街道、小区或店铺附近" /></div>
          <div><label htmlFor="clue-time">看到的时间</label><input id="clue-time" name="seenTime" type="datetime-local" /></div>
        </div>
        <label htmlFor="clue-contact">你的联系方式（可选）</label>
        <input id="clue-contact" name="contact" maxLength={80} placeholder="仅供工作人员必要时回访，不公开展示" />
        <input className="clue-honeypot" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button clue-submit" type="submit" disabled={busy}>
          {busy ? <LoaderCircle className="spin" size={19} /> : <MessageSquareText size={19} />}
          {busy ? "正在安全提交..." : "匿名提交线索给平台"}
        </button>
      </form>
    </section>
  );
}
