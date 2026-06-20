"use client";

import { useState } from "react";
import { apiUrl } from "@/lib/api-url";

const statuses = ["待确认", "已确认", "已交付"];

export function OrderStatusControl({ orderNo, initialStatus }: { orderNo: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus === "待支付" ? "待确认" : initialStatus);
  const [busy, setBusy] = useState(false);

  return (
    <select
      className={`order-status-select status-${status}`}
      value={status}
      disabled={busy}
      aria-label={`订单 ${orderNo} 付款状态`}
      onChange={async (event) => {
        const nextStatus = event.target.value;
        const previousStatus = status;
        setStatus(nextStatus);
        setBusy(true);
        try {
          const response = await fetch(apiUrl(`/api/orders/${encodeURIComponent(orderNo)}`), {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: nextStatus }),
          });
          if (!response.ok) throw new Error("更新失败");
        } catch {
          setStatus(previousStatus);
        } finally {
          setBusy(false);
        }
      }}
    >
      {statuses.map((item) => <option value={item} key={item}>{item}</option>)}
    </select>
  );
}
