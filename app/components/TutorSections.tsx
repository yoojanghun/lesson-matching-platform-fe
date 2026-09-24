'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { useCategoriesQuery } from '../hooks/queries/useCategories';
import { useTrendingTutorsQuery, useRookieTutorsQuery } from '../hooks/queries/useTutors';
import { useHydrated } from '../hooks/useHydrated';
import TutorCard from './TutorCard';
import CategoryIcon from './CategoryIcon';

export default function TutorSections() {
  const router = useRouter();
  const [popularCategory, setPopularCategory] = useState('전체');
  const [latestCategory, setLatestCategory] = useState('전체');
  const hydrated = useHydrated();
  const { data: categories, isLoading: isCategoriesLoading } = useCategoriesQuery();
  const isLoggedIn = hydrated && !!localStorage.getItem('tm_token');

  const popularCategoryId = useMemo(() => categories?.find(c => c.description === popularCategory)?.categoryId, [categories, popularCategory]);
  const latestCategoryId = useMemo(() => categories?.find(c => c.description === latestCategory)?.categoryId, [categories, latestCategory]);

  const { data: popularTutors, isLoading: isPopularLoading } = useTrendingTutorsQuery(popularCategoryId);
  const { data: latestTutors, isLoading: isLatestLoading } = useRookieTutorsQuery(latestCategoryId);

  const categoryOptions = useMemo(() => {
    const options = categories?.map((category) => category.description) ?? CATEGORIES.map((category) => category.label);
    return ['전체', ...options];
  }, [categories]);

  const categoryTabs = (value: string, setValue: (next: string) => void, prefix: string) => (
    <div className="flex flex-wrap gap-2 mb-5">
      {categoryOptions.map((category) => (
        <button
          key={`${prefix}-${category}`}
          type="button"
          onClick={() => setValue(category)}
          className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
            value === category
              ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
              : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">악기별 탐색</h2>
          <button onClick={() => router.push('/subjects')} className="text-sm text-accent font-medium flex items-center gap-0.5 hover:underline cursor-pointer">
            전체 보기 <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          {isCategoriesLoading
            ? Array.from({ length: 7 }).map((_, index) => <div key={index} className="h-24 bg-gray-100 animate-pulse rounded-xl" />)
            : categories?.map((category) => (
              <button
                key={category.categoryId}
                onClick={() => router.push(`/subjects?category=${category.categoryId}`)}
                className="flex flex-col items-center gap-2 p-3 sm:p-4 border border-border rounded-xl group cursor-pointer"
                style={{ backgroundColor: '#ffffff' }}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center"><CategoryIcon code={category.code ?? category.categoryName} id={category.categoryId} /></div>
                <span className="text-xs font-semibold text-foreground">{category.description}</span>
              </button>
            ))}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">최고 인기 튜터</h2>
          <button onClick={() => router.push('/tutors')} className="flex items-center gap-0.5 text-sm font-medium text-accent hover:underline cursor-pointer">
            전체 보기 <ChevronRight size={14} />
          </button>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">최근 15일간 매칭과 평점이 높았던 인기 선생님들이에요</p>
        {categoryTabs(popularCategory, setPopularCategory, 'popular')}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isPopularLoading
            ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-44 rounded-xl bg-muted animate-pulse" />)
            : popularTutors?.slice(0, 4).map((tutor) => <TutorCard key={`popular-${tutor.id}`} tutor={tutor} onClick={() => router.push(`/tutors/${tutor.id}`)} />)}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">최신 등록 튜터</h2>
          <button onClick={() => router.push('/tutors')} className="flex items-center gap-0.5 text-sm font-medium text-accent hover:underline cursor-pointer">
            전체 보기 <ChevronRight size={14} />
          </button>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">최근 15일간 새롭게 합류한 선생님들을 만나보세요</p>
        {categoryTabs(latestCategory, setLatestCategory, 'latest')}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isLatestLoading
            ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-44 rounded-xl bg-muted animate-pulse" />)
            : latestTutors?.slice(0, 4).map((tutor) => <TutorCard key={`latest-${tutor.id}`} tutor={tutor} onClick={() => router.push(`/tutors/${tutor.id}`)} />)}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground mb-2">AI 추천 튜터</h2>
        <p className="mb-5 text-sm text-muted-foreground">작성하신 프로필을 바탕으로 적합한 선생님들을 추천해 드려요</p>
        <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-5 text-sm text-muted-foreground">
          <div className="flex items-center justify-between gap-4">
            <span>{isLoggedIn ? '로그인된 상태입니다. 프로필을 확인하고 맞춤 추천을 받아보세요.' : 'AI 추천을 위해 프로필을 작성해 주세요.'}</span>
            <button type="button" onClick={() => router.push('/student-profile')} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer">
              내 프로필로 이동
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
