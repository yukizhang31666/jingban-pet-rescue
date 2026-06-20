"use client";

import { useState } from "react";
import { apiUrl } from "@/lib/api-url";

const statuses = ["待转交", "已通知主人", "已关闭"];

export function ClueStatusControl({ id, initialStatus }: { id: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);

  return (
    <select
      className="order-status-select"
      aria-label={`线索 ${id} 状态`}
      value={status}
      disabled={busy}
      onChange={async (event) => {
        const next = event.target.value;
        setBusy(true);
        const response = await fetch(apiUrl(`/api/lost-clues/${id}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next }),
        });
        if (response.ok) setStatus(next);
        setBusy(false);
      }}
    >
      {statuses.map((item) => <option key={item}>{item}</option>)}
    </select>
  );
}
