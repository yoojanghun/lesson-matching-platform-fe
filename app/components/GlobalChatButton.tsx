'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { useUserStore } from '../store/useUserStore';

interface ChatRoomSummary {
  unreadCount: number;
}

export default function GlobalChatButton() {
  const pathname = usePathname();
  const role = useUserStore((state) => state.role);
  const userId = useUserStore((state) => state.userId);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    if (!userId || role === 'GUEST') {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await apiClient.get<ChatRoomSummary[]>('/api/chat/rooms');
      const total = response.data.reduce((sum, room) => sum + Math.max(0, room.unreadCount || 0), 0);
      setUnreadCount(total);
    } catch (error) {
      console.error('읽지 않은 채팅 수 조회 실패', error);
    }
  }, [role, userId]);

  useEffect(() => {
    const initialLoadId = window.setTimeout(() => {
      void loadUnreadCount();
    }, 0);

    const handleFocus = () => {
      void loadUnreadCount();
    };
    window.addEventListener('focus', handleFocus);

    const intervalId = window.setInterval(() => {
      void loadUnreadCount();
    }, 30000);

    return () => {
      window.clearTimeout(initialLoadId);
      window.removeEventListener('focus', handleFocus);
      window.clearInterval(intervalId);
    };
  }, [loadUnreadCount]);

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
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-[#e05a2b] text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
