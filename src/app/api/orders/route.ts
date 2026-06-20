import { NextResponse } from "next/server";
import { getDb, makePublicId } from "@/lib/db";
import { appendConversionStage, recordGrowthEvent, resolvePetId } from "@/lib/pet-growth";

const products = {
  advanced_identity_card: { amount: 2900, targetType: "pet" },
  quiz_full_report: { amount: 990, targetType: "quiz" },
  lost_spread_package: { amount: 9900, targetType: "lost" },
} as const;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      contact?: string;
      productType?: keyof typeof products;
      targetType?: string;
      targetPublicId?: string;
    };
    const contact = body.contact?.trim();
    const targetPublicId = body.targetPublicId?.trim();
    if (!contact || !body.productType || !(body.productType in products) || !targetPublicId) {
      throw new Error("订单参数不完整");
    }
    const product = products[body.productType];
    if (body.targetType !== product.targetType) throw new Error("订单类型不匹配");

    const orderNo = `${makePublicId("JB")}-${Date.now()}`;
    const db = getDb();
    await db.prepare(`
      INSERT INTO orders
      (order_no, user_contact, product_type, target_type, target_public_id, amount, status)
      VALUES (?, ?, ?, ?, ?, ?, '待确认')
    `).run(orderNo, contact, body.productType, product.targetType, targetPublicId, product.amount);
    const petId = await resolvePetId(db, product.targetType, targetPublicId);
    if (petId) {
      await appendConversionStage(db, petId, "order_submitted");
      await recordGrowthEvent(db, petId, "order_submitted", body.productType, "", { orderNo, amount: product.amount, targetId: targetPublicId });
    }

    return NextResponse.json({ orderNo, status: "待确认", amount: product.amount }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "创建订单失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
