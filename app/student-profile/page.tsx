'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Clock,
  Wallet,
  SlidersHorizontal,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import LoginGate from '../components/LoginGate';
import type { StudentProfile } from '../types';

/* ── 선택지 데이터 ── */
const INTEREST_OPTIONS = [
  "피아노", "바이올린", "첼로", "기타", "우쿨렐레",
  "드럼", "보컬", "작곡", "음악이론", "플루트", "색소폰",
];

const GOAL_OPTIONS = [
  { label: "취미 / 여가", desc: "즐기기 위해 배우고 싶어요" },
  { label: "입시 / 수능", desc: "시험 준비가 목적이에요" },
  { label: "자격증 취득", desc: "공식 자격증을 따고 싶어요" },
  { label: "전문 연주자", desc: "직업적으로 발전하고 싶어요" },
  { label: "기초 다지기", desc: "기본기를 탄탄히 하고 싶어요" },
  { label: "창작 / 작곡", desc: "직접 음악을 만들고 싶어요" },
];

const STYLE_OPTIONS = [
  "친절하고 따뜻한 선생님",
  "체계적이고 엄격한 선생님",
  "자유롭고 창의적인 선생님",
  "소통·피드백 중심",
  "결과·실력 중심",
  "유머 있고 재미있는 수업",
];

const LESSON_TYPE_OPTIONS = ["대면 수업", "온라인 수업", "둘 다 가능"] as const;
type LessonType = typeof LESSON_TYPE_OPTIONS[number];

const BUDGET_OPTIONS = [
  "3만원 이하 / 회",
  "3~5만원 / 회",
  "5~7만원 / 회",
  "7만원 이상 / 회",
  "상관없음",
];

const DAY_OPTIONS = ["월", "화", "수", "목", "금", "토", "일"];

const TIME_OPTIONS = [
  "오전 (9시~12시)",
  "오후 (12시~17시)",
  "저녁 (17시~21시)",
  "밤 (21시 이후)",
];

/* ── UI Components ── */
function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
        selected
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shrink-0">
          <Icon size={16} className="text-primary" />
        </div>
        <p className="text-sm font-bold text-foreground">{title}</p>
      </div>
      {children}
    </div>
  );
}

