'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../components/UserContext';
import type { Role } from '../../store/useUserStore';

/** JWT payload를 서명 검증 없이 디코딩 (클라이언트 전용) */
function decodeJwtPayload(token: string): { sub: string; roles: string[]; userId?: number } | null {
  try {
    const payloadBase64 = token.split('.')[1];
    const decoded = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
    return {
      sub: decoded.sub ?? '',
      roles: Array.isArray(decoded.roles) ? decoded.roles : [],
      userId: typeof decoded.userId === 'number' ? decoded.userId : undefined,
    };
  } catch {
    return null;
  }
}

export default function OAuth2RedirectPage() {
  const router = useRouter();
  const { setRole } = useUser();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const isGuest = params.get('isGuest') === 'true';

    if (!accessToken) {
      setErrorMsg('Google 로그인에 실패했습니다. accessToken이 없습니다.');
      setStatus('error');
      return;
    }

    // 1. Access Token localStorage 저장
    localStorage.setItem('tm_token', accessToken);

    // 2. JWT payload 디코딩 -> role 추출
    const payload = decodeJwtPayload(accessToken);
    if (payload) {
      const normalizedRoles = payload.roles.map((r: string) =>
        String(r).replace(/^ROLE_/, '').toUpperCase()
      );
      let role: Role = 'GUEST';
      if (normalizedRoles.includes('TUTOR')) {
        role = 'TUTOR';
      } else if (normalizedRoles.includes('STUDENT')) {
        role = 'STUDENT';
      }
      setRole(role, payload.sub, payload.userId);
    }

    // 3. GUEST(소셜 최초 가입)이면 회원가입 완료 페이지로, 아니면 홈으로
    if (isGuest) {
      router.replace('/signup?oauth=true');
    } else {
      router.replace('/');
    }
  }, [router, setRole]);

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 text-sm">{errorMsg}</p>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold"
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <svg
        className="animate-spin text-primary"
        xmlns="http://www.w3.org/2000/svg"
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <p className="text-sm text-muted-foreground">Google 로그인 처리 중...</p>
    </div>
  );
}