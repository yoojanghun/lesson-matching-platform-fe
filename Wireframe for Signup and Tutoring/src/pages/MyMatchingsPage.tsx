import { useState } from "react";
import { CheckCircle2, XCircle, GraduationCap, User, ChevronRight, Calendar, Clock } from "lucide-react";
import type { Role } from "../types";
import { MY_MATCHINGS_STUDENT, MY_MATCHINGS_TUTOR, MY_LESSON_BOOKINGS, TUTORS } from "../data/mockData";
import StatusBadge from "../components/StatusBadge";

interface Props {
  role: Role;
  onOpenBooking: (matchingId: number) => void;
}

// 레슨 예약 상태 배지
function BookingStatusBadge({ status }: { status: "pending" | "confirmed" | "rejected" }) {
  const map = {
    pending:   { label: "대기 중",  cls: "bg-amber-50 text-amber-700 border-amber-200",     icon: <Clock size={12} /> },
    confirmed: { label: "확정됨",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={12} /> },
    rejected:  { label: "거절됨",   cls: "bg-red-50 text-red-600 border-red-200",            icon: <XCircle size={12} /> },
  };
  const { label, cls, icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${cls}`}>
      {icon} {label}
    </span>
  );
}

// 날짜 포맷 "2026-07-28" → "2026년 7월 28일"
function formatDate(dateStr: string, day: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일 (${day})`;
}

export default function MyMatchingsPage({ role, onOpenBooking }: Props) {
  const isTutor = role === "tutor";

  // 학생: "보낸 요청" | "레슨 예약"   /   튜터: "받은 요청" 고정
  const [activeTab, setActiveTab] = useState<"requests" | "bookings">("requests");

  const sentMatchings = MY_MATCHINGS_STUDENT;
  const tutorMatchings = MY_MATCHINGS_TUTOR;
  const lessonBookings = MY_LESSON_BOOKINGS;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">내 매칭 목록</h2>
        <p className="text-sm text-muted-foreground">
          {isTutor ? "학생들로부터 받은 레슨 요청을 확인하세요" : "나의 레슨 요청 및 예약 현황을 확인하세요"}
        </p>
      </div>

      {/* ── 탭 (학생만) ── */}
      {!isTutor && (
        <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
          {([
            { key: "requests", label: "보낸 요청" },
            { key: "bookings", label: "레슨 예약" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              {key === "bookings" && lessonBookings.length > 0 && (
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === key ? "bg-primary text-white" : "bg-muted-foreground/20 text-muted-foreground"
                }`}>
                  {lessonBookings.length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 튜터 계정 역할 레이블 */}
      {isTutor && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-lg text-xs font-medium text-primary">
          <GraduationCap size={13} /> 튜터 계정 — 받은 요청
        </div>
      )}

      {/* ── 보낸 요청 (학생) ── */}
      {!isTutor && activeTab === "requests" && (
        <div className="space-y-3">
          {sentMatchings.map((m) => {
            const isAccepted = m.status === "accepted";
            const tutor = TUTORS.find((t) => t.name === m.tutor);
            return (
              <div
                key={m.id}
                onClick={isAccepted ? () => onOpenBooking(m.id) : undefined}
                className={`bg-card border border-border rounded-xl p-5 transition-all ${
                  isAccepted ? "cursor-pointer hover:border-primary/40 hover:shadow-md" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3">
                    {tutor?.avatar ? (
                      <img src={tutor.avatar} alt={m.tutor} className="w-10 h-10 rounded-full object-cover bg-muted shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <GraduationCap size={18} className="text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-foreground">{m.tutor}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.subject}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.date} · {m.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={m.status} />
                    {isAccepted && (
                      <span className="flex items-center gap-0.5 text-xs font-medium text-primary">
                        예약하기 <ChevronRight size={13} />
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-sm text-foreground bg-muted rounded-lg px-3 py-2 leading-relaxed">
                  "{m.message}"
                </p>
                {isAccepted && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <CheckCircle2 size={13} className="shrink-0" />
                    승인되었습니다! 카드를 클릭해 레슨 날짜와 시간을 예약하세요.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 레슨 예약 내역 (학생) ── */}
      {!isTutor && activeTab === "bookings" && (
        <div className="space-y-3">
          {lessonBookings.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center text-sm text-muted-foreground">
              아직 예약한 레슨이 없습니다.
            </div>
          ) : (
            lessonBookings.map((b) => (
              <div key={b.id} className="bg-card border border-border rounded-xl p-5">
                {/* 헤더 */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3">
                    <img src={b.avatar} alt={b.tutor} className="w-10 h-10 rounded-full object-cover bg-muted shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{b.tutor} 튜터</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{b.subject}</p>
                    </div>
                  </div>
                  <BookingStatusBadge status={b.status} />
                </div>

                {/* 레슨 상세 */}
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <div className="bg-muted/50 rounded-lg px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground font-medium mb-0.5 flex items-center gap-1">
                      <Calendar size={10} /> 레슨 날짜
                    </p>
                    <p className="text-sm font-semibold text-foreground">{formatDate(b.lessonDate, b.lessonDay)}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground font-medium mb-0.5 flex items-center gap-1">
                      <Clock size={10} /> 레슨 시간
                    </p>
                    <p className="text-sm font-semibold text-foreground">{b.startTime} ~ {b.endTime}</p>
                    <p className="text-[10px] text-muted-foreground">1시간</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground font-medium mb-0.5">레슨비</p>
                    <p className="text-sm font-semibold text-primary">{b.price.toLocaleString()}원</p>
                  </div>
                </div>

                {/* 신청 일시 */}
                <p className="mt-2.5 text-xs text-muted-foreground">예약 신청: {b.requestedAt}</p>

                {/* 상태별 안내 */}
                {b.status === "confirmed" && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <CheckCircle2 size={13} className="shrink-0" />
                    튜터가 레슨을 확정했습니다. 레슨 당일 시간에 맞춰 준비해 주세요!
                  </div>
                )}
                {b.status === "pending" && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <Clock size={13} className="shrink-0" />
                    튜터의 확정을 기다리고 있습니다.
                  </div>
                )}
                {b.status === "rejected" && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <XCircle size={13} className="shrink-0" />
                    해당 시간에 레슨이 어렵다고 합니다. 다른 시간으로 다시 예약해 보세요.
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── 받은 요청 (튜터) ── */}
      {isTutor && (
        <div className="space-y-3">
          {tutorMatchings.map((m) => (
            <div key={m.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{m.student}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.date} · {m.time}</p>
                  </div>
                </div>
                <StatusBadge status={m.status} />
              </div>
              <p className="mt-3 text-sm text-foreground bg-muted rounded-lg px-3 py-2 leading-relaxed">
                "{m.message}"
              </p>
              {m.status === "pending" && (
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1 cursor-pointer">
                    <CheckCircle2 size={13} /> 승인
                  </button>
                  <button className="flex-1 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-1 cursor-pointer">
                    <XCircle size={13} /> 거절
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
