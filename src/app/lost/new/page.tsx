import type { Metadata } from "next";
import { LostForm } from "@/components/lost-form";
import { MobileShell } from "@/components/mobile-shell";
import { getDb, type PetRow } from "@/lib/db";
import { createBreadcrumbJsonLd, createFaqJsonLd, createWebPageJsonLd, serializeJsonLd } from "@/lib/seo";

const pageDescription = "在鲸伴快速发布宠物走失寻宠启事，整理走失时间、地点、特征和联系方式，生成适合微信群、朋友圈、小红书转发的寻宠信息，并通过平台表单收集线索。";
const lostNewFaqs = [
  {
    question: "在鲸伴发布寻宠启事需要准备什么信息？",
    answer: "建议准备宠物近期照片、名字、走失时间、走失地点、最后出现位置、明显特征、佩戴物、性格和联系方式。鲸伴会帮助整理这些信息，并生成便于微信群、朋友圈、小红书转发的寻宠内容。",
  },
  {
    question: "发布寻宠信息会公开手机号或微信吗？",
    answer: "不会直接在公开页面展示手机号或微信。发现者提交线索时会通过平台表单中转，方便宠物主集中查看和判断，降低联系方式直接暴露的风险。",
  },
  {
    question: "鲸伴会帮我线下寻找宠物吗？",
    answer: "不会。鲸伴提供寻宠信息整理、扩散文案生成和线索收集工具，不承诺找回结果，也不提供线下搜寻、抓捕或动物诊疗服务。",
  },
  {
    question: "发布后可以分享到哪些地方？",
    answer: "可以分享给小区业主群、社区群、附近商户、宠物社群、朋友圈和小红书等渠道。建议使用同一个寻宠页面收集线索，避免信息分散。",
  },
  {
    question: "宠物找回后应该怎么处理？",
    answer: "建议及时更新状态或关闭寻宠信息，并感谢提供线索的人。如果宠物受伤、惊吓明显或状态异常，应尽快联系专业兽医检查。",
  },
];
const webPageJsonLd = createWebPageJsonLd("发布寻宠启事", "/lost/new", pageDescription);
const breadcrumbJsonLd = createBreadcrumbJsonLd([
  { name: "首页", url: "https://jingbantech.com" },
  { name: "全国寻宠", url: "https://jingbantech.com/lost" },
  { name: "发布寻宠", url: "https://jingbantech.com/lost/new" },
]);
const faqJsonLd = createFaqJsonLd(lostNewFaqs);

export const metadata: Metadata = {
  title: "发布寻宠启事",
  description: pageDescription,
};

export const dynamic = "force-dynamic";

export default async function NewLostPage({ searchParams }: { searchParams: Promise<{ petId?: string; ref?: string | string[] }> }) {
  const { petId, ref } = await searchParams;
  const candidateRef = typeof ref === "string" ? ref.trim().slice(0, 50) : "";
  const referralCode = /^[A-Za-z0-9_-]+$/.test(candidateRef) ? candidateRef : "";
  const pet = petId ? await getDb().prepare("SELECT * FROM pets WHERE public_id = ?").get<PetRow>(petId) : undefined;
  return (
    <MobileShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }} />
      <div className="form-page">
        <header className="page-heading">
          <span className="eyebrow">快速发布 · 多平台扩散</span>
          <h1>3分钟生成可转发寻宠海报</h1>
          <p>自动生成朋友圈、微信群、小红书寻宠文案，方便亲友帮你快速扩散。</p>
        </header>
        <LostForm linkedPet={pet ? { publicId: pet.public_id, name: pet.name } : undefined} referralCode={referralCode} />
        <section className="identity-section">
          <h2>发布前请了解</h2>
          <div style={{ display: "grid", gap: 9, marginTop: 12, color: "var(--muted)", fontSize: 12, lineHeight: 1.7 }}>
            <p style={{ margin: 0 }}>鲸伴提供寻宠信息整理、扩散文案生成和线索收集工具。</p>
            <p style={{ margin: 0 }}>平台不承诺找回结果。</p>
            <p style={{ margin: 0 }}>平台不提供线下搜寻、抓捕或动物诊疗服务。</p>
            <p style={{ margin: 0 }}>联系方式不会直接公开展示，线索通过平台表单中转。</p>
          </div>
        </section>
        <section className="identity-section" aria-labelledby="lost-new-faq-title">
          <h2 id="lost-new-faq-title">发布寻宠常见问题</h2>
          <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
            {lostNewFaqs.map((faq) => (
              <article key={faq.question}>
                <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>{faq.question}</h3>
                <p style={{ margin: 0, color: "var(--muted)", fontSize: 12, lineHeight: 1.7 }}>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </MobileShell>
  );
}
