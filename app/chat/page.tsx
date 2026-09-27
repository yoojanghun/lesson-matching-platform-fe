'use client';

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, ArrowLeft, Search, MoreVertical, MessageSquare } from "lucide-react";
import type { Conversation, ChatMessage } from "../types";
import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { apiClient } from "../lib/apiClient";
import { useUserStore } from "../store/useUserStore";

interface ChatMessageDto {
  mongoId?: string;
  type: "ENTER" | "TALK" | "LEAVE";
  matchingId?: number | null;
  studentId: number;
  tutorId: number;
  senderId?: number | null;
  senderName?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface ChatHistoryResponse {
  content: ChatMessageDto[];
}

interface ChatRoomSummaryDto {
  roomId: string;
  matchingId?: number | null;
  studentId: number;
  tutorId: number;
  partnerId: number;
  partnerName?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
}

let nextConversationId = 1000;

function createConversationId() {
  return nextConversationId++;
}

const CHAT_AVATAR = "/icons/categories/music.svg";

function lastMsg(conv: Conversation) {
  return conv.messages[conv.messages.length - 1];
}

function ChatListContent() {
  const searchParams = useSearchParams();
  const targetTutorId = searchParams.get("tutorId") ? Number(searchParams.get("tutorId")) : null;
  const userId = useUserStore((state) => state.userId);
  const role = useUserStore((state) => state.role);

  const [convs, setConvs] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [isTyping] = useState(false);
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stompClientRef = useRef<Client | null>(null);
  const initializedTargetTutorRef = useRef<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    const loadRooms = async () => {
      try {
        const response = await apiClient.get<ChatRoomSummaryDto[]>("/api/chat/rooms");
        if (cancelled) return;

        setConvs(response.data.map((room, index) => ({
          id: index + 1,
          roomId: room.roomId,
          matchingId: room.matchingId,
          studentId: room.studentId,
          tutorId: room.tutorId,
          tutorName: role === "TUTOR" ? room.partnerName ?? `학생 ${room.partnerId}` : room.partnerName ?? `튜터 ${room.partnerId}`,
          tutorAvatar: CHAT_AVATAR,
          tutorSubject: "레슨 문의",
          online: false,
          unread: room.unreadCount,
          messages: room.lastMessage ? [{
            id: 1,
            from: "tutor" as const,
            text: room.lastMessage,
            time: room.lastMessageAt ? new Date(room.lastMessageAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) : "",
          }] : [],
        })));
      } catch (error) {
        console.error("채팅방 목록 조회 실패", error);
      }
    };

    void loadRooms();
    return () => {
      cancelled = true;
    };
  }, [role, userId]);

  useEffect(() => {
    if (!targetTutorId || !userId || role !== "STUDENT" || initializedTargetTutorRef.current === targetTutorId) return;
    initializedTargetTutorRef.current = targetTutorId;

    const existing = convs.find((conversation) => conversation.tutorId === targetTutorId);
    if (existing) {
      const timer = window.setTimeout(() => setSelectedId(existing.id), 0);
      return () => window.clearTimeout(timer);
    }

    const createInquiry = async () => {
      try {
        const response = await apiClient.get<{ name?: string; title?: string; introduction?: string }>(`/api/tutors/${targetTutorId}/profile`);
        const conversation: Conversation = {
          id: createConversationId(),
          roomId: `inquiry:${userId}:${targetTutorId}`,
          matchingId: null,
          studentId: userId,
          tutorId: targetTutorId,
          tutorName: response.data.name ?? `튜터 ${targetTutorId}`,
          tutorAvatar: CHAT_AVATAR,
          tutorSubject: response.data.title ?? "레슨 문의",
          online: false,
          unread: 0,
          messages: [],
        };
        setConvs((prev) => [conversation, ...prev]);
        setSelectedId(conversation.id);
      } catch (error) {
        console.error("튜터 정보 조회 실패", error);
      }
    };

    void createInquiry();
  }, [convs, role, targetTutorId, userId]);

  const selected = convs.find((c) => c.id === selectedId) ?? null;
  const selectedTutorId = selected?.tutorId ?? null;
  const selectedStudentId = selected?.studentId ?? (role === "STUDENT" ? userId : null);
  const selectedMatchingId = selected?.matchingId ?? null;
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

  useEffect(() => {
    if (!selectedTutorId || !selectedStudentId || !userId) return;

    let cancelled = false;
    const loadHistory = async () => {
      try {
        const response = await apiClient.get<ChatHistoryResponse>("/api/chat/history", {
          params: { matchingId: selectedMatchingId ?? undefined, studentId: selectedStudentId, tutorId: selectedTutorId, page: 0, size: 50 },
        });
        if (cancelled) return;

        const messages: ChatMessage[] = [...response.data.content].reverse().map((message, index) => ({
          id: index + 1,
          from: message.senderId === userId ? "me" : "tutor",
          text: message.message,
          time: new Date(message.createdAt).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        setConvs((prev) => prev.map((conversation) => (
          conversation.id === selectedId ? { ...conversation, messages, unread: 0 } : conversation
        )));
        await apiClient.post("/api/chat/read", { matchingId: selectedMatchingId, studentId: selectedStudentId, tutorId: selectedTutorId });
      } catch (error) {
        console.error("채팅 내역 조회 실패", error);
      }
    };

    void loadHistory();
    return () => {
      cancelled = true;
    };
  }, [selectedId, selectedMatchingId, selectedStudentId, selectedTutorId, userId]);

  useEffect(() => {
    if (!selectedTutorId || !selectedStudentId || !userId) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const channelPath = selectedMatchingId
      ? `matching/${selectedMatchingId}`
      : `inquiry/${selectedStudentId}/${selectedTutorId}`;
    const client = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}/ws-chat`),
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem("tm_token") ?? ""}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/chat/${channelPath}`, (frame: IMessage) => {
          const message = JSON.parse(frame.body) as ChatMessageDto;
          const incoming: ChatMessage = {
            id: Date.now(),
            from: message.senderId === userId ? "me" : "tutor",
            text: message.message,
            time: new Date(message.createdAt).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setConvs((prev) => prev.map((conversation) => (
            conversation.id === selectedId
              ? { ...conversation, messages: [...conversation.messages, incoming] }
              : conversation
          )));
        });
      },
      onStompError: (frame) => console.error("채팅 WebSocket 오류", frame.headers["message"]),
    });

    stompClientRef.current = client;
    client.activate();
    return () => {
      stompClientRef.current = null;
      void client.deactivate();
    };
  }, [selectedId, selectedMatchingId, selectedStudentId, selectedTutorId, userId]);

  const selectConv = (id: number) => {
    setSelectedId(id);
    setConvs((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const send = () => {
    const text = input.trim();
    if (!text || !selectedId) return;

    if (userId && selectedStudentId && selectedTutorId && stompClientRef.current?.connected) {
      setInput("");
      stompClientRef.current.publish({
        destination: "/app/chat/message",
        body: JSON.stringify({
          type: "TALK",
          matchingId: selectedMatchingId,
          studentId: selectedStudentId,
          tutorId: selectedTutorId,
          message: text,
        }),
      });
    }
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
