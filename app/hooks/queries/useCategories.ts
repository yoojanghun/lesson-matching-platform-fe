import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/lib/apiClient";
import { queryKeys } from "@/app/lib/queryKeys";

export interface Subject {
  subjectId: number;
  subjectName: string;
  description: string;
}

export interface Category {
  categoryId: number;
  categoryName: string;
  description: string;
  icon: string;
  subjects: Subject[];
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () =>
      apiClient.get<Category[]>("/api/categories").then((r) => r.data),
    staleTime: 1000 * 60 * 60 * 24,       // 24시간
    gcTime: 1000 * 60 * 60 * 48,          // 48시간 메모리(캐시) 보존
  });
}