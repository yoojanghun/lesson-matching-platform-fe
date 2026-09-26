'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number; // 0-based
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) {
  // 데이터가 없거나 totalPages가 0이어도 최소 1페이지는 보여주도록 보장
  const effectiveTotalPages = Math.max(totalPages, 1);
  const pageNumbers = Array.from({ length: effectiveTotalPages }, (_, index) => index)
    .slice(Math.max(currentPage - 2, 0), Math.min(currentPage + 3, effectiveTotalPages));

  return (
    <nav className={`flex items-center justify-center gap-1 pt-4 pb-2 ${className}`} aria-label="페이지 이동">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
        disabled={currentPage === 0}
        aria-label="이전 페이지"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>

      {pageNumbers.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          aria-current={currentPage === page ? 'page' : undefined}
          className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm transition-colors ${
            currentPage === page
              ? 'bg-primary font-semibold text-primary-foreground'
              : 'border border-border text-foreground hover:bg-muted'
          }`}
        >
          {page + 1}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(currentPage + 1, effectiveTotalPages - 1))}
        disabled={currentPage >= effectiveTotalPages - 1}
        aria-label="다음 페이지"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
