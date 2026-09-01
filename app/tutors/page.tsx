"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Filter, Search, X } from "lucide-react";
import { useTutorsQuery } from "../hooks/queries/useTutors";
import { useCategoriesQuery } from "../hooks/queries/useCategories";
import TutorCard from "../components/TutorCard";

const REGIONS = ["전체", "서울", "강남구", "마포구", "성동구", "강동구", "노원구", "용산구"];
const GOAL_ALL_OPTION = "목표 전체";
const GOAL_OPTIONS = ["취미 / 여가", "콩쿠르 준비", "입시 / 진학", "자격증 취득", "단기 성취", "창작 / 작곡"];
const STYLE_ALL_OPTION = "스타일 전체";
const STYLE_OPTIONS = ["친절하고 따뜻한", "체계적이고 엄격한", "자유롭고 창의적인", "소통 중심", "결과 중심", "이론 설명 중심", "유머 있고 재미있는"];
const SORT_OPTIONS = ["인기순", "최신순"];
const LESSON_TYPE_ALL_OPTION = "수업 형태 전체";
const LESSON_TYPE_OPTIONS = ["대면 수업", "온라인 수업", "둘 다 가능"];
const MIN_BUDGET = 0;
const MAX_BUDGET = 200000;
const BUDGET_STEP = 5000;
const DEFAULT_MIN_BUDGET = 30000;
const DEFAULT_MAX_BUDGET = 100000;

