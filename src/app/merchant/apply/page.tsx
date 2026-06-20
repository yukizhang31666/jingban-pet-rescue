import type { Metadata } from "next";
import { MerchantApplicationForm } from "@/components/merchant-application-form";
import { MobileShell } from "@/components/mobile-shell";

export const metadata: Metadata = { title: "宠物商家合作入驻" };

export default function MerchantApplyPage() {
  return (
    <MobileShell>
      <div className="form-page">
        <header className="page-heading merchant-heading">
          <span className="eyebrow">鲸伴服务网络</span>
          <h1>宠物商家合作入驻</h1>
          <p>连接可信赖的本地宠物服务，让身份建档、日常照护与紧急寻宠形成长期服务网络。</p>
        </header>
        <MerchantApplicationForm />
      </div>
    </MobileShell>
  );
}
