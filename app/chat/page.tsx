'use client';

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, ArrowLeft, Search, MoreVertical, MessageSquare } from "lucide-react";
import { TUTORS } from "../data/mockData";
import type { Conversation, ChatMessage } from "../types";

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    tutorId: 2,
    tutorName: "박민준",
    tutorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
    tutorSubject: "기타 · 우쿨렐레",
    online: true,
    unread: 2,
    messages: [
      { id: 1, from: "tutor", text: "안녕하세요! 기타 레슨에 관심 있으신가요? 😊", time: "어제 오전 10:02" },
      { id: 2, from: "me", text: "네, 안녕하세요! 완전 초보인데 배울 수 있을까요?", time: "어제 오전 10:15" },
      { id: 3, from: "tutor", text: "물론이죠! 초보자 맞춤 커리큘럼이 있어서 걱정 안 하셔도 돼요. 첫 수업은 기본 코드 잡는 것부터 시작합니다.", time: "어제 오전 10:18" },
      { id: 4, from: "me", text: "좋아요! 그럼 수업료는 어떻게 되나요?", time: "어제 오전 10:20" },
      { id: 5, from: "tutor", text: "1회 60분 기준 35,000원이에요. 첫 수업은 체험 수업으로 25,000원에 진행해 드리고 있어요!", time: "어제 오전 10:22" },
      { id: 6, from: "tutor", text: "일정은 언제쯤 가능하세요?", time: "오늘 오전 09:11" },
    ],
  },
  {
    id: 2,
    tutorId: 5,
    tutorName: "최유나",
    tutorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&auto=format",
    tutorSubject: "보컬 · 발성",
    online: false,
    unread: 0,
    messages: [
      { id: 1, from: "me", text: "안녕하세요, 보컬 레슨 문의드립니다!", time: "2026-07-20 14:00" },
      { id: 2, from: "tutor", text: "안녕하세요! 어떤 장르의 보컬을 배우고 싶으신가요?", time: "2026-07-20 14:30" },
      { id: 3, from: "me", text: "팝 위주로 배우고 싶어요. 발성 교정도 필요할 것 같아요.", time: "2026-07-20 14:45" },
      { id: 4, from: "tutor", text: "딱 저한테 맞는 케이스네요! 발성 교정은 기본으로 들어가고, 곡 분석까지 같이 해드려요 😊", time: "2026-07-20 15:00" },
    ],
  },
  {
    id: 3,
    tutorId: 4,
    tutorName: "정도현",
    tutorAvatar: "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=80&h=80&fit=crop&auto=format",
    tutorSubject: "첼로 · 음악이론",
    online: true,
    unread: 1,
    messages: [
      { id: 1, from: "tutor", text: "안녕하세요! 문의 주셔서 감사합니다.", time: "2026-07-18 11:00" },
      { id: 2, from: "me", text: "첼로를 처음 배우려고 하는데, 악기가 없어도 수업 가능한가요?", time: "2026-07-18 11:10" },
      { id: 3, from: "tutor", text: "네, 처음 몇 회는 제 첼로를 빌려드릴 수 있어요. 그 사이 렌탈도 알아보시면 좋을 것 같아요!", time: "2026-07-18 11:15" },
      { id: 4, from: "tutor", text: "렌탈 업체 정보도 안내해 드릴게요. 부담 없이 시작해 보세요 🎻", time: "오늘 오전 08:40" },
    ],
  },
  {
    id: 4,
    tutorId: 7,
    tutorName: "송지은",
    tutorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format",
    tutorSubject: "작곡 · 편곡",
    online: false,
    unread: 0,
    messages: [
      { id: 1, from: "me", text: "작곡 배우고 싶은데 피아노를 못 쳐도 되나요?", time: "2026-07-15 16:00" },
      { id: 2, from: "tutor", text: "요즘은 DAW(디지털 오디오 워크스테이션)로 피아노 없이도 작곡 가능해요!", time: "2026-07-15 16:20" },
      { id: 3, from: "me", text: "오 그렇군요! Logic Pro 쓰면 되나요?", time: "2026-07-15 16:25" },
      { id: 4, from: "tutor", text: "네 맞아요! 제가 Logic Pro 전문이라 바로 시작할 수 있어요 🎧", time: "2026-07-15 16:30" },
    ],
  },
];

const AUTO_REPLIES = [
  "네, 말씀하신 내용 잘 이해했습니다!",
  "좋은 질문이에요. 조금 더 자세히 설명해 드릴게요.",
  "물론이죠! 언제든지 문의 주세요 😊",
  "레슨 관련해서 더 궁금한 점 있으시면 말씀해 주세요.",
  "감사합니다. 빠른 시일 내에 답변 드릴게요!",
  "일정 조율해서 편한 시간으로 잡아봐요!",
];

let nextId = 100;
function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function lastMsg(conv: Conversation) {
  return conv.messages[conv.messages.length - 1];
}

