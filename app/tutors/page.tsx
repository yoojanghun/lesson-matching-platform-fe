"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { TUTORS } from "../data/mockData";
import TutorCard from "../components/TutorCard";

const INSTRUMENT_CATS = ["전체", "피아노", "기타", "바이올린", "보컬", "드럼", "첼로", "작곡"];

export default function TutorsPage() {
  const router = useRouter();
  const [selectedCat, setSelectedCat] = useState("전체");
  const [sort, setSort] = useState("인기순");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">튜터 목록</h2>
        <p className="text-sm text-muted-foreground">총 {TUTORS.length}명의 튜터가 있습니다</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center bg-card border border-border rounded-lg px-3 gap-2 flex-1 min-w-48">
          <Search size={15} className="text-muted-foreground shrink-0" />
          <input className="flex-1 bg-transparent text-sm py-2 outline-none text-foreground placeholder-muted-foreground" placeholder="튜터 이름, 악기 검색..." />
        </div>
        <div className="flex gap-2 flex-wrap">
          {INSTRUMENT_CATS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                selectedCat === cat
                  ? "bg-primary text-primary-foreground border-primary"
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
          className="px-3 py-2 bg-card border border-border rounded-lg text-xs text-foreground outline-none cursor-pointer"
        >
          {["인기순", "최신순", "가격 낮은순", "가격 높은순"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TUTORS.map((tutor) => (
          <TutorCard key={tutor.id} tutor={tutor} onClick={() => router.push(`/tutors/${tutor.id}`)} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-1 pt-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            className={`w-8 h-8 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
              n === 1 ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/40"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