type FilterTab = "sort" | "service" | "goal" | "style" | "lessonType" | "region" | "budget";

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
  const [modalTab, setModalTab] = useState<FilterTab>("service");
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedLessonTypes, setSelectedLessonTypes] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState(DEFAULT_MIN_BUDGET);
  const [budgetMax, setBudgetMax] = useState(DEFAULT_MAX_BUDGET);
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

  const toggleCategory = (category: string) => {
    if (selectedCategory === category && !selectedSubject) {
      setSelectedCategoryOverride(null);
      setSelectedSubjectOverride(null);
      return;
    }

    setSelectedCategoryOverride(category);
    setSelectedSubjectOverride("");
  };

  const toggleSubject = (subject: string, category: string) => {
    if (selectedSubject === subject) {
      setSelectedSubjectOverride("");
      setSelectedCategoryOverride(category);
      return;
    }

    setSelectedSubjectOverride(subject);
    setSelectedCategoryOverride(category);
  };

  const toggleRegion = (region: string) => {
    setSelectedRegion((prev) => (prev === region ? "전체" : region));
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
  const activeFilterCount =
    Number(selectedCategory !== "전체" || Boolean(selectedSubject)) +
    Number(selectedRegion !== "전체") +
    selectedGoals.length +
    selectedStyles.length +
    selectedLessonTypes.length +
    Number(budgetMin !== DEFAULT_MIN_BUDGET || budgetMax !== DEFAULT_MAX_BUDGET);

  const formatBudgetRangeLabel = (min: number, max: number) => {
    const format = (value: number) => (value >= MAX_BUDGET ? "20만원+" : `${Math.round(value / 10000)}만원`);
    return `${format(min)} ~ ${format(max)}`;
  };

  const appliedFilters = [
    ...(sort ? [{ label: "정렬", value: sort, type: "sort" as const }] : []),
    ...(selectedSubject
      ? [{ label: "서비스", value: selectedSubject, type: "service" as const }]
      : selectedCategory !== "전체"
        ? [{ label: "서비스", value: selectedCategory, type: "service" as const }]
        : []),
    ...(selectedRegion !== "전체"
      ? [{ label: "지역", value: selectedRegion, type: "region" as const }]
      : []),
    ...selectedGoals.map((goal) => ({ label: "목표", value: goal, type: "goal" as const })),
    ...selectedStyles.map((style) => ({ label: "스타일", value: style, type: "style" as const })),
    ...selectedLessonTypes.map((lessonType) => ({ label: "수업 형태", value: lessonType, type: "lessonType" as const })),
    ...(budgetMin !== DEFAULT_MIN_BUDGET || budgetMax !== DEFAULT_MAX_BUDGET
      ? [{ label: "예산", value: formatBudgetRangeLabel(budgetMin, budgetMax), type: "budget" as const }]
      : []),
  ];

  const removeServiceFilter = () => {
    setSelectedCategoryOverride(null);
    setSelectedSubjectOverride("");
  };

  const removeRegionFilter = () => {
    setSelectedRegion("전체");
  };

  const removeSortFilter = () => {
    setSort("인기순");
  };

  const removeGoalFilter = (goal: string) => {
    setSelectedGoals((current) => current.filter((item) => item !== goal));
  };

  const removeStyleFilter = (style: string) => {
    setSelectedStyles((current) => current.filter((item) => item !== style));
  };

  const removeLessonTypeFilter = (lessonType: string) => {
    setSelectedLessonTypes((current) => current.filter((item) => item !== lessonType));
  };

  const removeBudgetFilter = () => {
    setBudgetMin(DEFAULT_MIN_BUDGET);
    setBudgetMax(DEFAULT_MAX_BUDGET);
  };

  const openFilterModal = (tab: FilterTab = "sort") => {
    setModalTab(tab);
    setServiceSearch("");
    setServiceModalOpen(true);
  };

  const filterTabLabels: Record<FilterTab, string> = {
    sort: "정렬",
    service: "서비스",
    goal: "목표",
    style: "스타일",
    lessonType: "수업 형태",
    region: "지역",
    budget: "예산",
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
          onClick={() => openFilterModal("sort")}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-primary/40"
        >
          <span className="flex items-center gap-1.5">
            <Filter size={14} />
            <span>필터</span>
          </span>
          {activeFilterCount > 0 && (
            <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown size={15} />
        </button>
      </div>

      {appliedFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">적용된 필터</span>
          {appliedFilters.map((filter) => (
            <button
              key={filter.label + filter.value}
              type="button"
              onClick={() => {
                if (filter.type === "sort") {
                  removeSortFilter();
                  return;
                }
                if (filter.type === "service") {
                  removeServiceFilter();
                  return;
                }
                if (filter.type === "region") {
                  removeRegionFilter();
                  return;
                }
                if (filter.type === "goal") {
                  removeGoalFilter(filter.value);
                  return;
                }
                if (filter.type === "style") {
                  removeStyleFilter(filter.value);
                  return;
                }
                if (filter.type === "lessonType") {
                  removeLessonTypeFilter(filter.value);
                  return;
                }
                removeBudgetFilter();
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-orange-300 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700"
            >
              <span>{filter.label}: {filter.value}</span>
              <X size={12} className="opacity-80" />
            </button>
          ))}
          <span className="ml-auto text-sm text-muted-foreground">{sortedTutors.length}명 매치</span>
        </div>
      )}

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
          <div className="relative flex h-[min(560px,calc(100vh-64px))] w-full max-w-md flex-col overflow-hidden rounded-xl bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {(["sort", "service", "goal", "style", "lessonType", "region", "budget"] as FilterTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => openFilterModal(tab)}
                    className={`whitespace-nowrap border-b-2 pb-3.5 -mb-4 text-sm ${modalTab === tab ? "border-accent font-semibold text-accent" : "border-transparent text-muted-foreground"}`}
                  >
                    {filterTabLabels[tab]}
                  </button>
                ))}
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

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-3">
              {modalTab !== "budget" && (
                <div className="my-4 flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2.5">
                  <Search size={16} className="text-muted-foreground" />
                  <input
                    value={serviceSearch}
                    onChange={(event) => setServiceSearch(event.target.value)}
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    placeholder={modalTab === "service" ? "어떤 분야의 고수를 찾으세요?" : "검색어를 입력해 주세요"}
                    aria-label={modalTab === "service" ? "서비스 검색" : "필터 검색"}
                  />
                </div>
              )}

              <div className="min-h-0 flex-1 overflow-y-auto">
                {modalTab === "sort" && (
                  <div className="pb-2">
                    {SORT_OPTIONS.map((option) => {
                      const selected = sort === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setSort(option);
                          }}
                          className={`flex w-full items-center justify-between border-b border-border px-1 py-3 text-left text-sm ${
                            selected ? "font-semibold text-accent bg-accent/5" : "text-foreground"
                          }`}
                        >
                          <span>{option}</span>
                          {selected && <Check size={16} />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {modalTab === "service" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedCategory === "전체" && !selectedSubject) {
                          setSelectedCategoryOverride(null);
                          setSelectedSubjectOverride("");
                          return;
                        }
                        setSelectedCategoryOverride("전체");
                        setSelectedSubjectOverride("");
                      }}
                      className={`flex w-full items-center justify-between border-b border-border px-1 py-3 text-left text-sm ${
                        selectedCategory === "전체" && !selectedSubject ? "font-semibold text-accent bg-accent/5" : "text-foreground"
                      }`}
                    >
                      서비스 전체
                      {selectedCategory === "전체" && !selectedSubject && <Check size={18} />}
                    </button>

                    {visibleCategories.map((category) => {
                      const isOpen = selectedCategory === category.description;
                      const isSelectedCategory = selectedCategory === category.description && !selectedSubject;
                      const isCategorySelected = selectedCategory === category.description;

                      return (
                        <div key={category.categoryId} className="border-b border-border">
                          <button
                            type="button"
                            onClick={() => toggleCategory(category.description)}
                            className={`flex w-full items-center justify-between px-1 py-3 text-left text-sm ${
                              isCategorySelected ? "font-semibold text-accent bg-accent/5" : "text-foreground"
                            }`}
                          >
                            {category.description}
                            <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          </button>
                          {isOpen && (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pb-3 pl-3">
                              <button
                                type="button"
                                onClick={() => toggleCategory(category.description)}
                                className={`rounded-md px-2 py-2 text-left text-xs transition-colors hover:bg-muted ${
                                  isSelectedCategory ? "font-semibold text-accent bg-accent/5" : "text-muted-foreground"
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
                                    onClick={() => toggleSubject(subject.description, category.description)}
                                    className={`rounded-md px-2 py-2 text-left text-xs transition-colors hover:bg-muted ${
                                      selectedSubject === subject.description
                                        ? "font-semibold text-accent bg-accent/5"
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
                  </>
                )}

                {modalTab === "goal" && (
                  <div className="pb-2">
                    {[GOAL_ALL_OPTION, ...GOAL_OPTIONS].map((goal) => {
                      const isAllOption = goal === GOAL_ALL_OPTION;
                      const selected = isAllOption ? selectedGoals.length === 0 : selectedGoals.includes(goal);

                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => {
                            if (isAllOption) {
                              setSelectedGoals([]);
                              return;
                            }

                            setSelectedGoals((current) =>
                              current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal],
                            );
                          }}
                          className={`flex w-full items-center justify-between border-b border-border px-1 py-3 text-left text-sm ${
                            selected ? "font-semibold text-accent" : "text-foreground"
                          }`}
                        >
                          <span>{goal}</span>
                          {selected && <Check size={16} />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {modalTab === "style" && (
                  <div className="pb-2">
                    {[STYLE_ALL_OPTION, ...STYLE_OPTIONS].map((style) => {
                      const isAllOption = style === STYLE_ALL_OPTION;
                      const selected = isAllOption ? selectedStyles.length === 0 : selectedStyles.includes(style);

                      return (
                        <button
                          key={style}
                          type="button"
                          onClick={() => {
                            if (isAllOption) {
                              setSelectedStyles([]);
                              return;
                            }

                            setSelectedStyles((current) =>
                              current.includes(style) ? current.filter((item) => item !== style) : [...current, style],
                            );
                          }}
                          className={`flex w-full items-center justify-between border-b border-border px-1 py-3 text-left text-sm ${
                            selected ? "font-semibold text-accent" : "text-foreground"
                          }`}
                        >
                          <span>{style}</span>
                          {selected && <Check size={16} />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {modalTab === "lessonType" && (
                  <div className="pb-2">
                    {[LESSON_TYPE_ALL_OPTION, ...LESSON_TYPE_OPTIONS].map((type) => {
                      const isAllOption = type === LESSON_TYPE_ALL_OPTION;
                      const selected = isAllOption ? selectedLessonTypes.length === 0 : selectedLessonTypes.includes(type);

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            if (isAllOption) {
                              setSelectedLessonTypes([]);
                              return;
                            }

                            setSelectedLessonTypes((current) =>
                              current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
                            );
                          }}
                          className={`flex w-full items-center justify-between border-b border-border px-1 py-3 text-left text-sm ${
                            selected ? "font-semibold text-accent" : "text-foreground"
                          }`}
                        >
                          <span>{type}</span>
                          {selected && <Check size={16} />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {modalTab === "region" && (
                  <div>
                    {visibleRegions.map((region) => (
                      <button
                        key={region}
                        type="button"
                        onClick={() => toggleRegion(region)}
                        className={`flex w-full items-center justify-between border-b border-border px-1 py-3 text-left text-sm ${
                          selectedRegion === region
                            ? "font-semibold text-accent bg-accent/5"
                            : "text-foreground"
                        }`}
                      >
                        {region === "전체" ? "지역 전체" : region}
                        {selectedRegion === region && <Check size={18} />}
                      </button>
                    ))}
                  </div>
                )}

                {modalTab === "budget" && (
                  <div className="space-y-5 py-2">
                    <div className="rounded-xl border border-border bg-muted/40 p-4">
                      <div className="mb-3 flex items-center justify-between text-sm font-medium text-foreground">
                        <span>{Math.round(budgetMin / 10000)}만원</span>
                        <span>{budgetMax >= MAX_BUDGET ? "20만원+" : `${Math.round(budgetMax / 10000)}만원`}</span>
                      </div>

                      <div className="relative h-8">
                        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border" />
                        <div
                          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
                          style={{
                            left: `${(budgetMin / MAX_BUDGET) * 100}%`,
                            width: `${Math.max(((budgetMax - budgetMin) / MAX_BUDGET) * 100, 0)}%`,
                          }}
                        />
                        <input
                          type="range"
                          min={MIN_BUDGET}
                          max={MAX_BUDGET}
                          step={BUDGET_STEP}
                          value={budgetMin}
                          onChange={(event) => {
                            const nextValue = Number(event.target.value);
                            setBudgetMin(Math.min(nextValue, budgetMax - BUDGET_STEP));
                          }}
                          className="budget-range-input absolute inset-0 z-10 h-8 w-full bg-transparent"
                          aria-label="최소 예산"
                        />
                        <input
                          type="range"
                          min={MIN_BUDGET}
                          max={MAX_BUDGET}
                          step={BUDGET_STEP}
                          value={budgetMax}
                          onChange={(event) => {
                            const nextValue = Number(event.target.value);
                            setBudgetMax(Math.max(nextValue, budgetMin + BUDGET_STEP));
                          }}
                          className="budget-range-input absolute inset-0 z-0 h-8 w-full bg-transparent"
                          aria-label="최대 예산"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
                      선택 범위: {budgetMin >= MAX_BUDGET ? "20만원+" : `${Math.round(budgetMin / 10000)}만원`} - {budgetMax >= MAX_BUDGET ? "20만원+" : `${Math.round(budgetMax / 10000)}만원`}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-border px-4 py-3">
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {`필터 적용${activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}`}
              </button>
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
