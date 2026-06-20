"use client";

import { LoaderCircle, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiUrl } from "@/lib/api-url";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return <form className="admin-login-form" onSubmit={async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(apiUrl("/api/admin/login"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }), credentials: "include" });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "登录失败");
      router.replace("/admin");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "登录失败");
    } finally {
      setBusy(false);
    }
  }}>
    <label htmlFor="admin-password">管理员密码</label>
    <input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
    {error && <p role="alert">{error}</p>}
    <button className="primary-button" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={18} /> : <LockKeyhole size={18} />}{busy ? "正在验证..." : "进入增长后台"}</button>
  </form>;
}
