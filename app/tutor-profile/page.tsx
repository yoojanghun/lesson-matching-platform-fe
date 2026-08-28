'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Briefcase,
  Wallet,
  BookOpen,
  SlidersHorizontal,
  MapPin,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronDown,
  X,
} from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import LoginGate from '../components/LoginGate';
import type { TutorProfileData, BulletEntry, FeeEntry } from '../types';
import { useCategoriesQuery } from '../hooks/queries/useCategories';
import { useSaveTutorProfileMutation, useTutorProfileQuery } from '../hooks/queries/useProfiles';
import { useReferencesQuery } from '../hooks/queries/useReferences';

/* ── 선택지 ── */
const GOAL_OPTIONS = [
  { label: "취미 / 여가", desc: "즐기기 위해 배우고 싶어요" },
  { label: "콩쿠르 준비", desc: "콩쿠르를 준비 중이에요" },
  { label: "입시 / 진학", desc: "시험 준비가 목적이에요" },
  { label: "자격증 취득", desc: "공식 자격증을 따고 싶어요" },
  { label: "단기 성취", desc: "좋아하는 곡 하나를 완벽히 연주해내고 싶어요" },
  { label: "창작 / 작곡", desc: "직접 음악을 만들고 싶어요" },
];

const TEACH_STYLE_OPTIONS = [
  "악보 중심 수업",
  "청음·귀 훈련 중심",
  "이론 병행",
  "곡 위주 실전",
  "대화형·소통 중심",
  "과제 중심",
  "즉흥 연주 포함",
  "콩쿠르 준비",
];

const LESSON_TYPE_OPTIONS = ["대면 수업", "온라인 수업", "둘 다 가능"] as const;
type LessonType = typeof LESSON_TYPE_OPTIONS[number];

const SUBJECT_OPTIONS = [
  "피아노", "바이올린", "첼로", "기타", "우쿨렐레",
  "드럼", "보컬", "작곡", "음악이론", "플루트", "색소폰",
];

/* ── Helper components ── */
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

function InputRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

const INPUT_BASE = "w-full px-4 py-3 border border-border rounded-xl text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40";

let _id = 100;
const uid = () => ++_id;

