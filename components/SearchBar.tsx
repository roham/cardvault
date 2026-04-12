'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  placeholder?: string;
  large?: boolean;
  onSearch?: (query: string) => void;
  defaultValue?: string;
}

export default function SearchBar({ placeholder = 'Search cards...', large = false, onSearch, defaultValue = '' }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else {
      router.push(`/price-guide?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative flex items-center">
        <svg
          className={`absolute left-4 text-gray-400 ${large ? 'w-5 h-5' : 'w-4 h-4'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors ${
            large ? 'pl-12 pr-32 py-4 text-base' : 'pl-10 pr-24 py-2.5 text-sm'
          }`}
        />
        <button
          type="submit"
          className={`absolute right-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors ${
            large ? 'px-5 py-2 text-sm' : 'px-3 py-1.5 text-xs'
          }`}
        >
          Search
        </button>
      </div>
    </form>
  );
}
