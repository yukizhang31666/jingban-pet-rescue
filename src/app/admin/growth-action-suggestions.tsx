import Link from "next/link";
import { Activity, Lightbulb, MapPin, Share2 } from "lucide-react";
import type { CSSProperties } from "react";
import { cities } from "@/lib/cities";
import type { CityGrowthRow, SourceGrowthRow } from "./growth-dashboard";

type GrowthMetrics = {
  lostCount: number;
  referredLostCount: number;
  leadCount: number;
  foundCount: number;
  inquiryCount: number;
};

export function GrowthActionSuggestions({
  metrics,
  sourceRows,
  cityRows,
}: {
  metrics: GrowthMetrics;
  sourceRows: SourceGrowthRow[];
  cityRows: CityGrowthRow[];
}) {
  const topSource = sourceRows.find((row) => row.referral_code?.trim());
  const topSourceCode = topSource?.referral_code.trim() || "";
  const topCity = cityRows.find((row) => row.city?.trim());
  const topCityName = topCity?.city.trim() || "";
  const topCityConfig = cities.find((city) => city.name === topCityName);

  const gaps: Array<{ title: string; suggestion: string }> = [];
  if (metrics.lostCount > 0 && metrics.leadCount === 0) {
    gaps.push({ title: "当前短板：线索转化不足", suggestion: "已有寻宠发布，但暂未产生线索。建议强化详情页“我有线索”入口、提高扩散文案中的线索提交提醒，并测试微信群传播。" });
  }
  if (metrics.referredLostCount === 0) {
    gaps.push({ title: "当前短板：传播来源不足", suggestion: "已有平台功能，但缺少 ref 来源数据。建议把 /invite 入口发给朋友、宠物群主和本地宠物服务者，测试哪些渠道能带来发布。" });
  }
  if (metrics.inquiryCount === 0) {
    gaps.push({ title: "当前短板：付费服务咨询不足", suggestion: "当前三档寻宠服务包还未产生咨询。建议在寻宠详情页、发布成功页和扩散文案附近强化“需要人工协助整理和扩散”的入口。" });
  }
  if (metrics.foundCount === 0) {
    gaps.push({ title: "当前短板：成功案例不足", suggestion: "成功案例是信任资产。建议核实真实找回结果后及时在后台标记为“已找回”，并完善 /success 成功案例墙。" });
  }

  const nextActions: Array<{ text: string; href?: string }> = [];
  if (!topSourceCode) {
    nextActions.push({ text: "去 /invite 生成一个测试传播链接，并用带有自己代号的发布链接提交一条测试数据。", href: "/invite" });
  }
  if (topSourceCode && metrics.leadCount < metrics.referredLostCount) {
    nextActions.push({ text: "把一条正在寻找的详情页发到本地宠物群，测试“我有线索”提交入口是否足够明显。", href: "/lost" });
  }
  if (topCityName && topCityConfig) {
    nextActions.push({ text: `复制 ${topCityName} 城市页面链接 /city/${topCityConfig.slug}，发到本地宠物群和朋友圈，测试城市频道传播。`, href: `/city/${topCityConfig.slug}` });
  }
  if (metrics.foundCount > 0) {
    nextActions.push({ text: "把 /success 成功案例墙分享到朋友圈、小红书或微信群，作为平台信任证明。", href: "/success" });
  }
  if (metrics.inquiryCount === 0) {
    nextActions.push({ text: "在真实寻宠详情页测试 29 / 199 / 699 服务包文案，观察用户是否愿意咨询人工协助。", href: "/lost" });
  }
  const recommendedActions = nextActions.slice(0, 3);

  return (
    <section style={{ marginTop: 22 }} aria-labelledby="growth-actions-title">
      <div style={{ marginBottom: 12 }}>
        <h2 id="growth-actions-title" style={{ margin: 0, fontSize: 18 }}>增长行动建议</h2>
        <p style={{ margin: "5px 0 0", color: "var(--muted)", fontSize: 12, lineHeight: 1.6 }}>根据当前发布、线索、找回、城市和传播来源数据，给出下一步可执行运营动作。</p>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <article style={cardStyle}>
          <h3 style={headingStyle}><Share2 size={17} /> 最强传播来源</h3>
          {topSource && topSourceCode ? (
            <>
              <strong style={{ color: "var(--teal)", fontSize: 14 }}>当前最强传播来源：{topSourceCode}</strong>
              <div style={dataGridStyle}>
                <span>带来发布数：{Number(topSource.publish_count || 0)}</span>
                <span>带来线索数：{Number(topSource.lead_count || 0)}</span>
                <span>已找回数：{Number(topSource.found_count || 0)}</span>
              </div>
              <p style={suggestionStyle}>建议重点维护这个传播来源。可以邀请其继续分享城市频道、成功案例页和发布寻宠入口。</p>
            </>
          ) : (
            <p style={emptyStyle}>暂无有效传播来源数据。建议先通过 /invite 生成分享链接，发给朋友、宠物群、小红书或本地社群测试传播效果。</p>
          )}
        </article>

        <article style={cardStyle}>
          <h3 style={headingStyle}><MapPin size={17} /> 最活跃城市</h3>
          {topCity && topCityName ? (
            <>
              <strong style={{ color: "var(--coral)", fontSize: 14 }}>当前最活跃城市：{topCityName}</strong>
              <div style={dataGridStyle}>
                <span>发布数：{Number(topCity.publish_count || 0)}</span>
                <span>线索数：{Number(topCity.lead_count || 0)}</span>
                <span>已找回数：{Number(topCity.found_count || 0)}</span>
                <span>寻找中数量：{Number(topCity.searching_count || 0)}</span>
              </div>
              <p style={suggestionStyle}>建议优先完善 {topCityName} 城市页内容，并将{topCityConfig ? ` /city/${topCityConfig.slug}` : "对应城市页面"}分享到本地宠物群、业主群和朋友圈，验证城市传播效果。</p>
              {topCityConfig && <Link href={`/city/${topCityConfig.slug}`} target="_blank" style={linkStyle}>查看城市页面</Link>}
            </>
          ) : (
            <p style={emptyStyle}>暂无城市增长数据。建议先发布带城市字段的寻宠信息，并重点测试深圳、广州、上海等城市频道。</p>
          )}
        </article>

        <article style={cardStyle}>
          <h3 style={headingStyle}><Activity size={17} /> 当前增长短板</h3>
          {gaps.length > 0 ? (
            <div style={{ display: "grid", gap: 10 }}>
              {gaps.map((gap) => <div key={gap.title}><strong style={{ fontSize: 12 }}>{gap.title}</strong><p style={suggestionStyle}>{gap.suggestion}</p></div>)}
            </div>
          ) : (
            <p style={emptyStyle}>当前核心指标均已有数据，建议持续观察来源质量、城市线索量和找回案例变化。</p>
          )}
        </article>

        <article style={cardStyle}>
          <h3 style={headingStyle}><Lightbulb size={17} /> 下一步推荐动作</h3>
          {recommendedActions.length > 0 ? (
            <ol style={{ display: "grid", gap: 9, margin: 0, paddingLeft: 20, color: "#4c5961", fontSize: 12, lineHeight: 1.65 }}>
              {recommendedActions.map((action) => <li key={action.text}>{action.href ? <Link href={action.href} style={linkStyle}>{action.text}</Link> : action.text}</li>)}
            </ol>
          ) : (
            <p style={emptyStyle}>暂无紧急推荐动作，建议继续维护活跃来源并定期复盘城市数据。</p>
          )}
        </article>
      </div>
    </section>
  );
}

const cardStyle: CSSProperties = { padding: 14, background: "#fff", border: "1px solid var(--line)", borderRadius: 7 };
const headingStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 7, margin: "0 0 10px", fontSize: 15 };
const dataGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 7, marginTop: 9, color: "#4c5961", fontSize: 11 };
const suggestionStyle: CSSProperties = { margin: "8px 0 0", color: "#4c5961", fontSize: 12, lineHeight: 1.65 };
const emptyStyle: CSSProperties = { margin: 0, color: "var(--muted)", fontSize: 12, lineHeight: 1.65 };
const linkStyle: CSSProperties = { color: "var(--teal)", fontWeight: 800 };
