import { useState, useEffect } from "react";
import {
  ArrowLeft, User, BookOpen, Calendar, Clock,
  Pencil, CheckCircle2, X, CreditCard, Plus,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { TutorMatching, TutorStudentLesson } from "../types";
import { TUTOR_STUDENT_LESSONS, TUTORS } from "../data/mockData";
import MiniCalendar, { type CalEvent } from "../components/MiniCalendar";

const C_PRIMARY = "#1e3a5f";
const C_ACCENT  = "#e05a2b";
const C_MUTED   = "#6b748a";
const C_GRID    = "rgba(30,58,95,0.08)";

function ChartTooltip({ active, payload, label, unit = "" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}{unit}
        </p>
      ))}
    </div>
  );
}

interface Props {
  matching: TutorMatching;
  onBack: () => void;
  onUpdateFee: (id: number, fee: number) => void;
}

const WDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function fmtDate(dateStr: string, day: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일 (${day})`;
}

function todayStr() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

function getDayStr(dateStr: string) {
  return WDAYS[new Date(dateStr).getDay()];
}

/* 07:00 ~ 23:00 30분 단위 슬롯 */
const TIME_SLOTS: string[] = [];
for (let h = 7; h <= 23; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 23) TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}
const START_SLOTS = TIME_SLOTS.filter((t) => t <= "22:30");

function addOneHour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const totalMin = h * 60 + m + 60;
  const nh = Math.floor(totalMin / 60);
  const nm = totalMin % 60;
  const result = `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
  return result > "23:00" ? "23:00" : result;
}


