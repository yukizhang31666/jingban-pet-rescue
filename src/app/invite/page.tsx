import type { Metadata } from "next";
import { Share2 } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { InviteLinkGenerator } from "./invite-link-generator";

export const metadata: Metadata = {
  title: "成为鲸伴寻宠传播员",
  description: "生成鲸伴公益寻宠专属分享链接，记录寻宠信息的公益传播来源。",
};

export default function InvitePage() {
  return (
    <MobileShell>
      <div className="form-page">
        <header className="page-heading">
          <span className="eyebrow"><Share2 size={14} /> 公益传播来源记录</span>
          <h1>成为鲸伴寻宠传播员</h1>
          <p>输入一个容易识别的昵称或代号，生成你的专属分享链接。朋友通过你的链接发布寻宠信息后，平台后台可以看到来源，方便后续统计公益传播贡献。</p>
        </header>
        <InviteLinkGenerator />
      </div>
    </MobileShell>
  );
}
