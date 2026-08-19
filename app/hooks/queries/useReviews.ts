'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import { useUserStore } from '../../store/useUserStore';
import type { Review } from '../../types';
import { REVIEWS } from '../../data/mockData';

// 리뷰 목록 조회
export function useReviewsQuery(tutorId?: number) {
  const storeReviews = useUserStore((state) => state.reviews);

  return useQuery({
    queryKey: tutorId ? queryKeys.reviews.byTutor(tutorId) : queryKeys.reviews.all,
    queryFn: async (): Promise<Review[]> => {
      // API 연동 시: const res = await fetch(`/api/v1/lessons/reviews?tutorId=${tutorId}`); return res.json();
      return storeReviews.length > 0 ? storeReviews : REVIEWS;
    },
    staleTime: 1000 * 60 * 3, // 3분
  });
}

// 리뷰 등록 Mutation
export function useCreateReviewMutation() {
  const queryClient = useQueryClient();
  const addReviewStore = useUserStore((state) => state.addReview);

  return useMutation({
    mutationFn: async (payload: { tutorId: number; rating: number; content: string }) => {
      // API 연동 시: const res = await fetch('/api/v1/lessons/reviews', { method: 'POST', body: JSON.stringify(payload) }); return res.json();
      addReviewStore(payload.tutorId, payload.rating, payload.content);
      return { success: true };
    },
    onSuccess: (_, variables) => {
      // 해당 튜터 리뷰 및 전체 리뷰 캐시 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byTutor(variables.tutorId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
    },
  });
}
