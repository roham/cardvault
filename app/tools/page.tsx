import type { Metadata } from 'next';
import GradeCalculator from './GradeCalculator';
import GradingCostTable from './GradingCostTable';
import CardLookup from './CardLookup';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Price Check — What Is My Card Worth?',
  description: 'Free card price checker for sports cards and Pokémon TCG. Real prices from eBay sold listings, TCGPlayer, Heritage Auctions, Goldin, and PWCC. No account required.',
};

export default function ToolsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Price Checker',
        description: 'Free card price checker for sports cards and Pokémon TCG with real sold data from eBay, TCGPlayer, and major auction houses.',
        url: 'https://cardvault-two.vercel.app/tools',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Real prices from eBay, TCGPlayer, Heritage, Goldin, and PWCC · Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">What Is My Card Worth?</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Search any sports or Pokémon card to get price estimates from real sold data — by grade, by variant. Links to verify on eBay and TCGPlayer included.
        </p>
      </div>

      {/* Tool nav */}
      <div className="flex flex-wrap gap-3 mb-12">
        {[
          { href: '#lookup', label: 'Price Check', icon: '🔎' },
          { href: '#grade-calc', label: 'Grade Value Calculator', icon: '📊' },
          { href: '#grading-cost', label: 'Grading Cost Estimator', icon: '🏅' },
          { href: '/tools/compare', label: 'Compare Cards', icon: '⚖️' },
          { href: '/tools/grading-roi', label: 'Grading ROI Calculator', icon: '💰' },
          { href: '/tools/sealed-ev', label: 'Sealed Product EV', icon: '📦' },
          { href: '/tools/quiz', label: 'What Should I Collect?', icon: '🎯' },
          { href: '/tools/trade', label: 'Trade Evaluator', icon: '🔄' },
          { href: '/tools/identify', label: 'Card Identifier', icon: '🔎' },
          { href: '/tools/set-cost', label: 'Set Completion Cost', icon: '📋' },
          { href: '/tools/draft-predictor', label: '2025 Draft Predictor', icon: '🎯' },
          { href: '/tools/pack-sim', label: 'Pack Simulator', icon: '🎰' },
          { href: '/tools/daily-pack', label: 'Daily Free Pack', icon: '🎁' },
          { href: '/tools/portfolio', label: 'Fantasy Portfolio', icon: '📈' },
          { href: '/tools/collection-value', label: 'Collection Value', icon: '💎' },
          { href: '/tools/box-break', label: 'Box Break Calculator', icon: '📦' },
          { href: '/tools/watchlist', label: 'Price Watchlist', icon: '👀' },
          { href: '/tools/market-dashboard', label: 'Market Dashboard', icon: '📊' },
          { href: '/tools/wax-vs-singles', label: 'Wax vs Singles', icon: '🃏' },
          { href: '/tools/centering-calc', label: 'Centering Calculator', icon: '📐' },
          { href: '/tools/insurance-calc', label: 'Insurance Calculator', icon: '🛡️' },
          { href: '/tools/flip-calc', label: 'Flip Profit Calculator', icon: '💸' },
          { href: '/tools/grading-tracker', label: 'Grading Tracker', icon: '📋' },
          { href: '/tools/set-checklist', label: 'Set Checklist', icon: '✅' },
          { href: '/tools/set-completion', label: 'Set Completion v2', icon: '🏆' },
          { href: '/tools/mystery-pack', label: 'Mystery Repack Sim', icon: '🎲' },
          { href: '/tools/dealer-scanner', label: 'Dealer Scanner', icon: '📱' },
          { href: '/tools/condition-grader', label: 'Condition Self-Grader', icon: '🔬' },
          { href: '/tools/pop-report', label: 'Population Report', icon: '📈' },
          { href: '/tools/investment-calc', label: 'Investment Calculator', icon: '📊' },
          { href: '/tools/submission-planner', label: 'Submission Planner', icon: '📋' },
          { href: '/tools/auth-check', label: 'Authentication Checker', icon: '🔐' },
          { href: '/tools/shipping-calc', label: 'Shipping Calculator', icon: '📬' },
          { href: '/tools/storage-calc', label: 'Storage & Supplies', icon: '📦' },
          { href: '/tools/listing-generator', label: 'eBay Listing Generator', icon: '📝' },
          { href: '/tools/visual-binder', label: 'Visual Binder', icon: '📖' },
          { href: '/tools/show-finder', label: 'Card Show Finder', icon: '📍' },
          { href: '/tools/tax-calc', label: 'Card Tax Calculator', icon: '🧾' },
          { href: '/tools/budget-planner', label: 'Hobby Budget Planner', icon: '💰' },
          { href: '/tools/lot-analyzer', label: 'Bulk Lot Analyzer', icon: '📦' },
          { href: '/tools/cross-grade', label: 'Cross-Grade Converter', icon: '🔄' },
          { href: '/tools/rarity-score', label: 'Rarity Score Calculator', icon: '💎' },
          { href: '/tools/prospect-tracker', label: 'Prospect Pipeline', icon: '🔮' },
          { href: '/tools/export-collection', label: 'Export Collection', icon: '📥' },
          { href: '/tools/holder-guide', label: 'Holder Size Guide', icon: '📏' },
          { href: '/tools/cert-check', label: 'PSA Cert Verifier', icon: '🔍' },
          { href: '/tools/turnaround-estimator', label: 'Turnaround Estimator', icon: '⏱️' },
          { href: '/tools/diversification', label: 'Diversification Analyzer', icon: '📊' },
          { href: '/tools/bgs-subgrade', label: 'BGS Subgrade Calculator', icon: '🎯' },
          { href: '/tools/flip-tracker', label: 'Flip Tracker P&L', icon: '📒' },
          { href: '/tools/roi-heatmap', label: 'ROI Heatmap', icon: '🗺️' },
          { href: '/tools/photo-guide', label: 'Card Photo Guide', icon: '📸' },
          { href: '/tools/selling-platforms', label: 'Selling Platform Comparison', icon: '🏪' },
          { href: '#ebay-search', label: 'eBay Sold Search', icon: '🔍' },
        ].map(t => (
          <a
            key={t.href}
            href={t.href}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </a>
        ))}
      </div>

      {/* Card Value Lookup — Client Component */}
      <section id="lookup" className="mb-16 scroll-mt-20">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-3">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Instant · No signup · Values from eBay sold comps
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Price Check</h2>
          <p className="text-gray-400 text-sm max-w-2xl">
            Search sports cards by player, year, or set. Select your grade to get an instant value based on recent sold comps. Each result links to the full price breakdown with eBay verification.
          </p>
        </div>
        <CardLookup />
      </section>

      {/* Grade Calculator — Client Component */}
      <section id="grade-calc" className="mb-16 scroll-mt-20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Grade Value Calculator</h2>
          <p className="text-gray-400 text-sm max-w-2xl">
            Enter a card&apos;s raw or low-grade value, then see estimated prices across all PSA and BGS grade tiers.
            Grade multipliers are based on observed market premiums for the general hobby market — individual cards vary.
          </p>
        </div>
        <GradeCalculator />
      </section>

      {/* Grading Cost Table — Server Component */}
      <section id="grading-cost" className="mb-16 scroll-mt-20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Grading Cost Estimator</h2>
          <p className="text-gray-400 text-sm max-w-2xl">
            Know your break-even before you submit. Grading only makes financial sense if the grade premium
            exceeds the submission cost plus shipping.
          </p>
        </div>
        <GradingCostTable />
      </section>

      {/* eBay Sold Search Generator */}
      <section id="ebay-search" className="mb-16 scroll-mt-20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">eBay Sold Search Generator</h2>
          <p className="text-gray-400 text-sm max-w-2xl">
            The fastest way to find real comp data. Build a targeted eBay sold-listings search for any card.
          </p>
        </div>
        <EbaySearchBuilder />
      </section>

      {/* CTA links */}
      <div className="border-t border-gray-800 pt-10">
        <h3 className="text-white font-semibold mb-4">Keep exploring</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/price-guide" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            Price Guide
          </Link>
          <Link href="/sports" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Sports Cards
          </Link>
          <Link href="/pokemon" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Pokémon Sets
          </Link>
          <Link href="/about#data" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Data Methodology
          </Link>
          <Link href="/mcp" className="inline-flex items-center gap-2 bg-emerald-950/60 hover:bg-emerald-950/80 text-emerald-400 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-emerald-800/50">
            MCP Server API
          </Link>
        </div>
      </div>
    </div>
  );
}

