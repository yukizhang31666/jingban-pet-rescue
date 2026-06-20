"use client";

import QRCode from "qrcode";
import Image from "next/image";
import { useEffect, useState } from "react";

export function QrCode({ label = "扫码查看完整页面" }: { label?: string }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    QRCode.toDataURL(window.location.href, {
      width: 240,
      margin: 1,
      color: { dark: "#17212B", light: "#FFFFFF" },
      errorCorrectionLevel: "M",
    }).then(setSrc);
  }, []);

  return (
    <div className="qr-block">
      {src ? <Image src={src} alt="页面二维码" width={112} height={112} unoptimized /> : <div className="qr-loading" />}
      <span>{label}</span>
    </div>
  );
}
