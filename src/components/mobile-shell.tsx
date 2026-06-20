import { BottomNav } from "@/components/bottom-nav";
import { SiteHeader } from "@/components/site-header";

export function MobileShell({ children, hideNav = false }: { children: React.ReactNode; hideNav?: boolean }) {
  return (
    <div className="app-frame">
      <SiteHeader />
      <main>{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
