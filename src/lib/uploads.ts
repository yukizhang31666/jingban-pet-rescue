import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";

const extensions: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function saveImage(file: File, folder: "pets" | "lost") {
  if (!extensions[file.type]) {
    throw new Error("请上传 JPG、PNG、WebP 或 GIF 图片");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("图片不能超过 8MB");
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) throw new Error("图片存储尚未配置，请联系管理员");
  const fileName = `${randomUUID()}${extensions[file.type]}`;
  const blob = await put(`uploads/${folder}/${fileName}`, file, {
    access: "public",
    token,
    addRandomSuffix: false,
    contentType: file.type,
    cacheControlMaxAge: 31_536_000,
  });
  return blob.url;
}

export function requiredText(value: FormDataEntryValue | null, label: string) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(`请填写${label}`);
  return text;
}
