import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

const statuses = ["待转交", "已通知主人", "已关闭"] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = (await request.json()) as { status?: string };
    if (!body.status || !statuses.includes(body.status as (typeof statuses)[number])) throw new Error("线索状态无效");
    const result = await getDb().prepare("UPDATE lost_clues SET status = ? WHERE public_id = ?").run(body.status, id);
    if (result.changes !== 1) throw new Error("线索不存在");
    return NextResponse.json({ ok: true, status: body.status });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "更新失败" }, { status: 400 });
  }
}
