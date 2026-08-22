'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import { TUTORS } from '../../data/mockData';
import type { Tutor } from '../../types';

// 튜터 목록 조회 훅 (5분 캐시)
export function useTutorsQuery(filters?: { category?: string; subject?: string; region?: string; search?: string }) {
  return useQuery({
    queryKey: queryKeys.tutors.list(filters),
    queryFn: async (): Promise<Tutor[]> => {
      // API 연동 시: const res = await fetch(`/api/v1/tutors?...`); return res.json();
      let list = [...TUTORS];
      if (filters?.category && filters.category !== '전체') {
        const categoryQuery = filters.category.toLowerCase();
        list = list.filter((t) => t.subject.toLowerCase().includes(categoryQuery));
      }
      if (filters?.subject && filters.subject !== '전체') {
        const subjectQuery = filters.subject.toLowerCase();
        list = list.filter(
          (t) =>
            t.subject.toLowerCase().includes(subjectQuery) ||
            t.tags.some((tag) => tag.toLowerCase().includes(subjectQuery))
        );
      }
      if (filters?.region && filters.region !== '전체') {
        const regionQuery = filters.region.toLowerCase();
        list = list.filter((t) => t.location?.toLowerCase().includes(regionQuery));
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.subject.toLowerCase().includes(q) ||
            t.intro.toLowerCase().includes(q)
        );
      }
      return list;
    },
    staleTime: 1000 * 60 * 5, // 5분간 신선 상태 유지
  });
}

// 튜터 상세 조회 훅
export function useTutorDetailQuery(tutorId: number) {
  return useQuery({
    queryKey: queryKeys.tutors.detail(tutorId),
    queryFn: async (): Promise<Tutor | undefined> => {
      // API 연동 시: const res = await fetch(`/api/v1/tutors/${tutorId}`); return res.json();
      return TUTORS.find((t) => t.id === tutorId);
    },
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(tutorId),
  });
}
