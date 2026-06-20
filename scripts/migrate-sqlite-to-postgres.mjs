import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { put } from "@vercel/blob";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
if (!databaseUrl) throw new Error("Missing DATABASE_URL");
if (!blobToken) throw new Error("Missing BLOB_READ_WRITE_TOKEN");

if (process.env.API_URL) {
  const health = await fetch(`${process.env.API_URL.replace(/\/$/, "")}/api/health`);
  if (!health.ok) throw new Error("Production schema is not ready. Check /api/health first.");
}

const sqlitePath = path.join(process.cwd(), "data", "jingban.sqlite");
if (!existsSync(sqlitePath)) throw new Error(`Local database not found: ${sqlitePath}`);

const local = new DatabaseSync(sqlitePath);
const remote = postgres(databaseUrl, { max: 1, prepare: false, idle_timeout: 20 });
const tables = ["users", "pets", "lost_reports", "personality_tests", "share_events", "orders", "product_events", "merchant_applications", "growth_events", "pet_referrals", "service_leads", "lost_clues"];
const uploaded = new Map();

async function migratePhoto(value) {
  if (typeof value !== "string" || !value.startsWith("/uploads/")) return value;
  if (uploaded.has(value)) return uploaded.get(value);
  const localPath = path.join(process.cwd(), "public", value.replace(/^\//, ""));
  if (!existsSync(localPath)) return value;
  const extension = path.extname(localPath).toLowerCase();
  const contentTypes = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif" };
  const blob = await put(`legacy${value}`, readFileSync(localPath), { access: "public", token: blobToken, addRandomSuffix: false, contentType: contentTypes[extension] || "application/octet-stream" });
  uploaded.set(value, blob.url);
  return blob.url;
}

for (const table of tables) {
  let rows;
  try { rows = local.prepare(`SELECT * FROM ${table}`).all(); } catch { continue; }
  for (const original of rows) {
    const row = { ...original };
    if ("photo_url" in row) row.photo_url = await migratePhoto(row.photo_url);
    const columns = Object.keys(row);
    const quoted = columns.map((column) => `"${column}"`).join(", ");
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
    await remote.unsafe(`INSERT INTO "${table}" (${quoted}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`, columns.map((column) => row[column]));
  }
  await remote.unsafe(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1), (SELECT COUNT(*) > 0 FROM "${table}"))`);
  console.log(`${table}: ${rows.length}`);
}

await remote.end();
local.close();
console.log("Migration complete");
