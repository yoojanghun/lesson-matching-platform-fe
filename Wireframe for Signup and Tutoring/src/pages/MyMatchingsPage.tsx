import { useState } from "react";
import {
  CheckCircle2, GraduationCap, User,
  ChevronRight, ChevronDown, CreditCard, Calendar, Clock,
} from "lucide-react";
import type { Role, PaymentItem, TutorLessonRequest, TutorMatching } from "../types";
import {
  MY_MATCHINGS_STUDENT,
  MY_LESSON_BOOKINGS, MY_PAYMENTS, TUTORS,
  TUTOR_LESSON_REQUESTS,
} from "../data/mockData";
import StatusBadge from "../components/StatusBadge";
import PaymentModal from "../components/PaymentModal";
import MiniCalendar, { type CalEvent } from "../components/MiniCalendar";
import SchedulePage from "./SchedulePage";
import TutorRevenuePanel from "../components/TutorRevenuePanel";
import ApproveRejectModal from "../components/ApproveRejectModal";

interface Props {
  role: Role;
  onOpenBooking: (matchingId: number) => void;
  tutorMatchingsList: TutorMatching[];
  onApproveMatching: (id: number) => void;
  onRejectMatching: (id: number) => void;
  onOpenStudentDetail: (matchingId: number) => void;
}

/* ── 작은 helpers ── */
function BookingStatusBadge({ status }: { status: "pending" | "confirmed" | "rejected" }) {
  const map = {
    pending:   { label: "대기 중", cls: "bg-amber-100 text-amber-700" },
    confirmed: { label: "확정됨",  cls: "bg-emerald-100 text-emerald-700" },
    rejected:  { label: "거절됨",  cls: "bg-red-100 text-red-600" },
  };
  const { label, cls } = map[status];
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>{label}</span>;
}

