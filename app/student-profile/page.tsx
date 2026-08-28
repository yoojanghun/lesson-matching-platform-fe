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
import { useCategoriesQuery } from '../hooks/queries/useCategories';
import { useSaveStudentProfileMutation, useStudentProfileQuery } from '../hooks/queries/useProfiles';
import { useReferencesQuery } from '../hooks/queries/useReferences';

/* ── 선택지 데이터 ── */
const GOAL_OPTIONS = [
  { label: "취미 / 여가", desc: "즐기기 위해 배우고 싶어요" },
  { label: "콩쿠르 준비", desc: "콩쿠르를 준비 중이에요" },
  { label: "입시 / 진학", desc: "시험 준비가 목적이에요" },
  { label: "자격증 취득", desc: "공식 자격증을 따고 싶어요" },
  { label: "단기 성취", desc: "좋아하는 곡 하나를 완벽히 연주해내고 싶어요" },
  { label: "창작 / 작곡", desc: "직접 음악을 만들고 싶어요" },
];

const STYLE_OPTIONS = [
  "친절하고 따뜻한 선생님",
  "체계적이고 엄격한 선생님",
  "자유롭고 창의적인 선생님",
  "소통·피드백 중심",
  "결과·실력 중심",
  "이론·원리 설명 중심",
  "유머 있고 재미있는 수업",
  "상관 없음"
];

const LESSON_TYPE_OPTIONS = ["대면 수업", "온라인 수업", "둘 다 가능"] as const;
type LessonType = typeof LESSON_TYPE_OPTIONS[number];

const BUDGET_OPTIONS = [
  "5만원 이하 / 회",
  "5~7만원 / 회",
  "7~10만원 / 회",
  "10만원 이상 / 회",
  "상관없음",
];

const DAY_OPTIONS = ["월", "화", "수", "목", "금", "토", "일"];

const TIME_OPTIONS = [
  "오전 (7시~12시)",
  "오후 (12시~17시)",
  "저녁 (17시~21시)",
  "밤 (21시 이후)",
];

const GOAL_API_VALUES: Record<string, string> = {
  "취미 / 여가": "HOBBY",
  "콩쿠르 준비": "COMPETITION",
  "입시 / 진학": "EXAM",
  "자격증 취득": "CERTIFICATE",
  "단기 성취": "SHORT_TERM",
  "창작 / 작곡": "CREATION",
};

const STYLE_API_VALUES: Record<string, string> = {
  "친절하고 따뜻한 선생님": "KIND_AND_WARM",
  "체계적이고 엄격한 선생님": "STRUCTURED_AND_STRICT",
  "자유롭고 창의적인 선생님": "FREE_AND_CREATIVE",
  "소통·피드백 중심": "COMMUNICATION_AND_FEEDBACK",
  "결과·실력 중심": "RESULT_AND_SKILL",
  "이론·원리 설명 중심": "THEORY_AND_PRINCIPLE",
  "유머 있고 재미있는 수업": "HUMOROUS_AND_FUN",
  "상관 없음": "ANY",
};

const LESSON_TYPE_API_VALUES: Record<string, string> = {
  "대면 수업": "OFFLINE",
  "온라인 수업": "ONLINE",
  "둘 다 가능": "BOTH",
};

