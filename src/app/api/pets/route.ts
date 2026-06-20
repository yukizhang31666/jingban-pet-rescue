import { NextResponse } from "next/server";
import { getDb, makeEditToken, makePublicId, upsertUser } from "@/lib/db";
import { appendConversionStage, derivePetIdentity, recordGrowthEvent } from "@/lib/pet-growth";
import { requiredText, saveImage } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const name = requiredText(form.get("name"), "宠物名字");
    const type = requiredText(form.get("type"), "宠物类型");
    const optionalText = (name: string, fallback: string) => {
      const value = form.get(name);
      return typeof value === "string" && value.trim() ? value.trim() : fallback;
    };
    const breed = optionalText("breed", "未填写");
    const age = optionalText("age", "未填写");
    const gender = optionalText("gender", "未知");
    const features = optionalText("features", "待完善");
    const sterilized = optionalText("sterilized", "未知");
    const collarChip = optionalText("collarChip", "未填写");
    const city = requiredText(form.get("city"), "所在城市");
    const contact = requiredText(form.get("contact"), "主人联系方式");
    const backupContact = typeof form.get("backupContact") === "string" ? String(form.get("backupContact")).trim() : "";
    const allowPublicStats = form.get("allowPublicStats") === "yes" ? 1 : 0;
    const allowPublicDisplay = form.get("allowPublicDisplay") === "yes" ? 1 : 0;
    const requestedReferrer = typeof form.get("referrerPetId") === "string" ? String(form.get("referrerPetId")).trim() : "";
    const visitorToken = typeof form.get("visitorToken") === "string" ? String(form.get("visitorToken")).trim().slice(0, 80) : "";
    const photo = form.get("photo");
    if (!(photo instanceof File) || photo.size === 0) throw new Error("请上传宠物照片");

    const photoUrl = await saveImage(photo, "pets");
    const publicId = makePublicId("JB");
    const editToken = makeEditToken();
    const user = await upsertUser(contact, city);
    const db = getDb();
    const referrer = requestedReferrer
      ? await db.prepare("SELECT public_id FROM pets WHERE public_id = ?").get<{ public_id: string }>(requestedReferrer)
      : undefined;
    const referrerPetId = referrer?.public_id || "";
    const profile = derivePetIdentity(publicId, name, type);
    await db.prepare(`
      INSERT INTO pets
      (public_id, user_id, name, type, breed, age, city, owner_contact, photo_url, gender, features, sterilized, backup_contact,
       allow_public_stats, collar_chip, allow_public_display, edit_token, ssr_score, global_rank, net_worth, guardian,
       cosmic_identity, identity_story, conversion_path, referrer_pet_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      publicId, user.id, name, type, breed, age, city, contact, photoUrl, gender, features, sterilized, backupContact,
      allowPublicStats, collarChip, allowPublicDisplay, editToken, profile.ssrScore, profile.globalRank, profile.netWorth,
      profile.guardian, profile.cosmicIdentity, profile.identityStory, JSON.stringify(["pet_created"]), referrerPetId,
    );
    await recordGrowthEvent(db, publicId, "pet_created", referrerPetId ? "referral" : "direct", referrerPetId);

    if (referrerPetId && visitorToken) {
      const referral = await db.prepare(`
        INSERT INTO pet_referrals (referrer_pet_id, invitee_pet_id, visitor_token)
        VALUES (?, ?, ?) ON CONFLICT DO NOTHING
      `).run(referrerPetId, publicId, visitorToken);
      if (Number(referral.changes) === 1) {
        await db.prepare("UPDATE pets SET invite_count = invite_count + 1 WHERE public_id = ?").run(referrerPetId);
        await appendConversionStage(db, referrerPetId, "invite_joined");
        await appendConversionStage(db, publicId, "invite_joined");
        await recordGrowthEvent(db, referrerPetId, "invite_joined", "referral", publicId, { inviteePetId: publicId });
      }
    }

    return NextResponse.json({ publicId, editToken, url: `/pet/${publicId}` }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "创建失败，请稍后重试";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
