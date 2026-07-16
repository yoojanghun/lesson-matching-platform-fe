import { useState } from "react";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import type { Role } from "../types";

interface Props {
  onSignUp: (role: Role) => void;
}

export default function SignUpPage({ onSignUp }: Props) {
  const [step, setStep] = useState<"choose" | "form">("choose");
  const [selectedRole, setSelectedRole] = useState<"student" | "tutor">("student");

  if (step === "choose") {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">회원가입</h2>
          <p className="text-sm text-muted-foreground">어떤 역할로 시작하시겠어요?</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { role: "student" as const, icon: BookOpen, title: "학생으로 시작", desc: "튜터를 찾고 레슨을 신청합니다", color: "text-primary" },
            { role: "tutor" as const, icon: GraduationCap, title: "튜터로 시작", desc: "전문 지식을 공유하고 수업합니다", color: "text-accent" },
          ].map(({ role, icon: Icon, title, desc, color }) => (
            <button
              key={role}
              onClick={() => { setSelectedRole(role); setStep("form"); }}
              className="flex flex-col items-center gap-3 p-6 bg-card border-2 border-border rounded-2xl hover:border-primary/50 transition-all hover:shadow-md cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Icon size={24} className={color} />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-1">{desc}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="border-t border-border pt-5 text-center">
          <p className="text-xs text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <button className="text-accent font-medium hover:underline cursor-pointer">로그인</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <button
          onClick={() => setStep("choose")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 cursor-pointer"
        >
          <ArrowLeft size={14} /> 역할 선택으로
        </button>
        <h2 className="text-xl font-bold text-foreground">
          {selectedRole === "student" ? "학생" : "튜터"} 회원가입
        </h2>
        <p className="text-sm text-muted-foreground mt-1">기본 정보를 입력해 주세요</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        {[
          { label: "이름", placeholder: "홍길동" },
          { label: "이메일", placeholder: "example@email.com" },
          { label: "비밀번호", placeholder: "8자 이상" },
          ...(selectedRole === "tutor"
            ? [
                { label: "전문 과목", placeholder: "예: 수학, 영어" },
                { label: "경력 소개", placeholder: "간단한 경력을 적어주세요" },
              ]
            : []),
        ].map(({ label, placeholder }) => (
          <div key={label}>
            <label className="block text-xs font-semibold text-foreground mb-1.5">{label}</label>
            <input
              className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors"
              placeholder={placeholder}
            />
          </div>
        ))}
        <button
          onClick={() => onSignUp(selectedRole)}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors mt-2 cursor-pointer"
        >
          가입 완료
        </button>
      </div>
    </div>
  );
}
