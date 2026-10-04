'use client';

import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Star, Video, Clock, CheckCircle2 } from "lucide-react";
import { useCreateBookingMutation } from "../hooks/queries/useBookings";
import { useTutorDetailQuery } from "../hooks/queries/useTutors";
import { formatScheduleDate, useTutorScheduleQuery } from "../hooks/queries/useSchedules";
import type { StudentMatching } from "../types";

interface Props {
  matchingId: number;
  matching: StudentMatching;
  onBack: () => void;
  onConfirm: () => void;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const TIME_SLOTS = Array.from({ length: 32 }, (_, index) => {
  const minutes = 7 * 60 + index * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

function toKoreanTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h < 12 ? "오전" : "오후";
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${period} ${displayH}시` : `${period} ${displayH}시 ${m}분`;
}

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

export default function BookingPage({ matchingId, matching, onBack, onConfirm }: Props) {
  const createBookingMutation = useCreateBookingMutation();

  const tutorId = matching.tutorId;
  const { data: tutorData } = useTutorDetailQuery(tutorId ?? 0);

  const tutorName = tutorData?.name ?? matching.tutor;
  const tutorSubject = tutorData?.subject ?? matching.subject;
  const tutorPrice = tutorData?.price ?? 0;
  const tutorRating = tutorData?.rating ?? 0;
  const tutorReviews = tutorData?.reviews ?? 0;
  const tutorAvatar = tutorData?.avatar ?? '';
  const tutorOnline = tutorData?.onlineAvailable ?? false;
  const tutorIntro = tutorData?.intro ?? '';

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const scheduleStartDate = new Date(calYear, calMonth, 1);
  const scheduleEndDate = new Date(calYear, calMonth + 1, 0);
  const { data: tutorSchedule, isLoading: scheduleLoading } = useTutorScheduleQuery(
    tutorId,
    scheduleStartDate,
    scheduleEndDate
  );

  const cells = buildCalendar(calYear, calMonth);

  const getSlotMinutes = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
  };

  const overlaps = (startTime: string, endTime: string, otherStart: string, otherEnd: string) =>
    getSlotMinutes(startTime) < getSlotMinutes(otherEnd) &&
    getSlotMinutes(endTime) > getSlotMinutes(otherStart);

  const getAvailableSlots = (day: number) => {
    const date = new Date(calYear, calMonth, day);
    const dateString = formatScheduleDate(date);
    const dayOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][date.getDay()];
    const schedules = tutorSchedule?.weeklySchedules.filter((schedule) => schedule.dayOfWeek === dayOfWeek) ?? [];
    const exceptions = tutorSchedule?.scheduleExceptions.filter((exception) => exception.exceptionDate === dateString) ?? [];
    const reservations = tutorSchedule?.reservedSlots.filter((reservation) => reservation.lessonDate === dateString) ?? [];

    return TIME_SLOTS.map((time) => {
      const endTime = addHour(time);
      const inWeeklySchedule = schedules.some((schedule) =>
        getSlotMinutes(time) >= getSlotMinutes(schedule.startTime) &&
        getSlotMinutes(endTime) <= getSlotMinutes(schedule.endTime)
      );
      const blockedByException = exceptions.some((exception) =>
        exception.exceptionType === "UNAVAILABLE" && overlaps(time, endTime, exception.startTime, exception.endTime)
      );
      const reserved = reservations.some((reservation) =>
        overlaps(time, endTime, reservation.startTime, reservation.endTime)
      );

      return { time, available: inWeeklySchedule && !blockedByException && !reserved };
    });
  };

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalYear((y) => y - 1);
      setCalMonth(11);
    } else {
      setCalMonth((m) => m - 1);
    }
    setSelectedDay(null);
    setSelectedTime(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) {
      setCalYear((y) => y + 1);
      setCalMonth(0);
    } else {
      setCalMonth((m) => m + 1);
    }
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
  const handleDayClick = (day: number) => {
    if (isPast(day)) return;
    setSelectedDay(day);
    setSelectedTime(null);
  };

  const handleConfirm = () => {
    if (!selectedDay || !selectedTime) return;
    setBookingError(null);

    const pad = (n: number) => String(n).padStart(2, "0");
    const dateStr = `${calYear}-${pad(calMonth + 1)}-${pad(selectedDay)}`;
    const dayOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][
      new Date(calYear, calMonth, selectedDay).getDay()
    ];
    const endTime = addHour(selectedTime);

    if (!matching.tutorId) return;
    createBookingMutation.mutate({
      matchingId,
      tutorId: matching.tutorId,
      date: dateStr,
      requestMsg: matching.message,
      dayOfWeek,
      startTime: selectedTime,
      endTime,
    }, {
      onSuccess: () => {
        setConfirmed(true);
        setTimeout(() => onConfirm(), 1800);
      },
      onError: (error) => {
        const responseMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
        setBookingError(responseMessage ?? '예약 신청에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      },
    });
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
          {tutorName} 튜터에게 예약 신청이 전송되었습니다.<br />
          튜터 확정 후 알림을 드릴게요.
        </p>
        <p className="text-xs text-muted-foreground">잠시 후 이동합니다...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 py-4">
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

      {/* 튜터 간단 소개 */}
      <div className="bg-card border border-border rounded-2xl p-5 flex gap-4 shadow-sm">
        {tutorAvatar ? (
          <img
            src={tutorAvatar}
            alt={tutorName}
            className="w-16 h-16 rounded-xl object-cover bg-muted shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-primary">{tutorName?.[0] ?? '?'}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-foreground">{tutorName} 튜터</p>
              <p className="text-xs text-muted-foreground mt-0.5">{tutorSubject}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-primary">{tutorPrice > 0 ? `${tutorPrice.toLocaleString()}원` : '가격 협의'}</p>
              <p className="text-xs text-muted-foreground">/시간</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={12}
                className={
                  n <= Math.round(tutorRating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-gray-200 text-gray-200"
                }
              />
            ))}
            <span className="text-xs font-semibold ml-0.5">{tutorRating > 0 ? tutorRating.toFixed(1) : '-'}</span>
            <span className="text-xs text-muted-foreground">({tutorReviews})</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-xs text-muted-foreground">
            {tutorOnline && (
              <span className="flex items-center gap-1">
                <Video size={11} />
                온라인 가능
              </span>
            )}
          </div>
          {tutorIntro && (
            <p className="text-xs text-foreground mt-2 line-clamp-2 leading-relaxed">{tutorIntro}</p>
          )}
        </div>
      </div>

      {/* 캘린더 */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
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

        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d, i) => (
            <div
              key={d}
              className={`text-center text-xs font-semibold py-1 ${
                i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-muted-foreground"
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} />;

            const past = isPast(day);
            const disabled = past;
            const selected = selectedDay === day;
            const dow = idx % 7;

            return (
              <button
                key={idx}
                onClick={() => handleDayClick(day)}
                disabled={disabled}
                className={`
                  relative h-9 w-full rounded-lg text-sm font-medium transition-all
                  ${disabled ? "text-muted-foreground/40 cursor-not-allowed" : "cursor-pointer"}
                  ${
                    selected
                      ? "bg-primary text-primary-foreground font-bold"
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
                {!selected &&
                  day === today.getDate() &&
                  calYear === today.getFullYear() &&
                  calMonth === today.getMonth() && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                  )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-4 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent inline-block" /> 오늘
          </span>
        </div>
      </div>

      {/* 시간 선택 */}
      {selectedDay && (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-1">
            {selectedDateLabel} — 시간 선택
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            30분 단위로 레슨 시작 시간을 선택하세요. 선택 시 1시간이 예약됩니다.
          </p>

          <div className="overflow-x-auto pb-1">
            <div style={{ minWidth: "560px" }}>
              {scheduleLoading && (
                <p className="mb-3 text-xs text-muted-foreground">튜터의 스케줄을 불러오는 중입니다.</p>
              )}
              {!scheduleLoading && !tutorSchedule && (
                <p className="mb-3 text-xs text-red-600">튜터의 스케줄을 불러오지 못했습니다.</p>
              )}
              {(() => {
                const timeSlots = getAvailableSlots(selectedDay);
                return (
                <>
              <div className="relative h-5 mb-1">
                {timeSlots.filter((_, i) => i % 2 === 0).map(({ time }, idx) => {
                  const leftPct = (idx * 2 / timeSlots.length) * 100;
                  return (
                    <span
                      key={time}
                      className="absolute text-[11px] text-muted-foreground -translate-x-1/2"
                      style={{ left: `${leftPct}%` }}
                    >
                      {(() => {
                        const h = parseInt(time);
                        return h < 12 ? `${h}시` : h === 12 ? "12시" : `${h - 12}시`;
                      })()}
                    </span>
                  );
                })}
              </div>

              <div className="flex gap-0.5">
                {timeSlots.map(({ time, available }, idx) => {
                  const nextAvail = timeSlots[idx + 1]?.available ?? false;
                  const canSelect = available && nextAvail;

                  const isStart = selectedTime === time;
                  const isEnd = idx > 0 && selectedTime === timeSlots[idx - 1].time;
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
                </>
                );
              })()}

              {selectedTime && (
                <p className="mt-3 text-sm font-semibold text-primary text-center">
                  {toKoreanTime(selectedTime)} ~ {toKoreanTime(addHour(selectedTime))} (1시간)
                </p>
              )}

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

      {/* 예약 확인 패널 */}
      {selectedDay && selectedTime && (
        <div className="bg-card border border-primary/30 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-foreground">예약 정보 확인</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: "튜터", value: `${tutorName} 튜터` },
              { label: "악기 / 과목", value: tutorSubject },
              { label: "날짜", value: selectedDateLabel ?? "" },
              {
                label: "시간",
                value: selectedTime
                  ? `${toKoreanTime(selectedTime)} ~ ${toKoreanTime(addHour(selectedTime))} (1시간)`
                  : "",
              },
              { label: "레슨비", value: tutorPrice > 0 ? `${tutorPrice.toLocaleString()}원` : '가격 협의' },
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
          {bookingError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700">
              {bookingError}
            </p>
          )}
          <button
            onClick={handleConfirm}
            disabled={createBookingMutation.isPending || !matching.tutorId}
            className="w-full py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <CheckCircle2 size={15} /> {createBookingMutation.isPending ? '예약 신청 중...' : '예약 신청하기'}
          </button>
        </div>
      )}
    </div>
  );
}
