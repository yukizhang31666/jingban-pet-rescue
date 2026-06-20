import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      seenLocation?: string;
      seenTime?: string;
      description?: string;
      contact?: string;
      isAnonymous?: boolean;
    };
    const seenLocation = clean(body.seenLocation, 150);
    const seenTime = clean(body.seenTime, 40);
    const description = clean(body.description, 600);
    const contact = clean(body.contact, 80);
    if (!seenLocation || !seenTime || !description) throw new Error("线索信息不完整");

    const db = getDb();
    const report = await db.prepare("SELECT public_id FROM lost_reports WHERE public_id = ?").get<{ public_id: string }>(id);
    if (!report) return NextResponse.json({ error: "寻宠信息不存在" }, { status: 404 });

    await db.prepare(`
      INSERT INTO lost_leads
      (lost_report_id, seen_location, seen_time, description, contact, is_anonymous)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, seenLocation, seenTime, description, contact, body.isAnonymous === false ? 0 : 1);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "提交失败，请稍后重试。" }, { status: 400 });
  }
}
