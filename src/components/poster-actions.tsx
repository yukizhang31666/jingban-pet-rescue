"use client";

import { Check, Download, Home, Link2, Share2 } from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";
import { useState } from "react";
import { apiUrl } from "@/lib/api-url";

type PosterKind = "pet" | "lost" | "quiz";

type PosterActionsProps = {
  kind: PosterKind;
  publicId: string;
  title: string;
  subtitle: string;
  photoUrl?: string;
  lines: string[];
  showCopyLink?: boolean;
  shareLabel?: string;
};

const colors = {
  pet: { primary: "#0B7D77", accent: "#F3C24B", label: "宠物数字身份证" },
  lost: { primary: "#E65347", accent: "#F3C24B", label: "紧急寻宠启事" },
  quiz: { primary: "#6353B8", accent: "#37A6A0", label: "宠物隐藏身份" },
};

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("海报生成失败")), "image/png", 0.96);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const imageRatio = image.width / image.height;
  const boxRatio = width / height;
  const drawWidth = imageRatio > boxRatio ? height * imageRatio : width;
  const drawHeight = imageRatio > boxRatio ? height : width / imageRatio;
  ctx.drawImage(image, x - (drawWidth - width) / 2, y - (drawHeight - height) / 2, drawWidth, drawHeight);
}

export function PosterActions({ kind, publicId, title, subtitle, photoUrl, lines, showCopyLink = true, shareLabel = "分享海报" }: PosterActionsProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  async function createPoster() {
    const canvas = document.createElement("canvas");
    canvas.width = 750;
    canvas.height = 1100;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("当前浏览器不支持生成海报");

    const theme = colors[kind];
    ctx.fillStyle = "#F7FAF9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = theme.primary;
    ctx.fillRect(0, 0, canvas.width, 92);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 30px sans-serif";
    ctx.fillText("鲸伴科技", 42, 58);
    ctx.font = "500 20px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(theme.label, 708, 56);
    ctx.textAlign = "left";

    if (photoUrl) {
      try {
        const photo = await loadImage(photoUrl);
        drawCover(ctx, photo, 0, 92, 750, 530);
      } catch {
        ctx.fillStyle = "#E7EFED";
        ctx.fillRect(0, 92, 750, 530);
      }
    } else {
      ctx.fillStyle = theme.accent;
      ctx.fillRect(0, 92, 750, 350);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "800 66px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("隐藏身份已解锁", 375, 286);
      ctx.textAlign = "left";
    }

    const contentTop = photoUrl ? 622 : 442;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(30, contentTop - 24, 690, 430);
    ctx.fillStyle = theme.primary;
    ctx.fillRect(30, contentTop - 24, 10, 105);
    ctx.fillStyle = "#17212B";
    ctx.font = "800 44px sans-serif";
    ctx.fillText(title.slice(0, 14), 65, contentTop + 36);
    ctx.fillStyle = "#64717C";
    ctx.font = "500 24px sans-serif";
    ctx.fillText(subtitle.slice(0, 24), 65, contentTop + 76);

    ctx.fillStyle = "#29353E";
    ctx.font = "500 25px sans-serif";
    lines.slice(0, 4).forEach((line, index) => {
      ctx.fillText(line.slice(0, 27), 65, contentTop + 140 + index * 45);
    });

    const pageUrl = window.location.href;
    const qrData = await QRCode.toDataURL(pageUrl, { width: 220, margin: 1, color: { dark: "#17212B", light: "#FFFFFF" } });
    const qr = await loadImage(qrData);
    ctx.drawImage(qr, 505, 835, 170, 170);
    ctx.fillStyle = "#17212B";
    ctx.font = "700 24px sans-serif";
    ctx.fillText("扫码查看详情", 65, 926);
    ctx.fillStyle = "#77838B";
    ctx.font = "500 19px sans-serif";
    ctx.fillText(`编号 ${publicId}`, 65, 963);
    ctx.fillText("jingbantech.com", 65, 996);
    ctx.fillStyle = theme.accent;
    ctx.fillRect(0, 1078, 750, 22);

    return canvasBlob(canvas);
  }

  async function track(channel: string, action: "click" | "success") {
    await fetch(apiUrl("/api/share"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType: kind, targetId: publicId, channel, action }),
    }).catch(() => undefined);
    if (action === "success") {
      window.dispatchEvent(new CustomEvent("jingban:share-success", { detail: { targetType: kind, targetId: publicId, channel } }));
    }
  }

  async function downloadPoster(trackClick = true) {
    setBusy(true);
    setMessage("");
    try {
      if (trackClick) await track("download", "click");
      const blob = await createPoster();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `鲸伴科技-${publicId}.png`;
      link.click();
      URL.revokeObjectURL(url);
      await track("download", "success");
      setMessage("海报已生成，可发送到微信或朋友圈");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "海报生成失败");
    } finally {
      setBusy(false);
    }
  }

  async function sharePoster() {
    setBusy(true);
    setMessage("");
    try {
      await track("system-share", "click");
      const blob = await createPoster();
      const file = new File([blob], `鲸伴科技-${publicId}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title, text: subtitle, files: [file] });
        await track("system-share", "success");
      } else {
        await downloadPoster(false);
        return;
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    try {
      await track("copy-link", "click");
      await navigator.clipboard.writeText(window.location.href);
      await track("copy-link", "success");
      setCopied(true);
      setMessage("分享链接已复制");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setMessage("复制失败，请长按浏览器地址复制");
    }
  }

  return (
    <section className={`poster-tool ${kind}`}>
      <header className="poster-tool-heading">
        <span>分享素材</span>
        <h2>{colors[kind].label}{kind === "quiz" ? "分享海报" : "海报"}</h2>
        <p>分享提示：下载后可长按图片发送到微信、朋友圈或小红书</p>
      </header>
      <div className={`poster-actions ${showCopyLink ? "with-copy" : ""}`}>
        <button className="primary-button" type="button" disabled={busy} onClick={sharePoster}>
          <Share2 size={19} /> {busy ? "正在生成..." : shareLabel}
        </button>
        <button className="secondary-button" type="button" disabled={busy} onClick={() => downloadPoster()}>
          <Download size={19} /> 下载海报
        </button>
        {showCopyLink && (
          <button className="secondary-button copy-link-button" type="button" onClick={copyLink}>
            {copied ? <Check size={19} /> : <Link2 size={19} />} {copied ? "已复制" : "复制分享链接"}
          </button>
        )}
        <Link className="secondary-button home-link-button" href="/"><Home size={19} /> 返回首页</Link>
        {message && <p className="action-message" role="status">{message}</p>}
      </div>
    </section>
  );
}
