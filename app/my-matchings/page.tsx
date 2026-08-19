"use client";

import { useState } from "react";
import {
  CheckCircle2,
  GraduationCap,
  User,
  ChevronRight,
  ChevronDown,
  CreditCard,
  Calendar,
  Clock,
  Settings,
  CalendarDays,
  DollarSign,
  Inbox,
  Sparkles,
} from "lucide-react";
import {
  MY_MATCHINGS_STUDENT,
  MY_MATCHINGS_TUTOR,
  MY_LESSON_BOOKINGS,
  MY_PAYMENTS,
  TUTOR_LESSON_REQUESTS,
  TUTORS,
} from "../data/mockData";
import type {
  PaymentItem,
  TutorMatching,
  TutorLessonRequest,
} from "../types";
import StatusBadge from "../components/StatusBadge";
import PaymentModal from "../components/PaymentModal";
import LessonFeeModal from "../components/LessonFeeModal";
import ApproveRejectModal from "../components/ApproveRejectModal";
import TutorRevenuePanel from "../components/TutorRevenuePanel";
import MiniCalendar, { type CalEvent } from "../components/MiniCalendar";
import { useUser } from "../components/UserContext";
import BookingPage from "./BookingPage";
import TutorStudentDetailPage from "./TutorStudentDetailPage";
import SchedulePlanner from "../components/SchedulePlanner";

