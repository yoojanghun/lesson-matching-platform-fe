"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useUser } from "./UserContext";

const NAV_ITEMS = [
  { label: "홈", path: "/" },
  { label: "튜터 찾기", path: "/tutors" },
  { label: "내 매칭", path: "/my-matchings" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { role, logout } = useUser();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border backdrop-blur" style={{ backgroundColor: "rgba(255,255,255,0.97)" }}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight" style={{ color: "#1e3a5f" }}>
          Tutor<span style={{ color: "#e05a2b" }}>Match</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_ITEMS.map(({ label, path }) => (
            <Link
              key={path}
              href={path}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={
                pathname === path
                  ? { backgroundColor: "#e8f0fb", color: "#1e3a5f" }
                  : { color: "#6b748a" }
              }
              onMouseEnter={e => { if (pathname !== path) e.currentTarget.style.color = "#1e3a5f"; }}
              onMouseLeave={e => { if (pathname !== path) e.currentTarget.style.color = "#6b748a"; }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth buttons */}
        <div className="hidden sm:flex items-center gap-2">
          {role !== "GUEST" ? (
            <div className="flex items-center gap-2">
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{ color: "#6b748a", border: "1px solid rgba(30,58,95,0.12)" }}
              >
                {role === "STUDENT" ? "학생" : "튜터"}
              </span>
              <button
                onClick={logout}
                className="text-xs cursor-pointer"
                style={{ color: "#6b748a" }}
              >
                로그아웃
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm font-medium transition-colors"
                style={{ color: "#6b748a" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#1e3a5f")}
                onMouseLeave={e => (e.currentTarget.style.color = "#6b748a")}
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors inline-block"
                style={{ backgroundColor: "#1e3a5f", color: "#ffffff" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#16304f")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1e3a5f")}
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
        <div className="sm:hidden border-t border-border px-4 py-3 space-y-1" style={{ backgroundColor: "#ffffff" }}>
          {NAV_ITEMS.map(({ label, path }) => (
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
              className="flex-1 py-2 rounded-lg text-sm font-semibold text-center inline-block"
              style={{ backgroundColor: "#1e3a5f", color: "#ffffff" }}
            >
              회원가입
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
