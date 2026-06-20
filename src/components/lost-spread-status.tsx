"use client";

import { CheckCircle2, Eye, Radio, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

export function LostSpreadStatus({ lostId, views, shares }: { lostId: string; views: number; shares: number }) {
  const [shared, setShared] = useState(false);
  const [shareCount, setShareCount] = useState(shares);

  useEffect(() => {
    const onShared = (event: Event) => {
      const detail = (event as CustomEvent<{ targetType?: string; targetId?: string }>).detail;
      if (detail?.targetType !== "lost" || detail.targetId !== lostId) return;
      window.localStorage.setItem(`jingban:lost-shared:${lostId}`, "1");
      setShared(true);
      setShareCount((count) => count + 1);
    };
    window.addEventListener("jingban:share-success", onShared);
    return () => window.removeEventListener("jingban:share-success", onShared);
  }, [lostId]);

  return (
    <section className={`lost-spread-status ${shared ? "shared" : ""}`} aria-live="polite">
      <div className="public-service-badges">
        <span><Radio size={14} /> 公益寻宠信息</span>
        <span><Share2 size={14} /> 正在扩散中</span>
      </div>
      <div className="spread-counters">
        <span><Eye size={16} /><strong>{views}</strong> 次浏览</span>
        <span><Share2 size={16} /><strong>{shareCount}</strong> 次扩散</span>
      </div>
      {shared ? <p><CheckCircle2 size={17} /> 已帮助扩散，谢谢你为它增加一份回家的可能。</p> : <p>转发一次，就可能把线索送到离它最近的人手里。</p>}
    </section>
  );
}
