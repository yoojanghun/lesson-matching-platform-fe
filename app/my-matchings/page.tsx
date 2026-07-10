"use client";
import { useState } from "react";
import { CheckCircle2, XCircle, GraduationCap, User } from "lucide-react";
import { MY_MATCHINGS_STUDENT, MY_MATCHINGS_TUTOR } from "../data/mockData";
import StatusBadge from "../components/StatusBadge";
import { useUser } from "../components/UserContext";

export default function MyMatchingsPage() {
  const { role } = useUser();
  const [activeTab, setActiveTab] = useState<"student" | "tutor">(role === "TUTOR" ? "tutor" : "student");
  const matchings = activeTab === "student" ? MY_MATCHINGS_STUDENT : MY_MATCHINGS_TUTOR;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">내 매칭 목록</h2>
        <p className="text-sm text-muted-foreground">레슨 매칭 요청 현황을 확인하세요</p>
      </div>

      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {(["student", "tutor"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "student" ? "보낸 요청" : "받은 요청"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {matchings.map((m) => (
          <div key={m.id} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  {activeTab === "student"
                    ? <GraduationCap size={18} className="text-primary" />
                    : <User size={18} className="text-primary" />
                  }
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {"tutor" in m ? m.tutor : m.student}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.date} · {m.time}</p>
                </div>
              </div>
              <StatusBadge status={m.status} />
            </div>
            <p className="mt-3 text-sm text-foreground bg-muted rounded-lg px-3 py-2 leading-relaxed">
              &ldquo;{m.message}&rdquo;
            </p>
            {activeTab === "tutor" && m.status === "pending" && (
              <div className="flex gap-2 mt-3">
                <button className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1 cursor-pointer">
                  <CheckCircle2 size={13} /> 승인
                </button>
                <button className="flex-1 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-1 cursor-pointer">
                  <XCircle size={13} /> 거절
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
