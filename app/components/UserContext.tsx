'use client';

import React from 'react';
import { useUserStore, Role, TestAccount, MOCK_ACCOUNTS } from '../store/useUserStore';

export type { Role, TestAccount };
export { MOCK_ACCOUNTS };

export function UserProvider({ children }: { children: React.ReactNode }) {
  // Zustand handles state and persistence globally without Context Provider.
  // Kept for backward compatibility with root layout.
  return <>{children}</>;
}

export function useUser() {
  return useUserStore();
}
