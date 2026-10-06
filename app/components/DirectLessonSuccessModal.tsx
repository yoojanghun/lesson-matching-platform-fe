'use client';

import { useMemo } from 'react';
import { X, Check } from 'lucide-react';

const WDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface DirectLessonSuccessModalProps {
  studentName: string;
  date: string; // "YYYY-MM-DD"
  startTime: string;
  endTime: string;
  onClose: () => void;
}

export default function DirectLessonSuccessModal({
  studentName,
  date,
  startTime,
  endTime,
  onClose,
}: DirectLessonSuccessModalProps) {
  const dateDisplay = useMemo(() => {
    if (!date) return '';
    const [y, m, d] = date.split('-').map(Number);
    const day = WDAYS[new Date(date).getDay()];
    return `${y}년 ${m}월 ${d}일 (${day})`;
  }, [date]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        className="bg-card rounded-3xl border border-border shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="닫기"
        >
          <X size={18} />
        </button>

        {/* 녹색 원형 체크 아이콘 */}
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100/80 flex items-center justify-center mb-4 mt-2">
          <Check size={28} className="text-emerald-700 stroke-[2.5]" />
        </div>

        <h3 className="text-lg font-bold text-foreground tracking-tight">수업이 확정되었어요</h3>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          {studentName} 학생에게 새로운 수업 일정을 안내합니다.
        </p>

        {/* 확정 일정 박스 */}
        <div className="bg-muted/40 border border-border/70 rounded-2xl p-4 my-5">
          <p className="text-xs text-muted-foreground font-medium">{dateDisplay}</p>
          <p className="text-base font-bold text-[#1e3a5f] mt-1">
            {startTime} ~ {endTime}
          </p>
        </div>

        {/* 확인 버튼 */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#1e3a5f] text-white rounded-xl text-sm font-bold hover:bg-[#1e3a5f]/90 transition-colors cursor-pointer shadow-sm"
        >
          캘린더에서 확인
        </button>
      </div>
    </div>
  );
}
