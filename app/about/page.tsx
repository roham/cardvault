import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About CardVault',
  description: 'About CardVault — data sources, methodology, and how we price sports cards and Pokémon TCG.',
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-white mb-4">About CardVault</h1>
      <p className="text-gray-400 text-xl mb-12 leading-relaxed">
        A no-nonsense card reference built for collectors who want real data, not hype.
      </p>

      {/* What is CardVault */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What is CardVault?</h2>
        <div className="text-gray-400 space-y-4 leading-relaxed">
          <p>
            CardVault is a price reference and set browser for sports cards and the Pokémon Trading Card Game. It covers over 100 iconic sports cards across baseball, basketball, football, and hockey — from 1909 T206 Honus Wagner to 2023 Victor Wembanyama rookies — plus live Pokémon TCG data pulled directly from the official Pokémon TCG API.
          </p>
          <p>
            The goal is simple: give collectors a fast, clean reference for card data and estimated values without the noise of marketplace listings, sponsored content, or fabricated scarcity.
          </p>
        </div>
      </section>

      {/* Data sources */}
      <section id="data" className="mb-12 scroll-mt-20">
        <h2 className="text-2xl font-bold text-white mb-4">Data Sources & Methodology</h2>
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold text-lg mb-2">Pokémon TCG API</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-3">
              All Pokémon set data, card details, and TCGPlayer market prices are fetched live from the{' '}
              <a href="https://pokemontcg.io" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                Pokémon TCG API (pokemontcg.io)
              </a>
              . Prices are sourced from TCGPlayer and reflect recent market transactions. Data is refreshed hourly.
            </p>
            <p className="text-gray-500 text-xs">Note: The API is free to use. CardVault uses it without modification and does not store card data.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold text-lg mb-2">Sports Card Valuations</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-3">
              Sports card estimated values are based on publicly available sold comps from eBay, Heritage Auctions, Goldin Auctions, and PWCC Marketplace. Values are curated manually and reflect approximate market prices for mid-grade (PSA 7–8) and gem-mint (PSA 9–10) examples.
            </p>
            <p className="text-gray-500 text-xs">
              Values are for reference only. The card market is volatile — always verify with live auction data before making significant purchase or sale decisions.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold text-lg mb-2">What We Don't Do</h3>
            <ul className="text-gray-400 text-sm leading-relaxed space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                We don't sell cards or take commissions on sales
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                We don't promote specific sellers or grading companies
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                We don't fabricate scarcity or hype specific cards
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                We don't claim our price estimates are definitive — they're starting points
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Grading explained */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Understanding Card Grades</h2>
        <div className="space-y-3">
          {[
            { grade: 'PSA 10 / BGS 10', label: 'Gem Mint', desc: 'Perfect centering, sharp corners, no print defects. Extremely rare. Commands massive premiums — often 5–20x the PSA 8 price.' },
            { grade: 'PSA 9 / BGS 9.5', label: 'Mint / Near Mint-Mint', desc: 'Near-perfect condition with minor imperfections under magnification. The sweet spot for most collectors balancing quality and availability.' },
            { grade: 'PSA 8', label: 'Near Mint–Mint', desc: 'Slight wear on corners or edges, good centering. Most commonly available graded condition. Solid middle-market prices.' },
            { grade: 'PSA 7', label: 'Near Mint', desc: 'Light corner wear, minor print lines visible. Still collectible, significant discount to higher grades.' },
            { grade: 'PSA 6 and below', label: 'Excellent or lower', desc: 'Noticeable wear. Value primarily driven by rarity of the specific card, not grade premiums.' },
          ].map(item => (
            <div key={item.grade} className="flex gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="shrink-0">
                <span className="text-emerald-400 font-bold text-sm whitespace-nowrap">{item.grade}</span>
                <p className="text-gray-500 text-xs mt-0.5">{item.label}</p>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-20">
        <h2 className="text-2xl font-bold text-white mb-4">Contact</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            CardVault is an independent project. For data corrections, missing cards, or general feedback, reach out via GitHub.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/price-guide"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Price Guide
            </Link>
            <Link
              href="/pokemon"
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Pokémon Sets
            </Link>
            <Link
              href="/sports"
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Sports Cards
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
