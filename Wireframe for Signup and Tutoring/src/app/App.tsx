import { useState } from "react";
import { Menu, X, CheckCircle2, MessageCircle } from "lucide-react";
import type { Page, Role, TutorMatching } from "../types";
import { MY_MATCHINGS_TUTOR } from "../data/mockData";
import HomePage from "../pages/HomePage";
import TutorsPage from "../pages/TutorsPage";
import TutorDetailPage from "../pages/TutorDetailPage";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import MyMatchingsPage from "../pages/MyMatchingsPage";
import MatchingRequestPage from "../pages/MatchingRequestPage";
import BookingPage from "../pages/BookingPage";
import SchedulePage from "../pages/SchedulePage";
import ChatListPage from "../pages/ChatListPage";
import TutorStudentDetailPage from "../pages/TutorStudentDetailPage";
import AIAssistant from "../components/AIAssistant";

const NAV_ITEMS_COMMON: { label: string; page: Page }[] = [
  { label: "홈", page: "home" },
  { label: "튜터 찾기", page: "tutors" },
  { label: "내 매칭", page: "my-matchings" },
];
const NAV_ITEMS_TUTOR: { label: string; page: Page }[] = [
  { label: "홈", page: "home" },
  { label: "내 매칭", page: "my-matchings" },
];

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [role, setRole] = useState<Role>(null);
  const [userName, setUserName] = useState("");
  const [selectedTutorId, setSelectedTutorId] = useState<number>(1);
  const [selectedMatchingId, setSelectedMatchingId] = useState<number>(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState("");

  /* 튜터 매칭 목록 — MyMatchingsPage와 TutorStudentDetailPage 공유 */
  const [tutorMatchingsList, setTutorMatchingsList] = useState<TutorMatching[]>(
    MY_MATCHINGS_TUTOR.map((m) => ({ ...m, lessonFee: undefined }))
  );
  const [selectedTutorMatchingId, setSelectedTutorMatchingId] = useState<number | null>(null);

  const selectedTutorMatching = tutorMatchingsList.find((m) => m.id === selectedTutorMatchingId) ?? null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleLogin = (r: Role, name: string) => {
    setRole(r);
    setUserName(name);
    showToast(`${name}님, 환영합니다!`);
    setPage("home");
  };

  const handleLogout = () => {
    setRole(null);
    setUserName("");
    setPage("home");
  };

  const handleSignUp = (r: Role) => {
    setRole(r);
    setUserName(r === "student" ? "신규 학생" : "신규 튜터");
    showToast(`${r === "student" ? "학생" : "튜터"} 계정으로 가입되었습니다!`);
    setPage("home");
  };

  const handleSelectTutor = (id: number) => {
    setSelectedTutorId(id);
    setPage("tutor-detail");
  };

  const handleMatchingSubmit = () => {
    showToast("매칭 요청이 전송되었습니다!");
    setPage("my-matchings");
  };

  return (
    <div className="min-h-screen bg-background font-[Inter,'Noto_Sans_KR',sans-serif]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-card/95 border-b border-border backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => setPage("home")} className="font-bold text-lg text-primary tracking-tight cursor-pointer">
            Tutor<span className="text-accent">Match</span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {(role === "tutor" ? NAV_ITEMS_TUTOR : NAV_ITEMS_COMMON).map(({ label, page: p }) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  page === p || (page === "tutor-student-detail" && p === "my-matchings")
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden sm:flex items-center gap-2">
            {role ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-full">
                  <span className="text-[10px] font-semibold text-primary/60">{role === "student" ? "학생" : "튜터"}</span>
                  <span className="text-xs font-semibold text-primary">{userName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setPage("login")}
                  className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  로그인
                </button>
                <button
                  onClick={() => setPage("signup")}
                  className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  회원가입
                </button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="sm:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-border bg-card px-4 py-3 space-y-1">
            {(role === "tutor" ? NAV_ITEMS_TUTOR : NAV_ITEMS_COMMON).map(({ label, page: p }) => (
              <button
                key={p}
                onClick={() => { setPage(p); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted cursor-pointer"
              >
                {label}
              </button>
            ))}
            <div className="pt-2 flex gap-2">
              {role ? (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex-1 py-2 border border-border rounded-lg text-sm text-foreground cursor-pointer"
                >
                  로그아웃 ({userName})
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { setPage("login"); setMobileMenuOpen(false); }}
                    className="flex-1 py-2 border border-border rounded-lg text-sm text-foreground cursor-pointer"
                  >
                    로그인
                  </button>
                  <button
                    onClick={() => { setPage("signup"); setMobileMenuOpen(false); }}
                    className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold cursor-pointer"
                  >
                    회원가입
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {page === "home" && (
          <HomePage onNavigate={setPage} onSelectTutor={handleSelectTutor} />
        )}
        {page === "tutors" && (
          <TutorsPage onSelectTutor={handleSelectTutor} />
        )}
        {page === "tutor-detail" && (
          <TutorDetailPage
            tutorId={selectedTutorId}
            role={role}
            onBack={() => setPage("tutors")}
            onRequestMatching={() => setPage("matching-request")}
          />
        )}
        {page === "login" && (
          <LoginPage onNavigateSignUp={() => setPage("signup")} onLogin={handleLogin} />
        )}
        {page === "signup" && (
          <SignUpPage onSignUp={handleSignUp} />
        )}
        {page === "my-matchings" && (
          <MyMatchingsPage
            role={role}
            onOpenBooking={(id) => { setSelectedMatchingId(id); setPage("booking"); }}
            tutorMatchingsList={tutorMatchingsList}
            onApproveMatching={(id) =>
              setTutorMatchingsList((prev) => prev.map((m) => m.id === id ? { ...m, status: "accepted" } : m))
            }
            onRejectMatching={(id) =>
              setTutorMatchingsList((prev) => prev.map((m) => m.id === id ? { ...m, status: "rejected" } : m))
            }
            onOpenStudentDetail={(id) => {
              setSelectedTutorMatchingId(id);
              setPage("tutor-student-detail");
            }}
          />
        )}
        {page === "booking" && (
          <BookingPage
            matchingId={selectedMatchingId}
            onBack={() => setPage("my-matchings")}
            onConfirm={() => { showToast("예약 신청이 완료되었습니다!"); setPage("my-matchings"); }}
          />
        )}
        {page === "matching-request" && (
          <MatchingRequestPage
            tutorId={selectedTutorId}
            onBack={() => setPage("tutor-detail")}
            onSubmit={handleMatchingSubmit}
          />
        )}
        {page === "tutor-student-detail" && selectedTutorMatching && (
          <TutorStudentDetailPage
            matching={selectedTutorMatching}
            onBack={() => setPage("my-matchings")}
            onUpdateFee={(id, fee) =>
              setTutorMatchingsList((prev) => prev.map((m) => m.id === id ? { ...m, lessonFee: fee } : m))
            }
          />
        )}
        {page === "schedule" && <SchedulePage />}
        {page === "chat" && <ChatListPage />}
      </main>

      {/* AI 어시스턴트 — 항상 표시 */}
      <AIAssistant onViewTutor={(id) => { setSelectedTutorId(id); setPage("tutor-detail"); }} />

      {/* 플로팅 채팅 버튼 (로그인 시, 튜터 프로필 제외) */}
      {role && page !== "tutor-detail" && (
        <button
          onClick={() => setPage("chat")}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 hover:scale-105 transition-all cursor-pointer"
        >
          <MessageCircle size={22} />
          {page !== "chat" && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
          )}
        </button>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-card px-5 py-3 rounded-xl text-sm font-medium shadow-lg z-50 flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-400" /> {toast}
        </div>
      )}

      <footer className="max-w-5xl mx-auto px-4 py-8 border-t border-border mt-8 text-center">
        <p className="text-xs text-muted-foreground">TutorMatch · Wireframe · API 기반 설계 v1.0</p>
      </footer>
    </div>
  );
}
