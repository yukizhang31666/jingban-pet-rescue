"use client";

import { Award, Check, ChevronRight, Copy, Crown, Globe2, LockKeyhole, Share2, Sparkles, Trophy, UserPlus, WalletCards } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PosterActions } from "@/components/poster-actions";
import { ServiceMatchPanel } from "@/components/service-match-panel";
import { apiUrl } from "@/lib/api-url";

type FullIdentity = {
  tier: string;
  ssrScore: number;
  topPercent: number;
  globalRank: number;
  cityRank: number;
  cityTotal: number;
  cityComparison: string;
  netWorth: number;
  luxuryComparison: number;
  guardian: string;
  cosmicIdentity: string;
  identityStory: string | null;
  xiaohongshuTitle: string;
  xiaohongshuBody: string;
  douyinScript: string[];
};

type GrowthState = {
  unlocked: boolean;
  shareCount: number;
  inviteCount: number;
  viewCount: number;
  paymentStatus: string;
  conversionPath: string[];
  milestones: { worthBonus: boolean; hiddenIdentity: boolean; mythicalIdentity: boolean };
  full: FullIdentity | null;
};

type PetGrowthExperienceProps = {
  publicId: string;
  name: string;
  type: string;
  city: string;
  photoUrl: string;
  maskedLevel: string;
  maskedWorth: string;
};

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  }
}

