"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ArrowLeftRight, UserRound } from "lucide-react";
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
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const hydrated = useHydrated();

  const role = useUserStore((s) => s.role);
  const userName = useUserStore((s) => s.userName);
  const logout = useUserStore((s) => s.logout);
  const availableRoles = useUserStore((s) => s.availableRoles);
  const switchRoleOnServer = useUserStore((s) => s.switchRoleOnServer);

  const currentRole = hydrated ? role : "GUEST";
  const navItems = currentRole === "TUTOR" ? NAV_ITEMS_TUTOR : NAV_ITEMS_STUDENT;
  const otherRole = currentRole === "STUDENT" ? "TUTOR" : "STUDENT";
  const hasOtherRole = hydrated && availableRoles.includes(otherRole as "STUDENT" | "TUTOR");

  const handleRoleSwitch = async () => {
    // 1. 현재 학생인데 튜터 등록 이력이 없는 경우 -> 10단계 튜터 프로필 설정 페이지로 이동
    if (currentRole === "STUDENT" && !hasOtherRole) {
      setProfileMenuOpen(false);
      setMobileMenuOpen(false);
      router.push("/tutor-profile/setup?from=switch");
      return;
    }

    // 2. 이미 해당 역할을 보유하고 있는 경우 -> 즉시 서버 역할 전환
    setSwitching(true);
    try {
      await switchRoleOnServer(otherRole as "STUDENT" | "TUTOR");
      setProfileMenuOpen(false);
      setMobileMenuOpen(false);
      if (pathname === "/tutor-profile" || pathname === "/student-profile") {
        router.replace("/profile");
      }
    } catch (error) {
      console.error("역할 전환 실패:", error);
    } finally {
      setSwitching(false);
    }
  };

  useEffect(() => {
    if (!profileMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [profileMenuOpen]);

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
            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                aria-label="사용자 메뉴 열기"
                aria-expanded={profileMenuOpen}
                onClick={() => setProfileMenuOpen((open) => !open)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <span className="text-sm font-medium text-foreground">
                  {userName || (currentRole === "STUDENT" ? "학생" : "튜터")}
                </span>
                <UserRound size={20} strokeWidth={1.8} className="text-muted-foreground" />
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">
                      {userName || (currentRole === "STUDENT" ? "학생" : "튜터")}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {currentRole === "STUDENT" ? "학생" : "튜터"}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={switching}
                    onClick={handleRoleSwitch}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <ArrowLeftRight size={16} />
                    {switching
                      ? "전환 중..."
                      : otherRole === "STUDENT"
                        ? "학생으로 전환"
                        : hasOtherRole
                          ? "튜터로 전환"
                          : "튜터로 등록하기"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setProfileMenuOpen(false);
                    }}
                    className="w-full border-t border-border px-4 py-3 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    로그아웃
                  </button>
                </div>
              )}
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
            <>
              <button
                disabled={switching}
                onClick={handleRoleSwitch}
                className="flex-1 py-2 border border-accent/40 rounded-lg text-sm text-accent font-semibold text-center cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <ArrowLeftRight size={13} />
                {switching
                  ? '전환 중...'
                  : otherRole === 'STUDENT'
                    ? '학생으로 전환'
                    : hasOtherRole
                      ? '튜터로 전환'
                      : '튜터로 등록하기'}
              </button>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex-1 py-2 border border-border rounded-lg text-sm text-foreground text-center cursor-pointer"
              >
                로그아웃 ({userName || (currentRole === "STUDENT" ? "학생" : "튜터")})
              </button>
            </>
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
