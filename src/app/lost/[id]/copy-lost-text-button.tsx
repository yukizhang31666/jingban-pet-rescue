"use client";

import { Copy } from "lucide-react";
import { useState } from "react";

export function CopyLostTextButton({
  text,
  label = "复制寻宠文案",
  successMessage = "已复制，可粘贴到微信、小红书、朋友圈扩散。",
}: {
  text: string;
  label?: string;
  successMessage?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <>
      <button
        className="primary-button"
        style={{ width: "100%", marginTop: 12 }}
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          setCopied(true);
        }}
      >
        <Copy size={18} /> {label}
      </button>
      {copied && <p className="action-message" role="status">{successMessage}</p>}
    </>
  );
}
