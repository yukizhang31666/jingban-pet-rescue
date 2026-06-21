import Link from "next/link";
import { BarChart3, MapPin, Share2 } from "lucide-react";
import { cities } from "@/lib/cities";
import { formatDateTime } from "@/lib/format";
import { GrowthActionSuggestions } from "./growth-action-suggestions";

type CountValue = number | string;

export type SourceGrowthRow = {
  referral_code: string;
  publish_count: CountValue;
  lead_count: CountValue;
  found_count: CountValue;
  latest_created_at: string | null;
};

export type CityGrowthRow = {
  city: string;
  publish_count: CountValue;
  lead_count: CountValue;
  found_count: CountValue;
  searching_count: CountValue;
  latest_created_at: string | null;
};

export function GrowthDashboard({
  metrics,
  sourceRows,
  cityRows,
}: {
  metrics: { lostCount: number; referredLostCount: number; leadCount: number; foundCount: number; inquiryCount: number };
  sourceRows: SourceGrowthRow[];
  cityRows: CityGrowthRow[];
}) {
  const metricItems = [
    ["总寻宠发布数", metrics.lostCount],
    ["有来源发布数", metrics.referredLostCount],
    ["总线索数", metrics.leadCount],
    ["已找回数", metrics.foundCount],
    ["扩散服务咨询数", metrics.inquiryCount],
  ];

  return (
    <section className="admin-section" aria-labelledby="growth-dashboard-title">
      <header style={{ alignItems: "flex-start" }}>
        <div>
          <h2 id="growth-dashboard-title">增长飞轮数据驾驶舱</h2>
          <p style={{ margin: "5px 0 0", color: "var(--muted)", fontSize: 12, lineHeight: 1.6 }}>根据发布、线索、找回和来源数据，判断哪些城市和传播链接正在带来真实增长。</p>
        </div>
        <BarChart3 size={22} />
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 22 }}>
        {metricItems.map(([label, value]) => (
          <div key={label} style={{ padding: 12, background: "#f7faf9", border: "1px solid var(--line)", borderRadius: 7 }}>
            <span style={{ display: "block", color: "var(--muted)", fontSize: 11 }}>{label}</span>
            <strong style={{ display: "block", marginTop: 5, color: "var(--ink)", fontSize: 22 }}>{value}</strong>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 20 }}>
        <section>
          <h3 style={{ display: "flex", alignItems: "center", gap: 7, margin: "0 0 10px", fontSize: 16 }}><Share2 size={17} /> 传播来源排行</h3>
          {sourceRows.length > 0 ? (
            <div style={{ display: "grid", gap: 8 }}>
              {sourceRows.map((row) => {
                const source = row.referral_code?.trim();
                if (!source) return null;
                return (
                  <article key={source} style={{ padding: 12, background: "#fff", border: "1px solid var(--line)", borderRadius: 7 }}>
                    <strong style={{ display: "block", marginBottom: 8, color: "var(--teal)", fontSize: 14 }}>{source}</strong>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7, color: "#4c5961", fontSize: 11 }}>
                      <span>发布：{Number(row.publish_count || 0)}</span>
                      <span>线索：{Number(row.lead_count || 0)}</span>
                      <span>已找回：{Number(row.found_count || 0)}</span>
                    </div>
                    <small style={{ display: "block", marginTop: 8, color: "var(--muted)" }}>最近发布：{formatDateTime(row.latest_created_at)}</small>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="admin-empty">暂无传播来源排行。用户通过 /invite 生成链接并带 ref 发布寻宠后，这里会显示来源效果。</div>
          )}
        </section>

        <section>
          <h3 style={{ display: "flex", alignItems: "center", gap: 7, margin: "0 0 10px", fontSize: 16 }}><MapPin size={17} /> 城市增长热度</h3>
          {cityRows.length > 0 ? (
            <div style={{ display: "grid", gap: 8 }}>
              {cityRows.map((row) => {
                const cityName = row.city?.trim();
                if (!cityName) return null;
                const cityConfig = cities.find((city) => city.name === cityName);
                return (
                  <article key={cityName} style={{ padding: 12, background: "#fff", border: "1px solid var(--line)", borderRadius: 7 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <strong style={{ color: "var(--ink)", fontSize: 14 }}>{cityName}</strong>
                      {cityConfig && <Link href={`/city/${cityConfig.slug}`} target="_blank" style={{ color: "var(--teal)", fontSize: 11, fontWeight: 800 }}>城市详情</Link>}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7, marginTop: 8, color: "#4c5961", fontSize: 11 }}>
                      <span>发布：{Number(row.publish_count || 0)}</span>
                      <span>线索：{Number(row.lead_count || 0)}</span>
                      <span>已找回：{Number(row.found_count || 0)}</span>
                      <span>寻找中：{Number(row.searching_count || 0)}</span>
                    </div>
                    <small style={{ display: "block", marginTop: 8, color: "var(--muted)" }}>最近发布：{formatDateTime(row.latest_created_at)}</small>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="admin-empty">暂无城市增长数据。发布带城市字段的寻宠信息后，这里会显示城市热度。</div>
          )}
        </section>
      </div>

      <GrowthActionSuggestions metrics={metrics} sourceRows={sourceRows} cityRows={cityRows} />
    </section>
  );
}
