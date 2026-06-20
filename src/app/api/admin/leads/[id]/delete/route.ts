import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const leadId = Number.parseInt(id, 10);
    if (!Number.isInteger(leadId) || leadId <= 0) {
      return NextResponse.json({ error: "请求参数无效" }, { status: 400 });
    }

    const deleted = await getDb().prepare(`
      DELETE FROM lost_leads WHERE id = ? RETURNING id
    `).get<{ id: number }>(leadId);
    if (!deleted) return NextResponse.json({ error: "线索不存在" }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "删除失败，请稍后重试。" }, { status: 400 });
  }
}
