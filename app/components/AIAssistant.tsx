'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Send, Sparkles, Star, ChevronRight, RotateCcw } from "lucide-react";
import { TUTORS } from "../data/mockData";
import type { Tutor } from "../types";

type MsgRole = "user" | "ai";

interface TutorCard {
  tutor: Tutor;
  reason: string;
}

interface AiMessage {
  id: number;
  role: MsgRole;
  text: string;
  time: string;
  tutorCards?: TutorCard[];
  quickReplies?: string[];
}

const QUICK_QUESTIONS = [
  "초보자도 피아노 배울 수 있나요?",
  "레슨 취소·환불 정책이 궁금해요",
  "재즈 기타 강사 추천해 줘",
  "매칭 절차가 어떻게 되나요?",
  "보컬 레슨 비용은 얼마인가요?",
  "온라인 레슨도 가능한가요?",
];

function buildAiResponse(query: string): Omit<AiMessage, "id" | "role" | "time"> {
  const q = query.toLowerCase();

  const subjectKeywords: { keywords: string[]; subject: string; ids: number[] }[] = [
    { keywords: ["피아노", "piano", "재즈 피아노", "클래식 피아노"], subject: "피아노", ids: [1, 8] },
    { keywords: ["기타", "guitar", "통기타", "핑거스타일", "재즈 기타", "우쿨렐레"], subject: "기타", ids: [2] },
    { keywords: ["바이올린", "violin", "비올라"], subject: "바이올린", ids: [3] },
    { keywords: ["첼로", "cello"], subject: "첼로", ids: [4] },
    { keywords: ["보컬", "노래", "발성", "vocal", "singing"], subject: "보컬", ids: [5] },
    { keywords: ["드럼", "drum", "타악기"], subject: "드럼", ids: [6] },
    { keywords: ["작곡", "편곡", "미디", "composition", "logic pro", "ableton"], subject: "작곡", ids: [7] },
  ];

  for (const { keywords, subject, ids } of subjectKeywords) {
    if (keywords.some((k) => q.includes(k))) {
      const matched = TUTORS.filter((t) => ids.includes(t.id));
      const reasons: Record<number, string> = {
        1: "서울대 출신, 초급부터 입시까지 체계적인 커리큘럼 보유",
        2: "버클리음대 출신, 통기타·핑거스타일·팝 전문, 초보 환영",
        3: "예술의전당 연주자 출신, 콩쿠르 준비 및 취미 레슨 가능",
        4: "한국예술종합학교 졸업, 재즈첼로까지 폭넓은 장르 지도",
        5: "SM엔터 출신 보컬트레이너, 발성 교정 전문",
        6: "전직 세션 드러머, 록·재즈·그루브 스타일 지도",
        7: "Logic Pro·Ableton 전문, 싱어송라이터 과정 운영",
        8: "재즈피아노 전공, 클래식부터 즉흥연주까지 폭넓은 지도",
      };

      const locationMatch = q.includes("강남") || q.includes("서울");
      const beginnerMatch = q.includes("초보") || q.includes("입문") || q.includes("처음") || q.includes("기초");

      let text = `**${subject} 강사 추천** 결과입니다 🎵\n\n`;
      text += `RAG 시스템이 강사 프로필 데이터베이스를 검색한 결과,`;
      if (beginnerMatch) text += " **초보자 친화적인** 강사를";
      if (locationMatch) text += " **서울 지역** 강사를";
      text += ` ${matched.length}명 찾았습니다.`;

      return {
        text,
        tutorCards: matched.map((t) => ({ tutor: t, reason: reasons[t.id] ?? t.intro })),
        quickReplies: ["레슨비가 궁금해요", "온라인 수업도 되나요?", "매칭 신청 방법 알려줘"],
      };
    }
  }

  if (q.includes("취소") || q.includes("환불") || q.includes("cancel")) {
    return {
      text:
        `**레슨 취소 및 환불 정책** 안내 📋\n\n` +
        `| 취소 시점 | 환불 기준 |\n` +
        `|-----------|----------|\n` +
        `| 레슨 **48시간 전** | 100% 전액 환불 |\n` +
        `| 레슨 **24시간 전** | 50% 환불 |\n` +
        `| 레슨 **당일** | 환불 불가 |\n\n` +
        `⚠️ 단, 강사 귀책 사유로 인한 취소는 **100% 환불** 처리됩니다.\n` +
        `환불은 영업일 기준 3~5일 내 원결제 수단으로 처리됩니다.`,
      quickReplies: ["매칭 절차가 궁금해요", "결제 방법 알려줘", "분쟁 발생 시 어떻게 하나요?"],
    };
  }

  if (q.includes("매칭") || q.includes("신청") || q.includes("절차") || q.includes("방법")) {
    return {
      text:
        `**레슨 매칭 절차** 안내 🔄\n\n` +
        `**1단계** 🔍 튜터 찾기\n강사 목록에서 원하는 악기·스타일의 튜터를 선택하세요.\n\n` +
        `**2단계** 📝 매칭 요청\n강사 프로필에서 '레슨 매칭 요청하기'를 클릭해 메시지와 함께 신청합니다.\n\n` +
        `**3단계** ✅ 강사 승인\n강사가 요청을 검토 후 승인/거절합니다. (평균 응답 1~2시간)\n\n` +
        `**4단계** 📅 레슨 예약\n승인 후 '내 매칭 → 레슨 예약'에서 날짜와 시간을 선택하세요.\n\n` +
        `**5단계** 💳 결제\n레슨 후 '내 매칭 → 결제' 탭에서 결제를 완료합니다.`,
      quickReplies: ["강사 추천해 줘", "취소·환불 정책이 궁금해요", "결제 방법 알려줘"],
    };
  }

  if (q.includes("결제") || q.includes("비용") || q.includes("가격") || q.includes("얼마")) {
    return {
      text:
        `**결제 안내** 💳\n\n` +
        `TutorMatch에서 지원하는 결제 수단은 다음과 같습니다:\n\n` +
        `• 신용카드 / 체크카드 (국내 전 카드사)\n` +
        `• 카카오페이 · 토스페이 (간편결제)\n` +
        `• 무통장 입금 (영업일 기준 처리)\n\n` +
        `**레슨비 범위:** 25,000원 ~ 55,000원 / 60분\n` +
        `체험 수업은 정가 대비 **20~30% 할인** 적용됩니다.\n\n` +
        `💡 레슨 후 '내 매칭 → 결제' 탭에서 개별 수업별로 결제할 수 있습니다.`,
      quickReplies: ["환불 정책 알려줘", "강사 추천해 줘", "매칭 신청 방법은?"],
    };
  }

  if (q.includes("온라인") || q.includes("비대면") || q.includes("화상")) {
    return {
      text:
        `**온라인 레슨 안내** 💻\n\n` +
        `TutorMatch의 많은 강사분들이 **온라인(화상) 레슨**을 지원합니다!\n\n` +
        `✅ 온라인 가능 강사 필터: 강사 목록 상단 '온라인 가능' 태그로 확인\n` +
        `📱 화상 도구: Zoom · Google Meet · 카카오톡 영상통화 중 협의\n` +
        `🌍 지역 제한 없이 전국 어디서나 수강 가능\n\n` +
        `현재 온라인 레슨 가능 강사: **박민준 (기타)**, **최유나 (보컬)**, **송지은 (작곡)** 등`,
      quickReplies: ["온라인 강사 추천해 줘", "결제는 어떻게 하나요?", "취소 정책 알려줘"],
    };
  }

  if (q.includes("초보") || q.includes("입문") || q.includes("처음") || q.includes("기초")) {
    return {
      text:
        `**초보자 레슨 안내** 🌱\n\n` +
        `TutorMatch의 모든 강사는 **초보자 맞춤 커리큘럼**을 제공합니다!\n\n` +
        `악기를 처음 잡아보는 분도 걱정 마세요:\n` +
        `• 첫 수업 전 **무료 상담** (30분) 진행\n` +
        `• 수준 진단 후 맞춤 커리큘럼 설계\n` +
        `• **체험 수업** 으로 부담 없이 시작 가능\n\n` +
        `어떤 악기를 배우고 싶으신가요? 맞춤 강사를 추천해 드릴게요! 🎵`,
      quickReplies: ["피아노 강사 추천", "기타 강사 추천", "보컬 강사 추천", "드럼 강사 추천"],
    };
  }

  if (q.includes("분쟁") || q.includes("문제") || q.includes("불만") || q.includes("신고")) {
    return {
      text:
        `**분쟁 처리 안내** ⚖️\n\n` +
        `레슨 진행 중 문제가 발생하면:\n\n` +
        `1. **채팅**으로 강사와 직접 소통을 먼저 시도해 주세요.\n` +
        `2. 해결되지 않으면 **고객센터**에 신고 접수 (24시간 이내 답변)\n` +
        `3. 운영팀 검토 후 귀책 판단 → 환불 또는 중재 진행\n\n` +
        `📧 고객센터: support@tutormatch.kr\n` +
        `📞 운영시간: 평일 09:00 ~ 18:00`,
      quickReplies: ["환불 정책 알려줘", "매칭 절차 알려줘"],
    };
  }

  if (q.includes("안녕") || q.includes("hello") || q.includes("hi") || q.length < 6) {
    return {
      text:
        `안녕하세요! 👋 TutorMatch AI 어시스턴트입니다.\n\n` +
        `저는 **RAG 기반 AI**로, 강사 프로필 데이터베이스와 플랫폼 FAQ를 실시간으로 검색해 최적의 답변을 드립니다.\n\n` +
        `다음과 같은 것들을 도와드릴 수 있어요:`,
      quickReplies: ["강사 추천해 줘", "매칭 절차 알려줘", "취소·환불 정책", "초보자도 가능한가요?"],
    };
  }

  return {
    text:
      `질문 내용을 좀 더 구체적으로 말씀해 주시면 더 정확한 답변을 드릴 수 있어요 😊\n\n` +
      `아래 빠른 질문을 이용하시거나, 배우고 싶은 악기나 궁금한 사항을 자유롭게 입력해 주세요.`,
    quickReplies: ["피아노 강사 추천", "취소·환불 정책", "매칭 절차 알려줘", "초보자도 가능한가요?"],
  };
}

