'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const GlobalChatButton = dynamic(() => import('./GlobalChatButton'), {
  ssr: false,
  loading: () => null,
});

const AIAssistant = dynamic(() => import('./AIAssistant'), {
  ssr: false,
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