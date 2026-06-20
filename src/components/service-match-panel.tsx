"use client";

import { Camera, CheckCircle2, HeartHandshake, LoaderCircle, Scissors, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { apiUrl } from "@/lib/api-url";

type ServiceMatchPanelProps = {
  petId: string;
  petName: string;
  petType: string;
  city: string;
};

export function ServiceMatchPanel({ petId, petName, petType, city }: ServiceMatchPanelProps) {
  const services = useMemo(() => petType.includes("狗") ? [
    { name: "行为训练", reason: `${petName}的身份画像显示探索欲较强，适合正向行为训练。`, icon: HeartHandshake },
    { name: "宠物摄影", reason: "高传播身份适合制作纪念写真和社交内容。", icon: Camera },
    { name: "寄养照护", reason: `优先匹配${city}可提供实时反馈的寄养服务。`, icon: Sparkles },
  ] : [
    { name: "宠物摄影", reason: "高传播身份适合制作纪念写真和社交内容。", icon: Camera },
    { name: "洗护美容", reason: `${petName}可优先匹配低应激、预约制洗护。`, icon: Scissors },
    { name: "寄养照护", reason: `优先匹配${city}安静分区的寄养服务。`, icon: Sparkles },
  ], [city, petName, petType]);
  const [selected, setSelected] = useState(services[0]);
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(apiUrl("/api/service-leads"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petId, serviceType: selected.name, city, contact, aiReason: selected.reason }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "提交失败");
      setMessage("需求已进入同城服务匹配池，我们会通过你填写的联系方式联系你。 ");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "提交失败，请稍后重试");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="growth-service-panel">
      <header><span><Sparkles size={14} /> AI服务决策</span><h2>适合{petName}的同城服务</h2><p>根据身份画像与城市自动给出第一版匹配建议。</p></header>
      <div className="growth-service-options">
        {services.map((service) => {
          const Icon = service.icon;
          return <button className={selected.name === service.name ? "active" : ""} type="button" key={service.name} onClick={() => setSelected(service)}><Icon size={18} /><span><strong>{service.name}</strong><small>{service.reason}</small></span></button>;
        })}
      </div>
      <form onSubmit={submit}>
        <label htmlFor={`service-contact-${petId}`}>手机号 / 微信号</label>
        <input id={`service-contact-${petId}`} value={contact} onChange={(event) => setContact(event.target.value)} placeholder="用于发送同城服务方案" maxLength={50} required />
        <button className="primary-button" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={18} /> : <HeartHandshake size={18} />}{busy ? "正在提交..." : `申请匹配${selected.name}`}</button>
      </form>
      {message && <p className="growth-service-message"><CheckCircle2 size={16} /> {message}</p>}
      <Link className="growth-service-network-link" href={`/services?city=${encodeURIComponent(city)}`}>查看 {city} 已入驻服务商</Link>
    </section>
  );
}
