'use client';

import React from 'react';
import Link from 'next/link';
import { LockKeyhole } from 'lucide-react';

interface LoginGateProps {
  title?: string;
  description?: string;
  loginPath?: string;
  signupPath?: string;
}

export default function LoginGate({
  title = "로그인이 필요한 서비스입니다",
  description = "이 기능을 사용하려면 먼저 로그인해 주세요.",
  loginPath = "/login",
  signupPath = "/signup",
}: LoginGateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="bg-card rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-10 flex flex-col items-center gap-6 max-w-sm w-full text-center border border-border">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
          <LockKeyhole size={28} className="text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex flex-col gap-2.5 w-full pt-2">
          <Link
            href={loginPath}
            className="w-full py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-center inline-block"
          >
            로그인
          </Link>
          <Link
            href={signupPath}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-secondary text-primary hover:bg-secondary/80 transition-colors text-center inline-block"
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
