"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiUrl } from "@/lib/api-url";

export function DeleteLeadButton({ id }: { id: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function deleteLead() {
    if (!window.confirm("确认删除这条线索吗？")) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(apiUrl(`/api/admin/leads/${id}/delete`), { method: "DELETE" });
      if (!response.ok) throw new Error("删除失败");
      router.refresh();
    } catch {
      setError("删除失败，请稍后重试。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        className="secondary-button"
        style={{ minHeight: 36, padding: "0 11px", color: "var(--coral)", borderColor: "var(--coral)" }}
        type="button"
        disabled={busy}
        onClick={deleteLead}
      >
        <Trash2 size={15} /> {busy ? "正在删除..." : "删除线索"}
      </button>
      {error && <p className="form-error" style={{ marginTop: 7, textAlign: "left" }} role="alert">{error}</p>}
    </div>
  );
}
