import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MysteryCrateClient from './MysteryCrateClient';

export const metadata: Metadata = {
  title: 'Card Mystery Crate — Open Mystery Lots & Find Hidden Hits | CardVault',
  description: 'Open virtual mystery crates packed with real sports cards from 9,000+ database. Choose your budget ($25-$250), pick a theme, reveal cards one by one, and grade your luck. Free mystery lot simulator.',
  openGraph: {
    title: 'Card Mystery Crate — Mystery Lot Simulator | CardVault',
    description: 'Open mystery crates packed with real sports cards. 4 budgets, 6 themes, one-by-one reveals.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Mystery Crate — CardVault',
    description: 'Open virtual mystery crates. Pick a budget, choose a theme, reveal cards. Free simulator.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Mystery Crate' },
];

const faqItems = [
  {
    question: 'What is the Card Mystery Crate?',
    answer: 'The Card Mystery Crate is a free mystery lot simulator. You pick a budget tier ($25, $50, $100, or $250) and a theme (Mixed, Sport-Specific, Rookies Only, Vintage, Modern, or Graded), then open a virtual crate filled with real cards from our 9,000+ card database. Reveal cards one by one to see what you pulled, then get a grade based on total value versus crate cost. It simulates the experience of buying mystery lots on eBay, at card shows, or from online sellers.',
  },
  {
    question: 'How are cards selected for each crate?',
    answer: 'Cards are randomly selected from our database, filtered by your chosen theme. Budget determines the number of cards (5-15) and value distribution. Every crate includes a mix of common cards and at least one potential hit. Higher budget tiers have better odds of pulling high-value cards. Daily mode uses a date-based seed so everyone gets the same crate that day.',
  },
  {
    question: 'What do the grades mean?',
    answer: 'After opening your crate, you receive a grade from S (incredible, 150%+ return) to F (terrible, under 50% return). The grade is based on total card value versus crate price. S means you got amazing value. A and B are wins. C is break-even. D and F mean the crate was a loss — just like real mystery lots, not every one is a winner.',
  },
  {
    question: 'Is this based on real card values?',
    answer: 'Yes. Every card in the mystery crate comes from our database of 9,000+ real sports cards with estimated market values based on recent sales data. The cards, players, and values are all real — only the crate itself is simulated. This gives you a realistic sense of mystery lot economics.',
  },
  {
    question: 'What is the difference between Daily and Random mode?',
    answer: 'Daily mode generates the same crate for everyone on a given day using a date-based seed — you can compare results with friends. Random mode generates a unique crate each time you open one. Both modes track your stats separately so you can see your Daily win rate versus Random win rate.',
  },
];

export default function MysteryCratePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Mystery Crate',
        description: 'Mystery lot simulator. Pick a budget, choose a theme, open a virtual crate of real sports cards.',
        url: 'https://cardvault-two.vercel.app/vault/mystery-crate',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
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
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          Mystery Lots &middot; 9,000+ Cards &middot; 4 Budgets &middot; 9 Themes
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
          Card Mystery Crate
        </h1>
        <p className="text-zinc-400 text-base max-w-2xl">
          Pick your budget, choose a theme, and crack open a mystery crate filled with real sports cards. Reveal cards one by one and grade your luck. Will you hit big or bust?
        </p>
      </div>

      <MysteryCrateClient />

      {/* How It Works */}
      <div className="mt-12 border-t border-zinc-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Pick Budget', desc: 'Choose $25, $50, $100, or $250 crate tier' },
            { step: '2', title: 'Choose Theme', desc: 'Mixed, sport, rookies, vintage, modern, or graded' },
            { step: '3', title: 'Open Crate', desc: 'Click cards one by one to reveal your pulls' },
            { step: '4', title: 'Get Graded', desc: 'See total value, grade (S-F), and share results' },
          ].map(s => (
            <div key={s.step} className="bg-zinc-800/30 border border-zinc-700/30 rounded-lg p-4 text-center">
              <div className="w-8 h-8 rounded-full bg-purple-600/30 text-purple-400 font-bold text-sm flex items-center justify-center mx-auto mb-2">{s.step}</div>
              <div className="text-sm font-semibold text-white">{s.title}</div>
              <div className="text-xs text-zinc-500 mt-1">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mystery Lot Tips */}
      <div className="mt-8 border-t border-zinc-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Mystery Lot Tips</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: 'Check the Math First', tip: 'Real mystery lots should list the total estimated value. If they do not, assume the worst. Sellers who hide value have something to hide.' },
            { title: 'Themed Lots Win', tip: 'Sport-specific or player-specific lots tend to have more honest value than mixed grab bags. The seller had to curate, which means they care about repeat customers.' },
            { title: 'Grade Matters Most', tip: 'A $100 mystery lot with 1 graded card and 50 raw commons is not the same as one with 8 well-chosen raw cards. Look for lots that describe card conditions.' },
            { title: 'Daily Mode for Fun', tip: 'Use Daily mode to compare crates with friends. Same budget + theme = same cards. See who picks the best strategy.' },
            { title: 'Vintage Crates Are Risky', tip: 'Vintage cards have wider value ranges. A $50 vintage crate might have a $200 gem or five $3 commons. High variance = high excitement but also high bust rate.' },
            { title: 'Watch the Hit Rate', tip: 'Track your stats over multiple crates. In real mystery lots, sellers typically keep the best cards. Your simulated win rate here will be higher than real eBay lots.' },
          ].map(t => (
            <div key={t.title} className="bg-zinc-800/30 border border-zinc-700/30 rounded-lg p-3">
              <div className="text-sm font-medium text-white">{t.title}</div>
              <div className="text-xs text-zinc-500 mt-1">{t.tip}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-8 border-t border-zinc-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-zinc-800/30 border border-zinc-700/30 rounded-lg">
              <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-zinc-200 hover:text-white">
                {faq.question}
              </summary>
              <div className="px-4 pb-3 text-sm text-zinc-400 leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-8 border-t border-zinc-800 pt-6">
        <h2 className="text-lg font-bold text-white mb-3">Related</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/pack-sim', label: 'Pack Simulator', desc: 'Rip virtual packs' },
            { href: '/vault/garage-sale', label: 'Garage Sale', desc: 'Price & sell simulator' },
            { href: '/vault/pawn-shop', label: 'Pawn Shop', desc: 'Negotiate with AI broker' },
            { href: '/vault/auction-sniper', label: 'Auction Sniper', desc: 'Snipe timed auctions' },
            { href: '/card-mystery-box', label: 'Mystery Box Game', desc: 'Pick hints, reveal cards' },
            { href: '/vault/flash-sale', label: 'Flash Sales', desc: 'Limited-time deals' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="bg-zinc-800/40 border border-zinc-700/30 rounded-lg p-3 hover:border-zinc-600 transition-colors">
              <div className="text-sm font-medium text-white">{link.label}</div>
              <div className="text-xs text-zinc-500">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
