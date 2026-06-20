import Link from "next/link";
import { ArrowLeft, PawPrint } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";

export default function NotFound() {
  return (
    <MobileShell>
      <section className="empty-state">
        <PawPrint size={52} />
        <h1>这份档案还不存在</h1>
        <p>请检查链接是否完整，或回到首页重新创建。</p>
        <Link className="primary-button" href="/"><ArrowLeft size={19} /> 返回首页</Link>
      </section>
    </MobileShell>
  );
}
