import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requiredText } from "@/lib/uploads";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const businessName = requiredText(form.get("businessName"), "商家名称");
    const serviceType = requiredText(form.get("serviceType"), "服务类型");
    const city = requiredText(form.get("city"), "所在城市");
    const contactName = requiredText(form.get("contactName"), "联系人");
    const contactInfo = requiredText(form.get("contactInfo"), "联系方式");
    const services = requiredText(form.get("services"), "可提供服务");
    const acceptsCommission = form.get("acceptsCommission") === "yes" ? 1 : 0;

    const result = await getDb().prepare(`
      INSERT INTO merchant_applications
      (business_name, service_type, city, contact_name, contact_info, services, accepts_commission)
      VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id
    `).run(businessName, serviceType, city, contactName, contactInfo, services, acceptsCommission);

    return NextResponse.json({ ok: true, id: result.rows[0]?.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "申请提交失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
