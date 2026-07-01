import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, Megaphone, Radio, Search } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { cities } from "@/lib/cities";
import { createBreadcrumbJsonLd, createCollectionPageJsonLd, createFaqJsonLd, serializeJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

const pageDescription = "在鲸伴选择城市查看本地宠物走失信息、发布寻宠启事、复制扩散文案，参与全国城市宠物互助协作。";

export const metadata: Metadata = {
  title: "全国城市寻宠互助入口｜宠物走失发布与同城协作 - 鲸伴",
  description: pageDescription,
};

const cityFaqs = [
  {
    question: "鲸伴城市寻宠页面适合什么情况使用？",
    answer: "适合宠物走失后需要快速整理信息、生成可转发寻宠页面和扩散文案，并希望同城爱心人士通过线索表单提供目击信息的情况。",
  },
  {
    question: "发布寻宠信息会公开手机号或微信吗？",
    answer: "不会直接公开展示联系方式。爱心人士通过平台表单提交线索，联系方式和线索会进入后台队列，由平台协助整理和中转。",
  },
  {
    question: "鲸伴能保证找回走失宠物吗？",
    answer: "不能保证找回结果。鲸伴提供信息整理、扩散文案、线索收集和城市互助工具，不提供线下搜寻、抓捕或动物诊疗服务。",
  },
];

export default function CityIndexPage() {
  const cityUrl = `${siteConfig.url}/city`;
  const collectionJsonLd = createCollectionPageJsonLd({
    name: "全国城市寻宠协作网络",
    url: cityUrl,
    description: pageDescription,
  });
  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { name: "首页", url: siteConfig.url },
    { name: "城市寻宠", url: cityUrl },
  ]);
  const faqJsonLd = createFaqJsonLd(cityFaqs);

  return (
    <MobileShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }} />
      <div className="lost-network-page">
        <header className="lost-network-heading">
          <span><Radio size={14} /> 全国城市寻宠互助入口</span>
          <h1>全国城市寻宠协作网络</h1>
          <p>选择所在城市，查看本地正在寻找的宠物、成功找回案例和城市扩散文案。鲸伴提供信息整理、扩散模板、线索收集和城市互助工具，不承诺找回结果。</p>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 8 }}>
            <Link className="primary-button" href="/lost/new"><Megaphone size={18} /> 发布寻宠信息</Link>
            <Link className="secondary-button" href="/lost"><Search size={17} /> 查看全国寻宠</Link>
          </div>
        </header>

        <section className="lost-network-section">
          <div className="section-heading compact">
            <div>
              <span>城市入口</span>
              <h2>选择你的城市</h2>
            </div>
            <MapPin size={22} />
          </div>
          <div className="service-list">
            {cities.map((city) => (
              <article className="service-item teal" key={city.slug} style={{ gridTemplateColumns: "52px 1fr", alignItems: "start" }}>
                <span className="service-icon"><MapPin size={24} /></span>
                <span className="service-copy">
                  <small>{city.province || "城市频道"}</small>
                  <strong>{city.name}</strong>
                  <span>{city.description || `查看${city.name}本地宠物走失信息、成功找回案例和同城寻宠扩散入口。`}</span>
                  <span style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                    <Link className="primary-button" href={`/city/${city.slug}`} style={{ minHeight: 36, padding: "0 10px", fontSize: 11 }}>进入频道</Link>
                    <Link className="secondary-button" href={`/city/${city.slug}/report`} style={{ minHeight: 36, padding: "0 10px", fontSize: 11 }}>查看报告</Link>
                  </span>
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="lost-network-section" style={{ paddingTop: 0 }}>
          <div className="section-heading compact">
            <div>
              <span>协作能力</span>
              <h2>鲸伴城市寻宠网络可以做什么？</h2>
            </div>
            <CheckCircle2 size={22} />
          </div>
          <div style={{ display: "grid", gap: 9 }}>
            {[
              "发布本城寻宠信息",
              "生成微信群、朋友圈、小红书扩散文案",
              "收集线索但不直接公开联系方式",
              "查看本城成功找回案例",
              "参与城市宠物公益互助",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, background: "#fff", border: "1px solid var(--line)", borderRadius: 7, color: "#4c5961", fontSize: 12 }}>
                <CheckCircle2 size={16} style={{ color: "var(--teal)", flex: "0 0 auto" }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="lost-network-section" style={{ paddingTop: 0 }} aria-labelledby="city-index-faq-title">
          <div className="section-heading compact">
            <div>
              <span>常见问题</span>
              <h2 id="city-index-faq-title">城市寻宠 FAQ</h2>
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

        <section className="public-network-entry">
          <span><Megaphone size={14} /> 全国宠物公益寻回平台</span>
          <h2>先发布，再扩散，持续收集线索</h2>
          <p>城市寻宠页面帮助同城朋友更快看到信息。平台提供工具和线索中转，不承诺找回结果。</p>
          <div><Link className="primary-button" href="/lost/new">发布寻宠</Link><Link className="secondary-button" href="/lost">查看全国</Link></div>
        </section>
      </div>
    </MobileShell>
  );
}
