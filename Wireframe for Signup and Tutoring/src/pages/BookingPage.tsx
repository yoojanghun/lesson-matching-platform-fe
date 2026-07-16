import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Star, MapPin, Video, Clock, CheckCircle2 } from "lucide-react";
import { TUTORS, MY_MATCHINGS_STUDENT } from "../data/mockData";

interface Props {
  matchingId: number;
  onBack: () => void;
  onConfirm: () => void;
}

// 요일 헤더
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 튜터별 예약 불가 날짜 (mock: 오늘 기준 특정 날짜)
const UNAVAILABLE_DAYS = [3, 7, 14, 21, 28];

// 30분 단위 슬롯 — available: 예약 가능 여부
const TIME_SLOTS = [
  { time: "09:00", available: false },
  { time: "09:30", available: false },
  { time: "10:00", available: true  },
  { time: "10:30", available: true  },
  { time: "11:00", available: true  },
  { time: "11:30", available: true  },
  { time: "12:00", available: false },
  { time: "12:30", available: false },
  { time: "13:00", available: true  },
  { time: "13:30", available: true  },
  { time: "14:00", available: true  },
  { time: "14:30", available: true  },
  { time: "15:00", available: false },
  { time: "15:30", available: false },
  { time: "16:00", available: true  },
  { time: "16:30", available: true  },
  { time: "17:00", available: true  },
  { time: "17:30", available: true  },
  { time: "18:00", available: true  },
  { time: "18:30", available: true  },
  { time: "19:00", available: false },
  { time: "19:30", available: false },
];