function ChatListContent() {
  const searchParams = useSearchParams();
  const targetTutorId = searchParams.get("tutorId") ? Number(searchParams.get("tutorId")) : null;

  const [convs, setConvs] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // If query tutorId is present, auto open or create conversation with that tutor
  useEffect(() => {
    if (targetTutorId) {
      const existing = convs.find((c) => c.tutorId === targetTutorId);
      if (existing) {
        setSelectedId(existing.id);
      } else {
        const tutor = TUTORS.find((t) => t.id === targetTutorId);
        if (tutor) {
          const newConv: Conversation = {
            id: Date.now(),
            tutorId: tutor.id,
            tutorName: tutor.name,
            tutorAvatar: tutor.avatar,
            tutorSubject: tutor.subject,
            online: tutor.available,
            unread: 0,
            messages: [
              {
                id: 1,
                from: "tutor",
                text: `안녕하세요! ${tutor.name} 튜터입니다. 궁금한 점이 있으시면 말씀해 주세요 😊`,
                time: nowTime(),
              },
            ],
          };
          setConvs((prev) => [newConv, ...prev]);
          setSelectedId(newConv.id);
        }
      }
    }
  }, [targetTutorId]);

  const selected = convs.find((c) => c.id === selectedId) ?? null;
  const filtered = convs.filter(
    (c) =>
      c.tutorName.toLowerCase().includes(search.toLowerCase()) ||
      c.tutorSubject.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages, isTyping]);

  useEffect(() => {
    if (selectedId) inputRef.current?.focus();
  }, [selectedId]);

  const selectConv = (id: number) => {
    setSelectedId(id);
    setConvs((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const send = () => {
    const text = input.trim();
    if (!text || !selectedId) return;
    const msg: ChatMessage = { id: nextId++, from: "me", text, time: nowTime() };
    setConvs((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, messages: [...c.messages, msg] } : c))
    );
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      setIsTyping(false);
      setConvs((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  { id: nextId++, from: "tutor", text: reply, time: nowTime() },
                ],
              }
            : c
        )
      );
    }, 1200 + Math.random() * 500);
  };

  const totalUnread = convs.reduce((s, c) => s + c.unread, 0);

  return (
    <div className="space-y-4 py-2">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">채팅</h2>
          <p className="text-sm text-muted-foreground mt-0.5">튜터와의 1:1 대화를 확인하세요</p>
        </div>
        {totalUnread > 0 && (
          <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold">
            읽지 않은 메시지 {totalUnread}개
          </span>
        )}
      </div>

      {/* 채팅 패널: 좌 목록 + 우 채팅창 */}
      <div
        className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden border border-border"
        style={{ height: "600px" }}
      >
        <div className="flex h-full">
          {/* 왼쪽: 대화 목록 */}
          <div
            className={`flex flex-col border-r border-border shrink-0 ${
              selected ? "hidden sm:flex w-72" : "flex w-full sm:w-72"
            }`}
          >
            {/* 검색 */}
            <div className="px-3 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2">
                <Search size={14} className="text-muted-foreground shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="튜터 검색..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
                />
              </div>
            </div>

            {/* 목록 */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">대화 내역이 없습니다.</p>
              ) : (
                filtered.map((conv) => {
                  const last = lastMsg(conv);
                  const isSelected = conv.id === selectedId;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => selectConv(conv.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-border/60 transition-colors cursor-pointer text-left ${
                        isSelected ? "bg-secondary/60" : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={conv.tutorAvatar}
                          alt={conv.tutorName}
                          className="w-11 h-11 rounded-full object-cover"
                        />
                        {conv.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-card rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-sm font-bold text-foreground truncate">{conv.tutorName}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                            {last?.time.split(" ").pop()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{conv.tutorSubject}</p>
                        <p
                          className={`text-xs mt-0.5 truncate ${
                            conv.unread > 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {last?.from === "me" ? "나: " : ""}
                          {last?.text}
                        </p>
                      </div>

                      {conv.unread > 0 && (
                        <span className="w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                          {conv.unread}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 오른쪽: 채팅창 */}
          {selected ? (
            <div className="flex flex-col flex-1 min-w-0">
              {/* 채팅 헤더 */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border shrink-0 bg-card">
                <button
                  onClick={() => setSelectedId(null)}
                  className="sm:hidden p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground shrink-0"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="relative shrink-0">
                  <img
                    src={selected.tutorAvatar}
                    alt={selected.tutorName}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  {selected.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-card rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{selected.tutorName} 튜터</p>
                  <p className="text-[11px] text-muted-foreground">
                    {selected.online ? "온라인" : "오프라인"} · {selected.tutorSubject}
                  </p>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground">
                  <MoreVertical size={16} />
                </button>
              </div>

              {/* 메시지 영역 */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-muted/10">
                {selected.messages.map((msg) =>
                  msg.from === "tutor" ? (
                    <div key={msg.id} className="flex items-end gap-2">
                      <img
                        src={selected.tutorAvatar}
                        alt={selected.tutorName}
                        className="w-7 h-7 rounded-full object-cover shrink-0 mb-0.5"
                      />
                      <div className="max-w-[70%]">
                        <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                          <p className="text-sm text-foreground leading-relaxed">{msg.text}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 ml-1">{msg.time}</p>
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex items-end justify-end gap-2">
                      <div className="max-w-[70%]">
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
                    <img
                      src={selected.tutorAvatar}
                      alt={selected.tutorName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mb-0.5"
                    />
                    <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                      <div className="flex gap-1 items-center h-4">
                        {[0, 150, 300].map((d) => (
                          <span
                            key={d}
                            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce"
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
          ) : (
            <div className="hidden sm:flex flex-1 items-center justify-center flex-col gap-3 text-center bg-muted/10">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                <MessageSquare size={22} className="text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">대화를 선택하세요</p>
              <p className="text-xs text-muted-foreground">
                왼쪽 목록에서 튜터를 선택하면
                <br />
                채팅을 시작할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatListPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-sm text-muted-foreground">채팅 불러오는 중...</div>}>
      <ChatListContent />
    </Suspense>
  );
}
