'use client';

import { useState, useMemo } from 'react';
import { X, Search, Clock, Check } from 'lucide-react';
import type { TutorMatching } from '../types';
import { useCreateDirectReservationMutation } from '../hooks/queries/useBookings';
import { useUser } from './UserContext';

const WDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 07:00 ~ 23:00 30분 단위 슬롯
const TIME_SLOTS: string[] = [];
for (let h = 7; h <= 23; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 23) TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

function formatKoreanTime(timeStr: string) {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  const period = h < 12 ? '오전' : '오후';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${period} ${String(displayH).padStart(2, '0')}:${m}`;
}

function addOneHour(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMin = h * 60 + m + 60;
  const nh = Math.floor(totalMin / 60);
  const nm = totalMin % 60;
  const result = `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
  return result > '23:00' ? '23:00' : result;
}

interface DirectLessonConfirmModalProps {
  date: string; // "YYYY-MM-DD"
  matchings: TutorMatching[];
  onClose: () => void;
  onSuccess: (info: {
    studentName: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
}

export default function DirectLessonConfirmModal({
  date,
  matchings,
  onClose,
  onSuccess,
}: DirectLessonConfirmModalProps) {
  const { showToast } = useUser();
  const createDirectReservationMutation = useCreateDirectReservationMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatchingId, setSelectedMatchingId] = useState<number | null>(() => {
    return matchings.length > 0 ? matchings[0].id : null;
  });
  const [startTime, setStartTime] = useState('15:00');
  const [endTime, setEndTime] = useState('16:00');

  // 날짜 헤더 표시: "2026년 10월 8일 (목)"
  const dateDisplay = useMemo(() => {
    if (!date) return '';
    const [y, m, d] = date.split('-').map(Number);
    const day = WDAYS[new Date(date).getDay()];
    return `${y}년 ${m}월 ${d}일 (${day})`;
  }, [date]);

  // 검색 필터링
  const filteredMatchings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchings;
    return matchings.filter(
      (m) =>
        m.student.toLowerCase().includes(q) ||
        (m.subject && m.subject.toLowerCase().includes(q))
    );
  }, [matchings, searchQuery]);

  const selectedMatching = useMemo(() => {
    return matchings.find((m) => m.id === selectedMatchingId);
  }, [matchings, selectedMatchingId]);

  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    if (endTime <= newStart) {
      setEndTime(addOneHour(newStart));
    }
  };

  const handleConfirm = () => {
    if (!selectedMatching) {
      showToast('학생을 선택해 주세요.');
      return;
    }

    if (endTime <= startTime) {
      showToast('종료 시간은 시작 시간 이후여야 합니다.');
      return;
    }

    createDirectReservationMutation.mutate(
      {
        matchingId: selectedMatching.id,
        date,
        startTime,
        endTime,
        requestMsg: `${selectedMatching.student} 학생 레슨`,
        status: 'CONFIRMED',
      },
      {
        onSuccess: () => {
          onSuccess({
            studentName: selectedMatching.student,
            date,
            startTime,
            endTime,
          });
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message ||
            '수업 확정에 실패했습니다. 중복된 일정인지 확인해 주세요.';
          showToast(msg);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        className="bg-card rounded-3xl border border-border shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 상단 헤더 */}
        <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-border/80">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">수업 직접 확정</h2>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{dateDisplay}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* 스텝 표시 */}
        <div className="flex items-center justify-center gap-3 py-4 bg-muted/20 border-b border-border/50">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-bold">
              1
            </span>
            <span>학생 선택</span>
          </div>
          <div className="w-8 h-px bg-border" />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-bold">
              2
            </span>
            <span>시간 선택</span>
          </div>
        </div>

        {/* 모달 본문 (좌우 2단 분할) */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto min-h-0 flex-1">
          {/* 왼쪽: 학생 선택 */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span className="text-sm font-bold text-foreground">학생을 선택하세요</span>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                매칭된 학생 {filteredMatchings.length}명
              </span>
            </div>

            {/* 검색창 */}
            <div className="relative mb-3">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                type="text"
                placeholder="학생 이름 또는 과목 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-primary focus:bg-background transition-colors placeholder:text-muted-foreground/70"
              />
            </div>

            {/* 학생 카드 목록 */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[300px]">
              {filteredMatchings.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  {matchings.length === 0
                    ? '매칭된 학생이 없습니다.'
                    : '검색된 학생이 없습니다.'}
                </div>
              ) : (
                filteredMatchings.map((m) => {
                  const isSelected = m.id === selectedMatchingId;
                  const firstChar = m.student ? m.student.charAt(0) : '학';
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMatchingId(m.id)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary/80 bg-primary/5 shadow-xs'
                          : 'border-border/80 hover:bg-muted/30 hover:border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {firstChar}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">
                            {m.student}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {m.subject || '레슨'}
                          </p>
                          <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">
                            최근 매칭 {m.date}
                          </p>
                        </div>
                      </div>

                      {/* 라디오 버튼 UI */}
                      <div className="shrink-0 ml-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary text-white'
                              : 'border-muted-foreground/40 bg-background'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 오른쪽: 시간 선택 */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span className="text-sm font-bold text-foreground">시간을 선택하세요</span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">수업 시간</p>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-1">시작 시간</p>
                      <div className="relative">
                        <select
                          value={startTime}
                          onChange={(e) => handleStartTimeChange(e.target.value)}
                          className="w-full py-2.5 pl-3 pr-8 text-xs font-bold bg-background border border-border rounded-xl appearance-none focus:outline-none focus:border-primary cursor-pointer"
                        >
                          {TIME_SLOTS.filter((t) => t <= '22:30').map((t) => (
                            <option key={t} value={t}>
                              {formatKoreanTime(t)}
                            </option>
                          ))}
                        </select>
                        <Clock
                          size={14}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        />
                      </div>
                    </div>

                    <span className="text-muted-foreground text-sm font-semibold pt-4">~</span>

                    <div>
                      <p className="text-[11px] text-muted-foreground mb-1">종료 시간</p>
                      <div className="relative">
                        <select
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full py-2.5 pl-3 pr-8 text-xs font-bold bg-background border border-border rounded-xl appearance-none focus:outline-none focus:border-primary cursor-pointer"
                        >
                          {TIME_SLOTS.filter((t) => t > startTime).map((t) => (
                            <option key={t} value={t}>
                              {formatKoreanTime(t)}
                            </option>
                          ))}
                        </select>
                        <Clock
                          size={14}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 확정할 수업 요약 프리뷰 박스 */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mt-6">
                  <p className="text-[11px] font-semibold text-muted-foreground">확정할 수업</p>
                  <p className="text-base font-bold text-primary mt-1">
                    {selectedMatching ? `${selectedMatching.student} 학생` : '학생을 선택하세요'}
                  </p>
                  <p className="text-xs font-medium text-foreground/80 mt-1">
                    {startTime} ~ {endTime}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 모달 하단 푸터 */}
        <div className="flex items-center justify-end gap-3 px-7 py-4 border-t border-border/80 bg-muted/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            이전
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedMatching || createDirectReservationMutation.isPending}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
          >
            {createDirectReservationMutation.isPending ? '처리 중...' : '이 일정으로 수업 확정'}
          </button>
        </div>
      </div>
    </div>
  );
}