function fmtDate(dateStr: string, day: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일 (${day})`;
}

function ExpandableMessage({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }} className="text-left w-full group cursor-pointer">
      <p className={`text-xs text-muted-foreground leading-relaxed ${open ? "" : "truncate"}`}>{text}</p>
      <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/60 group-hover:text-muted-foreground mt-0.5 transition-colors">
        {open ? "접기" : "더 보기"}
        <ChevronDown size={10} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </span>
    </button>
  );
}


const COL = "grid grid-cols-[44px_1fr_90px_auto] items-start gap-x-4";

/* ── 메인 ── */
export default function MyMatchingsPage({
  role, onOpenBooking,
  tutorMatchingsList, onApproveMatching, onRejectMatching, onOpenStudentDetail,
}: Props) {
  const isTutor = role === "tutor";

  const todayStr = (() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
  })();

  const [activeTab, setActiveTab] = useState<"requests" | "bookings" | "payments">("requests");
  const [tutorTab, setTutorTab] = useState<"received" | "lessons" | "schedule" | "revenue">("received");

  const [approveModalTarget, setApproveModalTarget] = useState<TutorMatching | null>(null);

  const [lessonRequests, setLessonRequests] = useState<TutorLessonRequest[]>(TUTOR_LESSON_REQUESTS);
  const [lessonReqSelDate, setLessonReqSelDate] = useState<string | null>(null);
  const [lessonReqPopup, setLessonReqPopup] = useState<string | null>(null);
  const [lessonReqModal, setLessonReqModal] = useState<TutorLessonRequest | null>(null);

  const [payments, setPayments] = useState<PaymentItem[]>(MY_PAYMENTS);
  const [payingItem, setPayingItem] = useState<PaymentItem | null>(null);

  const [bookingSelDate, setBookingSelDate] = useState<string | null>(null);
  const [bookingPopup, setBookingPopup] = useState<string | null>(null);
  const [paymentSelDate, setPaymentSelDate] = useState<string | null>(null);
  const [paymentPopup, setPaymentPopup] = useState<string | null>(null);

  const sentMatchings  = MY_MATCHINGS_STUDENT;
  const tutorMatchings = tutorMatchingsList;
  const lessonBookings = MY_LESSON_BOOKINGS;
  const unpaidCount     = payments.filter((p) => p.status === "unpaid").length;

  const handlePaid = (id: number) => {
    const now = new Date();
    const paidAt = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    setPayments((prev) => prev.map((p) => p.id === id ? { ...p, status: "paid", paidAt } : p));
  };

  /* ── 레슨 예약 캘린더 이벤트 ── */
  const bookingEvents: CalEvent[] = lessonBookings
    .filter((b) => b.status !== "rejected")
    .map((b) => ({
      date: b.lessonDate,
      label: `${b.startTime} ${b.tutor}`,
      color: b.status === "confirmed" ? "blue" : "amber",
    }));

  /* ── 결제 캘린더 이벤트 ── */
  const paymentEvents: CalEvent[] = payments.map((p) => ({
    date: p.lessonDate,
    label: `${p.startTime} ${p.tutor}`,
    color: p.status === "paid" ? "green" : "amber",
  }));


  const TABS = [
    { key: "requests" as const,  label: "보낸 요청" },
    { key: "bookings" as const,  label: "레슨 예약" },
    { key: "payments" as const,  label: "결제", badge: unpaidCount },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">내 매칭 목록</h2>
        <p className="text-sm text-muted-foreground">
          {isTutor ? "학생들로부터 받은 레슨 요청을 확인하세요" : "나의 레슨 요청 및 예약 현황을 확인하세요"}
        </p>
      </div>

      {/* 탭 */}
      {!isTutor && (
        <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
          {TABS.map(({ key, label, badge }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}>
              {label}
              {(badge ?? 0) > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab===key?"bg-accent text-white":"bg-accent/20 text-accent"}`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 튜터 탭 네비게이션 */}
      {isTutor && (
        <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
          {([
            { key: "received" as const, label: "받은 요청",  badge: tutorMatchings.filter(m=>m.status==="pending").length },
            { key: "lessons"  as const, label: "수업 요청",  badge: lessonRequests.filter(r=>r.status==="pending").length },
            { key: "schedule" as const, label: "스케줄 관리", badge: 0 },
            { key: "revenue"  as const, label: "수익 관리",   badge: 0 },
          ]).map(({ key, label, badge }) => (
            <button key={key} onClick={() => setTutorTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                tutorTab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}>
              {label}
              {badge > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tutorTab===key?"bg-accent text-white":"bg-accent/20 text-accent"}`}>
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
        <div className="bg-card rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className={`${COL} px-5 py-3 bg-muted/60 border-b border-border`}>
            <span/><span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide self-center">요청 정보</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide self-center">상태</span><span className="w-4"/>
          </div>
          {sentMatchings.map((m, i) => {
            const isAccepted = m.status === "accepted";
            const tutor = TUTORS.find((t) => t.name === m.tutor);
            return (
              <div key={m.id}
                className={`${COL} px-5 py-4 transition-colors ${i!==sentMatchings.length-1?"border-b border-border":""} ${isAccepted?"cursor-pointer hover:bg-muted/40":"hover:bg-muted/20"}`}
                onClick={isAccepted ? () => onOpenBooking(m.id) : undefined}>
                {tutor?.avatar
                  ? <img src={tutor.avatar} alt={m.tutor} className="w-11 h-11 rounded-full object-cover"/>
                  : <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center"><GraduationCap size={18} className="text-primary"/></div>}
                <div className="min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-foreground">{m.tutor}</p>
                    <span className="px-2 py-0.5 bg-muted rounded-full text-[11px] text-muted-foreground">{m.subject}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.date} · {m.time}</p>
                  <div className="mt-1.5 max-w-xs" onClick={(e)=>e.stopPropagation()}><ExpandableMessage text={m.message}/></div>
                </div>
                <div className="flex items-center h-11"><StatusBadge status={m.status}/></div>
                <div className="flex items-center h-11">{isAccepted?<ChevronRight size={15} className="text-primary"/>:<span className="w-4"/>}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════
          레슨 예약 탭 (학생) — 캘린더 상 / 목록 하
      ══════════════════════════════ */}
      {!isTutor && activeTab === "bookings" && (
        <div className="space-y-4">
          {/* 캘린더 */}
          <MiniCalendar
            events={bookingEvents}
            selectedDate={bookingSelDate}
            onSelectDate={(d) => setBookingSelDate(d)}
            onClickDate={(d) => { setBookingSelDate(d); setBookingPopup(d); }}
          />

          {/* 범례 */}
          <div className="flex items-center gap-4 px-1">
            <Legend cls="bg-primary/15 text-primary" label="예약 확정"/>
            <Legend cls="bg-amber-100 text-amber-700" label="대기 중"/>
          </div>

          {/* 전체 목록 */}
          <div className="bg-card rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="px-5 py-3 border-b border-border bg-muted/60">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">전체 예약 목록</p>
            </div>
            {lessonBookings.length === 0
              ? <p className="text-center text-sm text-muted-foreground py-10">아직 예약한 레슨이 없습니다.</p>
              : lessonBookings.map((b, i) => (
                <div key={b.id} className={`grid grid-cols-[44px_1fr_110px_70px_90px] items-center gap-x-4 px-5 py-4 hover:bg-muted/20 transition-colors ${i!==lessonBookings.length-1?"border-b border-border":""}`}>
                  <img src={b.avatar} alt={b.tutor} className="w-11 h-11 rounded-full object-cover"/>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-foreground">{b.tutor}</p>
                      <span className="px-2 py-0.5 bg-muted rounded-full text-[11px] text-muted-foreground">{b.subject}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{fmtDate(b.lessonDate, b.lessonDay)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{b.startTime} – {b.endTime}</p>
                    <p className="text-[11px] text-muted-foreground">1시간</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">{b.price.toLocaleString()}원</p>
                  <BookingStatusBadge status={b.status}/>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          결제 탭 (학생) — 캘린더 상 / 목록 하
      ══════════════════════════════ */}
      {!isTutor && activeTab === "payments" && (
        <div className="space-y-4">
          {/* 캘린더 */}
          <MiniCalendar
            events={paymentEvents}
            selectedDate={paymentSelDate}
            onSelectDate={(d) => setPaymentSelDate(d)}
            onClickDate={(d) => { setPaymentSelDate(d); setPaymentPopup(d); }}
          />

          {/* 범례 */}
          <div className="flex items-center gap-4 px-1">
            <Legend cls="bg-emerald-100 text-emerald-700" label="결제 완료"/>
            <Legend cls="bg-amber-100 text-amber-700" label="미결제"/>
          </div>

          {/* 전체 결제 목록 */}
          <div className="bg-card rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="px-5 py-3 border-b border-border bg-muted/60">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">전체 결제 내역</p>
            </div>
            <div className="grid grid-cols-[44px_1fr_auto_auto_120px] items-center gap-x-4 px-5 py-2.5 border-b border-border bg-muted/30">
              <span/>
              <span className="text-[11px] font-semibold text-muted-foreground">수업 정보</span>
              <span className="text-[11px] font-semibold text-muted-foreground">일시</span>
              <span className="text-[11px] font-semibold text-muted-foreground">금액</span>
              <span className="text-[11px] font-semibold text-muted-foreground">결제 상태</span>
            </div>
            {payments.map((p, i) => (
              <div key={p.id}
                className={`grid grid-cols-[44px_1fr_auto_auto_120px] items-center gap-x-4 px-5 py-4 transition-colors ${i!==payments.length-1?"border-b border-border":""} ${p.status==="unpaid"?"hover:bg-muted/20":""}`}>
                <img src={p.avatar} alt={p.tutor} className="w-11 h-11 rounded-full object-cover"/>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-foreground">{p.tutor}</p>
                    <span className="px-2 py-0.5 bg-muted rounded-full text-[11px] text-muted-foreground">{p.subject}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-foreground flex items-center gap-1 justify-end">
                    <Calendar size={11} className="text-muted-foreground"/> {fmtDate(p.lessonDate, p.lessonDay)}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
                    <Clock size={11}/> {p.startTime} – {p.endTime}
                  </p>
                </div>
                <p className="text-sm font-bold text-foreground whitespace-nowrap">{p.price.toLocaleString()}원</p>
                <div className="flex justify-start">
                  {p.status === "paid" ? (
                    <div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 size={11}/> 결제 완료
                      </span>
                      {p.paidAt && <p className="text-[10px] text-muted-foreground mt-1">{p.paidAt}</p>}
                    </div>
                  ) : (
                    <button onClick={() => setPayingItem(p)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer whitespace-nowrap">
                      <CreditCard size={13}/> 결제하기
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 미결제 배너 — 하단 고정 */}
          {unpaidCount > 0 && (
            <div className="flex items-center justify-between gap-3 bg-accent/10 border border-accent/20 rounded-2xl px-5 py-4">
              <div>
                <p className="text-sm font-bold text-accent">미결제 수업 {unpaidCount}건</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  미결제 금액: <span className="font-semibold text-foreground">{payments.filter(p=>p.status==="unpaid").reduce((s,p)=>s+p.price,0).toLocaleString()}원</span>
                </p>
              </div>
              <button
                onClick={() => {
                  const first = payments.find(p => p.status === "unpaid");
                  if (first) setPayingItem(first);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <CreditCard size={15}/> 전체 결제
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════
          받은 요청 탭 (튜터)
      ══════════════════════════════ */}
      {isTutor && tutorTab === "received" && (
        <div className="bg-card rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          {/* 헤더 — 액션 열 없음 */}
          <div className="grid grid-cols-[44px_1fr_90px_20px] items-center gap-x-4 px-5 py-3 bg-muted/60 border-b border-border">
            <span/>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">요청 정보</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">상태</span>
            <span/>
          </div>

          {tutorMatchings.map((m, i) => {
            const isPending  = m.status === "pending";
            const isAccepted = m.status === "accepted";
            const isClickable = isPending || isAccepted;

            const handleRowClick = () => {
              if (isPending)  setApproveModalTarget(m);
              if (isAccepted) onOpenStudentDetail(m.id);
            };

            return (
              <div
                key={m.id}
                onClick={isClickable ? handleRowClick : undefined}
                className={`grid grid-cols-[44px_1fr_90px_20px] items-start gap-x-4 px-5 py-4 transition-colors ${
                  i !== tutorMatchings.length - 1 ? "border-b border-border" : ""
                } ${isClickable ? "cursor-pointer hover:bg-muted/40" : "hover:bg-muted/10"}`}
              >
                {/* 아바타 */}
                <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center">
                  <User size={18} className="text-primary" />
                </div>

                {/* 정보 */}
                <div className="min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-foreground">{m.student}</p>
                    <span className="px-2 py-0.5 bg-muted rounded-full text-[11px] text-muted-foreground">{m.subject}</span>
                    {isAccepted && m.lessonFee && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[11px] font-semibold">
                        {m.lessonFee.toLocaleString()}원/회
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.date} · {m.time}</p>
                  <div className="mt-1.5 max-w-xs" onClick={(e) => e.stopPropagation()}>
                    <ExpandableMessage text={m.message} />
                  </div>
                </div>

                {/* 상태 */}
                <div className="flex items-center h-11">
                  <StatusBadge status={m.status} />
                </div>

                {/* Chevron */}
                <div className="flex items-center h-11">
                  {isClickable
                    ? <ChevronRight size={15} className="text-muted-foreground" />
                    : <span />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════
          수업 요청 탭 (튜터) — 캘린더 + 목록
      ══════════════════════════════ */}
      {isTutor && tutorTab === "lessons" && (() => {
        const reqEvents: CalEvent[] = lessonRequests.map((r) => ({
          date: r.lessonDate,
          label: `${r.startTime} ${r.student}`,
          color: r.status === "confirmed" ? "green" : r.status === "rejected" ? "red" : "amber",
        }));

        const reqDateItems = lessonReqSelDate
          ? lessonRequests
              .filter((r) => r.lessonDate === lessonReqSelDate)
              .map((r) => ({
                avatar: "",
                tutor: r.student,
                subject: r.subject,
                startTime: r.startTime,
                endTime: r.endTime,
                badge: r.status === "confirmed"
                  ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"><CheckCircle2 size={11}/> 승인됨</span>
                  : r.status === "rejected"
                    ? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">거절됨</span>
                    : <button onClick={() => setLessonReqModal(r)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer whitespace-nowrap">
                        검토하기
                      </button>,
              }))
          : [];

        return (
          <div className="space-y-4">
            {/* 캘린더 */}
            <MiniCalendar
              events={reqEvents}
              selectedDate={lessonReqSelDate}
              onSelectDate={(d) => { setLessonReqSelDate(d); }}
              onClickDate={(d) => { setLessonReqSelDate(d); setLessonReqPopup(d); }}
            />

            {/* 범례 */}
            <div className="flex items-center gap-4 px-1">
              <Legend cls="bg-emerald-100 text-emerald-700" label="승인됨"/>
              <Legend cls="bg-amber-100 text-amber-700" label="대기 중"/>
              <Legend cls="bg-red-100 text-red-600" label="거절됨"/>
            </div>

            {/* 전체 목록 */}
            <div className="bg-card rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <div className="px-5 py-3 border-b border-border bg-muted/60">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">전체 수업 요청</p>
              </div>
              <div className="grid grid-cols-[44px_1fr_auto_100px_20px] items-center gap-x-4 px-5 py-2.5 bg-muted/30 border-b border-border">
                <span/>
                <span className="text-[11px] font-semibold text-muted-foreground">학생 정보</span>
                <span className="text-[11px] font-semibold text-muted-foreground">수업 일시</span>
                <span className="text-[11px] font-semibold text-muted-foreground">상태</span>
                <span/>
              </div>
              {lessonRequests.length === 0
                ? <p className="text-center text-sm text-muted-foreground py-10">수업 요청이 없습니다.</p>
                : lessonRequests.map((r, i) => {
                    const isPending = r.status === "pending";
                    return (
                      <div
                        key={r.id}
                        onClick={isPending ? () => setLessonReqModal(r) : undefined}
                        className={`grid grid-cols-[44px_1fr_auto_100px_20px] items-center gap-x-4 px-5 py-4 transition-colors ${
                          i !== lessonRequests.length - 1 ? "border-b border-border" : ""
                        } ${isPending ? "cursor-pointer hover:bg-muted/40" : "hover:bg-muted/10"}`}
                      >
                        {/* 아이콘 */}
                        <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center">
                          <User size={18} className="text-primary" />
                        </div>
                        {/* 학생 정보 */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-foreground">{r.student}</p>
                            <span className="px-2 py-0.5 bg-muted rounded-full text-[11px] text-muted-foreground">{r.subject}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">요청: {r.requestedAt}</p>
                        </div>
                        {/* 일시 */}
                        <div className="text-right">
                          <p className="text-xs font-semibold text-foreground flex items-center gap-1 justify-end">
                            <Calendar size={11} className="text-muted-foreground"/> {fmtDate(r.lessonDate, r.lessonDay)}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
                            <Clock size={11}/> {r.startTime} – {r.endTime}
                          </p>
                        </div>
                        {/* 상태 */}
                        <BookingStatusBadge status={r.status} />
                        {/* Chevron */}
                        <div className="flex items-center justify-end">
                          {isPending ? <ChevronRight size={15} className="text-muted-foreground" /> : <span />}
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </div>
        );
      })()}

      {/* ══════════════════════════════
          스케줄 관리 탭 (튜터)
      ══════════════════════════════ */}
      {isTutor && tutorTab === "schedule" && <SchedulePage />}

      {/* ══════════════════════════════
          수익 관리 탭 (튜터)
      ══════════════════════════════ */}
      {isTutor && tutorTab === "revenue" && <TutorRevenuePanel />}

      {/* 레슨 예약 날짜 팝업 */}
      {bookingPopup && (() => {
        const WDAYS = ["일","월","화","수","목","금","토"];
        const [py, pm, pd] = bookingPopup.split("-").map(Number);
        const dow = WDAYS[new Date(bookingPopup).getDay()];
        const items = lessonBookings.filter((b) => b.lessonDate === bookingPopup && b.status !== "rejected");
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={() => setBookingPopup(null)}
          >
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                  <p className="text-sm font-bold text-foreground">레슨 예약</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{py}년 {pm}월 {pd}일 ({dow})</p>
                </div>
                <button onClick={() => setBookingPopup(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <span className="text-muted-foreground text-lg leading-none">×</span>
                </button>
              </div>
              {items.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">이 날은 예약된 레슨이 없습니다.</p>
              ) : (
                items.map((b, i) => (
                  <div key={b.id} className={`flex items-center gap-4 px-5 py-4 ${i !== items.length - 1 ? "border-b border-border" : ""}`}>
                    <img src={b.avatar} alt={b.tutor} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-foreground">{b.tutor}</p>
                        <span className="px-2 py-0.5 bg-muted rounded-full text-[11px] text-muted-foreground">{b.subject}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock size={11}/> {b.startTime} – {b.endTime}
                      </p>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })()}

      {/* 결제 날짜 팝업 */}
      {paymentPopup && (() => {
        const WDAYS = ["일","월","화","수","목","금","토"];
        const [py, pm, pd] = paymentPopup.split("-").map(Number);
        const dow = WDAYS[new Date(paymentPopup).getDay()];
        const items = payments.filter((p) => p.lessonDate === paymentPopup);
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={() => setPaymentPopup(null)}
          >
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                  <p className="text-sm font-bold text-foreground">결제</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{py}년 {pm}월 {pd}일 ({dow})</p>
                </div>
                <button onClick={() => setPaymentPopup(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <span className="text-muted-foreground text-lg leading-none">×</span>
                </button>
              </div>
              {items.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">이 날은 수업 내역이 없습니다.</p>
              ) : (
                items.map((p, i) => (
                  <div key={p.id} className={`px-5 py-4 ${i !== items.length - 1 ? "border-b border-border" : ""}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <img src={p.avatar} alt={p.tutor} className="w-10 h-10 rounded-full object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-foreground">{p.tutor}</p>
                          <span className="px-2 py-0.5 bg-muted rounded-full text-[11px] text-muted-foreground">{p.subject}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Clock size={11}/> {p.startTime} – {p.endTime}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-foreground shrink-0">{p.price.toLocaleString()}원</p>
                    </div>
                    {p.status === "paid" ? (
                      <div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                          <CheckCircle2 size={11}/> 결제 완료
                        </span>
                        {p.paidAt && <p className="text-[10px] text-muted-foreground mt-1">{p.paidAt}</p>}
                      </div>
                    ) : (
                      <button
                        onClick={() => { setPayingItem(p); setPaymentPopup(null); }}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                      >
                        <CreditCard size={13}/> 결제하기
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })()}

      {/* 수업 요청 날짜 팝업 */}
      {lessonReqPopup && (() => {
        const WDAYS = ["일","월","화","수","목","금","토"];
        const [py, pm, pd] = lessonReqPopup.split("-").map(Number);
        const dow = WDAYS[new Date(lessonReqPopup).getDay()];
        const items = lessonRequests.filter((r) => r.lessonDate === lessonReqPopup);
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={() => setLessonReqPopup(null)}
          >
            <div
              className="bg-card rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                  <p className="text-sm font-bold text-foreground">수업 요청</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{py}년 {pm}월 {pd}일 ({dow})</p>
                </div>
                <button
                  onClick={() => setLessonReqPopup(null)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <span className="text-muted-foreground text-lg leading-none">×</span>
                </button>
              </div>

              {/* 요청 목록 */}
              {items.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">이 날은 수업 요청이 없습니다.</p>
              ) : (
                items.map((r, i) => (
                  <div
                    key={r.id}
                    className={`px-5 py-4 ${i !== items.length - 1 ? "border-b border-border" : ""}`}
                  >
                    {/* 학생 + 과목 */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          <User size={15} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{r.student}</p>
                          <span className="text-[11px] text-muted-foreground">{r.subject}</span>
                        </div>
                      </div>
                      {r.status === "confirmed"
                        ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 shrink-0"><CheckCircle2 size={11}/> 승인됨</span>
                        : r.status === "rejected"
                          ? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600 shrink-0">거절됨</span>
                          : <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 shrink-0">대기 중</span>
                      }
                    </div>
                    {/* 시간 */}
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Clock size={11}/> {r.startTime} – {r.endTime}
                    </p>
                    {/* 메시지 */}
                    {r.message && (
                      <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 mt-2 leading-relaxed">{r.message}</p>
                    )}
                    {/* 검토 버튼 */}
                    {r.status === "pending" && (
                      <button
                        onClick={() => { setLessonReqModal(r); setLessonReqPopup(null); }}
                        className="mt-3 w-full py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors cursor-pointer"
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

      {/* 결제 모달 */}
      {payingItem && (
        <PaymentModal
          item={payingItem}
          onClose={() => setPayingItem(null)}
          onPaid={(id) => { handlePaid(id); setTimeout(() => setPayingItem(null), 1800); }}
        />
      )}

      {/* 승인 / 거절 모달 */}
      {approveModalTarget && (
        <ApproveRejectModal
          matching={approveModalTarget}
          onClose={() => setApproveModalTarget(null)}
          onApprove={(id) => {
            onApproveMatching(id);
            setApproveModalTarget(null);
          }}
          onReject={(id) => {
            onRejectMatching(id);
            setApproveModalTarget(null);
          }}
        />
      )}

      {/* 수업 요청 승인/거절 모달 */}
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
              prev.map((r) => r.id === id ? { ...r, status: "confirmed" } : r)
            );
            setLessonReqModal(null);
          }}
          onReject={(id) => {
            setLessonRequests((prev) =>
              prev.map((r) => r.id === id ? { ...r, status: "rejected" } : r)
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
      <span className={`w-3 h-3 rounded-sm ${cls}`}/>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
