"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api-url";

export function AdminLogoutButton() {
  const router = useRouter();
  return <button className="secondary-button" type="button" onClick={async () => {
    await fetch(apiUrl("/api/admin/logout"), { method: "POST", credentials: "include" });
    router.replace("/admin/login");
    router.refresh();
  }}><LogOut size={17} /> 退出</button>;
}
