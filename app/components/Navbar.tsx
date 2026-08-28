"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useUserStore } from "../store/useUserStore";
import { useHydrated } from "../hooks/useHydrated";

const NAV_ITEMS_STUDENT = [
  { label: "홈", path: "/" },
  { label: "튜터 찾기", path: "/tutors" },
  { label: "내 매칭", path: "/my-matchings" },
  { label: "내 프로필", path: "/profile" },
];

const NAV_ITEMS_TUTOR = [
  { label: "홈", path: "/" },
  { label: "내 매칭", path: "/my-matchings" },
  { label: "내 프로필", path: "/profile" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const hydrated = useHydrated();

  // Zustand Selector 최적화: 필요한 상태만 개별 구독
  const role = useUserStore((s) => s.role);
  const userName = useUserStore((s) => s.userName);
  const logout = useUserStore((s) => s.logout);

  // SSR 단계이거나 아직 hydration 되지 않은 경우 기본 게스트 상태 유지
  const currentRole = hydrated ? role : "GUEST";
  const navItems = currentRole === "TUTOR" ? NAV_ITEMS_TUTOR : NAV_ITEMS_STUDENT;

  return (
    <header className="sticky top-0 z-50 border-b border-border backdrop-blur bg-card/95">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight text-primary">
          Tutor<span className="text-accent">Match</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {navItems.map(({ label, path }) => (
            <Link
              key={path}
              href={path}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === path
                  ? "bg-secondary text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth buttons */}
        <div className="hidden sm:flex items-center gap-2">
          {currentRole !== "GUEST" ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-primary">
                <span className="text-[10px] font-semibold text-primary/70">
                  {currentRole === "STUDENT" ? "학생" : "튜터"}
                </span>
                <span className="text-xs font-bold text-primary">
                  {userName || (currentRole === "STUDENT" ? "김학생" : "김지수 튜터")}
                </span>
              </div>
              <button
                onClick={logout}
                className="text-xs cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors inline-block bg-primary text-primary-foreground hover:bg-primary/90"
              >
                회원가입
              </Link>
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
        <div className="sm:hidden border-t border-border px-4 py-3 space-y-1 bg-card">
          {navItems.map(({ label, path }) => (
            <Link
              key={path}
              href={path}
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted"
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 flex gap-2">
            {currentRole !== "GUEST" ? (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex-1 py-2 border border-border rounded-lg text-sm text-foreground text-center cursor-pointer"
              >
                로그아웃 ({userName || (currentRole === "STUDENT" ? "학생" : "튜터")})
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 border border-border rounded-lg text-sm text-foreground text-center inline-block"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold text-center inline-block bg-primary text-primary-foreground"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