export default function TutorProfilePage() {
  const role = useUserStore((state) => state.role);
  const { data: categories } = useCategoriesQuery();
  const { data: references } = useReferencesQuery(role !== 'GUEST');
  const userName = useUserStore((state) => state.userName);
  const savedProfile = useUserStore((state) => state.tutorProfile);
  const saveTutorProfile = useUserStore((state) => state.saveTutorProfile);
  const profileQuery = useTutorProfileQuery(role === 'TUTOR');
  const saveProfileMutation = useSaveTutorProfileMutation();

  /* 기본 정보 */
  const [name, setName] = useState(userName || "");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [subjects, setSubjects] = useState<string[]>(["피아노"]);
  const [goals, setGoals] = useState<string[]>([]);

  /* 학력 */
  const [educations, setEducations] = useState<BulletEntry[]>([
    { id: uid(), text: "" },
  ]);

  /* 경력 */
  const [careers, setCareers] = useState<BulletEntry[]>([
    { id: uid(), text: "" },
  ]);

  /* 레슨비 */
  const [fees, setFees] = useState<FeeEntry[]>([
    { id: uid(), type: "취미반", duration: "60분", price: "50000" },
    { id: uid(), type: "전공반", duration: "60분", price: "80000" },
  ]);

  /* 수업 방식 */
  const [teachStyles, setTeachStyles] = useState<string[]>([]);
  const [teachNote, setTeachNote] = useState("");

  /* 수업 형태 */
  const [lessonType, setLessonType] = useState<LessonType | "">("둘 다 가능");

  /* 자기 소개 */
  const [intro, setIntro] = useState("");

  /* 저장 */
  const [saved, setSaved] = useState(false);

  // 저장된 프로필이 있다면 불러오기
  useEffect(() => {
    if (savedProfile) {
      if (savedProfile.name) setName(savedProfile.name);
      setAge(savedProfile.age || "");
      setLocation(savedProfile.location || "");
      setSubjects(savedProfile.subjects || []);
      setGoals(savedProfile.goals || []);
      if (savedProfile.educations && savedProfile.educations.length > 0) {
        setEducations(savedProfile.educations);
      }
      if (savedProfile.careers && savedProfile.careers.length > 0) {
        setCareers(savedProfile.careers);
      }
      if (savedProfile.fees && savedProfile.fees.length > 0) {
        setFees(savedProfile.fees.slice(0, 3));
      }
      setTeachStyles(savedProfile.teachStyles || []);
      setTeachNote(savedProfile.teachNote || "");
      setLessonType(savedProfile.lessonType || "");
      setIntro(savedProfile.intro || "");
    }
  }, [savedProfile]);

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;

    setName(profile.name || userName || '');
    setLocation(profile.locations.map((locationItem) => locationItem.name).join(', '));
    setSubjects(profile.categories.map((category) =>
      categories?.find((item) => item.categoryName === category.categoryType)?.description ?? category.categoryType ?? ''
    ).filter(Boolean));
    setTeachStyles(profile.styles.map((style) => style.description ?? '').filter(Boolean));
    setTeachNote(profile.content ?? '');
    setIntro(profile.introduction ?? '');
    setCareers(profile.career ? profile.career.split('\n').map((text, index) => ({ id: index + 1, text })) : [{ id: uid(), text: '' }]);
  }, [categories, profileQuery.data, references, userName]);

  if (role === 'GUEST') {
    return (
      <LoginGate
        title="선생님 프로필 작성을 위해 로그인이 필요합니다"
        description="프로필을 등록하면 학생들에게 내 수업 정보가 노출되고 더 많은 레슨 매칭 기회를 얻을 수 있습니다."
      />
    );
  }

  const toggleArr = (arr: string[], set: React.Dispatch<React.SetStateAction<string[]>>, val: string) =>
    set((prev) => (prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]));

  /* bullet list helpers */
  const addBullet = (set: React.Dispatch<React.SetStateAction<BulletEntry[]>>) =>
    set((p) => [...p, { id: uid(), text: "" }]);
  const removeBullet = (set: React.Dispatch<React.SetStateAction<BulletEntry[]>>, id: number) =>
    set((p) => p.filter((e) => e.id !== id));
  const updateBullet = (set: React.Dispatch<React.SetStateAction<BulletEntry[]>>, id: number, val: string) =>
    set((p) => p.map((e) => (e.id === id ? { ...e, text: val } : e)));

  /* 레슨비 helpers */
  const addFee = () =>
    setFees((p) => p.length < 3 ? [...p, { id: uid(), type: "", duration: "60분", price: "" }] : p);
  const removeFee = (id: number) =>
    setFees((p) => p.filter((f) => f.id !== id));
  const updateFee = (id: number, field: keyof FeeEntry, val: string) =>
    setFees((p) => p.map((f) => (f.id === id ? { ...f, [field]: val } : f)));

  const handleSave = () => {
    const profileData: TutorProfileData = {
      name,
      age,
      location,
      subjects,
      goals,
      educations: educations.filter((e) => e.text.trim() !== ""),
      careers: careers.filter((c) => c.text.trim() !== ""),
      fees: fees.filter((f) => f.type.trim() !== "" && f.price.trim() !== ""),
      teachStyles,
      teachNote,
      lessonType,
      intro,
    };
    saveProfileMutation.mutate({
      categoryIds: categories?.filter((category) => subjects.includes(category.description)).map((category) => category.categoryId),
      subjectIds: categories?.filter((category) => subjects.includes(category.description)).flatMap((category) => category.subjects.map((subject) => subject.subjectId)),
      styleIds: references?.tutorStyles.filter((style) => teachStyles.includes(style.description)).map((style) => style.id),
      locationIds: references?.locations.filter((locationItem) => location.split(',').map((item) => item.trim()).includes(locationItem.name)).map((locationItem) => locationItem.locationId),
      career: careers.filter((career) => career.text.trim()).map((career) => career.text.trim()).join('\n'),
      content: teachNote,
      introduction: intro,
    }, {
      onSuccess: () => {
        saveTutorProfile(profileData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-xl font-bold text-foreground">내 프로필 (선생님)</h2>
        <p className="text-sm text-muted-foreground mt-1">
          프로필과 레슨비를 상세히 작성할수록 학생 매칭 및 레슨 예약 전환율이 높아집니다.
        </p>
      </div>

      {/* 1. 기본 정보 */}
      <SectionCard icon={User} title="기본 정보">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputRow label="이름">
            <input
              type="text"
              placeholder="예) 김지수"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={INPUT_BASE}
            />
          </InputRow>
          <InputRow label="나이">
            <input
              type="number"
              placeholder="예) 28"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={INPUT_BASE}
            />
          </InputRow>
        </div>
        <InputRow label="활동 지역">
          <input
            type="text"
            placeholder="예) 서울 마포구, 서초구, 경기 고양시..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={INPUT_BASE}
          />
        </InputRow>
        <InputRow label="가르치는 악기 / 분야">
          <div className="flex flex-wrap gap-2 pt-0.5">
            {SUBJECT_OPTIONS.map((o) => (
              <Chip
                key={o}
                label={o}
                selected={subjects.includes(o)}
                onClick={() => toggleArr(subjects, setSubjects, o)}
              />
            ))}
          </div>
        </InputRow>
      </SectionCard>

      {/* 2. 레슨 목표 */}
      <SectionCard icon={SlidersHorizontal} title="레슨 목표">
        <p className="text-xs text-muted-foreground -mt-1">진행 가능한 레슨 목표를 선택하세요. (복수 선택 가능)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {GOAL_OPTIONS.map(({ label, desc }) => {
            const selected = goals.includes(label);
            return (
              <button
                type="button"
                key={label}
                onClick={() => toggleArr(goals, setGoals, label)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 hover:bg-muted/40"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                    selected ? "border-primary bg-primary" : "border-muted-foreground/40"
                  }`}
                >
                  {selected && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${selected ? "text-primary" : "text-foreground"}`}>{label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* 3. 학력 */}
      <SectionCard icon={GraduationCap} title="학력">
        <p className="text-xs text-muted-foreground -mt-1">최신 학력부터 입력하세요.</p>
        <div className="space-y-2">
          {educations.map((edu) => (
            <div key={edu.id} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary/50 shrink-0" />
              <input
                type="text"
                placeholder="예) (2016–2020) 서울대학교 피아노과 학사 졸업"
                value={edu.text}
                onChange={(e) => updateBullet(setEducations, edu.id, e.target.value)}
                className="flex-1 px-3 py-2.5 border border-border rounded-xl text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
              />
              {educations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBullet(setEducations, edu.id)}
                  className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer shrink-0"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addBullet(setEducations)}
          className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary font-semibold transition-colors cursor-pointer"
        >
          <Plus size={14} /> 학력 항목 추가
        </button>
      </SectionCard>

      {/* 3. 경력 */}
      <SectionCard icon={Briefcase} title="개인 경력">
        <p className="text-xs text-muted-foreground -mt-1">레슨, 연주, 콩쿠르 입상, 교육기관 경력 등을 입력하세요.</p>
        <div className="space-y-2">
          {careers.map((career) => (
            <div key={career.id} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary/50 shrink-0" />
              <input
                type="text"
                placeholder="예) (2021–현재) 서울음악학원 전임 강사"
                value={career.text}
                onChange={(e) => updateBullet(setCareers, career.id, e.target.value)}
                className="flex-1 px-3 py-2.5 border border-border rounded-xl text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
              />
              {careers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBullet(setCareers, career.id)}
                  className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer shrink-0"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addBullet(setCareers)}
          className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary font-semibold transition-colors cursor-pointer"
        >
          <Plus size={14} /> 경력 항목 추가
        </button>
      </SectionCard>

      {/* 4. 레슨비 설정 (전공반 / 취미반 등) */}
      <SectionCard icon={Wallet} title="학생별 레슨비 설정">
        <p className="text-xs text-muted-foreground -mt-1">학생 유형(전공반/취미반/유아 등)별 레슨 단가를 설정하세요.</p>
        <div className="space-y-2.5">
          {fees.map((fee) => (
            <div key={fee.id} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5 p-3 rounded-xl bg-muted/20 border border-border/50">
              <div className="flex-1 space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">학생 유형</label>
                <input
                  type="text"
                  placeholder="예) 전공반, 취미반, 성인반..."
                  value={fee.type}
                  onChange={(e) => updateFee(fee.id, "type", e.target.value)}
                  className={INPUT_BASE}
                />
              </div>
              <div className="w-full sm:w-28 space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">수업 시간</label>
                <div className="relative">
                  <select
                    value={fee.duration}
                    onChange={(e) => updateFee(fee.id, "duration", e.target.value)}
                    className={`${INPUT_BASE} appearance-none pr-7`}
                  >
                    {["30분", "45분", "60분", "90분", "120분"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="w-full sm:w-36 space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">회당 금액 (원)</label>
                <input
                  type="number"
                  placeholder="50000"
                  value={fee.price}
                  onChange={(e) => updateFee(fee.id, "price", e.target.value)}
                  className={INPUT_BASE}
                />
              </div>
              <button
                type="button"
                onClick={() => removeFee(fee.id)}
                disabled={fees.length === 1}
                className="self-end mb-1 p-2.5 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
                title="삭제"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addFee}
          disabled={fees.length >= 3}
          className="w-full py-2.5 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          <Plus size={14} /> 레슨비 항목 추가
        </button>
      </SectionCard>

      {/* 5. 수업 방식 */}
      <SectionCard icon={BookOpen} title="수업 방식 및 스타일">
        <p className="text-xs text-muted-foreground -mt-1">선생님의 수업 스타일과 가장 잘 맞는 항목을 선택하세요.</p>
        <div className="flex flex-wrap gap-2">
          {(references?.tutorStyles.length
            ? references.tutorStyles.map((style) => style.description)
            : TEACH_STYLE_OPTIONS
          ).map((o) => (
            <Chip
              key={o}
              label={o}
              selected={teachStyles.includes(o)}
              onClick={() => toggleArr(teachStyles, setTeachStyles, o)}
            />
          ))}
        </div>
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-semibold text-muted-foreground">기타 수업 방식 (직접 입력)</label>
          <textarea
            rows={2}
            placeholder="수업 진행 방식의 특징이나 장점을 자유롭게 적어주세요."
            value={teachNote}
            onChange={(e) => setTeachNote(e.target.value)}
            className={`${INPUT_BASE} resize-none leading-relaxed`}
          />
        </div>
      </SectionCard>

      {/* 6. 수업 형태 */}
      <SectionCard icon={MapPin} title="수업 형태 및 지역">
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
        {(lessonType === "대면 수업" || lessonType === "둘 다 가능") && (
          <InputRow label="대면 수업 가능 지역">
            <div className="flex flex-wrap gap-2">
              {(references?.locations ?? []).map((locationOption) => (
                <button
                  key={locationOption.locationId}
                  type="button"
                  onClick={() => setLocation((current) => {
                    const selected = current.split(',').map((item) => item.trim()).filter(Boolean);
                    return selected.includes(locationOption.name)
                      ? selected.filter((item) => item !== locationOption.name).join(', ')
                      : [...selected, locationOption.name].join(', ');
                  })}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                    location.split(',').map((item) => item.trim()).includes(locationOption.name)
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {locationOption.name}
                </button>
              ))}
            </div>
          </InputRow>
        )}
      </SectionCard>

      {/* 7. 자기소개 */}
      <SectionCard icon={Clock} title="선생님 소개글">
        <p className="text-xs text-muted-foreground -mt-1">학생들에게 보여질 상세한 자기소개를 작성하세요.</p>
        <textarea
          rows={5}
          placeholder="예) 안녕하세요! 학생 개개인의 속도와 성향에 맞추어 즐겁고 탄탄한 기본기를 길러드립니다. 클래식 입시부터 취미 연주까지 친절하게 지도합니다."
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          className={`${INPUT_BASE} resize-none leading-relaxed`}
        />
      </SectionCard>

      {/* 저장 */}
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
