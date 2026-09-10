'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';

export interface WeeklyScheduleResponse {
  scheduleId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface ScheduleExceptionResponse {
  exceptionId: number;
  exceptionDate: string;
  startTime: string;
  endTime: string;
  exceptionType: 'AVAILABLE' | 'UNAVAILABLE';
}

export interface TutorScheduleResponse {
  tutorId: number;
  weeklySchedules: WeeklyScheduleResponse[];
  scheduleExceptions: ScheduleExceptionResponse[];
  reservedSlots: unknown[];
}

export interface WeeklyScheduleRequest {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface ScheduleExceptionRequest {
  exceptionDate: string;
  startTime: string;
  endTime: string;
  exceptionType: 'AVAILABLE' | 'UNAVAILABLE';
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function useTutorScheduleQuery(tutorId?: number) {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 90);

  return useQuery({
    queryKey: ['schedules', tutorId, formatDate(startDate), formatDate(endDate)],
    queryFn: () => apiClient.get<TutorScheduleResponse>(`/api/schedules/tutors/${tutorId}`, {
      params: { startDate: formatDate(startDate), endDate: formatDate(endDate) },
    }).then((response) => response.data),
    enabled: Boolean(tutorId),
  });
}

export function useSaveWeeklyScheduleMutation(tutorId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: WeeklyScheduleRequest[]) =>
      apiClient.post('/api/schedules/my/weekly', request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', tutorId] });
    },
  });
}

export function useSaveScheduleExceptionsMutation() {
  return useMutation({
    mutationFn: (request: ScheduleExceptionRequest[]) =>
      apiClient.post('/api/schedules/my/exceptions', request),
  });
}