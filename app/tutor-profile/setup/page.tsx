'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import { useCategoriesQuery } from '../../hooks/queries/useCategories';

interface PendingTutorSignup {
  name: string;
  userId: string;
  userPassword: string;
}

const INSTRUMENTS = [
  { name: '피아노', icon: '🎹' },
  { name: '바이올린', icon: '🎻' },
  { name: '첼로', icon: '🎻' },
  { name: '기타', icon: '🎸' },
  { name: '드럼', icon: '🥁' },
  { name: '보컬', icon: '🎤' },
  { name: '플루트', icon: '🎵' },
  { name: '색소폰', icon: '🎷' },
  { name: '우쿨렐레', icon: '🪕' },
  { name: '베이스', icon: '🎸' },
  { name: '작곡', icon: '🎼' },
  { name: '하프', icon: '🎶' },
];

export default function TutorProfileSetupPage() {
  const router = useRouter();
  const { data: categories, isLoading: categoriesLoading } = useCategoriesQuery();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [lessonType, setLessonType] = useState<'ONLINE' | 'OFFLINE' | 'BOTH'>('ONLINE');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const toggleInstrument = (instrument: string) => {
    setSelectedInstruments((current) =>
      current.includes(instrument)
        ? current.filter((item) => item !== instrument)
        : [...current, instrument],
    );
  };

  const finishSetup = async () => {
    setErrorMessage('');

    const pendingSignup = sessionStorage.getItem('pending-tutor-signup');
    if (!pendingSignup) {
      setErrorMessage('기본 회원가입 정보가 없습니다. 회원가입을 처음부터 다시 진행해 주세요.');
      return;
    }

    if (!categories || categoriesLoading) {
      setErrorMessage('악기 정보를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    const matchedCategories = categories.filter((category) =>
      selectedInstruments.some((instrument) =>
        category.description === instrument || category.categoryName === instrument ||
        category.subjects.some((subject) => subject.description === instrument || subject.subjectName === instrument),
      ),
    );
    const categoryIds = matchedCategories.map((category) => category.categoryId);
    const subjectIds = matchedCategories.flatMap((category) => category.subjects.map((subject) => subject.subjectId));

    if (categoryIds.length === 0 || subjectIds.length === 0) {
      setErrorMessage('선택한 악기 정보를 찾지 못했습니다. 악기를 다시 선택해 주세요.');
      setStep(1);
      return;
    }

    let signup: PendingTutorSignup;
    try {
      signup = JSON.parse(pendingSignup) as PendingTutorSignup;
    } catch {
      setErrorMessage('회원가입 정보가 올바르지 않습니다. 회원가입을 다시 진행해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/api/sign-up/tutor', {
        ...signup,
        categoryIds,
        subjectIds,
        title: title.trim(),
        introduction: introduction.trim(),
        lessonType,
        educations: [],
        experiences: [],
        locationIds: [],
        styleIds: [],
        goalIds: [],
        lessonPriceDtos: [],
      });
      sessionStorage.removeItem('pending-tutor-signup');
      alert('튜터 회원가입이 완료되었습니다. 로그인해 주세요.');
      router.push('/login');
    } catch (error) {
      const response = (error as { response?: { data?: { message?: string; error?: string } } }).response;
      setErrorMessage(response?.data?.message ?? response?.data?.error ?? '회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-2xl bg-background px-5 py-8 sm:px-10 sm:py-10">
      <div className="mb-9 flex items-center gap-3 text-sm text-muted-foreground">
        <div className={`flex items-center gap-2 ${step === 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === 1 ? 'bg-accent text-accent-foreground' : 'bg-green-500 text-white'}`}>
            {step === 1 ? '1' : <Check size={15} />}
          </span>
          악기 선택
        </div>
        <div className={`h-px flex-1 ${step === 2 ? 'bg-accent' : 'bg-border'}`} />
        <div className={`flex items-center gap-2 ${step === 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === 2 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
            2
          </span>
          레슨 소개
        </div>
      </div>

      {step === 1 ? (
        <section>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">가르칠 악기를 선택하세요</h1>
          <p className="mt-2 text-sm text-muted-foreground">중복 선택 가능합니다</p>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {INSTRUMENTS.map((instrument) => {
              const selected = selectedInstruments.includes(instrument.name);
              return (
                <button
                  key={instrument.name}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleInstrument(instrument.name)}
                  className={`flex aspect-[1.15] flex-col items-center justify-center gap-2 rounded-xl border-2 bg-card text-sm transition-colors cursor-pointer ${
                    selected
                      ? 'border-accent bg-accent/5 text-accent'
                      : 'border-border text-foreground hover:border-accent/50'
                  }`}
                >
                  <span className="text-2xl" aria-hidden="true">{instrument.icon}</span>
                  <span className="font-medium">{instrument.name}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-10 flex gap-3">
            <button type="button" onClick={() => router.push('/signup')} className="h-13 flex-1 rounded-xl border-2 border-border bg-card text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer">
              이전
            </button>
            <button
              type="button"
              disabled={selectedInstruments.length === 0}
              onClick={() => setStep(2)}
              className="h-13 flex-[1.8] rounded-xl bg-accent text-sm font-semibold text-accent-foreground hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40 transition-colors cursor-pointer"
            >
              다음
            </button>
          </div>
        </section>
      ) : (
        <section>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">레슨을 소개해주세요</h1>
          <p className="mt-2 text-sm text-muted-foreground">학생들이 레슨을 선택하는 데 도움이 됩니다</p>

          <div className="mt-8 space-y-7">
            <div>
              <label htmlFor="lesson-title" className="mb-2 block text-sm font-semibold text-foreground">레슨 제목 <span className="text-accent">*</span></label>
              <input
                id="lesson-title"
                required
                maxLength={60}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="초보자를 위한 친절한 레슨"
                className="h-12 w-full rounded-xl border-2 border-border bg-card px-4 text-sm text-foreground outline-none focus:border-accent"
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">{title.length}/60</p>
            </div>
            <div>
              <label htmlFor="lesson-introduction" className="mb-2 block text-sm font-semibold text-foreground">레슨 소개 <span className="text-accent">*</span></label>
              <textarea
                id="lesson-introduction"
                required
                maxLength={500}
                value={introduction}
                onChange={(event) => setIntroduction(event.target.value)}
                placeholder="본인의 경력, 레슨 방식, 수업 대상 등을 자유롭게 적어주세요."
                className="min-h-32 w-full resize-none rounded-xl border-2 border-border bg-card p-4 text-sm leading-6 text-foreground outline-none focus:border-accent"
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">{introduction.length}/500</p>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">수업 형태 <span className="text-accent">*</span></p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['ONLINE', '온라인 수업'],
                  ['OFFLINE', '대면 수업'],
                  ['BOTH', '둘 다 가능'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLessonType(value as 'ONLINE' | 'OFFLINE' | 'BOTH')}
                    className={`rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors cursor-pointer ${lessonType === value ? 'border-accent bg-accent/5 text-accent' : 'border-border bg-card text-muted-foreground hover:border-accent/50'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {errorMessage && <p className="mt-5 text-sm text-red-500">{errorMessage}</p>}

          <div className="mt-9 flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="flex-1 rounded-xl border-2 border-border bg-card py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer">
              <span className="inline-flex items-center gap-1"><ArrowLeft size={15} /> 이전</span>
            </button>
            <button
              type="button"
              disabled={!title.trim() || !introduction.trim() || submitting}
              onClick={finishSetup}
              className="flex-[1.8] rounded-xl bg-accent py-3 text-sm font-semibold text-accent-foreground hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40 transition-colors cursor-pointer"
            >
              {submitting ? '가입 처리 중...' : '등록 완료'}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
