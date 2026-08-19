'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, GraduationCap } from 'lucide-react';
import { useUser } from '../components/UserContext';

export default function SignUpPage() {
  const router = useRouter();
  const { signup } = useUser();
  const [step, setStep] = useState<'choose' | 'form'>('choose');
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'TUTOR'>('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subject, setSubject] = useState('');
  const [careerIntro, setCareerIntro] = useState('');

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    signup(selectedRole, name.trim());
    router.push('/');
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
              onClick={() => {
                setSelectedRole(role);
                setStep('form');
              }}
              className="flex flex-col items-center gap-3 p-6 bg-card border-2 border-border rounded-2xl hover:border-primary/50 transition-all hover:shadow-md cursor-pointer text-left group"
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

      <form onSubmit={handleSignUp} className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">이름</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors"
            placeholder="홍길동"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">이메일</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">비밀번호</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors"
            placeholder="6자 이상 입력"
          />
        </div>

        {selectedRole === 'TUTOR' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">전문 악기 / 과목</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors"
                placeholder="예: 피아노, 기타, 바이올린"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">경력 소개</label>
              <textarea
                value={careerIntro}
                onChange={(e) => setCareerIntro(e.target.value)}
                rows={3}
                className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors resize-none"
                placeholder="학력 및 주요 레슨 경력을 적어주세요"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors mt-2 cursor-pointer shadow-sm"
        >
          가입 완료
        </button>
      </form>
    </div>
  );
}
