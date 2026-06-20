import type { DatabaseAdapter } from "@/lib/db";

const guardians = ["星海白鲸", "赤焰九尾", "月影雪豹", "极光玄鸟", "深海蓝龙", "云端麒麟", "森林银狼", "曜石灵猫"];
const identities = ["银河舰长", "星际领航员", "猫界女王", "时空巡逻官", "云端治愈师", "宇宙宝藏猎人", "星港首席外交官", "地球快乐守护者"];
const stories = [
  "它曾负责守护一整条星河的回家坐标，来到你身边，是为了把迷路的人重新带回爱里。",
  "它在平行宇宙里掌管好运分配，每一次靠近你，都是一次精准的幸运投递。",
  "它是星际议会最年轻的情绪翻译官，能听懂所有没说出口的喜欢。",
  "它曾穿越七个宇宙寻找最匹配的主人，最后把地球坐标停在了你的身边。",
  "它拥有把普通日子变成纪念日的能力，任务是记录你们共同生活的每个微小瞬间。",
];

export type PetIdentityProfile = {
  ssrScore: number;
  tier: "SSR" | "SR" | "S" | "A" | "B";
  globalRank: number;
  netWorth: number;
  guardian: string;
  cosmicIdentity: string;
  identityStory: string;
};

function stableNumber(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function derivePetIdentity(publicId: string, name: string, type: string): PetIdentityProfile {
  const seed = stableNumber(`${publicId}:${name}:${type}`);
  const ssrScore = Number((60 + (seed % 400) / 10).toFixed(1));
  const tier = ssrScore >= 99 ? "SSR" : ssrScore >= 95 ? "SR" : ssrScore >= 85 ? "S" : ssrScore >= 70 ? "A" : "B";
  const globalRank = Math.max(1, Math.round((100 - ssrScore) * 12843 + (seed % 97)));
  const netWorth = 68888 + (seed % 123) * 10000;

  return {
    ssrScore,
    tier,
    globalRank,
    netWorth,
    guardian: guardians[seed % guardians.length],
    cosmicIdentity: identities[(seed >>> 3) % identities.length],
    identityStory: stories[(seed >>> 6) % stories.length],
  };
}

export function maskedTier(tier: PetIdentityProfile["tier"]) {
  return tier === "SSR" ? "SS?" : `${tier.slice(0, 1)}??`;
}

export function worthRange(netWorth: number) {
  const low = Math.max(10000, Math.floor((netWorth * 0.82) / 10000) * 10000);
  const high = Math.ceil((netWorth * 1.18) / 10000) * 10000;
  return `¥${low.toLocaleString("zh-CN")} - ¥${high.toLocaleString("zh-CN")}`;
}

export async function appendConversionStage(database: DatabaseAdapter, petId: string, stage: string) {
  const row = await database.prepare("SELECT conversion_path FROM pets WHERE public_id = ?").get<{ conversion_path: string }>(petId);
  if (!row) return;
  let path: string[] = [];
  try {
    path = JSON.parse(row.conversion_path || "[]") as string[];
  } catch {
    path = [];
  }
  if (!path.includes(stage)) {
    path.push(stage);
    await database.prepare("UPDATE pets SET conversion_path = ? WHERE public_id = ?").run(JSON.stringify(path), petId);
  }
}

export async function recordGrowthEvent(
  database: DatabaseAdapter,
  petId: string,
  eventType: string,
  channel = "web",
  sourcePetId = "",
  metadata: Record<string, unknown> = {},
) {
  await database.prepare(`
    INSERT INTO growth_events (pet_id, event_type, channel, source_pet_id, metadata_json)
    VALUES (?, ?, ?, ?, ?)
  `).run(petId, eventType, channel, sourcePetId, JSON.stringify(metadata));
}

export async function resolvePetId(database: DatabaseAdapter, targetType: string, targetId: string) {
  if (targetType === "pet") return targetId;
  if (targetType === "lost") {
    return (await database.prepare("SELECT pet_id FROM lost_reports WHERE public_id = ?").get<{ pet_id: string }>(targetId))?.pet_id || "";
  }
  if (targetType === "quiz") {
    return (await database.prepare("SELECT pet_id FROM personality_tests WHERE public_id = ?").get<{ pet_id: string }>(targetId))?.pet_id || "";
  }
  return "";
}
