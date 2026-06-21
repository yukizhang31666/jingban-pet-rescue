import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarClock, CheckCircle2, MapPin } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { getDb, type LostRow } from "@/lib/db";
import { formatDateTime, formatLocation } from "@/lib/format";

export const metadata: Metadata = {
  title: "成功找回案例｜鲸伴宠物寻回记录",
  description: "查看鲸伴平台已找回的宠物案例，了解宠物走失后如何通过城市协作、信息扩散和线索收集提高被看见的机会。",
};
export const dynamic = "force-dynamic";

export default async function SuccessPage() {
  const reports = await getDb().prepare(`
    SELECT * FROM lost_reports
    WHERE status = 'found'
    ORDER BY created_at DESC
  `).all<LostRow>();

  return (
    <MobileShell>
      <div className="lost-network-page">
        <header className="lost-network-heading">
          <span><CheckCircle2 size={14} /> 重逢案例</span>
          <h1>鲸伴成功找回案例</h1>
          <p>每一次重逢，都是城市爱心协作的结果。这里展示已标记为“已找回”的寻宠信息，感谢所有帮忙扩散和提供线索的人。</p>
        </header>

        <section className="lost-network-section">
          {reports.length > 0 ? (
            <div className="lost-network-list">
              {reports.map((report) => {
                const petName = report.pet_name?.trim() || "宠物";
                const location = formatLocation({ lost_location: report.lost_location });
                const lostTime = formatDateTime(report.lost_time);
                const features = report.features?.trim() || "暂未填写";
                return (
                  <article className="lost-network-card" key={report.public_id}>
                    {report.photo_url ? (
                      <Link className="lost-network-photo" href={`/lost/${report.public_id}`} aria-label={`查看${petName}的详情`}>
                        <Image src={report.photo_url} alt={`${petName}的照片`} fill sizes="128px" />
                      </Link>
                    ) : (
                      <span className="lost-network-photo" style={{ display: "grid", placeItems: "center", color: "var(--muted)", fontSize: 11 }}>暂无照片</span>
                    )}
                    <div className="lost-network-copy">
                      <small className="urgency-label" style={{ color: "#17684d", background: "#eaf6f3" }}>已找回</small>
                      <strong>{petName}</strong>
                      <span className="lost-network-region"><MapPin size={14} /> {formatLocation(report)}</span>
                      <span><MapPin size={14} /> {location}</span>
                      <span><CalendarClock size={14} /> {lostTime}</span>
                      <p>{features}</p>
                      <Link className="lost-network-detail-button" href={`/lost/${report.public_id}`}>查看详情</Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="marketplace-empty">
              <CheckCircle2 size={36} />
              <h2>暂无成功找回案例</h2>
              <p>等后台将寻宠信息标记为“已找回”后，这里会自动展示。</p>
              <Link className="primary-button" style={{ marginTop: 18 }} href="/lost">查看正在寻找</Link>
            </div>
          )}
        </section>
      </div>
    </MobileShell>
  );
}
