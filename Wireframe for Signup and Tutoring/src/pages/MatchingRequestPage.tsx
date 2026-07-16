import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { TUTORS } from "../data/mockData";

interface Props {
  tutorId: number;
  onBack: () => void;
  onSubmit: () => void;
}

export default function MatchingRequestPage({ tutorId, onBack, onSubmit }: Props) {
  const tutor = TUTORS.find((t) => t.id === tutorId) ?? TUTORS[0];
  const [message, setMessage] = useState("");

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <ArrowLeft size={14} /> 튜터 상세로
      </button>

      <div>
        <h2 className="text-xl font-bold text-foreground">레슨 매칭 요청</h2>
        <p className="text-sm text-muted-foreground mt-1">{tutor.name} 튜터에게 레슨을 요청합니다</p>
      </div>

      {/* Tutor summary */}
      <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
        <img src={tutor.avatar} alt={tutor.name} className="w-11 h-11 rounded-full object-cover bg-muted" />
        <div>
          <p className="text-sm font-semibold text-foreground">{tutor.name}</p>
          <p className="text-xs text-muted-foreground">{tutor.subject} · {tutor.price.toLocaleString()}원/시간</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        {[
          { label: "원하는 요일/시간", placeholder: "예: 주말 오후 2~4시" },
          { label: "목표 / 수준", placeholder: "예: 수능 대비, 기초부터 시작" },
        ].map(({ label, placeholder }) => (
          <div key={label}>
            <label className="block text-xs font-semibold text-foreground mb-1.5">{label}</label>
            <input
              className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors"
              placeholder={placeholder}
            />
          </div>
        ))}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">튜터에게 한마디</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors resize-none"
            rows={4}
            placeholder="원하는 수업 방식이나 특이사항을 알려주세요..."
          />
          <p className="text-right text-xs text-muted-foreground mt-1">{message.length}/300</p>
        </div>
        <button
          onClick={onSubmit}
          className="w-full py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Send size={15} /> 매칭 요청 보내기
        </button>
      </div>
    </div>
  );
}
