"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { useTutorsQuery } from "../hooks/queries/useTutors";
import TutorCard from "../components/TutorCard";

const INSTRUMENT_CATS = ["전체", "피아노", "기타", "바이올린", "보컬", "드럼", "첼로", "작곡"];

export default function TutorsPage() {
  const router = useRouter();
  const [selectedCat, setSelectedCat] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("인기순");

  // TanStack Query로 튜터 목록 조회 (5분 자동 캐싱)
  const { data: tutors = [], isLoading, isError } = useTutorsQuery({
    subject: selectedCat,
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

        <div className="flex gap-1.5 flex-wrap">
          {INSTRUMENT_CATS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedCat === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-foreground border-border hover:border-primary/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

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
    </div>
  );
}
