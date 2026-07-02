'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Menu, X, LogOut, RefreshCw, UserCheck } from 'lucide-react';
import { useUser } from './UserContext';
import { clsx } from 'clsx';

export default function Navbar() {
  const { role, setRole, logout } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSwitchRole = () => {
    if (role === 'GUEST') {
      router.push('/signup');
    } else {
      const nextRole = role === 'STUDENT' ? 'TUTOR' : 'STUDENT';
      setRole(nextRole);
      router.push('/');
    }
  };

  const navLinks = [
    { label: 'Find Tutors', href: '/' },
    ...(role !== 'GUEST' ? [{ label: 'My Matchings', href: '/dashboard' }] : []),
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
                TutorMatch
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "text-sm font-medium transition-colors duration-200 relative py-1",
                    isActive 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600 rounded-full dark:bg-blue-400" />
                  )}
                </Link>
              );
            })}

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

            {role === 'GUEST' ? (
              <Link 
                href="/signup" 
                className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:shadow-blue-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Sign Up / Login
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>{role}</span>
                </div>
                
                <button
                  onClick={handleSwitchRole}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors duration-150"
                  title={`Switch to ${role === 'STUDENT' ? 'Tutor' : 'Student'}`}
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>As {role === 'STUDENT' ? 'Tutor' : 'Student'}</span>
                </button>

                <button
                  onClick={logout}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:bg-red-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors duration-150"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors duration-200"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 py-3 px-4 space-y-3 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={clsx(
                "block rounded-lg px-3 py-2 text-base font-medium transition-colors duration-150",
                pathname === link.href 
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400" 
                  : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              {link.label}
            </Link>
          ))}

          <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />

          {role === 'GUEST' ? (
            <Link
              href="/signup"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center rounded-lg bg-blue-600 py-2.5 text-base font-semibold text-white hover:bg-blue-700"
            >
              Sign Up / Login
            </Link>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-3 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-xs font-semibold text-slate-500">Logged in as:</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{role}</span>
              </div>
              <button
                onClick={() => {
                  handleSwitchRole();
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <RefreshCw className="h-4 w-4" />
                Switch to {role === 'STUDENT' ? 'Tutor' : 'Student'}
              </button>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
