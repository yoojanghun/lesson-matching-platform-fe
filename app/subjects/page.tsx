"use client";

import { useState } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCategoriesQuery } from "../hooks/queries/useCategories";

function SubjectsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedCategoryId = Number(searchParams.get("category"));
  const { data: categories = [], isLoading, isError } = useCategoriesQuery();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const requestedCategory = categories.find(
    (category) => category.categoryId === requestedCategoryId,
  );
  const activeCategoryId = selectedCategoryId ?? requestedCategory?.categoryId ?? categories[0]?.categoryId;

  const selectedCategory = categories.find(
    (category) => category.categoryId === activeCategoryId,
  );

  const selectCategory = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    router.replace(`/subjects?category=${categoryId}`, { scroll: false });
  };

  return (
    <div className="mx-auto max-w-4xl py-2 sm:py-8">
      <div className="mb-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="이전 페이지로 이동"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <p className="mb-1 text-xs font-semibold tracking-[0.18em] text-accent">EXPLORE</p>
          <h1 className="text-2xl font-bold text-foreground">악기별 탐색</h1>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-[180px_1fr]">
          <div className="h-72 animate-pulse rounded-xl bg-muted" />
          <div className="h-72 animate-pulse rounded-xl bg-muted" />
        </div>
      )}

      {isError && (
        <div className="border-y border-border py-16 text-center text-sm text-muted-foreground">
          카테고리를 불러오는 중 오류가 발생했습니다.
        </div>
      )}

      {!isLoading && !isError && categories.length > 0 && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-[180px_1fr] sm:gap-12">
          <nav aria-label="악기 카테고리" className="flex gap-2 overflow-x-auto pb-1 sm:block sm:space-y-1 sm:overflow-visible">
            {categories.map((category) => {
              const isSelected = category.categoryId === activeCategoryId;

              return (
                <button
                  key={category.categoryId}
                  type="button"
                  onClick={() => selectCategory(category.categoryId)}
                  className={`flex min-w-max items-center gap-2 rounded-lg px-4 py-3 text-left text-sm transition-colors sm:w-full ${
                    isSelected
                      ? "bg-muted font-bold text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <span className="text-lg" aria-hidden="true">{category.icon}</span>
                  <span>{category.description}</span>
                </button>
              );
            })}
          </nav>

          {selectedCategory && (
            <section aria-labelledby="subject-heading" className="min-w-0">
              <div className="mb-8 flex items-end justify-between border-b border-border pb-4">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">{selectedCategory.description}</p>
                  <h2 id="subject-heading" className="text-xl font-bold text-foreground">
                    어떤 수업을 찾고 있나요?
                  </h2>
                </div>
                <span className="hidden text-sm text-muted-foreground sm:block">
                  {selectedCategory.subjects.length}개 분야
                </span>
              </div>

              <div className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => router.push(`/tutors?category=${encodeURIComponent(selectedCategory.description)}`)}
                  className="group flex min-h-14 items-center justify-between border-b border-border/70 px-1 text-left text-sm font-semibold text-foreground transition-colors hover:text-accent"
                >
                  <span>{selectedCategory.description} 전체</span>
                  <ChevronRight size={16} className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
                {selectedCategory.subjects.map((subject) => (
                  <button
                    key={subject.subjectId}
                    type="button"
                    onClick={() => router.push(`/tutors?category=${encodeURIComponent(selectedCategory.description)}&subject=${encodeURIComponent(subject.description)}`)}
                    className="group flex min-h-14 items-center justify-between border-b border-border/70 px-1 text-left text-sm text-foreground transition-colors hover:text-accent"
                  >
                    <span>{subject.description}</span>
                    <ChevronRight size={16} className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function SubjectsPage() {
  return (
    <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-muted" />}>
      <SubjectsContent />
    </Suspense>
  );
}