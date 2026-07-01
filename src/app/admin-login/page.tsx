import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { SiteHeader } from "@/components/site-header";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "管理员登录" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) redirect("/admin");
  return (
    <div className="admin-login-page">
      <SiteHeader />
      <main>
        <span>鲸伴科技 · 安全后台</span>
        <h1>管理员登录</h1>
        <p>增长数据、订单与用户联系方式仅对授权管理员开放。</p>
        <AdminLoginForm />
      </main>
    </div>
  );
}
