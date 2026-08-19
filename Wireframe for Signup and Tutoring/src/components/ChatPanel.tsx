import { useState, useRef, useEffect } from "react";
import { X, Send, MessageCircle } from "lucide-react";

interface Message {
  id: number;
  from: "me" | "tutor";
  text: string;
  time: string;
}

interface Props {
  tutorName: string;
  tutorAvatar: string;
  tutorSubject: string;
  onClose: () => void;
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const INITIAL_MESSAGES: Message[] = [
  { id: 1, from: "tutor", text: "안녕하세요! 무엇이든 편하게 질문해 주세요 😊", time: "10:00" },
];

const AUTO_REPLIES = [
  "네, 말씀하신 내용 잘 이해했습니다!",
  "좋은 질문이에요. 조금 더 자세히 설명해 드릴게요.",
  "물론이죠! 언제든지 문의 주세요.",
  "레슨 관련해서 더 궁금한 점 있으시면 말씀해 주세요.",
  "감사합니다. 빠른 시일 내에 답변 드릴게요!",
];

let msgId = 10;

export default function ChatPanel({ tutorName, tutorAvatar, tutorSubject, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const myMsg: Message = { id: msgId++, from: "me", text, time: nowTime() };
    setMessages((prev) => [...prev, myMsg]);
    setInput("");

    // 튜터 자동 응답 시뮬레이션
    setIsTyping(true);
    setTimeout(() => {
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: msgId++, from: "tutor", text: reply, time: nowTime() }]);
    }, 1200 + Math.random() * 600);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-card shrink-0">
        <div className="relative shrink-0">
          <img src={tutorAvatar} alt={tutorName} className="w-9 h-9 rounded-full object-cover" />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-card rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground leading-none">{tutorName}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{tutorSubject}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground shrink-0">
          <X size={16} />
        </button>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-muted/20">
        {messages.map((msg) =>
          msg.from === "tutor" ? (
            <div key={msg.id} className="flex items-end gap-2">
              <img src={tutorAvatar} alt={tutorName} className="w-6 h-6 rounded-full object-cover shrink-0 mb-0.5" />
              <div className="max-w-[78%]">
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
                  <p className="text-sm text-foreground leading-relaxed">{msg.text}</p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 ml-1">{msg.time}</p>
              </div>
            </div>
          ) : (
            <div key={msg.id} className="flex items-end justify-end gap-2">
              <div className="max-w-[78%]">
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-3.5 py-2.5">
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 mr-1 text-right">{msg.time}</p>
              </div>
            </div>
          )
        )}

        {/* 입력 중 인디케이터 */}
        {isTyping && (
          <div className="flex items-end gap-2">
            <img src={tutorAvatar} alt={tutorName} className="w-6 h-6 rounded-full object-cover shrink-0 mb-0.5" />
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
              <div className="flex gap-1 items-center h-4">
                {[0, 150, 300].map((delay) => (
                  <span key={delay} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="px-3 py-3 border-t border-border bg-card shrink-0">
        <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-1.5">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className={`p-1.5 rounded-lg transition-colors shrink-0 ${
              input.trim()
                ? "text-primary hover:bg-primary/10 cursor-pointer"
                : "text-muted-foreground/40 cursor-not-allowed"
            }`}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 플로팅 버튼 + 패널 컨테이너 ── */
interface FloatingChatProps {
  tutorName: string;
  tutorAvatar: string;
  tutorSubject: string;
}

export function FloatingChat({ tutorName, tutorAvatar, tutorSubject }: FloatingChatProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 채팅 패널 */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-80 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden transition-all duration-300 origin-bottom-right ${
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"
        }`}
        style={{ height: "440px" }}
      >
        <ChatPanel
          tutorName={tutorName}
          tutorAvatar={tutorAvatar}
          tutorSubject={tutorSubject}
          onClose={() => setOpen(false)}
        />
      </div>

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 cursor-pointer ${
          open
            ? "opacity-0 scale-75 pointer-events-none"
            : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
        }`}
      >
        <MessageCircle size={24} />
        {/* 미확인 뱃지 */}
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent rounded-full text-[9px] font-bold text-white flex items-center justify-center">1</span>
      </button>
    </>
  );
}
