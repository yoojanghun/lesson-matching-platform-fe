'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import { useUserStore } from '../../store/useUserStore';
import type { PaymentItem } from '../../types';
import { apiClient } from '../../lib/apiClient';

export interface PaymentResult {
  content: PaymentItem[];
  totalPages: number;
  totalElements: number;
  page: number;
}

// 결제 내역 조회 (백엔드 GET /api/payments)
export function usePaymentsQuery(page = 0, size = 10) {
  return useQuery({
    queryKey: [...queryKeys.payments.lists(), { page, size }],
    queryFn: async (): Promise<PaymentResult> => {
      const response = await apiClient.get<{
        content: Array<{
          paymentId: number;
          orderId: string;
          counterpartName?: string;
          tutorName?: string;
          amount: number;
          lessonCount?: number;
          paymentStatus: string;
          cancelReason?: string;
          createdAt: string;
          transferClaimedAt?: string;
          confirmedAt?: string;
          approvedAt?: string;
        }>;
        totalPages?: number;
        totalElements?: number;
        number?: number;
        page?: { size: number; number: number; totalElements: number; totalPages: number };
      }>('/api/payments', { params: { page, size } });

      const data = response.data;
      const totalPages = data.totalPages ?? data.page?.totalPages ?? (data.content?.length > 0 ? 1 : 0);
      const totalElements = data.totalElements ?? data.page?.totalElements ?? data.content?.length ?? 0;
      const pageNum = data.number ?? data.page?.number ?? page;

      return {
        content: data.content.map(payment => {
          const tutorName = payment.counterpartName || payment.tutorName || '선생님';
          const isDone = payment.paymentStatus === 'DONE';
          const isClaimed = payment.paymentStatus === 'TRANSFER_CLAIMED';

          return {
            id: payment.paymentId,
            orderId: payment.orderId,
            tutor: tutorName,
            subject: '레슨',
            avatar: '',
            lessonDate: payment.createdAt ? payment.createdAt.split(' ')[0] : '',
            lessonDay: payment.createdAt ? new Date(payment.createdAt.split(' ')[0]).toLocaleDateString('ko-KR', { weekday: 'short' }) : '',
            startTime: payment.createdAt && payment.createdAt.includes(' ') ? payment.createdAt.split(' ')[1].substring(0, 5) : '',
            endTime: payment.createdAt && payment.createdAt.includes(' ') ? payment.createdAt.split(' ')[1].substring(0, 5) : '',
            price: payment.amount,
            status: isDone ? 'paid' : isClaimed ? 'claimed' : 'unpaid',
            paymentStatus: payment.paymentStatus,
            paidAt: payment.confirmedAt || payment.approvedAt,
            transferClaimedAt: payment.transferClaimedAt,
          };
        }),
        totalPages,
        totalElements,
        page: pageNum,
      };
    },
    staleTime: 1000 * 30,
  });
}

// 결제 단건 상세 조회 (백엔드 GET /api/payments/{orderId})
export function usePaymentDetailQuery(orderId?: string | null) {
  return useQuery({
    queryKey: [...queryKeys.payments.all, 'detail', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const response = await apiClient.get<{
        paymentId: number;
        orderId: string;
        matchingId: number;
        tutorName: string;
        studentName?: string;
        amount: number;
        lessonCount: number;
        paymentStatus: 'PENDING_TRANSFER' | 'TRANSFER_CLAIMED' | 'DONE' | 'CANCELLED' | 'EXPIRED';
        cancelReason?: string;
        tutorBankName?: string;
        tutorBankAccountNumber?: string;
        tutorBankAccountHolder?: string;
        transferClaimedAt?: string;
        confirmedAt?: string;
        createdAt?: string;
        reservations: Array<{
          reservationId: number;
          lessonDate: string;
          startTime: string;
          endTime: string;
          appliedPrice: number;
        }>;
      }>(`/api/payments/${orderId}`);
      return response.data;
    },
    enabled: Boolean(orderId && !orderId.startsWith('mock-')),
    staleTime: 1000 * 10,
  });
}

// 학생의 이체 완료 신고 (백엔드 POST /api/payments/claim-transfer)
export function useClaimTransferMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiClient.post<{
        paymentId: number;
        orderId: string;
        amount: number;
        lessonCount: number;
        paymentStatus: string;
        transferClaimedAt: string;
        confirmedAt: string;
        createdAt: string;
      }>('/api/payments/claim-transfer', { orderId });
      return response.data;
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.payments.all, 'detail', orderId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
    },
  });
}

// 학생의 결제 취소 요청 (백엔드 POST /api/payments/cancel-by-student)
export function useCancelPaymentByStudentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { orderId: string; cancelReason?: string }) => {
      const response = await apiClient.post<{
        paymentId: number;
        orderId: string;
        amount: number;
        lessonCount: number;
        paymentStatus: string;
        cancelReason: string;
        createdAt: string;
      }>('/api/payments/cancel-by-student', payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.payments.all, 'detail', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
    },
  });
}

// 결제 준비 (/api/payments/prepare) Mutation
export function usePreparePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { matchingId: number; reservationId?: number[]; lessonCount?: number }) => {
      const response = await apiClient.post<{
        orderId: string;
        amount: number;
        lessonCount: number;
        orderName: string;
        paymentStatus: string;
        tutorBankName: string;
        tutorBankAccountNumber: string;
        tutorBankAccountHolder: string;
      }>('/api/payments/prepare', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
    },
  });
}

// 결제 승인 (/api/payments/confirm) Mutation
export function useConfirmPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { paymentKey: string; orderId: string; amount: number }) => {
      const response = await apiClient.post<{
        paymentId: number;
        orderId: string;
        amount: number;
        paymentMethod: string;
        paymentStatus: string;
        approvedAt: string;
      }>('/api/payments/confirm', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
    },
  });
}

// 개별 결제 진행 Mutation
export function usePayItemMutation() {
  const queryClient = useQueryClient();
  const payItemStore = useUserStore((state) => state.payItem);

  return useMutation({
    mutationFn: async (paymentId: number) => {
      payItemStore(paymentId);
      return { success: true, paymentId };
    },
    onSuccess: () => {
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