function RenderText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("| ") && line.endsWith("|")) {
          const cells = line.split("|").filter((c) => c.trim());
          return (
            <div
              key={i}
              className={`flex gap-2 text-xs ${i === 1 ? "border-b border-current opacity-30" : ""}`}
            >
              {cells.map((c, ci) => (
                <span key={ci} className={`${ci === 0 ? "w-32 font-medium" : "flex-1"}`}>
                  {c.trim()}
                </span>
              ))}
            </div>
          );
        }
        const bold = line.replace(/\*\*(.+?)\*\*/g, (_, m) => `__BOLD__${m}__END__`);
        const parts = bold.split(/(__BOLD__|__END__)/);
        let isBold = false;
        return (
          <p key={i} className="text-sm leading-relaxed">
            {parts.map((p, pi) => {
              if (p === "__BOLD__") {
                isBold = true;
                return null;
              }
              if (p === "__END__") {
                isBold = false;
                return null;
              }
              return isBold ? <strong key={pi} className="font-bold">{p}</strong> : p;
            })}
          </p>
        );
      })}
    </div>
  );
}

function TutorRecommendCard({
  tutor,
  reason,
  onView,
}: {
  tutor: Tutor;
  reason: string;
  onView: () => void;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-3 flex items-start gap-3 shadow-sm">
      <img src={tutor.avatar} alt={tutor.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-foreground">{tutor.name} 튜터</p>
          <span className="flex items-center gap-0.5 text-xs text-amber-500 font-semibold">
            <Star size={10} className="fill-amber-400" />
            {tutor.rating}
          </span>
          {tutor.available && (
            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
              수업 가능
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {tutor.subject} · {tutor.price.toLocaleString()}원/시간
        </p>
        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{reason}</p>
        <button
          onClick={onView}
          className="mt-2 flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
        >
          프로필 보기 <ChevronRight size={11} />
        </button>
      </div>
    </div>
  );
}

let msgId = 1;
function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const WELCOME: AiMessage = {
  id: msgId++,
  role: "ai",
  text: "안녕하세요! 👋 TutorMatch AI 어시스턴트입니다.\n\nRAG 기반으로 강사 데이터베이스와 플랫폼 FAQ를 실시간 검색해 답변해 드립니다.\n\n무엇이든 편하게 물어보세요!",
  time: "10:00",
  quickReplies: QUICK_QUESTIONS.slice(0, 4),
};

export default function AIAssistant() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const sendQuery = (query: string) => {
    if (!query.trim() || thinking) return;
    const userMsg: AiMessage = { id: msgId++, role: "user", text: query, time: nowTime() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setThinking(true);

    const delay = 800 + Math.random() * 600;
    setTimeout(() => {
      const res = buildAiResponse(query);
      setMessages((p) => [...p, { id: msgId++, role: "ai", time: nowTime(), ...res }]);
      setThinking(false);
    }, delay);
  };

  const reset = () => {
    setMessages([{ ...WELCOME, id: msgId++, time: nowTime() }]);
    setInput("");
  };

  return (
    <>
      {/* 채팅 패널 */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden transition-all duration-300 origin-bottom-right ${
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"
        }`}
        style={{ height: "520px" }}
      >
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-none">TutorMatch AI</p>
              <p className="text-[11px] opacity-75 mt-0.5">RAG 기반 · 24/7 어시스턴트</p>
            </div>
            <button
              onClick={reset}
              title="대화 초기화"
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer opacity-70 hover:opacity-100"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer opacity-70 hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-muted/10">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
              >
                {msg.role === "ai" && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={13} className="text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] space-y-2 ${
                    msg.role === "user" ? "items-end" : "items-start"
                  } flex flex-col`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card border border-border rounded-bl-sm shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
                    }`}
                  >
                    {msg.role === "ai" ? <RenderText text={msg.text} /> : <p className="text-sm">{msg.text}</p>}
                  </div>

                  {msg.tutorCards && msg.tutorCards.length > 0 && (
                    <div className="w-full space-y-2">
                      {msg.tutorCards.map(({ tutor, reason }) => (
                        <TutorRecommendCard
                          key={tutor.id}
                          tutor={tutor}
                          reason={reason}
                          onView={() => {
                            router.push(`/tutors/${tutor.id}`);
                            setOpen(false);
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {msg.quickReplies && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.quickReplies.map((q) => (
                        <button
                          key={q}
                          onClick={() => sendQuery(q)}
                          className="px-2.5 py-1 bg-secondary text-primary rounded-full text-[11px] font-semibold hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] text-muted-foreground px-1" suppressHydrationWarning>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {thinking && (
              <div className="flex gap-2 items-end">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles size={13} className="text-primary" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                  <div className="flex gap-1 items-center h-4">
                    <span className="text-[11px] text-muted-foreground mr-1">답변 생성 중</span>
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* 입력창 */}
          <div className="px-4 py-3 border-t border-border bg-card shrink-0">
            <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendQuery(input)}
                placeholder="질문을 입력하세요..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
              />
              <button
                onClick={() => sendQuery(input)}
                disabled={!input.trim() || thinking}
                className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                  input.trim() && !thinking
                    ? "text-primary hover:bg-primary/10 cursor-pointer"
                    : "text-muted-foreground/40 cursor-not-allowed"
                }`}
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-1.5">
              AI 답변은 참고용이며 실제 정책과 다를 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 플로팅 AI 챗봇 버튼 (기존 채팅 아이콘 바로 위) */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 cursor-pointer border-2 border-white/20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:scale-105 ${
          open ? "opacity-0 scale-75 pointer-events-none" : "opacity-100 scale-100"
        }`}
        title="AI 챗봇과 대화하기"
      >
        <Sparkles size={22} className="text-white" />
      </button>
    </>
  );
}
