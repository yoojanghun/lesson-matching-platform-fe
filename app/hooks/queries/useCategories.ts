import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/lib/apiClient";
import { queryKeys } from "@/app/lib/queryKeys";

export interface Subject {
  subjectId: number;
  subjectName: string;
  description?: string;
  code?: string;
}

export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
  code?: string;
  icon?: string;
  subjects: Subject[];
}

type RawSubject = {
  subjectId?: number;
  subjectName?: string;
  description?: string;
  code?: string;
  subjectType?: string;
};
type RawCategory = {
  categoryId?: number;
  categoryName?: string;
  description?: string;
  code?: string;
  categoryType?: string;
  icon?: string;
  subjects?: RawSubject[];
};
type CategoriesResponse = RawCategory[] | { data?: RawCategory[]; content?: RawCategory[]; categories?: RawCategory[] };

function normalizeCategories(response: CategoriesResponse) {
  const rawCategories = Array.isArray(response)
    ? response
    : response.data ?? response.content ?? response.categories ?? [];

  return rawCategories
    .filter((category): category is RawCategory & { categoryId: number } => category.categoryId !== undefined)
    .map((category) => ({
      categoryId: category.categoryId,
      categoryName: category.categoryName ?? category.categoryType ?? `카테고리 ${category.categoryId}`,
      description: category.description ?? category.categoryName ?? category.categoryType ?? '',
      code: category.code ?? category.categoryType,
      icon: category.icon,
      subjects: (category.subjects ?? [])
        .filter((subject): subject is RawSubject & { subjectId: number } => subject.subjectId !== undefined)
        .map((subject) => ({
          subjectId: subject.subjectId,
          subjectName: subject.subjectName ?? subject.subjectType ?? `과목 ${subject.subjectId}`,
          description: subject.description ?? subject.subjectName ?? subject.subjectType ?? '',
          code: subject.code ?? subject.subjectType,
        })),
    }));
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () =>
      apiClient.get<CategoriesResponse>("/api/categories").then((r) => normalizeCategories(r.data)),
    staleTime: 1000 * 60 * 60 * 24,       // 24시간
    gcTime: 1000 * 60 * 60 * 48,          // 48시간 메모리(캐시) 보존
  });
}