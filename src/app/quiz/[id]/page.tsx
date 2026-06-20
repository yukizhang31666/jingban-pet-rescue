import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Gem, Sparkles } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { InviteFriendButton } from "@/components/invite-friend-button";
import { PosterActions } from "@/components/poster-actions";
import { ProductOffer } from "@/components/product-offer";
import { getDb, type QuizRow } from "@/lib/db";

export const dynamic = "force-dynamic";

async function findResult(id: string) {
  return await getDb().prepare("SELECT * FROM personality_tests WHERE public_id = ?").get<QuizRow>(id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const result = await findResult(id);
  const description = result ? `${result.pet_name}竟然是${result.personality}，宇宙身份是${result.career}。` : "宠物隐藏身份";
  return result ? { title: `${result.pet_name}的隐藏身份`, description, openGraph: { title: `${result.pet_name}的宇宙身份已揭晓`, description, type: "article", images: ["/hero-pets.png"] } } : { title: "宠物隐藏身份" };
}

export default async function QuizResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await findResult(id);
  if (!result) notFound();

  return (
    <MobileShell>
      <article className="quiz-result">
        <header className="quiz-result-header">
          <Sparkles size={34} />
          <span>{result.pet_name} 的宇宙档案已解锁</span>
          <h1>{result.rarity}</h1>
          <p>身份编号 {result.public_id}</p>
        </header>

        <section className="result-primary">
          <span>核心人格</span>
          <h2>{result.personality}</h2>
        </section>

        <section className="result-grid">
          <div><span>宇宙身份</span><strong>{result.career}</strong></div>
          <div><span>专属守护兽</span><strong>{result.guardian}</strong></div>
          <div><span>宠物身价</span><strong>{result.net_worth}</strong></div>
          <div><span>主宠匹配度</span><strong>{result.match_score}%</strong></div>
        </section>

        <div style={{ display: "flex", alignItems: "center", gap: 9, color: "#c9c3e8", marginTop: 18, fontSize: 12, lineHeight: 1.5 }}>
          <Gem size={18} color="var(--yellow)" /> 这份报告在全宇宙仅属于 {result.pet_name}
        </div>

        <PosterActions
          kind="quiz"
          publicId={result.public_id}
          title={`${result.pet_name} · ${result.personality}`}
          subtitle={result.rarity}
          lines={[`宇宙身份：${result.career}`, `守护兽：${result.guardian}`, `宠物身价：${result.net_worth}`, `主宠匹配度：${result.match_score}%`]}
          shareLabel="分享朋友圈海报"
        />

        <InviteFriendButton targetId={result.public_id} />

        <ProductOffer
          title="完整宇宙身份"
          price="¥9.9"
          buttonLabel="解锁完整宇宙身份｜¥9.9"
          benefits={["完整人格报告", "守护兽", "主宠匹配度", "身价估算", "分享海报"]}
          productType="quiz_full_report"
          targetType="quiz"
          targetId={result.public_id}
          tone="violet"
          compact
        />
        {result.pet_id && <Link className="quiz-invite-button" href={`/pet/${result.pet_id}`}>返回 {result.pet_name} 的 Pet ID 增长主页</Link>}
      </article>
    </MobileShell>
  );
}
