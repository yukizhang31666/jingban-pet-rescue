import { NextResponse } from "next/server";
import { getDb, makePublicId } from "@/lib/db";
import { buildQuizResult } from "@/lib/quiz";
import { appendConversionStage, recordGrowthEvent } from "@/lib/pet-growth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { petName?: string; answers?: number[]; petId?: string };
    const petName = body.petName?.trim();
    const answers = body.answers;
    if (!petName) throw new Error("请填写宠物名字");
    if (!Array.isArray(answers) || answers.length !== 10) throw new Error("请完成全部 10 道题");
    if (answers.some((answer) => !Number.isInteger(answer) || answer < 0 || answer > 2)) {
      throw new Error("测试答案无效");
    }

    const result = buildQuizResult(petName, answers);
    const publicId = makePublicId("SOUL");
    const db = getDb();
    const petId = body.petId && await db.prepare("SELECT public_id FROM pets WHERE public_id = ?").get(body.petId) ? body.petId : "";
    await db.prepare(`
      INSERT INTO personality_tests
      (public_id, pet_name, answers_json, personality, career, rarity, guardian, net_worth, match_score, pet_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      publicId,
      petName,
      JSON.stringify(answers),
      result.personality,
      result.career,
      result.rarity,
      result.guardian,
      result.netWorth,
      result.matchScore,
      petId,
    );
    if (petId) {
      await appendConversionStage(db, petId, "quiz_completed");
      await recordGrowthEvent(db, petId, "quiz_completed", "identity-quiz", "", { quizId: publicId });
    }

    return NextResponse.json({ publicId, url: `/quiz/${publicId}`, result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成结果失败，请稍后重试";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
