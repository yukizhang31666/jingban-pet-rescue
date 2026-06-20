import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { recordGrowthEvent } from "@/lib/pet-growth";

const eventTypes = new Set(["content_copy", "save_pet_id", "invite_link_copy", "service_match_click", "referral_landing", "share_click"]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { petId?: string; eventType?: string; channel?: string; metadata?: Record<string, unknown> };
    if (!body.petId || !body.eventType || !eventTypes.has(body.eventType)) throw new Error("增长事件参数无效");
    const db = getDb();
    const pet = await db.prepare("SELECT public_id FROM pets WHERE public_id = ?").get(body.petId);
    if (!pet) throw new Error("宠物身份不存在");
    await recordGrowthEvent(db, body.petId, body.eventType, body.channel || "web", "", body.metadata || {});
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "记录失败" }, { status: 400 });
  }
}
