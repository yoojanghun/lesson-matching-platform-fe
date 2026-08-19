'use client';

import { useState } from "react";
import { X, User, BookOpen, Clock, MessageSquare, CheckCircle2, XCircle } from "lucide-react";

interface MatchingLike {
  id: number;
  student: string;
  subject: string;
  date: string;
  time: string;
  message: string;
}

interface Props {
  matching: MatchingLike;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

export default function ApproveRejectModal({ matching, onClose, onApprove, onReject }: Props) {
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  const handleApprove = () => {
    setAction("approve");
    setTimeout(() => {
      onApprove(matching.id);
      onClose();
    }, 900);
  };

  const handleReject = () => {
    setAction("reject");
    setTimeout(() => {
      onReject(matching.id);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-border">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h3 className="text-base font-bold text-foreground">레슨 요청 검토</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* 학생 정보 */}
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
        </div>

        {/* 버튼 */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleReject}
            disabled={action !== null}
            className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
              action === "reject"
                ? "bg-red-500 text-white border-red-500"
                : action === "approve"
                ? "opacity-40 bg-card text-muted-foreground border-border"
                : "bg-card text-red-500 border-red-200 hover:bg-red-50"
            }`}
          >
            <XCircle size={15} />
            {action === "reject" ? "거절됨" : "거절"}
          </button>
          <button
            onClick={handleApprove}
            disabled={action !== null}
            className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
              action === "approve"
                ? "bg-emerald-500 text-white"
                : action === "reject"
                ? "opacity-40 bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <CheckCircle2 size={15} />
            {action === "approve" ? "승인됨" : "승인"}
          </button>
        </div>
      </div>
    </div>
  );
}
