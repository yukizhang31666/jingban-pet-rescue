import type { Metadata } from "next";
import { LostForm } from "@/components/lost-form";
import { MobileShell } from "@/components/mobile-shell";
import { getDb, type PetRow } from "@/lib/db";

export const metadata: Metadata = { title: "发布寻宠启事" };

export const dynamic = "force-dynamic";

export default async function NewLostPage({ searchParams }: { searchParams: Promise<{ petId?: string; ref?: string | string[] }> }) {
  const { petId, ref } = await searchParams;
  const candidateRef = typeof ref === "string" ? ref.trim().slice(0, 50) : "";
  const referralCode = /^[A-Za-z0-9_-]+$/.test(candidateRef) ? candidateRef : "";
  const pet = petId ? await getDb().prepare("SELECT * FROM pets WHERE public_id = ?").get<PetRow>(petId) : undefined;
  return (
    <MobileShell>
      <div className="form-page">
        <header className="page-heading">
          <span className="eyebrow">快速发布 · 多平台扩散</span>
          <h1>3分钟生成可转发寻宠海报</h1>
          <p>自动生成朋友圈、微信群、小红书寻宠文案，方便亲友帮你快速扩散。</p>
        </header>
        <LostForm linkedPet={pet ? { publicId: pet.public_id, name: pet.name } : undefined} referralCode={referralCode} />
      </div>
    </MobileShell>
  );
}
