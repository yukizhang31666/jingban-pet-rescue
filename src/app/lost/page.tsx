import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarClock, MapPin, Megaphone, Plus, Radio } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { getDb, type LostRow } from "@/lib/db";

export const metadata: Metadata = {
  title: "全国寻宠信息",
  description: "汇总全国宠物主发布的走失信息，爱心人士可按城市查看并提供线索。",
};
export const dynamic = "force-dynamic";

const cityFilters = [
  { name: "全国", slug: "" },
  { name: "北京", slug: "beijing" },
  { name: "上海", slug: "shanghai" },
  { name: "广州", slug: "guangzhou" },
  { name: "深圳", slug: "shenzhen" },
  { name: "杭州", slug: "hangzhou" },
  { name: "成都", slug: "chengdu" },
  { name: "武汉", slug: "wuhan" },
  { name: "南京", slug: "nanjing" },
  { name: "重庆", slug: "chongqing" },
  { name: "西安", slug: "xian" },
  { name: "苏州", slug: "suzhou" },
];

const citySlugMap = Object.fromEntries(cityFilters.filter((city) => city.slug).map((city) => [city.slug, city.name]));

export default async function LostNetworkPage({ searchParams }: { searchParams: Promise<{ city?: string | string[] }> }) {
  const params = await searchParams;
  const citySlug = typeof params.city === "string" ? params.city.toLowerCase() : "";
  const selectedCity = citySlugMap[citySlug];
  const reports = selectedCity
    ? await getDb().prepare(`
        SELECT * FROM lost_reports WHERE status = '寻找中' AND city = ?
        ORDER BY created_at DESC LIMIT 50
      `).all<LostRow>(selectedCity)
    : await getDb().prepare(`
        SELECT * FROM lost_reports WHERE status = '寻找中'
        ORDER BY created_at DESC LIMIT 50
      `).all<LostRow>();

  return (
    <MobileShell>
      <div className="lost-network-page">
        <header className="lost-network-heading">
          <span><Radio size={14} /> 全国宠物公益寻回平台</span>
          <h1>全国寻宠信息</h1>
          <p>汇总全国宠物主发布的走失信息，爱心人士可按城市查看并提供线索。</p>
          <Link className="primary-button" href="/lost/new"><Plus size={18} /> 发布寻宠信息</Link>
        </header>

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
            <div><span>{selectedCity || "全国"}</span><h2>{reports.length} 条寻找中的信息</h2></div>
            <Megaphone size={22} />
          </div>
          {reports.length > 0 ? (
            <div className="lost-network-list">
              {reports.map((report) => (
                <article className="lost-network-card" key={report.public_id}>
                  <Link className="lost-network-photo" href={`/lost/${report.public_id}`} aria-label={`查看${report.pet_name}的寻宠详情`}><Image src={report.photo_url} alt={`${report.pet_name}的寻宠照片`} fill sizes="128px" /></Link>
                  <div className="lost-network-copy">
                    <small className={`urgency-label urgency-${report.urgency}`}>{report.urgency} · {report.status}</small>
                    <strong>{report.pet_name}</strong>
                    <span className="lost-network-region"><MapPin size={14} /> {[report.province, report.city].filter(Boolean).join(" · ") || "地区待补充"}</span>
                    <span><MapPin size={14} /> {report.lost_location}</span>
                    <span><CalendarClock size={14} /> {report.lost_time}</span>
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
      </div>
    </MobileShell>
  );
}
