import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, FileText, MapPin, Search, ShieldCheck } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { getDb, type LostRow } from "@/lib/db";
import { formatDateTime, formatLocation } from "@/lib/format";
import { createWebPageJsonLd, serializeJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CaseRow = LostRow & {
  pet_type?: string | null;
  pet_breed?: string | null;
};

async function findCase(id: string) {
  return await getDb().prepare(`
    SELECT lr.*, p.type AS pet_type, p.breed AS pet_breed
    FROM lost_reports lr
    LEFT JOIN pets p ON p.public_id = lr.pet_id
    WHERE lr.public_id = ?
  `).get<CaseRow>(id);
}

function optionalText(value?: string | null) {
  const text = value?.trim() || "";
  return ["undefined", "null", "待补充", "未填写"].includes(text.toLowerCase()) ? "" : text;
}

const fallbackMetadata = {
  title: "成功案例记录 - 鲸伴",
  description: "查看鲸伴平台沉淀的宠物成功找回案例，了解宠物走失后如何通过信息扩散、线索收集和城市互助增加被看见的机会。",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const report = await findCase(id);
  if (!report || report.status !== "found") return fallbackMetadata;
  const petName = optionalText(report.pet_name) || "宠物";
  const formattedLocation = formatLocation(report);
  const locationTitle = formattedLocation === "位置暂未填写" ? "宠物走失信息" : `${formattedLocation}宠物寻回记录`;
  return {
    title: `${petName}已找回案例｜${locationTitle} - 鲸伴`,
    description: `${petName}已找回。这是鲸伴平台沉淀的宠物寻回案例记录，包含走失地点、宠物特征和城市互助信息，帮助更多宠物主了解信息扩散与线索收集的价值。`,
    alternates: { canonical: `https://jingbantech.com/cases/${id}` },
  };
}

export default async function CaseArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await findCase(id);

  if (!report) {
    return <CaseState title="该案例不存在或已被移除。"><Link className="primary-button" href="/cases">返回成功案例</Link></CaseState>;
  }
  if (report.status !== "found") {
    return (
      <CaseState title="该寻宠记录尚未成为已找回案例。">
        <Link className="primary-button" href={`/lost/${id}`}>查看原寻宠详情</Link>
        <Link className="secondary-button" href="/cases">返回成功案例</Link>
      </CaseState>
    );
  }

  const petName = optionalText(report.pet_name) || "宠物";
  const location = formatLocation(report);
  const petType = optionalText(report.pet_type);
  const petBreed = optionalText(report.pet_breed);
  const petProfile = [petType, petBreed].filter((value, index, list) => value && list.indexOf(value) === index).join(" / ");
  const lostLocation = formatLocation({ lost_location: report.lost_location });
  const features = optionalText(report.features);
  const supplements = [
    optionalText(report.last_seen_location) ? `最后出现：${optionalText(report.last_seen_location)}` : "",
    optionalText(report.wearing_items) ? `佩戴物：${optionalText(report.wearing_items)}` : "",
    optionalText(report.temperament) ? `性格：${optionalText(report.temperament)}` : "",
  ].filter(Boolean).join("；");
  const caseDescription = `${petName}已找回。这是鲸伴平台沉淀的宠物寻回记录，用于呈现已有走失信息、城市互助和线索收集价值。`;
  const jsonLd = createWebPageJsonLd(`${petName}已找回案例`, `/cases/${id}`, caseDescription);

  return (
    <MobileShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <article className="identity-page">
        <header className="lost-network-heading">
          <span><CheckCircle2 size={14} /> 平台已找回记录</span>
          <h1>{petName}已找回案例</h1>
          <p>这是一条鲸伴平台沉淀的宠物寻回记录，用于记录信息扩散、线索收集和城市互助。成功案例不构成对找回结果的承诺。</p>
        </header>

        <CaseSection title="案例概览" icon={<CheckCircle2 size={19} />}>
          <Fact label="宠物名" value={petName} />
          {petProfile && <Fact label="宠物类型 / 品种" value={petProfile} />}
          <Fact label="城市 / 地点" value={location} />
          <Fact label="当前状态" value="已找回" />
        </CaseSection>

        <CaseSection title="走失信息" icon={<MapPin size={19} />}>
          {optionalText(report.lost_time) && <Fact label="走失时间" value={formatDateTime(report.lost_time)} />}
          {lostLocation !== "位置暂未填写" && <Fact label="走失地点" value={lostLocation} />}
          {features && <Fact label="明显特征" value={features} />}
          {supplements && <Fact label="补充说明" value={supplements} />}
          {!optionalText(report.lost_time) && lostLocation === "位置暂未填写" && !features && !supplements && <p style={{ margin: 0, color: "var(--muted)", fontSize: 12 }}>该记录暂无更多公开走失信息。</p>}
        </CaseSection>

        <CaseSection title="平台记录说明" icon={<FileText size={19} />}>
          <p style={{ margin: 0, color: "#4c5961", fontSize: 12, lineHeight: 1.7 }}>该案例通过鲸伴沉淀为已找回记录。宠物走失后，清晰的信息整理、可转发的寻宠页面、线索收集入口和城市互助传播，可以帮助更多人看到寻宠信息。</p>
        </CaseSection>

        <aside style={{ margin: 14, padding: 14, color: "#665711", background: "#fff7d6", borderLeft: "3px solid var(--yellow)", fontSize: 11, lineHeight: 1.7 }}>
          <strong style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><ShieldCheck size={16} /> 风险说明</strong>
          成功案例不构成对找回结果的保证。鲸伴不提供动物诊疗或线下搜寻服务，仅提供信息整理、扩散协作和线索收集工具。
        </aside>

        <section className="identity-section" style={{ display: "grid", gap: 8 }}>
          <Link className="primary-button" href={`/lost/${id}`}><Search size={17} /> 查看原寻宠详情</Link>
          <Link className="secondary-button" href="/cases">查看更多成功案例</Link>
          <Link className="secondary-button" href="/lost/new">发布寻宠信息</Link>
        </section>
      </article>
    </MobileShell>
  );
}

function CaseState({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <MobileShell>
      <div className="form-page">
        <section className="marketplace-empty">
          <FileText size={36} />
          <h1>{title}</h1>
          <div style={{ display: "grid", gap: 8, width: "100%", marginTop: 16 }}>{children}</div>
        </section>
      </div>
    </MobileShell>
  );
}

function CaseSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="identity-section"><h2 style={{ display: "flex", alignItems: "center", gap: 7 }}>{icon}{title}</h2><div className="lost-facts" style={{ marginTop: 14 }}>{children}</div></section>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="fact-row"><span>{label}</span><strong>{value}</strong></div>;
}
