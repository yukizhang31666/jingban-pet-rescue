"use client";

import { Check, CircleCheck, Crown, LoaderCircle, QrCode, X } from "lucide-react";
import { useState } from "react";
import { apiUrl } from "@/lib/api-url";

type ProductType = "advanced_identity_card" | "lost_spread_package" | "quiz_full_report";

type ProductOfferProps = {
  title: string;
  price: string;
  buttonLabel: string;
  benefits: string[];
  productType: ProductType;
  targetType: "pet" | "lost" | "quiz";
  targetId: string;
  tone?: "teal" | "coral" | "violet";
  compact?: boolean;
};

export function ProductOffer({ title, price, buttonLabel, benefits, productType, targetType, targetId, tone = "teal", compact = false }: ProductOfferProps) {
  const paymentQrUrl = process.env.NEXT_PUBLIC_WECHAT_PAYMENT_QR_URL || "";
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<{ orderNo: string; status: string }>();

  function openPayment() {
    setOpen(true);
    setError("");
    fetch(apiUrl("/api/product-events"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productType, targetType, targetId }),
    }).catch(() => undefined);
  }

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(apiUrl("/api/orders"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, productType, targetType, targetPublicId: targetId }),
      });
      const data = await response.json() as { orderNo?: string; status?: string; error?: string };
      if (!response.ok || !data.orderNo || !data.status) throw new Error(data.error || "订单提交失败");
      setOrder({ orderNo: data.orderNo, status: data.status });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "订单提交失败，请稍后重试");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className={`product-offer ${tone} ${compact ? "compact" : ""}`}>
        <header><span><Crown size={15} /> 人工收款验证</span><h2>{title}</h2></header>
        <ul>{benefits.map((benefit) => <li key={benefit}><Check size={15} /> {benefit}</li>)}</ul>
        <button className="paid-action-button" type="button" onClick={openPayment}><Crown size={18} /> {buttonLabel}</button>
        <small>点击后查看人工付款说明，不会自动扣款</small>
      </section>

      {open && (
        <div className="payment-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
          <section className="payment-dialog" role="dialog" aria-modal="true" aria-labelledby={`payment-${productType}`}>
            <button className="payment-close" type="button" aria-label="关闭付款弹窗" onClick={() => setOpen(false)}><X size={21} /></button>
            {order ? (
              <div className="payment-success">
                <CircleCheck size={48} />
                <h2>订单已提交，等待人工确认</h2>
                <p>订单号：{order.orderNo}</p>
                <span>付款状态：{order.status}</span>
                <small>我们会通过你填写的微信号或手机号核对付款并安排交付。</small>
                <button className="primary-button" type="button" onClick={() => setOpen(false)}>完成</button>
              </div>
            ) : (
              <>
                <header className="payment-heading">
                  <span>人工收款 · 第一版验证</span>
                  <h2 id={`payment-${productType}`}>{title}</h2>
                  <strong>{price}</strong>
                </header>
                {paymentQrUrl ? <div className="payment-qr-image">
                  {/* The operator controls this external URL through a production environment variable. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={paymentQrUrl} alt="鲸伴科技微信收款码" />
                  <span>请核对收款方后付款</span>
                </div> : <div className="payment-qr-placeholder" aria-label="微信收款码未配置"><QrCode size={72} /><strong>微信收款码待配置</strong><span>请联系管理员完成付款</span></div>}
                <ol className="payment-instructions">
                  <li>使用微信扫描收款码，支付上方所示金额。</li>
                  <li>付款备注填写宠物ID：<strong>{targetId}</strong></li>
                  <li>付款后填写联系方式并提交订单，等待人工确认。</li>
                </ol>
                <form className="payment-form" onSubmit={submitOrder}>
                  <label htmlFor={`payment-contact-${productType}`}>微信号 / 手机号</label>
                  <input id={`payment-contact-${productType}`} value={contact} onChange={(event) => setContact(event.target.value)} placeholder="用于核对付款与交付" maxLength={50} required />
                  {error && <p role="alert">{error}</p>}
                  <button className="paid-action-button" type="submit" disabled={busy}>
                    {busy ? <LoaderCircle className="spin" size={18} /> : <CircleCheck size={18} />}
                    {busy ? "正在提交订单..." : "我已付款，提交订单"}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