export default function TutorStudentDetailPage({ matching, onBack, onUpdateFee }: Props) {
  const baseLessons = TUTOR_STUDENT_LESSONS[matching.student] ?? [];
  const defaultFee = TUTORS[0].price;
  const currentFee = matching.lessonFee ?? defaultFee;

  const now = new Date();
  const [extraLessons, setExtraLessons] = useState<TutorStudentLesson[]>([]);
  const lessons = [...baseLessons, ...extraLessons].sort(
    (a, b) => a.lessonDate.localeCompare(b.lessonDate) || a.startTime.localeCompare(b.startTime)
  );

  const [selDate, setSelDate] = useState<string | null>(todayStr());
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1);
  const [editingFee, setEditingFee] = useState(false);
  const [feeInput, setFeeInput] = useState(currentFee.toLocaleString());

  /* 날짜 팝업 — view(상세 보기) / add(레슨 추가) 두 모드 */
  const [dayPopup, setDayPopup] = useState<{ date: string; mode: "view" | "add" } | null>(null);
  const [modalStart, setModalStart] = useState("10:00");
  const [modalEnd, setModalEnd] = useState("11:00");
  const [modalFeeInput, setModalFeeInput] = useState(currentFee.toLocaleString());
  const [modalPaid, setModalPaid] = useState(false);

  const endSlots = TIME_SLOTS.filter((t) => t > modalStart);

  useEffect(() => {
    setModalEnd(addOneHour(modalStart));
  }, [modalStart]);

  const openDayPopup = (date: string) => {
    setSelDate(date);
    setDayPopup({ date, mode: "view" });
  };

  const switchToAdd = () => {
    setModalStart("10:00");
    setModalEnd(addOneHour("10:00"));
    setModalFeeInput(currentFee.toLocaleString());
    setModalPaid(false);
    setDayPopup((p) => p ? { ...p, mode: "add" } : p);
  };

  const handleAddLesson = () => {
    if (!dayPopup) return;
    const fee = parseInt(modalFeeInput.replace(/,/g, ""), 10);
    if (!fee || fee <= 0 || modalEnd <= modalStart) return;
    const newLesson: TutorStudentLesson = {
      id: Date.now(),
      lessonDate: dayPopup.date,
      lessonDay: getDayStr(dayPopup.date),
      startTime: modalStart,
      endTime: modalEnd,
      fee,
      paid: modalPaid,
      paidAt: modalPaid
        ? new Date().toISOString().slice(0, 16).replace("T", " ")
        : undefined,
    };
    setExtraLessons((prev) => [...prev, newLesson]);
    setDayPopup((p) => p ? { ...p, mode: "view" } : p);
  };

  const calEvents: CalEvent[] = lessons.map((l) => ({
    date: l.lessonDate,
    label: `${l.startTime} 레슨`,
    color: l.paid ? "green" : "amber",
  }));

  const unpaidTotal = lessons.filter((l) => !l.paid).reduce((s, l) => s + l.fee, 0);

  const ymKey = `${calYear}-${String(calMonth).padStart(2, "0")}`;
  const monthLessons = lessons.filter((l) => l.lessonDate.startsWith(ymKey));
  const monthPaid = monthLessons.filter((l) => l.paid).length;
  const monthUnpaid = monthLessons.filter((l) => !l.paid).reduce((s, l) => s + l.fee, 0);

  const handleFeeInput = (val: string) => {
    const d = val.replace(/\D/g, "");
    setFeeInput(d ? Number(d).toLocaleString() : "");
  };

  const handleSaveFee = () => {
    const fee = parseInt(feeInput.replace(/,/g, ""), 10);
    if (fee > 0) { onUpdateFee(matching.id, fee); setEditingFee(false); }
  };

  const cancelEdit = () => {
    setFeeInput(currentFee.toLocaleString());
    setEditingFee(false);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">{matching.student} 학생</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{matching.subject}</p>
        </div>
      </div>

      {/* 학생 정보 + 레슨비 카드 */}
      <div className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 space-y-5">
        {/* 기본 정보 */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <User size={24} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-foreground">{matching.student}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BookOpen size={11} /> {matching.subject}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar size={11} /> 매칭일 {matching.date}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock size={11} /> {matching.time}
              </span>
            </div>
          </div>
        </div>

        {/* 레슨비 */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <CreditCard size={11} /> 레슨비 (1회)
            </p>
            {!editingFee && (
              <button
                onClick={() => { setFeeInput(currentFee.toLocaleString()); setEditingFee(true); }}
                className="flex items-center gap-1 text-xs text-primary font-medium hover:underline cursor-pointer"
              >
                <Pencil size={11} /> 수정
              </button>
            )}
          </div>

          {editingFee ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-4 py-3 border-2 border-primary/40 rounded-xl bg-primary/5">
                <input
                  autoFocus
                  type="text"
                  inputMode="numeric"
                  value={feeInput}
                  onChange={(e) => handleFeeInput(e.target.value)}
                  className="flex-1 bg-transparent text-xl font-bold text-foreground outline-none"
                />
                <span className="text-sm text-muted-foreground shrink-0">원</span>
              </div>
              <button
                onClick={handleSaveFee}
                className="px-4 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold cursor-pointer hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                저장
              </button>
              <button
                onClick={cancelEdit}
                className="p-3 rounded-xl border border-border hover:bg-muted cursor-pointer transition-colors"
              >
                <X size={15} className="text-muted-foreground" />
              </button>
            </div>
          ) : (
            <p className="text-2xl font-bold text-primary">
              {currentFee.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground">원 / 회</span>
            </p>
          )}
        </div>

        {/* 월별 수업 통계 — 캘린더 월 연동 */}
        <div className="pt-4 border-t border-border space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            {calYear}년 {calMonth}월 수업 현황
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-3 text-center bg-muted/40">
              <p className="text-lg font-bold text-foreground">{monthLessons.length}회</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">총 레슨</p>
            </div>
            <div className="rounded-xl p-3 text-center bg-emerald-50">
              <p className="text-lg font-bold text-emerald-700">{monthPaid}회</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">결제 완료</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${monthUnpaid > 0 ? "bg-amber-50" : "bg-muted/40"}`}>
              <p className={`text-lg font-bold ${monthUnpaid > 0 ? "text-amber-700" : "text-muted-foreground"}`}>
                {monthUnpaid > 0 ? `${monthUnpaid.toLocaleString()}원` : "없음"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">미수금</p>
            </div>
          </div>
        </div>
      </div>

      {/* 캘린더 */}
      <MiniCalendar
        events={calEvents}
        selectedDate={selDate}
        onSelectDate={setSelDate}
        onMonthChange={(y, m) => { setCalYear(y); setCalMonth(m); }}
        onClickDate={openDayPopup}
      />

      {/* 범례 */}
      <div className="flex items-center gap-4 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-100" />
          <span className="text-xs text-muted-foreground">결제 완료</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-100" />
          <span className="text-xs text-muted-foreground">미결제</span>
        </div>
      </div>

      {/* 전체 레슨 내역 */}
      <div className="bg-card rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <p className="text-sm font-bold text-foreground">레슨 전체 내역</p>
          {unpaidTotal > 0 && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              미수금 {unpaidTotal.toLocaleString()}원
            </span>
          )}
        </div>
        <div className="grid grid-cols-[1fr_auto_auto_110px] items-center gap-x-4 px-5 py-2.5 bg-muted/30 border-b border-border">
          <span className="text-[11px] font-semibold text-muted-foreground">날짜</span>
          <span className="text-[11px] font-semibold text-muted-foreground">시간</span>
          <span className="text-[11px] font-semibold text-muted-foreground">레슨비</span>
          <span className="text-[11px] font-semibold text-muted-foreground">결제 상태</span>
        </div>
        {lessons.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">레슨 내역이 없습니다.</p>
        ) : (
          [...lessons].reverse().map((l, i) => (
            <div
              key={l.id}
              className={`grid grid-cols-[1fr_auto_auto_110px] items-center gap-x-4 px-5 py-3.5 ${i !== lessons.length - 1 ? "border-b border-border" : ""}`}
            >
              <p className="text-sm font-semibold text-foreground">{fmtDate(l.lessonDate, l.lessonDay)}</p>
              <p className="text-sm text-muted-foreground whitespace-nowrap">{l.startTime} – {l.endTime}</p>
              <p className="text-sm font-bold text-foreground whitespace-nowrap">{l.fee.toLocaleString()}원</p>
              {l.paid ? (
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={11} /> 결제 완료
                  </span>
                  {l.paidAt && <p className="text-[10px] text-muted-foreground mt-0.5">{l.paidAt}</p>}
                </div>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                  미결제
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* 날짜 팝업 — view / add 두 모드 */}
      {dayPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={() => setDayPopup(null)}
        >
          <div
            className="bg-card rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 팝업 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                {dayPopup.mode === "add" && (
                  <button
                    onClick={() => setDayPopup((p) => p ? { ...p, mode: "view" } : p)}
                    className="p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer -ml-1"
                  >
                    <ArrowLeft size={15} className="text-muted-foreground" />
                  </button>
                )}
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {dayPopup.mode === "view" ? "레슨 내역" : "레슨 추가"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(() => {
                      const [y, m, d] = dayPopup.date.split("-").map(Number);
                      return `${y}년 ${m}월 ${d}일 (${getDayStr(dayPopup.date)})`;
                    })()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDayPopup(null)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>

            {/* ── VIEW 모드: 해당 날짜 레슨 목록 ── */}
            {dayPopup.mode === "view" && (() => {
              const items = lessons.filter((l) => l.lessonDate === dayPopup.date);
              return (
                <div>
                  {items.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">이 날짜의 레슨 내역이 없습니다.</p>
                  ) : (
                    items.map((l, i) => (
                      <div
                        key={l.id}
                        className={`flex items-center gap-4 px-5 py-4 ${i !== items.length - 1 ? "border-b border-border" : ""}`}
                      >
                        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          <User size={15} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground">{matching.student}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Clock size={10} /> {l.startTime} – {l.endTime}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-foreground">{l.fee.toLocaleString()}원</p>
                          {l.paid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-0.5">
                              <CheckCircle2 size={10} /> 결제 완료
                            </span>
                          ) : (
                            <span className="block text-[11px] font-semibold text-amber-600 mt-0.5">미결제</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div className="px-5 py-4 border-t border-border">
                    <button
                      onClick={switchToAdd}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      <Plus size={15} /> 레슨 추가
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* ── ADD 모드: 레슨 추가 폼 ── */}
            {dayPopup.mode === "add" && (
              <div className="p-5 space-y-4">
                {/* 시간 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">시작 시간</label>
                    <select
                      value={modalStart}
                      onChange={(e) => setModalStart(e.target.value)}
                      className="w-full px-3 py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                    >
                      {START_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">종료 시간</label>
                    <select
                      value={modalEnd}
                      onChange={(e) => setModalEnd(e.target.value)}
                      className="w-full px-3 py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                    >
                      {endSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* 레슨비 */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">레슨비</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 border border-border rounded-xl focus-within:ring-2 focus-within:ring-primary/30">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={modalFeeInput}
                      onChange={(e) => {
                        const d = e.target.value.replace(/\D/g, "");
                        setModalFeeInput(d ? Number(d).toLocaleString() : "");
                      }}
                      className="flex-1 bg-transparent text-sm font-bold text-foreground outline-none"
                    />
                    <span className="text-sm text-muted-foreground shrink-0">원</span>
                  </div>
                </div>

                {/* 결제 여부 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">결제 완료</span>
                  <button
                    onClick={() => setModalPaid((p) => !p)}
                    className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${modalPaid ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${modalPaid ? "translate-x-7" : "translate-x-1"}`} />
                  </button>
                </div>

                {/* 버튼 */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setDayPopup((p) => p ? { ...p, mode: "view" } : p)}
                    className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleAddLesson}
                    className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    확정
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 월별 차트 ── */}
      {(() => {
        /* lessons를 YYYY-MM 단위로 집계 */
        const mapOrder: string[] = [];
        const map = new Map<string, { collected: number; unpaid: number; count: number }>();
        for (const l of lessons) {
          const ym = l.lessonDate.slice(0, 7);
          if (!map.has(ym)) { map.set(ym, { collected: 0, unpaid: 0, count: 0 }); mapOrder.push(ym); }
          const cur = map.get(ym)!;
          cur.count += 1;
          if (l.paid) cur.collected += l.fee;
          else cur.unpaid += l.fee;
        }
        const chartData = mapOrder.sort().map((ym) => {
          const [, m] = ym.split("-");
          const d = map.get(ym)!;
          return { month: `${Number(m)}월`, collected: d.collected, unpaid: d.unpaid, count: d.count };
        });

        if (chartData.length === 0) return null;

        return (
          <>
            {/* 월별 수익 바 차트 */}
            <div className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5">
              <p className="text-sm font-bold text-foreground mb-0.5">월별 수익</p>
              <p className="text-xs text-muted-foreground mb-4">결제 완료 및 미수금 합계</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barSize={32} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={C_GRID} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: C_MUTED }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v) => v >= 1000 ? `${Math.round(v / 1000)}K` : String(v)}
                    tick={{ fontSize: 11, fill: C_MUTED }} axisLine={false} tickLine={false} width={40}
                  />
                  <Tooltip content={<ChartTooltip unit="원" />} cursor={{ fill: "rgba(30,58,95,0.04)" }} />
                  <Bar dataKey="collected" name="결제 완료" stackId="a" fill={C_PRIMARY} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="unpaid"    name="미수금"    stackId="a" fill={C_ACCENT}  radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              {/* 범례 */}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm" style={{ background: C_PRIMARY }} />
                  <span className="text-[11px] text-muted-foreground">결제 완료</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm" style={{ background: C_ACCENT }} />
                  <span className="text-[11px] text-muted-foreground">미수금</span>
                </div>
              </div>
            </div>

            {/* 월별 레슨 횟수 라인 차트 */}
            <div className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5">
              <p className="text-sm font-bold text-foreground mb-0.5">월별 레슨 횟수</p>
              <p className="text-xs text-muted-foreground mb-4">월별 진행한 레슨 수</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={C_GRID} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: C_MUTED }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: C_MUTED }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<ChartTooltip unit="회" />} cursor={{ stroke: C_ACCENT, strokeWidth: 1, strokeDasharray: "4 2" }} />
                  <Line
                    dataKey="count" name="레슨 수" stroke={C_ACCENT} strokeWidth={2}
                    dot={{ r: 5, fill: C_ACCENT, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        );
      })()}
    </div>
  );
}
