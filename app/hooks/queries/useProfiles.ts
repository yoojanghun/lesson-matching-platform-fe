'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { queryKeys } from '../../lib/queryKeys';

export interface ProfileTypeDto {
  id?: number;
  goalId?: number;
  styleType?: string;
  lessonGoalType?: string;
  description?: string;
}

export interface ProfileCategoryDto {
  categoryId: number;
  categoryType?: string;
}

export interface ProfileSubjectDto {
  subjectId: number;
  subjectType?: string;
}

export interface ProfileLocationDto {
  locationId: number;
  name: string;
}

export interface StudentProfileResponse {
  name: string;
  gender: string;
  birthDate: string;
  email: string;
  phoneNumber: string;
  styles: ProfileTypeDto[];
  instruments: ProfileCategoryDto[];
  goals: ProfileTypeDto[];
  locations: ProfileLocationDto[];
  introduction: string | null;
  lessonType: string | null;
  budgetType: string | null;
}

export interface TutorProfileResponse {
  name: string;
  gender: string;
  birthDate: string;
  email: string;
  phoneNumber: string;
  title: string | null;
  content: string | null;
  introduction: string | null;
  career: string | null;
  locations: ProfileLocationDto[];
  categories: ProfileCategoryDto[];
  subjects: ProfileSubjectDto[];
  styles: ProfileTypeDto[];
}

export interface StudentProfileRequest {
  phoneNumber?: string;
  styleIds?: number[];
  categoryIds?: number[];
  goalIds?: number[];
  locationIds?: number[];
  introduction?: string;
  lessonType?: string;
  budgetType?: string;
}

export interface TutorProfileRequest {
  phoneNumber?: string;
  styleIds?: number[];
  categoryIds?: number[];
  subjectIds?: number[];
  locationIds?: number[];
  title?: string;
  career?: string;
  content?: string;
  introduction?: string;
}

export function useStudentProfileQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.profiles.student,
    queryFn: () => apiClient.get<StudentProfileResponse>('/api/profile/student/me').then((response) => response.data),
    enabled,
  });
}

export function useTutorProfileQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.profiles.tutor,
    queryFn: () => apiClient.get<TutorProfileResponse>('/api/profile/tutor/me').then((response) => response.data),
    enabled,
  });
}

export function useSaveStudentProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: StudentProfileRequest) =>
      apiClient.put('/api/profile/student/me', request).then(() => request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.student });
    },
  });
}

export function useSaveTutorProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: TutorProfileRequest) =>
      apiClient.put('/api/profile/tutor/me', request).then(() => request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.tutor });
    },
  });
}
