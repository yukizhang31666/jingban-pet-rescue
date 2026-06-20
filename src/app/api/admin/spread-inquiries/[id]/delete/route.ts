import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const inquiryId = Number.parseInt(id, 10);
    if (!Number.isInteger(inquiryId) || inquiryId <= 0) {
      return NextResponse.json({ error: "请求参数无效" }, { status: 400 });
    }

    const deleted = await getDb().prepare(`
      DELETE FROM spread_inquiries WHERE id = ? RETURNING id
    `).get<{ id: number }>(inquiryId);
    if (!deleted) return NextResponse.json({ error: "咨询不存在" }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "删除失败，请稍后重试。" }, { status: 400 });
  }
}
