import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { appendConversionStage, recordGrowthEvent } from "@/lib/pet-growth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { petId?: string; serviceType?: string; city?: string; contact?: string; aiReason?: string };
    const petId = body.petId?.trim();
    const serviceType = body.serviceType?.trim();
    const city = body.city?.trim();
    const contact = body.contact?.trim();
    const aiReason = body.aiReason?.trim();
    if (!petId || !serviceType || !city || !contact || !aiReason) throw new Error("请完整填写撮合信息");
    const db = getDb();
    if (!await db.prepare("SELECT public_id FROM pets WHERE public_id = ?").get(petId)) throw new Error("宠物身份不存在");
    await db.prepare(`
      INSERT INTO service_leads (pet_id, service_type, city, contact, ai_reason)
      VALUES (?, ?, ?, ?, ?)
    `).run(petId, serviceType, city, contact, aiReason);
    await appendConversionStage(db, petId, "service_lead_submitted");
    await recordGrowthEvent(db, petId, "service_lead_submitted", serviceType, "", { city });
    return NextResponse.json({ ok: true, status: "待匹配" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "提交失败" }, { status: 400 });
  }
}
