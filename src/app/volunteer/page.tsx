import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, HeartHandshake, HelpCircle, Megaphone, ShieldCheck } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { createBreadcrumbJsonLd, createFaqJsonLd, createWebPageJsonLd, serializeJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

const pageDescription = "加入鲸伴城市宠物互助志愿者，协助扩散寻宠信息、提交线索、整理城市宠物公益资源，让更多走失宠物和流浪动物被看见。";

export const metadata: Metadata = {
  title: "鲸伴城市宠物互助志愿者｜一起帮助走失宠物被看见",
  description: pageDescription,
};

const volunteerTasks = [
  "转发真实、清晰的寻宠信息，让同城朋友更快看到。",
  "看到疑似走失宠物时，记录时间、地点、照片或视频，并通过线索入口提交。",
  "协助整理本地宠物医院、救助站、领养信息和公益资源。",
  "提醒发布者补充照片、特征、走失时间和安全的联系方式处理方式。",
];

const serviceBoundaries = [
  "志愿者参与以信息协作、扩散提醒和资源整理为主。",
  "不要求志愿者线下抓捕动物，不鼓励单独进入危险区域。",
  "发现受伤或处于危险环境中的动物，应优先联系本地专业救助力量或相关部门。",
  "平台不承诺找回结果，不提供动物诊疗、线下搜寻或抓捕服务。",
];

const actions = [
  { label: "我要发布寻宠", href: "/lost/new", primary: true },
  { label: "查看城市互助", href: "/city" },
  { label: "免费办理宠物身份证", href: "/pet-id/new" },
];

const faqs = [
  {
    question: "成为志愿者需要收费吗？",
    answer: "不需要。鲸伴城市宠物互助志愿者以公益协作为主，参与转发寻宠信息、提交线索和整理城市宠物公益资源不收取费用。",
  },
  {
    question: "我没有救助经验可以加入吗？",
    answer: "可以。没有救助经验也可以从转发寻宠信息、留意附近走失宠物、补充可靠线索和整理本地资源开始参与。",
  },
  {
    question: "志愿者需要线下抓捕动物吗？",
    answer: "不需要。志愿者不承担线下抓捕职责，也不建议单独抓捕或追赶动物。涉及受伤、惊恐、道路或高风险环境时，应联系本地专业救助力量或相关部门。",
  },
  {
    question: "我可以只帮忙转发寻宠信息吗？",
    answer: "可以。稳定、准确地转发寻宠信息本身就是重要帮助。转发时建议保留原始寻宠链接和线索入口，避免传播未经确认的信息。",
  },
  {
    question: "发现流浪动物应该怎么做？",
    answer: "先确保自身安全，记录位置、时间、照片或视频，观察是否有项圈、身份牌或明显受伤情况。需要救助时，可联系本地救助组织、宠物医院或相关部门，并尽量通过平台线索入口补充信息。",
  },
];

const webPageJsonLd = createWebPageJsonLd("鲸伴城市宠物互助志愿者", "/volunteer", pageDescription);
const breadcrumbJsonLd = createBreadcrumbJsonLd([
  { name: "首页", url: siteConfig.url },
  { name: "城市宠物互助志愿者", url: `${siteConfig.url}/volunteer` },
]);
const faqJsonLd = createFaqJsonLd(faqs);

export default function VolunteerPage() {
  return (
    <MobileShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }} />
      <div className="form-page">
        <header className="page-heading">
          <span className="eyebrow"><HeartHandshake size={14} /> 城市宠物互助</span>
          <h1>加入鲸伴城市宠物互助志愿者</h1>
          <p>用你的时间和善意，帮助更多走失宠物被看见，也让流浪动物获得更多被救助、被领养的机会。</p>
        </header>

        <section className="identity-section" aria-labelledby="volunteer-tasks-title">
          <h2 id="volunteer-tasks-title">志愿者可以参与什么</h2>
          <div style={{ display: "grid", gap: 9 }}>
            {volunteerTasks.map((task) => (
              <p key={task} style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: 0, color: "#42505a", fontSize: 13, lineHeight: 1.7 }}>
                <BadgeCheck size={16} style={{ color: "var(--teal)", flex: "0 0 auto", marginTop: 3 }} />
                <span>{task}</span>
              </p>
            ))}
          </div>
        </section>

        <section className="identity-section" aria-labelledby="volunteer-boundary-title">
          <h2 id="volunteer-boundary-title">志愿服务边界</h2>
          <div style={{ display: "grid", gap: 9 }}>
            {serviceBoundaries.map((boundary) => (
              <p key={boundary} style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: 0, color: "#42505a", fontSize: 13, lineHeight: 1.7 }}>
                <ShieldCheck size={16} style={{ color: "var(--coral)", flex: "0 0 auto", marginTop: 3 }} />
                <span>{boundary}</span>
              </p>
            ))}
          </div>
        </section>

        <section className="identity-section" aria-labelledby="volunteer-actions-title">
          <h2 id="volunteer-actions-title">行动入口</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {actions.map((action) => (
              <Link
                className={action.primary ? "primary-button" : "secondary-button"}
                href={action.href}
                key={action.href}
                style={{ justifyContent: "space-between", width: "100%" }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  {action.primary && <Megaphone size={17} />}
                  {action.label}
                </span>
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        </section>

        <section className="identity-section" aria-labelledby="volunteer-faq-title">
          <h2 id="volunteer-faq-title">FAQ</h2>
          <div style={{ display: "grid", gap: 14 }}>
            {faqs.map((faq) => (
              <article key={faq.question}>
                <h3 style={{ display: "flex", alignItems: "center", gap: 7, margin: "0 0 6px", fontSize: 16 }}>
                  <HelpCircle size={16} style={{ color: "var(--teal)", flex: "0 0 auto" }} />
                  {faq.question}
                </h3>
                <p style={{ margin: 0, color: "var(--muted)", fontSize: 12, lineHeight: 1.7 }}>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </MobileShell>
  );
}
