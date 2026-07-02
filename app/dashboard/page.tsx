'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUser } from '../components/UserContext';
import { Check, X, Star, Calendar, MessageSquare, Clock, GraduationCap, Inbox, Award } from 'lucide-react';
import { clsx } from 'clsx';

export default function DashboardPage() {
  const { role, matchings, updateMatchingStatus, addReview } = useUser();
  
  // Modals
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTutorId, setReviewTutorId] = useState<number | null>(null);
  const [reviewTutorName, setReviewTutorName] = useState('');
  
  // Review Form States
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewContent, setReviewContent] = useState('');

  if (role === 'GUEST') {
    return (
      <div className="mx-auto max-w-lg text-center py-20 px-4 space-y-6 animate-fade-in">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          <GraduationCap className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Authentication Required</h2>
          <p className="text-slate-500 max-w-sm mx-auto">
            Please log in or sign up to view your personalized dashboard and lesson matching requests.
          </p>
        </div>
        <Link 
          href="/signup" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-8 py-3 shadow-md shadow-blue-500/20 active:scale-95 transition-all duration-150"
        >
          Go to Sign Up
        </Link>
      </div>
    );
  }

  const isStudent = role === 'STUDENT';
  
  // For STUDENT, show matchings where studentName is 'You' (requested by student)
  // For TUTOR, show matchings where studentName is NOT 'You' (requested by other students)
  const displayList = matchings.filter(m => {
    if (isStudent) {
      return m.studentName === 'You';
    } else {
      return m.studentName !== 'You';
    }
  });

  const handleOpenReview = (tutorId: number, tutorName: string) => {
    setReviewTutorId(tutorId);
    setReviewTutorName(tutorName);
    setRating(5);
    setReviewContent('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTutorId || !reviewContent) return;

    addReview(reviewTutorId, rating, reviewContent);
    setShowReviewModal(false);
    alert(`Thank you for review! Added review for ${reviewTutorName}.`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Matchings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your incoming and outgoing lesson requests.
          </p>
        </div>
        
        <div className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200/80 px-4 py-2 text-sm font-semibold dark:bg-slate-900 dark:border-slate-800 shadow-sm self-start sm:self-center">
          <span className="text-slate-400 font-normal">Active Dashboard:</span>
          <span className="text-blue-600 dark:text-blue-400 uppercase tracking-wider">{role}</span>
        </div>
      </div>

      {/* Main List */}
      {displayList.length > 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm dark:bg-slate-900 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {displayList.map((m) => (
            <div 
              key={m.id} 
              className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors duration-150"
            >
              <div className="flex-1 space-y-3 w-full">
                <div className="flex items-center justify-between md:justify-start gap-3">
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    {isStudent ? m.tutorName : m.studentName}
                  </h3>
                  <span className={clsx(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                    m.status === 'PENDING' && "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
                    m.status === 'ACCEPTED' && "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
                    m.status === 'REJECTED' && "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
                  )}>
                    {m.status}
                  </span>
                </div>
                
                {/* Meta details info */}
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>{m.subject} Subject</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Requested on {m.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Prefers: {m.schedule}</span>
                  </div>
                </div>

                {m.message && (
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm text-slate-700 italic dark:bg-slate-800 dark:border-slate-800 dark:text-slate-300">
                    &ldquo;{m.message}&rdquo;
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                {isStudent ? (
                  <>
                    {m.status === 'ACCEPTED' && (
                      <button 
                        onClick={() => handleOpenReview(m.tutorId, m.tutorName)}
                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl text-sm transition-colors dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-900/50 cursor-pointer"
                      >
                        <Star className="h-4 w-4 fill-blue-600 dark:fill-blue-400" />
                        Write Review
                      </button>
                    )}
                    <button className="flex-1 md:flex-none px-4.5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-sm dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                      View Profile
                    </button>
                  </>
                ) : (
                  <>
                    {m.status === 'PENDING' && (
                      <>
                        <button 
                          onClick={() => updateMatchingStatus(m.id, 'ACCEPTED')}
                          className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-500/10 transition-all cursor-pointer active:scale-95"
                        >
                          <Check className="h-4 w-4" />
                          Accept
                        </button>
                        <button 
                          onClick={() => updateMatchingStatus(m.id, 'REJECTED')}
                          className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-sm border border-rose-100 transition-all dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900/40 dark:hover:bg-rose-900/40 cursor-pointer active:scale-95"
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl py-16 text-center space-y-4 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 dark:bg-slate-800">
            <Inbox className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No requests yet</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              {isStudent 
                ? "You haven't requested any matching lessons yet. Explore our top tutors!" 
                : "You don't have any incoming student lesson requests at this time."}
            </p>
          </div>
          {isStudent && (
            <Link 
              href="/" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-5 py-2 text-sm shadow-sm"
            >
              Browse Tutors
            </Link>
          )}
        </div>
      )}

      {/* Write Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative animate-zoom-in border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            <button 
              onClick={() => setShowReviewModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-xl md:text-2xl font-black mb-1 text-slate-900 dark:text-white">Write Review</h2>
            <p className="text-xs text-slate-500 mb-6">Share your learning experience with <strong className="text-slate-700 dark:text-slate-300">{reviewTutorName}</strong>.</p>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="flex flex-col items-center py-4 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Rate your experience</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="cursor-pointer transition-transform duration-75 active:scale-90"
                    >
                      <Star 
                        className={clsx(
                          "h-8 w-8",
                          (hoverRating !== null ? star <= hoverRating : star <= rating)
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-slate-200 dark:text-slate-700"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 dark:text-slate-400">
                  Your Review Message
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="What did you learn? How was their teaching style? Be detailed!"
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-850 dark:border-slate-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
