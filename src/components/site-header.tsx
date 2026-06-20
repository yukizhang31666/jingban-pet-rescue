import Link from "next/link";
import { PawPrint } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="鲸伴科技首页">
        <span className="brand-mark"><PawPrint size={19} strokeWidth={2.5} /></span>
        <span>鲸伴科技</span>
      </Link>
      <span className="header-link">宠物数字身份</span>
    </header>
  );
}
