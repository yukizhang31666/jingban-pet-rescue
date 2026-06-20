"use client";

import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiUrl } from "@/lib/api-url";

const questions = [
  { question: "家里突然来了陌生人，TA通常会？", options: ["马上热情迎接", "远处悄悄观察", "先躲起来再说"] },
  { question: "听到零食袋响，TA的反应是？", options: ["瞬间闪现", "故作镇定地靠近", "等你亲自送来"] },
  { question: "如果能选一种超能力，TA更像拥有？", options: ["无限体力", "读心术", "隐身术"] },
  { question: "独自在家时，TA最可能在？", options: ["巡视每个角落", "安心睡大觉", "策划一场小冒险"] },
  { question: "面对新玩具，TA会？", options: ["立刻上手研究", "先闻一圈再决定", "等旧玩具玩腻再说"] },
  { question: "TA最常用哪种方式表达爱？", options: ["时刻黏着你", "默默陪在附近", "偶尔赏你一个眼神"] },
  { question: "犯错被发现时，TA通常？", options: ["卖萌求放过", "假装无事发生", "理直气壮看着你"] },
  { question: "在宠物朋友圈里，TA更像？", options: ["气氛担当", "可靠队长", "神秘顾问"] },
  { question: "如果一起去旅行，TA会选择？", options: ["热闹的海边", "舒服的度假屋", "未知的森林"] },
  { question: "对TA来说，你最像？", options: ["最好的玩伴", "可靠的家人", "专属生活助理"] },
];

export function QuizFlow({ linkedPet }: { linkedPet?: { publicId: string; name: string } }) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [petName, setPetName] = useState(linkedPet?.name || "");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function answer(value: number) {
    const nextAnswers = [...answers.slice(0, step), value];
    setAnswers(nextAnswers);
    if (step < questions.length - 1) {
      setStep(step + 1);
      return;
    }

    setBusy(true);
    setError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(apiUrl("/api/tests"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petName, answers: nextAnswers, petId: linkedPet?.publicId || "" }),
        signal: controller.signal,
      });
      const data = await response.json() as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error || "生成失败");
      router.push(data.url);
    } catch (caught) {
      setError(caught instanceof Error && caught.name === "AbortError" ? "网络响应较慢，请重试最后一题" : caught instanceof Error ? caught.message : "生成失败，请稍后重试");
      setBusy(false);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  if (!started) {
    return (
      <section className="quiz-page">
        <div className="quiz-intro">
          <span className="quiz-intro-icon"><Sparkles size={30} /></span>
          <h1>测测宠物的<br />隐藏宇宙身份</h1>
          <p>10 道轻松小题，解锁它的人格、宇宙职业、稀有度和与你的主宠匹配度。</p>
          <div className="quiz-examples" aria-label="示例测试结果">
            <article><span>身份示例</span><strong>SSR 银河舰长</strong><small>击败99.2%宠物</small></article>
            <article><span>身份示例</span><strong>猫界女王</strong><small>稀有度S · 身价¥1,288,888</small></article>
            <article><span>身份示例</span><strong>主宠匹配度96%</strong><small>前世关系：守护者</small></article>
          </div>
          {linkedPet && <div className="linked-pet-note"><span>已关联 Pet ID</span><strong>{linkedPet.name} · {linkedPet.publicId}</strong></div>}
          <div className="field-group">
            <label className="field-label" htmlFor="quiz-name">宠物名字<span> *</span></label>
            <input id="quiz-name" value={petName} onChange={(event) => setPetName(event.target.value)} maxLength={20} placeholder="先告诉我它叫什么" />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button
            className="primary-button"
            type="button"
            style={{ width: "100%", background: "var(--violet)" }}
            onClick={() => {
              if (!petName.trim()) return setError("请先填写宠物名字");
              setError("");
              setStarted(true);
            }}
          >
            开始测试 <ArrowRight size={19} />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="quiz-page">
      <div className="quiz-stage">
        <div className="quiz-progress-row"><span>隐藏身份探索中</span><span>{step + 1} / {questions.length}</span></div>
        <div className="quiz-progress"><span style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
        <h1 className="quiz-question">{questions[step].question}</h1>
        <div className="quiz-options">
          {questions[step].options.map((option, index) => (
            <button className="quiz-option" type="button" key={option} disabled={busy} onClick={() => answer(index)}>
              {String.fromCharCode(65 + index)}. {option}
            </button>
          ))}
        </div>
        {error && <p className="form-error" style={{ marginTop: 16 }}>{error}</p>}
        {busy && <p className="action-message" style={{ color: "var(--violet)", marginTop: 18 }}>正在穿越宇宙读取身份...</p>}
        {step > 0 && !busy && (
          <button className="quiz-back" type="button" onClick={() => setStep(step - 1)}><ArrowLeft size={15} /> 上一题</button>
        )}
      </div>
    </section>
  );
}
