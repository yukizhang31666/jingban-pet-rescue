"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const configuredPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  return (
    <div className="admin-login-page">
      <SiteHeader />
      <main>
        <span>后台入口</span>
        <h1>后台访问验证</h1>
        <p>请输入后台访问口令后继续。</p>
        <form
          className="admin-login-form"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            if (!configuredPassword) {
              setError("后台口令未配置，请先配置环境变量。");
              return;
            }
            const password = String(new FormData(event.currentTarget).get("password") || "");
            if (password !== configuredPassword) {
              setError("密码错误，请重试。");
              return;
            }
            document.cookie = "admin_auth=1; path=/; SameSite=Lax";
            router.push("/admin");
          }}
        >
          <label htmlFor="admin-access-password">密码</label>
          <input id="admin-access-password" name="password" type="password" autoComplete="current-password" required />
          <button className="primary-button" type="submit"><LockKeyhole size={18} /> 进入后台</button>
          {!configuredPassword && <p role="alert">后台口令未配置，请先配置环境变量。</p>}
          {error && configuredPassword && <p role="alert">{error}</p>}
        </form>
        <Link href="/">返回首页</Link>
      </main>
    </div>
  );
}
