import { NextResponse } from "next/server";
import { getDb, type PetRow } from "@/lib/db";
import { derivePetIdentity } from "@/lib/pet-growth";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const pet = await db.prepare("SELECT * FROM pets WHERE public_id = ?").get<PetRow>(id);
  if (!pet) return NextResponse.json({ error: "宠物身份不存在" }, { status: 404 });

  const profile = derivePetIdentity(pet.public_id, pet.name, pet.type);
  const tier = profile.tier;
  const unlocked = pet.share_count > 0 || pet.payment_status === "已付费";
  const cityTotal = Number((await db.prepare("SELECT COUNT(*) AS count FROM pets WHERE city = ?").get<{ count: number | string }>(pet.city))?.count || 0);
  const cityRank = Number((await db.prepare("SELECT COUNT(*) + 1 AS rank FROM pets WHERE city = ? AND ssr_score > ?").get<{ rank: number | string }>(pet.city, pet.ssr_score))?.rank || 1);
  const cityTop = await db.prepare("SELECT ssr_score FROM pets WHERE city = ? ORDER BY ssr_score DESC LIMIT 1").get<{ ssr_score: number }>(pet.city);
  const cityGap = Math.max(0, Number(((cityTop?.ssr_score || pet.ssr_score) - pet.ssr_score).toFixed(1)));
  const worthWithInvite = Math.round(pet.net_worth * (pet.invite_count >= 1 ? 1.1 : 1));
  const luxuryComparison = Math.max(1, Math.round(worthWithInvite / 18000));
  const topPercent = Math.max(0.1, Number((100 - pet.ssr_score).toFixed(1)));
  const identity = pet.invite_count >= 5 ? `神兽·${pet.cosmic_identity}` : pet.cosmic_identity;
  const xiaohongshuTitle = `救命！AI说我家${pet.name}不是普通毛孩子`;
  const xiaohongshuBody = `${pet.name}刚测出${tier}级宇宙身份「${identity}」！SSR稀有指数${pet.ssr_score.toFixed(1)}，娱乐身价¥${worthWithInvite.toLocaleString("zh-CN")}，约等于${luxuryComparison}个LV包。\n\n我本来只想办个宠物身份证，结果被这个身份狠狠拿捏了。你家毛孩子会是什么等级？扫码测完记得来和${pet.name}比一比！\n\n#宠物数字身份 #AI宠物测试 #萌宠 #宠物身份证 #鲸伴科技`;
  const douyinScript = [
    `0-2秒：镜头贴近${pet.name}，字幕“你以为它只是普通${pet.type}？”`,
    "2-4秒：快速展示AI身份生成过程，配合倒计时音效。",
    `4-6秒：SSR指数${pet.ssr_score.toFixed(1)}突然爆出，画面定格${tier}级。`,
    `6-8秒：身价¥${worthWithInvite.toLocaleString("zh-CN")}上屏，旁白“约等于${luxuryComparison}个LV包”。`,
    `8-10秒：反转揭晓“${identity}”，结尾引导“扫码测你家宠物，敢不敢来比？”`,
  ];

  return NextResponse.json({
    unlocked,
    shareCount: pet.share_count,
    inviteCount: pet.invite_count,
    viewCount: pet.views,
    paymentStatus: pet.payment_status,
    conversionPath: safePath(pet.conversion_path),
    milestones: {
      worthBonus: pet.invite_count >= 1,
      hiddenIdentity: pet.invite_count >= 3,
      mythicalIdentity: pet.invite_count >= 5,
    },
    full: unlocked ? {
      tier,
      ssrScore: pet.ssr_score,
      topPercent,
      globalRank: pet.global_rank,
      cityRank,
      cityTotal,
      cityComparison: cityRank === 1 ? "已进入城市Top1，领先同城已建档宠物" : `距离城市Top1还差 ${cityGap.toFixed(1)} 个稀有指数`,
      netWorth: worthWithInvite,
      luxuryComparison,
      guardian: pet.guardian,
      cosmicIdentity: identity,
      identityStory: pet.invite_count >= 3 ? pet.identity_story : null,
      xiaohongshuTitle,
      xiaohongshuBody,
      douyinScript,
    } : null,
  });
}

function safePath(value: string) {
  try {
    return JSON.parse(value) as string[];
  } catch {
    return [];
  }
}
