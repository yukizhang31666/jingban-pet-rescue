import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

const statuses = ["待审核", "已入驻", "已拒绝"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = (await request.json()) as { status?: string };
  if (!body.status || !statuses.includes(body.status)) return NextResponse.json({ error: "状态无效" }, { status: 400 });
  const result = await getDb().prepare("UPDATE merchant_applications SET status = ? WHERE id = ?").run(body.status, Number(id));
  if (result.changes !== 1) return NextResponse.json({ error: "申请不存在" }, { status: 404 });
  return NextResponse.json({ ok: true, status: body.status });
}
