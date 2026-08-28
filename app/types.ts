export type Page =
  | "home"
  | "tutors"
  | "tutor-detail"
  | "login"
  | "signup"
  | "my-matchings"
  | "matching-request"
  | "booking"
  | "schedule"
  | "chat"
  | "tutor-student-detail";

export type Role = "STUDENT" | "TUTOR" | "GUEST";

export interface ChatMessage {
  id: number;
  from: "me" | "tutor";
  text: string;
  time: string;
}

export interface Conversation {
  id: number;
  tutorId: number;
  tutorName: string;
  tutorAvatar: string;
  tutorSubject: string;
  online: boolean;
  unread: number;
  messages: ChatMessage[];
}

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
  lessonGoals?: string[];
  rating: number;
  reviews: number;
  price: number;
  tags: string[];
  intro: string;
  avatar: string;
  available: boolean;
  lessonType?: "대면 수업" | "온라인 수업" | "대면 / 온라인 수업";
  lessonLocations?: string[];
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
  status: "pending" | "accepted" | "rejected";
  message: string;
}

export interface TutorMatching {
  id: number;
  student: string;
  subject: string;
  date: string;
  time: string;
  status: "pending" | "accepted" | "rejected";
  message: string;
  lessonFee?: number;
}

export interface TutorStudentLesson {
  id: number;
  lessonDate: string;
  lessonDay: string;
  startTime: string;
  endTime: string;
  fee: number;
  paid: boolean;
  paidAt?: string;
}

export interface TutorLessonRequest {
  id: number;
  student: string;
  subject: string;
  lessonDate: string;
  lessonDay: string;
  startTime: string;
  endTime: string;
  price: number;
  status: "pending" | "confirmed" | "rejected";
  requestedAt: string;
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

export interface BulletEntry {
  id: number;
  text: string;
}

export interface FeeEntry {
  id: number;
  type: string;   // e.g. "전공반", "취미반"
  duration: string;
  price: string;
}

export interface StudentProfile {
  interests: string[];
  goals: string[];
  styles: string[];
  lessonType: "대면 수업" | "온라인 수업" | "둘 다 가능" | "";
  location: string;
  budget: string;
  days: string[];
  times: string[];
  memo: string;
  updatedAt?: string;
}

export interface TutorProfileData {
  name: string;
  age: string;
  location: string;
  subjects: string[];
  goals: string[];
  educations: BulletEntry[];
  careers: BulletEntry[];
  fees: FeeEntry[];
  teachStyles: string[];
  teachNote: string;
  lessonType: "대면 수업" | "온라인 수업" | "둘 다 가능" | "";
  intro: string;
  updatedAt?: string;
}
