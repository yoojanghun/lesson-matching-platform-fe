import { useState } from "react";
import type { Role } from "../types";

// 임의 계정 목록
const MOCK_ACCOUNTS: { email: string; password: string; role: Role; name: string }[] = [
  { email: "student@tutormatch.kr", password: "student123", role: "student", name: "김학생" },
  { email: "tutor@tutormatch.kr",   password: "tutor123",   role: "tutor",   name: "김지수 튜터" },
];

interface Props {
  onNavigateSignUp: () => void;
  onLogin: (role: Role, name: string) => void;
}

export default function LoginPage({ onNavigateSignUp, onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const account = MOCK_ACCOUNTS.find(
      (a) => a.email === email.trim() && a.password === password
    );
    if (account) {
      setError("");
      onLogin(account.role, account.name);
    } else {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  const handleQuickLogin = (account: typeof MOCK_ACCOUNTS[number]) => {
    onLogin(account.role, account.name);
  };

  return (
    <div className="max-w-sm mx-auto space-y-6 py-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-1">로그인</h2>
        <p className="text-sm text-muted-foreground">계정에 접속하세요</p>
      </div>

      {/* 빠른 로그인 (테스트 계정) */}
      <div className="bg-secondary/60 rounded-2xl p-4 space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">테스트 계정으로 빠른 로그인</p>
        <div className="flex gap-2">
          {MOCK_ACCOUNTS.map((a) => (
            <button
              key={a.email}
              onClick={() => handleQuickLogin(a)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 border-primary/20 bg-card text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
            >
              {a.role === "student" ? "학생 계정" : "튜터 계정"}
            </button>
          ))}
        </div>
        <div className="space-y-1 pt-1">
          {MOCK_ACCOUNTS.map((a) => (
            <div key={a.email} className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="font-medium">{a.role === "student" ? "학생" : "튜터"}</span>
              <span className="font-mono">{a.email} / {a.password}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">또는 직접 입력</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="bg-card rounded-2xl p-6 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors"
            placeholder="example@email.com"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-foreground">비밀번호</label>
            <button className="text-xs text-accent hover:underline cursor-pointer">비밀번호 찾기</button>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors"
            placeholder="비밀번호를 입력하세요"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
        >
          로그인
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">소셜 로그인</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button className="w-full flex items-center justify-center gap-3 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/60 transition-colors cursor-pointer">
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107" />
            <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00" />
            <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.314 0-9.828-3.417-11.421-8.137l-6.515 5.021C9.505 39.556 16.227 44 24 44z" fill="#4CAF50" />
            <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2" />
          </svg>
          Google로 로그인
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        아직 계정이 없으신가요?{" "}
        <button onClick={onNavigateSignUp} className="text-accent font-medium hover:underline cursor-pointer">
          회원가입
        </button>
      </p>
    </div>
  );
}