export default function StudentProfilePage() {
  const role = useUserStore((state) => state.role);
  const savedProfile = useUserStore((state) => state.studentProfile);
  const saveStudentProfile = useUserStore((state) => state.saveStudentProfile);

  /* 상태 */
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [styleNote, setStyleNote] = useState("");
  const [lessonType, setLessonType] = useState<LessonType | "">("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [memo, setMemo] = useState("");
  const [saved, setSaved] = useState(false);

  // 저장된 프로필이 있다면 불러오기
  useEffect(() => {
    if (savedProfile) {
      setInterests(savedProfile.interests || []);
      setGoals(savedProfile.goals || []);
      setStyles(savedProfile.styles || []);
      setStyleNote(savedProfile.styleNote || "");
      setLessonType(savedProfile.lessonType || "");
      setLocation(savedProfile.location || "");
      setBudget(savedProfile.budget || "");
      setDays(savedProfile.days || []);
      setTimes(savedProfile.times || []);
      setMemo(savedProfile.memo || "");
    }
  }, [savedProfile]);

  if (role === 'GUEST') {
    return (
      <LoginGate
        title="학생 프로필 작성을 위해 로그인이 필요합니다"
        description="프로필을 등록하면 AI가 회원님의 취향과 목표에 딱 맞는 튜터를 추천해 드립니다."
      />
    );
  }

  const toggle = (arr: string[], set: React.Dispatch<React.SetStateAction<string[]>>, val: string) =>
    set((prev) => (prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]));

  const handleSave = () => {
    const profileData: StudentProfile = {
      interests,
      goals,
      styles,
      styleNote,
      lessonType,
      location,
      budget,
      days,
      times,
      memo,
    };
    saveStudentProfile(profileData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-xl font-bold text-foreground">내 프로필 (학생)</h2>
        <p className="text-sm text-muted-foreground mt-1">
          프로필을 작성해 두시면 <strong>AI가 나에게 꼭 맞는 튜터를 분석하여 추천</strong>해 드려요.
        </p>
      </div>

      {/* 1. 관심 분야 */}
      <SectionCard icon={BookOpen} title="관심 분야">
        <p className="text-xs text-muted-foreground -mt-1">배우고 싶은 악기나 분야를 모두 선택하세요.</p>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((o) => (
            <Chip
              key={o}
              label={o}
              selected={interests.includes(o)}
              onClick={() => toggle(interests, setInterests, o)}
            />
          ))}
        </div>
      </SectionCard>

      {/* 2. 레슨 목표 */}
      <SectionCard icon={SlidersHorizontal} title="레슨 목표">
        <p className="text-xs text-muted-foreground -mt-1">레슨을 받으려는 목적을 선택하세요. (복수 선택 가능)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {GOAL_OPTIONS.map(({ label, desc }) => {
            const sel = goals.includes(label);
            return (
              <button
                type="button"
                key={label}
                onClick={() => toggle(goals, setGoals, label)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  sel ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 hover:bg-muted/40"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                    sel ? "border-primary bg-primary" : "border-muted-foreground/40"
                  }`}
                >
                  {sel && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${sel ? "text-primary" : "text-foreground"}`}>{label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* 3. 선호 선생님 스타일 (AI 추천 분석용) */}
      <SectionCard icon={User} title="선호하는 선생님 스타일 (AI 추천용)">
        <p className="text-xs text-muted-foreground -mt-1">어떤 스타일의 선생님과 수업하고 싶으신가요?</p>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((o) => (
            <Chip
              key={o}
              label={o}
              selected={styles.includes(o)}
              onClick={() => toggle(styles, setStyles, o)}
            />
          ))}
        </div>
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-semibold text-muted-foreground">기타 선호 스타일 (직접 입력)</label>
          <textarea
            rows={2}
            placeholder="위 항목에 없는 세부 선호 사항을 자유롭게 적어주세요. (AI 추천 시 반영됩니다)"
            value={styleNote}
            onChange={(e) => setStyleNote(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-xl text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 resize-none leading-relaxed"
          />
        </div>
      </SectionCard>

      {/* 4. 수업 형태 */}
      <SectionCard icon={Clock} title="수업 형태">
        <div className="flex gap-2 flex-wrap">
          {LESSON_TYPE_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => setLessonType(opt)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                lessonType === opt
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* 5. 레슨 가능 지역 */}
      <SectionCard icon={MapPin} title="레슨 가능 지역">
        <p className="text-xs text-muted-foreground -mt-1">대면 수업이 가능한 지역을 알려주세요.</p>
        <input
          type="text"
          placeholder="예) 서울 강남구, 경기 성남시 분당구..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-4 py-3 border border-border rounded-xl text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
        />
      </SectionCard>

      {/* 6. 가능한 시간대 */}
      <SectionCard icon={Clock} title="레슨 가능 시간대">
        <p className="text-xs text-muted-foreground -mt-1">수업 가능한 요일과 시간대를 선택하세요.</p>
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground mb-2">요일</p>
          <div className="flex gap-1.5 flex-wrap">
            {DAY_OPTIONS.map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => toggle(days, setDays, d)}
                className={`w-10 h-10 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                  days.includes(d)
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="pt-2">
          <p className="text-[11px] font-semibold text-muted-foreground mb-2">시간대</p>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((t) => (
              <Chip
                key={t}
                label={t}
                selected={times.includes(t)}
                onClick={() => toggle(times, setTimes, t)}
              />
            ))}
          </div>
        </div>
      </SectionCard>

      {/* 7. 예산 */}
      <SectionCard icon={Wallet} title="레슨비 예산">
        <p className="text-xs text-muted-foreground -mt-1">1회 레슨 기준으로 생각하는 예산 범위를 선택하세요.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BUDGET_OPTIONS.map((b) => (
            <button
              type="button"
              key={b}
              onClick={() => setBudget(b)}
              className={`py-2.5 px-3 rounded-xl text-sm font-semibold border text-center transition-all cursor-pointer ${
                budget === b
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* 8. 추가 요청 사항 */}
      <SectionCard icon={BookOpen} title="추가 요청 사항">
        <p className="text-xs text-muted-foreground -mt-1">선생님께 미리 알리고 싶은 내용이나 특별한 요구사항을 적어주세요.</p>
        <textarea
          rows={4}
          placeholder="예) 악보를 전혀 못 읽어요 / 성인 취미반 선호 / 퇴근 후 8시 이후 희망..."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full px-4 py-3 border border-border rounded-xl text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 resize-none leading-relaxed"
        />
      </SectionCard>

      {/* 저장 버튼 */}
      <button
        type="button"
        onClick={handleSave}
        className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer shadow-md ${
          saved
            ? "bg-emerald-500 text-white"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        {saved ? (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle2 size={16} /> 프로필 저장 완료!
          </span>
        ) : (
          "프로필 저장"
        )}
      </button>

      <div className="h-4" />
    </div>
  );
}
