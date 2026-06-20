import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

const allowedStatuses = ["new", "contacted", "converted", "closed"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const inquiryId = Number.parseInt(id, 10);
    const body = (await request.json()) as { status?: string };
    if (!Number.isInteger(inquiryId) || inquiryId <= 0 || !body.status || !allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: "请求参数无效" }, { status: 400 });
    }

    const updated = await getDb().prepare(`
      UPDATE spread_inquiries SET status = ? WHERE id = ? RETURNING id
    `).get<{ id: number }>(body.status, inquiryId);
    if (!updated) return NextResponse.json({ error: "咨询不存在" }, { status: 404 });

    return NextResponse.json({ ok: true, status: body.status });
  } catch {
    return NextResponse.json({ error: "状态更新失败，请稍后重试。" }, { status: 400 });
  }
}
