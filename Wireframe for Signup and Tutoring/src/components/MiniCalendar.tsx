import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CalEvent {
  date: string;       // "2026-07-14"
  label: string;      // 짧은 태그 텍스트 ex) "10:30 박민준"
  color: "green" | "blue" | "amber" | "red";
}

interface Props {
  events: CalEvent[];
  onSelectDate: (date: string | null) => void;
  selectedDate: string | null;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function pad(n: number) { return String(n).padStart(2, "0"); }
function daysInMonth(y: number, m: number) { return new Date(y, m, 0).getDate(); }
function firstDow(y: number, m: number) { return new Date(y, m - 1, 1).getDay(); }

const COLOR_MAP: Record<CalEvent["color"], string> = {
  green: "bg-emerald-100 text-emerald-700",
  blue:  "bg-primary/15 text-primary",
  amber: "bg-amber-100 text-amber-700",
  red:   "bg-red-100 text-red-600",
};

export default function MiniCalendar({ events, onSelectDate, selectedDate }: Props) {
  const today = new Date();
  const [viewY, setViewY] = useState(today.getFullYear());
  const [viewM, setViewM] = useState(today.getMonth() + 1);

  const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;

  const totalDays = daysInMonth(viewY, viewM);
  const startDow = firstDow(viewY, viewM);
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length < 42) cells.push(null);

  const eventsOnDate = (d: string) => events.filter((e) => e.date === d);

  const prev = () => { if (viewM === 1) { setViewY(viewY-1); setViewM(12); } else setViewM(viewM-1); onSelectDate(null); };
  const next = () => { if (viewM === 12) { setViewY(viewY+1); setViewM(1); } else setViewM(viewM+1); onSelectDate(null); };

  return (
    <div className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* 월 네비 */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <button onClick={prev} className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground"><ChevronLeft size={16} /></button>
        <p className="text-sm font-bold text-foreground">{viewY}년 {viewM}월</p>
        <button onClick={next} className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground"><ChevronRight size={16} /></button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((d, i) => (
          <div key={d} className={`py-1.5 text-center text-[11px] font-semibold ${i===0?"text-red-500":i===6?"text-blue-500":"text-muted-foreground"}`}>{d}</div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} className={`h-16 border-border/40 ${idx<35?"border-b":""} ${idx%7!==6?"border-r":""}`} />;

          const dateStr = `${viewY}-${pad(viewM)}-${pad(day)}`;
          const evs = eventsOnDate(dateStr);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const dow = (startDow + day - 1) % 7;

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
              className={`h-16 p-1 flex flex-col border-border/40 cursor-pointer transition-colors ${idx<35?"border-b":""} ${idx%7!==6?"border-r":""} ${isSelected?"bg-primary/5":"hover:bg-muted/40"}`}
            >
              <span className={`text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full self-start mb-0.5 ${
                isToday ? "bg-primary text-primary-foreground" :
                isSelected ? "bg-primary/20 text-primary" :
                dow===0 ? "text-red-500" : dow===6 ? "text-blue-500" : "text-foreground"
              }`}>{day}</span>
              <div className="flex flex-col gap-px overflow-hidden">
                {evs.slice(0,2).map((e, li) => (
                  <span key={li} className={`text-[9px] font-semibold px-1 py-px rounded leading-none truncate ${COLOR_MAP[e.color]}`}>
                    {e.label}
                  </span>
                ))}
                {evs.length > 2 && <span className="text-[9px] text-muted-foreground">+{evs.length-2}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
