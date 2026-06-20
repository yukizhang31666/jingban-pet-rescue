import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { lostReportId?: string; contact?: string; note?: string };
    const lostReportId = clean(body.lostReportId, 80);
    const contact = clean(body.contact, 80);
    const note = clean(body.note, 500);
    if (!lostReportId || !contact) throw new Error("咨询信息不完整");

    const db = getDb();
    const report = await db.prepare("SELECT public_id FROM lost_reports WHERE public_id = ?").get<{ public_id: string }>(lostReportId);
    if (!report) return NextResponse.json({ error: "寻宠信息不存在" }, { status: 404 });

    await db.prepare(`
      INSERT INTO spread_inquiries (lost_report_id, contact, note)
      VALUES (?, ?, ?)
    `).run(lostReportId, contact, note);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "提交失败，请稍后重试。" }, { status: 400 });
  }
}