export function PetGrowthExperience({ publicId, name, type, city, photoUrl, maskedLevel, maskedWorth }: PetGrowthExperienceProps) {
  const [growth, setGrowth] = useState<GrowthState>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState("");
  const [manualUnlockReady, setManualUnlockReady] = useState(false);

  const refresh = useCallback(async () => {
    const response = await fetch(apiUrl(`/api/pets/${publicId}/growth`), { cache: "no-store" });
    const data = await response.json() as GrowthState & { error?: string };
    if (!response.ok) throw new Error(data.error || "身份读取失败");
    setGrowth(data);
  }, [publicId]);

  useEffect(() => {
    let active = true;
    fetch(apiUrl(`/api/pets/${publicId}/growth`), { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json() as GrowthState & { error?: string };
        if (!response.ok) throw new Error(data.error || "身份读取失败");
        if (active) setGrowth(data);
      })
      .catch(() => {
        if (active) setMessage("身份读取失败，请刷新页面重试");
      });
    return () => { active = false; };
  }, [publicId]);

  function inviteUrl() {
    return `${window.location.origin}/?ref=${publicId}&utm_source=pet_identity&utm_medium=share`;
  }

  async function record(eventType: string, channel: string, metadata: Record<string, unknown> = {}) {
    await fetch(apiUrl("/api/growth-events"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ petId: publicId, eventType, channel, metadata }),
    }).catch(() => undefined);
  }

  async function shareAndUnlock() {
    setBusy(true);
    setMessage("");
    try {
      await record("share_click", "identity-unlock");
      const url = inviteUrl();
      let channel = "unlock-copy-link";
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${name}的AI宠物身份快爆出来了`,
            text: `我家${name}的SSR身份只差最后一步，点开看看你家宠物能不能超过它。`,
            url,
          });
          channel = "unlock-system-share";
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") return;
          if (!await copyText(url)) {
            setManualUnlockReady(true);
            setMessage("当前浏览器限制自动分享，请使用浏览器菜单转发当前页后确认解锁。");
            return;
          }
        }
      } else {
        if (!await copyText(url)) {
          setManualUnlockReady(true);
          setMessage("当前浏览器限制自动复制，请使用浏览器菜单转发当前页后确认解锁。");
          return;
        }
      }
      await completeUnlock(channel);
      setMessage(channel === "unlock-system-share" ? "分享完成，完整SSR身份已解锁" : "邀请链接已复制，完整SSR身份已解锁");
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function completeUnlock(channel: string) {
    const response = await fetch(apiUrl("/api/share"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType: "pet", targetId: publicId, channel }),
    });
    if (!response.ok) throw new Error("解锁失败，请重试");
    await refresh();
    setManualUnlockReady(false);
  }

  async function confirmManualUnlock() {
    setBusy(true);
    setMessage("");
    try {
      await completeUnlock("unlock-manual-confirm");
      setMessage("分享已确认，完整SSR身份已解锁");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "解锁失败，请重试");
    } finally {
      setBusy(false);
    }
  }

  async function copyInvite() {
    if (!await copyText(inviteUrl())) return setMessage("复制受限，请长按浏览器地址栏复制链接");
    await fetch(apiUrl("/api/share"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType: "pet", targetId: publicId, channel: "invite-link-copy" }),
    }).catch(() => undefined);
    await record("invite_link_copy", "invite");
    setCopied("invite");
    setMessage("邀请链接已复制。好友完成建档后，邀请进度才会增加。");
    window.setTimeout(() => setCopied(""), 1800);
  }

  async function savePetId() {
    if (!await copyText(publicId)) return setMessage(`请手动保存 Pet ID：${publicId}`);
    await record("save_pet_id", "identity-result");
    setCopied("id");
    setMessage("Pet ID 已复制保存");
    window.setTimeout(() => setCopied(""), 1800);
  }

  async function copyContent(kind: "xiaohongshu" | "douyin", text: string) {
    if (!await copyText(text)) return setMessage("复制受限，请长按选择文案复制");
    await record("content_copy", kind, { contentType: kind });
    setCopied(kind);
    window.setTimeout(() => setCopied(""), 1800);
  }

  const full = growth?.full;

  return (
    <>
      <section className="growth-core" aria-busy={!growth}>
        <header className="growth-core-heading">
          <span><Sparkles size={15} /> AI身份引擎已完成分析</span>
          <h2>{name}的稀有身份正在显现</h2>
          <p>Pet ID {publicId}</p>
        </header>

        {!growth ? <div className="growth-loading">正在读取身份与排名...</div> : !growth.unlocked || !full ? (
          <div className="growth-locked">
            <div className="growth-teaser-grid">
              <div><span>模糊等级</span><strong>{maskedLevel}</strong><small>完整SSR数值待解锁</small></div>
              <div><span>娱乐身价区间</span><strong>{maskedWorth}</strong><small>精确估值待解锁</small></div>
            </div>
            <div className="growth-lock-list">
              {["SSR完整数值与全球排名", "专属守护兽", "宇宙身份与隐藏故事", "高清朋友圈身份卡"].map((item) => <div key={item}><LockKeyhole size={17} /><span>{item}</span><strong>已锁定</strong></div>)}
            </div>
            <button className="growth-unlock-button" type="button" onClick={shareAndUnlock} disabled={busy}><Share2 size={20} /> {busy ? "正在唤醒SSR身份..." : "分享朋友圈 / 微信群解锁完整SSR身份卡"}</button>
            <p className="growth-rule">完成一次系统分享或复制邀请链接即可解锁，不会自动发布内容。</p>
            {manualUnlockReady && <div className="growth-manual-unlock"><p>请通过浏览器右上角菜单将当前页面发送到朋友圈或微信群。</p><button type="button" onClick={confirmManualUnlock} disabled={busy}><Check size={18} /> 我已完成分享，立即解锁</button></div>}
          </div>
        ) : (
          <div className="growth-revealed">
            <section className="ssr-impact">
              <div><span>SSR稀有指数</span><strong>{full.ssrScore.toFixed(1)}</strong><small>Top {full.topPercent}%</small></div>
              <div className="ssr-tier"><span>身份等级</span><strong>{full.tier}</strong><small>高能稀有身份</small></div>
            </section>
            <section className="worth-impact">
              <span>AI娱乐身价</span><strong>¥{full.netWorth.toLocaleString("zh-CN")}</strong><p>约等于 <b>{full.luxuryComparison}</b> 个 LV 包</p>
            </section>
            <section className="growth-rank-grid">
              <div><Globe2 size={19} /><span>AI全球娱乐榜</span><strong>#{full.globalRank.toLocaleString("zh-CN")}</strong></div>
              <div><Trophy size={19} /><span>{city}城市榜</span><strong>#{full.cityRank}</strong><small>共 {full.cityTotal} 只已建档宠物</small></div>
            </section>
            <section className="growth-comparison"><Trophy size={20} /><div><span>你的宠物 vs 城市Top1</span><strong>{full.cityComparison}</strong></div></section>
            <section className="growth-identity-grid">
              <div><span>宇宙身份</span><strong>{full.cosmicIdentity}</strong></div>
              <div><span>专属守护兽</span><strong>{full.guardian}</strong></div>
            </section>
            <section className={`growth-story ${full.identityStory ? "unlocked" : ""}`}>
              <Award size={22} />
              <div><span>隐藏身份故事</span>{full.identityStory ? <p>{full.identityStory}</p> : <p>再邀请 {Math.max(0, 3 - growth.inviteCount)} 位好友完成建档后解锁。</p>}</div>
            </section>
          </div>
        )}
        {message && <p className="growth-message" role="status">{message}</p>}
      </section>

      {growth?.unlocked && full && (
        <>
          <section className="growth-invite-engine">
            <header><span><UserPlus size={15} /> 邀请升级</span><h2>每位新朋友都让{name}继续进化</h2><p>有效邀请以好友完成新宠建档为准，当前 {growth.inviteCount} 人。</p></header>
            <div className="invite-milestones">
              <div className={growth.milestones.worthBonus ? "done" : ""}><span>1人</span><strong>身价 +10%</strong><small>{growth.milestones.worthBonus ? "已获得" : "待解锁"}</small></div>
              <div className={growth.milestones.hiddenIdentity ? "done" : ""}><span>3人</span><strong>隐藏故事</strong><small>{growth.milestones.hiddenIdentity ? "已获得" : "待解锁"}</small></div>
              <div className={growth.milestones.mythicalIdentity ? "done" : ""}><span>5人</span><strong>神兽身份</strong><small>{growth.milestones.mythicalIdentity ? "已获得" : "待解锁"}</small></div>
            </div>
            <button className="primary-button" type="button" onClick={copyInvite}>{copied === "invite" ? <Check size={19} /> : <UserPlus size={19} />}{copied === "invite" ? "邀请链接已复制" : "复制专属邀请链接"}</button>
          </section>

          <PosterActions
            kind="pet"
            publicId={publicId}
            title={`${full.tier} ${full.cosmicIdentity}`}
            subtitle={`${name} · SSR指数 ${full.ssrScore.toFixed(1)}`}
            photoUrl={photoUrl}
            lines={[`AI娱乐身价 ¥${full.netWorth.toLocaleString("zh-CN")}`, `全球娱乐榜 #${full.globalRank.toLocaleString("zh-CN")}`, `城市排名 #${full.cityRank}`, `守护兽 ${full.guardian}`]}
            shareLabel="分享朋友圈身份图"
          />

          <section className="growth-content-factory">
            <header><span><Sparkles size={15} /> 自动裂变内容</span><h2>两套文案已经为{name}写好</h2><p>每份内容都带回流入口，复制后可直接发布。</p></header>
            <article>
              <div><span>小红书标题</span><button type="button" onClick={() => copyContent("xiaohongshu", `${full.xiaohongshuTitle}\n\n${full.xiaohongshuBody}\n\n${inviteUrl()}`)}>{copied === "xiaohongshu" ? <Check size={17} /> : <Copy size={17} />}{copied === "xiaohongshu" ? "已复制" : "复制整篇"}</button></div>
              <h3>{full.xiaohongshuTitle}</h3><p>{full.xiaohongshuBody}</p>
            </article>
            <article>
              <div><span>抖音短视频脚本</span><button type="button" onClick={() => copyContent("douyin", `${full.douyinScript.join("\n")}\n回流链接：${inviteUrl()}`)}>{copied === "douyin" ? <Check size={17} /> : <Copy size={17} />}{copied === "douyin" ? "已复制" : "复制脚本"}</button></div>
              <ol>{full.douyinScript.map((line) => <li key={line}>{line}</li>)}</ol>
            </article>
          </section>

          <ServiceMatchPanel petId={publicId} petName={name} petType={type} city={city} />
        </>
      )}

      <nav className="growth-sticky-actions" aria-label="身份结果快捷操作">
        <button type="button" onClick={growth?.unlocked ? copyInvite : shareAndUnlock}><Share2 size={18} /><span>{growth?.unlocked ? "继续邀请" : "分享解锁"}</span></button>
        <button type="button" onClick={savePetId}>{copied === "id" ? <Check size={18} /> : <WalletCards size={18} />}<span>{copied === "id" ? "已保存" : "保存ID"}</span></button>
        <Link href="#pet-paid-offer"><Crown size={18} /><span>升级身份</span><ChevronRight size={15} /></Link>
      </nav>
    </>
  );
}
