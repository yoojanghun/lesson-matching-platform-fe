'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Star, BookOpen, GraduationCap, Clock, Award } from 'lucide-react';
import { MOCK_TUTORS, MOCK_CATEGORIES } from './mockData';
import { clsx } from 'clsx';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null); // Deselect if clicked again
    } else {
      setSelectedCategory(category);
    }
  };

  const filteredTutors = MOCK_TUTORS.filter((tutor) => {
    const matchesCategory = selectedCategory ? tutor.subject === selectedCategory : true;
    const matchesSearch = searchQuery
      ? tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.bio.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12 animate-fade-in">
      {/* Hero Banner & Search Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-800 px-6 py-16 md:py-24 text-white shadow-xl shadow-blue-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative mx-auto max-w-3xl text-center space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur-md">
            <GraduationCap className="h-4 w-4" />
            Empower your academic journey
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white">
            Find Your Perfect Tutor
          </h1>
          <p className="mx-auto max-w-xl text-lg text-blue-100 sm:text-xl">
            Connect with expert tutors worldwide and receive personalized, project-based classes tailored just for you.
          </p>

          {/* Search Box */}
          <div className="mx-auto max-w-2xl bg-white rounded-2xl flex items-center p-1.5 shadow-lg border border-slate-100 focus-within:ring-2 focus-within:ring-blue-400 transition-all duration-200 mt-8">
            <div className="flex items-center flex-1 px-3">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="What subject or tutor are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-transparent text-slate-900 focus:outline-none placeholder-slate-400 text-sm md:text-base"
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-2.5 text-sm md:text-base shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Popular Categories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white md:text-2xl">
            Popular Categories
          </h2>
          {selectedCategory && (
            <button 
              onClick={() => setSelectedCategory(null)}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {MOCK_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={clsx(
                  "px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm border transition-all duration-200 cursor-pointer active:scale-95",
                  isSelected
                    ? "bg-blue-600 border-blue-600 text-white shadow-blue-500/25"
                    : "bg-white border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:border-blue-400"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tutor List Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white md:text-2xl flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Top Rated Tutors ({filteredTutors.length})
          </h2>
          <span className="text-sm text-slate-500">Sorted by rating</span>
        </div>

        {filteredTutors.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredTutors.map((tutor) => (
              <Link
                key={tutor.id}
                href={`/tutors/${tutor.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700"
              >
                {/* Profile Image Banner */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  <img
                    src={tutor.image}
                    alt={tutor.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-xl text-xs font-bold flex items-center text-slate-900 shadow-sm border border-slate-100">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 mr-1 shrink-0" />
                    <span>{tutor.rating.toFixed(1)}</span>
                  </div>
                  
                  <div className="absolute bottom-3 left-3">
                    <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
                      {tutor.subject}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-col flex-1 p-5 space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors duration-150 dark:text-white dark:group-hover:text-blue-400">
                      {tutor.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>{tutor.education.split(',')[1] || tutor.education}</span>
                    </p>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed flex-1">
                    {tutor.bio}
                  </p>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3.5 mt-auto">
                    <span className="text-xs text-slate-400 font-medium">
                      {tutor.reviewCount} reviews
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                      ${tutor.price}
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/hr</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-900">
              <Search className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No tutors found</h3>
              <p className="text-sm text-slate-500">We couldn&apos;t find any tutors matching your search filters.</p>
            </div>
            <button 
              onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
              className="text-sm font-semibold bg-blue-50 text-blue-600 rounded-lg px-4 py-2 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
