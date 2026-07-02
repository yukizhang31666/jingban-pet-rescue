import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowRight, BadgeCheck, BookHeart, CalendarClock, CheckCircle2, HeartHandshake, MapPin, Megaphone, QrCode, Radio, ScanLine, Search, ShieldCheck, Sparkles, Store } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { cities } from "@/lib/cities";
import { getDb, type LostRow } from "@/lib/db";
import { formatDateTime, formatLocation } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

const services = [
  {
    href: "/pet-id/new",
    icon: BadgeCheck,
    eyebrow: "永久免费",
    title: "免费生成宠物安全护照",
    description: "唯一编号、专属主页和二维码一次生成",
    tone: "teal",
  },
  {
    href: "/lost/new",
    icon: Search,
    eyebrow: "快速扩散",
    title: "发布寻宠启事",
    description: "一键生成海报和多平台寻宠文案",
    tone: "coral",
  },
  {
    href: "/quiz",
    icon: Sparkles,
    eyebrow: "趣味测试",
    title: "测测宠物隐藏身份",
    description: "解锁人格、宇宙职业和稀有度报告",
    tone: "violet",
  },
];

const heroBenefits = ["免费建档", "专属二维码", "联系方式默认不公开", "走失后可快速扩散"];
const petIdPreviewItems = ["基础档案", "防丢信息", "线索中转"];