// eBay Sold Search Builder — static (no interactivity needed, links out)
function EbaySearchBuilder() {
  const examples = [
    { label: 'Jordan 1986 Fleer PSA 10', query: '1986 Fleer Michael Jordan 57 PSA 10', desc: 'Gem mint Jordan rookies' },
    { label: 'Charizard Base Set PSA 9', query: 'Charizard Base Set Shadowless PSA 9', desc: 'Vintage Pokémon top grades' },
    { label: 'Gretzky OPC Rookie PSA 8', query: '1979 OPC Wayne Gretzky 18 PSA 8', desc: 'Hockey holy grail mid-grade' },
    { label: 'Wembanyama Prizm Auto', query: 'Wembanyama Prizm Silver Auto Rookie RC', desc: 'Modern NBA hyper-rookie' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl px-4 py-3">
        <p className="text-amber-300/80 text-sm">
          <strong className="font-semibold">Pro tip:</strong> eBay sold listings show actual realized prices — not asking prices. Always filter to &ldquo;Sold Items&rdquo; for real comps. Links below open pre-filtered sold searches.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {examples.map(ex => (
          <a
            key={ex.label}
            href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(ex.query)}&LH_Sold=1&LH_Complete=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 bg-gray-900 border border-gray-800 hover:border-emerald-500/50 rounded-xl p-4 transition-all"
          >
            <div className="w-8 h-8 bg-emerald-950/60 rounded-lg flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold group-hover:text-emerald-400 transition-colors">{ex.label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{ex.desc}</p>
              <p className="text-gray-600 text-xs mt-1 truncate">{ex.query}</p>
            </div>
            <svg className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 shrink-0 mt-0.5 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-3">Build your own eBay sold search</h3>
        <p className="text-gray-400 text-sm mb-3">Format: <code className="bg-gray-800 text-emerald-400 px-1.5 py-0.5 rounded text-xs">[Year] [Player/Card name] [Card number] [Grade company] [Grade]</code></p>
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
            <span>Include the exact card number (e.g., &ldquo;#57&rdquo; or &ldquo;BDPP89&rdquo;) — eliminates wrong cards</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
            <span>Add &ldquo;RC&rdquo; or &ldquo;Rookie&rdquo; for rookie cards — significant price difference</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
            <span>Sort by &ldquo;Ending soonest&rdquo; filtered to last 90 days for most accurate comps</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
            <span>Cross-reference with PWCC and Goldin for ultra-high-value cards (&gt;$10K)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
