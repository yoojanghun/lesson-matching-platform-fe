'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import { TUTORS } from '../../data/mockData';
import type { Tutor } from '../../types';
import { apiClient } from '../../lib/apiClient';

interface TutorCardResponse {
  tutorId: number;
  name: string;
  title: string | null;
  goalTypeDtoList?: Array<{ lessonGoalType?: string }>;
  categoryTypeDtoList?: Array<{ categoryType?: string }>;
  subjectTypeDtoList?: Array<{ subjectType?: string }>;
  priceRange?: { minPrice?: number; maxPrice?: number };
  reviewCount?: number;
  averageRating?: number;
}

interface TutorSearchPage {
  content: TutorCardResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export interface TutorSearchResult {
  content: Tutor[];
  totalPages: number;
  totalElements: number;
  page: number;
}

interface TutorProfileResponse {
  tutorId: number;
  name: string;
  gender?: string | null;
  birthDate?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  isBirthDatePublic?: boolean | null;
  isEmailPublic?: boolean | null;
  isPhoneNumberPublic?: boolean | null;
  title?: string | null;
  educations?: string[] | null;
  introduction?: string | null;
  experiences?: string[] | null;
  subjects?: Array<{ subjectId?: number; subjectType?: string }>;
  categories?: Array<{ categoryId?: number; categoryType?: string }>;
  locations?: Array<{ locationId?: number; name?: string }>;
  styles?: Array<{ id?: number; styleType?: string; description?: string }>;
  goals?: Array<{ goalId?: number; lessonGoalType?: string }>;
  prices?: Array<{ className?: string; price?: number }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  PIANO: '피아노',
  VIOLIN: '바이올린',
  CELLO: '첼로',
  GUITAR: '기타',
  DRUM: '드럼',
  VOCAL: '보컬',
  COMPOSITION: '작곡',
};

const SUBJECT_LABELS: Record<string, string> = {
  CLASSICAL: '클래식',
  JAZZ: '재즈',
  NEWAGE: '뉴에이지',
  POP: '팝',
  CCM: 'CCM',
  ACOUSTIC: '통기타',
  ELECTRIC: '일렉기타',
  BASS: '베이스',
  METAL: '메탈',
  MUSICAL: '뮤지컬',
  MIDI: '미디',
};

const STYLE_LABELS: Record<string, string> = {
  KIND_AND_WARM: '친절하고 따뜻한 선생님',
  STRUCTURED_AND_STRICT: '체계적이고 엄격한 선생님',
  FREE_AND_CREATIVE: '자유롭고 창의적인 수업',
  COMMUNICATION_AND_FEEDBACK: '소통·피드백 중심',
  RESULT_AND_SKILL: '결과·실력 중심',
  HUMOROUS_AND_FUN: '유머 있고 재미있는 수업',
  THEORY_AND_PRINCIPLE: '이론·원리 설명 중심',
  ANY: '상관없음',
};

function displayCategory(value?: string) {
  if (!value) return undefined;
  return CATEGORY_LABELS[value] ?? value;
}

function displaySubject(value?: string) {
  if (!value) return undefined;
  const [, subject] = value.split('_');
  return SUBJECT_LABELS[subject] ?? subject ?? value;
}

function displayStyle(value?: string, desc?: string) {
  if (desc) return desc;
  if (!value) return undefined;
  return STYLE_LABELS[value] ?? value;
}

function fallbackTutor(tutorId: number) {
  return TUTORS.find((tutor) => tutor.id === tutorId);
}

function toTutor(response: TutorCardResponse): Tutor {
  const fallback = fallbackTutor(response.tutorId);
  const subjects = response.subjectTypeDtoList?.map((item) => displaySubject(item.subjectType)).filter(Boolean) as string[] | undefined;
  const categories = response.categoryTypeDtoList?.map((item) => displayCategory(item.categoryType)).filter(Boolean) as string[] | undefined;
  const displaySubjects = [...new Set([...(categories ?? []), ...(subjects ?? [])])];
  const minPrice = response.priceRange?.minPrice ?? fallback?.price ?? 0;

  return {
    id: response.tutorId,
    name: response.name,
    title: response.title ?? fallback?.title,
    subject: displaySubjects.join(' · ') || fallback?.subject || '음악 레슨',
    lessonGoals: response.goalTypeDtoList?.map((item) => item.lessonGoalType).filter(Boolean) as string[] | undefined,
    rating: response.averageRating ?? fallback?.rating ?? 0,
    reviews: response.reviewCount ?? fallback?.reviews ?? 0,
    price: minPrice,
    tags: subjects ?? fallback?.tags ?? [],
    intro: response.title ?? fallback?.intro ?? '맞춤형 레슨을 제공합니다.',
    avatar: fallback?.avatar ?? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format',
    available: fallback?.available ?? true,
    location: fallback?.location,
    lessonLocations: fallback?.lessonLocations,
    onlineAvailable: fallback?.onlineAvailable,
  };
}

function toTutorFromProfile(response: TutorProfileResponse): Tutor {
  const fallback = fallbackTutor(response.tutorId);
  const subjects = response.subjects?.map((item) => displaySubject(item.subjectType)).filter(Boolean) as string[] | undefined;
  const categories = response.categories?.map((item) => displayCategory(item.categoryType)).filter(Boolean) as string[] | undefined;
  const displaySubjects = [...new Set([...(categories ?? []), ...(subjects ?? [])])];
  const locations = response.locations?.map((item) => item.name).filter(Boolean) as string[] | undefined;
  const prices = response.prices?.map((item) => item.price).filter((price): price is number => price !== undefined) ?? [];

  // 백엔드 data.sql의 경력 (experiences: 문자열 배열)을 프론트엔드 Career 객체 형태로 변환
  const careers = response.experiences && response.experiences.length > 0
    ? response.experiences.map((exp, idx) => ({
        period: `경력 ${idx + 1}`,
        title: exp,
        org: '',
      }))
    : fallback?.careers;

  // 백엔드 data.sql의 수업 스타일 (styles)
  const styles = response.styles && response.styles.length > 0
    ? response.styles.map((s) => displayStyle(s.styleType, s.description)).filter(Boolean) as string[]
    : fallback?.lessonStyle;

  // 백엔드 data.sql의 레슨 목표 (goals)
  const goals = response.goals && response.goals.length > 0
    ? (response.goals.map((g) => g.lessonGoalType).filter(Boolean) as string[])
    : fallback?.lessonGoals;

  // 백엔드 data.sql의 레슨비 (prices)
  const lessonOptions = response.prices && response.prices.length > 0
    ? response.prices.map((p, index) => ({
        label: p.className || (index === 0 ? '기본 수업' : `레슨 ${index + 1}`),
        duration: '60분',
        price: p.price ?? 0,
      }))
    : fallback?.lessonOptions;

  return {
    id: response.tutorId,
    name: response.name,
    title: response.title ?? fallback?.title,
    subject: displaySubjects.join(' · ') || fallback?.subject || '음악 레슨',
    rating: fallback?.rating ?? 0,
    reviews: fallback?.reviews ?? 0,
    price: prices[0] ?? fallback?.price ?? 0,
    tags: subjects?.length ? subjects : (fallback?.tags ?? []),
    intro: response.introduction ?? response.title ?? fallback?.intro ?? '맞춤형 레슨을 제공합니다.',
    fullIntro: response.introduction ?? fallback?.fullIntro,
    avatar: fallback?.avatar ?? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format',
    available: fallback?.available ?? true,
    lessonLocations: locations?.length ? locations : fallback?.lessonLocations,
    location: locations?.[0] ?? fallback?.location,
    lessonOptions,
    lessonGoals: goals,
    lessonStyle: styles,
    education: response.educations && response.educations.length > 0 ? response.educations : fallback?.education,
    careers,
    birthDate: response.birthDate ?? fallback?.birthDate,
    email: response.email ?? fallback?.email,
    phoneNumber: response.phoneNumber ?? fallback?.phoneNumber,
    birthDatePublic: response.isBirthDatePublic ?? fallback?.birthDatePublic,
    emailPublic: response.isEmailPublic ?? fallback?.emailPublic,
    phoneNumberPublic: response.isPhoneNumberPublic ?? fallback?.phoneNumberPublic,
  };
}

// 튜터 목록 조회 훅 (5분 캐시)
export function useTutorsQuery(filters?: {
  category?: string;
  subject?: string;
  categoryIds?: number[];
  subjectIds?: number[];
  locationIds?: number[];
  goalIds?: number[];
  styleIds?: number[];
  lessonType?: string;
  tutorSortType?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: queryKeys.tutors.list(filters),
    queryFn: async (): Promise<TutorSearchResult> => {
      const response = await apiClient.get<TutorSearchPage>('/api/tutors/search', {
        params: {
          keyword: filters?.search?.trim() || undefined,
          categoryIds: filters?.categoryIds?.join(','),
          subjectIds: filters?.subjectIds?.join(','),
          locationIds: filters?.locationIds?.join(','),
          goalIds: filters?.goalIds?.join(','),
          styleIds: filters?.styleIds?.join(','),
          lessonType: filters?.lessonType,
          tutorSortType: filters?.tutorSortType,
          minPrice: filters?.minPrice,
          maxPrice: filters?.maxPrice,
          page: filters?.page ?? 0,
          size: filters?.size ?? 8,
        },
      });
      return {
        content: response.data.content.map(toTutor),
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
        page: response.data.number,
      };
    },
    staleTime: 1000 * 60 * 5, // 5분간 신선 상태 유지
  });
}

