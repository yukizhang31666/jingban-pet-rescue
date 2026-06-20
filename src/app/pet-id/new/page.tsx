import type { Metadata } from "next";
import { MobileShell } from "@/components/mobile-shell";
import { PetIdForm } from "@/components/pet-id-form";

export const metadata: Metadata = { title: "免费办理宠物身份证" };

export default function NewPetIdPage() {
  return (
    <MobileShell>
      <div className="form-page">
        <header className="page-heading">
          <span className="eyebrow">永久免费 · 两步完成</span>
          <h1>办理宠物身份证</h1>
          <p>先用必要信息快速建档，再完善防丢资料。基础身份证会在第一步立即生成。</p>
        </header>
        <PetIdForm />
      </div>
    </MobileShell>
  );
}
