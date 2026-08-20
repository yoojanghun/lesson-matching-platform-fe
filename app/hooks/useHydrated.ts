'use client';

import { useState, useEffect } from 'react';

/**
 * useHydrated: Next.js SSR과 클라이언트 로컬스토리지 상태 간의
 * Hydration Mismatch를 방지하기 위한 안전 훅
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