/** HH:MM → "오전/오후 H시 M분" 한국어 표기 */
function toKoreanTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h < 12 ? "오전" : "오후";
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${period} ${displayH}시` : `${period} ${displayH}시 ${m}분`;
}

/** HH:MM에 30분 더한 시간 문자열 반환 */
function addHour(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const total = h * 60 + m + 60;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function BookingPage({ matchingId, onBack, onConfirm }: Props) {
  const matching = MY_MATCHINGS_STUDENT.find((m) => m.id === matchingId) ?? MY_MATCHINGS_STUDENT[0];
  const tutor = TUTORS.find((t) => t.name === matching.tutor) ?? TUTORS[0];

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const cells = buildCalendar(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
    setSelectedDay(null);
    setSelectedTime(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
    setSelectedDay(null);
    setSelectedTime(null);
  };

  const isPast = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  };
  const isUnavailable = (day: number) => UNAVAILABLE_DAYS.includes(day);

  const handleDayClick = (day: number) => {
    if (isPast(day) || isUnavailable(day)) return;
    setSelectedDay(day);
    setSelectedTime(null);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      onConfirm();
    }, 1800);
  };

  const monthLabel = `${calYear}년 ${calMonth + 1}월`;
  const selectedDateLabel = selectedDay
    ? `${calYear}년 ${calMonth + 1}월 ${selectedDay}일 (${WEEKDAYS[new Date(calYear, calMonth, selectedDay).getDay()]})`
    : null;

  if (confirmed) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground">예약 신청 완료!</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {tutor.name} 튜터에게 예약 신청이 전송되었습니다.<br />
          튜터 확정 후 알림을 드릴게요.
        </p>
        <p className="text-xs text-muted-foreground">잠시 후 이동합니다...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft size={15} /> 내 매칭으로
      </button>

      <div>
        <h2 className="text-xl font-bold text-foreground">레슨 예약</h2>
        <p className="text-sm text-muted-foreground mt-1">원하는 날짜와 시간을 선택하세요</p>
      </div>

      {/* ── 튜터 간단 소개 ── */}
      <div className="bg-card border border-border rounded-2xl p-5 flex gap-4">
        <img
          src={tutor.avatar}
          alt={tutor.name}
          className="w-16 h-16 rounded-xl object-cover bg-muted shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-foreground">{tutor.name} 튜터</p>
              <p className="text-xs text-muted-foreground mt-0.5">{tutor.subject}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-primary">{tutor.price.toLocaleString()}원</p>
              <p className="text-xs text-muted-foreground">/시간</p>
            </div>
          </div>
          {/* rating */}
          <div className="flex items-center gap-1 mt-1.5">
            {[1,2,3,4,5].map((n) => (
              <Star
                key={n}
                size={12}
                className={n <= Math.round(tutor.rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
              />
            ))}
            <span className="text-xs font-semibold ml-0.5">{tutor.rating}</span>
            <span className="text-xs text-muted-foreground">({tutor.reviews})</span>
          </div>
          {/* meta */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-xs text-muted-foreground">
            {tutor.location && (
              <span className="flex items-center gap-1"><MapPin size={11} />{tutor.location}</span>
            )}
            {tutor.onlineAvailable && (
              <span className="flex items-center gap-1"><Video size={11} />온라인 가능</span>
            )}
            {tutor.responseTime && (
              <span className="flex items-center gap-1"><Clock size={11} />응답 {tutor.responseTime}</span>
            )}
          </div>
          <p className="text-xs text-foreground mt-2 line-clamp-2 leading-relaxed">{tutor.intro}</p>
        </div>
      </div>

      {/* ── 캘린더 ── */}
      <div className="bg-card border border-border rounded-2xl p-5">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-bold text-foreground">{monthLabel}</span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d, i) => (
            <div
              key={d}
              className={`text-center text-xs font-semibold py-1 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-muted-foreground"}`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} />;

            const past = isPast(day);
            const unavail = isUnavailable(day);
            const disabled = past || unavail;
            const selected = selectedDay === day;
            const dow = (idx) % 7;

            return (
              <button
                key={idx}
                onClick={() => handleDayClick(day)}
                disabled={disabled}
                className={`
                  relative h-9 w-full rounded-lg text-sm font-medium transition-all
                  ${disabled ? "text-muted-foreground/40 cursor-not-allowed" : "cursor-pointer"}
                  ${selected
                    ? "bg-primary text-primary-foreground"
                    : disabled
                      ? ""
                      : dow === 0
                        ? "text-red-500 hover:bg-red-50"
                        : dow === 6
                          ? "text-blue-500 hover:bg-blue-50"
                          : "text-foreground hover:bg-secondary"
                  }
                `}
              >
                {day}
                {/* 오늘 표시 */}
                {!selected && day === today.getDate() && calYear === today.getFullYear() && calMonth === today.getMonth() && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                )}
                {/* 불가 표시 */}
                {unavail && !past && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-muted-foreground/40" />
                )}
              </button>
            );
          })}
        </div>

        {/* 범례 */}
        <div className="flex gap-4 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent inline-block" /> 오늘
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40 inline-block" /> 예약 불가
          </span>
        </div>
      </div>

      {/* ── 시간 선택 — 30분 단위 타임라인 ── */}
      {selectedDay && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-1">
            {selectedDateLabel} — 시간 선택
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            30분 단위로 레슨 시작 시간을 선택하세요. 선택 시 1시간이 예약됩니다.
          </p>

          <div className="overflow-x-auto pb-1">
            <div style={{ minWidth: "560px" }}>
              {/* 정시 레이블 — 매 1시간마다 */}
              <div className="relative h-5 mb-1">
                {TIME_SLOTS.filter((_, i) => i % 2 === 0).map(({ time }) => {
                  const idx = TIME_SLOTS.findIndex((s) => s.time === time);
                  const leftPct = (idx / TIME_SLOTS.length) * 100;
                  return (
                    <span
                      key={time}
                      className="absolute text-[11px] text-muted-foreground -translate-x-1/2"
                      style={{ left: `${leftPct}%` }}
                    >
                      {time.endsWith(":00")
                        ? (() => {
                            const h = parseInt(time);
                            return h < 12 ? `${h}시` : h === 12 ? "12시" : `${h - 12}시`;
                          })()
                        : ""}
                    </span>
                  );
                })}
              </div>

              {/* 슬롯 블록 */}
              <div className="flex gap-0.5">
                {TIME_SLOTS.map(({ time, available }, idx) => {
                  // 1시간 = 연속 2칸 모두 available해야 시작 가능
                  const nextAvail = TIME_SLOTS[idx + 1]?.available ?? false;
                  const canSelect = available && nextAvail;

                  // 선택 여부: 시작 칸(selectedTime) 또는 그 다음 칸(selectedTime의 +1)
                  const isStart = selectedTime === time;
                  const isEnd   = idx > 0 && selectedTime === TIME_SLOTS[idx - 1].time;
                  const isSelected = isStart || isEnd;

                  return (
                    <button
                      key={time}
                      disabled={!canSelect && !isEnd}
                      onClick={() => {
                        if (!canSelect) return;
                        setSelectedTime(isStart ? null : time);
                      }}
                      title={canSelect ? `${time} 시작 (1시간)` : "선택 불가"}
                      className={[
                        "flex-1 h-10 transition-all",
                        // 첫 칸 왼쪽 라운드, 마지막 칸 오른쪽 라운드
                        idx === 0 ? "rounded-l-md" : idx === TIME_SLOTS.length - 1 ? "rounded-r-md" : "",
                        !available
                          ? "bg-[#d9d9d9] cursor-not-allowed"
                          : isSelected
                            ? "bg-primary cursor-pointer"
                            : canSelect
                              ? "bg-[#b3d9f5] hover:bg-[#8dc8ef] cursor-pointer"
                              : "bg-[#b3d9f5]/50 cursor-not-allowed",
                      ].join(" ")}
                    />
                  );
                })}
              </div>

              {/* 선택된 시간 표시 */}
              {selectedTime && (
                <p className="mt-3 text-sm font-semibold text-primary text-center">
                  {toKoreanTime(selectedTime)} ~ {toKoreanTime(addHour(selectedTime))} (1시간)
                </p>
              )}

              {/* 범례 */}
              <div className="flex gap-5 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-3 rounded-sm bg-[#d9d9d9] inline-block" /> 마감
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-3 rounded-sm bg-[#b3d9f5] inline-block" /> 예약 가능
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-3 rounded-sm bg-primary inline-block" /> 선택됨 (1시간)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 예약 확인 패널 ── */}
      {selectedDay && selectedTime && (
        <div className="bg-card border border-primary/30 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground">예약 정보 확인</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: "튜터", value: `${tutor.name} 튜터` },
              { label: "악기 / 과목", value: tutor.subject },
              { label: "날짜", value: selectedDateLabel ?? "" },
              { label: "시간", value: selectedTime ? `${toKoreanTime(selectedTime)} ~ ${toKoreanTime(addHour(selectedTime))} (1시간)` : "" },
              { label: "레슨비", value: `${tutor.price.toLocaleString()}원` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 text-xs text-muted-foreground">
            예약 신청 후 튜터가 확정해야 최종 예약이 완료됩니다.
          </div>
          <button
            onClick={handleConfirm}
            className="w-full py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={15} /> 예약 신청하기
          </button>
        </div>
      )}
    </div>
  );
}