// 튜터 상세 조회 훅
export function useTutorDetailQuery(tutorId: number) {
  return useQuery({
    queryKey: queryKeys.tutors.detail(tutorId),
    queryFn: async (): Promise<Tutor | undefined> => {
      const response = await apiClient.get<TutorProfileResponse>(`/api/tutors/${tutorId}/profile`);
      return toTutorFromProfile(response.data);
    },
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(tutorId),
  });
}

// 인기 튜터 조회 훅
export function useTrendingTutorsQuery(categoryId?: number) {
  return useQuery({
    queryKey: queryKeys.tutors.list({ type: 'trending', categoryId }),
    queryFn: async (): Promise<Tutor[]> => {
      const response = await apiClient.get<TutorCardResponse[]>('/api/main/trending', {
        params: { categoryId },
      });
      return response.data.map(toTutor);
    },
    staleTime: 1000 * 60 * 5,
  });
}

// 최신 튜터 조회 훅
export function useRookieTutorsQuery(categoryId?: number) {
  return useQuery({
    queryKey: queryKeys.tutors.list({ type: 'rookie', categoryId }),
    queryFn: async (): Promise<Tutor[]> => {
      const response = await apiClient.get<TutorCardResponse[]>('/api/main/rookie', {
        params: { categoryId },
      });
      return response.data.map(toTutor);
    },
    staleTime: 1000 * 60 * 5,
  });
}
