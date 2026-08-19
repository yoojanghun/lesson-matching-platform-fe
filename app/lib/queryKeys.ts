/**
 * TanStack Query Keys Factory
 * 일관된 캐시 관리 및 Invalidation을 위한 키 정의
 */
export const queryKeys = {
  // 튜터 관련 키
  tutors: {
    all: ['tutors'] as const,
    lists: () => [...queryKeys.tutors.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.tutors.lists(), filters] as const,
    details: () => [...queryKeys.tutors.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.tutors.details(), id] as const,
  },

  // 매칭 관련 키
  matchings: {
    all: ['matchings'] as const,
    lists: () => [...queryKeys.matchings.all, 'list'] as const,
    list: (role: string) => [...queryKeys.matchings.lists(), role] as const,
    detail: (id: number) => [...queryKeys.matchings.all, 'detail', id] as const,
  },

  // 레슨 예약 관련 키
  bookings: {
    all: ['bookings'] as const,
    lists: () => [...queryKeys.bookings.all, 'list'] as const,
    list: (role: string) => [...queryKeys.bookings.lists(), role] as const,
    detail: (id: number) => [...queryKeys.bookings.all, 'detail', id] as const,
  },

  // 결제 관련 키
  payments: {
    all: ['payments'] as const,
    lists: () => [...queryKeys.payments.all, 'list'] as const,
    list: (role: string) => [...queryKeys.payments.lists(), role] as const,
    detail: (id: number) => [...queryKeys.payments.all, 'detail', id] as const,
  },

  // 리뷰 관련 키
  reviews: {
    all: ['reviews'] as const,
    byTutor: (tutorId: number) => [...queryKeys.reviews.all, 'tutor', tutorId] as const,
  },

  // 카테고리 / 과목 관련 키
  categories: {
    all: ['categories'] as const,
    subjects: (categoryId?: number) => [...queryKeys.categories.all, 'subjects', categoryId] as const,
  },
};
