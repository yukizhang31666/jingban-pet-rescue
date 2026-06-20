"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { apiUrl } from "@/lib/api-url";

export function CopyButton({ text, targetType, targetId, channel }: { text: string; targetType?: "lost"; targetId?: string; channel?: string }) {
  const [copied, setCopied] = useState(false);

  async function track(action: "click" | "success") {
    if (!targetType || !targetId) return;
    await fetch(apiUrl("/api/share"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, channel: channel || "content-copy", action }),
    }).catch(() => undefined);
    if (action === "success") {
      window.dispatchEvent(new CustomEvent("jingban:share-success", { detail: { targetType, targetId, channel } }));
    }
  }

  return (
    <button
      className="icon-action"
      type="button"
      title="复制文案"
      aria-label="复制文案"
      onClick={async () => {
        await track("click");
        await navigator.clipboard.writeText(text);
        await track("success");
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }}
    >
      {copied ? <Check size={18} /> : <Copy size={18} />}
      <span>{copied ? "已复制" : "复制"}</span>
    </button>
  );
}
