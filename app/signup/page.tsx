'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, GraduationCap } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

interface SignupData {
  name: string;
  userId: string;
  userPassword: string;
}

function SignUpFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOAuth = searchParams.get('oauth') === 'true';

  const [step, setStep] = useState<'choose' | 'form'>('choose');
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'TUTOR'>('STUDENT');
  const [name, setName] = useState(searchParams.get('name') ?? '');
  const [userId, setUserId] = useState(searchParams.get('email') ?? '');
  const [password, setPassword] = useState(() =>
    isOAuth ? `OAuth2!${Math.random().toString(36).slice(2)}${Date.now()}` : ''
  );

  useEffect(() => {
    const qName = searchParams.get('name');
    const qEmail = searchParams.get('email');
    if (qName) setName(qName);
    if (qEmail) setUserId(qEmail);
    if (isOAuth && !password) {
      setPassword(`OAuth2!${Math.random().toString(36).slice(2)}${Date.now()}`);
    }
  }, [searchParams, isOAuth, password]);

  // 학생 소셜 회원가입 Mutation 정의 (GUEST -> STUDENT)
  const signUpGuestAsStudent = useMutation({
    mutationFn: () => apiClient.post<{ accessToken: string }>('/api/sign-up/student-from-guest'),
    onSuccess: (res) => {
      if (res.data?.accessToken) {
        localStorage.setItem('tm_token', res.data.accessToken);
      }
      alert('학생으로 가입이 완료되었습니다!');
      router.push('/');
    },
    onError: (error) => {
      console.error('소셜 학생 가입 실패:', error);
      const response = (error as { response?: { data?: { message?: string; error?: string } } }).response;
      const serverMessage = response?.data?.message ?? response?.data?.error;
      alert(serverMessage ?? '가입 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    },
  });

  // 일반 학생 회원가입 Mutation 정의
  const signUpMutationAsStudent = useMutation({
    mutationFn: (signUpData: SignupData) =>
      apiClient.post('/api/sign-up/student', signUpData),
    onSuccess: () => {
      alert('학생 회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
      router.push('/login');
    },
    onError: (error) => {
      console.error('학생 회원가입 실패:', error);
      const response = (error as { response?: { data?: { message?: string; error?: string } } }).response;
      const serverMessage = response?.data?.message ?? response?.data?.error;
      alert(serverMessage ?? '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    },
  });

  // 역할 선택 핸들러
  const handleSelectRole = (role: 'STUDENT' | 'TUTOR') => {
    if (isOAuth) {
      if (role === 'STUDENT') {
        signUpGuestAsStudent.mutate();
      } else {
        router.push('/tutor-profile/setup?from=oauth');
      }
      return;
    }

    setSelectedRole(role);
    setStep('form');
  };

  // Form 제출 핸들러 (일반 회원가입)
  const handleSubmitSignup = (e: React.SubmitEvent) => {
    e.preventDefault();

    const payload = {
      name: name.trim(),
      userId: userId.trim(),
      userPassword: password.trim(),
    };

    if (selectedRole === 'STUDENT') {
      signUpMutationAsStudent.mutate(payload);
    } else {
      sessionStorage.setItem('pending-tutor-signup', JSON.stringify(payload));
      router.push('/tutor-profile/setup');
    }
  };

  if (step === 'choose') {
    return (
      <div className="max-w-lg mx-auto space-y-6 py-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">회원가입</h2>
          <p className="text-sm text-muted-foreground">어떤 역할로 시작하시겠어요?</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              role: 'STUDENT' as const,
              icon: BookOpen,
              title: '학생으로 시작',
              desc: '튜터를 찾고 레슨을 신청합니다',
              color: 'text-primary',
            },
            {
              role: 'TUTOR' as const,
              icon: GraduationCap,
              title: '튜터로 시작',
              desc: '전문 지식을 공유하고 수업합니다',
              color: 'text-accent',
            },
          ].map(({ role, icon: Icon, title, desc, color }) => (
            <button
              key={role}
              type="button"
              disabled={signUpGuestAsStudent.isPending}
              onClick={() => handleSelectRole(role)}
              className="flex flex-col items-center gap-3 p-6 bg-card border-2 border-border rounded-2xl hover:border-primary/50 transition-all hover:shadow-md cursor-pointer text-left group disabled:opacity-50"
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
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
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-accent font-medium hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 py-4">
      <div>
        <button
          type="button"
          onClick={() => setStep('choose')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 cursor-pointer"
        >
          <ArrowLeft size={14} /> 역할 선택으로
        </button>
        <h2 className="text-xl font-bold text-foreground">
          {selectedRole === 'STUDENT' ? '학생' : '튜터'} 회원가입
        </h2>
        <p className="text-sm text-muted-foreground mt-1">기본 정보를 입력해 주세요</p>
      </div>

      <form onSubmit={handleSubmitSignup} className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">성함</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors"
            placeholder="홍길동"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">아이디</label>
          <input
            type="text"
            required
            minLength={4}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors"
            placeholder="6자 이상 입력"
          />
        </div>

        {isOAuth ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-700">
            Google 계정으로 인증되었습니다. 비밀번호를 설정하지 않고 바로 가입을 진행합니다.
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">비밀번호</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors"
              placeholder="8자 이상 입력"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={signUpMutationAsStudent.isPending}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors mt-2 cursor-pointer shadow-sm"
        >
          {signUpMutationAsStudent.isPending
            ? '가입 중...'
            : selectedRole === 'TUTOR'
              ? '프로필 등록으로 이동'
              : '가입 완료'}
        </button>
      </form>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-muted-foreground">로딩 중...</div>}>
      <SignUpFormContent />
    </Suspense>
  );
}
