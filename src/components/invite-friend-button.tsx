"use client";

import { Check, UserPlus } from "lucide-react";
import { useState } from "react";
import { apiUrl } from "@/lib/api-url";

export function InviteFriendButton({ targetId }: { targetId: string }) {
  const [copied, setCopied] = useState(false);

  async function invite() {
    await fetch(apiUrl("/api/share"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType: "quiz", targetId, channel: "invite-friend", action: "click" }),
    }).catch(() => undefined);
    await navigator.clipboard.writeText(`${window.location.href}?from=invite`);
    await fetch(apiUrl("/api/share"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType: "quiz", targetId, channel: "invite-friend", action: "success" }),
    }).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button className="quiz-invite-button" type="button" onClick={invite}>
      {copied ? <Check size={18} /> : <UserPlus size={18} />} {copied ? "邀请链接已复制" : "邀请好友解锁守护兽"}
    </button>
  );
}
