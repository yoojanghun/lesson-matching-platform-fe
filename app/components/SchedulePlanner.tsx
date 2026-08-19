"use client";

import { useState, useRef, useEffect } from "react";
import { RotateCcw, Copy, CheckCircle2, Clock } from "lucide-react";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;
type Day = typeof DAYS[number];

/* 07:00 ~ 23:00, 30분 단위 → 32 슬롯 */
const START_HOUR = 7;
const END_HOUR = 23;
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * 2; // 32
const CELL_W = 22; // px per slot
const GRID_W = TOTAL_SLOTS * CELL_W; // 704px

type WeekSlots = Record<Day, Set<number>>;

const makeEmpty = (): WeekSlots =>
  Object.fromEntries(DAYS.map((d) => [d, new Set<number>()])) as WeekSlots;

const deepCopy = (w: WeekSlots): WeekSlots =>
  Object.fromEntries(DAYS.map((d) => [d, new Set(w[d])])) as WeekSlots;

function slotTime(slot: number): string {
  const m = START_HOUR * 60 + slot * 30;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

function formatRanges(slots: Set<number>): string {
  if (!slots.size) return "선택 없음";
  const arr = [...slots].sort((a, b) => a - b);
  const out: string[] = [];
  let s = arr[0],
    p = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === p + 1) {
      p = arr[i];
    } else {
      out.push(`${slotTime(s)} – ${slotTime(p + 1)}`);
      s = p = arr[i];
    }
  }
  out.push(`${slotTime(s)} – ${slotTime(p + 1)}`);
  return out.join("  ·  ");
}

export default function SchedulePlanner() {
  const [week, setWeek] = useState<WeekSlots>(makeEmpty);
  const [saved, setSaved] = useState(false);

  const baseRef = useRef<WeekSlots | null>(null);
  const dragRef = useRef<{ day: Day; start: number; mode: "on" | "off" } | null>(null);

  useEffect(() => {
    const up = () => {
      dragRef.current = null;
      baseRef.current = null;
    };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  const onDown = (day: Day, slot: number) => {
    baseRef.current = deepCopy(week);
    const mode: "on" | "off" = week[day].has(slot) ? "off" : "on";
    dragRef.current = { day, start: slot, mode };
    setWeek((prev) => {
      const s = new Set(prev[day]);
      mode === "on" ? s.add(slot) : s.delete(slot);
      return { ...prev, [day]: s };
    });
  };

  const onEnter = (day: Day, slot: number) => {
    const d = dragRef.current;
    const b = baseRef.current;
    if (!d || !b || d.day !== day) return;
    const lo = Math.min(d.start, slot);
    const hi = Math.max(d.start, slot);
    const s = new Set(b[day]);
    for (let i = lo; i <= hi; i++) d.mode === "on" ? s.add(i) : s.delete(i);
    setWeek((prev) => ({ ...prev, [day]: s }));
  };

  const copyMonday = () => {
    const m = new Set(week["월"]);
    setWeek(Object.fromEntries(DAYS.map((d) => [d, new Set(m)])) as WeekSlots);
  };

  const reset = () => {
    setWeek(makeEmpty());
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  return (
    <div className="space-y-5">
      {/* 상단 액션 바 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-xs text-muted-foreground">
          클릭 또는 드래그로 레슨 가능 시간 선택 ·{" "}
          <span className="font-semibold text-foreground">30분 단위</span>
        </p>
        <div className="flex gap-2">
          <button
            onClick={copyMonday}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer bg-card"
          >
            <Copy size={13} /> 월요일 기준 전체 적용
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer bg-card"
          >
            <RotateCcw size={13} /> 초기화
          </button>
        </div>
      </div>

      {/* 그리드 전체 */}
      <div className="bg-card rounded-2xl border border-border shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: 48 + GRID_W + 16 }}>
            {/* 시간 헤더 */}
            <div className="flex items-end border-b border-border bg-muted/40 px-2 py-2.5">
              <div style={{ width: 48 }} className="shrink-0" />
              <div className="flex" style={{ width: GRID_W }}>
                {HOURS.map((h) => (
                  <div key={h} style={{ width: CELL_W * 2 }}>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {h}:00
                    </span>
                  </div>
                ))}
                {/* 마지막 23 레이블 */}
                <div style={{ width: CELL_W }}>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {END_HOUR}
                  </span>
                </div>
              </div>
            </div>

            {/* 요일 행 */}
            {DAYS.map((day, di) => {
              const slots = week[day];
              const hasSlots = slots.size > 0;

              return (
                <div
                  key={day}
                  className={di < DAYS.length - 1 ? "border-b border-border" : ""}
                >
                  {/* 슬롯 행 */}
                  <div className="flex items-center px-2 pt-3">
                    <div
                      style={{ width: 48 }}
                      className="shrink-0 flex items-center justify-center"
                    >
                      <span
                        className={`text-sm font-bold ${
                          hasSlots ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {day}
                      </span>
                    </div>

                    <div
                      className="flex select-none"
                      style={{ width: GRID_W, height: 36 }}
                      draggable={false}
                    >
                      {Array.from({ length: TOTAL_SLOTS }, (_, slot) => {
                        const on = slots.has(slot);
                        const prevOn = slot > 0 && slots.has(slot - 1);
                        const nextOn =
                          slot < TOTAL_SLOTS - 1 && slots.has(slot + 1);
                        const isHourBoundary = slot % 2 === 0 && slot > 0;

                        return (
                          <div
                            key={slot}
                            style={{ width: CELL_W }}
                            onMouseDown={() => onDown(day, slot)}
                            onMouseEnter={() => onEnter(day, slot)}
                            title={`${slotTime(slot)} – ${slotTime(slot + 1)}`}
                            className={[
                              "h-full cursor-pointer transition-colors shrink-0",
                              isHourBoundary ? "border-l border-border/40" : "",
                              on
                                ? [
                                    "bg-primary hover:bg-primary/85",
                                    !prevOn ? "rounded-l-sm" : "",
                                    !nextOn ? "rounded-r-sm" : "",
                                  ].join(" ")
                                : "hover:bg-primary/15",
                            ].join(" ")}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* 선택 시간 요약 */}
                  <div
                    className="flex items-center gap-1.5 pb-3 pt-1.5"
                    style={{ paddingLeft: 56 }}
                  >
                    <Clock
                      size={11}
                      className={
                        hasSlots ? "text-primary" : "text-muted-foreground"
                      }
                    />
                    <span
                      className={`text-xs ${
                        hasSlots
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatRanges(slots)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 범례 + 저장 */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">레슨 가능</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-3 rounded-full bg-muted border border-border" />
            <span className="text-xs text-muted-foreground">불가능</span>
          </div>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {saved ? (
            <>
              <CheckCircle2 size={15} /> 저장 완료!
            </>
          ) : (
            "스케줄 저장"
          )}
        </button>
      </div>
    </div>
  );
}
