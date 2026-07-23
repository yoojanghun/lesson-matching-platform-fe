"use client";
import { useState } from "react";
import { Plus, Trash2, Copy, CheckCircle2, Clock, ChevronDown, ChevronUp } from "lucide-react";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;
type Day = typeof DAYS[number];

interface TimeSlot {
  id: number;
  start: string;
  end: string;
}

interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

type WeekSchedule = Record<Day, DaySchedule>;

let nextId = 1;
function newSlot(start = "10:00", end = "12:00"): TimeSlot {
  return { id: nextId++, start, end };
}

const EMPTY_WEEK: WeekSchedule = Object.fromEntries(
  DAYS.map((d) => [d, { enabled: false, slots: [] }])
) as unknown as WeekSchedule;

const INITIAL: WeekSchedule = {
  월: { enabled: true,  slots: [newSlot("10:00","13:00"), newSlot("19:00","22:00")] },
  화: { enabled: true,  slots: [newSlot("19:00","22:00")] },
  수: { enabled: false, slots: [] },
  목: { enabled: true,  slots: [newSlot("19:00","22:00")] },
  금: { enabled: true,  slots: [newSlot("10:00","13:00")] },
  토: { enabled: true,  slots: [newSlot("10:00","18:00")] },
  일: { enabled: false, slots: [] },
};

function TimeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-input-background border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-primary/50 transition-colors cursor-pointer"
    />
  );
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<WeekSchedule>(INITIAL);
  const [saved, setSaved] = useState(false);
  const [collapsedDays, setCollapsedDays] = useState<Set<Day>>(new Set());

  const toggleDay = (day: Day) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
        slots: !prev[day].enabled && prev[day].slots.length === 0
          ? [newSlot()]
          : prev[day].slots,
      },
    }));
  };

  const addSlot = (day: Day) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], slots: [...prev[day].slots, newSlot()] },
    }));
  };

  const removeSlot = (day: Day, id: number) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], slots: prev[day].slots.filter((s) => s.id !== id) },
    }));
  };

  const updateSlot = (day: Day, id: number, field: "start" | "end", value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
      },
    }));
  };

  const applyWeekdays = () => {
    const mondaySlots = schedule["월"].slots;
    const baseSlots = mondaySlots.length > 0 ? mondaySlots : [newSlot()];
    setSchedule((prev) => {
      const next = { ...prev };
      (["화", "수", "목", "금"] as Day[]).forEach((d) => {
        next[d] = {
          enabled: true,
          slots: baseSlots.map((s) => ({ ...newSlot(s.start, s.end) })),
        };
      });
      return next;
    });
  };

  const [copyToast, setCopyToast] = useState(false);
  const copyLastWeek = () => {
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2000);
  };

  const resetAll = () => setSchedule({ ...EMPTY_WEEK });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleCollapse = (day: Day) => {
    setCollapsedDays((prev) => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  };

  const activeCount = DAYS.filter((d) => schedule[d].enabled).length;
  const totalSlots = DAYS.reduce((sum, d) => sum + schedule[d].slots.length, 0);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">레슨 가능 시간 설정</h2>
          <p className="text-sm text-muted-foreground">
            요일별 반복 스케줄을 등록하면 학생에게 자동으로 예약 슬롯이 표시됩니다.
          </p>
        </div>
        {/* 요약 뱃지 */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-full text-xs font-semibold text-primary">
            <CheckCircle2 size={13} /> {activeCount}일 활성
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-xs font-semibold text-muted-foreground">
            <Clock size={13} /> 총 {totalSlots}개 슬롯
          </span>
        </div>
      </div>

      {/* 빠른 적용 툴바 */}
      <div className="flex flex-wrap gap-2 p-4 bg-card border border-border rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <p className="w-full text-xs font-semibold text-muted-foreground mb-1">빠른 일정 적용</p>
        <button
          onClick={applyWeekdays}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-primary rounded-xl text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
        >
          <Copy size={14} /> 평일(월~금) 일괄 적용
        </button>
        <button
          onClick={copyLastWeek}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-primary rounded-xl text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
        >
          <Copy size={14} /> 지난주 일정 그대로 가져오기
        </button>
        <button
          onClick={resetAll}
          className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-xl text-sm font-semibold hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer ml-auto"
        >
          <Trash2 size={14} /> 전체 초기화
        </button>
      </div>

      {/* 요일별 카드 */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        {DAYS.map((day, i) => {
          const ds = schedule[day];
          const isWeekend = day === "토" || day === "일";
          const collapsed = collapsedDays.has(day);

          return (
            <div
              key={day}
              className={i !== DAYS.length - 1 ? "border-b border-border" : ""}
            >
              {/* 요일 행 헤더 */}
              <div className="flex items-center gap-4 px-5 py-4">
                {/* 토글 스위치 */}
                <button
                  onClick={() => toggleDay(day)}
                  className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0 ${
                    ds.enabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      ds.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>

                {/* 요일 이름 */}
                <span
                  className={`w-6 text-sm font-bold shrink-0 ${
                    ds.enabled
                      ? isWeekend ? "text-accent" : "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {day}
                </span>

                {/* 슬롯 미리보기 or "레슨 없음" */}
                <div className="flex-1 flex flex-wrap gap-1.5 min-w-0">
                  {ds.enabled && ds.slots.length > 0 ? (
                    ds.slots.map((s) => (
                      <span
                        key={s.id}
                        className="px-2.5 py-0.5 bg-secondary text-primary rounded-full text-xs font-semibold"
                      >
                        {s.start} – {s.end}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {ds.enabled ? "시간 슬롯 없음" : "레슨 없는 날"}
                    </span>
                  )}
                </div>

                {/* 펼침/접기 */}
                {ds.enabled && (
                  <button
                    onClick={() => toggleCollapse(day)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
                  >
                    {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                  </button>
                )}
              </div>

              {/* 슬롯 편집 영역 */}
              {ds.enabled && !collapsed && (
                <div className="px-5 pb-4 space-y-2 border-t border-border/50 pt-3 bg-muted/20">
                  {ds.slots.map((slot) => (
                    <div key={slot.id} className="flex items-center gap-3 flex-wrap">
                      <TimeInput
                        value={slot.start}
                        onChange={(v) => updateSlot(day, slot.id, "start", v)}
                      />
                      <span className="text-sm text-muted-foreground">~</span>
                      <TimeInput
                        value={slot.end}
                        onChange={(v) => updateSlot(day, slot.id, "end", v)}
                      />
                      <button
                        onClick={() => removeSlot(day, slot.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addSlot(day)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/70 transition-colors cursor-pointer mt-1"
                  >
                    <Plus size={14} /> 시간대 추가
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {saved ? (
            <span className="flex items-center gap-2"><CheckCircle2 size={15} /> 저장되었습니다</span>
          ) : (
            "스케줄 저장"
          )}
        </button>
      </div>

      {copyToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-card px-5 py-3 rounded-xl text-sm font-medium shadow-lg z-50 flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-400" /> 지난주 일정을 불러왔습니다!
        </div>
      )}
    </div>
  );
}
