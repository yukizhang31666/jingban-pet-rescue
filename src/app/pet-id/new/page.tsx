import type { Metadata } from "next";
import { MobileShell } from "@/components/mobile-shell";
import { PetIdForm } from "@/components/pet-id-form";
import { createBreadcrumbJsonLd, createFaqJsonLd, createWebPageJsonLd, serializeJsonLd } from "@/lib/seo";

const pageDescription = "在鲸伴免费办理宠物数字身份证，快速建立宠物基础档案、防丢信息和专属链接，方便走失时通过二维码或页面线索联系主人。";
const petIdFaqs = [
  {
    question: "宠物身份证适合什么宠物办理？",
    answer: "适合猫、狗和其他家庭宠物办理。宠物身份证用于整理宠物基础档案、防丢信息和专属链接，方便日常保存，也方便走失时让发现者通过页面或二维码识别并联系主人。",
  },
  {
    question: "办理宠物身份证会公开我的联系方式吗？",
    answer: "联系方式默认不会直接公开展示。是否允许公开展示由用户在表单中选择，不选择公开展示也不影响生成专属链接和基础档案。",
  },
  {
    question: "宠物身份证能保证宠物走失后找回吗？",
    answer: "不能保证找回。宠物身份证可以帮助发现者更快识别宠物、查看防丢信息并联系主人，但实际找回仍取决于现场情况、扩散范围和线索质量。",
  },
  {
    question: "生成后还能继续完善防丢信息吗？",
    answer: "可以。基础身份证生成后，可以继续完善年龄、品种、明显特征、项圈芯片、备用联系人等防丢信息，让专属链接里的资料更完整。",
  },
  {
    question: "宠物身份证可以怎么使用？",
    answer: "可以保存专属链接，配合二维码放在宠物牌、项圈卡片、海报或家人共享资料中使用。平台不提供动物诊疗、医疗建议或线下救援服务。",
  },
];
const webPageJsonLd = createWebPageJsonLd("免费办理宠物身份证", "/pet-id/new", pageDescription);
const breadcrumbJsonLd = createBreadcrumbJsonLd([
  { name: "首页", url: "https://jingbantech.com" },
  { name: "宠物身份证", url: "https://jingbantech.com/pet-id/new" },
]);
const faqJsonLd = createFaqJsonLd(petIdFaqs);

export const metadata: Metadata = {
  title: "免费办理宠物身份证",
  description: pageDescription,
};

export default function NewPetIdPage() {
  return (
    <MobileShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }} />
      <div className="form-page">
        <header className="page-heading">
          <span className="eyebrow">永久免费 · 两步完成</span>
          <h1>办理宠物身份证</h1>
          <p>先用必要信息快速建档，再完善防丢资料。基础身份证会在第一步立即生成。</p>
        </header>
        <PetIdForm />
        <section className="identity-section">
          <h2>办理前请了解</h2>
          <div style={{ display: "grid", gap: 9, marginTop: 12, color: "var(--muted)", fontSize: 12, lineHeight: 1.7 }}>
            <p style={{ margin: 0 }}>宠物身份证用于整理宠物基础档案、防丢信息和专属链接。</p>
            <p style={{ margin: 0 }}>联系方式默认不会直接公开展示。</p>
            <p style={{ margin: 0 }}>是否公开展示由用户在表单中选择。</p>
            <p style={{ margin: 0 }}>平台不提供动物诊疗、医疗建议或线下救援服务。</p>
            <p style={{ margin: 0 }}>宠物身份证不能保证宠物一定找回，但可以帮助发现者更快识别并联系主人。</p>
          </div>
        </section>
        <section className="identity-section" aria-labelledby="pet-id-faq-title">
          <h2 id="pet-id-faq-title">宠物身份证常见问题</h2>
          <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
            {petIdFaqs.map((faq) => (
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
