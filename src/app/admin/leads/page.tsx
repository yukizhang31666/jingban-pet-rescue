import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, CircleX, ExternalLink, House, MessageSquareText, PhoneCall, Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getDb } from "@/lib/db";
import { DeleteLeadButton } from "./delete-lead-button";
import { LeadStatusActions } from "./lead-status-actions";

export const metadata: Metadata = { title: "线索管理" };
export const dynamic = "force-dynamic";

type LostLead = {
  id: number;
  lost_report_id: string;
  seen_location: string;
  seen_time: string;
  description: string;
  contact: string;
  is_anonymous: number;
  status: string | null;
  created_at: string;
  pet_name: string | null;
  province: string | null;
  city: string | null;
  lost_location: string | null;
  lost_time: string | null;
};

const statusLabels: Record<string, string> = {
  new: "新线索",
  contacted: "已联系",
  resolved: "已处理",
  invalid: "无效线索",
};

const statusFilters = [
  { value: "", label: "全部" },
  { value: "new", label: "新线索" },
  { value: "contacted", label: "已联系" },
  { value: "resolved", label: "已处理" },
  { value: "invalid", label: "无效线索" },
];

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string | string[] }> }) {
  const params = await searchParams;
  const requestedStatus = typeof params.status === "string" ? params.status : "";
  const selectedStatus = statusFilters.some((item) => item.value === requestedStatus) ? requestedStatus : "";
  const db = getDb();
  const [countRows, leads] = await Promise.all([
    db.prepare(`
      SELECT COALESCE(status, 'new') AS status, COUNT(*) AS count
      FROM lost_leads GROUP BY COALESCE(status, 'new')
    `).all<{ status: string; count: number | string }>(),
    selectedStatus
      ? db.prepare(`
          SELECT leads.*, reports.pet_name, reports.province, reports.city, reports.lost_location, reports.lost_time
          FROM lost_leads AS leads
          LEFT JOIN lost_reports AS reports ON reports.public_id = leads.lost_report_id
          WHERE COALESCE(leads.status, 'new') = ?
          ORDER BY leads.created_at DESC LIMIT 100
        `).all<LostLead>(selectedStatus)
      : db.prepare(`
          SELECT leads.*, reports.pet_name, reports.province, reports.city, reports.lost_location, reports.lost_time
          FROM lost_leads AS leads
          LEFT JOIN lost_reports AS reports ON reports.public_id = leads.lost_report_id
          ORDER BY leads.created_at DESC LIMIT 100
        `).all<LostLead>(),
  ]);
  const counts = Object.fromEntries(countRows.map((row) => [row.status, Number(row.count)]));
  const stats = [
    { label: "新线索数量", value: counts.new || 0, icon: MessageSquareText, tone: "coral" },
    { label: "已联系数量", value: counts.contacted || 0, icon: PhoneCall, tone: "blue" },
    { label: "已处理数量", value: counts.resolved || 0, icon: CheckCircle2, tone: "green" },
    { label: "无效线索数量", value: counts.invalid || 0, icon: CircleX, tone: "violet" },
  ];

  return (
    <div className="admin-shell">
      <SiteHeader />
      <main className="admin-main">
        <header className="admin-heading">
          <div>
            <span>寻宠线索</span>
            <h1>线索管理</h1>
            <p>这里展示爱心人士提交的寻宠线索，平台可用于人工协助宠物主核实。</p>
          </div>
          <div className="admin-heading-actions">
            <Link className="secondary-button" href="/"><House size={16} /> 返回首页</Link>
            <Link className="secondary-button" href="/lost"><Search size={16} /> 查看全国寻宠</Link>
          </div>
        </header>

        <section className="admin-stats" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", marginBottom: 18 }}>
          {stats.map((item) => {
            const Icon = item.icon;
            return <div className={`admin-stat ${item.tone}`} key={item.label}><Icon size={21} /><span>{item.label}</span><strong>{item.value}</strong></div>;
          })}
        </section>

        <nav className="admin-tabs" aria-label="按线索状态筛选">
          {statusFilters.map((item) => (
            <Link
              href={item.value ? `/admin/leads?status=${item.value}` : "/admin/leads"}
              style={selectedStatus === item.value ? { color: "#fff", background: "var(--teal)" } : undefined}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {leads.length > 0 ? (
          <section style={{ display: "grid", gap: 12 }}>
            {leads.map((lead) => (
              <article className="admin-growth-panel" key={lead.id}>
                <header>
                  <MessageSquareText size={19} />
                  <div><h2>关联寻宠 ID：{lead.lost_report_id}</h2><p>提交时间：{lead.created_at}</p></div>
                </header>
                <div style={{ display: "grid", gap: 9, color: "#4c5961", fontSize: 12, lineHeight: 1.6 }}>
                  {lead.pet_name ? (
                    <div style={{ display: "grid", gap: 6, padding: 12, background: "#f4f8f7", borderLeft: "3px solid var(--teal)" }}>
                      <div><strong>宠物名字：</strong>{lead.pet_name}</div>
                      <div><strong>省份 / 城市：</strong>{lead.province || "未填写"} / {lead.city || "未填写"}</div>
                      <div><strong>走失地点：</strong>{lead.lost_location}</div>
                      <div><strong>走失时间：</strong>{lead.lost_time}</div>
                    </div>
                  ) : (
                    <div style={{ padding: 11, color: "#944039", background: "#fff0ee" }}>关联寻宠信息不存在或已删除</div>
                  )}
                  <div><strong>看到的位置：</strong>{lead.seen_location}</div>
                  <div><strong>看到的时间：</strong>{lead.seen_time}</div>
                  <div><strong>线索描述：</strong>{lead.description}</div>
                  <div><strong>联系方式：</strong>{lead.contact || "未填写"}</div>
                  <div><strong>是否匿名：</strong>{lead.is_anonymous ? "是" : "否"}</div>
                  <div><strong>线索状态：</strong>{statusLabels[lead.status || "new"] || "新线索"}</div>
                  <LeadStatusActions id={lead.id} initialStatus={lead.status || "new"} />
                  <DeleteLeadButton id={lead.id} />
                  <Link className="secondary-button" style={{ width: "fit-content", marginTop: 5 }} href={`/lost/${lead.lost_report_id}`} target="_blank">
                    <ExternalLink size={16} /> 查看寻宠详情
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="admin-empty" style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 8 }}>
            {selectedStatus ? "当前没有该状态的线索。" : "当前还没有用户提交线索。"}
          </div>
        )}
      </main>
    </div>
  );
}
