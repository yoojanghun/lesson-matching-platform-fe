'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import type { StudentMatching, TutorMatching } from '../../types';
import { apiClient } from '../../lib/apiClient';

export interface MatchingPage<T> {
  content: T[];
  totalPages?: number;
  totalElements?: number;
  number?: number;
  page?: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface MatchingResult<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  page: number;
}

interface StudentMatchingResponse {
  matchingId: number;
  tutorId: number;
  tutorName: string;
  subject?: string[];
  requestMsg: string;
  status: string;
  createdAt: string;
}

interface TutorMatchingResponse {
  matchingId: number;
  requestMsg: string;
  status: string;
  name: string;
  createdAt: string;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString().slice(0, 10);
}

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '협의 필요'
    : date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function normalizeStatus(status: string): 'pending' | 'accepted' | 'rejected' {
  if (status === 'ACCEPTED') return 'accepted';
  if (status === 'REJECTED' || status === 'CANCELLED') return 'rejected';
  return 'pending';
}

// 매칭 목록 조회
export function useMatchingsQuery(
  role: 'STUDENT' | 'TUTOR',
  page = 0,
  size = 10,
  enabled = true,
) {
  return useQuery({
    queryKey: [...queryKeys.matchings.list(role), { page, size }],
    queryFn: async (): Promise<MatchingResult<StudentMatching | TutorMatching>> => {
      if (role === 'STUDENT') {
        const response = await apiClient.get<MatchingPage<StudentMatchingResponse>>(
          '/api/matchings/student/my',
          { params: { page, size } },
        );
        const data = response.data;
        const totalPages = data.totalPages ?? data.page?.totalPages ?? (data.content?.length > 0 ? 1 : 0);
        const totalElements = data.totalElements ?? data.page?.totalElements ?? data.content?.length ?? 0;
        const pageNum = data.number ?? data.page?.number ?? page;

        return {
          content: data.content.map((matching) => ({
            id: matching.matchingId,
            tutor: matching.tutorName,
            subject: matching.subject?.join(' · ') || '레슨',
            date: formatDate(matching.createdAt),
            time: formatTime(matching.createdAt),
            status: normalizeStatus(matching.status),
            message: matching.requestMsg,
          })),
          totalPages,
          totalElements,
          page: pageNum,
        };
      }

      const response = await apiClient.get<MatchingPage<TutorMatchingResponse>>(
        '/api/matchings/tutor/my',
        { params: { page, size } },
      );
      const data = response.data;
      const totalPages = data.totalPages ?? data.page?.totalPages ?? (data.content?.length > 0 ? 1 : 0);
      const totalElements = data.totalElements ?? data.page?.totalElements ?? data.content?.length ?? 0;
      const pageNum = data.number ?? data.page?.number ?? page;

      return {
        content: data.content.map((matching) => ({
          id: matching.matchingId,
          student: matching.name,
          subject: '레슨 매칭',
          date: formatDate(matching.createdAt),
          time: formatTime(matching.createdAt),
          status: normalizeStatus(matching.status),
          message: matching.requestMsg,
        })),
        totalPages,
        totalElements,
        page: pageNum,
      };
    },
    enabled,
    staleTime: 1000 * 30, // 30초
  });
}

// 매칭 신청 Mutation
export function useCreateMatchingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { tutorId: number; message: string; schedule: string }) => {
      return apiClient.post<number>(`/api/matchings/tutors/${payload.tutorId}`, {
        requestMsg: [payload.schedule, payload.message].filter(Boolean).join(' / '),
      });
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

  return useMutation({
    mutationFn: async (payload: { id: number; status: 'accepted' | 'rejected' }) => {
      return apiClient.patch<number>(`/api/matchings/${payload.id}/status`, {
        status: payload.status.toUpperCase(),
      });
    },
    onSuccess: () => {
      // 승인/거절 성공 시 즉시 매칭 캐시 무효화하여 최신 데이터 재조회
      queryClient.invalidateQueries({ queryKey: queryKeys.matchings.lists() });
    },
  });
}

export function useSetMatchingPriceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { id: number; pricePerLesson: number }) =>
      apiClient.patch(`/api/matchings/${payload.id}/price`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matchings.lists() });
    },
  });
}
