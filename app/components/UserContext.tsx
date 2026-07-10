'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { StudentMatching, Review } from '../types';
import { TUTORS, REVIEWS, MY_MATCHINGS_STUDENT, MY_MATCHINGS_TUTOR } from '../data/mockData';

export type Role = 'GUEST' | 'STUDENT' | 'TUTOR';

interface UserContextType {
  role: Role;
  setRole: (role: Role) => void;
  matchings: StudentMatching[];
  addMatching: (tutorId: number, message: string, schedule: string) => void;
  updateMatchingStatus: (id: number, status: 'accepted' | 'rejected') => void;
  reviews: Review[];
  addReview: (tutorId: number, rating: number, content: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>('GUEST');
  const [matchings, setMatchings] = useState<StudentMatching[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [mounted, setMounted] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('tm_role') as Role;
    if (savedRole) {
      setRoleState(savedRole);
    }

    const savedMatchings = localStorage.getItem('tm_matchings');
    if (savedMatchings) {
      setMatchings(JSON.parse(savedMatchings));
    } else {
      // Merge initial matchings for demo
      setMatchings(MY_MATCHINGS_STUDENT);
      localStorage.setItem('tm_matchings', JSON.stringify(MY_MATCHINGS_STUDENT));
    }

    const savedReviews = localStorage.getItem('tm_reviews');
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      setReviews(REVIEWS);
      localStorage.setItem('tm_reviews', JSON.stringify(REVIEWS));
    }

    setMounted(true);
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    localStorage.setItem('tm_role', newRole);
  };

  const addMatching = (tutorId: number, message: string, schedule: string) => {
    const tutor = TUTORS.find(t => t.id === tutorId);
    if (!tutor) return;

    const newMatching: StudentMatching = {
      id: Date.now(),
      tutor: tutor.name,
      subject: tutor.subject,
      status: 'pending',
      message,
      time: schedule,
      date: new Date().toISOString().split('T')[0]
    };

    const updated = [newMatching, ...matchings];
    setMatchings(updated);
    localStorage.setItem('tm_matchings', JSON.stringify(updated));
  };

  const updateMatchingStatus = (id: number, status: 'accepted' | 'rejected') => {
    const updated = matchings.map(m => {
      if (m.id === id) {
        return { ...m, status };
      }
      return m;
    });
    setMatchings(updated);
    localStorage.setItem('tm_matchings', JSON.stringify(updated));
  };

  const addReview = (_tutorId: number, rating: number, content: string) => {
    const newReview: Review = {
      id: Date.now(),
      student: role === 'STUDENT' ? '나' : '익명 학생',
      rating,
      content,
      date: new Date().toISOString().split('T')[0]
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem('tm_reviews', JSON.stringify(updated));
  };

  const logout = () => {
    setRole('GUEST');
  };

  // Avoid hydration mismatch by rendering kids only when mounted
  if (!mounted) {
    return (
      <UserContext.Provider value={{
        role: 'GUEST',
        setRole: () => {},
        matchings: [],
        addMatching: () => {},
        updateMatchingStatus: () => {},
        reviews: [],
        addReview: () => {},
        logout: () => {}
      }}>
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </UserContext.Provider>
    );
  }

  return (
    <UserContext.Provider value={{
      role,
      setRole,
      matchings,
      addMatching,
      updateMatchingStatus,
      reviews,
      addReview,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
