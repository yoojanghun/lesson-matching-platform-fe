import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Area, AreaChart,
} from "recharts";
import { TrendingUp, TrendingDown, BookOpen, CreditCard, Users } from "lucide-react";

/* ── 목 데이터 ── */
const MONTHLY_2026 = [
  { month: "1월",  revenue: 420000, lessons: 12 },
  { month: "2월",  revenue: 385000, lessons: 11 },
  { month: "3월",  revenue: 490000, lessons: 14 },
  { month: "4월",  revenue: 525000, lessons: 15 },
  { month: "5월",  revenue: 560000, lessons: 16 },
  { month: "6월",  revenue: 610000, lessons: 17 },
  { month: "7월",  revenue: 595000, lessons: 17 },
  { month: "8월",  revenue: 245000, lessons: 7  },
];

const YEARLY = [
  { year: "2023", revenue: 3800000 },
  { year: "2024", revenue: 5200000 },
  { year: "2025", revenue: 6100000 },
  { year: "2026", revenue: 3830000 },
];

/* ── 색상 (프로젝트 palette 기반) ── */
const C_PRIMARY = "#1e3a5f";
const C_ACCENT  = "#e05a2b";
const C_MUTED   = "#6b748a";
const C_GRID    = "rgba(30,58,95,0.08)";

function fmt(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `${Math.round(v / 1_000)}K`;
  return String(v);
}

function fmtWon(v: number) {
  return v.toLocaleString() + "원";
}

/* ── 커스텀 툴팁 ── */
function ChartTooltip({ active, payload, label, unit = "원" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2.5 shadow-lg text-xs">
      <p className="font-bold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value.toLocaleString()}{unit}
        </p>
      ))}
    </div>
  );
}

/* ── 통계 타일 ── */
function StatTile({
  icon: Icon, label, value, sub, trend,
}: {
  icon: React.ElementType; label: string; value: string; sub: string; trend?: "up" | "down";
}) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
          <Icon size={17} className="text-primary" />
        </div>
        {trend && (
          trend === "up"
            ? <span className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600"><TrendingUp size={12}/> 전월 대비</span>
            : <span className="flex items-center gap-0.5 text-[11px] font-semibold text-red-500"><TrendingDown size={12}/> 전월 대비</span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground mt-2 leading-none">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}

/* ── 메인 ── */
export default function TutorRevenuePanel() {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");

  const totalThis  = MONTHLY_2026.reduce((s, d) => s + d.revenue, 0);
  const totalLessons = MONTHLY_2026.reduce((s, d) => s + d.lessons, 0);
  const avgPerLesson = Math.round(totalThis / totalLessons);
  const prevMonthRev = MONTHLY_2026[MONTHLY_2026.length - 2].revenue;
  const thisMonthRev = MONTHLY_2026[MONTHLY_2026.length - 1].revenue;
  const trend = thisMonthRev >= prevMonthRev ? "up" : "down";

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground">수익 관리</h3>
          <p className="text-xs text-muted-foreground mt-0.5">2026년 누적 기준</p>
        </div>
        {/* 기간 토글 */}
        <div className="flex gap-1 bg-muted p-1 rounded-xl">
          {(["monthly", "yearly"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                period === p ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}>
              {p === "monthly" ? "월간" : "연간"}
            </button>
          ))}
        </div>
      </div>

      {/* 통계 타일 4개 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile icon={CreditCard} label="2026년 누적 수익" value={fmt(totalThis) + "원"} sub={fmtWon(totalThis)} trend={trend} />
        <StatTile icon={BookOpen}   label="총 레슨 횟수"    value={`${totalLessons}회`}    sub="2026년 1~8월" />
        <StatTile icon={TrendingUp} label="레슨당 평균 수익" value={fmt(avgPerLesson) + "원"} sub={fmtWon(avgPerLesson)} />
        <StatTile icon={Users}      label="이번 달 수익"    value={fmt(thisMonthRev) + "원"} sub="2026년 8월" trend={trend} />
      </div>

      {/* 월간 수익 바 차트 */}
      {period === "monthly" && (
        <div className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5">
          <p className="text-sm font-bold text-foreground mb-1">월별 수익 (2026)</p>
          <p className="text-xs text-muted-foreground mb-4">월별 레슨 수익 합계</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_2026} barSize={28} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={C_GRID} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C_MUTED }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: C_MUTED }} axisLine={false} tickLine={false} width={42} />
              <Tooltip content={<ChartTooltip unit="원" />} cursor={{ fill: "rgba(30,58,95,0.05)" }} />
              <Bar dataKey="revenue" name="수익" fill={C_PRIMARY} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 연간 수익 에어리어 차트 */}
      {period === "yearly" && (
        <div className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5">
          <p className="text-sm font-bold text-foreground mb-1">연간 수익 추이</p>
          <p className="text-xs text-muted-foreground mb-4">연도별 총 수익 변화 (2026년은 8월까지 누적)</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={YEARLY} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={C_PRIMARY} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={C_PRIMARY} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={C_GRID} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: C_MUTED }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: C_MUTED }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<ChartTooltip unit="원" />} cursor={{ stroke: C_PRIMARY, strokeWidth: 1, strokeDasharray: "4 2" }} />
              <Area dataKey="revenue" name="연간 수익" stroke={C_PRIMARY} strokeWidth={2} fill="url(#revGrad)" dot={{ r: 5, fill: C_PRIMARY, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 월별 레슨 수 라인 차트 (월간 뷰에서만) */}
      {period === "monthly" && (
        <div className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5">
          <p className="text-sm font-bold text-foreground mb-1">월별 레슨 횟수 (2026)</p>
          <p className="text-xs text-muted-foreground mb-4">월별 진행한 레슨 수</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={MONTHLY_2026} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={C_GRID} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C_MUTED }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C_MUTED }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<ChartTooltip unit="회" />} cursor={{ stroke: C_ACCENT, strokeWidth: 1, strokeDasharray: "4 2" }} />
              <Line dataKey="lessons" name="레슨 수" stroke={C_ACCENT} strokeWidth={2}
                dot={{ r: 4, fill: C_ACCENT, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 수익 내역 테이블 */}
      <div className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border">
          <p className="text-sm font-bold text-foreground">월별 수익 내역</p>
        </div>
        <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 px-5 py-2.5 bg-muted/40 border-b border-border">
          <span className="text-[11px] font-semibold text-muted-foreground">월</span>
          <span className="text-[11px] font-semibold text-muted-foreground">레슨 수</span>
          <span className="text-[11px] font-semibold text-muted-foreground">수익</span>
          <span className="text-[11px] font-semibold text-muted-foreground">레슨당 평균</span>
        </div>
        {[...MONTHLY_2026].reverse().map((d, i) => (
          <div key={d.month}
            className={`grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 px-5 py-3 ${i !== MONTHLY_2026.length - 1 ? "border-b border-border" : ""}`}>
            <span className="text-sm font-semibold text-foreground">2026년 {d.month}</span>
            <span className="text-sm text-muted-foreground text-right">{d.lessons}회</span>
            <span className="text-sm font-bold text-primary text-right">{d.revenue.toLocaleString()}원</span>
            <span className="text-sm text-foreground text-right">{Math.round(d.revenue / d.lessons).toLocaleString()}원</span>
          </div>
        ))}
      </div>
    </div>
  );
}