export default async function Home() {
  const [latestReports, recentFoundReports] = await Promise.all([
    getDb().prepare(`
      SELECT * FROM lost_reports
      WHERE COALESCE(status, 'searching') NOT IN ('found', 'closed')
      ORDER BY created_at DESC LIMIT 3
    `).all<LostRow>(),
    getDb().prepare(`
      SELECT * FROM lost_reports
      WHERE status = 'found'
      ORDER BY created_at DESC LIMIT 3
    `).all<LostRow>(),
  ]);
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: `${siteConfig.url}/`,
    description: "宠物安全护照与城市寻宠协作平台",
  };

  return (
    <MobileShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData).replace(/</g, "\\u003c") }} />
      <section className="home-hero">
        <Image
          src="/hero-pets.png"
          alt="佩戴宠物安全护照身份牌的金毛犬和黑白猫"
          fill
          priority
          sizes="(max-width: 560px) 100vw, 520px"
        />
        <div className="hero-copy" style={{ width: "min(86%, 430px)" }}>
          <span className="hero-kicker"><ShieldCheck size={15} /> 宠物安全护照 · 一键寻宠 · 城市协作</span>
          <h1 style={{ maxWidth: 400 }}>免费生成宠物身份证，走失时一键寻宠</h1>
          <p>给猫狗建立一张可扫码的数字身份卡。宠物走失时，发现者打开二维码页面，就能查看基础信息，并通过平台线索表单联系主人。</p>
          <div className="hero-actions">
            <Link className="hero-button" href="/pet-id/new">免费办理宠物身份证 <ArrowRight size={18} /></Link>
            <Link className="hero-secondary-button" href="/lost/new"><Search size={17} /> 发布寻宠信息</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 7, marginTop: 12, maxWidth: 360 }}>
            {heroBenefits.map((benefit) => (
              <span key={benefit} style={{ display: "inline-flex", alignItems: "center", gap: 5, minHeight: 28, color: "#315f5b", background: "rgba(255, 255, 255, 0.82)", border: "1px solid rgba(23, 33, 43, 0.1)", borderRadius: 7, padding: "0 8px", fontSize: 11, fontWeight: 800 }}>
                <CheckCircle2 size={13} />
                {benefit}
              </span>
            ))}
          </div>
          <Link href="/lost" style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, color: "var(--teal-dark)", fontSize: 12, fontWeight: 800 }}>
            查看正在寻找的宠物 <ArrowRight size={14} />
          </Link>
          <div style={{ width: "min(100%, 340px)", marginTop: 14, padding: 14, color: "#1f2b32", background: "rgba(255, 255, 255, 0.93)", border: "1px solid rgba(23, 33, 43, 0.12)", borderRadius: 8, boxShadow: "0 12px 30px rgba(23, 33, 43, 0.12)" }} aria-label="宠物身份证预览卡">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
              <div>
                <span style={{ color: "var(--teal)", fontSize: 10, fontWeight: 850 }}>宠物身份证预览</span>
                <strong style={{ display: "block", marginTop: 4, fontSize: 18 }}>宠物名：小鲸</strong>
                <span style={{ display: "block", marginTop: 5, color: "#5b6870", fontSize: 11 }}>Pet ID：JB-2026-XXXX</span>
                <span style={{ display: "inline-flex", marginTop: 8, padding: "4px 7px", color: "var(--teal-dark)", background: "#eaf6f3", borderRadius: 6, fontSize: 10, fontWeight: 850 }}>已生成数字身份</span>
              </div>
              <div style={{ width: 74, height: 74, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, flex: "0 0 auto", padding: 7, background: "#f7faf9", border: "1px solid var(--line)", borderRadius: 7 }} aria-hidden="true">
                {Array.from({ length: 16 }).map((_, index) => (
                  <span key={index} style={{ background: index % 3 === 0 || index === 5 || index === 10 ? "#174f4c" : "#dfe9e6", borderRadius: 2 }} />
                ))}
              </div>
            </div>
            <p style={{ margin: "10px 0 0", color: "#46535c", fontSize: 11, lineHeight: 1.55 }}>扫码查看宠物身份卡</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 10 }}>
              {petIdPreviewItems.map((item) => (
                <span key={item} style={{ minHeight: 26, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#46535c", background: "#f7faf9", border: "1px solid var(--line)", borderRadius: 6, fontSize: 10, fontWeight: 800 }}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ margin: 0, padding: "13px 20px", color: "#46535c", background: "#f7faf9", borderBottom: "1px solid var(--line)", fontSize: 11, lineHeight: 1.7 }} aria-label="鲸伴平台介绍">
        <p style={{ margin: "0 0 5px" }}>鲸伴科技是面向全国的宠物互助平台，围绕宠物走失、寻宠互助和城市宠物公益，为宠物主提供安全档案、信息扩散与线索收集工具。</p>
        <p style={{ margin: "0 0 5px" }}>平台同时连接深圳宠物服务及其他城市的本地资源，让宠物训练、宠物摄影、宠物寄养等可信赖服务更容易被看见。</p>
        <p style={{ margin: 0 }}>鲸伴正在建设全国城市寻宠网络。宠物安全护照不是法定证件，平台不对找回结果作出承诺，也不提供动物诊疗或线下搜寻，仅提供信息整理、传播协作和线索收集工具。</p>
      </section>

      <section className="home-trust-points" aria-label="服务保障">
        <div><CheckCircle2 size={19} /><span>永久免费基础建档</span></div>
        <div><QrCode size={19} /><span>每只宠物唯一身份编号</span></div>
        <div><Search size={19} /><span>支持寻宠启事一键生成</span></div>
      </section>

      <section className="home-section" aria-labelledby="city-entry-title">
        <div className="section-heading">
          <div>
            <span>全国城市协作</span>
            <h2 id="city-entry-title">全国城市寻宠网络</h2>
          </div>
        </div>
        <p style={{ margin: "-8px 0 18px", color: "var(--muted)", fontSize: 12, lineHeight: 1.65 }}>
          选择你的城市，查看本城正在寻找的宠物和成功找回案例。
        </p>
        <nav aria-label="选择城市" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {cities.map((city) => (
            <Link
              className="secondary-button"
              href={`/city/${city.slug}`}
              key={city.name}
              style={{ minHeight: 42, padding: "0 8px", fontSize: 13 }}
            >
              {city.name}
            </Link>
          ))}
        </nav>
        <Link className="secondary-button" href="/city" style={{ width: "100%", marginTop: 12 }}>查看全部城市寻宠入口</Link>
      </section>

      <section className="home-section" aria-labelledby="latest-lost-title">
        <div className="section-heading">
          <div>
            <span>全国公益寻宠</span>
            <h2 id="latest-lost-title">最新正在寻找</h2>
          </div>
        </div>
        <p style={{ margin: "-8px 0 18px", color: "var(--muted)", fontSize: 12, lineHeight: 1.65 }}>
          这里汇总全国宠物主最新发布的走失信息，爱心人士可以点击查看详情并帮助扩散。
        </p>
        {latestReports.length > 0 ? (
          <>
            <div className="lost-network-list">
              {latestReports.map((report) => (
                <article className="lost-network-card" key={report.public_id}>
                  {report.photo_url ? (
                    <Link className="lost-network-photo" href={`/lost/${report.public_id}`} aria-label={`查看${report.pet_name}的寻宠详情`}>
                      <Image src={report.photo_url} alt={`${report.pet_name}的寻宠照片`} fill sizes="128px" />
                    </Link>
                  ) : (
                    <span className="lost-network-photo" style={{ display: "grid", placeItems: "center", color: "var(--muted)", fontSize: 11 }}>暂无照片</span>
                  )}
                  <div className="lost-network-copy">
                    <strong>{report.pet_name?.trim() || "宠物"}</strong>
                    <span className="lost-network-region"><MapPin size={14} /> {formatLocation(report)}</span>
                    <span><MapPin size={14} /> {formatLocation({ lost_location: report.lost_location })}</span>
                    <span><CalendarClock size={14} /> {formatDateTime(report.lost_time)}</span>
                    <Link className="lost-network-detail-button" href={`/lost/${report.public_id}`}>查看详情</Link>
                  </div>
                </article>
              ))}
            </div>
            <Link className="secondary-button" style={{ width: "100%", marginTop: 12 }} href="/lost">查看全部寻宠信息</Link>
          </>
        ) : (
          <div className="marketplace-empty">
            <Search size={36} />
            <h2>当前还没有正在寻找的宠物信息。</h2>
            <Link className="primary-button" style={{ marginTop: 18 }} href="/lost/new">发布寻宠信息</Link>
          </div>
        )}
      </section>

      <section className="home-section" aria-labelledby="recent-success-title" style={{ paddingTop: 0 }}>
        <div className="section-heading">
          <div>
            <span>重逢案例</span>
            <h2 id="recent-success-title">最近成功找回</h2>
          </div>
          <CheckCircle2 size={24} />
        </div>
        <p style={{ margin: "-8px 0 18px", color: "var(--muted)", fontSize: 12, lineHeight: 1.65 }}>
          已找回案例会展示在这里，帮助更多宠物主看到城市协作和线索收集的价值。
        </p>
        {recentFoundReports.length > 0 ? (
          <>
            <div className="service-list">
              {recentFoundReports.map((report) => (
                <Link className="service-item teal" href={`/lost/${report.public_id}`} key={report.public_id}>
                  <span className="service-icon"><CheckCircle2 size={24} /></span>
                  <span className="service-copy">
                    <small>已找回 · {formatLocation(report)}</small>
                    <strong>{report.pet_name?.trim() || "宠物"}</strong>
                    <span>走失地点：{formatLocation({ lost_location: report.lost_location })}，现已与主人重逢。</span>
                  </span>
                  <ArrowRight className="service-arrow" size={20} />
                </Link>
              ))}
            </div>
            <Link className="secondary-button" style={{ width: "100%", marginTop: 12 }} href="/success">查看全部成功案例</Link>
          </>
        ) : (
          <div className="marketplace-empty">
            <CheckCircle2 size={34} />
            <p>暂无成功案例。后台将寻宠信息标记为“已找回”后，这里会自动展示。</p>
            <Link className="secondary-button" style={{ marginTop: 16 }} href="/success">查看全部成功案例</Link>
          </div>
        )}
      </section>

      <section className="home-section" aria-labelledby="content-growth-title" style={{ paddingTop: 0 }}>
        <div className="section-heading">
          <div><span>应急指南 · 通用模板</span><h2 id="content-growth-title">寻宠知识与文案模板</h2></div>
          <BookHeart size={24} />
        </div>
        <p style={{ margin: "-8px 0 14px", color: "var(--muted)", fontSize: 12, lineHeight: 1.65 }}>宠物走失时，先冷静处理。鲸伴整理了找猫、找狗、寻宠启事和扩散文案模板，帮助宠物主快速完成信息整理和传播。</p>
        <div style={{ display: "grid", gap: 8 }}>
          {[
            ["猫丢了怎么办", "/guide/cat-lost"],
            ["狗丢了怎么办", "/guide/dog-lost"],
            ["寻宠启事怎么写", "/guide/pet-lost"],
            ["寻宠文案模板", "/templates"],
            ["成功找回案例", "/cases"],
          ].map(([label, href]) => <Link className="secondary-button" href={href} key={href} style={{ justifyContent: "space-between" }}>{label}<ArrowRight size={16} /></Link>)}
        </div>
      </section>

      <section className="home-section" aria-labelledby="popular-search-title" style={{ paddingTop: 0 }}>
        <div className="section-heading">
          <div><span>常见问题 · 搜索入口</span><h2 id="popular-search-title">热门寻宠问题</h2></div>
          <Search size={24} />
        </div>
        <p style={{ margin: "-8px 0 14px", color: "var(--muted)", fontSize: 12, lineHeight: 1.65 }}>宠物走失时，很多人会先搜索“猫丢了怎么办”“狗丢了怎么办”“附近猫丢了怎么找”。鲸伴整理了常见问题入口，帮助宠物主快速找到对应指南和发布入口。</p>
        <div style={{ display: "grid", gap: 8 }}>
          {[
            ["附近猫丢了怎么找", "/search-intent/cat-lost-nearby"],
            ["附近狗丢了怎么找", "/search-intent/dog-lost-nearby"],
            ["宠物走失信息怎么发", "/search-intent/pet-lost-post"],
            ["寻宠启事怎么写", "/search-intent/lost-pet-notice"],
            ["更多寻宠问题", "/search-intent"],
          ].map(([label, href]) => <Link className="secondary-button" href={href} key={href} style={{ justifyContent: "space-between" }}>{label}<ArrowRight size={16} /></Link>)}
        </div>
      </section>

      <section className="home-section" aria-labelledby="spread-service-title" style={{ paddingTop: 0 }}>
        <div className="section-heading">
          <div>
            <span>按紧急程度选择</span>
            <h2 id="spread-service-title">寻宠扩散协助服务</h2>
          </div>
          <Megaphone size={24} />
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {[
            { name: "29元基础扩散包", price: "29元 / 次", description: "快速整理信息、生成基础海报和多平台扩散文案。", color: "var(--teal)" },
            { name: "199元安心扩散包", price: "199元 / 次", description: "进一步优化海报、传播文案和线索整理提醒。", color: "var(--coral)", badge: "推荐" },
            { name: "699元城市协助包", price: "699元 / 3天", description: "提供持续信息跟进和一对一人工沟通协助。", color: "var(--violet)", badge: "人工协助" },
          ].map((item) => (
            <article key={item.name} style={{ padding: 14, background: "#fff", border: "1px solid var(--line)", borderLeft: `4px solid ${item.color}`, borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <strong style={{ fontSize: 14 }}>{item.name}</strong>
                {item.badge && <small style={{ color: item.color, fontWeight: 800 }}>{item.badge}</small>}
              </div>
              <strong style={{ display: "block", margin: "7px 0", color: item.color, fontSize: 17 }}>{item.price}</strong>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: 11, lineHeight: 1.6 }}>{item.description}</p>
            </article>
          ))}
        </div>
        <p style={{ margin: "12px 0", color: "#665711", background: "#fff7d6", padding: 11, fontSize: 11, lineHeight: 1.65 }}>
          服务仅包含信息整理、扩散素材、线索中转和人工协助。平台不对找回结果作出承诺，不提供线下搜寻或动物诊疗。
        </p>
        <Link className="primary-button" style={{ width: "100%" }} href="/lost/new">先发布寻宠信息</Link>
      </section>

      <section className="home-section" aria-label="平台信任与使用说明" style={{ display: "grid", gap: 12, paddingTop: 0 }}>
        <article style={{ padding: 17, background: "#fff", border: "1px solid var(--line)", borderLeft: "4px solid var(--teal)", borderRadius: 8 }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: 7, margin: "0 0 12px", fontSize: 19 }}><ShieldCheck size={20} /> 平台如何保护隐私</h2>
          <ul style={{ display: "grid", gap: 7, margin: 0, paddingLeft: 20, color: "#4c5961", fontSize: 12, lineHeight: 1.6 }}>
            <li>联系方式不会直接公开展示</li>
            <li>爱心人士通过线索系统提交信息</li>
            <li>宠物主可通过详情页相关流程查看线索，平台后台协助整理</li>
            <li>用户可以复制微信、小红书、朋友圈文案主动扩散</li>
            <li>平台不承诺找回结果，只提供公益协作和信息扩散工具</li>
          </ul>
        </article>

        <article style={{ padding: 17, background: "#fff", border: "1px solid var(--line)", borderLeft: "4px solid var(--coral)", borderRadius: 8 }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: 7, margin: "0 0 12px", fontSize: 19 }}><Search size={20} /> 寻宠协作流程</h2>
          <ol style={{ display: "grid", gap: 7, margin: 0, paddingLeft: 22, color: "#4c5961", fontSize: 12, lineHeight: 1.6 }}>
            <li>发布寻宠信息</li>
            <li>生成公益寻宠详情页</li>
            <li>复制微信群 / 小红书 / 朋友圈文案扩散</li>
            <li>爱心人士提交线索</li>
            <li>平台后台协助整理和跟进</li>
          </ol>
        </article>

      </section>

      <section className="home-section" style={{ paddingTop: 0 }} aria-labelledby="invite-entry-title">
        <article style={{ padding: 17, background: "#eaf6f3", border: "1px solid #c9e5df", borderLeft: "4px solid var(--teal)", borderRadius: 8 }}>
          <h2 id="invite-entry-title" style={{ display: "flex", alignItems: "center", gap: 7, margin: "0 0 8px", fontSize: 19 }}><HeartHandshake size={20} /> 成为鲸伴寻宠传播员</h2>
          <p style={{ margin: "0 0 14px", color: "#46535c", fontSize: 12, lineHeight: 1.65 }}>生成你的专属分享链接，把鲸伴分享给同城宠物群和朋友。朋友通过你的链接发布寻宠信息后，平台会记录公益传播来源。</p>
          <Link className="primary-button" style={{ width: "100%" }} href="/invite">生成我的分享链接</Link>
          <p style={{ margin: "12px 0 8px", color: "#46535c", fontSize: 12, lineHeight: 1.65 }}>用一次转发、一条线索，帮助更多走失宠物被看见。</p>
          <Link className="secondary-button" style={{ width: "100%" }} href="/volunteer">加入城市互助志愿者</Link>
        </article>
      </section>

      <section className="home-section" style={{ paddingTop: 0 }} aria-labelledby="audience-title">
        <article style={{ padding: 17, background: "#fff", border: "1px solid var(--line)", borderLeft: "4px solid var(--yellow)", borderRadius: 8 }}>
          <h2 id="audience-title" style={{ display: "flex", alignItems: "center", gap: 7, margin: "0 0 12px", fontSize: 19 }}><HeartHandshake size={20} /> 适合谁使用</h2>
          <ul style={{ display: "grid", gap: 7, margin: 0, paddingLeft: 20, color: "#4c5961", fontSize: 12, lineHeight: 1.6 }}>
            <li>正在寻找走失宠物的主人</li>
            <li>愿意帮忙留意的爱心人士</li>
            <li>同城宠物群管理员</li>
            <li>流浪动物救助者</li>
            <li>宠物摄影、寄养、训练等本地服务者</li>
          </ul>
        </article>
      </section>

      <section className="public-network-entry">
        <span><Radio size={14} /> 全国宠物公益寻回平台</span>
        <h2>每一次转发，<br />都可能离回家更近一步</h2>
        <p>查看正在扩散的寻宠信息，匿名提交线索，帮助附近的宠物回家。</p>
        <div><Link className="primary-button" href="/lost">查看正在寻找</Link><Link className="secondary-button" href="/lost/new">发布寻宠</Link></div>
      </section>

      <section className="home-section service-section">
        <div className="section-heading">
          <div>
            <span>今天想做什么？</span>
            <h2>给毛孩子多一份安心</h2>
          </div>
          <PawBadge />
        </div>
        <div className="service-list">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link className={`service-item ${service.tone}`} href={service.href} key={service.href}>
                <span className="service-icon"><Icon size={25} /></span>
                <span className="service-copy">
                  <small>{service.eyebrow}</small>
                  <strong>{service.title}</strong>
                  <span>{service.description}</span>
                </span>
                <ArrowRight className="service-arrow" size={20} />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="why-now">
        <span className="why-eyebrow">为什么现在就要办理？</span>
        <h2>多一份身份信息，<br />关键时刻少一点慌乱</h2>
        <div className="why-list">
          <div><AlertTriangle size={22} /><p>宠物走失时，朋友圈信息容易被刷走</p></div>
          <div><ScanLine size={22} /><p>有身份二维码，发现者可以第一时间联系主人</p></div>
          <div><BookHeart size={22} /><p>平时可以作为宠物成长档案和分享主页</p></div>
        </div>
      </section>

      <section className="home-section home-cta">
        <span>从今天开始记录</span>
        <h2>它不会说话，<br />但身份可以替它开口</h2>
        <Link href="/pet-id/new" className="primary-button">立即免费建档 <ArrowRight size={19} /></Link>
      </section>

      <div className="merchant-entry-grid">
        <Link className="merchant-entry" href="/services">
          <span className="merchant-entry-icon"><HeartHandshake size={24} /></span>
          <span><strong>本地宠物服务网络</strong><small>查看已审核的宠物训练、摄影和寄养服务。</small></span>
          <ArrowRight size={20} />
        </Link>
        <Link className="merchant-entry" href="/merchant/apply">
          <span className="merchant-entry-icon"><Store size={24} /></span>
          <span><strong>宠物商家合作入驻</strong><small>宠物训练师、摄影和寄养商家可申请加入鲸伴服务网络。</small></span>
          <ArrowRight size={20} />
        </Link>
      </div>

      <footer className="site-footer">
        <strong>鲸伴科技</strong>
        <span>深圳市鲸伴科技有限公司</span>
        <span>jingbantech.com</span>
        <nav><Link href="/privacy">隐私政策</Link><Link href="/terms">用户协议</Link></nav>
      </footer>
    </MobileShell>
  );
}

function PawBadge() {
  return (
    <span className="paw-badge" aria-hidden="true">
      <span>鲸</span>
    </span>
  );
}
