import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { appendConversionStage, recordGrowthEvent, resolvePetId } from "@/lib/pet-growth";

const tableMap = {
  pet: "pets",
  lost: "lost_reports",
  quiz: "personality_tests",
} as const;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      targetType?: keyof typeof tableMap;
      targetId?: string;
      channel?: string;
      action?: "click" | "success";
    };
    if (!body.targetType || !tableMap[body.targetType] || !body.targetId) {
      throw new Error("分享参数无效");
    }

    const db = getDb();
    const target = await db.prepare(`SELECT public_id FROM ${tableMap[body.targetType]} WHERE public_id = ?`).get(body.targetId);
    if (!target) return NextResponse.json({ error: "分享内容不存在" }, { status: 404 });
    const petId = await resolvePetId(db, body.targetType, body.targetId);
    if (body.action === "click") {
      if (petId) {
        await appendConversionStage(db, petId, "share_click");
        await recordGrowthEvent(db, petId, "share_click", body.channel || "poster", "", { targetType: body.targetType, targetId: body.targetId });
      }
      return NextResponse.json({ ok: true, unlocked: false });
    }

    await db.prepare("INSERT INTO share_events (target_type, target_id, channel) VALUES (?, ?, ?)").run(
      body.targetType,
      body.targetId,
      body.channel || "poster",
    );
    await db.prepare(`UPDATE ${tableMap[body.targetType]} SET share_count = share_count + 1 WHERE public_id = ?`).run(
      body.targetId,
    );
    if (petId) {
      if (body.targetType !== "pet") await db.prepare("UPDATE pets SET share_count = share_count + 1 WHERE public_id = ?").run(petId);
      await db.prepare(`UPDATE pets SET unlocked_at = CASE WHEN unlocked_at = '' THEN to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS') ELSE unlocked_at END WHERE public_id = ?`).run(petId);
      await appendConversionStage(db, petId, "share_success");
      await recordGrowthEvent(db, petId, "share_success", body.channel || "poster", "", { targetType: body.targetType, targetId: body.targetId });
    }
    return NextResponse.json({ ok: true, unlocked: Boolean(petId) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "记录失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
