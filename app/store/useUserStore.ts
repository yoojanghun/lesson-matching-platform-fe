import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StudentMatching, Review, LessonBooking, PaymentItem, StudentProfile, TutorProfileData } from '../types';
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

export interface UserState {
  role: Role;
  userName: string;
  toast: string | null;
  matchings: StudentMatching[];
  bookings: LessonBooking[];
  payments: PaymentItem[];
  reviews: Review[];
  studentProfile: StudentProfile | null;
  tutorProfile: TutorProfileData | null;

  // Actions
  showToast: (msg: string) => void;
  clearToast: () => void;
  login: (email: string, pass: string) => boolean;
  quickLogin: (account: TestAccount) => void;
  signup: (role: Role, name: string) => void;
  logout: () => void;
  setRole: (role: Role, userName?: string) => void;
  addMatching: (tutorId: number, message: string, schedule: string) => void;
  updateMatchingStatus: (id: number, status: 'accepted' | 'rejected') => void;
  addBooking: (booking: Omit<LessonBooking, 'id' | 'requestedAt'>) => void;
  payItem: (id: number) => void;
  payAllUnpaid: () => void;
  addReview: (tutorId: number, rating: number, content: string) => void;
  saveStudentProfile: (profile: StudentProfile) => void;
  saveTutorProfile: (profile: TutorProfileData) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

function encodeBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  const normalized = typeof window !== 'undefined' && typeof window.btoa === 'function'
    ? window.btoa(binary)
    : typeof Buffer !== 'undefined'
      ? Buffer.from(bytes).toString('base64')
      : '';

  return normalized.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function persistAuthToken(account: TestAccount) {
  if (typeof window === 'undefined') return;

  const payload = {
    sub: account.email,
    roles: [account.role],
    name: account.name,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };

  const header = encodeBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = encodeBase64Url(JSON.stringify(payload));
  const signature = encodeBase64Url('mock-signature');

  localStorage.setItem('tm_token', `${header}.${body}.${signature}`);
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      role: 'GUEST',
      userName: '',
      toast: null,
      matchings: MY_MATCHINGS_STUDENT,
      bookings: MY_LESSON_BOOKINGS,
      payments: MY_PAYMENTS,
      reviews: REVIEWS,
      studentProfile: null,
      tutorProfile: null,

      showToast: (msg: string) => {
        if (toastTimer) clearTimeout(toastTimer);
        set({ toast: msg });
        toastTimer = setTimeout(() => {
          set((state) => (state.toast === msg ? { toast: null } : {}));
        }, 3000);
      },

      clearToast: () => set({ toast: null }),

      login: (email: string, pass: string): boolean => {
        const account = MOCK_ACCOUNTS.find(
          (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === pass
        );
        if (account) {
          set({ role: account.role, userName: account.name });
          persistAuthToken(account);
          get().showToast(`${account.name}님, 환영합니다!`);
          return true;
        }
        return false;
      },

      quickLogin: (account: TestAccount) => {
        set({ role: account.role, userName: account.name });
        persistAuthToken(account);
        get().showToast(`${account.name}님, 환영합니다!`);
      },

      signup: (newRole: Role, name: string) => {
        const defaultName = name.trim() || (newRole === 'STUDENT' ? '신규 학생' : '신규 튜터');
        set({ role: newRole, userName: defaultName });
        get().showToast(`${newRole === 'STUDENT' ? '학생' : '튜터'} 계정으로 가입되었습니다!`);
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('tm_token');
        }
        set({ role: 'GUEST', userName: '' });
        get().showToast('로그아웃되었습니다.');
      },

      setRole: (newRole: Role, newUserName?: string) => {
        set({ role: newRole, ...(newUserName !== undefined && { userName: newUserName }) });
      },

      addMatching: (tutorId: number, message: string, schedule: string) => {
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

        set((state) => ({ matchings: [newMatching, ...state.matchings] }));
        get().showToast('매칭 요청이 전송되었습니다!');
      },

      updateMatchingStatus: (id: number, status: 'accepted' | 'rejected') => {
        set((state) => ({
          matchings: state.matchings.map((m) => (m.id === id ? { ...m, status } : m)),
        }));
        get().showToast(status === 'accepted' ? '요청을 승인했습니다.' : '요청을 거절했습니다.');
      },

      addBooking: (newBookingData: Omit<LessonBooking, 'id' | 'requestedAt'>) => {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const requestedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

        const newBooking: LessonBooking = {
          ...newBookingData,
          id: Date.now(),
          requestedAt,
        };

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

        set((state) => ({
          bookings: [newBooking, ...state.bookings],
          payments: [newPayment, ...state.payments],
        }));

        get().showToast('예약 신청이 완료되었습니다!');
      },

      payItem: (id: number) => {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const paidAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

        set((state) => ({
          payments: state.payments.map((p) =>
            p.id === id ? { ...p, status: 'paid' as const, paidAt } : p
          ),
        }));
        get().showToast('결제가 완료되었습니다!');
      },

      payAllUnpaid: () => {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const paidAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

        set((state) => ({
          payments: state.payments.map((p) =>
            p.status === 'unpaid' ? { ...p, status: 'paid' as const, paidAt } : p
          ),
        }));
        get().showToast('모든 미결제 건이 결제 완료되었습니다!');
      },

      addReview: (_tutorId: number, rating: number, content: string) => {
        const { userName, role } = get();
        const newReview: Review = {
          id: Date.now(),
          student: userName || (role === 'STUDENT' ? '김학생' : '익명 학생'),
          rating,
          content,
          date: new Date().toISOString().split('T')[0],
        };

        set((state) => ({
          reviews: [newReview, ...state.reviews],
        }));
        get().showToast('리뷰가 성공적으로 등록되었습니다!');
      },

      saveStudentProfile: (profile: StudentProfile) => {
        set({ studentProfile: { ...profile, updatedAt: new Date().toISOString() } });
        get().showToast('학생 프로필이 성공적으로 저장되었습니다!');
      },

      saveTutorProfile: (profile: TutorProfileData) => {
        set({ tutorProfile: { ...profile, updatedAt: new Date().toISOString() } });
        get().showToast('선생님 프로필이 성공적으로 저장되었습니다!');
      },
    }),
    {
      name: 'tm_user_storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        role: state.role,
        userName: state.userName,
        matchings: state.matchings,
        bookings: state.bookings,
        payments: state.payments,
        reviews: state.reviews,
        studentProfile: state.studentProfile,
        tutorProfile: state.tutorProfile,
      }),
    }
  )
);
