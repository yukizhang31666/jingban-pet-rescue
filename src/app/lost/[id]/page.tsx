import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, MapPin, MessageCircle, Search, ShieldCheck, WalletCards } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { LostSpreadStatus } from "@/components/lost-spread-status";
import { MobileShell } from "@/components/mobile-shell";
import { PosterActions } from "@/components/poster-actions";
import { ProductOffer } from "@/components/product-offer";
import { QrCode } from "@/components/qr-code";
import { BasicSpreadOffer } from "./basic-spread-offer";
import { CopyLostTextButton } from "./copy-lost-text-button";
import { LeadHintButton } from "./lead-hint-button";
import { getDb, type LostRow } from "@/lib/db";
import { appendConversionStage, recordGrowthEvent } from "@/lib/pet-growth";

export const dynamic = "force-dynamic";

async function findReport(id: string) {
  return await getDb().prepare("SELECT * FROM lost_reports WHERE public_id = ?").get<LostRow>(id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const report = await findReport(id);
  const city = report?.city?.trim() || "本地";
  const petName = report?.pet_name?.trim() || "宠物";
  const lostLocation = report?.lost_location?.trim() || "暂未填写";
  const rawFeatures = report?.features?.trim() || "暂未填写";
  const features = rawFeatures.length > 60 ? `${rawFeatures.slice(0, 60)}…` : rawFeatures;
  const title = `【公益寻宠】${city}${petName}走失，请帮忙留意`;
  const description = `${city}宠物走失信息，走失地点：${lostLocation}，特征：${features}。爱心人士可查看详情并提供线索。`;
  return {
    title,
    description,
    openGraph: report
      ? { title, description, type: "article", images: [{ url: report.photo_url, alt: `${petName}的寻宠照片` }] }
      : { title, description, type: "article" },
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
  const db = getDb();
  await db.prepare("UPDATE lost_reports SET views = views + 1 WHERE public_id = ?").run(id);
  if (report.pet_id) {
    await appendConversionStage(db, report.pet_id, "page_view");
    await recordGrowthEvent(db, report.pet_id, "page_view", "lost-detail", "", { lostId: id });
  }

  const displayTime = report.lost_time.replace("T", " ");
  const rewardText = report.reward > 0 ? `${report.reward}元` : "当面感谢";
  const wearingText = report.wearing_items || "未填写";
  const temperamentText = report.temperament || "未填写";
  const detailUrl = `${(process.env.API_URL || "").replace(/\/$/, "")}/lost/${id}`;
  const cityText = report.city || "当地";
  const publicSpreadCopy = `【全国公益寻宠】

城市：${[report.province, report.city].filter(Boolean).join(" ")}
宠物：${report.pet_name}
走失地点：${report.lost_location}
走失时间：${displayTime}
特征：${report.features}

如果你看到它，请帮忙提供线索。

查看详情：${detailUrl}`;
  const platformSpreadTemplates = [
    {
      title: "微信群版本",
      text: `【帮忙扩散一下】
${cityText}有一只宠物走失了。

宠物：${report.pet_name}
走失地点：${report.lost_location}
走失时间：${displayTime}
特征：${report.features}

如果你在附近看到过，请点开详情提供线索：
${detailUrl}`,
    },
    {
      title: "小红书版本",
      text: `标题：
${cityText}寻宠｜如果你看到这只${report.pet_name}请帮忙

正文：
今天看到一条公益寻宠信息，宠物主非常着急。
走失城市：${cityText}
走失地点：${report.lost_location}
走失时间：${displayTime}
明显特征：${report.features}

如果你在附近，麻烦帮忙留意一下。
详情和线索入口：${detailUrl}

标签：
#寻宠 #宠物走失 #同城寻宠 #公益寻宠 #${cityText}寻宠`,
    },
    {
      title: "朋友圈版本",
      text: `帮忙扩散一下🙏
${cityText}一只宠物走失了，主人正在寻找。

地点：${report.lost_location}
时间：${displayTime}
特征：${report.features}

看到类似宠物的朋友，可以点开详情提供线索：
${detailUrl}`,
    },
  ];
  const momentsCopy = `请帮忙扩散寻找${report.pet_name}！${displayTime}在${report.last_seen_location || report.lost_location}最后出现。特征：${report.features}。${report.reward > 0 ? `悬赏${report.reward}元。` : ""}看到相似宠物请打开公益寻宠页匿名提交线索：${detailUrl}`;
  const wechatCopy = `【${report.urgency}寻宠｜请群友帮忙扩散】${report.pet_name}于${displayTime}在${report.lost_location}走失，最后出现：${report.last_seen_location || report.lost_location}。明显特征：${report.features}；佩戴：${wearingText}；性格：${temperamentText}。${report.reward > 0 ? `悬赏${report.reward}元。` : ""}请勿追赶或围堵，发现线索请进入平台匿名提交：${detailUrl}`;
  const redCopy = `求同城扩散！${report.pet_name}还在等我们带它回家\n\n紧急程度：${report.urgency}\n走失区域：${report.lost_location}\n最后出现：${report.last_seen_location || report.lost_location}\n走失时间：${displayTime}\n明显特征：${report.features}\n走失时佩戴：${wearingText}\n宠物性格：${temperamentText}\n${report.reward > 0 ? `线索感谢：${report.reward}元\n` : ""}\n为了保护双方隐私，看到相似宠物请进入公益寻宠页匿名提交线索：${detailUrl}\n\n#寻宠启事 #宠物走失 #同城寻宠 #${report.lost_location.slice(0, 8)} #鲸伴公益寻宠`;
  const douyinCopy = `10秒寻宠口播脚本\n0-2秒：展示${report.pet_name}照片，字幕“请停留10秒，帮它回家”\n2-5秒：口播“${displayTime}，${report.pet_name}在${report.last_seen_location || report.lost_location}附近走失”\n5-8秒：特写明显特征，字幕“${report.features}”\n8-10秒：展示寻宠二维码，口播“看到它请不要追赶，扫码匿名提交线索，转发给附近的人”\n发布文案：每一次转发都可能缩短它回家的距离。公益详情：${detailUrl}`;
  const posterLines = [`最后出现：${report.last_seen_location || report.lost_location}`, `走失时佩戴：${wearingText}`, `明显特征：${report.features}`, "扫码匿名提交线索 · 请帮助扩散"];

  return (
    <MobileShell>
      <article className="identity-page">
        <div className="lost-alert">
          <strong>公益寻宠信息｜正在扩散中</strong>
          <span>这是一条由宠物主发布的全国公益寻宠信息，看到线索的爱心人士可以帮助扩散或提供线索。</span>
        </div>
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
          <span className="status-chip alert"><Search size={16} /> {report.status}</span>
        </div>

        <section className="identity-panel">
          <div className="identity-title-row">
            <div><h1>{report.pet_name}</h1><p>{report.public_id}</p></div>
            <span className="id-seal" style={{ background: "var(--coral)" }}><Search size={26} /></span>
          </div>
          <div className="lost-facts" style={{ marginTop: 22 }}>
            <div className="fact-row"><MapPin size={19} /><span>走失地点</span><strong>{report.lost_location}</strong></div>
            <div className="fact-row"><Search size={19} /><span>最后出现</span><strong>{report.last_seen_location || report.lost_location}</strong></div>
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
        </section>

        <section className="identity-section">
          <h2>一键复制扩散文案</h2>
          <div className="copy-list">
            <article className="copy-item">
              <header><strong>朋友圈海报文案</strong><CopyButton text={momentsCopy} targetType="lost" targetId={report.public_id} channel="moments-copy" /></header>
              <p>{momentsCopy}</p>
            </article>
            <article className="copy-item">
              <header><strong>微信群扩散文案</strong><CopyButton text={wechatCopy} targetType="lost" targetId={report.public_id} channel="wechat-group-copy" /></header>
              <p>{wechatCopy}</p>
            </article>
            <article className="copy-item">
              <header><strong>小红书发布内容</strong><CopyButton text={redCopy} targetType="lost" targetId={report.public_id} channel="xiaohongshu-copy" /></header>
              <p>{redCopy}</p>
            </article>
            <article className="copy-item">
              <header><strong>抖音10秒脚本</strong><CopyButton text={douyinCopy} targetType="lost" targetId={report.public_id} channel="douyin-copy" /></header>
              <p>{douyinCopy}</p>
            </article>
          </div>
        </section>

        <section className="identity-section">
          <h2>寻宠二维码</h2>
          <QrCode label="扫码查看实时进展、匿名提交线索并帮助扩散" />
        </section>

        <PosterActions kind="lost" publicId={report.public_id} title={`${report.urgency}寻找 ${report.pet_name}`} subtitle="请帮忙留意并转发" photoUrl={report.photo_url} lines={posterLines} />

        <ProductOffer
          title="紧急寻宠扩散包"
          price="¥99"
          buttonLabel="紧急寻宠扩散包｜¥99"
          benefits={["朋友圈寻宠海报", "微信群求助文案", "小红书寻宠文案", "抖音口播文案", "同城扩散发布建议"]}
          productType="lost_spread_package"
          targetType="lost"
          targetId={report.public_id}
          tone="coral"
        />
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

        <section className="identity-section" id="share-templates" style={{ scrollMarginTop: 78 }}>
          <h2>选择适合的平台扩散</h2>
          <p>你可以按不同平台复制不同版本，发到微信群、小红书或朋友圈，帮助宠物主获得更多线索。</p>
          <div className="copy-list" style={{ marginTop: 16 }}>
            {platformSpreadTemplates.map((template) => (
              <article className="copy-item" key={template.title}>
                <header><strong>{template.title}</strong></header>
                <p>{template.text}</p>
                <CopyLostTextButton text={template.text} label="复制该版本" successMessage="已复制，可粘贴发布。" />
              </article>
            ))}
          </div>
        </section>

        <BasicSpreadOffer />
      </article>
    </MobileShell>
  );
}
