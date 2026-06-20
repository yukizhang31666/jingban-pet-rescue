import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await getDb().prepare("SELECT 1 AS ok").get();
    await getDb().prepare("SELECT COUNT(*) AS count FROM lost_clues").get();
    return NextResponse.json({
      ok: true,
      database: "connected",
      blob: process.env.BLOB_READ_WRITE_TOKEN ? "configured" : "missing",
      apiUrl: process.env.API_URL ? "configured" : "missing",
      clueRelay: process.env.LOST_CLUE_WEBHOOK_URL ? "webhook-and-admin" : "admin-queue",
      paymentQr: process.env.WECHAT_PAYMENT_QR_URL ? "configured" : "placeholder",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ ok: false, database: "error", error: error instanceof Error ? error.message : "health check failed" }, { status: 503 });
  }
}
