import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MapPin } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { getDb, type LostRow } from "@/lib/db";
import { formatLocation } from "@/lib/format";
import { createWebPageJsonLd, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "宠物找回案例｜猫狗走失成功寻回故事 - 鲸伴",
  description: "查看鲸伴平台已找回的宠物案例，了解宠物走失后如何通过城市协作、信息扩散和线索收集提高被看见的机会。",
};
export const dynamic = "force-dynamic";

export default async function CasesPage() {
  const reports = await getDb().prepare(`
    SELECT * FROM lost_reports WHERE status = 'found'
    ORDER BY created_at DESC LIMIT 30
  `).all<LostRow>();
  const jsonLd = createWebPageJsonLd("成功找回案例故事", "/cases", metadata.description as string);

  return (
    <MobileShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <div className="lost-network-page">
        <header className="lost-network-heading">
          <span><CheckCircle2 size={14} /> 城市互助记录</span>
          <h1>成功找回案例故事</h1>
          <p>这里展示的是鲸伴平台已找回的真实记录。案例用于沉淀经验和增强信息透明度，不构成对找回结果的承诺。</p>
        </header>
        <section className="lost-network-section">
          {reports.length > 0 ? (
            <div style={{ display: "grid", gap: 10 }}>
              {reports.map((report) => (
                <article key={report.public_id} style={{ padding: 14, background: "#fff", border: "1px solid var(--line)", borderLeft: "4px solid var(--teal)", borderRadius: 7 }}>
                  <small style={{ color: "var(--teal)", fontWeight: 800 }}>已找回</small>
                  <h2 style={{ margin: "7px 0", fontSize: 18 }}>{report.pet_name?.trim() || "宠物"}</h2>
                  <p style={{ display: "flex", alignItems: "center", gap: 5, margin: "0 0 7px", color: "var(--muted)", fontSize: 12 }}><MapPin size={14} /> {formatLocation(report)}</p>
                  <p style={{ margin: "0 0 11px", color: "#4c5961", fontSize: 12, lineHeight: 1.65 }}>这条信息已由后台标记为已找回，保留内容用于记录城市协作、信息扩散和线索收集。</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <Link className="primary-button" href={`/cases/${report.public_id}`}>查看案例文章</Link>
                    <Link className="secondary-button" href={`/lost/${report.public_id}`}>查看原寻宠页</Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="marketplace-empty">
              <CheckCircle2 size={36} />
              <h2>暂无已找回案例</h2>
              <p>真实找回案例会在这里沉淀为信任内容。</p>
              <Link className="secondary-button" style={{ marginTop: 16 }} href="/lost">查看正在寻找</Link>
            </div>
          )}
        </section>
      </div>
    </MobileShell>
  );
}
