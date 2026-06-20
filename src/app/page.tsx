import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowRight, BadgeCheck, BookHeart, CalendarClock, CheckCircle2, HeartHandshake, MapPin, QrCode, Radio, ScanLine, Search, ShieldCheck, Sparkles, Store } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { getDb, type LostRow } from "@/lib/db";

export const dynamic = "force-dynamic";

const services = [
  {
    href: "/pet-id/new",
    icon: BadgeCheck,
    eyebrow: "永久免费",
    title: "免费办理宠物身份证",
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

const cityEntries = [
  { name: "全国", href: "/lost" },
  { name: "北京", href: "/lost?city=beijing" },
  { name: "上海", href: "/lost?city=shanghai" },
  { name: "广州", href: "/lost?city=guangzhou" },
  { name: "深圳", href: "/lost?city=shenzhen" },
  { name: "杭州", href: "/lost?city=hangzhou" },
  { name: "成都", href: "/lost?city=chengdu" },
  { name: "武汉", href: "/lost?city=wuhan" },
  { name: "南京", href: "/lost?city=nanjing" },
  { name: "重庆", href: "/lost?city=chongqing" },
  { name: "西安", href: "/lost?city=xian" },
  { name: "苏州", href: "/lost?city=suzhou" },
];

export default async function Home() {
  const latestReports = await getDb().prepare(`
    SELECT * FROM lost_reports
    ORDER BY created_at DESC LIMIT 3
  `).all<LostRow>();

  return (
    <MobileShell>
      <section className="home-hero">
        <Image
          src="/hero-pets.png"
          alt="佩戴数字身份牌的金毛犬和黑白猫"
          fill
          priority
          sizes="(max-width: 560px) 100vw, 520px"
        />
        <div className="hero-copy">
          <span className="hero-kicker"><ShieldCheck size={15} /> 一生可用的数字身份</span>
          <h1>30秒给宠物生成<br />专属数字身份证</h1>
          <p>免费建档，生成二维码。宠物走失时，发现者扫码即可联系主人。</p>
          <div className="hero-actions">
            <Link className="hero-button" href="/pet-id/new">立即免费办理 <ArrowRight size={18} /></Link>
            <Link className="hero-secondary-button" href="/lost/new"><Search size={17} /> 发布寻宠启事</Link>
          </div>
        </div>
      </section>

      <section className="home-trust-points" aria-label="服务保障">
        <div><CheckCircle2 size={19} /><span>永久免费基础建档</span></div>
        <div><QrCode size={19} /><span>每只宠物唯一身份编号</span></div>
        <div><Search size={19} /><span>支持寻宠启事一键生成</span></div>
      </section>

      <section className="public-network-entry">
        <span><Radio size={14} /> 全国宠物公益寻回平台</span>
        <h2>每一次转发，<br />都可能离回家更近一步</h2>
        <p>查看正在扩散的寻宠信息，匿名提交线索，帮助附近的宠物回家。</p>
        <div><Link className="primary-button" href="/lost">查看正在寻找</Link><Link className="secondary-button" href="/lost/new">发布寻宠</Link></div>
      </section>

      <section className="home-section" aria-labelledby="city-entry-title">
        <div className="section-heading">
          <div>
            <span>全国城市入口</span>
            <h2 id="city-entry-title">按城市查看寻宠信息</h2>
          </div>
        </div>
        <p style={{ margin: "-8px 0 18px", color: "var(--muted)", fontSize: 12, lineHeight: 1.65 }}>
          面向全国宠物主与爱心人士，按城市查看走失宠物和公益互助信息。
        </p>
        <nav aria-label="选择城市" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {cityEntries.map((city) => (
            <Link
              className={city.name === "全国" ? "primary-button" : "secondary-button"}
              href={city.href}
              key={city.name}
              style={{ minHeight: 42, padding: "0 8px", fontSize: 13 }}
            >
              {city.name}
            </Link>
          ))}
        </nav>
      </section>

      <section className="home-section" aria-labelledby="latest-lost-title">
        <div className="section-heading">
          <div>
            <span>全国公益寻宠</span>
            <h2 id="latest-lost-title">最新全国寻宠信息</h2>
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
                    <strong>{report.pet_name}</strong>
                    <span className="lost-network-region"><MapPin size={14} /> {[report.province, report.city].filter(Boolean).join(" · ") || "地区待补充"}</span>
                    <span><MapPin size={14} /> {report.lost_location}</span>
                    <span><CalendarClock size={14} /> {report.lost_time.replace("T", " ")}</span>
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
            <h2>当前还没有寻宠信息，欢迎发布第一条全国公益寻宠信息。</h2>
            <Link className="primary-button" style={{ marginTop: 18 }} href="/lost/new">发布寻宠信息</Link>
          </div>
        )}
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
