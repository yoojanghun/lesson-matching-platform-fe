export type Page = "home" | "tutors" | "tutor-detail" | "login" | "signup" | "my-matchings" | "matching-request";
export type Role = "student" | "tutor" | null;

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
  fullIntro?: string;
  education?: string[];
  careers?: { period: string; title: string; org: string }[];
  lessonOptions?: { label: string; duration: string; price: number }[];
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
}
