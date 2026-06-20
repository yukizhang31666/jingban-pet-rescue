"use client";

import { BadgeCheck, ChevronRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PhotoUploader } from "@/components/photo-uploader";
import { apiUrl } from "@/lib/api-url";

type CreatedPet = { publicId: string; editToken: string; url: string };

export function PetIdForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [created, setCreated] = useState<CreatedPet>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setBusy(true);
    setError("");

    try {
      if (step === 1) {
        const referrerPetId = window.localStorage.getItem("jb_referrer_pet") || "";
        let visitorToken = window.localStorage.getItem("jb_visitor_token") || "";
        if (!visitorToken) {
          visitorToken = window.crypto.randomUUID();
          window.localStorage.setItem("jb_visitor_token", visitorToken);
        }
        formData.set("referrerPetId", referrerPetId);
        formData.set("visitorToken", visitorToken);
        const response = await fetch(apiUrl("/api/pets"), { method: "POST", body: formData });
        const data = await response.json() as CreatedPet & { error?: string };
        if (!response.ok || !data.url || !data.editToken) throw new Error(data.error || "创建失败");
        setCreated(data);
        window.localStorage.removeItem("jb_referrer_pet");
        setStep(2);
        setBusy(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (!created) throw new Error("基础身份证信息已失效，请重新建档");
      const payload = {
        editToken: created.editToken,
        age: formData.get("age"),
        gender: formData.get("gender"),
        breed: formData.get("breed"),
        features: formData.get("features"),
        sterilized: formData.get("sterilized"),
        collarChip: formData.get("collarChip"),
        backupContact: formData.get("backupContact"),
        allowPublicStats: formData.get("allowPublicStats") === "yes",
        allowPublicDisplay: formData.get("allowPublicDisplay") === "yes",
      };
      const response = await fetch(apiUrl(`/api/pets/${created.publicId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json() as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error || "保存失败");
      router.push(data.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "操作失败，请稍后重试");
      setBusy(false);
    }
  }

  return (
    <>
      <div className="form-steps" aria-label="办理进度">
        <div className={step === 1 ? "active" : "done"}><span>{step === 1 ? "1" : "✓"}</span><strong>快速建档</strong></div>
        <i />
        <div className={step === 2 ? "active" : ""}><span>2</span><strong>防丢信息</strong></div>
      </div>

      <form className="data-form" onSubmit={submit}>
        {step === 1 ? (
          <>
            <PhotoUploader />
            <div className="field-group">
              <label className="field-label" htmlFor="pet-name">宠物名字<span> *</span></label>
              <input id="pet-name" name="name" placeholder="例如：奶糖" maxLength={20} required />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="pet-type">宠物类型<span> *</span></label>
              <select id="pet-type" name="type" defaultValue="" required>
                <option value="" disabled>请选择</option>
                <option value="猫咪">猫咪</option>
                <option value="狗狗">狗狗</option>
                <option value="其他宠物">其他宠物</option>
              </select>
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="pet-city">所在城市<span> *</span></label>
              <input id="pet-city" name="city" placeholder="例如：深圳市南山区" maxLength={50} required />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="pet-contact">主人联系方式<span> *</span></label>
              <input id="pet-contact" name="contact" type="text" inputMode="tel" placeholder="手机号或微信号" maxLength={50} required />
              <p className="field-hint">用于身份核验与紧急联系，请填写真实有效的信息。</p>
            </div>
            <p className="privacy-note"><LockKeyhole size={15} /> 提交后立即生成基础身份证，下一步可继续完善防丢信息。</p>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button" type="submit" disabled={busy}>
              <BadgeCheck size={20} /> {busy ? "正在生成基础身份证..." : "先生成基础身份证"}
            </button>
          </>
        ) : (
          <>
            <div className="base-id-created">
              <ShieldCheck size={22} />
              <div><strong>基础身份证已生成</strong><span>{created?.publicId}</span></div>
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="pet-age">年龄<span> *</span></label>
              <input id="pet-age" name="age" placeholder="例如：2岁6个月" maxLength={20} required />
            </div>
            <fieldset className="field-group form-fieldset">
              <legend className="field-label">宠物性别<span> *</span></legend>
              <div className="choice-grid three">
                {["公", "母", "未知"].map((value) => <label className="choice-option" key={value}><input type="radio" name="gender" value={value} required /><span>{value}</span></label>)}
              </div>
            </fieldset>
            <div className="field-group">
              <label className="field-label" htmlFor="pet-breed">品种<span> *</span></label>
              <input id="pet-breed" name="breed" placeholder="例如：英短蓝猫、中华田园犬" maxLength={40} required />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="pet-features">宠物明显特征<span> *</span></label>
              <textarea id="pet-features" name="features" placeholder="例如：左耳有小缺口、白手套、佩戴绿色项圈" maxLength={300} required />
            </div>
            <fieldset className="field-group form-fieldset">
              <legend className="field-label">是否已绝育<span> *</span></legend>
              <div className="choice-grid three">
                {["已绝育", "未绝育", "未知"].map((value) => <label className="choice-option" key={value}><input type="radio" name="sterilized" value={value} required /><span>{value}</span></label>)}
              </div>
            </fieldset>
            <fieldset className="field-group form-fieldset">
              <legend className="field-label">是否佩戴项圈 / 芯片<span> *</span></legend>
              <div className="choice-grid two">
                {["佩戴项圈", "植入芯片", "项圈和芯片都有", "均未佩戴"].map((value) => <label className="choice-option" key={value}><input type="radio" name="collarChip" value={value} required /><span>{value}</span></label>)}
              </div>
            </fieldset>
            <div className="field-group">
              <label className="field-label" htmlFor="pet-backup-contact">备用联系人</label>
              <input id="pet-backup-contact" name="backupContact" type="text" inputMode="tel" placeholder="另一位家人或朋友的手机号 / 微信号" maxLength={50} />
            </div>
            <label className="consent-toggle">
              <input type="checkbox" name="allowPublicStats" value="yes" />
              <span className="toggle-track" aria-hidden="true"><span /></span>
              <span><strong>允许用于公益寻宠数据统计</strong><small>默认不允许；仅做匿名汇总</small></span>
            </label>
            <label className="consent-toggle">
              <input type="checkbox" name="allowPublicDisplay" value="yes" />
              <span className="toggle-track" aria-hidden="true"><span /></span>
              <span><strong>允许公开展示</strong><small>默认不允许；不影响专属链接</small></span>
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button" type="submit" disabled={busy}>
              <ShieldCheck size={20} /> {busy ? "正在保存防丢信息..." : "保存防丢信息并查看身份证"}
            </button>
            <button className="skip-step-button" type="button" onClick={() => created && router.push(created.url)}>
              暂时跳过，查看基础身份证 <ChevronRight size={17} />
            </button>
          </>
        )}
      </form>
    </>
  );
}
