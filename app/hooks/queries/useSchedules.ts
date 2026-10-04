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
  reservedSlots: ReservedSlotResponse[];
}

export interface ReservedSlotResponse {
  reservationId: number;
  lessonDate: string;
  startTime: string;
  endTime: string;
  reservationStatus: string;
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

export function formatScheduleDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useTutorScheduleQuery(tutorId?: number, startDate = new Date(), endDate?: Date) {
  const resolvedEndDate = endDate ?? new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);

  return useQuery({
    queryKey: ['schedules', tutorId, formatScheduleDate(startDate), formatScheduleDate(resolvedEndDate)],
    queryFn: () => apiClient.get<TutorScheduleResponse>(`/api/schedules/tutors/${tutorId}`, {
      params: { startDate: formatScheduleDate(startDate), endDate: formatScheduleDate(resolvedEndDate) },
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