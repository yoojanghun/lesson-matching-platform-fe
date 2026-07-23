import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, CreditCard, CheckCircle2 } from "lucide-react";
import type { PaymentItem, LessonBooking } from "../types";

interface CalendarLesson {
  date: string;      // "2026-07-14"
  day: string;       // "월"
  tutor: string;
  subject: string;
  avatar: string;
  startTime: string;
  endTime: string;
  payStatus?: "paid" | "unpaid";
  bookStatus?: "confirmed" | "pending" | "rejected";
  source: "payment" | "booking";
}

interface Props {
  payments: PaymentItem[];
  bookings: LessonBooking[];
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function isSameDate(a: string, b: string) {
  return a === b;
}

function parseYM(dateStr: string) {
  const [y, m] = dateStr.split("-").map(Number);
  return { y, m };
}

function formatHeader(y: number, m: number) {
  return `${y}년 ${m}월`;
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m, 0).getDate();
}

function firstDayOfWeek(y: number, m: number) {
  return new Date(y, m - 1, 1).getDay(); // 0=일
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function LessonCalendar({ payments, bookings }: Props) {
  const today = new Date();
  const [viewY, setViewY] = useState(today.getFullYear());
  const [viewM, setViewM] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 모든 수업을 CalendarLesson 배열로 변환
  const lessons: CalendarLesson[] = [
    ...payments.map((p) => ({
      date: p.lessonDate,
      day: p.lessonDay,
      tutor: p.tutor,
      subject: p.subject,
      avatar: p.avatar,
      startTime: p.startTime,
      endTime: p.endTime,
      payStatus: p.status,
      source: "payment" as const,
    })),
    ...bookings
      .filter((b) => b.status !== "rejected")
      .map((b) => ({
        date: b.lessonDate,
        day: b.lessonDay,
        tutor: b.tutor,
        subject: b.subject,
        avatar: b.avatar,
        startTime: b.startTime,
        endTime: b.endTime,
        bookStatus: b.status,
        source: "booking" as const,
      })),
  ];

  // 중복 제거 (같은 날짜+시간+튜터는 한 번만)
  const uniqueLessons = lessons.filter(
    (l, i, arr) =>
      arr.findIndex((x) => x.date === l.date && x.startTime === l.startTime && x.tutor === l.tutor) === i
  );

  // 이번 달 달력 생성
  const totalDays = daysInMonth(viewY, viewM);
  const startDow = firstDayOfWeek(viewY, viewM); // 0=일
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  // 6주 고정
  while (cells.length < 42) cells.push(null);

  const prevMonth = () => {
    if (viewM === 1) { setViewY(viewY - 1); setViewM(12); }
    else setViewM(viewM - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (viewM === 12) { setViewY(viewY + 1); setViewM(1); }
    else setViewM(viewM + 1);
    setSelectedDate(null);
  };

  const lessonsOnDate = (dateStr: string) =>
    uniqueLessons.filter((l) => isSameDate(l.date, dateStr));

  const selectedLessons = selectedDate ? lessonsOnDate(selectedDate) : [];

  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  return (
    <div className="space-y-4">
      {/* 월 네비게이션 */}
      <div className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground">
            <ChevronLeft size={18} />
          </button>
          <p className="text-base font-bold text-foreground">{formatHeader(viewY, viewM)}</p>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAYS.map((d, i) => (
            <div
              key={d}
              className={`py-2 text-center text-[11px] font-semibold ${
                i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-muted-foreground"
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="h-16 border-b border-r border-border/50 last:border-r-0" />;
            }
            const dateStr = `${viewY}-${pad(viewM)}-${pad(day)}`;
            const dayLessons = lessonsOnDate(dateStr);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const dow = (startDow + day - 1) % 7;
            const isSun = dow === 0;
            const isSat = dow === 6;
            const isLastRow = idx >= 35;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`h-16 p-1.5 border-border/50 cursor-pointer transition-colors relative flex flex-col ${
                  !isLastRow ? "border-b" : ""
                } ${idx % 7 !== 6 ? "border-r" : ""} ${
                  isSelected
                    ? "bg-primary/8"
                    : "hover:bg-muted/40"
                }`}
              >
                {/* 날짜 숫자 */}
                <span
                  className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full self-start ${
                    isToday
                      ? "bg-primary text-primary-foreground"
                      : isSelected
                      ? "bg-primary/20 text-primary"
                      : isSun
                      ? "text-red-500"
                      : isSat
                      ? "text-blue-500"
                      : "text-foreground"
                  }`}
                >
                  {day}
                </span>

                {/* 수업 도트/태그 */}
                <div className="flex flex-col gap-0.5 mt-0.5">
                  {dayLessons.slice(0, 2).map((l, li) => (
                    <span
                      key={li}
                      className={`text-[9px] font-semibold px-1 py-0.5 rounded leading-none truncate ${
                        l.source === "payment" && l.payStatus === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : l.source === "booking" && l.bookStatus === "confirmed"
                          ? "bg-primary/15 text-primary"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {l.startTime} {l.tutor}
                    </span>
                  ))}
                  {dayLessons.length > 2 && (
                    <span className="text-[9px] text-muted-foreground font-medium">+{dayLessons.length - 2}개</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-4 flex-wrap px-1">
        <LegendDot cls="bg-emerald-100 text-emerald-700" label="결제 완료" />
        <LegendDot cls="bg-primary/15 text-primary" label="예약 확정" />
        <LegendDot cls="bg-amber-100 text-amber-700" label="대기 중" />
      </div>

      {/* 선택된 날짜 상세 */}
      {selectedDate && (
        <div className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/40">
            <p className="text-sm font-bold text-foreground">
              {selectedDate.replace(/-/g, ".")} ({selectedDate ? WEEKDAYS[new Date(selectedDate).getDay()] : ""})
            </p>
          </div>

          {selectedLessons.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">이 날은 수업이 없습니다.</p>
          ) : (
            <div>
              {selectedLessons.map((l, i) => {
                const isPaid = l.source === "payment" && l.payStatus === "paid";
                const isConfirmed = l.source === "booking" && l.bookStatus === "confirmed";
                const isPending = (l.source === "payment" && l.payStatus === "unpaid") ||
                                  (l.source === "booking" && l.bookStatus === "pending");
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-4 px-5 py-4 ${i !== selectedLessons.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <img src={l.avatar} alt={l.tutor} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-foreground">{l.tutor}</p>
                        <span className="px-2 py-0.5 bg-muted rounded-full text-[11px] text-muted-foreground">{l.subject}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock size={11} /> {l.startTime} – {l.endTime} (1시간)
                      </p>
                    </div>
                    <div className="shrink-0">
                      {isPaid && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                          <CreditCard size={11} /> 결제 완료
                        </span>
                      )}
                      {isConfirmed && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary">
                          <CheckCircle2 size={11} /> 예약 확정
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                          대기 중
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LegendDot({ cls, label }: { cls: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded-sm ${cls}`} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
