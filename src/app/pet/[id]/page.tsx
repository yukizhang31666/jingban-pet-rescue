import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, Phone, Search, ShieldCheck, Sparkles } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { PetGrowthExperience } from "@/components/pet-growth-experience";
import { ProductOffer } from "@/components/product-offer";
import { QrCode } from "@/components/qr-code";
import { getDb, type PetRow } from "@/lib/db";
import { appendConversionStage, derivePetIdentity, maskedTier, recordGrowthEvent, worthRange } from "@/lib/pet-growth";

export const dynamic = "force-dynamic";

async function findPet(id: string) {
  return await getDb().prepare("SELECT * FROM pets WHERE public_id = ?").get<PetRow>(id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const pet = await findPet(id);
  const description = pet ? `${pet.name}的AI宠物身份正在解锁，来看看它的SSR等级、身价和城市排名。` : "宠物身份证";
  return pet ? { title: `${pet.name}的宠物身份证`, description, openGraph: { title: `${pet.name}的AI宠物身份`, description, type: "website", images: [{ url: pet.photo_url, alt: `${pet.name}的宠物照片` }] } } : { title: "宠物身份证" };
}

export default async function PetIdentityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pet = await findPet(id);
  if (!pet) notFound();
  const db = getDb();
  await db.prepare("UPDATE pets SET views = views + 1 WHERE public_id = ?").run(id);
  await appendConversionStage(db, id, "page_view");
  await recordGrowthEvent(db, id, "page_view", "identity-page");

  const contactHref = /^1\d{10}$/.test(pet.owner_contact) ? `tel:${pet.owner_contact}` : undefined;
  const identity = derivePetIdentity(pet.public_id, pet.name, pet.type);

  return (
    <MobileShell>
      <article className="identity-page">
        <div className="identity-hero">
          <Image src={pet.photo_url} alt={`${pet.name}的照片`} fill priority sizes="(max-width: 520px) 100vw, 520px" />
          <span className="status-chip"><ShieldCheck size={16} /> 已建立数字身份</span>
        </div>

        <section className="identity-panel">
          <div className="identity-title-row">
            <div>
              <h1>{pet.name}</h1>
              <p>鲸伴宠物身份编号 {pet.public_id}</p>
            </div>
            <span className="id-seal"><BadgeCheck size={27} /></span>
          </div>
        </section>

        <PetGrowthExperience
          publicId={pet.public_id}
          name={pet.name}
          type={pet.type}
          city={pet.city}
          photoUrl={pet.photo_url}
          maskedLevel={maskedTier(identity.tier)}
          maskedWorth={worthRange(pet.net_worth || identity.netWorth)}
        />

        <section className="identity-section">
          <h2>防丢身份档案</h2>
          <div className="detail-grid">
            <div><span>宠物类型</span><strong>{pet.type}</strong></div>
            <div><span>宠物品种</span><strong>{pet.breed}</strong></div>
            <div><span>年龄</span><strong>{pet.age}</strong></div>
            <div><span>常住城市</span><strong>{pet.city}</strong></div>
            <div><span>宠物性别</span><strong>{pet.gender}</strong></div>
            <div><span>绝育情况</span><strong>{pet.sterilized}</strong></div>
            <div><span>项圈 / 芯片</span><strong>{pet.collar_chip}</strong></div>
            <div><span>公开展示</span><strong>{pet.allow_public_display ? "已允许" : "未允许"}</strong></div>
          </div>
        </section>

        <section className="identity-section">
          <h2>明显特征</h2>
          <p>{pet.features || "主人暂未补充明显特征"}</p>
        </section>

        <section className="identity-section">
          <h2>紧急联系主人</h2>
          <p><MapPin size={15} /> {pet.city}</p>
          {contactHref ? (
            <a className="primary-button contact-button" href={contactHref}><Phone size={19} /> {pet.owner_contact}</a>
          ) : (
            <div className="primary-button contact-button"><Phone size={19} /> {pet.owner_contact}</div>
          )}
        </section>

        <section className="identity-section">
          <h2>身份二维码</h2>
          <QrCode label="扫码即可随时查看这份宠物身份档案" />
        </section>

        <div id="pet-paid-offer">
          <ProductOffer
            title="高级宠物身份卡"
            price="¥29"
            buttonLabel="升级高级宠物身份卡｜¥29"
            benefits={["高清身份卡", "SSR完整等级", "身价估算", "防丢二维码", "朋友圈分享海报"]}
            productType="advanced_identity_card"
            targetType="pet"
            targetId={pet.public_id}
          />
        </div>

        <section className="identity-section result-next-actions">
          <h2>继续为它完善档案</h2>
          <Link className="primary-button" href={`/lost/new?petId=${pet.public_id}`}><Search size={19} /> 一键生成寻宠启事</Link>
          <Link className="secondary-button" href={`/quiz?petId=${pet.public_id}`}><Sparkles size={19} /> 测测宠物隐藏身份</Link>
        </section>
      </article>
    </MobileShell>
  );
}
