"use client";

import { Check, Copy, Link2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const siteUrl = "https://jingbantech.com";

export function InviteLinkGenerator() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState("");
  const candidate = input.trim().slice(0, 50);
  const isValid = candidate.length > 0 && /^[A-Za-z0-9_-]+$/.test(candidate);
  const referralCode = isValid ? candidate : "";
  const refQuery = referralCode ? `?ref=${encodeURIComponent(referralCode)}` : "";
  const publishUrl = `${siteUrl}/lost/new${refQuery}`;
  const links = referralCode ? [
    { label: "首页分享链接", url: `${siteUrl}/${refQuery}` },
    { label: "发布寻宠链接", url: publishUrl },
    { label: "全国寻宠链接", url: `${siteUrl}/lost${refQuery}` },
    { label: "深圳城市频道链接", url: `${siteUrl}/city/shenzhen${refQuery}` },
  ] : [];
  const shareText = `我在用鲸伴宠物安全护照和公益寻宠平台。宠物走失时，可以快速发布寻宠信息、生成扩散文案，并通过详情页收集线索。

如果你或朋友家宠物需要，可以先收藏这个入口：
${publishUrl}

每一次转发，都可能让一只宠物离回家更近。`;

  async function copyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
    } catch {
      setCopied("");
    }
  }

  return (
    <section className="identity-section" style={{ margin: 0 }}>
      <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 800 }} htmlFor="invite-code">
        你的传播代号
        <input
          id="invite-code"
          value={input}
          maxLength={50}
          placeholder="例如：yuki、nanshan_pet、shenzhen01"
          onChange={(event) => { setInput(event.target.value); setCopied(""); }}
          style={{ minHeight: 46, padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 6 }}
        />
      </label>
      {input.trim() && !isValid && <p className="form-error" role="alert">请使用字母、数字、下划线或中横线</p>}
      {!input.trim() && <p style={{ color: "var(--muted)", fontSize: 11 }}>输入有效代号后，将自动生成四类分享链接。</p>}

      {links.length > 0 && (
        <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
          {links.map((item) => (
            <article key={item.label} style={{ padding: 13, background: "#f7faf9", border: "1px solid var(--line)", borderRadius: 7 }}>
              <strong style={{ display: "block", marginBottom: 7, fontSize: 12 }}>{item.label}</strong>
              <code style={{ display: "block", color: "#46535c", fontSize: 11, lineHeight: 1.55, overflowWrap: "anywhere" }}>{item.url}</code>
              <button className="secondary-button" style={{ width: "100%", marginTop: 10 }} type="button" onClick={() => copyText(item.label, item.url)}>
                {copied === item.label ? <Check size={17} /> : <Copy size={17} />} {copied === item.label ? "已复制" : "复制链接"}
              </button>
            </article>
          ))}
        </div>
      )}

      <section style={{ marginTop: 20 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 19 }}>可复制分享文案</h2>
        <p style={{ padding: 13, margin: 0, color: "#46535c", background: "#f7faf9", border: "1px solid var(--line)", borderRadius: 7, fontSize: 12, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{shareText}</p>
        <button className="primary-button" style={{ width: "100%", marginTop: 10 }} type="button" onClick={() => copyText("share-text", shareText)}>
          {copied === "share-text" ? <Check size={17} /> : <Copy size={17} />} {copied === "share-text" ? "已复制" : "复制文案"}
        </button>
      </section>

      <aside style={{ marginTop: 20, padding: 13, color: "#665711", background: "#fff7d6", borderLeft: "3px solid var(--yellow)", fontSize: 11, lineHeight: 1.65 }}>
        说明：本功能用于公益传播来源记录，不涉及现金返佣，不构成代理、分销或收益承诺。
      </aside>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 }}>
        <Link className="primary-button" href={referralCode ? `/lost/new?ref=${encodeURIComponent(referralCode)}` : "/lost/new"}><Link2 size={17} /> 发布寻宠信息</Link>
        <Link className="secondary-button" href={referralCode ? `/lost?ref=${encodeURIComponent(referralCode)}` : "/lost"}>查看全国寻宠</Link>
      </div>
    </section>
  );
}
