"use client";

import { Camera, ImagePlus } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useState } from "react";

export function PhotoUploader({ label = "上传宠物照片" }: { label?: string }) {
  const id = useId();
  const [preview, setPreview] = useState<string>();

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  return (
    <div className="field-group">
      <label className="field-label" htmlFor={id}>{label}<span> *</span></label>
      <label className={`photo-uploader ${preview ? "has-photo" : ""}`} htmlFor={id}>
        {preview ? (
          <>
            <Image src={preview} alt="宠物照片预览" fill unoptimized sizes="100vw" />
            <span className="change-photo"><Camera size={17} /> 更换照片</span>
          </>
        ) : (
          <span className="photo-placeholder">
            <ImagePlus size={30} />
            <strong>选择一张清晰正脸照</strong>
            <small>JPG / PNG / WebP，最大 8MB</small>
          </span>
        )}
      </label>
      <input
        className="visually-hidden"
        id={id}
        type="file"
        name="photo"
        accept="image/jpeg,image/png,image/webp,image/gif"
        required
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (preview) URL.revokeObjectURL(preview);
          setPreview(file ? URL.createObjectURL(file) : undefined);
        }}
      />
    </div>
  );
}
