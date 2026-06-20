import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { appendConversionStage, recordGrowthEvent, resolvePetId } from "@/lib/pet-growth";

const statuses = ["待确认", "已确认", "已交付"] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ orderNo: string }> }) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { orderNo } = await params;
    const body = (await request.json()) as { status?: string };
    if (!body.status || !statuses.includes(body.status as (typeof statuses)[number])) throw new Error("订单状态无效");
    const db = getDb();
    const order = await db.prepare("SELECT target_type, target_public_id, product_type FROM orders WHERE order_no = ?").get<{ target_type: string; target_public_id: string; product_type: string }>(orderNo);
    if (!order) throw new Error("订单不存在");
    const result = await db.prepare("UPDATE orders SET status = ? WHERE order_no = ?").run(body.status, orderNo);
    if (result.changes !== 1) throw new Error("订单不存在");
    const petId = await resolvePetId(db, order.target_type, order.target_public_id);
    if (petId && body.status === "已确认") {
      await db.prepare("UPDATE pets SET payment_status = '已付费' WHERE public_id = ?").run(petId);
      await appendConversionStage(db, petId, "pay_success");
      await recordGrowthEvent(db, petId, "pay_success", order.product_type, "", { orderNo, targetId: order.target_public_id });
    }
    return NextResponse.json({ ok: true, status: body.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
