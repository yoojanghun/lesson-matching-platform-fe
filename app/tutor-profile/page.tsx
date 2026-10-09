'use client';

import React, { startTransition, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  Eye,
  EyeOff,
  X,
  Info,
} from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import LoginGate from '../components/LoginGate';
import type { TutorProfileData, BulletEntry, FeeEntry } from '../types';
import { useCategoriesQuery } from '../hooks/queries/useCategories';
import { useSaveTutorProfileMutation, useTutorProfileQuery, useUpdateBankAccountMutation } from '../hooks/queries/useProfiles';
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

function ProfileSection({ icon, title, onEdit, children }: { icon: string; title: string; onEdit?: () => void; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-foreground"><span aria-hidden="true">{icon}</span>{title}</h3>
        {onEdit && <button type="button" onClick={onEdit} className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer">수정</button>}
      </div>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

function PrivacyToggle({ isPublic, onClick }: { isPublic: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
        isPublic
          ? "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
          : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
      }`}
      aria-label={isPublic ? "비공개로 변경" : "공개로 변경"}
    >
      {isPublic ? <Eye size={13} /> : <EyeOff size={13} />}
      {isPublic ? "공개" : "비공개"}
    </button>
  );
}

const INPUT_BASE = "w-full px-4 py-3 border border-border rounded-xl text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40";

let _id = 100;
const uid = () => ++_id;

interface PendingTutorProfileEdit {
  tutorId?: number;
  categoryIds?: number[];
  subjectIds?: number[];
  title?: string;
  introduction?: string;
  educations?: string[];
  experiences?: string[];
  lessonType?: 'ONLINE' | 'OFFLINE' | 'BOTH';
  locationIds?: number[];
  styleIds?: number[];
  goalIds?: number[];
  prices?: Array<{ className: string; price: number }>;
  bankName?: string;
  bankAccountHolder?: string;
  bankAccountNumber?: string;
}

export default function TutorProfilePage() {
  const router = useRouter();
  const role = useUserStore((state) => state.role);
  const userId = useUserStore((state) => state.userId);
  const { data: categories } = useCategoriesQuery();
  const { data: references } = useReferencesQuery(role !== 'GUEST');
  const userName = useUserStore((state) => state.userName);
  const savedProfile = useUserStore((state) => state.tutorProfile);
  const saveTutorProfile = useUserStore((state) => state.saveTutorProfile);
  const profileQuery = useTutorProfileQuery(role === 'TUTOR');
  const saveProfileMutation = useSaveTutorProfileMutation();
  const updateBankAccountMutation = useUpdateBankAccountMutation();

  /* 기본 정보 */
  const [name, setName] = useState(userName || "");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthDatePublic, setBirthDatePublic] = useState(false);
  const [emailPublic, setEmailPublic] = useState(true);
  const [phoneNumberPublic, setPhoneNumberPublic] = useState(true);
  const [location, setLocation] = useState("");
  const [subjects, setSubjects] = useState<string[]>(["피아노"]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
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
  const [title, setTitle] = useState("");
  const [intro, setIntro] = useState("");

  /* 계좌 정보 */
  const [bankName, setBankName] = useState("");
  const [bankAccountHolder, setBankAccountHolder] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");

  /* 저장 */
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingCategoryIds, setPendingCategoryIds] = useState<number[] | null>(null);
  const [pendingSubjectIds, setPendingSubjectIds] = useState<number[] | null>(null);
  const [pendingLocationIds, setPendingLocationIds] = useState<number[] | null>(null);
  const pendingDraftAppliedRef = useRef(false);

  // 저장된 프로필이 있다면 불러오기
  useEffect(() => {
    if (savedProfile) {
      startTransition(() => {
        if (savedProfile.name) setName(savedProfile.name);
        setBirthDate(savedProfile.birthDate || "");
        setEmail(savedProfile.email || "");
        setPhoneNumber(savedProfile.phoneNumber || "");
        setBirthDatePublic(savedProfile.birthDatePublic ?? false);
        setEmailPublic(savedProfile.emailPublic ?? true);
        setPhoneNumberPublic(savedProfile.phoneNumberPublic ?? true);
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
        setTitle(savedProfile.title || "");
        setIntro(savedProfile.intro || "");
        if (savedProfile.bankName) setBankName(savedProfile.bankName);
        if (savedProfile.bankAccountHolder) setBankAccountHolder(savedProfile.bankAccountHolder);
        if (savedProfile.bankAccountNumber) setBankAccountNumber(savedProfile.bankAccountNumber);
      });
    }
  }, [savedProfile]);

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;

    // sessionStorage에 아직 저장되지 않은 수정 초안이 있다면 서버 데이터로 덮어쓰지 않음
    if (typeof window !== 'undefined' && sessionStorage.getItem('pending-tutor-profile-edit')) {
      return;
    }

    startTransition(() => {
      setName(profile.name || userName || '');
      setBirthDate(profile.birthDate || '');
      setEmail(profile.email || '');
      setPhoneNumber(profile.phoneNumber || '');
      setBirthDatePublic(profile.birthDatePublic ?? false);
      setEmailPublic(profile.emailPublic ?? true);
      setPhoneNumberPublic(profile.phoneNumberPublic ?? true);
      setLocation(profile.locations?.map((locationItem) => locationItem.name).join(', ') ?? '');
      setSubjects(profile.subjects?.map((subject) => subject.subjectType ?? '').filter(Boolean) ?? []);
      setSelectedSubjectIds(profile.subjects?.map((subject) => subject.subjectId).filter((id): id is number => id !== undefined) ?? []);
      setGoals(profile.goals?.map((goal) => goal.description ?? '').filter(Boolean) ?? []);
      setTeachStyles(profile.styles?.map((style) => style.description ?? '').filter(Boolean) ?? []);
      setTeachNote(profile.content ?? '');
      setTitle(profile.title ?? '');
      setIntro(profile.introduction ?? '');
      setBankName(profile.bankName ?? '');
      setBankAccountHolder(profile.bankAccountHolder ?? '');
      setBankAccountNumber(profile.bankAccountNumber ?? '');
      if (profile.educations?.length) {
        setEducations(profile.educations.map((text, index) => ({ id: index + 1, text })));
      }
      if (profile.experiences?.length) {
        setCareers(profile.experiences.map((text, index) => ({ id: index + 1, text })));
      }
      if (profile.prices?.length) {
        setFees(profile.prices.map((price, index) => ({
          id: index + 1,
          type: price.className ?? '',
          duration: '60분',
          price: String(price.price ?? ''),
        })));
      }
      setLessonType(profile.lessonType === 'OFFLINE' ? '대면 수업' : profile.lessonType === 'ONLINE' ? '온라인 수업' : profile.lessonType === 'BOTH' ? '둘 다 가능' : '');
    });
  }, [categories, profileQuery.data, references, userName, userId]);

  useEffect(() => {
    if (!categories || !references || typeof window === 'undefined') return;
    const rawDraft = sessionStorage.getItem('pending-tutor-profile-edit');
    if (!rawDraft) return;

    let draft: PendingTutorProfileEdit;
    try {
      draft = JSON.parse(rawDraft) as PendingTutorProfileEdit;
    } catch {
      sessionStorage.removeItem('pending-tutor-profile-edit');
      sessionStorage.removeItem('pending-tutor-profile-edit-return');
      return;
    }

    startTransition(() => {
      if (draft.categoryIds && draft.categoryIds.length > 0) {
        setPendingCategoryIds(draft.categoryIds);
      }
      if (draft.subjectIds && draft.subjectIds.length > 0) {
        setPendingSubjectIds(draft.subjectIds);
        setSelectedSubjectIds(draft.subjectIds);
        const allSubjects = categories.flatMap((category) => category.subjects);
        const mappedSubjects = allSubjects
          .filter((subject) => draft.subjectIds?.includes(subject.subjectId))
          .map((subject) => subject.description || subject.subjectName);
        if (mappedSubjects.length > 0) {
          setSubjects(mappedSubjects);
        }
      }
      if (draft.title !== undefined) setTitle(draft.title);
      if (draft.introduction !== undefined) setIntro(draft.introduction);
      if (draft.educations !== undefined) setEducations(draft.educations.map((text, index) => ({ id: index + 1, text })));
      if (draft.experiences !== undefined) setCareers(draft.experiences.map((text, index) => ({ id: index + 1, text })));
      if (draft.lessonType !== undefined) {
        setLessonType(draft.lessonType === 'OFFLINE' ? '대면 수업' : draft.lessonType === 'ONLINE' ? '온라인 수업' : '둘 다 가능');
      }
      if (draft.locationIds !== undefined) {
        setPendingLocationIds(draft.locationIds);
        setLocation(references.locations.filter((item) => draft.locationIds?.includes(item.locationId)).map((item) => item.name).join(', '));
      }
      if (draft.styleIds !== undefined) {
        setTeachStyles(references.tutorStyles.filter((style) => draft.styleIds?.includes(style.id)).map((style) => style.description));
      }
      if (draft.goalIds !== undefined) {
        setGoals(references.lessonGoals.filter((goal) => draft.goalIds?.includes(goal.goalId)).map((goal) => goal.description));
      }
      if (draft.prices !== undefined) {
        setFees(draft.prices.map((price, index) => ({ id: index + 1, type: price.className, duration: '60분', price: String(price.price) })));
      }
    });

    const savedScrollPos = sessionStorage.getItem('tutor-profile-scroll-y');
    if (savedScrollPos !== null) {
      sessionStorage.removeItem('tutor-profile-scroll-y');
      const targetY = parseInt(savedScrollPos, 10);
      if (!Number.isNaN(targetY)) {
        setTimeout(() => {
          window.scrollTo({ top: targetY, behavior: 'auto' });
        }, 50);
      }
    }
  }, [categories, references]);

  // 페이지 새로고침 / 탭 닫기 시 미저장 변경사항 경고
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (typeof window !== 'undefined' && sessionStorage.getItem('pending-tutor-profile-edit')) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // 수정 페이지로 이동하기 전 현재 화면의 상태를 초안(sessionStorage)에 동기화
  const syncCurrentStateToDraft = () => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('tutor-profile-scroll-y', String(window.scrollY));
    let existingDraft: PendingTutorProfileEdit = {};
    try {
      const raw = sessionStorage.getItem('pending-tutor-profile-edit');
      if (raw) existingDraft = JSON.parse(raw);
    } catch {
      existingDraft = {};
    }

    const draft: PendingTutorProfileEdit = {
      ...existingDraft,
      tutorId: profileQuery.data?.tutorId,
      categoryIds: pendingCategoryIds ?? existingDraft.categoryIds ?? (
        selectedSubjectIds.length > 0
          ? categories?.filter((cat) => cat.subjects.some((sub) => selectedSubjectIds.includes(sub.subjectId))).map((cat) => cat.categoryId)
          : undefined
      ),
      subjectIds: pendingSubjectIds ?? existingDraft.subjectIds ?? (selectedSubjectIds.length > 0 ? selectedSubjectIds : undefined),
      title: title.trim(),
      introduction: intro.trim(),
      educations: educations.filter((item) => item.text.trim()).map((item) => item.text.trim()),
      experiences: careers.filter((item) => item.text.trim()).map((item) => item.text.trim()),
      lessonType: lessonType === '대면 수업' ? 'OFFLINE' : lessonType === '온라인 수업' ? 'ONLINE' : 'BOTH',
      locationIds: pendingLocationIds ?? existingDraft.locationIds ?? references?.locations.filter((item) => location.split(',').map((val) => val.trim()).includes(item.name)).map((item) => item.locationId),
      styleIds: references?.tutorStyles.filter((style) => teachStyles.includes(style.description)).map((style) => style.id),
      goalIds: references?.lessonGoals.filter((goal) => goals.includes(goal.description ?? '')).map((goal) => goal.goalId),
      prices: fees.filter((fee) => fee.type.trim() && fee.price.trim()).map((fee) => ({
        className: fee.type.trim(),
        price: Number(fee.price.replace(/,/g, '')) || 0,
      })),
      bankName: bankName,
      bankAccountHolder: bankAccountHolder,
      bankAccountNumber: bankAccountNumber,
    };

    sessionStorage.setItem('pending-tutor-profile-edit', JSON.stringify(draft));
  };

  const editSection = (section: string) => {
    syncCurrentStateToDraft();
    router.push(`/tutor-profile/setup?edit=profile&section=${section}`);
  };

  const editInstruments = () => {
    syncCurrentStateToDraft();
    router.push('/tutor-profile/setup?edit=instruments');
  };

  const saveProfile = () => {
    const profileData: TutorProfileData = {
      name,
      title,
      birthDate,
      email,
      phoneNumber,
      birthDatePublic,
      emailPublic,
      phoneNumberPublic,
      location,
      subjects,
      goals,
      educations: educations.filter((item) => item.text.trim()),
      careers: careers.filter((item) => item.text.trim()),
      fees: fees.filter((item) => item.type.trim() && item.price.trim()),
      teachStyles,
      teachNote,
      lessonType,
      intro,
      bankName,
      bankAccountHolder,
      bankAccountNumber,
    };

    const finalCategoryIds = pendingCategoryIds ?? (
      selectedSubjectIds.length > 0
        ? categories?.filter((cat) => cat.subjects.some((sub) => selectedSubjectIds.includes(sub.subjectId))).map((cat) => cat.categoryId)
        : categories?.filter((category) => subjects.includes(category.description) || subjects.includes(category.categoryName)).map((category) => category.categoryId)
    );

    const finalSubjectIds = pendingSubjectIds ?? (
      selectedSubjectIds.length > 0
        ? selectedSubjectIds
        : categories?.filter((category) => subjects.includes(category.description) || subjects.includes(category.categoryName)).flatMap((category) => category.subjects.map((subject) => subject.subjectId))
    );

    saveProfileMutation.mutate({
      name: name || undefined,
      title: title || undefined,
      email: email || undefined,
      phoneNumber: phoneNumber || undefined,
      birthDate: birthDate || undefined,
      birthDatePublic,
      emailPublic,
      phoneNumberPublic,
      categoryIds: finalCategoryIds,
      subjectIds: finalSubjectIds,
      styleIds: references?.tutorStyles.filter((style) => teachStyles.includes(style.description)).map((style) => style.id),
      goalIds: references?.lessonGoals.filter((goal) => goals.includes(goal.description ?? '')).map((goal) => goal.goalId),
      locationIds: pendingLocationIds ?? references?.locations.filter((item) => location.split(',').map((value) => value.trim()).includes(item.name)).map((item) => item.locationId),
      lessonType: lessonType === '대면 수업' ? 'OFFLINE' : lessonType === '온라인 수업' ? 'ONLINE' : 'BOTH',
      experiences: careers.filter((item) => item.text.trim()).map((item) => item.text.trim()),
      educations: educations.filter((item) => item.text.trim()).map((item) => item.text.trim()),
      prices: fees.filter((item) => item.type.trim() && item.price.trim()).map((item) => ({ className: item.type.trim(), price: Number(item.price.replace(/,/g, '')) || 0 })),
      introduction: intro || undefined,
    }, {
      onSuccess: () => {
        if (bankName && bankAccountHolder && bankAccountNumber) {
          updateBankAccountMutation.mutate({ bankName, bankAccountHolder, bankAccountNumber }, {
            onSuccess: finishSave
          });
        } else {
          finishSave();
        }

        function finishSave() {
          sessionStorage.removeItem('pending-tutor-profile-edit');
          sessionStorage.removeItem('pending-tutor-profile-edit-return');
          setPendingCategoryIds(null);
          setPendingSubjectIds(null);
          setPendingLocationIds(null);
          saveTutorProfile(profileData);
          setSaved(true);
          setIsEditing(false);
          setTimeout(() => setSaved(false), 2000);
        }
      },
    });
  };

  if (role === 'GUEST') {
    return (
      <LoginGate
        title="선생님 프로필 작성을 위해 로그인이 필요합니다"
        description="프로필을 등록하면 학생들에게 내 수업 정보가 노출되고 더 많은 레슨 매칭 기회를 얻을 수 있습니다."
      />
    );
  }

  if (role === 'TUTOR' && profileQuery.isLoading) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center text-sm text-muted-foreground">
        내 프로필을 불러오는 중입니다.
      </div>
    );
  }

  if (role === 'TUTOR' && profileQuery.isError && !isEditing) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-20 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8">
          <h2 className="text-base font-bold text-red-800">프로필을 불러오지 못했습니다.</h2>
          <p className="mt-2 text-sm leading-relaxed text-red-700">
            서버에서 현재 계정의 튜터 정보를 찾지 못했습니다. 잠시 후 다시 시도하거나 관리자에게 문의해 주세요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => profileQuery.refetch()}
          disabled={profileQuery.isFetching}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {profileQuery.isFetching ? '다시 불러오는 중...' : '다시 시도'}
        </button>
      </div>
    );
  }

  if (role === 'TUTOR' && !isEditing) {
    const educationItems = educations.filter((item) => item.text.trim());
    const careerItems = careers.filter((item) => item.text.trim());
    const feeItems = fees.filter((item) => item.type.trim() && item.price.trim());
    const teachingCategories = (categories ?? []).map((category) => ({
      category,
      subjects: selectedSubjectIds.length > 0
        ? category.subjects.filter((subject) => selectedSubjectIds.includes(subject.subjectId))
        : category.subjects.filter((subject) => subjects.includes(subject.description) || subjects.includes(subject.subjectName)),
    })).filter((item) => item.subjects.length > 0);
    const lessonLocations = [...new Set(location.split(',').map((item) => item.trim()).filter(Boolean))];
    const locationReferenceByName = new Map((references?.locations ?? []).map((locationItem) => [locationItem.name, locationItem]));
    const locationReferenceById = new Map((references?.locations ?? []).map((locationItem) => [locationItem.locationId, locationItem]));
    const selectedLocationReferences = lessonLocations.map((lessonLocation, index) => {
      const pendingLocationId = pendingLocationIds?.[index];
      return (pendingLocationId !== undefined ? locationReferenceById.get(pendingLocationId) : undefined)
        ?? locationReferenceByName.get(lessonLocation);
    });
    const locationsByRegion = lessonLocations.reduce<Record<string, string[]>>((groups, lessonLocation, index) => {
      const reference = selectedLocationReferences[index];
      const parent = reference?.parentId !== null && reference?.parentId !== undefined
        ? locationReferenceById.get(reference.parentId)
        : reference;
      const region = parent?.name ?? lessonLocation.split(' ')[0];
      const displayLocation = reference && reference.parentId !== null ? reference.name : lessonLocation;
      (groups[region] ??= []).push(displayLocation);
      return groups;
    }, {});
    const empty = (text: string) => <p className="text-sm italic text-muted-foreground">{text}</p>;

    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="mb-7"><h2 className="text-2xl font-bold text-foreground">내 프로필 <span className="text-lg font-normal text-muted-foreground">(선생님)</span></h2><p className="mt-1 text-sm text-muted-foreground">프로필과 레슨비를 상세히 작성할수록 학생 매칭 및 레슨 예약 전환율이 높아집니다.</p></div>
        <ProfileSection icon="👤" title="기본 정보">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><div className="flex h-7 items-center"><label className="text-[11px] font-semibold text-muted-foreground">이름</label></div><input type="text" placeholder="예) 김지수" value={name} onChange={(event) => setName(event.target.value)} className={INPUT_BASE} /></div>
            <div className="space-y-1.5"><div className="flex items-center justify-between"><label className="text-[11px] font-semibold text-muted-foreground">생년월일</label><PrivacyToggle isPublic={birthDatePublic} onClick={() => setBirthDatePublic((current) => !current)} /></div><input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} className={INPUT_BASE} /></div>
            <div className="space-y-1.5"><div className="flex items-center justify-between"><label className="text-[11px] font-semibold text-muted-foreground">이메일</label><PrivacyToggle isPublic={emailPublic} onClick={() => setEmailPublic((current) => !current)} /></div><input type="email" placeholder="예) tutor@example.com" value={email} onChange={(event) => setEmail(event.target.value)} className={INPUT_BASE} /></div>
            <div className="space-y-1.5"><div className="flex items-center justify-between"><label className="text-[11px] font-semibold text-muted-foreground">전화번호</label><PrivacyToggle isPublic={phoneNumberPublic} onClick={() => setPhoneNumberPublic((current) => !current)} /></div><input type="tel" placeholder="예) 010-1234-5678" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} className={INPUT_BASE} /></div>
          </div>
        </ProfileSection>
        <ProfileSection icon="🎵" title="가르치는 악기 / 분야" onEdit={editInstruments}>{teachingCategories.length ? <div className="space-y-4">{teachingCategories.map(({ category, subjects: categorySubjects }) => <div key={category.categoryId}><p className="mb-2 text-sm font-semibold text-foreground">{category.icon || '🎵'} {category.description || category.categoryName}</p><div className="flex flex-wrap gap-2">{categorySubjects.map((subject) => <span key={subject.subjectId} className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">{subject.description || subject.subjectName}</span>)}</div></div>)}</div> : empty('선택된 악기가 없습니다.')}</ProfileSection>
        <ProfileSection icon="📝" title="레슨 소개" onEdit={() => editSection('introduction')}>{title || intro ? <div className="space-y-2"><p className="text-base font-semibold text-foreground">{title}</p><p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{intro}</p></div> : empty('레슨 소개가 없습니다.')}</ProfileSection>
        <ProfileSection icon="🎯" title="레슨 목표" onEdit={() => editSection('goals')}>{goals.length ? <div className="flex flex-wrap gap-2">{goals.map((item) => <span key={item} className="rounded-full border-2 border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700">{item}</span>)}</div> : empty('선택된 레슨 목표가 없습니다.')}</ProfileSection>
        <ProfileSection icon="🎓" title="학력" onEdit={() => editSection('education')}>{educationItems.length ? <ul className="space-y-2">{educationItems.map((item) => <li key={item.id} className="flex items-start gap-2.5 text-sm text-muted-foreground"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{item.text}</li>)}</ul> : empty('입력된 학력이 없습니다.')}</ProfileSection>
        <ProfileSection icon="💼" title="개인 경력" onEdit={() => editSection('experience')}>{careerItems.length ? <ul className="space-y-2">{careerItems.map((item) => <li key={item.id} className="flex items-start gap-2.5 text-sm text-muted-foreground"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{item.text}</li>)}</ul> : empty('입력된 경력이 없습니다.')}</ProfileSection>
        <ProfileSection icon="📍" title="수업 방식 / 레슨 지역" onEdit={() => editSection('lesson')}>
          <div className="space-y-4">
            <span className="inline-flex rounded-full border-2 border-accent bg-orange-50 px-3 py-1 text-sm font-semibold text-accent">{lessonType || '수업 형태 미선택'}</span>
            {lessonLocations.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">가능한 레슨 장소</p>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">총 {lessonLocations.length}곳</span>
                </div>
                {Object.entries(locationsByRegion).map(([region, regionLocations]) => (
                  <section key={region}>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{region}</span>
                      <div className="h-px flex-1 bg-border" />
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-50 text-[11px] font-semibold text-amber-600">{regionLocations.length}</span>
                    </div>
                    <ul className="flex flex-wrap gap-2">
                      {regionLocations.map((lessonLocation, index) => (
                        <li key={`${lessonLocation}-${index}`} className="rounded-full border border-amber-200 bg-amber-50/40 px-3 py-1.5 text-sm text-amber-700">
                          <span className="mr-1 text-amber-500">•</span>{lessonLocation}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
                <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                  <Info size={13} className="shrink-0 text-slate-400" />
                  선생님이 직접 방문하거나 학생이 방문하는 방식 모두 협의 가능합니다.
                </p>
              </div>
            )}
          </div>
        </ProfileSection>
        <ProfileSection icon="✨" title="수업 스타일" onEdit={() => editSection('styles')}>{teachStyles.length ? <div className="flex flex-wrap gap-2">{teachStyles.map((item) => <span key={item} className="rounded-full border-2 border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700">{item}</span>)}</div> : empty('선택된 수업 스타일이 없습니다.')}</ProfileSection>
        <ProfileSection icon="💰" title="레슨 가격" onEdit={() => editSection('prices')}>{feeItems.length ? <div className="space-y-3">{feeItems.map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3"><span className="text-sm font-semibold text-foreground">{item.type}</span><span className="text-sm font-bold text-accent">{Number(item.price.replace(/,/g, '')).toLocaleString('ko-KR')}원 / {item.duration}</span></div>)}</div> : empty('등록된 레슨 가격이 없습니다.')}</ProfileSection>
        <ProfileSection icon="🏦" title="정산 계좌 정보" onEdit={() => editSection('bank')}>
          {bankName && bankAccountNumber ? (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{bankName} {bankAccountNumber}</p>
              <p className="text-xs text-muted-foreground">예금주: {bankAccountHolder}</p>
            </div>
          ) : empty('등록된 정산 계좌 정보가 없습니다.')}
        </ProfileSection>
        <button type="button" onClick={saveProfile} disabled={saveProfileMutation.isPending} className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer">{saveProfileMutation.isPending ? '저장 중...' : saved ? '프로필 저장 완료!' : '프로필 저장'}</button>
        <p className="pb-4 text-center text-xs text-muted-foreground">프로필은 언제든지 수정할 수 있습니다.</p>
      </div>
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
      title,
      birthDate,
      email,
      phoneNumber,
      birthDatePublic,
      emailPublic,
      phoneNumberPublic,
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
      bankName,
      bankAccountHolder,
      bankAccountNumber,
    };
    saveProfileMutation.mutate({
      name: name || undefined,
      title: title || undefined,
      email: email || undefined,
      phoneNumber: phoneNumber || undefined,
      birthDate: birthDate || undefined,
      birthDatePublic,
      emailPublic,
      phoneNumberPublic,
      categoryIds: categories?.filter((category) => subjects.includes(category.description)).map((category) => category.categoryId),
      subjectIds: categories?.filter((category) => subjects.includes(category.description)).flatMap((category) => category.subjects.map((subject) => subject.subjectId)),
      styleIds: references?.tutorStyles.filter((style) => teachStyles.includes(style.description)).map((style) => style.id),
      goalIds: references?.lessonGoals.filter((goal) => goals.includes(goal.description ?? '')).map((goal) => goal.goalId),
      locationIds: references?.locations.filter((locationItem) => location.split(',').map((item) => item.trim()).includes(locationItem.name)).map((locationItem) => locationItem.locationId),
      lessonType: lessonType === '대면 수업' ? 'OFFLINE' : lessonType === '온라인 수업' ? 'ONLINE' : 'BOTH',
      experiences: careers.filter((career) => career.text.trim()).map((career) => career.text.trim()),
      educations: educations.filter((education) => education.text.trim()).map((education) => education.text.trim()),
      prices: fees
        .filter((fee) => fee.type.trim() && fee.price.trim())
        .map((fee) => ({ className: fee.type.trim(), price: Number(fee.price.replace(/,/g, '')) || 0 })),
      introduction: intro || undefined,
    }, {
      onSuccess: () => {
        if (bankName && bankAccountHolder && bankAccountNumber) {
          updateBankAccountMutation.mutate({ bankName, bankAccountHolder, bankAccountNumber }, {
            onSuccess: finishSave
          });
        } else {
          finishSave();
        }

        function finishSave() {
          saveTutorProfile(profileData);
          setSaved(true);
          setIsEditing(false);
          setTimeout(() => setSaved(false), 2000);
        }
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
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex h-7 items-center">
              <label className="text-[11px] font-semibold text-muted-foreground">이름</label>
            </div>
            <input
              type="text"
              placeholder="예) 김지수"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={INPUT_BASE}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex h-7 items-center justify-between">
              <label className="text-[11px] font-semibold text-muted-foreground">생년월일</label>
              <PrivacyToggle isPublic={birthDatePublic} onClick={() => setBirthDatePublic((current) => !current)} />
            </div>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className={INPUT_BASE}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-muted-foreground">이메일</label>
              <PrivacyToggle isPublic={emailPublic} onClick={() => setEmailPublic((current) => !current)} />
            </div>
            <input
              type="email"
              placeholder="예) tutor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_BASE}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-muted-foreground">전화번호</label>
              <PrivacyToggle isPublic={phoneNumberPublic} onClick={() => setPhoneNumberPublic((current) => !current)} />
            </div>
            <input
              type="tel"
              placeholder="예) 010-1234-5678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={INPUT_BASE}
            />
          </div>
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
        <InputRow label="레슨 제목">
          <input
            type="text"
            placeholder="예) 한예종 피아노과 출신. 기초부터 연주회 준비까지 맞춤 지도합니다."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={INPUT_BASE}
            maxLength={100}
          />
        </InputRow>
        <InputRow label="학생들에게 보여질 상세한 자기소개를 작성하세요.">
          <textarea
            rows={5}
            placeholder="예) 안녕하세요! 학생 개개인의 속도와 성향에 맞추어 즐겁고 탄탄한 기본기를 길러드립니다. 클래식 입시부터 취미 연주까지 친절하게 지도합니다."
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            className={`${INPUT_BASE} resize-none leading-relaxed`}
          />
        </InputRow>
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
