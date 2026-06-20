"use client";

import { LockKeyhole, Megaphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PhotoUploader } from "@/components/photo-uploader";
import { apiUrl } from "@/lib/api-url";

const provinces = ["北京市", "上海市", "广东省", "浙江省", "四川省", "湖北省", "江苏省", "重庆市", "陕西省"];
const cities = ["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "南京", "重庆", "西安", "苏州"];

export function LostForm({ linkedPet }: { linkedPet?: { publicId: string; name: string } }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <form
      className="data-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
          const response = await fetch(apiUrl("/api/lost"), { method: "POST", body: new FormData(event.currentTarget) });
          const data = await response.json() as { url?: string; error?: string };
          if (!response.ok || !data.url) throw new Error(data.error || "发布失败");
          router.push(data.url);
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : "发布失败，请稍后重试");
          setBusy(false);
        }
      }}
    >
      {linkedPet && <div className="linked-pet-note"><span>已关联 Pet ID</span><strong>{linkedPet.name} · {linkedPet.publicId}</strong><input type="hidden" name="petId" value={linkedPet.publicId} /></div>}
      <PhotoUploader label="上传宠物近期照片" />
      <div className="field-group">
        <label className="field-label" htmlFor="lost-name">宠物名字<span> *</span></label>
        <input id="lost-name" name="petName" placeholder="例如：可乐" maxLength={20} defaultValue={linkedPet?.name} required />
      </div>
      <div className="field-row">
        <div className="field-group">
          <label className="field-label" htmlFor="lost-province">省份<span> *</span></label>
          <select id="lost-province" name="province" defaultValue="" required>
            <option value="" disabled>请选择省份</option>
            {provinces.map((province) => <option value={province} key={province}>{province}</option>)}
          </select>
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor="lost-city">城市<span> *</span></label>
          <select id="lost-city" name="city" defaultValue="" required>
            <option value="" disabled>请选择城市</option>
            {cities.map((city) => <option value={city} key={city}>{city}</option>)}
          </select>
        </div>
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="lost-location">走失地点<span> *</span></label>
        <input id="lost-location" name="lostLocation" placeholder="例如：深圳市南山区" maxLength={100} required />
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="last-seen-location">最后出现位置<span> *</span></label>
        <input id="last-seen-location" name="lastSeenLocation" placeholder="尽量具体到街道、小区门口或店铺" maxLength={150} required />
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="lost-time">走失时间<span> *</span></label>
        <input id="lost-time" name="lostTime" type="datetime-local" required />
      </div>
      <fieldset className="field-group form-fieldset">
        <legend className="field-label">紧急程度<span> *</span></legend>
        <div className="choice-grid three urgency-choices">
          {['普通', '紧急', '高危'].map((value) => (
            <label className="choice-option" key={value}>
              <input type="radio" name="urgency" value={value} defaultChecked={value === '普通'} />
              <span>{value}</span>
            </label>
          ))}
        </div>
        <p className="field-hint">幼宠、患病、受伤或在车流密集区域走失，建议选择高危。</p>
      </fieldset>
      <div className="field-group">
        <label className="field-label" htmlFor="lost-contact">主人联系方式<span> *</span></label>
        <input id="lost-contact" name="contact" type="text" inputMode="tel" placeholder="手机号或微信号，仅供平台中转线索" maxLength={50} required />
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="lost-features">宠物特征<span> *</span></label>
        <textarea id="lost-features" name="features" placeholder="毛色、体型、项圈、性格或明显特征" maxLength={300} required />
      </div>
      <fieldset className="field-group form-fieldset">
        <legend className="field-label">走失时佩戴物<span> *</span></legend>
        <div className="choice-grid two">
          {['项圈', '牵引绳', '衣服', '均未佩戴'].map((value) => (
            <label className="choice-option" key={value}>
              <input type="checkbox" name="wearingItems" value={value} />
              <span>{value}</span>
            </label>
          ))}
        </div>
        <p className="field-hint">可多选；若均未佩戴，请只选择“均未佩戴”。</p>
      </fieldset>
      <fieldset className="field-group form-fieldset">
        <legend className="field-label">宠物性格<span> *</span></legend>
        <div className="choice-grid two temperament-choices">
          {['胆小', '亲人', '警惕', '可能攻击'].map((value) => (
            <label className="choice-option" key={value}>
              <input type="radio" name="temperament" value={value} required />
              <span>{value}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="field-group">
        <label className="field-label" htmlFor="lost-reward">悬赏金额（元）</label>
        <input id="lost-reward" name="reward" type="number" min="0" max="999999" step="1" inputMode="numeric" placeholder="0" />
      </div>
      <p className="privacy-note"><LockKeyhole size={15} /> 联系方式不会出现在公开寻宠页。发现者通过“我有线索”匿名提交，由平台后台转交主人。</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button" type="submit" disabled={busy}>
        <Megaphone size={20} /> {busy ? "正在生成启事..." : "立即生成可转发寻宠海报"}
      </button>
    </form>
  );
}