function BookingStatusBadge({
  status,
}: {
  status: "pending" | "confirmed" | "rejected";
}) {
  const map = {
    pending: { label: "대기 중", cls: "bg-amber-100 text-amber-700" },
    confirmed: { label: "확정됨", cls: "bg-emerald-100 text-emerald-700" },
    rejected: { label: "거절됨", cls: "bg-red-100 text-red-600" },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}

function fmtDate(dateStr: string, day: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일 (${day})`;
}

function ExpandableMessage({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
      }}
      className="text-left w-full group cursor-pointer"
    >
      <p
        className={`text-xs text-muted-foreground leading-relaxed ${
          open ? "" : "truncate"
        }`}
      >
        {text}
      </p>
      <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/60 group-hover:text-muted-foreground mt-0.5 transition-colors">
        {open ? "접기" : "더 보기"}
        <ChevronDown
          size={10}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </span>
    </button>
  );
}

const COL = "grid grid-cols-[44px_1fr_90px_auto] items-start gap-x-4";

export default function MyMatchingsPage() {
  const { role, matchings, bookings, payments, payItem, payAllUnpaid } =
    useUser();
  const isTutor = role === "TUTOR";

  const todayStr = (() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(t.getDate()).padStart(2, "0")}`;
  })();

  const [activeTab, setActiveTab] = useState<
    "requests" | "bookings" | "payments"
  >("requests");
  const [tutorTab, setTutorTab] = useState<
    "received" | "lessons" | "schedule" | "revenue"
  >("received");

  // 튜터 매칭 목록 (레슨비 커스텀 지원)
  const [tutorMatchingsList, setTutorMatchingsList] = useState<TutorMatching[]>(
    MY_MATCHINGS_TUTOR.map((m) => ({ ...m, lessonFee: undefined }))
  );
  const [selectedTutorMatchingId, setSelectedTutorMatchingId] = useState<
    number | null
  >(null);
  const [feeModalTarget, setFeeModalTarget] = useState<TutorMatching | null>(
    null
  );
  const [approveModalTarget, setApproveModalTarget] =
    useState<TutorMatching | null>(null);

  // 튜터 수업 예약 요청 목록
  const [lessonRequests, setLessonRequests] = useState<TutorLessonRequest[]>(
    TUTOR_LESSON_REQUESTS
  );
  const [lessonReqSelDate, setLessonReqSelDate] = useState<string | null>(
    todayStr
  );
  const [lessonReqPopup, setLessonReqPopup] = useState<string | null>(null);
  const [lessonReqModal, setLessonReqModal] =
    useState<TutorLessonRequest | null>(null);

  const [bookingMatchingId, setBookingMatchingId] = useState<number | null>(
    null
  );
  const [payingItem, setPayingItem] = useState<PaymentItem | null>(null);

  const [bookingSelDate, setBookingSelDate] = useState<string | null>(todayStr);
  const [bookingPopup, setBookingPopup] = useState<string | null>(null);
  const [paymentSelDate, setPaymentSelDate] = useState<string | null>(todayStr);
  const [paymentPopup, setPaymentPopup] = useState<string | null>(null);

  const sentMatchings = matchings;
  const tutorMatchings = tutorMatchingsList;
  const lessonBookings = bookings;
  const unpaidCount = payments.filter((p) => p.status === "unpaid").length;
  const unpaidTotal = payments
    .filter((p) => p.status === "unpaid")
    .reduce((sum, p) => sum + p.price, 0);

  const pendingReceivedCount = tutorMatchings.filter(
    (m) => m.status === "pending"
  ).length;
  const pendingLessonsCount = lessonRequests.filter(
    (r) => r.status === "pending"
  ).length;

  const bookingEvents: CalEvent[] = lessonBookings
    .filter((b) => b.status !== "rejected")
    .map((b) => ({
      date: b.lessonDate,
      label: `${b.startTime} ${b.tutor}`,
      color: b.status === "confirmed" ? "blue" : "amber",
    }));

  const paymentEvents: CalEvent[] = payments.map((p) => ({
    date: p.lessonDate,
    label: `${p.startTime} ${p.tutor}`,
    color: p.status === "paid" ? "green" : "amber",
  }));



  // 학생 상세 화면 진입 시
  if (selectedTutorMatchingId !== null) {
    const matching = tutorMatchingsList.find(
      (m) => m.id === selectedTutorMatchingId
    );
    if (matching) {
      return (
        <TutorStudentDetailPage
          matching={matching}
          onBack={() => setSelectedTutorMatchingId(null)}
          onUpdateFee={(id, fee) => {
            setTutorMatchingsList((prev) =>
              prev.map((m) => (m.id === id ? { ...m, lessonFee: fee } : m))
            );
          }}
        />
      );
    }
  }

  if (bookingMatchingId !== null) {
    return (
      <BookingPage
        matchingId={bookingMatchingId}
        onBack={() => setBookingMatchingId(null)}
        onConfirm={() => {
          setBookingMatchingId(null);
          setActiveTab("bookings");
        }}
      />
    );
  }

  const STUDENT_TABS = [
    { key: "requests" as const, label: "보낸 요청" },
    { key: "bookings" as const, label: "레슨 예약" },
    { key: "payments" as const, label: "결제", badge: unpaidCount },
  ];

  const TUTOR_TABS = [
    { key: "received" as const, label: "받은 요청", badge: pendingReceivedCount },
    { key: "lessons" as const, label: "수업 요청", badge: pendingLessonsCount },
    { key: "schedule" as const, label: "스케줄 관리" },
    { key: "revenue" as const, label: "수익 관리" },
  ];

  // 튜터 레슨 예약 캘린더 이벤트
  const tutorLessonEvents: CalEvent[] = lessonRequests
    .filter((r) => r.status !== "rejected")
    .map((r) => ({
      date: r.lessonDate,
      label: `${r.startTime} ${r.student}`,
      color: r.status === "confirmed" ? "blue" : "amber",
    }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">내 매칭 목록</h2>
        <p className="text-sm text-muted-foreground">
          {isTutor
            ? "학생들로부터 받은 레슨 요청을 확인하세요"
            : "나의 레슨 요청 및 예약 현황을 확인하세요"}
        </p>
      </div>

      {/* ── 학생 탭 ── */}
      {!isTutor && (
        <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
          {STUDENT_TABS.map(({ key, label, badge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === key
                  ? "bg-card text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              {(badge ?? 0) > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === key
                      ? "bg-accent text-white"
                      : "bg-accent/20 text-accent"
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── 튜터 탭 ── */}
      {isTutor && (
        <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit flex-wrap">
          {TUTOR_TABS.map(({ key, label, badge }) => (
            <button
              key={key}
              onClick={() => setTutorTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                tutorTab === key
                  ? "bg-card text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              {(badge ?? 0) > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    tutorTab === key
                      ? "bg-accent text-white"
                      : "bg-accent/20 text-accent"
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ══════════════════════════════
          보낸 요청 탭 (학생)
      ══════════════════════════════ */}
      {!isTutor && activeTab === "requests" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className={`${COL} px-5 py-3 bg-muted/60 border-b border-border`}>
            <span />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide self-center">
              요청 정보
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide self-center">
              상태
            </span>
            <span className="w-4" />
          </div>
          {sentMatchings.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-10">
              보낸 요청이 없습니다.
            </p>
          ) : (
            sentMatchings.map((m, i) => {
              const isAccepted = m.status === "accepted";
              const tutor = TUTORS.find((t) => t.name === m.tutor);
              return (
                <div
                  key={m.id}
                  className={`${COL} px-5 py-4 transition-colors ${
                    i !== sentMatchings.length - 1 ? "border-b border-border" : ""
                  } ${
                    isAccepted
                      ? "cursor-pointer hover:bg-muted/40"
                      : "hover:bg-muted/20"
                  }`}
                  onClick={
                    isAccepted ? () => setBookingMatchingId(m.id) : undefined
                  }
                >
                  {tutor?.avatar ? (
                    <img
                      src={tutor.avatar}
                      alt={m.tutor}
                      className="w-11 h-11 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <GraduationCap size={18} className="text-primary" />
                    </div>
                  )}
                  <div className="min-w-0 pt-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-foreground">{m.tutor}</p>
                      <span className="px-2 py-0.5 bg-muted rounded-full text-[11px] text-muted-foreground">
                        {m.subject}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {m.date} · {m.time}
                    </p>
                    <div
                      className="mt-1.5 max-w-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExpandableMessage text={m.message} />
                    </div>
                  </div>
                  <div className="flex items-center h-11">
                    <StatusBadge status={m.status} />
                  </div>
                  <div className="flex items-center h-11">
                    {isAccepted ? (
                      <ChevronRight size={16} className="text-primary" />
                    ) : (
                      <span className="w-4" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ══════════════════════════════
          레슨 예약 탭 (학생)
      ══════════════════════════════ */}
      {!isTutor && activeTab === "bookings" && (
        <div className="space-y-4">
          <MiniCalendar
            events={bookingEvents}
            selectedDate={bookingSelDate}
            onSelectDate={(d) => setBookingSelDate(d)}
            onClickDate={(d) => {
              setBookingSelDate(d);
              setBookingPopup(d);
            }}
          />

          <div className="flex items-center gap-4 px-1">
            <Legend cls="bg-primary/15 text-primary" label="예약 확정" />
            <Legend cls="bg-amber-100 text-amber-700" label="대기 중" />
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="px-5 py-3 border-b border-border bg-muted/60">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                전체 예약 목록
              </p>
            </div>
            {lessonBookings.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-10">
                아직 예약한 레슨이 없습니다.
              </p>
            ) : (
              lessonBookings.map((b, i) => (
                <div
                  key={b.id}
                  className={`grid grid-cols-[44px_1fr_110px_80px_90px] items-center gap-x-4 px-5 py-4 hover:bg-muted/20 transition-colors ${
                    i !== lessonBookings.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <img
                    src={b.avatar}
                    alt={b.tutor}
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-foreground">{b.tutor}</p>
                      <span className="px-2 py-0.5 bg-muted rounded-full text-[11px] text-muted-foreground">
                        {b.subject}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {fmtDate(b.lessonDate, b.lessonDay)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {b.startTime} – {b.endTime}
                    </p>
                    <p className="text-[11px] text-muted-foreground">1시간</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    {b.price.toLocaleString()}원
                  </p>
                  <BookingStatusBadge status={b.status} />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          결제 탭 (학생)
      ══════════════════════════════ */}
      {!isTutor && activeTab === "payments" && (
        <div className="space-y-4">
          <MiniCalendar
            events={paymentEvents}
            selectedDate={paymentSelDate}
            onSelectDate={(d) => setPaymentSelDate(d)}
            onClickDate={(d) => {
              setPaymentSelDate(d);
              setPaymentPopup(d);
            }}
          />

          <div className="flex items-center gap-4 px-1">
            <Legend cls="bg-emerald-100 text-emerald-700" label="결제 완료" />
            <Legend cls="bg-amber-100 text-amber-700" label="미결제" />
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="px-5 py-3 border-b border-border bg-muted/60">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                전체 결제 내역
              </p>
            </div>
            <div className="grid grid-cols-[44px_1fr_auto_auto_120px] items-center gap-x-4 px-5 py-2.5 border-b border-border bg-muted/30">
              <span />
              <span className="text-[11px] font-semibold text-muted-foreground">
                수업 정보
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                일시
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                금액
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                결제 상태
              </span>
            </div>
            {payments.map((p, i) => (
              <div
                key={p.id}
                className={`grid grid-cols-[44px_1fr_auto_auto_120px] items-center gap-x-4 px-5 py-4 transition-colors ${
                  i !== payments.length - 1 ? "border-b border-border" : ""
                } ${p.status === "unpaid" ? "hover:bg-muted/20" : ""}`}
              >
                <img
                  src={p.avatar}
                  alt={p.tutor}
                  className="w-11 h-11 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-foreground">{p.tutor}</p>
                    <span className="px-2 py-0.5 bg-muted rounded-full text-[11px] text-muted-foreground">
                      {p.subject}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-foreground flex items-center gap-1 justify-end">
                    <Calendar size={11} className="text-muted-foreground" />{" "}
                    {fmtDate(p.lessonDate, p.lessonDay)}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
                    <Clock size={11} /> {p.startTime} – {p.endTime}
                  </p>
                </div>
                <p className="text-sm font-bold text-foreground whitespace-nowrap">
                  {p.price.toLocaleString()}원
                </p>
                <div className="flex justify-start">
                  {p.status === "paid" ? (
                    <div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 size={11} /> 결제 완료
                      </span>
                      {p.paidAt && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {p.paidAt}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setPayingItem(p)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <CreditCard size={13} /> 결제하기
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 미결제 배너 */}
          {unpaidCount > 0 && (
            <div className="flex items-center justify-between gap-3 bg-accent/10 border border-accent/20 rounded-2xl px-5 py-4 shadow-sm">
              <div>
                <p className="text-sm font-bold text-accent">
                  미결제 수업 {unpaidCount}건
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  미결제 금액:{" "}
                  <span className="font-semibold text-foreground">
                    {unpaidTotal.toLocaleString()}원
                  </span>
                </p>
              </div>
              <button
                onClick={() => payAllUnpaid()}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
              >
                <CreditCard size={15} /> 전체 결제
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════
          받은 요청 탭 (튜터)
      ══════════════════════════════ */}
      {isTutor && tutorTab === "received" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="grid grid-cols-[44px_1fr_auto_24px] items-center gap-x-4 px-6 py-3.5 bg-muted/40 border-b border-border">
              <span />
              <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">
                요청 정보
              </span>
              <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide pr-3">
                상태
              </span>
              <span />
            </div>

            {tutorMatchings.map((m, i) => {
              const isAccepted = m.status === "accepted";
              return (
                <div
                  key={m.id}
                  className={`grid grid-cols-[44px_1fr_auto_24px] items-center gap-x-4 px-6 py-5 transition-colors cursor-pointer hover:bg-muted/20 ${
                    i !== tutorMatchings.length - 1 ? "border-b border-border" : ""
                  }`}
                  onClick={() => {
                    if (isAccepted) {
                      setSelectedTutorMatchingId(m.id);
                    } else if (m.status === "pending") {
                      setApproveModalTarget(m);
                    }
                  }}
                >
                  <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User size={18} className="text-primary" />
                  </div>

                  <div className="min-w-0 pt-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-foreground">
                        {m.student}
                      </p>
                      <span className="px-2 py-0.5 bg-muted rounded-full text-[11px] text-muted-foreground">
                        {m.subject}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {m.date} · {m.time}
                    </p>
                    <div
                      className="mt-1 max-w-md"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExpandableMessage text={m.message} />
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <StatusBadge status={m.status} />
                  </div>

                  <div className="flex items-center justify-center">
                    <ChevronRight size={16} className="text-muted-foreground/60" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          수업 예약 및 일정 탭 (튜터)
      ══════════════════════════════ */}
      {isTutor && tutorTab === "lessons" && (
        <div className="space-y-5">
          {/* 캘린더 */}
          <MiniCalendar
            events={tutorLessonEvents}
            selectedDate={lessonReqSelDate}
            onSelectDate={setLessonReqSelDate}
            onClickDate={(d) => {
              setLessonReqSelDate(d);
              setLessonReqPopup(d);
            }}
          />

          <div className="flex items-center gap-4 px-1">
            <Legend cls="bg-primary/15 text-primary" label="확정된 수업" />
            <Legend cls="bg-amber-100 text-amber-700" label="예약 요청 (검토 대기)" />
          </div>

          {/* 전체 요청 목록 */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="px-5 py-3 border-b border-border bg-muted/60">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                수업 예약 요청 목록
              </p>
            </div>
            {lessonRequests.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-10">
                수업 예약 요청이 없습니다.
              </p>
            ) : (
              lessonRequests.map((r, i) => (
                <div
                  key={r.id}
                  className={`grid grid-cols-[44px_1fr_110px_90px_100px] items-center gap-x-4 px-5 py-4 hover:bg-muted/20 transition-colors ${
                    i !== lessonRequests.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-foreground">
                        {r.student}
                      </p>
                      <span className="px-2 py-0.5 bg-muted rounded-full text-[11px] text-muted-foreground">
                        {r.subject}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {fmtDate(r.lessonDate, r.lessonDay)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {r.startTime} – {r.endTime}
                    </p>
                    <p className="text-[11px] text-muted-foreground">1시간</p>
                  </div>
                  <div>
                    <BookingStatusBadge status={r.status} />
                  </div>
                  <div className="flex justify-end">
                    {r.status === "pending" ? (
                      <button
                        onClick={() => setLessonReqModal(r)}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                      >
                        검토하기
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {r.status === "confirmed" ? "승인됨" : "거절됨"}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          스케줄 관리 탭 (튜터)
      ══════════════════════════════ */}
      {isTutor && tutorTab === "schedule" && <SchedulePlanner />}

      {/* ══════════════════════════════
          수익 관리 탭 (튜터)
      ══════════════════════════════ */}
      {isTutor && tutorTab === "revenue" && (
        <div className="space-y-4">
          <TutorRevenuePanel />
        </div>
      )}

      {/* ══════════════════════════════
          모달 영역
      ══════════════════════════════ */}

      {/* 튜터 캘린더 날짜 클릭 팝업 */}
      {lessonReqPopup && (() => {
        const WDAYS = ["일", "월", "화", "수", "목", "금", "토"];
        const [py, pm, pd] = lessonReqPopup.split("-").map(Number);
        const dow = WDAYS[new Date(lessonReqPopup).getDay()];
        const items = lessonRequests.filter((r) => r.lessonDate === lessonReqPopup);
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
            onClick={() => setLessonReqPopup(null)}
          >
            <div
              className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                  <p className="text-sm font-bold text-foreground">수업 일정 상세</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {py}년 {pm}월 {pd}일 ({dow})
                  </p>
                </div>
                <button
                  onClick={() => setLessonReqPopup(null)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <span className="text-muted-foreground text-lg leading-none">×</span>
                </button>
              </div>

              {items.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">
                  이 날은 예정된 수업이나 요청이 없습니다.
                </p>
              ) : (
                items.map((r, i) => (
                  <div
                    key={r.id}
                    className={`px-5 py-4 ${
                      i !== items.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          <User size={16} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {r.student}
                          </p>
                          <span className="text-[11px] text-muted-foreground">
                            {r.subject}
                          </span>
                        </div>
                      </div>
                      <BookingStatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Clock size={11} /> {r.startTime} – {r.endTime}
                    </p>
                    {r.message && (
                      <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 mt-2 leading-relaxed border border-border/50">
                        {r.message}
                      </p>
                    )}
                    {r.status === "pending" && (
                      <button
                        onClick={() => {
                          setLessonReqModal(r);
                          setLessonReqPopup(null);
                        }}
                        className="mt-3 w-full py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors cursor-pointer shadow-sm"
                      >
                        검토하기
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })()}

      {/* 레슨 예약 날짜 팝업 (학생) */}
      {bookingPopup && (() => {
        const WDAYS = ["일", "월", "화", "수", "목", "금", "토"];
        const [py, pm, pd] = bookingPopup.split("-").map(Number);
        const dow = WDAYS[new Date(bookingPopup).getDay()];
        const items = lessonBookings.filter(
          (b) => b.lessonDate === bookingPopup && b.status !== "rejected"
        );
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
            onClick={() => setBookingPopup(null)}
          >
            <div
              className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                  <p className="text-sm font-bold text-foreground">레슨 예약</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {py}년 {pm}월 {pd}일 ({dow})
                  </p>
                </div>
                <button
                  onClick={() => setBookingPopup(null)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <span className="text-muted-foreground text-lg leading-none">×</span>
                </button>
              </div>

              {items.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">
                  이 날은 예약된 레슨이 없습니다.
                </p>
              ) : (
                items.map((b, i) => (
                  <div
                    key={b.id}
                    className={`flex items-center justify-between px-5 py-4 ${
                      i !== items.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={b.avatar}
                        alt={b.tutor}
                        className="w-11 h-11 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-foreground">{b.tutor}</p>
                          <span className="px-2 py-0.5 bg-muted rounded-full text-[11px] text-muted-foreground">
                            {b.subject}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock size={11} /> {b.startTime} – {b.endTime}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 ml-2">
                      <BookingStatusBadge status={b.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })()}

      {/* 결제 날짜 팝업 (학생) */}
      {paymentPopup && (() => {
        const WDAYS = ["일", "월", "화", "수", "목", "금", "토"];
        const [py, pm, pd] = paymentPopup.split("-").map(Number);
        const dow = WDAYS[new Date(paymentPopup).getDay()];
        const items = payments.filter((p) => p.lessonDate === paymentPopup);
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
            onClick={() => setPaymentPopup(null)}
          >
            <div
              className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                  <p className="text-sm font-bold text-foreground">결제</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {py}년 {pm}월 {pd}일 ({dow})
                  </p>
                </div>
                <button
                  onClick={() => setPaymentPopup(null)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <span className="text-muted-foreground text-lg leading-none">×</span>
                </button>
              </div>

              {items.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">
                  이 날은 수업 내역이 없습니다.
                </p>
              ) : (
                items.map((p, i) => (
                  <div
                    key={p.id}
                    className={`px-5 py-4 ${
                      i !== items.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatar}
                          alt={p.tutor}
                          className="w-11 h-11 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-foreground">{p.tutor}</p>
                            <span className="px-2 py-0.5 bg-muted rounded-full text-[11px] text-muted-foreground">
                              {p.subject}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock size={11} /> {p.startTime} – {p.endTime}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-foreground whitespace-nowrap">
                        {p.price.toLocaleString()}원
                      </p>
                    </div>

                    <div className="mt-3">
                      {p.status === "paid" ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            <CheckCircle2 size={11} /> 결제 완료
                          </span>
                          {p.paidAt && (
                            <p className="text-[10px] text-muted-foreground mt-1.5 pl-0.5">
                              {p.paidAt}
                            </p>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setPayingItem(p);
                            setPaymentPopup(null);
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer shadow-sm"
                        >
                          <CreditCard size={13} /> 결제하기
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })()}

      {/* 결제 모달 */}
      {payingItem && (
        <PaymentModal
          item={payingItem}
          onClose={() => setPayingItem(null)}
          onPaid={(id) => {
            payItem(id);
            setPayingItem(null);
          }}
        />
      )}

      {/* 레슨비 설정 모달 */}
      {feeModalTarget && (
        <LessonFeeModal
          matching={feeModalTarget}
          defaultFee={TUTORS[0].price}
          onClose={() => setFeeModalTarget(null)}
          onSave={(id, fee) => {
            setTutorMatchingsList((prev) =>
              prev.map((m) => (m.id === id ? { ...m, lessonFee: fee } : m))
            );
            setFeeModalTarget(null);
          }}
        />
      )}

      {/* 매칭 요청 승인 / 거절 모달 */}
      {approveModalTarget && (
        <ApproveRejectModal
          matching={approveModalTarget}
          onClose={() => setApproveModalTarget(null)}
          onApprove={(id) => {
            setTutorMatchingsList((prev) =>
              prev.map((m) => (m.id === id ? { ...m, status: "accepted" } : m))
            );
            setApproveModalTarget(null);
          }}
          onReject={(id) => {
            setTutorMatchingsList((prev) =>
              prev.map((m) => (m.id === id ? { ...m, status: "rejected" } : m))
            );
            setApproveModalTarget(null);
          }}
        />
      )}

      {/* 수업 시간 예약 요청 승인 / 거절 모달 */}
      {lessonReqModal && (
        <ApproveRejectModal
          matching={{
            id: lessonReqModal.id,
            student: lessonReqModal.student,
            subject: lessonReqModal.subject,
            date: `${lessonReqModal.lessonDate} (${lessonReqModal.lessonDay})`,
            time: `${lessonReqModal.startTime} – ${lessonReqModal.endTime}`,
            message: lessonReqModal.message,
          }}
          onClose={() => setLessonReqModal(null)}
          onApprove={(id) => {
            setLessonRequests((prev) =>
              prev.map((r) => (r.id === id ? { ...r, status: "confirmed" } : r))
            );
            setLessonReqModal(null);
          }}
          onReject={(id) => {
            setLessonRequests((prev) =>
              prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
            );
            setLessonReqModal(null);
          }}
        />
      )}
    </div>
  );
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded-sm ${cls}`} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
