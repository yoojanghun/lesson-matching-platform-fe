import { useState } from "react";
import { Menu, X, CheckCircle2 } from "lucide-react";
import type { Page, Role } from "../types";
import HomePage from "../pages/HomePage";
import TutorsPage from "../pages/TutorsPage";
import TutorDetailPage from "../pages/TutorDetailPage";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import MyMatchingsPage from "../pages/MyMatchingsPage";
import MatchingRequestPage from "../pages/MatchingRequestPage";
import BookingPage from "../pages/BookingPage";

const NAV_ITEMS: { label: string; page: Page }[] = [
  { label: "홈", page: "home" },
  { label: "튜터 찾기", page: "tutors" },
  { label: "내 매칭", page: "my-matchings" },
];

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [role, setRole] = useState<Role>(null);
  const [selectedTutorId, setSelectedTutorId] = useState<number>(1);
  const [selectedMatchingId, setSelectedMatchingId] = useState<number>(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSignUp = (r: Role) => {
    setRole(r);
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
            {NAV_ITEMS.map(({ label, page: p }) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  page === p ? "bg-secondary text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden sm:flex items-center gap-2">
            {role ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground border border-border px-2 py-1 rounded-full">
                  {role === "student" ? "학생" : "튜터"}
                </span>
                <button
                  onClick={() => setRole(null)}
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
            {NAV_ITEMS.map(({ label, page: p }) => (
              <button
                key={p}
                onClick={() => { setPage(p); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted cursor-pointer"
              >
                {label}
              </button>
            ))}
            <div className="pt-2 flex gap-2">
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
          <LoginPage onNavigateSignUp={() => setPage("signup")} />
        )}
        {page === "signup" && (
          <SignUpPage onSignUp={handleSignUp} />
        )}
        {page === "my-matchings" && (
          <MyMatchingsPage
            role={role}
            onOpenBooking={(id) => { setSelectedMatchingId(id); setPage("booking"); }}
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
      </main>

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
