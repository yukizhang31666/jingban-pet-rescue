import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getDb, makePublicId } from "@/lib/db";
import { appendConversionStage, recordGrowthEvent } from "@/lib/pet-growth";

export const runtime = "nodejs";

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function trustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const expected = new URL(process.env.API_URL || request.url);
    return new URL(origin).host === expected.host;
  } catch {
    return false;
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!trustedOrigin(request)) return NextResponse.json({ error: "请求来源无效" }, { status: 403 });

  try {
    const { id } = await params;
    const body = (await request.json()) as {
      message?: string;
      seenLocation?: string;
      seenTime?: string;
      contact?: string;
      company?: string;
    };
    if (clean(body.company, 100)) return NextResponse.json({ ok: true }, { status: 201 });

    const message = clean(body.message, 600);
    const seenLocation = clean(body.seenLocation, 150);
    const seenTime = clean(body.seenTime, 40);
    const contact = clean(body.contact, 80);
    if (message.length < 5) throw new Error("请尽量详细描述你看到的情况");

    const db = getDb();
    const report = await db.prepare("SELECT public_id, pet_id, pet_name FROM lost_reports WHERE public_id = ?").get<{
      public_id: string; pet_id: string; pet_name: string;
    }>(id);
    if (!report) return NextResponse.json({ error: "寻宠信息不存在" }, { status: 404 });

    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const reporterHash = createHash("sha256")
      .update(`${process.env.ADMIN_SESSION_SECRET || "jingban"}:${forwardedFor}`)
      .digest("hex");
    const recent = await db.prepare(`
      SELECT COUNT(*) AS count FROM lost_clues
      WHERE lost_id = ? AND reporter_hash = ?
        AND created_at::timestamp > (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai') - INTERVAL '1 hour'
    `).get<{ count: number | string }>(id, reporterHash);
    if (Number(recent?.count || 0) >= 5) {
      return NextResponse.json({ error: "提交过于频繁，请稍后再试" }, { status: 429 });
    }

    const publicId = makePublicId("CLUE");
    await db.prepare(`
      INSERT INTO lost_clues
      (public_id, lost_id, pet_id, message, seen_location, seen_time, reporter_contact, reporter_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(publicId, id, report.pet_id, message, seenLocation, seenTime, contact, reporterHash);

    if (report.pet_id) {
      await appendConversionStage(db, report.pet_id, "clue_submitted");
      await recordGrowthEvent(db, report.pet_id, "clue_submitted", "lost-detail", "", { lostId: id, clueId: publicId });
    }

    const webhook = process.env.LOST_CLUE_WEBHOOK_URL?.trim();
    if (webhook) {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "lost_clue_created", clueId: publicId, lostId: id, petId: report.pet_id, petName: report.pet_name }),
        signal: AbortSignal.timeout(4000),
      }).catch(() => undefined);
    }

    return NextResponse.json({ ok: true, clueId: publicId, status: "待转交" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "线索提交失败" }, { status: 400 });
  }
}
