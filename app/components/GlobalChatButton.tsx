'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { useUser } from './UserContext';

export default function GlobalChatButton() {
  const pathname = usePathname();

  // 채팅 페이지 또는 자체 1:1 플로팅 위젯이 있는 강사 상세 페이지에서는 제외
  if (pathname === '/chat' || pathname.startsWith('/tutors/')) {
    return null;
  }

  return (
    <Link
      href="/chat"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center hover:bg-primary/90 hover:scale-105 transition-all cursor-pointer border-2 border-white/20"
      title="채팅 목록 열기"
    >
      <MessageCircle size={24} className="text-white stroke-[2.2]" />
      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#e05a2b] text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
        3
      </span>
    </Link>
  );
}
