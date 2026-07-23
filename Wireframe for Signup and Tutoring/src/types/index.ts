export type Page =
  | "home"
  | "tutors"
  | "tutor-detail"
  | "signup"
  | "login"
  | "my-matchings"
  | "matching-request"
  | "booking"
  | "schedule";

export type Role = "student" | "tutor" | null;

export interface LessonOption {
  label: string;
  duration: string;
  price: number;
}

export interface Career {
  period: string;
  title: string;
  org: string;
}

export interface Tutor {
  id: number;
  name: string;
  subject: string;
  rating: number;
  reviews: number;
  price: number;
  tags: string[];
  intro: string;
  avatar: string;
  available: boolean;
  // 상세 정보 (선택)
  fullIntro?: string;
  education?: string[];
  careers?: Career[];
  lessonOptions?: LessonOption[];
  lessonStyle?: string[];
  totalLessons?: number;
  responseRate?: number;
  responseTime?: string;
  location?: string;
  onlineAvailable?: boolean;
}

export interface Review {
  id: number;
  student: string;
  rating: number;
  date: string;
  content: string;
}

export interface StudentMatching {
  id: number;
  tutor: string;
  subject: string;
  date: string;
  time: string;
  status: string;
  message: string;
}

export interface TutorMatching {
  id: number;
  student: string;
  subject: string;
  date: string;
  time: string;
  status: string;
  message: string;
}

export interface PaymentItem {
  id: number;
  tutor: string;
  subject: string;
  avatar: string;
  lessonDate: string;   // "2026-07-28"
  lessonDay: string;
  startTime: string;
  endTime: string;
  price: number;
  status: "unpaid" | "paid";
  paidAt?: string;
}

export interface LessonBooking {
  id: number;
  tutor: string;
  subject: string;
  avatar: string;
  lessonDate: string;      // "2026-07-28"
  lessonDay: string;       // "월"
  startTime: string;       // "10:30"
  endTime: string;         // "11:30"
  price: number;
  status: "pending" | "confirmed" | "rejected";
  requestedAt: string;     // 예약 신청 일시
}
