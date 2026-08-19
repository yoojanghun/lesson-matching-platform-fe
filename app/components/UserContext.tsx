'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { StudentMatching, Review, LessonBooking, PaymentItem } from '../types';
import { TUTORS, REVIEWS, MY_MATCHINGS_STUDENT, MY_LESSON_BOOKINGS, MY_PAYMENTS } from '../data/mockData';

export type Role = 'GUEST' | 'STUDENT' | 'TUTOR';

export interface TestAccount {
  email: string;
  password: string;
  role: Role;
  name: string;
}

export const MOCK_ACCOUNTS: TestAccount[] = [
  { email: 'student@tutormatch.kr', password: 'student123', role: 'STUDENT', name: '김학생' },
  { email: 'tutor@tutormatch.kr', password: 'tutor123', role: 'TUTOR', name: '김지수 튜터' },
];

interface UserContextType {
  role: Role;
  userName: string;
  toast: string | null;
  showToast: (msg: string) => void;
  login: (email: string, pass: string) => boolean;
  quickLogin: (account: TestAccount) => void;
  signup: (role: Role, name: string) => void;
  logout: () => void;
  setRole: (role: Role) => void;
  matchings: StudentMatching[];
  addMatching: (tutorId: number, message: string, schedule: string) => void;
  updateMatchingStatus: (id: number, status: 'accepted' | 'rejected') => void;
  bookings: LessonBooking[];
  addBooking: (booking: Omit<LessonBooking, 'id' | 'requestedAt'>) => void;
  payments: PaymentItem[];
  payItem: (id: number) => void;
  payAllUnpaid: () => void;
  reviews: Review[];
  addReview: (tutorId: number, rating: number, content: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>('GUEST');
  const [userName, setUserName] = useState<string>('');
  const [toast, setToast] = useState<string | null>(null);
  const [matchings, setMatchings] = useState<StudentMatching[]>([]);
  const [bookings, setBookings] = useState<LessonBooking[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [mounted, setMounted] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  useEffect(() => {
    const savedRole = localStorage.getItem('tm_role') as Role;
    if (savedRole) {
      setRoleState(savedRole);
    }
    const savedUserName = localStorage.getItem('tm_user_name');
    if (savedUserName) {
      setUserName(savedUserName);
    } else if (savedRole === 'STUDENT') {
      setUserName('김학생');
    } else if (savedRole === 'TUTOR') {
      setUserName('김지수 튜터');
    }

    const savedMatchings = localStorage.getItem('tm_matchings');
    if (savedMatchings) {
      setMatchings(JSON.parse(savedMatchings));
    } else {
      setMatchings(MY_MATCHINGS_STUDENT);
      localStorage.setItem('tm_matchings', JSON.stringify(MY_MATCHINGS_STUDENT));
    }

    const savedBookings = localStorage.getItem('tm_bookings');
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    } else {
      setBookings(MY_LESSON_BOOKINGS);
      localStorage.setItem('tm_bookings', JSON.stringify(MY_LESSON_BOOKINGS));
    }

    const savedPayments = localStorage.getItem('tm_payments');
    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    } else {
      setPayments(MY_PAYMENTS);
      localStorage.setItem('tm_payments', JSON.stringify(MY_PAYMENTS));
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

  const login = (email: string, pass: string): boolean => {
    const account = MOCK_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === pass
    );
    if (account) {
      setRoleState(account.role);
      setUserName(account.name);
      localStorage.setItem('tm_role', account.role);
      localStorage.setItem('tm_user_name', account.name);
      showToast(`${account.name}님, 환영합니다!`);
      return true;
    }
    return false;
  };

  const quickLogin = (account: TestAccount) => {
    setRoleState(account.role);
    setUserName(account.name);
    localStorage.setItem('tm_role', account.role);
    localStorage.setItem('tm_user_name', account.name);
    showToast(`${account.name}님, 환영합니다!`);
  };

  const signup = (newRole: Role, name: string) => {
    const defaultName = name.trim() || (newRole === 'STUDENT' ? '신규 학생' : '신규 튜터');
    setRoleState(newRole);
    setUserName(defaultName);
    localStorage.setItem('tm_role', newRole);
    localStorage.setItem('tm_user_name', defaultName);
    showToast(`${newRole === 'STUDENT' ? '학생' : '튜터'} 계정으로 가입되었습니다!`);
  };

  const logout = () => {
    setRoleState('GUEST');
    setUserName('');
    localStorage.setItem('tm_role', 'GUEST');
    localStorage.removeItem('tm_user_name');
    showToast('로그아웃되었습니다.');
  };

  const addMatching = (tutorId: number, message: string, schedule: string) => {
    const tutor = TUTORS.find((t) => t.id === tutorId);
    if (!tutor) return;

    const newMatching: StudentMatching = {
      id: Date.now(),
      tutor: tutor.name,
      subject: tutor.subject,
      status: 'pending',
      message: message.trim() || '레슨 매칭을 신청합니다.',
      time: schedule.trim() || '협의 필요',
      date: new Date().toISOString().split('T')[0],
    };

    const updated = [newMatching, ...matchings];
    setMatchings(updated);
    localStorage.setItem('tm_matchings', JSON.stringify(updated));
    showToast('매칭 요청이 전송되었습니다!');
  };

  const updateMatchingStatus = (id: number, status: 'accepted' | 'rejected') => {
    const updated = matchings.map((m) => {
      if (m.id === id) {
        return { ...m, status };
      }
      return m;
    });
    setMatchings(updated);
    localStorage.setItem('tm_matchings', JSON.stringify(updated));
    showToast(status === 'accepted' ? '요청을 승인했습니다.' : '요청을 거절했습니다.');
  };

  const addBooking = (newBookingData: Omit<LessonBooking, 'id' | 'requestedAt'>) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const requestedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newBooking: LessonBooking = {
      ...newBookingData,
      id: Date.now(),
      requestedAt,
    };

    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    localStorage.setItem('tm_bookings', JSON.stringify(updatedBookings));

    // Also add to payments list as unpaid
    const newPayment: PaymentItem = {
      id: Date.now(),
      tutor: newBookingData.tutor,
      subject: newBookingData.subject,
      avatar: newBookingData.avatar,
      lessonDate: newBookingData.lessonDate,
      lessonDay: newBookingData.lessonDay,
      startTime: newBookingData.startTime,
      endTime: newBookingData.endTime,
      price: newBookingData.price,
      status: 'unpaid',
    };
    const updatedPayments = [newPayment, ...payments];
    setPayments(updatedPayments);
    localStorage.setItem('tm_payments', JSON.stringify(updatedPayments));

    showToast('예약 신청이 완료되었습니다!');
  };

  const payItem = (id: number) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const paidAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const updated = payments.map((p) => (p.id === id ? { ...p, status: 'paid' as const, paidAt } : p));
    setPayments(updated);
    localStorage.setItem('tm_payments', JSON.stringify(updated));
    showToast('결제가 완료되었습니다!');
  };

  const payAllUnpaid = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const paidAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const updated = payments.map((p) => (p.status === 'unpaid' ? { ...p, status: 'paid' as const, paidAt } : p));
    setPayments(updated);
    localStorage.setItem('tm_payments', JSON.stringify(updated));
    showToast('모든 미결제 건이 결제 완료되었습니다!');
  };

  const addReview = (_tutorId: number, rating: number, content: string) => {
    const newReview: Review = {
      id: Date.now(),
      student: userName || (role === 'STUDENT' ? '김학생' : '익명 학생'),
      rating,
      content,
      date: new Date().toISOString().split('T')[0],
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem('tm_reviews', JSON.stringify(updated));
    showToast('리뷰가 성공적으로 등록되었습니다!');
  };

  return (
    <UserContext.Provider
      value={{
        role,
        userName,
        toast,
        showToast,
        login,
        quickLogin,
        signup,
        logout,
        setRole,
        matchings,
        addMatching,
        updateMatchingStatus,
        bookings,
        addBooking,
        payments,
        payItem,
        payAllUnpaid,
        reviews,
        addReview,
      }}
    >
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
