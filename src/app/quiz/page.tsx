import type { Metadata } from "next";
import { MobileShell } from "@/components/mobile-shell";
import { QuizFlow } from "@/components/quiz-flow";
import { getDb, type PetRow } from "@/lib/db";

export const metadata: Metadata = { title: "宠物隐藏身份测试" };
export const dynamic = "force-dynamic";

export default async function QuizPage({ searchParams }: { searchParams: Promise<{ petId?: string }> }) {
  const { petId } = await searchParams;
  const pet = petId ? await getDb().prepare("SELECT * FROM pets WHERE public_id = ?").get<PetRow>(petId) : undefined;
  return <MobileShell><QuizFlow linkedPet={pet ? { publicId: pet.public_id, name: pet.name } : undefined} /></MobileShell>;
}
