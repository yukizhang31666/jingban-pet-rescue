import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

async function count(query: string) {
  const row = await getDb().prepare(query).get<{ count: number | string }>();
  return Number(row?.count || 0);
}

export async function GET() {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const [users, pets, lost, tests, shares, orders, lostShared, payClicks, confirmedPayments, clues, pageViews, shareClicks, lostShares] = await Promise.all([
    count("SELECT COUNT(*) AS count FROM users"), count("SELECT COUNT(*) AS count FROM pets"),
    count("SELECT COUNT(*) AS count FROM lost_reports"), count("SELECT COUNT(*) AS count FROM personality_tests"),
    count("SELECT COUNT(*) AS count FROM share_events"), count("SELECT COUNT(*) AS count FROM orders"),
    count("SELECT COUNT(*) AS count FROM lost_reports WHERE share_count > 0"), count("SELECT COUNT(*) AS count FROM product_events"),
    count("SELECT COUNT(*) AS count FROM orders WHERE status IN ('已确认', '已交付')"), count("SELECT COUNT(*) AS count FROM lost_clues"),
    count("SELECT COALESCE((SELECT SUM(views) FROM pets), 0) + COALESCE((SELECT SUM(views) FROM lost_reports), 0) AS count"),
    count("SELECT COUNT(*) AS count FROM growth_events WHERE event_type IN ('share_click', 'share_clicked')"),
    count("SELECT COUNT(*) AS count FROM share_events WHERE target_type = 'lost'"),
  ]);
  const funnel = [
    { stage: "pet_created", count: pets }, { stage: "lost_created", count: lost }, { stage: "page_view", count: pageViews },
    { stage: "share_click", count: shareClicks }, { stage: "share_success", count: shares },
    { stage: "clue_submitted", count: clues }, { stage: "pay_click", count: payClicks }, { stage: "pay_success", count: confirmedPayments },
  ];

  return NextResponse.json({
    counts: { users, pets, lost, tests, shares, orders, clues },
    growthEngine: {
      lostShareRate: lost ? lostShared / lost : 0,
      lostShares, payClicks, clues, confirmedPayments, funnel,
      ssrDistribution: await db.prepare(`
        WITH bucketed AS (
          SELECT CASE WHEN ssr_score >= 99 THEN 'SSR' WHEN ssr_score >= 95 THEN 'SR' WHEN ssr_score >= 85 THEN 'S' WHEN ssr_score >= 70 THEN 'A' ELSE 'B' END AS tier
          FROM pets
        )
        SELECT tier, COUNT(*) AS count FROM bucketed GROUP BY tier
      `).all(),
    },
    users: await db.prepare("SELECT * FROM users ORDER BY id DESC LIMIT 50").all(),
    pets: await db.prepare("SELECT * FROM pets ORDER BY id DESC LIMIT 50").all(),
    lost: await db.prepare("SELECT * FROM lost_reports ORDER BY id DESC LIMIT 50").all(),
    tests: await db.prepare("SELECT * FROM personality_tests ORDER BY id DESC LIMIT 50").all(),
    shares: await db.prepare("SELECT * FROM share_events ORDER BY id DESC LIMIT 50").all(),
    orders: await db.prepare("SELECT * FROM orders ORDER BY id DESC LIMIT 50").all(),
    merchants: await db.prepare("SELECT * FROM merchant_applications ORDER BY id DESC LIMIT 50").all(),
    productEvents: await db.prepare("SELECT * FROM product_events ORDER BY id DESC LIMIT 50").all(),
    growthEvents: await db.prepare("SELECT * FROM growth_events ORDER BY id DESC LIMIT 100").all(),
    serviceLeads: await db.prepare("SELECT * FROM service_leads ORDER BY id DESC LIMIT 50").all(),
    lostClues: await db.prepare("SELECT * FROM lost_clues ORDER BY id DESC LIMIT 100").all(),
  });
}
