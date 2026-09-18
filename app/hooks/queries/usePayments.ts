'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import { useUserStore } from '../../store/useUserStore';
import type { PaymentItem } from '../../types';
import { apiClient } from '../../lib/apiClient';

// 결제 내역 조회
export function usePaymentsQuery() {
  const storePayments = useUserStore((state) => state.payments);

  return useQuery({
    queryKey: queryKeys.payments.lists(),
    queryFn: async (): Promise<PaymentItem[]> => {
      const response = await apiClient.get<{ content: Array<{
        paymentId: number;
        orderId: string;
        tutorName: string;
        amount: number;
        paymentStatus: string;
        createdAt: string;
        approvedAt?: string;
      }> }>('/api/payments', { params: { page: 0, size: 50 } });

      return response.data.content.map(payment => ({
        id: payment.paymentId,
        tutor: payment.tutorName,
        subject: '레슨',
        avatar: '',
        lessonDate: payment.createdAt.split(' ')[0], // fallback
        lessonDay: new Date(payment.createdAt.split(' ')[0]).toLocaleDateString('ko-KR', { weekday: 'short' }),
        startTime: payment.createdAt.split(' ')[1].substring(0, 5),
        endTime: payment.createdAt.split(' ')[1].substring(0, 5),
        price: payment.amount,
        status: payment.paymentStatus === 'DONE' ? 'paid' : 'unpaid',
        paidAt: payment.approvedAt,
      }));
    },
    staleTime: 1000 * 30,
  });
}

// 개별 결제 진행 Mutation
export function usePayItemMutation() {
  const queryClient = useQueryClient();
  const payItemStore = useUserStore((state) => state.payItem);

  return useMutation({
    mutationFn: async (paymentId: number) => {
      // API 연동 시: Toss 결제 승인 API 호출
      // const res = await fetch('/api/v1/payments/toss/approve', { method: 'POST', body: JSON.stringify({ paymentId }) });
      payItemStore(paymentId);
      return { success: true, paymentId };
    },
    onSuccess: () => {
      // 결제 성공 시 결제 내역 및 수업 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
    },
  });
}

// 전체 일괄 결제 Mutation
export function usePayAllMutation() {
  const queryClient = useQueryClient();
  const payAllStore = useUserStore((state) => state.payAllUnpaid);

  return useMutation({
    mutationFn: async () => {
      payAllStore();
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
    },
  });
}
