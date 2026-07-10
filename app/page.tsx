"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight, ChevronDown } from "lucide-react";
import { CATEGORIES, TUTORS } from "./data/mockData";
import TutorCard from "./components/TutorCard";

const PAGE_SIZE = 4;

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [tutorPage, setTutorPage] = useState(1);

  const visibleTutors = TUTORS.slice(0, tutorPage * PAGE_SIZE);
  const hasMore = visibleTutors.length < TUTORS.length;

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
            onClick={() => router.push("/tutors")}
            className="text-sm text-accent font-medium flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            전체 보기 <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          {CATEGORIES.map(({ icon: Icon, label, count }) => (
            <button
              key={label}
              onClick={() => router.push("/tutors")}
              className="flex flex-col items-center gap-2 p-3 sm:p-4 border border-border rounded-xl hover:shadow-sm hover:border-primary/30 transition-all group cursor-pointer" style={{ backgroundColor: '#ffffff' }}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Icon size={18} className="text-primary" />
              </div>
              <span className="text-xs font-semibold text-foreground">{label}</span>
              <span className="text-xs text-muted-foreground">{count}명</span>
            </button>
          ))}
        </div>
      </section>

      {/* 추천 튜터 */}
      <section>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-foreground">추천 튜터</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleTutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} onClick={() => router.push(`/tutors/${tutor.id}`)} />
          ))}
        </div>

        {/* Load more / collapse */}
        <div className="flex justify-center mt-5">
          {hasMore ? (
            <button
              onClick={() => setTutorPage((p) => p + 1)}
              className="flex flex-col items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
            >
              <span className="text-xs font-medium">튜터 더 보기</span>
              <span className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary/40 group-hover:bg-secondary transition-all">
                <ChevronDown size={16} />
              </span>
            </button>
          ) : (
            <button
              onClick={() => setTutorPage(1)}
              className="flex flex-col items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
            >
              <span className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary/40 group-hover:bg-secondary transition-all rotate-180">
                <ChevronDown size={16} />
              </span>
              <span className="text-xs font-medium">접기</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
