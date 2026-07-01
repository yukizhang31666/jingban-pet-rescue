import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarClock, CheckCircle2, MapPin, Megaphone, Plus, Radio, Share2 } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { findCity } from "@/lib/cities";
import { getDb, type LostRow } from "@/lib/db";
import { formatDateTime, formatLocation } from "@/lib/format";
import { createBreadcrumbJsonLd, createCollectionPageJsonLd, createFaqJsonLd, serializeJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { CopyLostTextButton } from "@/app/lost/[id]/copy-lost-text-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const city = findCity((await params).city);
  return city
    ? { title: `${city.name}寻宠｜${city.name}宠物走失发布与城市协作 - 鲸伴`, description: `在鲸伴查看${city.name}正在寻找的猫狗和宠物走失信息，发布本城寻宠启事，生成扩散文案，收集线索，参与城市宠物互助协作。` }
    : { title: "城市公益寻宠协作网络｜鲸伴", description: "查看城市寻宠信息、成功找回案例和公益协作入口。" };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const city = findCity((await params).city);
  if (!city) {
    return (
      <MobileShell>
        <div className="lost-network-page">
          <section className="empty-state">
            <Megaphone size={38} />
            <h1>暂未开通该城市频道。</h1>
            <p>你可以先查看全国公开寻宠信息，或返回首页选择其他城市。</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" }}>
              <Link className="primary-button" href="/lost">返回全国寻宠</Link>
              <Link className="secondary-button" href="/">返回首页</Link>
            </div>
          </section>
        </div>
      </MobileShell>
    );
  }

  const [searchingReports, foundReports] = await Promise.all([
    getDb().prepare(`
      SELECT * FROM lost_reports
      WHERE city = ? AND status NOT IN ('found', 'closed')
      ORDER BY created_at DESC LIMIT 6
    `).all<LostRow>(city.name),
    getDb().prepare(`
      SELECT * FROM lost_reports
      WHERE city = ? AND status = 'found'
      ORDER BY created_at DESC LIMIT 3
    `).all<LostRow>(city.name),
  ]);
  const statusLabels: Record<string, string> = { searching: "寻找中", lead: "疑似有线索" };
  const cityName = city.name?.trim() || "本地";
  const cityUrl = `${siteConfig.url}/city/${city.slug}`;
  const pageDescription = `${cityName}宠物走失发布与城市互助页面`;
  const collectionJsonLd = createCollectionPageJsonLd({
    name: `${cityName}寻宠`,
    url: cityUrl,
    description: pageDescription,
  });
  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { name: "首页", url: siteConfig.url },
    { name: "城市寻宠", url: cityUrl },
    { name: `${cityName}寻宠`, url: cityUrl },
  ]);
  const cityFaqs = [
    {
      question: `${cityName}宠物走失后可以在鲸伴做什么？`,
      answer: `你可以在鲸伴发布${cityName}寻宠信息，整理宠物照片、走失地点、走失时间和明显特征，生成适合转发的寻宠页面、扩散文案，并通过线索表单收集可能的目击信息。`,
    },
    {
      question: `在${cityName}发布寻宠信息会公开手机号吗？`,
      answer: "不会直接公开展示手机号。爱心人士通过平台表单提交线索，联系方式和线索会进入后台队列，由平台协助整理和中转。",
    },
    {
      question: "鲸伴能保证找回走失宠物吗？",
      answer: "不能保证找回结果。鲸伴提供信息整理、扩散文案、线索收集和城市互助工具，不提供线下搜寻、抓捕或动物诊疗服务。",
    },
    {
      question: `${cityName}寻宠信息适合分享到哪里？`,
      answer: `适合分享到${cityName}本地宠物群、业主群、朋友圈、小红书和同城互助渠道。分享时建议保留宠物照片、最后出现位置、走失时间、明显特征和寻宠详情页链接。`,
    },
    {
      question: "已经找回宠物后应该怎么处理？",
      answer: "建议及时更新寻宠状态，告知帮助转发和提交线索的朋友，并保留宠物安全档案，方便以后继续使用身份页和应急信息。",
    },
  ];
  const faqJsonLd = createFaqJsonLd(cityFaqs);
  const cityShareTexts = [
    {
      title: "微信群版",
      text: `【${cityName}公益寻宠协作频道】\n这里可以查看${cityName}正在寻找的宠物，也可以发布走失信息、生成扩散文案并收集线索。\n如果你或朋友家宠物走失，可以先收藏：\n${cityUrl}`,
    },
    {
      title: "朋友圈版",
      text: `给${cityName}养宠朋友一个备用入口。\n宠物走失时，可以在鲸伴发布寻宠信息，生成可转发详情页，方便同城朋友帮忙留意和提交线索。\n${cityUrl}`,
    },
    {
      title: "小红书版",
      text: `${cityName}宠物走失互助入口｜建议养宠人收藏\n\n如果你在${cityName}养宠，可以收藏这个公益寻宠协作频道。\n宠物走失时，可以发布寻宠信息、生成扩散文案，并通过详情页收集线索。\n也欢迎同城爱心人士帮忙留意正在寻找的宠物。\n入口：${cityUrl}`,
    },
  ];

  return (
    <MobileShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }} />
      <div className="lost-network-page">
        <header className="lost-network-heading">
          <span><Radio size={14} /> 全国城市寻宠协作网络</span>
          <h1>{city.name}公益寻宠协作网络</h1>
          <p>查看{city.name}正在寻找的宠物、成功找回案例，并生成适合本城传播的寻宠信息。</p>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 8 }}>
            <Link className="primary-button" href={`/lost/new?city=${city.slug}`}><Plus size={18} /> 发布{city.name}寻宠信息</Link>
            <Link className="secondary-button" href="/lost">查看全国寻宠</Link>
          </div>
        </header>

        <section className="lost-network-section" style={{ paddingBottom: 0 }} aria-labelledby="city-seo-intro">
          <h2 id="city-seo-intro" style={{ margin: "0 0 8px", fontSize: 18 }}>{cityName}寻宠与宠物走失互助</h2>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 12, lineHeight: 1.7 }}>如果你在{cityName}遇到猫走失、狗走失或其他宠物走失，可以在鲸伴发布寻宠信息，生成适合微信群、朋友圈和小红书的扩散文案，并通过线索表单收集可能的目击信息。</p>
        </section>

        <section className="lost-network-section" style={{ paddingBottom: 0 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>{cityName}宠物走失后可以怎么做？</h2>
          <p style={{ margin: "0 0 13px", color: "var(--muted)", fontSize: 12, lineHeight: 1.7 }}>如果宠物在{cityName}走失，建议先确认最后出现地点、走失时间、宠物明显特征和可联系线索，再通过鲸伴发布寻宠信息，生成适合微信群、朋友圈和小红书的扩散文案，并持续收集可能的目击线索。</p>
          <Link className="primary-button" style={{ width: "100%" }} href="/lost/new">发布{cityName}寻宠信息</Link>
        </section>

        <section className="lost-network-section" style={{ paddingBottom: 0 }}>
          <article style={{ padding: 14, background: "#eaf6f3", border: "1px solid #c9e5df", borderLeft: "4px solid var(--teal)", borderRadius: 7 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>{cityName}寻宠记录与城市报告</h2>
            <p style={{ margin: "0 0 13px", color: "#46535c", fontSize: 12, lineHeight: 1.7 }}>查看鲸伴平台当前沉淀的{cityName}寻宠记录、正在寻找和已找回案例，了解本城宠物走失信息与城市互助情况。</p>
            <Link className="secondary-button" style={{ width: "100%" }} href={`/city/${city.slug}/report`}>查看{cityName}寻宠报告</Link>
          </article>
        </section>

        <section className="lost-network-section">
          <div className="section-heading compact">
            <div><span>{city.province || "城市频道"}</span><h2>本城正在寻找 · {searchingReports.length} 条</h2></div>
            <Megaphone size={22} />
          </div>
          {searchingReports.length > 0 ? (
            <div className="lost-network-list">
              {searchingReports.map((report) => (
                <article className="lost-network-card" key={report.public_id}>
                  <Link className="lost-network-photo" href={`/lost/${report.public_id}`} aria-label={`查看${report.pet_name}的寻宠详情`}>
                    <Image src={report.photo_url} alt={`${report.pet_name}的寻宠照片`} fill sizes="128px" />
                  </Link>
                  <div className="lost-network-copy">
                    <small className="urgency-label">{statusLabels[report.status] || "寻找中"}</small>
                    <strong>{report.pet_name?.trim() || "宠物"}</strong>
                    <span><MapPin size={14} /> {formatLocation({ lost_location: report.lost_location })}</span>
                    <span><CalendarClock size={14} /> {formatDateTime(report.lost_time)}</span>
                    <p>{report.features?.trim() || "暂未填写"}</p>
                    <Link className="lost-network-detail-button" href={`/lost/${report.public_id}`}>查看详情</Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="marketplace-empty">
              <Megaphone size={36} />
              <h2>当前城市暂无公开寻宠信息</h2>
              <p>你可以发布第一条本城寻宠，或把本页面分享给同城宠物群。</p>
              <Link className="primary-button" style={{ marginTop: 18 }} href={`/lost/new?city=${city.slug}`}>发布本城寻宠</Link>
            </div>
          )}
        </section>

        <section className="lost-network-section" style={{ paddingTop: 0 }}>
          <div className="section-heading compact">
            <div><span>重逢案例</span><h2>本城成功找回 · {foundReports.length} 条</h2></div>
            <CheckCircle2 size={22} />
          </div>
          {foundReports.length > 0 ? (
            <div style={{ display: "grid", gap: 10 }}>
              {foundReports.map((report) => (
                <article style={{ padding: 14, background: "#fff", border: "1px solid var(--line)", borderLeft: "4px solid var(--teal)", borderRadius: 7 }} key={report.public_id}>
                  <small style={{ color: "var(--teal)", fontWeight: 800 }}>已找回</small>
                  <h3 style={{ margin: "7px 0", fontSize: 17 }}>{report.pet_name?.trim() || "宠物"}</h3>
                  <p style={{ margin: "0 0 5px", color: "var(--muted)", fontSize: 11 }}>走失地点：{formatLocation({ lost_location: report.lost_location })}</p>
                  <p style={{ margin: "0 0 11px", color: "var(--muted)", fontSize: 11 }}>走失时间：{formatDateTime(report.lost_time)}</p>
                  <Link className="secondary-button" style={{ minHeight: 36, width: "fit-content", padding: "0 12px", fontSize: 11 }} href={`/lost/${report.public_id}`}>查看详情</Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="marketplace-empty">
              <CheckCircle2 size={34} />
              <h2>当前城市暂无成功找回案例</h2>
              <p>等后台将寻宠信息标记为“已找回”后，这里会自动展示。</p>
            </div>
          )}
        </section>

        <section className="public-network-entry">
          <span><Share2 size={14} /> 同城互助传播</span>
          <h2>加入{city.name}寻宠传播</h2>
          <p>把本城寻宠频道分享给同城宠物群、业主群和养宠朋友。朋友通过你的链接发布寻宠信息后，平台可以记录传播来源，帮助统计公益传播贡献。</p>
          <div><Link className="primary-button" style={{ gridColumn: "1 / -1" }} href="/invite">生成我的城市分享链接</Link></div>
        </section>

        <section className="lost-network-section" style={{ paddingTop: 0 }}>
          <div className="section-heading compact">
            <div>
              <span>同城分享</span>
              <h2>分享{cityName}寻宠频道</h2>
            </div>
            <Share2 size={22} />
          </div>
          <p style={{ margin: "0 0 14px", color: "var(--muted)", fontSize: 12, lineHeight: 1.65 }}>
            适合转发到本地宠物群、业主群、朋友圈，让更多同城爱心人士知道这个频道。
          </p>
          <div style={{ display: "grid", gap: 10 }}>
            {cityShareTexts.map((template) => (
              <article
                key={template.title}
                style={{ padding: 14, background: "#fff", border: "1px solid var(--line)", borderRadius: 7 }}
              >
                <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>{template.title}</h3>
                <p style={{ margin: 0, color: "var(--muted)", fontSize: 11, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                  {template.text}
                </p>
                <CopyLostTextButton text={template.text} label="复制该版本" successMessage="已复制，可粘贴发布。" />
              </article>
            ))}
          </div>
        </section>

        <section className="lost-network-section" style={{ paddingTop: 0 }} aria-labelledby="city-faq-title">
          <div className="section-heading compact">
            <div>
              <span>常见问题</span>
              <h2 id="city-faq-title">{cityName}寻宠 FAQ</h2>
            </div>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {cityFaqs.map((faq) => (
              <article key={faq.question} style={{ padding: 14, background: "#fff", border: "1px solid var(--line)", borderRadius: 7 }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>{faq.question}</h3>
                <p style={{ margin: 0, color: "var(--muted)", fontSize: 12, lineHeight: 1.7 }}>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <aside style={{ margin: 14, padding: 14, color: "#665711", background: "#fff7d6", borderLeft: "3px solid var(--yellow)", fontSize: 11, lineHeight: 1.65 }}>
          鲸伴提供信息整理、扩散文案、线索收集和后台中转工具，不对找回结果作出承诺，不提供线下搜寻、上门抓捕或动物诊疗服务。
        </aside>
      </div>
    </MobileShell>
  );
}
