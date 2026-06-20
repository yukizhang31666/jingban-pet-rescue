import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const text = (name: string, label: string, optional = false) => {
      const value = typeof body[name] === "string" ? body[name].trim() : "";
      if (!optional && !value) throw new Error(`请填写${label}`);
      return value;
    };
    const editToken = text("editToken", "编辑凭证");
    const age = text("age", "年龄");
    const gender = text("gender", "宠物性别");
    const breed = text("breed", "品种");
    const features = text("features", "明显特征");
    const sterilized = text("sterilized", "绝育情况");
    const collarChip = text("collarChip", "项圈或芯片佩戴情况");
    const backupContact = text("backupContact", "备用联系人", true);
    const allowPublicStats = body.allowPublicStats === true ? 1 : 0;
    const allowPublicDisplay = body.allowPublicDisplay === true ? 1 : 0;

    const result = await getDb().prepare(`
      UPDATE pets SET
        age = ?, gender = ?, breed = ?, features = ?, sterilized = ?, collar_chip = ?,
        backup_contact = ?, allow_public_stats = ?, allow_public_display = ?
      WHERE public_id = ? AND edit_token = ?
    `).run(age, gender, breed, features, sterilized, collarChip, backupContact, allowPublicStats, allowPublicDisplay, id, editToken);

    if (result.changes !== 1) throw new Error("编辑凭证已失效，请重新建档");
    return NextResponse.json({ ok: true, url: `/pet/${id}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
