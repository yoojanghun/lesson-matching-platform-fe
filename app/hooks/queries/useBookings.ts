'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import { useUserStore } from '../../store/useUserStore';
import type { LessonBooking } from '../../types';
import { MY_LESSON_BOOKINGS } from '../../data/mockData';

// 수업 예약 목록 조회
export function useBookingsQuery() {
  const storeBookings = useUserStore((state) => state.bookings);

  return useQuery({
    queryKey: queryKeys.bookings.lists(),
    queryFn: async (): Promise<LessonBooking[]> => {
      // API 연동 시: const res = await fetch('/api/v1/lessons/bookings'); return res.json();
      return storeBookings.length > 0 ? storeBookings : MY_LESSON_BOOKINGS;
    },
    staleTime: 1000 * 30,
  });
}

// 수업 예약 신청 Mutation
export function useCreateBookingMutation() {
  const queryClient = useQueryClient();
  const addBookingStore = useUserStore((state) => state.addBooking);

  return useMutation({
    mutationFn: async (payload: Omit<LessonBooking, 'id' | 'requestedAt'>) => {
      addBookingStore(payload);
      return { success: true };
    },
    onSuccess: () => {
      // 예약 및 결제 목록 캐시를 동시에 무효화 (예약 신청 시 결제 대기 건도 발생하므로)
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
    },
  });
}
