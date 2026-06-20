import { randomBytes } from "node:crypto";
import postgres from "postgres";
import { derivePetIdentity } from "@/lib/pet-growth";

type SqlClient = ReturnType<typeof postgres>;
type QueryRow = Record<string, unknown>;

declare global {
  var jingbanSql: SqlClient | undefined;
  var jingbanSchemaPromise: Promise<void> | undefined;
}

function databaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("缺少 DATABASE_URL，无法连接生产数据库");
  return url;
}

function client() {
  if (!global.jingbanSql) {
    global.jingbanSql = postgres(databaseUrl(), {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 15,
      prepare: false,
      connection: { application_name: "jingban-pet-id" },
    });
  }
  return global.jingbanSql;
}

function placeholders(query: string) {
  let index = 0;
  return query.replace(/\?/g, () => `$${++index}`);
}

async function ensureSchema() {
  if (!global.jingbanSchemaPromise) global.jingbanSchemaPromise = createSchema();
  return global.jingbanSchemaPromise;
}

async function createSchema() {
  const sql = client();
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      contact TEXT NOT NULL UNIQUE,
      city TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS'))
    );

    CREATE TABLE IF NOT EXISTS pets (
      id BIGSERIAL PRIMARY KEY,
      public_id TEXT NOT NULL UNIQUE,
      user_id BIGINT REFERENCES users(id),
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      breed TEXT NOT NULL,
      age TEXT NOT NULL,
      city TEXT NOT NULL,
      owner_contact TEXT NOT NULL,
      photo_url TEXT NOT NULL,
      gender TEXT NOT NULL DEFAULT '未知',
      features TEXT NOT NULL DEFAULT '',
      sterilized TEXT NOT NULL DEFAULT '未知',
      backup_contact TEXT NOT NULL DEFAULT '',
      allow_public_stats INTEGER NOT NULL DEFAULT 0,
      collar_chip TEXT NOT NULL DEFAULT '未填写',
      allow_public_display INTEGER NOT NULL DEFAULT 0,
      edit_token TEXT NOT NULL DEFAULT '',
      ssr_score DOUBLE PRECISION NOT NULL DEFAULT 0,
      global_rank INTEGER NOT NULL DEFAULT 0,
      net_worth INTEGER NOT NULL DEFAULT 0,
      guardian TEXT NOT NULL DEFAULT '',
      cosmic_identity TEXT NOT NULL DEFAULT '',
      identity_story TEXT NOT NULL DEFAULT '',
      invite_count INTEGER NOT NULL DEFAULT 0,
      payment_status TEXT NOT NULL DEFAULT '未付费',
      conversion_path TEXT NOT NULL DEFAULT '[]',
      unlocked_at TEXT NOT NULL DEFAULT '',
      referrer_pet_id TEXT NOT NULL DEFAULT '',
      views INTEGER NOT NULL DEFAULT 0,
      share_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS'))
    );

    CREATE TABLE IF NOT EXISTS lost_reports (
      id BIGSERIAL PRIMARY KEY,
      public_id TEXT NOT NULL UNIQUE,
      user_id BIGINT REFERENCES users(id),
      pet_name TEXT NOT NULL,
      photo_url TEXT NOT NULL,
      province TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      lost_location TEXT NOT NULL,
      lost_time TEXT NOT NULL,
      contact TEXT NOT NULL,
      features TEXT NOT NULL,
      reward INTEGER NOT NULL DEFAULT 0,
      urgency TEXT NOT NULL DEFAULT '普通',
      last_seen_location TEXT NOT NULL DEFAULT '',
      contact_public INTEGER NOT NULL DEFAULT 1,
      wearing_items TEXT NOT NULL DEFAULT '',
      temperament TEXT NOT NULL DEFAULT '',
      pet_id TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT '寻找中',
      views INTEGER NOT NULL DEFAULT 0,
      share_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS'))
    );

    ALTER TABLE lost_reports ADD COLUMN IF NOT EXISTS province TEXT NOT NULL DEFAULT '';
    ALTER TABLE lost_reports ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT '';

    CREATE TABLE IF NOT EXISTS personality_tests (
      id BIGSERIAL PRIMARY KEY,
      public_id TEXT NOT NULL UNIQUE,
      pet_name TEXT NOT NULL,
      answers_json TEXT NOT NULL,
      personality TEXT NOT NULL,
      career TEXT NOT NULL,
      rarity TEXT NOT NULL,
      guardian TEXT NOT NULL,
      net_worth TEXT NOT NULL,
      match_score INTEGER NOT NULL,
      pet_id TEXT NOT NULL DEFAULT '',
      share_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS'))
    );

    CREATE TABLE IF NOT EXISTS share_events (
      id BIGSERIAL PRIMARY KEY,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      channel TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id BIGSERIAL PRIMARY KEY,
      order_no TEXT NOT NULL UNIQUE,
      user_contact TEXT NOT NULL,
      product_type TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_public_id TEXT NOT NULL,
      amount INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT '待确认',
      created_at TEXT NOT NULL DEFAULT (to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS'))
    );

    CREATE TABLE IF NOT EXISTS product_events (
      id BIGSERIAL PRIMARY KEY,
      product_type TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS'))
    );

    CREATE TABLE IF NOT EXISTS merchant_applications (
      id BIGSERIAL PRIMARY KEY,
      business_name TEXT NOT NULL,
      service_type TEXT NOT NULL,
      city TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_info TEXT NOT NULL,
      services TEXT NOT NULL,
      accepts_commission INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT '待审核',
      created_at TEXT NOT NULL DEFAULT (to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS'))
    );

    CREATE TABLE IF NOT EXISTS growth_events (
      id BIGSERIAL PRIMARY KEY,
      pet_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      channel TEXT NOT NULL DEFAULT 'web',
      source_pet_id TEXT NOT NULL DEFAULT '',
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS'))
    );

    CREATE TABLE IF NOT EXISTS pet_referrals (
      id BIGSERIAL PRIMARY KEY,
      referrer_pet_id TEXT NOT NULL,
      invitee_pet_id TEXT NOT NULL UNIQUE,
      visitor_token TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS')),
      UNIQUE(referrer_pet_id, visitor_token)
    );

    CREATE TABLE IF NOT EXISTS service_leads (
      id BIGSERIAL PRIMARY KEY,
      pet_id TEXT NOT NULL,
      service_type TEXT NOT NULL,
      city TEXT NOT NULL,
      contact TEXT NOT NULL,
      ai_reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT '待匹配',
      created_at TEXT NOT NULL DEFAULT (to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS'))
    );

    CREATE TABLE IF NOT EXISTS lost_clues (
      id BIGSERIAL PRIMARY KEY,
      public_id TEXT NOT NULL UNIQUE,
      lost_id TEXT NOT NULL,
      pet_id TEXT NOT NULL,
      message TEXT NOT NULL,
      seen_location TEXT NOT NULL DEFAULT '',
      seen_time TEXT NOT NULL DEFAULT '',
      reporter_contact TEXT NOT NULL DEFAULT '',
      reporter_hash TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT '待转交',
      created_at TEXT NOT NULL DEFAULT (to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS'))
    );

    CREATE TABLE IF NOT EXISTS lost_leads (
      id BIGSERIAL PRIMARY KEY,
      lost_report_id TEXT NOT NULL REFERENCES lost_reports(public_id),
      seen_location TEXT NOT NULL,
      seen_time TEXT NOT NULL,
      description TEXT NOT NULL,
      contact TEXT NOT NULL DEFAULT '',
      is_anonymous INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS'))
    );

    ALTER TABLE lost_leads ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';

    CREATE TABLE IF NOT EXISTS spread_inquiries (
      id BIGSERIAL PRIMARY KEY,
      lost_report_id TEXT NOT NULL REFERENCES lost_reports(public_id),
      contact TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS'))
    );

    ALTER TABLE spread_inquiries ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';

    CREATE INDEX IF NOT EXISTS idx_pets_created_at ON pets(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_lost_created_at ON lost_reports(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_tests_created_at ON personality_tests(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_growth_pet ON growth_events(pet_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_growth_event ON growth_events(event_type, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON pet_referrals(referrer_pet_id);
    CREATE INDEX IF NOT EXISTS idx_service_leads_pet ON service_leads(pet_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_lost_clues_lost ON lost_clues(lost_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_lost_clues_pet ON lost_clues(pet_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_lost_clues_rate ON lost_clues(lost_id, reporter_hash, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_lost_leads_report ON lost_leads(lost_report_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_spread_inquiries_created ON spread_inquiries(created_at DESC);
  `);

  const pets = await sql<{ public_id: string; name: string; type: string; ssr_score: number; guardian: string; conversion_path: string; share_count: number }[]>`
    SELECT public_id, name, type, ssr_score, guardian, conversion_path, share_count FROM pets
  `;
  for (const pet of pets) {
    const profile = derivePetIdentity(pet.public_id, pet.name, pet.type);
    let path: string[] = [];
    try { path = JSON.parse(pet.conversion_path || "[]") as string[]; } catch { path = []; }
    if (!path.includes("pet_created")) path.unshift("pet_created");
    if (pet.share_count > 0 && !path.includes("share_success")) path.push("share_success");
    await sql`
      UPDATE pets SET ssr_score = ${profile.ssrScore}, global_rank = ${profile.globalRank}, net_worth = ${profile.netWorth},
        guardian = ${profile.guardian}, cosmic_identity = ${profile.cosmicIdentity}, identity_story = ${profile.identityStory},
        conversion_path = ${JSON.stringify(path)}
      WHERE public_id = ${pet.public_id}
    `;
  }

  await sql`UPDATE lost_reports SET contact_public = 0 WHERE contact_public <> 0`;
  const orphanedReports = await sql<{
    public_id: string; user_id: number; pet_name: string; photo_url: string; lost_location: string;
    contact: string; features: string;
  }[]>`
    SELECT public_id, user_id, pet_name, photo_url, lost_location, contact, features
    FROM lost_reports WHERE pet_id = ''
  `;
  for (const report of orphanedReports) {
    const [matchedPet] = await sql<{ public_id: string; conversion_path: string }[]>`
      SELECT public_id, conversion_path FROM pets
      WHERE user_id = ${report.user_id} AND name = ${report.pet_name}
      ORDER BY id DESC LIMIT 1
    `;
    let petId = matchedPet?.public_id || "";
    if (!petId) {
      petId = makePublicId("JB");
      const profile = derivePetIdentity(petId, report.pet_name, "宠物");
      await sql`
        INSERT INTO pets
        (public_id, user_id, name, type, breed, age, city, owner_contact, photo_url, gender, features, sterilized,
         allow_public_stats, collar_chip, allow_public_display, edit_token, ssr_score, global_rank, net_worth, guardian,
         cosmic_identity, identity_story, conversion_path)
        VALUES (${petId}, ${report.user_id}, ${report.pet_name}, '宠物', '待补充', '待补充', ${report.lost_location.slice(0, 50)},
          ${report.contact}, ${report.photo_url}, '未知', ${report.features}, '未知', 0, '未填写', 0, ${makeEditToken()},
          ${profile.ssrScore}, ${profile.globalRank}, ${profile.netWorth}, ${profile.guardian}, ${profile.cosmicIdentity},
          ${profile.identityStory}, ${JSON.stringify(["pet_created", "lost_created"])})
      `;
      await sql`
        INSERT INTO growth_events (pet_id, event_type, channel, metadata_json)
        VALUES (${petId}, 'pet_created', 'lost-backfill', '{}')
      `;
    } else {
      let path: string[] = [];
      try { path = JSON.parse(matchedPet.conversion_path || "[]") as string[]; } catch { path = []; }
      if (!path.includes("lost_created")) {
        path.push("lost_created");
        await sql`UPDATE pets SET conversion_path = ${JSON.stringify(path)} WHERE public_id = ${petId}`;
      }
    }
    await sql`UPDATE lost_reports SET pet_id = ${petId} WHERE public_id = ${report.public_id}`;
    await sql`
      INSERT INTO growth_events (pet_id, event_type, channel, metadata_json)
      SELECT ${petId}, 'lost_created', 'lost-backfill', ${JSON.stringify({ lostId: report.public_id })}
      WHERE NOT EXISTS (
        SELECT 1 FROM growth_events
        WHERE pet_id = ${petId} AND event_type = 'lost_created' AND metadata_json LIKE ${`%${report.public_id}%`}
      )
    `;
  }
}

class Statement {
  constructor(private readonly query: string) {}

  async all<T = QueryRow>(...params: unknown[]) {
    await ensureSchema();
    return await client().unsafe<QueryRow[]>(placeholders(this.query), params as never[]) as T[];
  }

  async get<T = QueryRow>(...params: unknown[]) {
    const rows = await this.all<T>(...params);
    return rows[0] as T | undefined;
  }

  async run(...params: unknown[]) {
    await ensureSchema();
    const result = await client().unsafe<QueryRow[]>(placeholders(this.query), params as never[]);
    return { changes: Number(result.count || 0), rows: result };
  }
}

export type DatabaseAdapter = {
  prepare(query: string): Statement;
};

const database: DatabaseAdapter = {
  prepare(query: string) { return new Statement(query); },
};

export function getDb() {
  return database;
}

export function makePublicId(prefix: "JB" | "LOST" | "SOUL" | "CLUE") {
  return `${prefix}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export function makeEditToken() {
  return randomBytes(18).toString("hex");
}

export async function upsertUser(contact: string, city = "") {
  const db = getDb();
  await db.prepare(`
    INSERT INTO users (contact, city) VALUES (?, ?)
    ON CONFLICT(contact) DO UPDATE SET city = CASE WHEN EXCLUDED.city != '' THEN EXCLUDED.city ELSE users.city END
  `).run(contact, city);
  return await db.prepare("SELECT id FROM users WHERE contact = ?").get<{ id: number }>(contact) as { id: number };
}

export type PetRow = {
  id: number; public_id: string; name: string; type: string; breed: string; age: string; city: string;
  owner_contact: string; photo_url: string; gender: string; features: string; sterilized: string; backup_contact: string;
  allow_public_stats: number; collar_chip: string; allow_public_display: number; edit_token: string; ssr_score: number;
  global_rank: number; net_worth: number; guardian: string; cosmic_identity: string; identity_story: string;
  invite_count: number; payment_status: string; conversion_path: string; unlocked_at: string; referrer_pet_id: string;
  views: number; share_count: number; created_at: string;
};

export type LostRow = {
  id: number; public_id: string; pet_name: string; photo_url: string; lost_location: string; lost_time: string;
  province?: string; city?: string;
  contact: string; features: string; reward: number; urgency: string; last_seen_location: string; contact_public: number;
  wearing_items: string; temperament: string; pet_id: string; status: string; views: number; share_count: number; created_at: string;
};

export type QuizRow = {
  id: number; public_id: string; pet_name: string; personality: string; career: string; rarity: string; guardian: string;
  net_worth: string; match_score: number; pet_id: string; share_count: number; created_at: string;
};

export type LostClueRow = {
  id: number; public_id: string; lost_id: string; pet_id: string; message: string; seen_location: string;
  seen_time: string; reporter_contact: string; reporter_hash: string; status: string; created_at: string;
};
