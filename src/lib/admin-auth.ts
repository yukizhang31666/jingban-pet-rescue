import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "jingban_admin_session";

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!value || value.length < 24) throw new Error("ADMIN_SESSION_SECRET 至少需要 24 个字符");
  return value;
}

function signature(expires: string) {
  return createHmac("sha256", secret()).update(`jingban-admin:${expires}`).digest("hex");
}

export function verifyAdminPassword(input: string) {
  const configured = process.env.ADMIN_PASSWORD || "";
  if (!configured || !input) return false;
  const left = Buffer.from(input);
  const right = Buffer.from(configured);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function createAdminSession() {
  const expires = String(Date.now() + 12 * 60 * 60 * 1000);
  return { value: `${expires}.${signature(expires)}`, expires: new Date(Number(expires)) };
}

export async function isAdminAuthenticated() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const [expires, supplied] = token.split(".");
  if (!expires || !supplied || Number(expires) <= Date.now()) return false;
  const expected = signature(expires);
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}
