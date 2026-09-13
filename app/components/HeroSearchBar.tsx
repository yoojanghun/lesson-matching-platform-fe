'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function HeroSearchBar() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  return (
    <div className="flex gap-2">
      <div
        className="flex-1 flex items-center rounded-lg px-3 gap-2"
        style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)' }}
      >
        <Search size={16} style={{ color: 'rgba(255,255,255,0.6)' }} className="shrink-0" />
        <input
          className="flex-1 bg-transparent text-sm py-2.5 outline-none"
          style={{ color: '#ffffff' }}
          placeholder="악기, 튜터 이름 검색..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <button
        onClick={() => router.push(search.trim() ? `/tutors?search=${encodeURIComponent(search.trim())}` : '/tutors')}
        className="px-5 py-2.5 rounded-lg text-sm font-semibold shrink-0 transition-colors cursor-pointer"
        style={{ backgroundColor: '#e05a2b', color: '#ffffff' }}
        onMouseEnter={(event) => (event.currentTarget.style.backgroundColor = '#c44e22')}
        onMouseLeave={(event) => (event.currentTarget.style.backgroundColor = '#e05a2b')}
      >
        검색
      </button>
    </div>
  );
}
