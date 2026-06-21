import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

const allowedStatuses = ["searching", "lead", "found", "closed"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { status?: string };
    if (!body.status || !allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: "状态无效" }, { status: 400 });
    }

    const updated = await getDb().prepare(`
      UPDATE lost_reports SET status = ? WHERE public_id = ? RETURNING public_id
    `).get<{ public_id: string }>(body.status, id);
    if (!updated) return NextResponse.json({ error: "寻宠信息不存在" }, { status: 404 });

    return NextResponse.json({ ok: true, status: body.status });
  } catch {
    return NextResponse.json({ error: "状态更新失败，请稍后重试。" }, { status: 400 });
  }
}
