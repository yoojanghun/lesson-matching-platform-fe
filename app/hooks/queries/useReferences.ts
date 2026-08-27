'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { queryKeys } from '../../lib/queryKeys';

export interface ReferenceLocation {
  locationId: number;
  name: string;
}

export interface ReferenceCategory {
  categoryId: number;
  categoryType: string;
}

export interface ReferenceStyle {
  id: number;
  styleType: string;
  description: string;
}

export interface ReferenceGoal {
  goalId: number;
  lessonGoalType: string;
  description?: string;
}

export interface ReferencesResponse {
  locations: ReferenceLocation[];
  categories: ReferenceCategory[];
  tutorStyles: ReferenceStyle[];
  lessonGoals: ReferenceGoal[];
}

export function useReferencesQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.references.all,
    queryFn: () => apiClient.get<ReferencesResponse>('/api/reference/profile').then((response) => response.data),
    enabled,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useLocationsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.references.locations,
    queryFn: () => apiClient.get<ReferenceLocation[]>('/api/reference/locations').then((response) => response.data),
    enabled,
    staleTime: 1000 * 60 * 60 * 24,
  });
}