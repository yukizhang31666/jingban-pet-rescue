import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ExternalLink, House, Megaphone, MessageSquareText, Plus, Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getDb } from "@/lib/db";
import { platformContact } from "@/lib/site-config";

export const metadata: Metadata = { title: "后台管理中心" };
export const dynamic = "force-dynamic";

type Overview = {
  lost_count: number | string;
  lead_count: number | string;
  new_lead_count: number | string;
  resolved_lead_count: number | string;
  inquiry_count: number | string;
  new_inquiry_count: number | string;
  converted_inquiry_count: number | string;
};

type RecentLead = {
  id: number;
  seen_location: string;
  status: string | null;
  created_at: string;
};

const statusLabels: Record<string, string> = {
  new: "新线索",
  contacted: "已联系",
  resolved: "已处理",
  invalid: "无效线索",
};

export default async function AdminHomePage() {
  const db = getDb();
  const [overview, recentLeads] = await Promise.all([
    db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM lost_reports) AS lost_count,
        (SELECT COUNT(*) FROM lost_leads) AS lead_count,
        (SELECT COUNT(*) FROM lost_leads WHERE COALESCE(status, 'new') = 'new') AS new_lead_count,
        (SELECT COUNT(*) FROM lost_leads WHERE status = 'resolved') AS resolved_lead_count,
        (SELECT COUNT(*) FROM spread_inquiries) AS inquiry_count,
        (SELECT COUNT(*) FROM spread_inquiries WHERE COALESCE(status, 'new') = 'new') AS new_inquiry_count,
        (SELECT COUNT(*) FROM spread_inquiries WHERE status = 'converted') AS converted_inquiry_count
    `).get<Overview>(),
    db.prepare(`
      SELECT id, seen_location, status, created_at
      FROM lost_leads ORDER BY created_at DESC LIMIT 5
    `).all<RecentLead>(),
  ]);
  const stats = [
    { label: "寻宠信息总数", value: Number(overview?.lost_count || 0), icon: Search, tone: "coral" },
    { label: "线索总数", value: Number(overview?.lead_count || 0), icon: MessageSquareText, tone: "blue" },
    { label: "新线索数量", value: Number(overview?.new_lead_count || 0), icon: MessageSquareText, tone: "yellow" },
    { label: "已处理线索数量", value: Number(overview?.resolved_lead_count || 0), icon: CheckCircle2, tone: "green" },
    { label: "扩散服务咨询总数", value: Number(overview?.inquiry_count || 0), icon: Megaphone, tone: "blue" },
    { label: "新咨询数量", value: Number(overview?.new_inquiry_count || 0), icon: Megaphone, tone: "yellow" },
    { label: "已成交咨询数量", value: Number(overview?.converted_inquiry_count || 0), icon: CheckCircle2, tone: "green" },
  ];
  const entries = [
    { title: "线索管理", description: "查看和处理爱心人士提交的线索", href: "/admin/leads", icon: MessageSquareText },
    { title: "全国寻宠列表", description: "查看前台全国寻宠信息展示效果", href: "/lost", icon: Search },
    { title: "发布寻宠信息", description: "模拟用户发布走失宠物信息", href: "/lost/new", icon: Plus },
    { title: "扩散服务咨询", description: "查看用户提交的 29 元基础扩散服务咨询", href: "/admin/spread-inquiries", icon: Megaphone },
  ];

  return (
    <div className="admin-shell">
      <SiteHeader />
      <main className="admin-main">
        <header className="admin-heading">
          <div>
            <span>平台运营入口</span>
            <h1>后台管理中心</h1>
            <p>用于查看全国寻宠信息、用户提交线索和平台运营数据。</p>
          </div>
          <div className="admin-heading-actions">
            <Link className="secondary-button" href="/"><House size={16} /> 返回首页</Link>
            <Link className="secondary-button" href="/lost"><Search size={16} /> 查看全国寻宠</Link>
            <Link className="secondary-button" href="/admin/leads"><MessageSquareText size={16} /> 线索管理</Link>
          </div>
        </header>

        <aside style={{ display: "grid", gap: 5, marginBottom: 20, padding: 14, color: "#315f58", background: "#eaf6f3", borderLeft: "4px solid var(--teal)", borderRadius: 7, fontSize: 12, lineHeight: 1.6 }}>
          <strong>当前平台联系方式：</strong>
          <span>微信：{platformContact.wechat}</span>
          <span>手机：{platformContact.phone}</span>
          <span>备注：{platformContact.note}</span>
        </aside>

        <section className="admin-stats" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", marginBottom: 24 }}>
          {stats.map((item) => {
            const Icon = item.icon;
            return <div className={`admin-stat ${item.tone}`} key={item.label}><Icon size={21} /><span>{item.label}</span><strong>{item.value}</strong></div>;
          })}
        </section>

        <div className="admin-section-title"><h2>快捷入口</h2></div>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {entries.map((entry) => {
            const Icon = entry.icon;
            return (
              <Link className="admin-growth-panel" href={entry.href} key={entry.title}>
                <header><Icon size={19} /><div><h2>{entry.title}</h2><p>{entry.description}</p></div></header>
                <strong style={{ color: "var(--teal)", fontSize: 12 }}>进入页面 →</strong>
              </Link>
            );
          })}
        </section>

        <section className="admin-section">
          <header>
            <h2>最近提交的线索</h2>
            <Link className="secondary-button" style={{ minHeight: 36, padding: "0 11px" }} href="/admin/leads">查看全部 <ExternalLink size={15} /></Link>
          </header>
          {recentLeads.length > 0 ? (
            <div style={{ display: "grid", gap: 1, background: "var(--line)" }}>
              {recentLeads.map((lead) => (
                <article style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 7, padding: 14, background: "#fff" }} key={lead.id}>
                  <strong style={{ fontSize: 13 }}>看到的位置：{lead.seen_location}</strong>
                  <span style={{ color: "var(--teal)", fontSize: 11, fontWeight: 800 }}>{statusLabels[lead.status || "new"] || "新线索"}</span>
                  <small style={{ color: "var(--muted)", fontSize: 11 }}>提交时间：{lead.created_at}</small>
                </article>
              ))}
            </div>
          ) : (
            <div className="admin-empty">当前还没有用户提交线索。</div>
          )}
        </section>
      </main>
    </div>
  );
}
