"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useTutorsQuery } from "../hooks/queries/useTutors";
import { useCategoriesQuery } from "../hooks/queries/useCategories";
import TutorCard from "../components/TutorCard";

const REGIONS = ["전체", "서울", "강남구", "마포구", "성동구", "강동구", "노원구", "용산구"];

function TutorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category") || "전체";
  const urlSubject = searchParams.get("subject") || "";
  const [selectedCategoryOverride, setSelectedCategoryOverride] = useState<string | null>(null);
  const [selectedSubjectOverride, setSelectedSubjectOverride] = useState<string | null>(null);
  const selectedCategory = selectedCategoryOverride ?? urlCategory;
  const selectedSubject = selectedSubjectOverride ?? urlSubject;
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"service" | "region">("service");
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [serviceSearch, setServiceSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("인기순");
  const { data: categories = [] } = useCategoriesQuery();

  useEffect(() => {
    if (!serviceModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setServiceModalOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [serviceModalOpen]);

  const activeCategory = categories.find((category) => category.description === selectedCategory);

  // TanStack Query로 튜터 목록 조회 (5분 자동 캐싱)
  const { data: tutors = [], isLoading, isError } = useTutorsQuery({
    category: selectedCategory,
    subject: selectedSubject,
    region: selectedRegion,
    search: searchQuery,
  });

  // 정렬 처리
  const sortedTutors = useMemo(() => {
    const list = [...tutors];
    if (sort === "인기순") {
      return list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    }
    if (sort === "가격 낮은순") {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sort === "가격 높은순") {
      return list.sort((a, b) => b.price - a.price);
    }
    if (sort === "최신순") {
      return list.sort((a, b) => b.id - a.id);
    }
    return list;
  }, [tutors, sort]);

  const selectCategory = (category: string) => {
    setSelectedCategoryOverride(category);
    setSelectedSubjectOverride("");
  };

  const selectSubject = (subject: string) => {
    setSelectedSubjectOverride(subject);
    setSelectedCategoryOverride(activeCategory?.description ?? "전체");
    setServiceModalOpen(false);
  };

  const serviceLabel = selectedSubject
    ? `${selectedCategory} · ${selectedSubject}`
    : (selectedCategory === "전체" ? "전체" : `${selectedCategory} 전체`);
  const normalizedServiceSearch = serviceSearch.trim().toLowerCase();
  const visibleCategories = categories.filter((category) =>
    category.description.toLowerCase().includes(normalizedServiceSearch) ||
    category.subjects.some((subject) => subject.description.toLowerCase().includes(normalizedServiceSearch)),
  );
  const visibleRegions = REGIONS.filter((region) => region.includes(serviceSearch.trim()));

  const openFilterModal = (tab: "service" | "region") => {
    setModalTab(tab);
    setServiceSearch("");
    setServiceModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">튜터 찾기</h2>
        <p className="text-sm text-muted-foreground">
          {isLoading ? "튜터 목록을 불러오는 중..." : `총 ${sortedTutors.length}명의 전문 튜터가 활동 중입니다.`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center bg-card border border-border rounded-xl px-3.5 gap-2 flex-1 min-w-48 shadow-sm">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm py-2.5 outline-none text-foreground placeholder:text-muted-foreground"
            placeholder="튜터 이름, 악기, 소개 검색..."
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              지우기
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => openFilterModal("service")}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground shadow-sm transition-colors hover:border-primary/40"
        >
          {serviceLabel === "전체" ? "서비스" : serviceLabel} <ChevronDown size={15} />
        </button>

        <button
          type="button"
          onClick={() => openFilterModal("region")}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground shadow-sm transition-colors hover:border-primary/40"
        >
          {selectedRegion === "전체" ? "지역" : selectedRegion} <ChevronDown size={15} />
        </button>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-xl text-xs text-foreground outline-none cursor-pointer shadow-sm"
        >
          {["인기순", "최신순", "가격 낮은순", "가격 높은순"].map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      {/* 로딩 상태 스켈레톤 */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-card border border-border rounded-2xl p-5 h-44 animate-pulse flex flex-col justify-between">
              <div className="flex gap-3 items-center">
                <div className="w-14 h-14 rounded-full bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-3 w-36 bg-muted rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-8 w-20 bg-muted rounded self-end" />
            </div>
          ))}
        </div>
      )}

      {/* 에러 상태 */}
      {isError && (
        <div className="text-center py-16 bg-card border border-border rounded-2xl text-muted-foreground text-sm">
          튜터 목록을 불러오는 중 오류가 발생했습니다.
        </div>
      )}

      {/* 검색 결과 없음 */}
      {!isLoading && !isError && sortedTutors.length === 0 && (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <p className="text-sm font-semibold text-foreground">일치하는 튜터가 없습니다.</p>
          <p className="text-xs text-muted-foreground mt-1">다른 검색어나 카테고리를 선택해 보세요.</p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !isError && sortedTutors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sortedTutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} onClick={() => router.push(`/tutors/${tutor.id}`)} />
          ))}
        </div>
      )}

      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="서비스 선택창 닫기"
            onClick={() => setServiceModalOpen(false)}
            className="absolute inset-0 cursor-default bg-foreground/50 backdrop-blur-[1px]"
          />
          <div className="relative flex max-h-[min(680px,calc(100vh-32px))] w-full max-w-md flex-col overflow-hidden rounded-xl bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => openFilterModal("service")}
                  className={`border-b-2 pb-3.5 -mb-4 text-sm ${modalTab === "service" ? "border-accent font-semibold text-accent" : "border-transparent text-muted-foreground"}`}
                >
                  서비스
                </button>
                <button
                  type="button"
                  onClick={() => openFilterModal("region")}
                  className={`border-b-2 pb-3.5 -mb-4 text-sm ${modalTab === "region" ? "border-accent font-semibold text-accent" : "border-transparent text-muted-foreground"}`}
                >
                  지역
                </button>
              </div>
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                aria-label="닫기"
                className="rounded-lg p-1 text-foreground transition-colors hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto px-4 pb-3">
              <div className="my-4 flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2.5">
                <Search size={16} className="text-muted-foreground" />
                <input
                  value={serviceSearch}
                  onChange={(event) => setServiceSearch(event.target.value)}
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  placeholder={modalTab === "service" ? "어떤 분야의 고수를 찾으세요?" : "어느 지역의 고수를 찾으세요?"}
                  aria-label={modalTab === "service" ? "서비스 검색" : "지역 검색"}
                />
              </div>

              {modalTab === "service" ? <>
                <button
                type="button"
                onClick={() => { selectCategory("전체"); setServiceModalOpen(false); }}
                className={`flex w-full items-center justify-between border-b border-border px-1 py-3 text-left text-sm ${
                  serviceLabel === "전체" ? "font-semibold text-accent" : "text-foreground"
                }`}
              >
                서비스 전체
                {serviceLabel === "전체" && <Check size={18} />}
                </button>

                {visibleCategories.map((category) => {
                  const isOpen = selectedCategory === category.description;
                  const isSelectedCategory = selectedCategory === category.description;

                return (
                  <div key={category.categoryId} className="border-b border-border">
                    <button
                      type="button"
                      onClick={() => selectCategory(category.description)}
                      className={`flex w-full items-center justify-between px-1 py-3 text-left text-sm ${
                        isSelectedCategory ? "font-semibold text-accent" : "text-foreground"
                      }`}
                    >
                      {category.description}
                      <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 pb-3 pl-3">
                        <button
                          type="button"
                          onClick={() => { selectCategory(category.description); setServiceModalOpen(false); }}
                          className={`rounded-md px-2 py-2 text-left text-xs transition-colors hover:bg-muted ${
                            isSelectedCategory && !selectedSubject ? "font-semibold text-accent" : "text-muted-foreground"
                          }`}
                        >
                          {category.description} 전체
                        </button>
                        {category.subjects
                          .filter((subject) =>
                            !normalizedServiceSearch ||
                            category.description.toLowerCase().includes(normalizedServiceSearch) ||
                            subject.description.toLowerCase().includes(normalizedServiceSearch),
                          )
                          .map((subject) => (
                          <button
                            key={subject.subjectId}
                            type="button"
                            onClick={() => selectSubject(subject.description)}
                            className={`rounded-md px-2 py-2 text-left text-xs transition-colors hover:bg-muted ${
                              selectedSubject === subject.description
                                ? "font-semibold text-accent"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {subject.description}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
                })}
              </> : (
                <div>
                  {visibleRegions.map((region) => (
                    <button
                      key={region}
                      type="button"
                      onClick={() => { setSelectedRegion(region); setServiceModalOpen(false); }}
                      className={`flex w-full items-center justify-between border-b border-border px-1 py-3 text-left text-sm ${selectedRegion === region ? "font-semibold text-accent" : "text-foreground"}`}
                    >
                      {region === "전체" ? "지역 전체" : region}
                      {selectedRegion === region && <Check size={18} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TutorsPage() {
  return (
    <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-muted" />}>
      <TutorsContent />
    </Suspense>
  );
}
