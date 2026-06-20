"use client";

import Link from "next/link";
import { BadgeCheck, Home, Search, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "首页", icon: Home },
  { href: "/pet-id/new", label: "宠物证", icon: BadgeCheck },
  { href: "/lost", label: "寻宠", icon: Search },
  { href: "/quiz", label: "测试", icon: Sparkles },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="主要导航">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.replace("/new", ""));
        return (
          <Link key={item.href} href={item.href} className={active ? "active" : ""}>
            <Icon size={21} strokeWidth={active ? 2.6 : 2} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
