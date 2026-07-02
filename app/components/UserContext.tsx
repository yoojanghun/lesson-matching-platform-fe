'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Matching, Review, MOCK_TUTORS, INITIAL_MATCHINGS, INITIAL_TUTOR_MATCHINGS, MOCK_REVIEWS } from '../mockData';

export type Role = 'GUEST' | 'STUDENT' | 'TUTOR';

interface UserContextType {
  role: Role;
  setRole: (role: Role) => void;
  matchings: Matching[];
  addMatching: (tutorId: number, message: string, schedule: string) => void;
  updateMatchingStatus: (id: number, status: 'ACCEPTED' | 'REJECTED') => void;
  reviews: Review[];
  addReview: (tutorId: number, rating: number, content: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>('GUEST');
  const [matchings, setMatchings] = useState<Matching[]>([]);
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
      const merged = [...INITIAL_MATCHINGS, ...INITIAL_TUTOR_MATCHINGS];
      setMatchings(merged);
      localStorage.setItem('tm_matchings', JSON.stringify(merged));
    }

    const savedReviews = localStorage.getItem('tm_reviews');
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      setReviews(MOCK_REVIEWS);
      localStorage.setItem('tm_reviews', JSON.stringify(MOCK_REVIEWS));
    }

    setMounted(true);
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    localStorage.setItem('tm_role', newRole);
  };

  const addMatching = (tutorId: number, message: string, schedule: string) => {
    const tutor = MOCK_TUTORS.find(t => t.id === tutorId);
    if (!tutor) return;

    const newMatching: Matching = {
      id: Date.now(),
      tutorId,
      tutorName: tutor.name,
      studentName: 'You',
      subject: tutor.subject,
      status: 'PENDING',
      message,
      schedule,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updated = [newMatching, ...matchings];
    setMatchings(updated);
    localStorage.setItem('tm_matchings', JSON.stringify(updated));
  };

  const updateMatchingStatus = (id: number, status: 'ACCEPTED' | 'REJECTED') => {
    const updated = matchings.map(m => {
      if (m.id === id) {
        return { ...m, status };
      }
      return m;
    });
    setMatchings(updated);
    localStorage.setItem('tm_matchings', JSON.stringify(updated));
  };

  const addReview = (tutorId: number, rating: number, content: string) => {
    const newReview: Review = {
      id: Date.now(),
      tutorId,
      studentName: role === 'STUDENT' ? 'You' : 'Anonymous Student',
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
