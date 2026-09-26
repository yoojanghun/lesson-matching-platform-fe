"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Filter, Search, X } from "lucide-react";
import { useTutorsQuery } from "../hooks/queries/useTutors";
import { useCategoriesQuery } from "../hooks/queries/useCategories";
import { useReferencesQuery } from "../hooks/queries/useReferences";
import TutorCard from "../components/TutorCard";

const GOAL_ALL_OPTION = "목표 전체";
const STYLE_ALL_OPTION = "스타일 전체";
const LESSON_TYPE_ALL_OPTION = "수업 형태 전체";
const MIN_BUDGET = 0;
const MAX_BUDGET = 200000;
const BUDGET_STEP = 5000;
const DEFAULT_MIN_BUDGET = 0;
const DEFAULT_MAX_BUDGET = 200000;

type FilterTab = "sort" | "service" | "goal" | "style" | "lessonType" | "region" | "budget";

function TutorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category") || "전체";
  const urlSubject = searchParams.get("subject") || "";
  const [selectedCategoryOverride, setSelectedCategoryOverride] = useState<string | null>(null);
  const [selectedSubjectOverride, setSelectedSubjectOverride] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const selectedCategory = selectedCategoryOverride ?? urlCategory;
  const selectedSubject = selectedSubjectOverride ?? urlSubject;
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<FilterTab>("service");
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedLessonTypes, setSelectedLessonTypes] = useState<string[]>([]);
  const [expandedRegions, setExpandedRegions] = useState<number[]>([]);
  const [budgetMin, setBudgetMin] = useState(DEFAULT_MIN_BUDGET);
  const [budgetMax, setBudgetMax] = useState(DEFAULT_MAX_BUDGET);
  const [serviceSearch, setServiceSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [sort, setSort] = useState("인기순");
  const [appliedCategoryOverride, setAppliedCategoryOverride] = useState<string | null>(null);
  const [appliedSubjectOverride, setAppliedSubjectOverride] = useState<string | null>(null);
  const [appliedRegion, setAppliedRegion] = useState("전체");
  const [appliedGoals, setAppliedGoals] = useState<string[]>([]);
  const [appliedStyles, setAppliedStyles] = useState<string[]>([]);
  const [appliedLessonTypes, setAppliedLessonTypes] = useState<string[]>([]);
  const [appliedBudgetMin, setAppliedBudgetMin] = useState(DEFAULT_MIN_BUDGET);
  const [appliedBudgetMax, setAppliedBudgetMax] = useState(DEFAULT_MAX_BUDGET);
  const [appliedSort, setAppliedSort] = useState("인기순");
  const { data: categories = [] } = useCategoriesQuery();
  const { data: references } = useReferencesQuery();

  const locations = references?.locations ?? [];
  const goalOptions = references?.lessonGoals?.map((goal) => goal.description) ?? [];
  const styleOptions = references?.tutorStyles?.map((style) => style.description) ?? [];
  const sortOptions = references?.sortTypes?.map((sortType) => sortType.description) ?? [];
  const lessonTypeOptions = references?.lessonTypes?.map((lessonType) => lessonType.description) ?? [];
  const locationGroups = locations
    .filter((location) => location.parentId === null)
    .map((parent) => ({
      parent,
      wholeLocation: locations.find((location) => location.parentId === parent.locationId && location.name === `${parent.name} 전체`) ?? parent,
      children: locations.filter((location) => location.parentId === parent.locationId && location.name !== `${parent.name} 전체`),
    }));

  useEffect(() => {
    if (!serviceModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setServiceModalOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [serviceModalOpen]);

  const appliedCategory = appliedCategoryOverride ?? urlCategory;
  const appliedSubject = appliedSubjectOverride ?? urlSubject;
  const appliedActiveCategory = categories.find((category) => category.description === appliedCategory);

  // TanStack Query로 튜터 목록 조회 (5분 자동 캐싱)
  const mappedGoalIds = appliedGoals.map((g) => references?.lessonGoals?.find((rg) => rg.description === g)?.goalId).filter(Boolean) as number[];
  const mappedStyleIds = appliedStyles.map((s) => references?.tutorStyles?.find((rs) => rs.description === s)?.id).filter(Boolean) as number[];
  const mappedLessonType = appliedLessonTypes.length === 1 ? references?.lessonTypes?.find(lt => lt.description === appliedLessonTypes[0])?.name : undefined;
  const mappedSortType = references?.sortTypes?.find(st => st.description === appliedSort)?.name;
  const mappedLocationIds = appliedRegion === '전체'
    ? undefined
    : locations.filter((location) => location.name.includes(appliedRegion)).map((location) => location.locationId);
  const subjectObj = appliedActiveCategory?.subjects?.find(sub => sub.description === appliedSubject);

  const { data: tutorPage, isLoading, isError } = useTutorsQuery({
    categoryIds: appliedActiveCategory ? [appliedActiveCategory.categoryId] : undefined,
    subjectIds: subjectObj ? [subjectObj.subjectId] : undefined,
    locationIds: mappedLocationIds,
    goalIds: mappedGoalIds.length > 0 ? mappedGoalIds : undefined,
    styleIds: mappedStyleIds.length > 0 ? mappedStyleIds : undefined,
    lessonType: mappedLessonType,
    tutorSortType: mappedSortType,
    minPrice: appliedBudgetMin > MIN_BUDGET ? appliedBudgetMin : undefined,
    maxPrice: appliedBudgetMax < MAX_BUDGET ? appliedBudgetMax : undefined,
    search: appliedSearchQuery,
    page: currentPage,
  });

  // 정렬 처리
  const tutors = tutorPage?.content ?? [];
  const sortedTutors = useMemo(() => {
    const list = [...tutors];
    if (appliedSort === "인기순") {
      return list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    }
    if (appliedSort === "가격 낮은순") {
      return list.sort((a, b) => a.price - b.price);
    }
    if (appliedSort === "가격 높은순") {
      return list.sort((a, b) => b.price - a.price);
    }
    if (appliedSort === "최신순") {
      return list.sort((a, b) => b.id - a.id);
    }
    return list;
  }, [tutors, appliedSort]);

  const totalPages = tutorPage?.totalPages ?? 0;
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index)
    .slice(Math.max(currentPage - 2, 0), Math.min(currentPage + 3, totalPages));

  const toggleCategory = (category: string) => {
    setExpandedCategory((current) => (current === category ? null : category));
  };

  const selectCategory = (category: string) => {
    setSelectedCategoryOverride(category);
    setSelectedSubjectOverride("");
    setExpandedCategory(category);
  };

  const toggleSubject = (subject: string, category: string) => {
    if (selectedSubject === subject) {
      setSelectedSubjectOverride("");
      setSelectedCategoryOverride(category);
      return;
    }

    setExpandedCategory(category);
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
  const normalizedFilterSearch = serviceSearch.trim().toLowerCase();
  const visibleLocationGroups = locationGroups
    .map((group) => ({
      ...group,
      children: group.children.filter((location) => location.name.toLowerCase().includes(normalizedFilterSearch)),
    }))
    .filter(({ parent, wholeLocation, children }) =>
      !normalizedFilterSearch ||
      parent.name.toLowerCase().includes(normalizedFilterSearch) ||
      wholeLocation.name.toLowerCase().includes(normalizedFilterSearch) ||
      children.length > 0,
    );
  const visibleGoals = goalOptions.filter((goal) => goal.toLowerCase().includes(normalizedFilterSearch));
  const visibleStyles = styleOptions.filter((style) => style.toLowerCase().includes(normalizedFilterSearch));
  const visibleLessonTypes = lessonTypeOptions.filter((lessonType) => lessonType.toLowerCase().includes(normalizedFilterSearch));
  const visibleSortTypes = sortOptions.filter((sortType) => sortType.toLowerCase().includes(normalizedFilterSearch));
  const draftFilterCount =
    Number(selectedCategory !== "전체" || Boolean(selectedSubject)) +
    Number(selectedRegion !== "전체") +
    selectedGoals.length +
    selectedStyles.length +
    selectedLessonTypes.length +
    Number(budgetMin !== DEFAULT_MIN_BUDGET || budgetMax !== DEFAULT_MAX_BUDGET);
  const activeFilterCount =
    Number(appliedCategory !== "전체" || Boolean(appliedSubject)) +
    Number(appliedRegion !== "전체") +
    appliedGoals.length +
    appliedStyles.length +
    appliedLessonTypes.length +
    Number(appliedBudgetMin !== DEFAULT_MIN_BUDGET || appliedBudgetMax !== DEFAULT_MAX_BUDGET);

  const formatBudgetRangeLabel = (min: number, max: number) => {
    const format = (value: number) => (value >= MAX_BUDGET ? "20만원+" : `${Math.round(value / 10000)}만원`);
    return `${format(min)} ~ ${format(max)}`;
  };

  const appliedFilters = [
    ...(appliedSort ? [{ label: "정렬", value: appliedSort, type: "sort" as const }] : []),
    ...(appliedSearchQuery ? [{ label: "검색어", value: appliedSearchQuery, type: "search" as const }] : []),
    ...(appliedSubject
      ? [{ label: "서비스", value: appliedSubject, type: "service" as const }]
      : appliedCategory !== "전체"
        ? [{ label: "서비스", value: appliedCategory, type: "service" as const }]
        : []),
    ...(appliedRegion !== "전체"
      ? [{ label: "지역", value: appliedRegion, type: "region" as const }]
      : []),
    ...appliedGoals.map((goal) => ({ label: "목표", value: goal, type: "goal" as const })),
    ...appliedStyles.map((style) => ({ label: "스타일", value: style, type: "style" as const })),
    ...appliedLessonTypes.map((lessonType) => ({ label: "수업 형태", value: lessonType, type: "lessonType" as const })),
    ...(appliedBudgetMin !== DEFAULT_MIN_BUDGET || appliedBudgetMax !== DEFAULT_MAX_BUDGET
      ? [{ label: "예산", value: formatBudgetRangeLabel(appliedBudgetMin, appliedBudgetMax), type: "budget" as const }]
      : []),
  ];

  const removeServiceFilter = () => {
    setCurrentPage(0);
    if (appliedSubject) {
      setSelectedSubjectOverride("");
      setAppliedSubjectOverride("");
      return;
    }

    setSelectedCategoryOverride(null);
    setSelectedSubjectOverride(null);
    setAppliedCategoryOverride(null);
    setAppliedSubjectOverride(null);
    router.replace("/tutors", { scroll: false });
  };

  const removeRegionFilter = () => {
    setCurrentPage(0);
    setSelectedRegion("전체");
    setAppliedRegion("전체");
  };

  const removeSortFilter = () => {
    setCurrentPage(0);
    setSort("인기순");
    setAppliedSort("인기순");
  };

  const removeGoalFilter = (goal: string) => {
    setCurrentPage(0);
    setSelectedGoals((current) => current.filter((item) => item !== goal));
    setAppliedGoals((current) => current.filter((item) => item !== goal));
  };

  const removeStyleFilter = (style: string) => {
    setCurrentPage(0);
    setSelectedStyles((current) => current.filter((item) => item !== style));
    setAppliedStyles((current) => current.filter((item) => item !== style));
  };

  const removeLessonTypeFilter = (lessonType: string) => {
    setCurrentPage(0);
    setSelectedLessonTypes((current) => current.filter((item) => item !== lessonType));
    setAppliedLessonTypes((current) => current.filter((item) => item !== lessonType));
  };

  const removeBudgetFilter = () => {
    setCurrentPage(0);
    setBudgetMin(DEFAULT_MIN_BUDGET);
    setBudgetMax(DEFAULT_MAX_BUDGET);
    setAppliedBudgetMin(DEFAULT_MIN_BUDGET);
    setAppliedBudgetMax(DEFAULT_MAX_BUDGET);
  };

  const openFilterModal = (tab: FilterTab = "sort") => {
    setSelectedCategoryOverride(appliedCategoryOverride);
    setSelectedSubjectOverride(appliedSubjectOverride);
    setSelectedRegion(appliedRegion);
    setSelectedGoals(appliedGoals);
    setSelectedStyles(appliedStyles);
    setSelectedLessonTypes(appliedLessonTypes);
    setBudgetMin(appliedBudgetMin);
    setBudgetMax(appliedBudgetMax);
    setSort(appliedSort);
    setModalTab(tab);
    setServiceSearch("");
    setServiceModalOpen(true);
  };

  const applyFilters = () => {
    setCurrentPage(0);
    setAppliedCategoryOverride(selectedCategoryOverride);
    setAppliedSubjectOverride(selectedSubjectOverride);
    setAppliedRegion(selectedRegion);
    setAppliedGoals(selectedGoals);
    setAppliedStyles(selectedStyles);
    setAppliedLessonTypes(selectedLessonTypes);
    setAppliedBudgetMin(budgetMin);
    setAppliedBudgetMax(budgetMax);
    setAppliedSort(sort);
    setServiceModalOpen(false);
  };

  const changeFilterTab = (tab: FilterTab) => {
    setModalTab(tab);
    setServiceSearch("");
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
          {isLoading ? "튜터 목록을 불러오는 중..." : `총 ${tutorPage?.totalElements ?? sortedTutors.length}명의 전문 튜터가 활동 중입니다.`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setCurrentPage(0);
            setAppliedSearchQuery(searchInput.trim());
          }}
          className="flex items-center bg-card border border-border rounded-xl px-3.5 gap-2 flex-1 min-w-48 shadow-sm transition-colors focus-within:border-primary/50"
        >
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 bg-transparent text-sm py-2.5 outline-none text-foreground placeholder:text-muted-foreground"
            placeholder="튜터 이름, 악기, 소개 검색... (Enter 또는 검색)"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                if (appliedSearchQuery) {
                  setCurrentPage(0);
                  setAppliedSearchQuery("");
                }
              }}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer px-1 py-0.5 rounded"
            >
              지우기
            </button>
          )}
          <button
            type="submit"
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 cursor-pointer shrink-0"
          >
            검색
          </button>
        </form>

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
                if (filter.type === "search") {
                  setCurrentPage(0);
                  setSearchInput("");
                  setAppliedSearchQuery("");
                  return;
                }
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
          <span className="ml-auto text-sm text-muted-foreground">{tutorPage?.totalElements ?? sortedTutors.length}명 매치</span>
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

      {!isLoading && !isError && totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1 pt-2" aria-label="튜터 목록 페이지 이동">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
            disabled={currentPage === 0}
            aria-label="이전 페이지"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              aria-current={currentPage === page ? "page" : undefined}
              className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm transition-colors ${
                currentPage === page
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "border border-border text-foreground hover:bg-muted"
              }`}
            >
              {page + 1}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages - 1))}
            disabled={currentPage >= totalPages - 1}
            aria-label="다음 페이지"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
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
                    onClick={() => changeFilterTab(tab)}
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
                    {visibleSortTypes.map((option) => {
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
                          setExpandedCategory(null);
                          return;
                        }
                        setSelectedCategoryOverride("전체");
                        setSelectedSubjectOverride("");
                        setExpandedCategory(null);
                      }}
                      className={`flex w-full items-center justify-between border-b border-border px-1 py-3 text-left text-sm ${
                        selectedCategory === "전체" && !selectedSubject ? "font-semibold text-accent bg-accent/5" : "text-foreground"
                      }`}
                    >
                      서비스 전체
                      {selectedCategory === "전체" && !selectedSubject && <Check size={18} />}
                    </button>

                    {visibleCategories.map((category) => {
                      const isOpen = expandedCategory === category.description;
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
                                onClick={() => selectCategory(category.description)}
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
                    {[GOAL_ALL_OPTION, ...visibleGoals].map((goal) => {
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
                    {[STYLE_ALL_OPTION, ...visibleStyles].map((style) => {
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
                    {[LESSON_TYPE_ALL_OPTION, ...visibleLessonTypes].map((type) => {
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
                    <button
                      type="button"
                      onClick={() => toggleRegion("전체")}
                      className={`flex w-full items-center justify-between border-b border-border px-1 py-3 text-left text-sm ${
                        selectedRegion === "전체" ? "font-semibold text-accent bg-accent/5" : "text-foreground"
                      }`}
                    >
                      지역 전체
                      {selectedRegion === "전체" && <Check size={18} />}
                    </button>
                    {visibleLocationGroups.map(({ parent, wholeLocation, children }) => {
                      const expanded = expandedRegions.includes(parent.locationId) || Boolean(normalizedFilterSearch);
                      const wholeRegion = wholeLocation.name === parent.name ? `${parent.name} 전체` : wholeLocation.name;

                      return (
                        <div key={parent.locationId} className="border-b border-border">
                          <button
                            type="button"
                            aria-expanded={expanded}
                            onClick={() => setExpandedRegions((current) => expanded
                              ? current.filter((id) => id !== parent.locationId)
                              : [...current, parent.locationId])}
                            className="flex w-full items-center justify-between px-1 py-3 text-left text-sm text-foreground"
                          >
                            <span>{parent.name}</span>
                            <ChevronDown size={16} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                          </button>
                          {expanded && (
                            <div className="border-t border-border">
                              <button
                                type="button"
                                onClick={() => toggleRegion(wholeRegion)}
                                className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm ${
                                  selectedRegion === wholeRegion ? "font-semibold text-accent bg-accent/5" : "text-muted-foreground"
                                }`}
                              >
                                <span>{wholeRegion}</span>
                                {selectedRegion === wholeRegion && <Check size={16} />}
                              </button>
                              {children.map((location) => (
                                <button
                                  key={location.locationId}
                                  type="button"
                                  onClick={() => toggleRegion(location.name)}
                                  className={`flex w-full items-center justify-between border-t border-border px-7 py-3 text-left text-sm ${
                                    selectedRegion === location.name ? "font-semibold text-accent bg-accent/5" : "text-muted-foreground"
                                  }`}
                                >
                                  <span>{location.name}</span>
                                  {selectedRegion === location.name && <Check size={16} />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {visibleLocationGroups.length === 0 && (
                      <p className="px-1 py-8 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</p>
                    )}
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
                onClick={applyFilters}
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {`필터 적용${draftFilterCount > 0 ? ` (${draftFilterCount})` : ""}`}
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
