'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navLinks = [
  { href: '/tools', label: 'Price Check' },
  { href: '/pokemon', label: 'Pokémon Cards' },
  { href: '/sports', label: 'Sports Cards' },
  { href: '/price-guide', label: 'Price Guide' },
  { href: '/news', label: 'News' },
  { href: '/guides', label: 'Guides' },
  { href: '/calendar', label: 'Calendar' },
];

const starterLink = { href: '/start', label: 'New to cards?' };

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M8 4v16" />
                <path d="M16 4v16" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">CardVault</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-emerald-400 bg-gray-800'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={starterLink.href}
              className={`ml-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                pathname === starterLink.href
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-950/40'
                  : 'border-gray-700 text-gray-400 hover:text-emerald-400 hover:border-emerald-800'
              }`}
            >
              {starterLink.label}
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <nav className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-emerald-400 bg-gray-800'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={starterLink.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                pathname === starterLink.href
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-950/40'
                  : 'border-gray-700 text-gray-400 hover:text-emerald-400'
              }`}
            >
              {starterLink.label}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
