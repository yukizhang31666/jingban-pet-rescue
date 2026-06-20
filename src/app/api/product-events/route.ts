import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { appendConversionStage, recordGrowthEvent, resolvePetId } from "@/lib/pet-growth";

const products = {
  advanced_identity_card: 2900,
  lost_spread_package: 9900,
  quiz_full_report: 990,
} as const;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      productType?: keyof typeof products;
      targetType?: string;
      targetId?: string;
    };
    if (!body.productType || !(body.productType in products) || !body.targetType || !body.targetId) {
      throw new Error("产品参数无效");
    }

    const db = getDb();
    await db.prepare(`
      INSERT INTO product_events (product_type, target_type, target_id, amount)
      VALUES (?, ?, ?, ?)
    `).run(body.productType, body.targetType, body.targetId, products[body.productType]);
    const petId = await resolvePetId(db, body.targetType, body.targetId);
    if (petId) {
      await appendConversionStage(db, petId, "pay_click");
      await recordGrowthEvent(db, petId, "pay_click", body.productType, "", { amount: products[body.productType], targetId: body.targetId });
    }

    return NextResponse.json({ ok: true, amount: products[body.productType] }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "提交失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
