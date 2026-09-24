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
  budgetTypes?: string[];
  budgetType?: string | null;
}

export interface TutorProfileResponse {
  name: string;
  gender: string;
  birthDate: string;
  email: string;
  phoneNumber: string;
  birthDatePublic?: boolean;
  emailPublic?: boolean;
  phoneNumberPublic?: boolean;
  title: string | null;
  introduction: string | null;
  content?: string | null;
  career?: string | null;
  educations?: string[];
  experiences?: string[];
  prices?: Array<{ className?: string; price?: number }>;
  lessonType?: 'ONLINE' | 'OFFLINE' | 'BOTH' | null;
  locations: ProfileLocationDto[];
  categories: ProfileCategoryDto[];
  subjects: ProfileSubjectDto[];
  styles: ProfileTypeDto[];
  goals?: ProfileTypeDto[];
}

export interface StudentProfilePatchRequest {
  phoneNumber?: string;
  styleIds?: number[];
  categoryIds?: number[];
  goalIds?: number[];
  locationIds?: number[];
  introduction?: string;
  lessonType?: string;
  minBudget?: number;
  maxBudget?: number;
}

export interface TutorProfilePatchRequest {
  name?: string;
  phoneNumber?: string;
  email?: string;
  birthDate?: string;
  birthDatePublic?: boolean;
  emailPublic?: boolean;
  phoneNumberPublic?: boolean;
  styleIds?: number[];
  categoryIds?: number[];
  subjectIds?: number[];
  locationIds?: number[];
  goalIds?: number[];
  lessonType?: 'ONLINE' | 'OFFLINE' | 'BOTH';
  title?: string;
  experiences?: string[];
  educations?: string[];
  prices?: Array<{ className: string; price: number }>;
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
    mutationFn: (request: StudentProfilePatchRequest) =>
      apiClient.patch('/api/profile/student/me', request).then(() => request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.student });
    },
  });
}

export function useSaveTutorProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: TutorProfilePatchRequest) =>
      apiClient.patch('/api/profile/tutor/me', request).then(() => request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.tutor });
    },
  });
}
