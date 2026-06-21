import { NextResponse } from "next/server";
import { getDb, makeEditToken, makePublicId, upsertUser } from "@/lib/db";
import { requiredText, saveImage } from "@/lib/uploads";
import { appendConversionStage, derivePetIdentity, recordGrowthEvent } from "@/lib/pet-growth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const petName = requiredText(form.get("petName"), "宠物名字");
    const province = requiredText(form.get("province"), "省份");
    const city = requiredText(form.get("city"), "城市");
    if (!["北京市", "上海市", "广东省", "浙江省", "四川省", "湖北省", "江苏省", "重庆市", "陕西省"].includes(province)) throw new Error("省份无效");
    if (!["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "南京", "重庆", "西安", "苏州"].includes(city)) throw new Error("城市无效");
    const lostLocation = requiredText(form.get("lostLocation"), "走失地点");
    const lastSeenLocation = requiredText(form.get("lastSeenLocation"), "最后出现位置");
    const lostTime = requiredText(form.get("lostTime"), "走失时间");
    const urgency = requiredText(form.get("urgency"), "紧急程度");
    if (!["普通", "紧急", "高危"].includes(urgency)) throw new Error("紧急程度无效");
    const contact = requiredText(form.get("contact"), "联系方式");
    const features = requiredText(form.get("features"), "宠物特征");
    const wearingItems = form.getAll("wearingItems").filter((value): value is string => typeof value === "string" && value.trim() !== "");
    if (wearingItems.length === 0) throw new Error("请选择走失时佩戴物");
    const temperament = requiredText(form.get("temperament"), "宠物性格");
    if (!["胆小", "亲人", "警惕", "可能攻击"].includes(temperament)) throw new Error("宠物性格无效");
    const rewardText = typeof form.get("reward") === "string" ? String(form.get("reward")) : "0";
    const reward = Math.max(0, Number.parseInt(rewardText, 10) || 0);
    const requestedPetId = typeof form.get("petId") === "string" ? String(form.get("petId")).trim() : "";
    const referralCandidate = typeof form.get("referralCode") === "string" ? String(form.get("referralCode")).trim().slice(0, 50) : "";
    const referralCode = /^[A-Za-z0-9_-]+$/.test(referralCandidate) ? referralCandidate : null;
    const photo = form.get("photo");
    if (!(photo instanceof File) || photo.size === 0) throw new Error("请上传宠物照片");

    const photoUrl = await saveImage(photo, "lost");
    const publicId = makePublicId("LOST");
    const user = await upsertUser(contact, city);
    const db = getDb();
    let petId = requestedPetId && await db.prepare("SELECT public_id FROM pets WHERE public_id = ?").get(requestedPetId) ? requestedPetId : "";
    if (!petId) {
      petId = makePublicId("JB");
      const profile = derivePetIdentity(petId, petName, "宠物");
      await db.prepare(`
        INSERT INTO pets
        (public_id, user_id, name, type, breed, age, city, owner_contact, photo_url, gender, features, sterilized,
         allow_public_stats, collar_chip, allow_public_display, edit_token, ssr_score, global_rank, net_worth, guardian,
         cosmic_identity, identity_story, conversion_path)
        VALUES (?, ?, ?, '宠物', '待补充', '待补充', ?, ?, ?, '未知', ?, '未知', 0, '未填写', 0, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        petId, user.id, petName, city, contact, photoUrl, features, makeEditToken(),
        profile.ssrScore, profile.globalRank, profile.netWorth, profile.guardian, profile.cosmicIdentity,
        profile.identityStory, JSON.stringify(["pet_created", "lost_created"]),
      );
      await recordGrowthEvent(db, petId, "pet_created", "lost-tool");
    } else {
      await appendConversionStage(db, petId, "lost_created");
    }
    await db.prepare(`
      INSERT INTO lost_reports
      (public_id, user_id, pet_name, photo_url, province, city, lost_location, last_seen_location, lost_time, urgency, contact, contact_public, features, reward, wearing_items, temperament, pet_id, referral_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(publicId, user.id, petName, photoUrl, province, city, lostLocation, lastSeenLocation, lostTime, urgency, contact, 0, features, reward, wearingItems.join("、"), temperament, petId, referralCode);
    await recordGrowthEvent(db, petId, "lost_created", "lost-tool", "", { lostId: publicId });

    return NextResponse.json({ publicId, petId, url: `/lost/${publicId}` }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "发布失败，请稍后重试";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
