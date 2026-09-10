'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import { useUserStore } from '../../store/useUserStore';
import type { LessonBooking } from '../../types';
import { MY_LESSON_BOOKINGS } from '../../data/mockData';
import { apiClient } from '../../lib/apiClient';

// 수업 예약 목록 조회
export function useBookingsQuery(role: 'STUDENT' | 'TUTOR' = 'STUDENT') {
  const storeBookings = useUserStore((state) => state.bookings);

  return useQuery({
    queryKey: [...queryKeys.bookings.lists(), role],
    queryFn: async (): Promise<LessonBooking[]> => {
      if (role === 'TUTOR') {
        const response = await apiClient.get<{ content: Array<{
          reservationId: number;
          studentName: string;
          lessonDate: string;
          startTime: string;
          endTime: string;
          reservationStatus: string;
          createdAt: string;
        }> }>('/api/reservations/my', { params: { page: 0, size: 50 } });

        return response.data.content.map((reservation) => ({
          id: reservation.reservationId,
          tutor: reservation.studentName,
          subject: '레슨',
          avatar: '',
          lessonDate: reservation.lessonDate,
          lessonDay: new Date(`${reservation.lessonDate}T00:00:00`).toLocaleDateString('ko-KR', { weekday: 'short' }),
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          price: 0,
          status: reservation.reservationStatus === 'CONFIRMED'
            ? 'confirmed'
            : reservation.reservationStatus === 'REJECTED'
              ? 'rejected'
              : 'pending',
          requestedAt: reservation.createdAt,
        }));
      }

      return storeBookings.length > 0 ? storeBookings : MY_LESSON_BOOKINGS;
    },
    staleTime: 1000 * 30,
  });
}

// 수업 예약 신청 Mutation
export function useCreateBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      matchingId: number;
      tutorId: number;
      date: string;
      requestMsg: string;
      dayOfWeek: string;
      startTime: string;
      endTime: string;
    }) => {
      return apiClient.post(`/api/reservations/matchings/${payload.matchingId}/tutors/${payload.tutorId}`, {
        date: payload.date,
        requestMsg: payload.requestMsg,
        dayOfWeek: payload.dayOfWeek,
        startTime: payload.startTime,
        endTime: payload.endTime,
      });
    },
    onSuccess: () => {
      // 예약 및 결제 목록 캐시를 동시에 무효화 (예약 신청 시 결제 대기 건도 발생하므로)
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
    },
  });
}

export function useUpdateReservationStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { reservationId: number; status: 'confirmed' | 'rejected' }) =>
      apiClient.patch(`/api/reservations/${payload.reservationId}/status`, {
        reservationStatus: payload.status.toUpperCase(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
    },
  });
}

export function useCancelReservationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: number) =>
      apiClient.patch(`/api/reservations/${reservationId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
    },
  });
}
