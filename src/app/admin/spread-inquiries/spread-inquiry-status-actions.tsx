"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiUrl } from "@/lib/api-url";

const statusOptions = [
  { value: "new", label: "标记新咨询" },
  { value: "contacted", label: "标记已联系" },
  { value: "converted", label: "标记已成交" },
  { value: "closed", label: "标记已关闭" },
];

export function SpreadInquiryStatusActions({ id, initialStatus }: { id: number; initialStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus || "new");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function updateStatus(nextStatus: string) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(apiUrl(`/api/admin/spread-inquiries/${id}/status`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) throw new Error("更新失败");
      setStatus(nextStatus);
      router.refresh();
    } catch {
      setError("状态更新失败，请稍后重试。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 4 }}>
      {statusOptions.map((option) => (
        <button
          className={status === option.value ? "primary-button" : "secondary-button"}
          style={{ minHeight: 36, padding: "0 11px", fontSize: 11 }}
          type="button"
          disabled={busy || status === option.value}
          onClick={() => updateStatus(option.value)}
          key={option.value}
        >
          {option.label}
        </button>
      ))}
      {error && <p className="form-error" style={{ width: "100%", textAlign: "left" }} role="alert">{error}</p>}
    </div>
  );
}
