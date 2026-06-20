import type { Metadata } from "next";
import Link from "next/link";
import { Camera, HeartHandshake, MapPin, Sparkles, UserRoundCheck } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { getDb } from "@/lib/db";

export const metadata: Metadata = { title: "鲸伴本地宠物服务网络" };
export const dynamic = "force-dynamic";

type Service = { id: number; business_name: string; service_type: string; city: string; services: string };

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ city?: string }> }) {
  const { city } = await searchParams;
  const services = city
    ? await getDb().prepare("SELECT id, business_name, service_type, city, services FROM merchant_applications WHERE status = '已入驻' AND city LIKE ? ORDER BY id DESC").all<Service>(`%${city}%`)
    : await getDb().prepare("SELECT id, business_name, service_type, city, services FROM merchant_applications WHERE status = '已入驻' ORDER BY id DESC").all<Service>();
  return <MobileShell><div className="marketplace-page">
    <header><span><Sparkles size={15} /> 鲸伴服务网络</span><h1>找到可信赖的本地宠物服务</h1><p>训练、摄影与寄养商家由鲸伴后台审核后展示。</p></header>
    <nav aria-label="服务类型"><span><UserRoundCheck size={17} /> 宠物训练师</span><span><Camera size={17} /> 宠物摄影</span><span><HeartHandshake size={17} /> 宠物寄养</span></nav>
    {services.length ? <section className="marketplace-list">{services.map((service) => <article key={service.id}><div><span>{service.service_type}</span><strong>{service.business_name}</strong><small><MapPin size={13} /> {service.city}</small></div><p>{service.services}</p></article>)}</section> : <section className="marketplace-empty"><HeartHandshake size={36} /><h2>{city ? `${city}暂时没有已入驻服务` : "首批服务商正在审核中"}</h2><p>宠物主人仍可在身份结果页提交需求，由鲸伴人工匹配。</p></section>}
    <Link className="primary-button" href="/merchant/apply">申请成为服务商</Link>
  </div></MobileShell>;
}
