import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About CardVault — Data Sources & Methodology',
  description: 'How CardVault prices cards: live TCGPlayer data via the Pokémon TCG API, public eBay sold comps, Heritage Auctions, Goldin, PWCC, and PSA population reports.',
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-white mb-4">About CardVault</h1>
      <p className="text-gray-400 text-xl mb-12 leading-relaxed">
        A price checker built for collectors who want real sold data, not estimates.
      </p>

      {/* What is CardVault */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What is CardVault?</h2>
        <div className="text-gray-400 space-y-4 leading-relaxed">
          <p>
            CardVault answers one question: what is this card worth? It covers 100+ iconic sports cards across baseball, basketball, football, and hockey — from 1909 T206 Honus Wagner to 2023 Victor Wembanyama rookies — plus live Pokémon TCG pricing pulled directly from the official Pokémon TCG API.
          </p>
          <p>
            Every price on this site is sourced from real sold transactions and links back to the source so you can verify it yourself. This is what Beckett, 130Point, and Card Ladder do — show the work.
          </p>
        </div>
      </section>

      {/* Data Sources & Methodology — the main section */}
      <section id="data" className="mb-12 scroll-mt-20">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-white">Data Sources &amp; Methodology</h2>
          <span className="text-xs bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 px-2 py-0.5 rounded-full">Transparent</span>
        </div>
        <div className="space-y-6">

          {/* Pokémon */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">⚡</span>
              <h3 className="text-white font-semibold text-lg">Pokémon TCG — Live TCGPlayer Data</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-3">
              All Pokémon card data and prices come directly from the{' '}
              <a href="https://pokemontcg.io" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                Pokémon TCG API (pokemontcg.io)
              </a>
              , which sources pricing from TCGPlayer&apos;s live marketplace. Prices reflect actual recent transactions on TCGPlayer — not estimates. Each variant (Holofoil, Reverse Holofoil, 1st Edition, Normal) is shown separately with low, mid, market, and high prices.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-3">
              Data is refreshed hourly. When you see a price on a Pokémon card page, it is the TCGPlayer market price as of that refresh — the same number you&apos;d see on TCGPlayer.com.
            </p>
            <p className="text-gray-500 text-xs">Limitation: API coverage is complete for sets from Base Set (1999) through current releases. Some promos and regional exclusives may show no price data if TCGPlayer does not have listings.</p>
          </div>

          {/* Sports */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏆</span>
              <h3 className="text-white font-semibold text-lg">Sports Cards — Public Auction Records</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-3">
              Sports card values are compiled from publicly reported sold results across:
            </p>
            <ul className="space-y-2 text-sm text-gray-400 mb-4">
              {[
                { source: 'eBay sold listings', detail: 'Primary comp source for mid-grade cards. Filtered to completed sales with PSA/BGS/SGC grades specified.' },
                { source: 'Heritage Auctions', detail: 'Public auction results for high-value vintage and modern investment-grade cards.' },
                { source: 'Goldin Auctions', detail: 'Auction records for premium modern and vintage sports cards.' },
                { source: 'PWCC Marketplace', detail: 'Consignment auction results for high-grade examples across all sports.' },
              ].map(s => (
                <li key={s.source} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                  <div>
                    <span className="text-white font-medium">{s.source}</span>
                    <span className="text-gray-500"> — {s.detail}</span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-gray-400 text-sm leading-relaxed mb-2">
              Grade-by-grade pricing tables on each card page show the estimated market value at each PSA grade tier based on the above sources. Each table includes a direct &ldquo;Verify on eBay&rdquo; link that opens a pre-filtered eBay sold search for that exact card so you can confirm the data yourself.
            </p>
            <p className="text-gray-500 text-xs">Limitation: Sports card prices are curated manually and updated periodically. The market moves fast — for real-time pricing, always verify via the eBay sold links on each card page. Values shown are the mid-point of a reasonable range based on recent comps, not a guaranteed price.</p>
          </div>

          {/* PSA Populations */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📊</span>
              <h3 className="text-white font-semibold text-lg">PSA Population Data</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-3">
              PSA population figures (total graded, PSA 10 count, PSA 9 count, gem rate) are sourced from{' '}
              <a href="https://www.psacard.com/pop" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                PSA&apos;s publicly available population reports
              </a>
              . These figures are used to contextualize grade pricing — a card with a 0.5% gem rate commands a higher PSA 10 premium than one with a 15% gem rate.
            </p>
            <p className="text-gray-500 text-xs">Population data is a snapshot and grows over time as more copies are submitted. The gem rate shown reflects the population as of the last manual update for each card.</p>
          </div>

          {/* What we don't do */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold text-lg mb-3">What We Don&apos;t Do</h3>
            <ul className="text-gray-400 text-sm leading-relaxed space-y-2">
              {[
                'We don\'t sell cards or take commissions on sales',
                'We don\'t promote specific sellers or grading companies',
                'We don\'t fabricate scarcity or hype specific cards',
                'We don\'t claim our price estimates are definitive — they\'re starting points backed by real comp data',
                'We don\'t hide our sources — every price has a "Verify on eBay" or "Buy on TCGPlayer" link',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
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

      {/* CTA */}
      <section id="contact" className="scroll-mt-20">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            CardVault is an independent project. For data corrections, missing cards, or general feedback, reach out via GitHub.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Price Check a Card
            </Link>
            <Link
              href="/price-guide"
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
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