const BUDGET_API_VALUES: Record<string, string> = {
  "5만원 이하 / 회": "UNDER_50K",
  "5~7만원 / 회": "BETWEEN_50K_70K",
  "7~10만원 / 회": "BETWEEN_70K_100K",
  "10만원 이상 / 회": "OVER_100K",
  "상관없음": "NEGOTIABLE",
};

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
  const { data: categories, isLoading: isCategoriesLoading } = useCategoriesQuery();
  const { data: references } = useReferencesQuery(role !== 'GUEST');
  const savedProfile = useUserStore((state) => state.studentProfile);
  const saveStudentProfile = useUserStore((state) => state.saveStudentProfile);
  const profileQuery = useStudentProfileQuery(role === 'STUDENT');
  const saveProfileMutation = useSaveStudentProfileMutation();

  /* 상태 */
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
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
      setLessonType(savedProfile.lessonType || "");
      setLocation(savedProfile.location || "");
      setBudget(savedProfile.budget || "");
      setDays(savedProfile.days || []);
      setTimes(savedProfile.times || []);
      setMemo(savedProfile.memo || "");
    }
  }, [savedProfile]);

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;

    setInterests(profile.instruments.map((instrument) =>
      categories?.find((category) => category.categoryName === instrument.categoryType)?.description ?? instrument.categoryType ?? ''
    ).filter(Boolean));
    setGoals(profile.goals.map((goal) =>
      references?.lessonGoals.find((referenceGoal) => referenceGoal.lessonGoalType === goal.lessonGoalType)?.description ??
      GOAL_OPTIONS.find(({ label }) => GOAL_API_VALUES[label] === goal.lessonGoalType)?.label ?? ''
    ).filter(Boolean));
    setStyles(profile.styles.map((style) =>
      references?.tutorStyles.find((referenceStyle) => referenceStyle.styleType === style.styleType)?.description ??
      STYLE_OPTIONS.find((label) => STYLE_API_VALUES[label] === style.styleType) ?? ''
    ).filter(Boolean));
    setLessonType(Object.entries(LESSON_TYPE_API_VALUES).find(([, value]) => value === profile.lessonType)?.[0] as LessonType | undefined ?? '');
    setLocation(profile.locations.map((locationItem) => locationItem.name).join(', '));
    setBudget(Object.entries(BUDGET_API_VALUES).find(([, value]) => value === profile.budgetType)?.[0] ?? '');
    setMemo(profile.introduction ?? '');
  }, [categories, profileQuery.data, references]);

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
      lessonType,
      location,
      budget,
      days,
      times,
      memo,
    };
    saveProfileMutation.mutate({
      categoryIds: categories?.filter((category) => interests.includes(category.description)).map((category) => category.categoryId),
      styleIds: references?.tutorStyles.filter((style) => styles.includes(style.description)).map((style) => style.id),
      goalIds: references?.lessonGoals.filter((goal) => goals.includes(goal.description ?? GOAL_OPTIONS.find((option) => GOAL_API_VALUES[option.label] === goal.lessonGoalType)?.label ?? '')).map((goal) => goal.goalId),
      locationIds: references?.locations.filter((locationItem) => location.split(',').map((item) => item.trim()).includes(locationItem.name)).map((locationItem) => locationItem.locationId),
      introduction: memo,
      lessonType: lessonType ? LESSON_TYPE_API_VALUES[lessonType] : undefined,
      budgetType: budget ? BUDGET_API_VALUES[budget] : undefined,
    }, {
      onSuccess: () => {
        saveStudentProfile(profileData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      },
    });
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
          {categories?.map(({ categoryId, description}) => (
            <Chip
              key={categoryId}
              label={description}
              selected={interests.includes(description)}
              onClick={() => toggle(interests, setInterests, description)}
            />
          ))}
        </div>
      </SectionCard>

      {/* 2. 레슨 목표 */}
      <SectionCard icon={SlidersHorizontal} title="레슨 목표">
        <p className="text-xs text-muted-foreground -mt-1">레슨을 받으려는 목적을 선택하세요. (복수 선택 가능)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(references?.lessonGoals.length
            ? references.lessonGoals.map((goal) => ({
              label: goal.description ?? GOAL_OPTIONS.find((option) => GOAL_API_VALUES[option.label] === goal.lessonGoalType)?.label ?? goal.lessonGoalType,
              desc: GOAL_OPTIONS.find((option) => GOAL_API_VALUES[option.label] === goal.lessonGoalType)?.desc ?? '',
            }))
            : GOAL_OPTIONS
          ).map(({ label, desc }) => {
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
          {(references?.tutorStyles.length
            ? references.tutorStyles.map((style) => style.description)
            : STYLE_OPTIONS
          ).map((o) => (
            <Chip
              key={o}
              label={o}
              selected={styles.includes(o)}
              onClick={() => toggle(styles, setStyles, o)}
            />
          ))}
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
        <div className="flex flex-wrap gap-2">
          {(references?.locations ?? []).map((locationOption) => (
            <Chip
              key={locationOption.locationId}
              label={locationOption.name}
              selected={location.split(',').map((item) => item.trim()).includes(locationOption.name)}
              onClick={() => setLocation((current) => {
                const selected = current.split(',').map((item) => item.trim()).filter(Boolean);
                return selected.includes(locationOption.name)
                  ? selected.filter((item) => item !== locationOption.name).join(', ')
                  : [...selected, locationOption.name].join(', ');
              })}
            />
          ))}
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
        {saveProfileMutation.isPending ? (
          "저장 중..."
        ) : saved ? (
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
