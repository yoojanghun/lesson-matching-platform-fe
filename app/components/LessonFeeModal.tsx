'use client';

import { useState } from "react";
import { X, User, BookOpen, Clock, MessageSquare, CheckCircle2, CreditCard } from "lucide-react";
import type { TutorMatching } from "../types";

interface Props {
  matching: TutorMatching;
  defaultFee: number;
  onClose: () => void;
  onSave: (id: number, fee: number) => void;
}

function fmt(v: number) {
  return v.toLocaleString();
}

function parse(s: string): number {
  return parseInt(s.replace(/,/g, ""), 10) || 0;
}

export default function LessonFeeModal({ matching, defaultFee, onClose, onSave }: Props) {
  const initial = matching.lessonFee ?? defaultFee;
  const [input, setInput] = useState(fmt(initial));
  const [saved, setSaved] = useState(false);

  const fee = parse(input);
  const isValid = fee > 0;

  const handleChange = (val: string) => {
    const digits = val.replace(/\D/g, "");
    setInput(digits ? fmt(Number(digits)) : "");
  };

  const handleSave = () => {
    if (!isValid) return;
    onSave(matching.id, fee);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-border">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h3 className="text-base font-bold text-foreground">레슨비 설정</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* 학생 기본 정보 */}
          <div className="flex items-start gap-4 p-4 bg-muted/40 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <User size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-foreground">{matching.student}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BookOpen size={11} /> {matching.subject}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock size={11} /> {matching.date} · {matching.time}
                </span>
              </div>
            </div>
          </div>

          {/* 요청 메시지 */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <MessageSquare size={11} /> 요청 메시지
            </p>
            <div className="px-4 py-3 bg-muted/30 rounded-xl border border-border/60">
              <p className="text-sm text-foreground leading-relaxed">{matching.message}</p>
            </div>
          </div>

          {/* 레슨비 입력 */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <CreditCard size={11} /> 1회 레슨비 (수강생 맞춤)
            </label>
            <div
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-colors ${
                isValid ? "border-primary/40 bg-primary/5" : "border-border bg-muted/20"
              }`}
            >
              <input
                type="text"
                inputMode="numeric"
                value={input}
                onChange={(e) => handleChange(e.target.value)}
                className="flex-1 bg-transparent text-xl font-bold text-foreground outline-none placeholder:text-muted-foreground/50"
                placeholder="금액 입력"
                autoFocus
              />
              <span className="text-base font-semibold text-muted-foreground shrink-0">원</span>
            </div>
            {fee > 0 && (
              <p className="text-xs text-muted-foreground px-1">
                기본 금액 <span className="font-semibold text-foreground">{fmt(defaultFee)}원</span>에서 학생 맞춤으로
                자유롭게 수정하세요
              </p>
            )}
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="px-6 pb-6">
          <button
            onClick={handleSave}
            disabled={!isValid || saved}
            className={`w-full py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
              saved
                ? "bg-emerald-500 text-white"
                : isValid
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {saved ? (
              <>
                <CheckCircle2 size={15} /> 저장 완료!
              </>
            ) : (
              "레슨비 확정"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
