'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import { useUserStore } from '../../store/useUserStore';
import type { StudentMatching, TutorMatching } from '../../types';
import { MY_MATCHINGS_STUDENT, MY_MATCHINGS_TUTOR } from '../../data/mockData';

// 매칭 목록 조회
export function useMatchingsQuery(role: 'STUDENT' | 'TUTOR') {
  return useQuery({
    queryKey: queryKeys.matchings.list(role),
    queryFn: async (): Promise<(StudentMatching | TutorMatching)[]> => {
      // API 연동 시: const res = await fetch(`/api/v1/lessons/matchings?role=${role}`); return res.json();
      return role === 'STUDENT' ? MY_MATCHINGS_STUDENT : MY_MATCHINGS_TUTOR;
    },
    staleTime: 1000 * 30, // 30초
  });
}

// 매칭 신청 Mutation
export function useCreateMatchingMutation() {
  const queryClient = useQueryClient();
  const addMatchingStore = useUserStore((state) => state.addMatching);

  return useMutation({
    mutationFn: async (payload: { tutorId: number; message: string; schedule: string }) => {
      // API 연동 시: const res = await fetch('/api/v1/lessons/matchings', { method: 'POST', body: JSON.stringify(payload) }); return res.json();
      addMatchingStore(payload.tutorId, payload.message, payload.schedule);
      return { success: true };
    },
    onSuccess: () => {
      // 매칭 목록 캐시 무효화 -> 자동 갱신 트리거
      queryClient.invalidateQueries({ queryKey: queryKeys.matchings.lists() });
    },
  });
}

// 매칭 승인/거절 Mutation
export function useUpdateMatchingStatusMutation() {
  const queryClient = useQueryClient();
  const updateMatchingStatusStore = useUserStore((state) => state.updateMatchingStatus);

  return useMutation({
    mutationFn: async (payload: { id: number; status: 'accepted' | 'rejected' }) => {
      // API 연동 시: const res = await fetch(`/api/v1/lessons/matchings/${payload.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: payload.status }) }); return res.json();
      updateMatchingStatusStore(payload.id, payload.status);
      return { success: true, ...payload };
    },
    onSuccess: () => {
      // 승인/거절 성공 시 즉시 매칭 캐시 무효화하여 최신 데이터 재조회
      queryClient.invalidateQueries({ queryKey: queryKeys.matchings.lists() });
    },
  });
}
