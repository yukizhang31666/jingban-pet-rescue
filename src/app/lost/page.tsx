import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarClock, MapPin, Megaphone, Plus, Radio } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { cities } from "@/lib/cities";
import { getDb, type LostRow } from "@/lib/db";
import { formatDateTime, formatLocation } from "@/lib/format";
import { createBreadcrumbJsonLd, createCollectionPageJsonLd, createFaqJsonLd, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "全国寻宠信息｜宠物走失发布与扩散 - 鲸伴",
  description: "在鲸伴查看全国正在寻找的猫狗和宠物走失信息，也可以免费发布寻宠启事，生成扩散文案并收集线索。",
};
export const dynamic = "force-dynamic";

const cityFilters = [
  { name: "全国", slug: "" },
  ...cities,
];

const citySlugMap = Object.fromEntries(cityFilters.filter((city) => city.slug).map((city) => [city.slug, city.name]));
const reportStatusLabels: Record<string, string> = {
  searching: "寻找中",
  lead: "疑似有线索",
  found: "已找回",
  closed: "已关闭",
};
const lostPageFaqs = [
  {
    question: "在鲸伴发布寻宠信息适合什么情况？",
    answer: "适合猫、狗或其他宠物走失后，需要把照片、走失时间、地点、特征和补充说明整理成一页寻宠信息，并生成便于转发的扩散文案、持续收集线索的情况。",
  },
  {
    question: "发布寻宠信息会公开手机号或微信吗？",
    answer: "不会直接在公开页面展示手机号或微信。爱心人士提交线索时会通过平台表单中转，方便宠物主集中查看和判断，减少联系方式被直接暴露的风险。",
  },
  {
    question: "鲸伴能保证找回走失宠物吗？",
    answer: "不能保证找回。鲸伴主要帮助宠物主整理关键信息、生成扩散文案、汇总线索，并连接城市宠物互助协作；实际寻找仍需要结合线下排查、监控询问和周边沟通。",
  },
  {
    question: "寻宠信息适合分享到哪些地方？",
    answer: "可以分享给小区业主群、社区群、附近商户、宠物社群、朋友圈和城市互助渠道。分享时建议保持同一个寻宠页面作为线索入口，避免信息分散。",
  },
  {
    question: "宠物找回后应该怎么处理？",
    answer: "建议及时更新寻宠状态或关闭寻宠信息，并感谢提供线索的人。如果宠物受伤或状态异常，应尽快联系专业兽医检查。",
  },
];
const collectionPageJsonLd = createCollectionPageJsonLd({
  name: "全国宠物走失寻宠信息",
  url: "https://jingbantech.com/lost",
  description: "查看全国宠物走失信息，发布寻宠启事，生成扩散文案，收集线索，参与城市宠物互助协作。",
});
const breadcrumbJsonLd = createBreadcrumbJsonLd([
  { name: "首页", url: "https://jingbantech.com" },
  { name: "全国寻宠", url: "https://jingbantech.com/lost" },
]);
const faqJsonLd = createFaqJsonLd(lostPageFaqs);

export default async function LostNetworkPage({ searchParams }: { searchParams: Promise<{ city?: string | string[] }> }) {
  const params = await searchParams;
  const citySlug = typeof params.city === "string" ? params.city.toLowerCase() : "";
  const selectedCity = citySlugMap[citySlug];
  const reports = selectedCity
    ? await getDb().prepare(`
        SELECT * FROM lost_reports WHERE city = ?
        ORDER BY created_at DESC LIMIT 50
      `).all<LostRow>(selectedCity)
    : await getDb().prepare(`
        SELECT * FROM lost_reports
        ORDER BY created_at DESC LIMIT 50
      `).all<LostRow>();

  return (
    <MobileShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }} />
      <div className="lost-network-page">
        <header className="lost-network-heading">
          <span><Radio size={14} /> 全国宠物公益寻回平台</span>
          <h1>全国寻宠信息</h1>
          <p>汇总全国宠物主发布的走失信息，爱心人士可按城市查看并提供线索。</p>
          <Link className="primary-button" href="/lost/new"><Plus size={18} /> 发布寻宠信息</Link>
        </header>

        <section style={{ padding: "14px 14px 4px", background: "#fff" }}>
          <strong style={{ display: "block", marginBottom: 9, fontSize: 12 }}>进入城市频道</strong>
          <nav style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 10 }} aria-label="城市寻宠频道">
            {cities.map((city) => <Link className="lost-city-filter" href={`/city/${city.slug}`} key={city.slug}>{city.name}</Link>)}
          </nav>
        </section>

        <nav className="lost-city-filters" aria-label="按城市筛选寻宠信息">
          {cityFilters.map((city) => (
            <Link
              className={`lost-city-filter ${(!selectedCity && !city.slug) || selectedCity === city.name ? "active" : ""}`}
              href={city.slug ? `/lost?city=${city.slug}` : "/lost"}
              key={city.name}
            >
              {city.name}
            </Link>
          ))}
        </nav>

        <section className="lost-network-section">
          <div className="section-heading compact">
            <div><span>{selectedCity || "全国"}</span><h2>{reports.length} 条寻宠信息</h2></div>
            <Megaphone size={22} />
          </div>
          {reports.length > 0 ? (
            <div className="lost-network-list">
              {reports.map((report) => (
                <article className="lost-network-card" key={report.public_id}>
                  <Link className="lost-network-photo" href={`/lost/${report.public_id}`} aria-label={`查看${report.pet_name}的寻宠详情`}><Image src={report.photo_url} alt={`${report.pet_name}的寻宠照片`} fill sizes="128px" /></Link>
                  <div className="lost-network-copy">
                    <small className={`urgency-label urgency-${report.urgency}`}>{report.urgency} · {reportStatusLabels[report.status] || "寻找中"}</small>
                    <strong>{report.pet_name}</strong>
                    <span className="lost-network-region"><MapPin size={14} /> {formatLocation(report)}</span>
                    <span><MapPin size={14} /> {formatLocation({ lost_location: report.lost_location })}</span>
                    <span><CalendarClock size={14} /> {formatDateTime(report.lost_time)}</span>
                    <p>{report.features}</p>
                    <Link className="lost-network-detail-button" href={`/lost/${report.public_id}`}>查看详情</Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="marketplace-empty">
              <Megaphone size={36} />
              <h2>{selectedCity ? `${selectedCity}当前还没有寻宠信息` : "当前还没有寻宠信息"}</h2>
              <p>如果你的宠物走失了，可以发布第一条寻宠信息；如果你是爱心人士，也可以分享本页面，帮助更多宠物主找到这里。</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 18 }}>
                <Link className="primary-button" href="/lost/new">发布寻宠信息</Link>
                <Link className="secondary-button" href="/lost">返回全国寻宠</Link>
              </div>
            </div>
          )}
        </section>

        <section className="lost-network-section" aria-labelledby="lost-faq-title">
          <div className="section-heading compact">
            <div><span>常见问题</span><h2 id="lost-faq-title">寻宠信息发布 FAQ</h2></div>
            <Megaphone size={22} />
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {lostPageFaqs.map((faq) => (
              <article className="lost-network-card" style={{ display: "block", padding: 14 }} key={faq.question}>
                <h3 style={{ margin: "0 0 7px", fontSize: 15 }}>{faq.question}</h3>
                <p style={{ margin: 0, color: "var(--muted)", fontSize: 12, lineHeight: 1.7 }}>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </MobileShell>
  );
}
