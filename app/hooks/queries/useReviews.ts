'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import type { Review } from '../../types';
import { apiClient } from '../../lib/apiClient';

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

// 리뷰 목록 조회
export function useReviewsQuery(tutorId?: number) {
  return useQuery({
    queryKey: tutorId ? queryKeys.reviews.byTutor(tutorId) : queryKeys.reviews.all,
    queryFn: async (): Promise<Review[]> => {
      if (!tutorId) return [];
      const response = await apiClient.get<ReviewSlice>(`/api/tutors/${tutorId}/reviews`, {
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
    staleTime: 1000 * 60 * 3, // 3분
  });
}

// 리뷰 등록 Mutation
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
