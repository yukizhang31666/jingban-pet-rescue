import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, CheckCircle2, FileText, MapPin, Search } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { findCity } from "@/lib/cities";
import { getDb, type LostRow } from "@/lib/db";
import { formatDateTime, formatLocation } from "@/lib/format";
import { createWebPageJsonLd, serializeJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CityOverview = {
  total_count: number | string;
  searching_count: number | string;
  found_count: number | string;
  latest_created_at: string | null;
};

const statusLabels: Record<string, string> = {
  searching: "寻找中",
  lead: "疑似有线索",
  found: "已找回",
  closed: "已关闭",
};

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const city = findCity((await params).city);
  if (!city) {
    return {
      title: "城市寻宠报告 - 鲸伴",
      description: "查看鲸伴平台沉淀的城市寻宠记录、正在寻找和已找回案例，了解宠物走失后的信息扩散和线索收集方式。",
    };
  }
  return {
    title: `${city.name}宠物走失与寻宠记录｜城市寻宠报告 - 鲸伴`,
    description: `查看${city.name}在鲸伴平台沉淀的宠物走失、正在寻找和已找回记录，了解本城宠物寻宠信息、城市互助和线索收集情况。`,
  };
}

export default async function CityReportPage({ params }: { params: Promise<{ city: string }> }) {
  const city = findCity((await params).city);
  if (!city) {
    return (
      <MobileShell>
        <div className="form-page">
          <section className="marketplace-empty">
            <FileText size={36} />
            <h1>暂未开通该城市寻宠报告。</h1>
            <Link className="primary-button" style={{ marginTop: 16 }} href="/lost">查看全国寻宠</Link>
          </section>
        </div>
      </MobileShell>
    );
  }

  const db = getDb();
  const [overview, recentReports, foundReports] = await Promise.all([
    db.prepare(`
      SELECT
        COUNT(*) AS total_count,
        COUNT(*) FILTER (WHERE COALESCE(status, 'searching') NOT IN ('found', 'closed')) AS searching_count,
        COUNT(*) FILTER (WHERE status = 'found') AS found_count,
        MAX(created_at) AS latest_created_at
      FROM lost_reports WHERE city = ?
    `).get<CityOverview>(city.name),
    db.prepare(`
      SELECT * FROM lost_reports WHERE city = ?
      ORDER BY created_at DESC LIMIT 8
    `).all<LostRow>(city.name),
    db.prepare(`
      SELECT * FROM lost_reports WHERE city = ? AND status = 'found'
      ORDER BY created_at DESC LIMIT 6
    `).all<LostRow>(city.name),
  ]);
  const totalCount = Number(overview?.total_count || 0);
  const searchingCount = Number(overview?.searching_count || 0);
  const foundCount = Number(overview?.found_count || 0);
  const description = `这里展示的是鲸伴平台当前沉淀的${city.name}寻宠记录，包括正在寻找、已找回案例和最新发布信息。数据仅代表平台当前记录，不代表城市整体走失情况。`;
  const jsonLd = createWebPageJsonLd(`${city.name}宠物走失与寻宠记录`, `/city/${city.slug}/report`, description);

  return (
    <MobileShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <div className="lost-network-page">
        <header className="lost-network-heading">
          <span><BarChart3 size={14} /> 城市寻宠报告</span>
          <h1>{city.name}宠物走失与寻宠记录</h1>
          <p>{description}</p>
        </header>

        <section className="lost-network-section">
          <div className="section-heading compact"><div><span>平台当前记录</span><h2>城市概览</h2></div><BarChart3 size={22} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            <Metric label="城市名" value={city.name} />
            <Metric label="总发布数" value={String(totalCount)} />
            <Metric label="正在寻找" value={String(searchingCount)} />
            <Metric label="已找回" value={String(foundCount)} />
          </div>
          <p style={{ margin: "10px 0 0", color: "var(--muted)", fontSize: 11 }}>最近一次发布时间：{formatDateTime(overview?.latest_created_at)}</p>
          {totalCount === 0 && <div className="admin-empty" style={{ marginTop: 12 }}>当前平台暂无{city.name}寻宠数据，后续真实发布记录会显示在这里。</div>}
        </section>

        <section className="lost-network-section" style={{ paddingTop: 0 }}>
          <div className="section-heading compact"><div><span>最近发布</span><h2>本城最新寻宠</h2></div><Search size={22} /></div>
          {recentReports.length > 0 ? (
            <div style={{ display: "grid", gap: 9 }}>
              {recentReports.map((report) => (
                <article key={report.public_id} style={{ padding: 13, background: "#fff", border: "1px solid var(--line)", borderRadius: 7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><strong>{report.pet_name?.trim() || "未命名宠物"}</strong><small style={{ color: "var(--teal)", fontWeight: 800 }}>{statusLabels[report.status] || "寻找中"}</small></div>
                  <p style={{ display: "flex", alignItems: "center", gap: 5, margin: "7px 0 4px", color: "var(--muted)", fontSize: 11 }}><MapPin size={13} /> {displayReportLocation(report)}</p>
                  <p style={{ margin: "0 0 9px", color: "var(--muted)", fontSize: 11 }}>发布时间：{formatDateTime(report.created_at)}</p>
                  <Link className="secondary-button" style={{ width: "fit-content", minHeight: 34, padding: "0 11px" }} href={`/lost/${report.public_id}`}>查看详情</Link>
                </article>
              ))}
            </div>
          ) : <div className="marketplace-empty"><Search size={34} /><p>暂无{city.name}寻宠记录。后续本城发布的寻宠信息会显示在这里。</p></div>}
        </section>

        <section className="lost-network-section" style={{ paddingTop: 0 }}>
          <div className="section-heading compact"><div><span>真实平台记录</span><h2>本城已找回案例</h2></div><CheckCircle2 size={22} /></div>
          {foundReports.length > 0 ? (
            <div style={{ display: "grid", gap: 9 }}>
              {foundReports.map((report) => (
                <article key={report.public_id} style={{ padding: 13, background: "#fff", border: "1px solid var(--line)", borderLeft: "4px solid var(--teal)", borderRadius: 7 }}>
                  <small style={{ color: "var(--teal)", fontWeight: 800 }}>已找回</small>
                  <h3 style={{ margin: "6px 0", fontSize: 17 }}>{report.pet_name?.trim() || "未命名宠物"}</h3>
                  <p style={{ margin: "0 0 10px", color: "var(--muted)", fontSize: 11 }}>地点：{formatLocation({ lost_location: report.lost_location })}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><Link className="primary-button" href={`/cases/${report.public_id}`}>查看案例文章</Link><Link className="secondary-button" href={`/lost/${report.public_id}`}>查看原寻宠页</Link></div>
                </article>
              ))}
            </div>
          ) : <div className="marketplace-empty"><CheckCircle2 size={34} /><p>暂无{city.name}已找回案例。真实找回案例会在这里沉淀为城市信任内容。</p></div>}
        </section>

        <section className="lost-network-section" style={{ paddingTop: 0 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>{city.name}宠物走失后可以怎么做？</h2>
          <p style={{ margin: "0 0 14px", color: "#4c5961", fontSize: 12, lineHeight: 1.7 }}>如果宠物在{city.name}走失，建议先确认最后出现地点、走失时间、宠物明显特征和可联系线索，再通过鲸伴发布寻宠信息，生成适合微信群、朋友圈和小红书的扩散文案，并持续收集可能的目击线索。</p>
          <div style={{ display: "grid", gap: 8 }}><Link className="primary-button" href="/lost/new">发布{city.name}寻宠信息</Link><Link className="secondary-button" href={`/city/${city.slug}`}>查看{city.name}寻宠频道</Link><Link className="secondary-button" href="/guide">查看寻宠指南</Link><Link className="secondary-button" href="/templates">查看文案模板</Link></div>
        </section>

        <aside style={{ margin: 14, padding: 13, color: "#665711", background: "#fff7d6", borderLeft: "3px solid var(--yellow)", fontSize: 11, lineHeight: 1.65 }}>说明：鲸伴不对找回结果作出承诺，不提供动物诊疗或线下搜寻服务，仅提供信息整理、扩散协作和线索收集工具。</aside>
      </div>
    </MobileShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div style={{ padding: 12, background: "#f7faf9", border: "1px solid var(--line)", borderRadius: 7 }}><span style={{ display: "block", color: "var(--muted)", fontSize: 11 }}>{label}</span><strong style={{ display: "block", marginTop: 5, fontSize: 20 }}>{value}</strong></div>;
}

function displayReportLocation(report: LostRow) {
  const region = formatLocation(report);
  const place = formatLocation({ lost_location: report.lost_location });
  return [region, place].filter((value, index, list) => value !== "位置暂未填写" && list.indexOf(value) === index).join(" · ") || "位置暂未填写";
}
