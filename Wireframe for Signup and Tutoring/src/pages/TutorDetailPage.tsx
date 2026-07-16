import { useState } from "react";
import {
  ArrowLeft,
  Send,
  MessageSquare,
  User,
  Star,
  MapPin,
  Video,
  Clock,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Award,
} from "lucide-react";
import type { Role } from "../types";
import { TUTORS, REVIEWS } from "../data/mockData";
import StarRow from "../components/StarRow";

interface Props {
  tutorId: number;
  role: Role;
  onBack: () => void;
  onRequestMatching: () => void;
}

const RATING_DIST = [
  { star: 5, count: 71 },
  { star: 4, count: 12 },
  { star: 3, count: 3 },
  { star: 2, count: 1 },
  { star: 1, count: 0 },
];
const TOTAL_RATINGS = RATING_DIST.reduce((s, r) => s + r.count, 0);

export default function TutorDetailPage({ tutorId, role, onBack, onRequestMatching }: Props) {
  const tutor = TUTORS.find((t) => t.id === tutorId) ?? TUTORS[0];
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const visibleReviews = showAllReviews ? REVIEWS : REVIEWS.slice(0, 3);

  const toggle = (key: string) => setActiveSection(activeSection === key ? null : key);

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft size={15} /> 목록으로
      </button>

      {/* ── 상단 프로필 카드 ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Cover band */}
        <div className="h-24 bg-gradient-to-r from-primary to-primary/70 relative">
          <div
            className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #e05a2b 0%, transparent 60%)" }}
          />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar + quick actions */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <img
                src={tutor.avatar}
                alt={tutor.name}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-card bg-muted shadow-md"
              />
              {tutor.available && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-card rounded-full" />
              )}
            </div>
            <div className="flex gap-2 mb-1">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${tutor.available ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                {tutor.available ? "● 수업 가능" : "● 마감"}
              </span>
              {tutor.onlineAvailable && (
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-50 text-blue-600 flex items-center gap-1">
                  <Video size={11} /> 온라인 가능
                </span>
              )}
            </div>
          </div>

          {/* Name & subject */}
          <h1 className="text-xl font-bold text-foreground">{tutor.name} 튜터</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{tutor.subject}</p>

          {/* Rating row */}
          <div className="flex items-center gap-2 mt-2">
            <StarRow rating={tutor.rating} size={16} />
            <span className="text-sm font-bold text-foreground">{tutor.rating}</span>
            <span className="text-sm text-muted-foreground">({tutor.reviews}개 리뷰)</span>
          </div>

          {/* Location & tags */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
            {tutor.location && (
              <span className="flex items-center gap-1"><MapPin size={12} /> {tutor.location}</span>
            )}
            {tutor.responseTime && (
              <span className="flex items-center gap-1"><Clock size={12} /> 응답 {tutor.responseTime}</span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-4">
            {tutor.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 통계 바 ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: BookOpen, label: "총 레슨 수", value: `${tutor.totalLessons ?? "240+"}회` },
          { icon: CheckCircle2, label: "응답률", value: `${tutor.responseRate ?? 98}%` },
          { icon: Award, label: "수상 이력", value: "KMO 은상" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="flex justify-center mb-1.5">
              <Icon size={18} className="text-accent" />
            </div>
            <p className="text-lg font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── 레슨비 옵션 ── */}
      {tutor.lessonOptions && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-accent rounded-full inline-block" />
            레슨비 안내
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {tutor.lessonOptions.map((opt) => (
              <div
                key={opt.label}
                className={`rounded-xl border p-4 text-center ${opt.label === "기본 수업" ? "border-primary/40 bg-secondary" : "border-border"}`}
              >
                {opt.label === "기본 수업" && (
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-2 inline-block">추천</span>
                )}
                <p className="text-xs text-muted-foreground">{opt.label}</p>
                <p className="text-lg font-bold text-foreground mt-1">{opt.price.toLocaleString()}원</p>
                <p className="text-xs text-muted-foreground">{opt.duration}</p>
              </div>
            ))}
          </div>
          {role === "student" && tutor.available && (
            <button
              onClick={onRequestMatching}
              className="mt-5 w-full py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send size={15} /> 레슨 매칭 요청하기
            </button>
          )}
          {!role && (
            <p className="mt-4 text-center text-xs text-muted-foreground">매칭 요청을 보내려면 로그인이 필요합니다.</p>
          )}
        </div>
      )}

      {/* ── 튜터 소개 ── */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-accent rounded-full inline-block" />
          튜터 소개
        </h2>
        <p className="text-sm text-foreground leading-relaxed">{tutor.fullIntro ?? tutor.intro}</p>
      </div>

      {/* ── 수업 스타일 ── */}
      {tutor.lessonStyle && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-accent rounded-full inline-block" />
            수업 방식
          </h2>
          <ul className="space-y-2">
            {tutor.lessonStyle.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── 학력 ── */}
      {tutor.education && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <button
            onClick={() => toggle("edu")}
            className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <GraduationCap size={16} className="text-primary" />
              학력
            </h2>
            {activeSection === "edu" ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
          </button>
          {activeSection === "edu" && (
            <div className="px-5 pb-5 space-y-2.5 border-t border-border pt-4">
              {tutor.education.map((edu, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p className="text-sm text-foreground">{edu}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 경력 ── */}
      {tutor.careers && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <button
            onClick={() => toggle("career")}
            className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Briefcase size={16} className="text-primary" />
              경력
            </h2>
            {activeSection === "career" ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
          </button>
          {activeSection === "career" && (
            <div className="px-5 pb-5 border-t border-border pt-4">
              <div className="relative pl-4 space-y-5">
                <div className="absolute left-0 top-1 bottom-1 w-px bg-border" />
                {tutor.careers.map((c, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />
                    <p className="text-xs text-muted-foreground mb-0.5">{c.period}</p>
                    <p className="text-sm font-semibold text-foreground">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.org}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 리뷰 섹션 ── */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-accent rounded-full inline-block" />
          수강생 리뷰
          <span className="text-sm font-normal text-muted-foreground ml-1">({REVIEWS.length}개)</span>
        </h2>

        {/* Rating summary */}
        <div className="flex gap-6 items-center mb-5 p-4 bg-muted/40 rounded-xl">
          <div className="text-center shrink-0">
            <p className="text-4xl font-bold text-foreground">{tutor.rating}</p>
            <StarRow rating={tutor.rating} size={14} />
            <p className="text-xs text-muted-foreground mt-1">{TOTAL_RATINGS}개 리뷰</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {RATING_DIST.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-3">{star}</span>
                <Star size={10} className="fill-amber-400 text-amber-400 shrink-0" />
                <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${TOTAL_RATINGS ? (count / TOTAL_RATINGS) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-4 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review cards */}
        <div className="space-y-3">
          {visibleReviews.map((r) => (
            <div key={r.id} className="border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                    <User size={13} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{r.student}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarRow rating={r.rating} size={12} />
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                </div>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{r.content}</p>
            </div>
          ))}
        </div>

        {!showAllReviews && REVIEWS.length > 3 && (
          <button
            onClick={() => setShowAllReviews(true)}
            className="mt-3 w-full py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer"
          >
            리뷰 더 보기 ({REVIEWS.length - 3}개)
          </button>
        )}
      </div>

      {/* ── 리뷰 작성 (학생만) ── */}
      {role === "student" && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <MessageSquare size={15} className="text-primary" />
            리뷰 작성
          </h2>

          {/* Star picker */}
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1.5">별점을 선택해 주세요</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={28}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setReviewRating(n)}
                  className={`cursor-pointer transition-colors ${
                    n <= (hoverRating || reviewRating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
              {reviewRating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground self-center">
                  {["", "별로예요", "그저 그래요", "괜찮아요", "좋아요", "최고예요!"][reviewRating]}
                </span>
              )}
            </div>
          </div>

          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value.slice(0, 300))}
            className="w-full bg-input-background border border-border rounded-xl p-3 text-sm text-foreground placeholder-muted-foreground outline-none resize-none focus:border-primary/50 transition-colors"
            rows={4}
            placeholder="튜터와의 레슨 경험을 솔직하게 공유해 주세요. 다른 수강생들에게 큰 도움이 됩니다."
          />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-muted-foreground">{reviewText.length}/300</p>
            <button
              disabled={reviewRating === 0 || reviewText.trim().length < 10}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              리뷰 등록
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
