'use client';

import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import type { Review } from '../../types';
import { apiClient } from '../../lib/apiClient';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 인증 없이 공개 GET 요청용 인스턴스
const publicClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

interface ReviewResponse {
  reviewId: number;
  content: string;
  rating: number;
  nickName: string;
  createdAt: string;
}

interface ReviewSlice {
  content: ReviewResponse[];
}

// 리뷰 목록 조회 (GUEST 포함 누구나 가능 - 인증 토큰 없이 요청)
export function useReviewsQuery(tutorId?: number, enabled = true) {
  return useQuery({
    queryKey: tutorId ? queryKeys.reviews.byTutor(tutorId) : queryKeys.reviews.all,
    queryFn: async (): Promise<Review[]> => {
      if (!tutorId) return [];
      const response = await publicClient.get<ReviewSlice>(`/api/tutors/${tutorId}/reviews`, {
        params: { page: 0, size: 20 },
      });
      return response.data.content.map((review) => ({
        id: review.reviewId,
        student: review.nickName,
        rating: review.rating,
        date: new Date(review.createdAt).toISOString().slice(0, 10),
        content: review.content,
      }));
    },
    enabled: Boolean(tutorId) && enabled,
    staleTime: 1000 * 60 * 3, // 3분
  });
}

// 리뷰 등록 Mutation (인증 필요 - apiClient 사용)
export function useCreateReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { tutorId: number; rating: number; content: string }) => {
      return apiClient.post<ReviewResponse>(`/api/tutors/${payload.tutorId}/reviews`, {
        content: payload.content,
        rating: payload.rating,
        isAnonymous: false,
      });
    },
    onSuccess: (_, variables) => {
      // 해당 튜터 리뷰 및 전체 리뷰 캐시 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byTutor(variables.tutorId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
    },
  });
}

export function useDeleteReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { tutorId: number; reviewId: number }) => {
      return apiClient.delete<void>(`/api/tutors/${payload.tutorId}/reviews/${payload.reviewId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byTutor(variables.tutorId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
    },
  });
}
