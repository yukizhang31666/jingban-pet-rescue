"use client";

import { Building2, CheckCircle2, Send } from "lucide-react";
import { useState } from "react";
import { apiUrl } from "@/lib/api-url";

export function MerchantApplicationForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <section className="merchant-success">
        <CheckCircle2 size={48} />
        <h2>申请已提交</h2>
        <p>鲸伴科技会审核服务信息，并通过你留下的联系方式沟通合作方案。</p>
      </section>
    );
  }

  return (
    <form
      className="data-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
          const response = await fetch(apiUrl("/api/merchant-applications"), { method: "POST", body: new FormData(event.currentTarget) });
          const data = await response.json() as { error?: string };
          if (!response.ok) throw new Error(data.error || "提交失败");
          setSubmitted(true);
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : "提交失败，请稍后重试");
          setBusy(false);
        }
      }}
    >
      <div className="field-group">
        <label className="field-label" htmlFor="business-name">商家名称<span> *</span></label>
        <input id="business-name" name="businessName" placeholder="营业执照名称或门店名称" maxLength={80} required />
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="service-type">服务类型<span> *</span></label>
        <select id="service-type" name="serviceType" defaultValue="" required>
          <option value="" disabled>请选择</option>
          <option value="宠物摄影">宠物摄影</option>
          <option value="宠物训练">宠物训练</option>
          <option value="宠物寄养">宠物寄养</option>
        </select>
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="merchant-city">所在城市<span> *</span></label>
        <input id="merchant-city" name="city" placeholder="例如：深圳市南山区" maxLength={60} required />
      </div>
      <div className="field-row">
        <div className="field-group">
          <label className="field-label" htmlFor="contact-name">联系人<span> *</span></label>
          <input id="contact-name" name="contactName" placeholder="姓名" maxLength={30} required />
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor="contact-info">联系方式<span> *</span></label>
          <input id="contact-info" name="contactInfo" inputMode="tel" placeholder="手机或微信" maxLength={50} required />
        </div>
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="merchant-services">可提供服务<span> *</span></label>
        <textarea id="merchant-services" name="services" placeholder="介绍服务项目、服务范围、营业时间或可提供的公益支持" maxLength={500} required />
      </div>
      <fieldset className="field-group form-fieldset">
        <legend className="field-label">是否接受佣金合作<span> *</span></legend>
        <div className="choice-grid two">
          <label className="choice-option"><input type="radio" name="acceptsCommission" value="yes" required /><span>可以沟通</span></label>
          <label className="choice-option"><input type="radio" name="acceptsCommission" value="no" required /><span>暂不接受</span></label>
        </div>
      </fieldset>
      <p className="privacy-note"><Building2 size={15} /> 提交信息仅用于鲸伴服务网络合作审核，不会公开展示联系方式。</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button" type="submit" disabled={busy}><Send size={19} /> {busy ? "正在提交..." : "提交入驻申请"}</button>
    </form>
  );
}
