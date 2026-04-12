import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-emerald-500 rounded-md flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M8 4v16M16 4v16" />
                </svg>
              </div>
              <span className="text-white font-bold">CardVault</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your command center for sports cards and Pokémon TCG collecting. Real prices, real data.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Browse</h3>
            <ul className="space-y-2">
              {[
                { href: '/pokemon', label: 'Pokémon Cards' },
                { href: '/sports', label: 'Sports Cards' },
                { href: '/price-guide', label: 'Price Guide' },
                { href: '/news', label: 'Market News' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sports */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Sports</h3>
            <ul className="space-y-2">
              {[
                { href: '/sports?sport=baseball', label: 'Baseball' },
                { href: '/sports?sport=basketball', label: 'Basketball' },
                { href: '/sports?sport=football', label: 'Football' },
                { href: '/sports?sport=hockey', label: 'Hockey' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Info</h3>
            <ul className="space-y-2">
              {[
                { href: '/about', label: 'About CardVault' },
                { href: '/about#data', label: 'Data Sources' },
                { href: '/about#contact', label: 'Contact' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} CardVault. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs text-center sm:text-right">
            Prices are estimates for reference only. Card values fluctuate. Always verify with live market data.
          </p>
        </div>
      </div>
    </footer>
  );
}
