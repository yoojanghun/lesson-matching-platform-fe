"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight, ChevronDown } from "lucide-react";
import { CATEGORIES, TUTORS } from "./data/mockData";
import { useCategoriesQuery } from "./hooks/queries/useCategories";
import TutorCard from "./components/TutorCard";

const PAGE_SIZE = 4;

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [popularCategory, setPopularCategory] = useState("전체");
  const [latestCategory, setLatestCategory] = useState("전체");

  const { data: categories, isLoading: isCategoriesLoading } = useCategoriesQuery();
  const isLoggedIn = typeof window !== 'undefined' ? !!localStorage.getItem('tm_token') : false;

  const categoryOptions = useMemo(() => {
    const options = categories?.map((category) => category.description) ?? CATEGORIES.map((category) => category.label);
    return ["전체", ...options];
  }, [categories]);

  const popularTutors = useMemo(() => [...TUTORS].sort((a, b) => b.rating - a.rating), []);
  const latestTutors = useMemo(() => [...TUTORS].sort((a, b) => b.id - a.id), []);

  const popularFilteredTutors = useMemo(() => {
    if (popularCategory === "전체") return popularTutors;
    return popularTutors.filter((tutor) => tutor.subject.toLowerCase().includes(popularCategory.toLowerCase()));
  }, [popularCategory, popularTutors]);

  const latestFilteredTutors = useMemo(() => {
    if (latestCategory === "전체") return latestTutors;
    return latestTutors.filter((tutor) => tutor.subject.toLowerCase().includes(latestCategory.toLowerCase()));
  }, [latestCategory, latestTutors]);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden px-8 py-14 text-white" style={{ backgroundColor: "#1e3a5f" }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 50%, #e05a2b 0%, transparent 60%), radial-gradient(circle at 20% 80%, #3b82f6 0%, transparent 50%)",
            opacity: 0.25,
          }}
        />
        <div className="relative max-w-lg">
          <p className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>TutorMatch</p>
          <h1 className="text-3xl font-bold leading-tight mb-4" style={{ color: "#ffffff" }}>
            나에게 맞는 악기 튜터를<br />지금 바로 찾아보세요
          </h1>
          <p className="text-sm mb-7 leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            피아노, 기타, 바이올린, 보컬까지 — 검증된 튜터와 1:1 맞춤 레슨을 시작하세요.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center rounded-lg px-3 gap-2" style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }}>
              <Search size={16} style={{ color: "rgba(255,255,255,0.6)" }} className="shrink-0" />
              <input
                className="flex-1 bg-transparent text-sm py-2.5 outline-none"
                style={{ color: "#ffffff" }}
                placeholder="악기, 튜터 이름 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => router.push("/tutors")}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold shrink-0 transition-colors cursor-pointer"
              style={{ backgroundColor: "#e05a2b", color: "#ffffff" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#c44e22")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#e05a2b")}
            >
              검색
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">악기별 탐색</h2>
          <button
            onClick={() => router.push("/subjects")}
            className="text-sm text-accent font-medium flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            전체 보기 <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          {isCategoriesLoading 
            ? Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="h-24 bg-gray-100 animate-pulse rounded-xl" />
              )) 
            : categories?.map(({categoryId, description, icon}) => (
                <button
                  key={categoryId}
                  onClick={() => router.push(`/subjects?category=${categoryId}`)}
                  className="flex flex-col items-center gap-2 p-3 sm:p-4 border border-border rounded-xl group cursor-pointer" style={{ backgroundColor: '#ffffff' }}
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center">
                    {icon}
                  </div>
                  <span className="text-xs font-semibold text-foreground">{description}</span>
                </button>
          ))}
        </div>
      </section>

      <div className="space-y-12">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">최고 인기 튜터</h2>
            <button
              onClick={() => router.push("/tutors")}
              className="flex items-center gap-0.5 text-sm font-medium text-accent hover:underline cursor-pointer"
            >
              전체 보기 <ChevronRight size={14} />
            </button>
          </div>
          <p className="mb-5 text-sm text-muted-foreground">최근 15일간 매칭과 평점이 높았던 인기 선생님들이에요</p>

          <div className="flex flex-wrap gap-2 mb-5">
            {categoryOptions.map((category) => {
              const isSelected = popularCategory === category;
              return (
                <button
                  key={`popular-${category}`}
                  type="button"
                  onClick={() => setPopularCategory(category)}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? "border-orange-500 bg-orange-500 text-white shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {popularFilteredTutors.slice(0, 4).map((tutor) => (
              <TutorCard key={`popular-${tutor.id}`} tutor={tutor} onClick={() => router.push(`/tutors/${tutor.id}`)} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">최신 등록 튜터</h2>
            <button
              onClick={() => router.push("/tutors")}
              className="flex items-center gap-0.5 text-sm font-medium text-accent hover:underline cursor-pointer"
            >
              전체 보기 <ChevronRight size={14} />
            </button>
          </div>
          <p className="mb-5 text-sm text-muted-foreground">최근 15일간 새롭게 합류한 선생님들을 만나보세요</p>

          <div className="flex flex-wrap gap-2 mb-5">
            {categoryOptions.map((category) => {
              const isSelected = latestCategory === category;
              return (
                <button
                  key={`latest-${category}`}
                  type="button"
                  onClick={() => setLatestCategory(category)}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? "border-orange-500 bg-orange-500 text-white shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {latestFilteredTutors.slice(0, 4).map((tutor) => (
              <TutorCard key={`latest-${tutor.id}`} tutor={tutor} onClick={() => router.push(`/tutors/${tutor.id}`)} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">AI 추천 튜터</h2>
          </div>
          <p className="mb-5 text-sm text-muted-foreground">작성하신 프로필을 바탕으로 적합한 선생님들을 추천해 드려요</p>

          {!isLoggedIn ? (
            <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-5 text-sm text-muted-foreground">
              <div className="flex items-center justify-between gap-4">
                <span>AI 추천을 위해 프로필을 작성해 주세요.</span>
                <button
                  type="button"
                  onClick={() => router.push("/student-profile")}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
                >
                  내 프로필로 이동
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-5 text-sm text-muted-foreground">
              <div className="flex items-center justify-between gap-4">
                <span>로그인된 상태입니다. 프로필을 확인하고 맞춤 추천을 받아보세요.</span>
                <button
                  type="button"
                  onClick={() => router.push("/student-profile")}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
                >
                  내 프로필 이동
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
