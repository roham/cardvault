import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import DraftHubClient from './DraftHubClient';

export const metadata: Metadata = {
  title: '2025 NFL Draft Hub — Card Collector\'s Complete Draft Guide',
  description: 'Everything a card collector needs for the 2025 NFL Draft. Countdown timer, prospect rankings with card values, mock draft simulator, draft night war room, rookie card price predictions. Updated for April 24-26, 2025 in Green Bay.',
  openGraph: {
    title: '2025 NFL Draft Hub — CardVault',
    description: 'The card collector\'s complete guide to the 2025 NFL Draft. Prospects, predictions, prices.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '2025 NFL Draft Hub — CardVault',
    description: 'Every draft tool a card collector needs. Prospects, mock drafts, price predictions.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: '2025 NFL Draft Hub' },
];

const faqItems = [
  {
    question: 'When is the 2025 NFL Draft?',
    answer: 'The 2025 NFL Draft takes place April 24-26, 2025 in Green Bay, Wisconsin. Round 1 is Thursday April 24 at 8:00 PM ET. Rounds 2-3 are Friday April 25 at 7:00 PM ET. Rounds 4-7 are Saturday April 26 at 12:00 PM ET.',
  },
  {
    question: 'Which 2025 NFL Draft prospects have the most valuable rookie cards?',
    answer: 'Travis Hunter (WR/CB, Colorado) has the highest pre-draft card values due to his unique two-way status and Heisman Trophy. Cam Ward (QB, Miami) and Shedeur Sanders (QB, Colorado) follow, as QBs always command premium card prices. Ashton Jeanty (RB, Boise State) and Tetairoa McMillan (WR, Arizona) round out the top 5 in pre-draft card value.',
  },
  {
    question: 'Should I buy rookie cards before or after the NFL Draft?',
    answer: 'Buy BEFORE the draft for maximum ROI. Pre-draft prices are suppressed because landing spot is unknown. Once a player is drafted — especially by a large-market team or a team with a strong QB — prices spike 50-300% within minutes. The optimal strategy is: buy pre-draft at current prices, then sell within 24-48 hours post-draft during the initial spike.',
  },
  {
    question: 'What rookie card sets should I buy for 2025 NFL Draft picks?',
    answer: 'Pre-draft sets available now: Bowman University 2024 (Chrome-style), Prizm Draft Picks 2024, and Contenders Draft Picks 2024. Post-draft NFL licensed cards (Prizm, Select, Optic, Mosaic) release later in 2025. Chrome-style cards (Prizm, Optic) consistently hold value better than base products.',
  },
  {
    question: 'How much do rookie card prices spike after the NFL Draft?',
    answer: 'QBs drafted #1-5 overall typically see 150-300% price spikes. First-round WRs and RBs see 50-150% spikes. Landing spot is critical — a QB going to Dallas or New York spikes more than one going to Jacksonville. Defensive players see smaller spikes (20-60%). Day 2-3 picks see minimal draft-night movement but can spike later based on training camp performance.',
  },
];

const TOP_PROSPECTS = [
  { name: 'Cam Ward', pos: 'QB', school: 'Miami', pick: '#1 CLE', preValue: '$80', spikeEst: '+$250', tier: 'elite' },
  { name: 'Shedeur Sanders', pos: 'QB', school: 'Colorado', pick: '#2 NYG', preValue: '$60', spikeEst: '+$200', tier: 'elite' },
  { name: 'Travis Hunter', pos: 'WR/CB', school: 'Colorado', pick: '#3 TEN', preValue: '$100', spikeEst: '+$300', tier: 'elite' },
  { name: 'Abdul Carter', pos: 'EDGE', school: 'Penn State', pick: '#4 NE', preValue: '$30', spikeEst: '+$120', tier: 'elite' },
  { name: 'Tetairoa McMillan', pos: 'WR', school: 'Arizona', pick: '#7', preValue: '$45', spikeEst: '+$180', tier: 'elite' },
  { name: 'Ashton Jeanty', pos: 'RB', school: 'Boise State', pick: '#9', preValue: '$50', spikeEst: '+$200', tier: 'elite' },
  { name: 'Jalen Milroe', pos: 'QB', school: 'Alabama', pick: '#13', preValue: '$40', spikeEst: '+$180', tier: 'first-round' },
  { name: 'Luther Burden III', pos: 'WR', school: 'Missouri', pick: '#20', preValue: '$25', spikeEst: '+$100', tier: 'first-round' },
  { name: 'Dillon Gabriel', pos: 'QB', school: 'Oregon', pick: '#21', preValue: '$30', spikeEst: '+$140', tier: 'first-round' },
  { name: 'Nick Singleton', pos: 'RB', school: 'Penn State', pick: 'Day 2', preValue: '$12', spikeEst: '+$50', tier: 'day-two' },
];

export default function DraftHubPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: '2025 NFL Draft Hub for Card Collectors',
        description: 'Complete card collector guide to the 2025 NFL Draft. Prospect rankings, price predictions, mock draft simulator, and draft night tools.',
        url: 'https://cardvault-two.vercel.app/draft-hub',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          April 24-26, 2025 &middot; Green Bay, WI &middot; Card Collector&apos;s Guide
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">2025 NFL Draft Hub</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Everything a card collector needs for the 2025 NFL Draft. Prospect rankings with card values,
          mock draft simulator, war room, predictions, and rookie card price tracking.
        </p>
      </div>

      {/* Countdown Timer */}
      <DraftHubClient />

      {/* Draft Tools Grid */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Draft Night Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: '/mock-draft', title: 'Mock Draft Simulator', desc: 'Be the GM. Draft prospects, build a rookie card portfolio, beat the AI.', icon: '🏈', tag: 'PLAY' },
            { href: '/draft-war-room', title: 'Draft War Room', desc: 'Live pick tracker with card value predictions and portfolio builder.', icon: '🏟️', tag: 'LIVE' },
            { href: '/draft-live', title: 'Draft Night Live', desc: 'Follow picks in real-time with card impact analysis and hot takes.', icon: '📺', tag: 'LIVE' },
            { href: '/tools/draft-predictor', title: 'Draft Night Predictor', desc: 'See which rookies\' cards will spike based on draft position.', icon: '🎯', tag: 'TOOL' },
            { href: '/tools/prospect-tracker', title: 'Prospect Pipeline', desc: 'Track top prospects with hype scores, ceiling ratings, and key cards.', icon: '🔮', tag: 'TOOL' },
            { href: '/rookies', title: 'Rookie Card Index', desc: 'Browse all rookie cards by year, 1911-2025. 83 years of rookies.', icon: '⭐', tag: 'BROWSE' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="group p-5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-emerald-700/50 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{t.icon}</span>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{t.title}</div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    t.tag === 'PLAY' ? 'bg-purple-500/20 text-purple-400' :
                    t.tag === 'LIVE' ? 'bg-red-500/20 text-red-400' :
                    t.tag === 'TOOL' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>{t.tag}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">{t.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Prospects Table */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Top 10 Prospects — Card Value Rankings</h2>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-700 bg-gray-900/50">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Prospect</th>
                  <th className="px-4 py-3 font-medium">Pos</th>
                  <th className="px-4 py-3 font-medium">School</th>
                  <th className="px-4 py-3 font-medium">Proj. Pick</th>
                  <th className="px-4 py-3 font-medium text-right">Pre-Draft Value</th>
                  <th className="px-4 py-3 font-medium text-right">Est. Spike</th>
                </tr>
              </thead>
              <tbody>
                {TOP_PROSPECTS.map((p, i) => (
                  <tr key={p.name} className="border-b border-gray-800 hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-gray-600">{i + 1}</td>
                    <td className="px-4 py-3 font-bold text-white">{p.name}</td>
                    <td className="px-4 py-3 text-gray-400">{p.pos}</td>
                    <td className="px-4 py-3 text-gray-400">{p.school}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        p.tier === 'elite' ? 'bg-yellow-500/20 text-yellow-400' :
                        p.tier === 'first-round' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>{p.pick}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-white font-medium">{p.preValue}</td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-bold">{p.spikeEst}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 text-xs text-gray-600 bg-gray-900/30">
            Values are estimated Bowman University / Prizm Draft Picks RC prices (PSA 10 equivalent). Spike estimates based on historical draft-night price movements for similar prospects.
          </div>
        </div>
      </section>

      {/* Draft Strategy Tips */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Draft Week Strategy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
            <h3 className="text-sm font-bold text-emerald-400 mb-2">Buy Now (Pre-Draft)</h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>QBs projected top-10: biggest post-draft spikes</li>
              <li>Travis Hunter: unique two-way player, Heisman winner</li>
              <li>Day-2 RBs (Singleton, Skattebo): cheap now, spike on landing spot</li>
              <li>Bowman University Chrome is the premium pre-draft product</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
            <h3 className="text-sm font-bold text-yellow-400 mb-2">Sell During Draft Night</h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>List pre-bought cards within 30 min of the pick being announced</li>
              <li>Peak price is usually 12-48 hours post-draft</li>
              <li>QBs to big markets (NYG, CLE, LV) spike hardest</li>
              <li>WRs paired with elite QBs get a landing-spot premium</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
            <h3 className="text-sm font-bold text-blue-400 mb-2">Buy the Dip (Post-Draft)</h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>Players who fall in the draft: cards drop but talent doesn&apos;t change</li>
              <li>Injured players (Josh Simmons): max discount, full upside if healthy</li>
              <li>Wait 2-3 weeks for post-draft correction before buying long-term holds</li>
              <li>EDGE rushers are consistently undervalued by the hobby market</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
            <h3 className="text-sm font-bold text-purple-400 mb-2">Avoid</h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>Buying any card within 1 hour of the pick — max FOMO pricing</li>
              <li>Day 3 offensive linemen: almost zero hobby demand</li>
              <li>Panic selling if your player falls — give it 48 hours</li>
              <li>Overpaying for parallels of unproven rookies</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Related Tools */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">More Card Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/investment-calc', label: 'Investment Calculator', icon: '📊' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', icon: '💰' },
            { href: '/tools/watchlist', label: 'Price Watchlist', icon: '👀' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', icon: '📈' },
            { href: '/predictions', label: 'Price Predictions', icon: '🔮' },
            { href: '/market-movers', label: 'Market Movers', icon: '📈' },
            { href: '/tools/pack-sim', label: 'Pack Simulator', icon: '🎰' },
            { href: '/tools/show-prep', label: 'Show Prep Tool', icon: '🎯' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 px-3 py-2.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-xs text-gray-300 hover:text-white transition-colors"
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700 rounded-xl">
              <summary className="cursor-pointer px-6 py-4 text-white font-medium list-none flex items-center justify-between">
                {f.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{f.answer}</div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
