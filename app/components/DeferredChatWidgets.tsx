'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const GlobalChatButton = dynamic(() => import('./GlobalChatButton'), {
  loading: () => null,
});

const AIAssistant = dynamic(() => import('./AIAssistant'), {
  loading: () => null,
});

const AUTH_PATHS = new Set(['/login', '/signup']);

export default function DeferredChatWidgets() {
  const pathname = usePathname();

  if (AUTH_PATHS.has(pathname)) return null;

  return (
    <>
      <GlobalChatButton />
      <AIAssistant />
    </>
  );
}