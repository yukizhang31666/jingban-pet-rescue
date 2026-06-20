import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, CircleX, ExternalLink, MessageSquareText, PhoneCall } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getDb } from "@/lib/db";
import { SpreadInquiryStatusActions } from "./spread-inquiry-status-actions";

export const metadata: Metadata = { title: "扩散服务咨询" };
export const dynamic = "force-dynamic";

type SpreadInquiry = {
  id: number;
  lost_report_id: string;
  contact: string;
  note: string;
  status: string | null;
  created_at: string;
};

const statusLabels: Record<string, string> = {
  new: "新咨询",
  contacted: "已联系",
  converted: "已成交",
  closed: "已关闭",
};

const statusFilters = [
  { value: "", label: "全部" },
  { value: "new", label: "新咨询" },
  { value: "contacted", label: "已联系" },
  { value: "converted", label: "已成交" },
  { value: "closed", label: "已关闭" },
];

export default async function SpreadInquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string | string[] }> }) {
  const params = await searchParams;
  const requestedStatus = typeof params.status === "string" ? params.status : "";
  const selectedStatus = statusFilters.some((item) => item.value === requestedStatus) ? requestedStatus : "";
  const db = getDb();
  const [countRows, inquiries] = await Promise.all([
    db.prepare(`
      SELECT COALESCE(status, 'new') AS status, COUNT(*) AS count
      FROM spread_inquiries GROUP BY COALESCE(status, 'new')
    `).all<{ status: string; count: number | string }>(),
    selectedStatus
      ? db.prepare(`
          SELECT * FROM spread_inquiries WHERE COALESCE(status, 'new') = ?
          ORDER BY created_at DESC LIMIT 100
        `).all<SpreadInquiry>(selectedStatus)
      : db.prepare(`
          SELECT * FROM spread_inquiries ORDER BY created_at DESC LIMIT 100
        `).all<SpreadInquiry>(),
  ]);
  const counts = Object.fromEntries(countRows.map((row) => [row.status, Number(row.count)]));
  const stats = [
    { label: "新咨询数量", value: counts.new || 0, icon: MessageSquareText, tone: "coral" },
    { label: "已联系数量", value: counts.contacted || 0, icon: PhoneCall, tone: "blue" },
    { label: "已成交数量", value: counts.converted || 0, icon: CheckCircle2, tone: "green" },
    { label: "已关闭数量", value: counts.closed || 0, icon: CircleX, tone: "violet" },
  ];

  return (
    <div className="admin-shell">
      <SiteHeader />
      <main className="admin-main">
        <header className="admin-heading">
          <div>
            <span>29 元基础扩散服务</span>
            <h1>扩散服务咨询</h1>
            <p>这里展示用户提交的 29 元基础扩散服务咨询，平台可人工联系处理。</p>
          </div>
        </header>

        <section className="admin-stats" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", marginBottom: 18 }}>
          {stats.map((item) => {
            const Icon = item.icon;
            return <div className={`admin-stat ${item.tone}`} key={item.label}><Icon size={21} /><span>{item.label}</span><strong>{item.value}</strong></div>;
          })}
        </section>

        <nav className="admin-tabs" aria-label="按咨询状态筛选">
          {statusFilters.map((item) => (
            <Link
              href={item.value ? `/admin/spread-inquiries?status=${item.value}` : "/admin/spread-inquiries"}
              style={selectedStatus === item.value ? { color: "#fff", background: "var(--teal)" } : undefined}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {inquiries.length > 0 ? (
          <section style={{ display: "grid", gap: 12 }}>
            {inquiries.map((inquiry) => (
              <article className="admin-growth-panel" key={inquiry.id}>
                <header><MessageSquareText size={19} /><div><h2>{inquiry.lost_report_id}</h2><p>提交时间：{inquiry.created_at}</p></div></header>
                <div style={{ display: "grid", gap: 8, color: "#4c5961", fontSize: 12, lineHeight: 1.6 }}>
                  <div><strong>联系方式：</strong>{inquiry.contact}</div>
                  <div><strong>备注：</strong>{inquiry.note || "未填写"}</div>
                  <div><strong>状态：</strong>{statusLabels[inquiry.status || "new"] || "新咨询"}</div>
                  <SpreadInquiryStatusActions id={inquiry.id} initialStatus={inquiry.status || "new"} />
                  <Link className="secondary-button" style={{ width: "fit-content", marginTop: 5 }} href={`/lost/${inquiry.lost_report_id}`} target="_blank">
                    <ExternalLink size={16} /> 查看寻宠详情
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="admin-empty" style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 8 }}>
            {selectedStatus ? "当前没有该状态的咨询。" : "当前还没有扩散服务咨询。"}
          </div>
        )}
      </main>
    </div>
  );
}
