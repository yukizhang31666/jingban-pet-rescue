"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { apiUrl } from "@/lib/api-url";

export function LeadHintButton({ lostId }: { lostId: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [busy, setBusy] = useState(false);

  function closeDialog() {
    setOpen(false);
    setStatus("idle");
  }

  return (
    <>
      <button
        className="primary-button contact-button"
        style={{ background: "var(--coral)" }}
        type="button"
        onClick={() => setOpen(true)}
      >
        <MessageCircle size={19} /> 我有线索
      </button>
      {open && (
        <div
          style={{ position: "fixed", zIndex: 100, inset: 0, display: "grid", placeItems: "center", padding: 20, background: "rgba(13, 21, 27, 0.66)" }}
          role="presentation"
        >
          <section
            style={{ width: "min(100%, 420px)", padding: 24, background: "#fff", borderRadius: 8, boxShadow: "0 18px 45px rgba(0, 0, 0, 0.22)" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-hint-title"
          >
            <h2 id="lead-hint-title" style={{ margin: "0 0 16px", fontSize: 20 }}>提交宠物线索</h2>
            <form
              style={{ display: "grid", gap: 11 }}
              onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);
                setStatus("idle");
                const formElement = event.currentTarget;
                const form = new FormData(formElement);
                try {
                  const response = await fetch(apiUrl(`/api/lost/${lostId}/leads`), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      seenLocation: form.get("seenLocation"),
                      seenTime: form.get("seenTime"),
                      description: form.get("description"),
                      contact: form.get("contact"),
                      isAnonymous: form.get("anonymous") === "on",
                    }),
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
                看到的位置
                <input name="seenLocation" required placeholder="街道、小区或店铺附近" style={{ minHeight: 44, padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 6 }} />
              </label>
              <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 800 }}>
                看到的时间
                <input name="seenTime" type="datetime-local" required style={{ minHeight: 44, padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 6 }} />
              </label>
              <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 800 }}>
                线索描述
                <textarea name="description" required placeholder="请描述宠物当时的状态和移动方向" style={{ minHeight: 90, padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 6, resize: "vertical" }} />
              </label>
              <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 800 }}>
                联系方式（可选）
                <input name="contact" placeholder="手机号或微信号" style={{ minHeight: 44, padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 6 }} />
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#4c5961", fontSize: 12 }}>
                <input name="anonymous" type="checkbox" defaultChecked /> 是否匿名
              </label>
              {status === "success" && (
                <p style={{ margin: 0, padding: 11, color: "#315f58", background: "#eaf6f3", fontSize: 12, lineHeight: 1.6 }} role="status">
                  线索已提交，感谢你的帮助。平台会尽快协助宠物主查看。
                </p>
              )}
              {status === "error" && <p className="form-error" role="alert">提交失败，请稍后重试。</p>}
              <button className="primary-button" type="submit" disabled={busy}>{busy ? "正在提交..." : "提交线索"}</button>
              <button className="secondary-button" type="button" onClick={closeDialog}>关闭</button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
