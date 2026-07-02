'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ArrowLeft, Send, CheckCircle2, Calendar, MessageSquare, GraduationCap, Clock, Award, ShieldCheck, X } from 'lucide-react';
import { useUser } from '../../components/UserContext';
import { MOCK_TUTORS } from '../../mockData';
import { clsx } from 'clsx';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TutorDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { role, addMatching, reviews } = useUser();
  
  const tutorId = parseInt(resolvedParams.id, 10);
  const tutor = MOCK_TUTORS.find(t => t.id === tutorId);

  // Modal States
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form States
  const [message, setMessage] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');

  if (!tutor) {
    return (
      <div className="mx-auto max-w-xl text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold">Tutor Not Found</h2>
        <p className="text-slate-500">The tutor profile you are trying to view does not exist.</p>
        <Link href="/" className="inline-block bg-blue-600 text-white rounded-lg px-6 py-2.5 hover:bg-blue-700">
          Back to Home
        </Link>
      </div>
    );
  }

  // Filter reviews for this specific tutor
  const tutorReviews = reviews.filter(r => r.tutorId === tutorId);

  const handleRequestClick = () => {
    if (role === 'GUEST') {
      setShowAuthModal(true);
    } else {
      setSelectedSchedule(tutor.availability[0] || '');
      setShowMatchingModal(true);
    }
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule || !message) {
      alert('Please fill out all fields.');
      return;
    }
    
    addMatching(tutorId, message, selectedSchedule);
    setShowMatchingModal(false);
    setShowSuccessModal(true);
    setMessage('');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Back navigation */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors duration-150 dark:text-slate-400 dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Back to search
      </Link>

      {/* Main Profile Info Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start dark:bg-slate-900 dark:border-slate-800">
        <div className="relative shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-800">
          <img src={tutor.image} alt={tutor.name} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-1 space-y-4 w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <div>
              <span className="inline-flex items-center rounded-lg bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50 mb-2">
                {tutor.subject} Expert
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">{tutor.name}</h1>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                <GraduationCap className="h-4 w-4 text-slate-400" />
                {tutor.education}
              </p>
            </div>
            <div className="shrink-0 bg-blue-50/50 dark:bg-slate-800 border border-blue-100/50 dark:border-slate-700/50 rounded-2xl p-4 text-center sm:text-right">
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">${tutor.price}</div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider dark:text-slate-400">per hour</div>
            </div>
          </div>

          {/* Key stats row */}
          <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300 py-3 border-y border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-semibold">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-slate-900 dark:text-white">{tutor.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({tutorReviews.length} reviews)</span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 self-center" />
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-slate-400" />
              <span>{tutor.experience}</span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 self-center" />
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <span>Verified Instructor</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white">Biography</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">
              {tutor.fullBio}
            </p>
          </div>

          {/* Action Call */}
          {role !== 'TUTOR' && (
            <button
              onClick={handleRequestClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Request Lesson Matching
            </button>
          )}
        </div>
      </div>

      {/* Info Split Section (Availability & Details) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Availability */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4 dark:bg-slate-900 dark:border-slate-800 md:col-span-1">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            Availability
          </h3>
          <p className="text-xs text-slate-500">Tutor&apos;s current preferred class schedules.</p>
          <div className="space-y-2">
            {tutor.availability.map((time) => (
              <div 
                key={time} 
                className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50"
              >
                <Clock className="h-4 w-4 text-slate-400" />
                <span>{time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed reviews */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6 dark:bg-slate-900 dark:border-slate-800 md:col-span-2">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            Student Reviews ({tutorReviews.length})
          </h3>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-5">
            {tutorReviews.map((review, idx) => (
              <div key={review.id} className={clsx("space-y-2", idx > 0 && "pt-5")}>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-900 dark:text-white">{review.studentName}</span>
                  <span className="text-slate-400 font-medium">{review.date}</span>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={clsx(
                        "h-4 w-4", 
                        i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-slate-200 dark:text-slate-800"
                      )} 
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Request Matching Modal */}
      {showMatchingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative animate-zoom-in border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            <button 
              onClick={() => setShowMatchingModal(false)} 
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-xl md:text-2xl font-black mb-1.5 text-slate-900 dark:text-white">Request Lesson</h2>
            <p className="text-xs text-slate-500 mb-6">Send matching request to <strong className="text-slate-700 dark:text-slate-300">{tutor.name}</strong>.</p>
            
            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 dark:text-slate-400">
                  Select Schedule Option
                </label>
                <select
                  value={selectedSchedule}
                  onChange={(e) => setSelectedSchedule(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-850 dark:border-slate-800 dark:text-white"
                >
                  {tutor.availability.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 dark:text-slate-400">
                  Message to Tutor
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Introduce yourself, your goals, and what you would like to focus on..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-850 dark:border-slate-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                Send Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Login Prompt Modal (for guests) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative animate-zoom-in text-center border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            <button 
              onClick={() => setShowAuthModal(false)} 
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-4">
              <Award className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Authentication Required</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              You need to sign up or log in as a student to send matching requests to tutors.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  router.push('/signup');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                Go to Sign Up
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition-all dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Request Success Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative animate-zoom-in text-center border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-500 dark:bg-green-950 dark:text-green-400 mb-5 shadow-inner">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Request Sent!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Your matching request was successfully sent. The tutor will review it and update your status in your dashboard.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/dashboard');
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition-all dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Keep Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
