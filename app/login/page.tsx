'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, MOCK_ACCOUNTS, type TestAccount } from '../components/UserContext';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { Role } from '../store/useUserStore';

interface LoginRequest {
  username: string,
  password: string
}

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

/** JWT payload를 서명 검증 없이 디코딩 (클라이언트 전용) */
function decodeJwtPayload(token: string): { sub: string; roles: string[] } | null {
  try {
    const payloadBase64 = token.split('.')[1];
    const decoded = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
    return {
      sub: decoded.sub ?? '',
      roles: Array.isArray(decoded.roles) ? decoded.roles : [],
    };
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { setRole, quickLogin } = useUser();

  // 로그인 Mutation 정의
  const loginMutation = useMutation({
    mutationFn: (loginData: LoginRequest) =>
      apiClient.post<LoginResponse>('/api/auth/login', loginData),
    onSuccess: (response) => {
      const { accessToken } = response.data;

      // 1. Access Token localStorage 저장
      localStorage.setItem('tm_token', accessToken);

      // 2. JWT payload 디코딩 → role 추출
      const payload = decodeJwtPayload(accessToken);
      if (payload) {
        // 백엔드 roles: ["ROLE_STUDENT"], ["ROLE_TUTOR"], ["STUDENT"], ["TUTOR"] 등 처리
        const normalizedRoles = payload.roles.map((r) => String(r).replace(/^ROLE_/, '').toUpperCase());
        let role: Role = 'GUEST';
        if (normalizedRoles.includes('TUTOR')) {
          role = 'TUTOR';
        } else if (normalizedRoles.includes('STUDENT')) {
          role = 'STUDENT';
        }

        setRole(role, payload.sub);
      }

      router.push('/');
    },
    onError: (error) => {
      console.error('로그인 실패', error);
      setError(error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  });

  // Form 제출 핸들러
  const handleSubmitLogin = (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!userId.trim() || !password) {
      setError('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }
    
    loginMutation.mutate({
      username: userId.trim(),
      password: password.trim()
    });
  }

  const handleQuickLogin = (account: TestAccount) => {
    quickLogin(account);
    router.push('/');
  };

  return (
    <div className="max-w-sm mx-auto space-y-6 py-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-1">로그인</h2>
        <p className="text-sm text-muted-foreground">계정에 접속하세요</p>
      </div>

      {/* 빠른 로그인 (테스트 계정) */}
      <div className="bg-secondary/60 border border-border/80 rounded-2xl p-4 space-y-2.5">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
          테스트 계정으로 빠른 로그인
        </p>
        <div className="flex gap-2">
          {MOCK_ACCOUNTS.map((a) => (
            <button
              key={a.email}
              type="button"
              onClick={() => handleQuickLogin(a)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 border-primary/20 bg-card text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer shadow-sm"
            >
              {a.role === 'STUDENT' ? '학생 계정' : '튜터 계정'}
            </button>
          ))}
        </div>
        <div className="space-y-1 pt-1">
          {MOCK_ACCOUNTS.map((a) => (
            <div key={a.email} className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="font-medium">{a.role === 'STUDENT' ? '학생' : '튜터'}</span>
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

      <form onSubmit={handleSubmitLogin} className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">이메일</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              setError('');
            }}
            className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors"
            placeholder="example"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-foreground">비밀번호</label>
            <button type="button" className="text-xs text-accent hover:underline cursor-pointer">
              비밀번호 찾기
            </button>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors"
            placeholder="비밀번호를 입력하세요"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
        >
          {loginMutation.isPending ? "로그인 중..." : "로그인"}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">또는 소셜 로그인</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={() => {
            handleQuickLogin(MOCK_ACCOUNTS[0]);
          }}
          className="w-full flex items-center justify-center gap-3 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107" />
            <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00" />
            <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.314 0-9.828-3.417-11.421-8.137l-6.515 5.021C9.505 39.556 16.227 44 24 44z" fill="#4CAF50" />
            <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2" />
          </svg>
          Google로 로그인
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        아직 계정이 없으신가요?{' '}
        <Link href="/signup" className="text-accent font-medium hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
