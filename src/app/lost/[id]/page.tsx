import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, MapPin, MessageCircle, Search, ShieldCheck, WalletCards } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { LostSpreadStatus } from "@/components/lost-spread-status";
import { MobileShell } from "@/components/mobile-shell";
import { PosterActions } from "@/components/poster-actions";
import { QrCode } from "@/components/qr-code";
import { BasicSpreadOffer } from "./basic-spread-offer";
import { CopyLostTextButton } from "./copy-lost-text-button";
import { LeadHintButton } from "./lead-hint-button";
import { getDb, type LostRow } from "@/lib/db";
import { formatDateTime, formatLocation } from "@/lib/format";
import { appendConversionStage, recordGrowthEvent } from "@/lib/pet-growth";
import { createBreadcrumbJsonLd, createFaqJsonLd, serializeJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

const reportStatusLabels: Record<string, string> = {
  searching: "寻找中",
  lead: "疑似有线索",
  found: "已找回",
  closed: "已关闭",
};
const lostDetailFaqs = [
  {
    question: "我看到疑似走失宠物，应该怎么提交线索？",
    answer: "请先保持安全距离，记录看到的位置、时间、移动方向和宠物状态，再通过页面中的“我有线索”表单提交。鲸伴会帮助整理线索，并通过平台表单中转给相关宠物主或后台核对。",
  },
  {
    question: "提交线索会公开我的联系方式吗？",
    answer: "不会直接公开展示。线索提交者和宠物主的联系方式都不会直接出现在公开页面，线索会通过平台表单进入后台，再由平台或主人核对后中转。",
  },
  {
    question: "鲸伴能保证找回这只宠物吗？",
    answer: "不能保证找回。鲸伴提供寻宠信息整理、扩散文案、线索收集和城市互助工具，但实际寻找仍需要结合线下排查、周边询问、监控确认和安全判断。",
  },
  {
    question: "我可以把这条寻宠信息分享到哪里？",
    answer: "可以分享到微信群、朋友圈、小红书、社区群、小区业主群、附近商户和城市互助渠道。建议使用本页面作为统一线索入口，避免线索分散。",
  },
  {
    question: "如果宠物已经找回，页面会怎么处理？",
    answer: "宠物找回后，页面可更新为已找回或关闭状态，并保留必要的感谢和案例信息。平台不提供线下搜寻、抓捕、动物诊疗或医疗救治服务。",
  },
];

async function findReport(id: string) {
  return await getDb().prepare("SELECT * FROM lost_reports WHERE public_id = ?").get<LostRow>(id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const report = await findReport(id);
  if (!report) return { title: "宠物走失信息 - 鲸伴", description: "查看宠物走失信息与线索提交入口，帮助更多人看到寻宠信息。" };
  const petName = report?.pet_name?.trim() || "宠物";
  const formattedLocation = formatLocation({ city: report.city, lost_location: report.lost_location });
  const hasLocation = formattedLocation !== "位置暂未填写";
  const found = report.status === "found";
  const title = found ? `${petName}已找回｜鲸伴成功寻宠案例` : `寻找${petName}｜${hasLocation ? `${formattedLocation}宠物走失信息` : "宠物走失信息"} - 鲸伴`;
  const description = found
    ? `${petName}已找回。查看这条成功寻宠案例，了解城市协作、线索收集和信息扩散如何帮助宠物被看见。`
    : `${petName}正在寻找中。查看宠物走失时间、地点、特征和线索提交入口，帮助转发扩散，让更多人看到这条寻宠信息。`;
  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.url}/lost/${id}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${siteConfig.url}/lost/${id}`,
      ...(report.photo_url ? { images: [{ url: report.photo_url, alt: `${petName}的寻宠照片` }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(report.photo_url ? { images: [report.photo_url] } : {}),
    },
  };
}

export default async function LostDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string | string[] }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const justCreated = query.created === "1";
  const report = await findReport(id);
  if (!report) notFound();
  const reportStatus = reportStatusLabels[report.status] || "寻找中";
  const db = getDb();
  await db.prepare("UPDATE lost_reports SET views = views + 1 WHERE public_id = ?").run(id);
  if (report.pet_id) {
    await appendConversionStage(db, report.pet_id, "page_view");
    await recordGrowthEvent(db, report.pet_id, "page_view", "lost-detail", "", { lostId: id });
  }

  const formattedCity = formatLocation({ city: report.city });
  const cityText = formattedCity === "位置暂未填写" ? "本地" : formattedCity;
  const lostLocationDisplay = formatLocation({ lost_location: report.lost_location });
  const lostLocationText = lostLocationDisplay === "位置暂未填写" ? "附近" : lostLocationDisplay;
  const displayTime = formatDateTime(report.lost_time);
  const displayLocation = formatLocation(report);
  const petNameText = report.pet_name?.trim() || "宠物";
  const featuresText = report.features?.trim() || "暂未填写";
  const rewardText = report.reward > 0 ? `${report.reward}元` : "当面感谢";
  const wearingText = report.wearing_items || "未填写";
  const temperamentText = report.temperament || "未填写";
  const siteUrl = (process.env.API_URL || "https://jingbantech.com").replace(/\/$/, "");
  const detailUrl = `${siteUrl}/lost/${id}`;
  const publicSpreadCopy = `【全国公益寻宠】

城市：${displayLocation}
宠物：${petNameText}
走失地点：${lostLocationDisplay}
走失时间：${displayTime}
特征：${featuresText}

如果你看到它，请帮忙提供线索。

查看详情：${detailUrl}`;
  const mobileSpreadTemplates = [
    {
      title: "微信群版",
      text: `【${cityText}${lostLocationText}寻宠】
${petNameText}走失，走失时间：${displayTime}。
特征：${featuresText}
看到请不要惊吓或追赶，可通过详情页提交线索：
${detailUrl}
感谢大家帮忙扩散。`,
    },
    {
      title: "朋友圈版",
      text: `一只宠物在${cityText}${lostLocationText}附近走失了，名字叫${petNameText}。
它的特征是：${featuresText}
如果你刚好在附近，麻烦帮忙留意一下。
线索可以通过这个页面提交：
${detailUrl}
谢谢每一个帮忙转发的人。`,
    },
    {
      title: "小红书标题",
      text: `${cityText}${lostLocationText}｜${petNameText}走失，请帮忙留意`,
    },
    {
      title: "小红书正文",
      text: `📍城市：${cityText}
📍走失地点：${lostLocationText}
⏰走失时间：${displayTime}
🐾宠物名字：${petNameText}
🔎明显特征：${featuresText}

如果你在附近看到类似宠物，请不要追赶或惊吓，可以通过详情页提交线索：
${detailUrl}

希望它能早点回家，也感谢大家帮忙扩散。`,
    },
    {
      title: "紧急版",
      text: `紧急寻宠：${petNameText}在${cityText}${lostLocationText}附近走失。
走失时间：${displayTime}
特征：${featuresText}
如看到请先拍照记录位置，不要贸然追赶。
线索提交：${detailUrl}`,
    },
  ];
  if (report.status === "found") {
    mobileSpreadTemplates.push({
      title: "找回成功版",
      text: `【好消息】${cityText}${petNameText}已找回！
感谢所有帮忙扩散、留意和提供线索的朋友。
也希望更多走失宠物都能平安回家。
鲸伴公益寻宠平台：${siteUrl}`,
    });
  }
  const posterLines = [`最后出现：${formatLocation({ lost_location: report.last_seen_location || report.lost_location })}`, `走失时佩戴：${wearingText}`, `明显特征：${featuresText}`, "扫码匿名提交线索 · 请帮助扩散"];
  const pageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: report.status === "found" ? `${petNameText}已找回` : `寻找${petNameText}`,
    url: `${siteConfig.url}/lost/${id}`,
    description: report.status === "found" ? "宠物成功找回案例页面" : "宠物走失信息与线索收集页面",
  };
  const breadcrumbStructuredData = createBreadcrumbJsonLd([
    { name: "首页", url: "https://jingbantech.com" },
    { name: "全国寻宠", url: "https://jingbantech.com/lost" },
    { name: "当前寻宠信息", url: `${siteConfig.url}/lost/${id}` },
  ]);
  const faqStructuredData = createFaqJsonLd(lostDetailFaqs);

  return (
    <MobileShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(pageStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqStructuredData) }} />
      <article className="identity-page">
        <div className="lost-alert">
          <strong>公益寻宠信息｜正在扩散中</strong>
          <span>这是一条由宠物主发布的全国公益寻宠信息，看到线索的爱心人士可以帮助扩散或提供线索。</span>
        </div>
        {report.status === "found" && (
          <section style={{ margin: 14, padding: 14, color: "#315f58", background: "#eaf6f3", borderLeft: "4px solid var(--teal)", borderRadius: 7, fontSize: 12, lineHeight: 1.65 }}>
            这只宠物已找回，感谢所有帮忙扩散和提供线索的爱心人士。
          </section>
        )}
        {report.status === "closed" && (
          <section style={{ margin: 14, padding: 14, color: "#665711", background: "#fff7d6", borderLeft: "4px solid var(--yellow)", borderRadius: 7, fontSize: 12, lineHeight: 1.65 }}>
            这条寻宠信息已关闭，暂不再收集线索。
          </section>
        )}
        {justCreated && (
          <section style={{ margin: 14, padding: 16, color: "#315f58", background: "#eaf6f3", borderLeft: "4px solid var(--teal)", borderRadius: 7 }}>
            <h2 style={{ margin: "0 0 7px", color: "var(--ink)", fontSize: 18 }}>发布成功，建议立即扩散</h2>
            <p style={{ margin: "0 0 13px", fontSize: 12, lineHeight: 1.65 }}>你的寻宠信息已经生成公益详情页。建议现在复制微信群、小红书或朋友圈文案，尽快扩散给更多爱心人士。</p>
            <a href="#share-templates" style={{ color: "var(--teal)", fontSize: 12, fontWeight: 800 }}>去复制扩散文案</a>
          </section>
        )}
        <LostSpreadStatus lostId={report.public_id} views={report.views + 1} shares={report.share_count} />
        <div className="identity-hero">
          <Image src={report.photo_url} alt={`${report.pet_name}的寻宠照片`} fill priority sizes="(max-width: 520px) 100vw, 520px" />
          <span className="status-chip alert"><Search size={16} /> {reportStatus}</span>
        </div>

        <section className="identity-panel">
          <div className="identity-title-row">
            <div><h1>{report.pet_name}</h1><p>{report.public_id}</p></div>
            <span className="id-seal" style={{ background: "var(--coral)" }}><Search size={26} /></span>
          </div>
          <div className="lost-facts" style={{ marginTop: 22 }}>
            <div className="fact-row"><MapPin size={19} /><span>所在地区</span><strong>{formatLocation(report)}</strong></div>
            <div className="fact-row"><MapPin size={19} /><span>走失地点</span><strong>{lostLocationDisplay}</strong></div>
            <div className="fact-row"><Search size={19} /><span>最后出现</span><strong>{formatLocation({ lost_location: report.last_seen_location || report.lost_location })}</strong></div>
            <div className="fact-row"><CalendarClock size={19} /><span>走失时间</span><strong>{displayTime}</strong></div>
            <div className="fact-row"><MessageCircle size={19} /><span>明显特征</span><strong>{report.features}</strong></div>
            <div className="fact-row"><MessageCircle size={19} /><span>佩戴物</span><strong>{wearingText}</strong></div>
            <div className="fact-row"><MessageCircle size={19} /><span>宠物性格</span><strong>{temperamentText}</strong></div>
          </div>
        </section>

        <section className="identity-section">
          <div className="reward-box"><span><WalletCards size={18} /> 线索感谢</span><strong>{rewardText}</strong></div>
          <h2 style={{ marginTop: 20 }}>发现相似宠物？</h2>
          <p>请先保持安全距离，记录位置、时间和移动方向。平台不会公开主人或线索提交者的联系方式。</p>
          <LeadHintButton lostId={report.public_id} />
          <div className="private-contact"><ShieldCheck size={18} /> 线索进入鲸伴后台，由工作人员核对并中转给主人。</div>
          <aside style={{ marginTop: 14, padding: 14, color: "#665711", background: "#fff7d6", borderLeft: "3px solid var(--yellow)", borderRadius: 6 }}>
            <strong style={{ display: "block", marginBottom: 7, color: "#3e3420", fontSize: 13 }}>提交线索前请了解</strong>
            <div style={{ display: "grid", gap: 6, fontSize: 11, lineHeight: 1.65 }}>
              <p style={{ margin: 0 }}>鲸伴不会直接公开主人或线索提交者联系方式。</p>
              <p style={{ margin: 0 }}>线索会通过平台表单进入后台，由平台或主人核对后中转。</p>
              <p style={{ margin: 0 }}>平台提供信息整理、扩散文案和线索收集工具。</p>
              <p style={{ margin: 0 }}>平台不承诺找回结果。</p>
              <p style={{ margin: 0 }}>平台不提供线下搜寻、抓捕、动物诊疗或医疗救治服务。</p>
            </div>
          </aside>
        </section>

        <section className="identity-section" id="share-templates" style={{ scrollMarginTop: 78 }}>
          <h2>一键复制扩散文案</h2>
          <p>适合发到微信群、朋友圈、小红书，帮助更多同城爱心人士看到。</p>
          <div className="copy-list" style={{ marginTop: 16 }}>
            {mobileSpreadTemplates.map((template, index) => (
              <article className="copy-item" key={template.title}>
                <header><strong>{template.title}</strong><CopyButton text={template.text} targetType="lost" targetId={report.public_id} channel={`mobile-copy-${index + 1}`} /></header>
                <p>{template.text}</p>
              </article>
            ))}
          </div>
          {report.status === "found" && <Link className="secondary-button" style={{ width: "100%", marginTop: 12 }} href="/success">查看成功案例墙</Link>}
          <aside style={{ marginTop: 14, padding: 13, color: "#315f58", background: "#eaf6f3", borderLeft: "3px solid var(--teal)", borderRadius: 6 }}>
            <strong style={{ display: "block", marginBottom: 5, fontSize: 13 }}>想长期帮忙扩散寻宠信息？</strong>
            <p style={{ margin: "0 0 11px", fontSize: 11, lineHeight: 1.65 }}>生成你的专属分享链接，成为鲸伴寻宠传播员。</p>
            <Link className="secondary-button" style={{ width: "100%" }} href="/invite">生成我的分享链接</Link>
          </aside>
        </section>

        <section className="identity-section">
          <h2>寻宠二维码</h2>
          <QrCode label="扫码查看实时进展、匿名提交线索并帮助扩散" />
        </section>

        <PosterActions kind="lost" publicId={report.public_id} title={`${report.urgency}寻找 ${report.pet_name}`} subtitle="请帮忙留意并转发" photoUrl={report.photo_url} lines={posterLines} />

        {report.pet_id && <section className="identity-section result-next-actions"><Link className="secondary-button" href={`/pet/${report.pet_id}`}>返回 {report.pet_name} 的 Pet ID 增长主页</Link></section>}

        <section className="identity-section">
          <aside style={{ marginBottom: 18, padding: 14, color: "#315f58", background: "#eaf6f3", borderLeft: "3px solid var(--teal)", borderRadius: 6 }}>
            <strong style={{ display: "block", marginBottom: 6, fontSize: 12 }}>公益扩散提示</strong>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.65 }}>👉 如果你愿意帮助这只宠物，请点击“复制扩散文案”分享到微信 / 小红书 / 朋友圈。</p>
          </aside>
          <h2>扩散文案</h2>
          <article className="copy-item" style={{ marginTop: 12 }}>
            <p>{publicSpreadCopy}</p>
          </article>
          <CopyLostTextButton text={publicSpreadCopy} />
        </section>

        <BasicSpreadOffer />
        <section className="identity-section" aria-labelledby="lost-detail-faq-title">
          <h2 id="lost-detail-faq-title">寻宠详情常见问题</h2>
          <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
            {lostDetailFaqs.map((faq) => (
              <article key={faq.question}>
                <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>{faq.question}</h3>
                <p style={{ margin: 0, color: "var(--muted)", fontSize: 12, lineHeight: 1.7 }}>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </article>
    </MobileShell>
  );
}
