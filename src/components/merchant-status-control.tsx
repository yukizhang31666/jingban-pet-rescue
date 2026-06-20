"use client";

import { useState } from "react";
import { apiUrl } from "@/lib/api-url";

const statuses = ["待审核", "已入驻", "已拒绝"];

export function MerchantStatusControl({ id, initialStatus }: { id: number; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);
  return <select className={`order-status-select status-${status}`} aria-label={`商家申请 ${id} 状态`} value={status} disabled={busy} onChange={async (event) => {
    const previous = status;
    const next = event.target.value;
    setStatus(next);
    setBusy(true);
    try {
      const response = await fetch(apiUrl(`/api/merchant-applications/${id}`), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }), credentials: "include" });
      if (!response.ok) throw new Error("更新失败");
    } catch {
      setStatus(previous);
    } finally {
      setBusy(false);
    }
  }}>{statuses.map((item) => <option value={item} key={item}>{item}</option>)}</select>;
}
