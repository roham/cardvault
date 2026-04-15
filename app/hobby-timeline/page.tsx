import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'History of Card Collecting — Complete Timeline from 1880 to Today | CardVault',
  description: 'The complete history of sports card collecting from 1880s tobacco cards to the modern era. Key milestones: T206 Honus Wagner, Topps monopoly, 1952 Mickey Mantle, junk wax era, the 2020 boom, and what comes next. Interactive visual timeline.',
  openGraph: {
    title: 'History of Card Collecting — CardVault',
    description: 'From tobacco cards to modern grading. The complete timeline of card collecting history.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'History of Card Collecting — CardVault',
    description: 'The complete history of sports card collecting. 140+ years of the hobby.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Hobby Timeline' },
];

interface TimelineEvent {
  year: number;
  title: string;
  description: string;
  era: string;
  impact: 'high' | 'medium' | 'low';
  category: 'product' | 'market' | 'culture' | 'company' | 'record';
}

const TIMELINE: TimelineEvent[] = [
  { year: 1886, title: 'First Baseball Cards', description: 'Goodwin & Company includes baseball player cards in Old Judge cigarette packs. The N172 set features over 500 players — the first mass-produced baseball cards.', era: 'Tobacco Era', impact: 'high', category: 'product' },
  { year: 1909, title: 'T206 Honus Wagner', description: 'The American Tobacco Company produces the T206 set. Honus Wagner demands his card be pulled from production, creating the rarest and most valuable sports card ever. A PSA 5 sold for $6.6 million in 2021.', era: 'Tobacco Era', impact: 'high', category: 'record' },
  { year: 1933, title: 'Goudey Gum Company', description: 'Goudey produces the first modern gum cards with Babe Ruth, Lou Gehrig, and Nap Lajoie. The 1933 Goudey set becomes one of the most collected pre-war sets.', era: 'Pre-War', impact: 'medium', category: 'product' },
  { year: 1948, title: 'Bowman Enters the Market', description: 'Bowman Gum Company releases its first baseball card set, beginning the modern era of card collecting. Bowman dominates until Topps arrives.', era: 'Post-War', impact: 'medium', category: 'company' },
  { year: 1951, title: 'Topps First Set', description: 'Topps Chewing Gum Company releases its first baseball card set — two series of small cards with red and blue backs. The beginning of a 70+ year dynasty.', era: 'Post-War', impact: 'high', category: 'company' },
  { year: 1952, title: '1952 Topps Mickey Mantle #311', description: 'Topps releases the iconic 1952 set. The Mickey Mantle #311 becomes the most recognizable baseball card ever made. A PSA 9 sold for $12.6 million in 2022.', era: 'Golden Age', impact: 'high', category: 'record' },
  { year: 1956, title: 'Topps Buys Bowman', description: 'Topps acquires Bowman, establishing a near-monopoly on baseball cards that lasts until 1981. For 25 years, Topps is the only game in town.', era: 'Golden Age', impact: 'high', category: 'company' },
  { year: 1968, title: 'Nolan Ryan Rookie Card', description: 'The 1968 Topps set includes Nolan Ryan shared rookie card (#177). It becomes one of the most iconic and valuable cards of the era.', era: 'Golden Age', impact: 'medium', category: 'record' },
  { year: 1979, title: 'Wayne Gretzky Rookie Card', description: 'O-Pee-Chee produces the Wayne Gretzky RC #18. The most valuable hockey card ever made. A PSA 10 sold for $3.75 million.', era: 'Expansion', impact: 'high', category: 'record' },
  { year: 1980, title: 'The Henderson Rookie', description: 'The 1980 Topps Rickey Henderson RC #482 becomes one of the most collected cards. Henderson goes on to become the all-time stolen base king.', era: 'Expansion', impact: 'medium', category: 'record' },
  { year: 1981, title: 'Fleer and Donruss Enter Market', description: 'A court ruling breaks Topps monopoly. Fleer and Donruss begin producing competing baseball card sets, tripling the number of products available.', era: 'Expansion', impact: 'high', category: 'market' },
  { year: 1986, title: 'Michael Jordan Fleer RC', description: 'The 1986-87 Fleer Michael Jordan #57 rookie card is released. It becomes the most valuable basketball card ever — a PSA 10 sold for $840,000 in 2021.', era: 'Junk Wax', impact: 'high', category: 'record' },
  { year: 1987, title: 'The Junk Wax Era Begins', description: 'Production volumes explode. Cards printed in billions — 1987 Topps, 1988 Donruss, 1989 Fleer are printed in such quantities that they become nearly worthless. Millions of kids open packs.', era: 'Junk Wax', impact: 'high', category: 'market' },
  { year: 1989, title: 'Upper Deck Changes Everything', description: 'Upper Deck enters the market with premium card stock, hologram anti-counterfeiting technology, and action photography. The Ken Griffey Jr. rookie card (#1) becomes an iconic modern card.', era: 'Junk Wax', impact: 'high', category: 'company' },
  { year: 1991, title: 'Peak Junk Wax Production', description: 'An estimated 81 billion sports cards are produced this year alone. Virtually every set from 1987-1993 becomes overproduced. The bubble is about to burst.', era: 'Junk Wax', impact: 'medium', category: 'market' },
  { year: 1993, title: 'PSA Founded', description: 'Professional Sports Authenticator (PSA) is founded, creating the first widely-accepted third-party card grading service. Grading transforms the hobby from subjective condition assessment to standardized grades.', era: 'Modern', impact: 'high', category: 'company' },
  { year: 1996, title: 'Beckett Grading Services (BGS)', description: 'Beckett launches BGS with sub-grades for centering, corners, edges, and surface. The 10/10/10/10 "Pristine" becomes the most coveted grade designation.', era: 'Modern', impact: 'medium', category: 'company' },
  { year: 1997, title: 'Pokemon TCG Launches in Japan', description: 'The Pokemon Trading Card Game launches in Japan, eventually becoming the best-selling trading card game in history with over 52 billion cards sold worldwide.', era: 'Modern', impact: 'high', category: 'product' },
  { year: 1999, title: 'Pokemon TCG Hits America', description: 'Pokemon cards arrive in the US. Base Set 1st Edition Charizard becomes the holy grail of Pokemon collecting. A PSA 10 sold for $420,000 in 2022.', era: 'Modern', impact: 'high', category: 'culture' },
  { year: 2005, title: 'Panini Enters US Market', description: 'Italian sticker company Panini acquires Donruss and begins producing American sports cards. They eventually get exclusive NBA and NFL licenses.', era: 'Modern', impact: 'medium', category: 'company' },
  { year: 2009, title: 'Topps Gets Exclusive MLB License', description: 'Topps signs an exclusive deal with MLB, ending competition from Upper Deck and Panini in the baseball card space. The era of licensed exclusivity begins.', era: 'Modern', impact: 'high', category: 'company' },
  { year: 2016, title: 'Panini Prizm Becomes King', description: 'Panini Prizm emerges as the most collected modern basketball set. Silver Prizm parallels become the standard chase card. Prizm defines the modern collecting era.', era: 'Modern', impact: 'medium', category: 'product' },
  { year: 2020, title: 'The Pandemic Boom', description: 'COVID-19 lockdowns combined with stimulus checks create an unprecedented sports card boom. Card prices skyrocket 200-500%. PSA receives 10 million submissions. Cards become mainstream investment assets.', era: 'Boom', impact: 'high', category: 'market' },
  { year: 2021, title: 'Million-Dollar Cards Become Normal', description: 'Multiple cards break the $1M barrier: 1952 Mantle PSA 9 ($5.2M), T206 Wagner PSA 5 ($6.6M), Luka Doncic Logoman ($4.6M). Cards are front-page financial news.', era: 'Boom', impact: 'high', category: 'record' },
  { year: 2022, title: 'The Correction', description: 'Card prices drop 30-60% from pandemic peaks. The hobby sheds speculative buyers. Long-term collectors see opportunities. Grading backlogs clear. The market normalizes.', era: 'Post-Boom', impact: 'high', category: 'market' },
  { year: 2023, title: 'Fanatics Takes Over', description: 'Fanatics begins its takeover of the card industry, acquiring exclusive MLB (from Topps), NFL, and NBA licenses. The biggest shift in card industry power since 1956. Topps becomes a Fanatics brand.', era: 'Post-Boom', impact: 'high', category: 'company' },
  { year: 2024, title: 'Victor Wembanyama Rookie Cards', description: 'The most hyped basketball rookie card class since LeBron James. Wembanyama Prizm RC commands $500+ for base PSA 10. The hobby finds its next generational talent.', era: 'Post-Boom', impact: 'medium', category: 'record' },
  { year: 2025, title: 'The AI Era and Direct-to-Consumer', description: 'AI tools transform card collecting: instant price lookups, condition estimation, and market analysis. Fanatics pushes direct-to-consumer sales. The hobby evolves with technology while maintaining its physical roots.', era: 'Post-Boom', impact: 'medium', category: 'culture' },
];

const ERA_COLORS: Record<string, string> = {
  'Tobacco Era': 'border-amber-700 bg-amber-950/30',
  'Pre-War': 'border-orange-700 bg-orange-950/30',
  'Post-War': 'border-yellow-700 bg-yellow-950/30',
  'Golden Age': 'border-emerald-700 bg-emerald-950/30',
  'Expansion': 'border-blue-700 bg-blue-950/30',
  'Junk Wax': 'border-red-700 bg-red-950/30',
  'Modern': 'border-purple-700 bg-purple-950/30',
  'Boom': 'border-pink-700 bg-pink-950/30',
  'Post-Boom': 'border-cyan-700 bg-cyan-950/30',
};

const CATEGORY_ICONS: Record<string, string> = {
  product: '📦',
  market: '📈',
  culture: '🌍',
  company: '🏢',
  record: '🏆',
};

export default function HobbyTimelinePage() {
  const eras = [...new Set(TIMELINE.map(t => t.era))];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'The Complete History of Card Collecting: 1880 to Today',
        description: 'An interactive timeline covering 140+ years of sports card and trading card collecting history.',
        url: 'https://cardvault-two.vercel.app/hobby-timeline',
        author: { '@type': 'Organization', name: 'CardVault' },
        datePublished: '2026-04-15',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'When did sports card collecting start?',
            acceptedAnswer: { '@type': 'Answer', text: 'Sports card collecting began in the 1880s when tobacco companies included baseball player cards in cigarette packs. The first mass-produced set was the Old Judge N172 series by Goodwin & Company in 1886, featuring over 500 baseball players.' },
          },
          {
            '@type': 'Question',
            name: 'What is the junk wax era?',
            acceptedAnswer: { '@type': 'Answer', text: 'The junk wax era (1987-1993) was a period of massive overproduction in the sports card industry. Cards were printed in billions, with an estimated 81 billion produced in 1991 alone. Most cards from this era have minimal value today due to extreme supply. Key sets include 1987 Topps, 1988 Donruss, 1989 Fleer, and 1989 Upper Deck.' },
          },
          {
            '@type': 'Question',
            name: 'What caused the 2020 card collecting boom?',
            acceptedAnswer: { '@type': 'Answer', text: 'The 2020 sports card boom was caused by COVID-19 lockdowns (more time at home), government stimulus payments, social media influencers promoting cards as investments, and nostalgia. Card prices rose 200-500% from pre-pandemic levels. PSA received over 10 million grading submissions. The boom peaked in early 2021 before correcting in 2022.' },
          },
          {
            '@type': 'Question',
            name: 'What is the most valuable sports card ever sold?',
            acceptedAnswer: { '@type': 'Answer', text: 'The most valuable sports card ever sold is the 1952 Topps Mickey Mantle #311 in PSA 9.5 condition, which sold for $12.6 million in August 2022 at Heritage Auctions. The T206 Honus Wagner in PSA 5 condition sold for $6.6 million in 2021.' },
          },
        ],
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          1886–2025 &middot; {TIMELINE.length} Key Events &middot; 9 Eras &middot; Interactive
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">The History of Card Collecting</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          From 1880s tobacco cards to the AI era. Every major milestone, market shift, and record-breaking sale
          in 140+ years of the card collecting hobby.
        </p>
      </div>

      {/* Era Legend */}
      <div className="flex flex-wrap gap-2 mb-8">
        {eras.map(era => (
          <span key={era} className={`px-3 py-1 border rounded-full text-xs font-medium text-gray-300 ${ERA_COLORS[era] || 'border-gray-700 bg-gray-800/50'}`}>
            {era}
          </span>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gray-700" />

        <div className="space-y-6">
          {TIMELINE.map((event, i) => (
            <div key={i} className="relative pl-16 sm:pl-20">
              {/* Year dot */}
              <div className={`absolute left-4 sm:left-6 w-4 h-4 rounded-full border-2 ${event.impact === 'high' ? 'bg-amber-500 border-amber-400' : event.impact === 'medium' ? 'bg-gray-500 border-gray-400' : 'bg-gray-700 border-gray-600'}`} style={{ top: '1.25rem' }} />

              <div className={`border rounded-xl p-4 sm:p-5 ${ERA_COLORS[event.era] || 'border-gray-700 bg-gray-800/50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-bold text-white">{event.year}</span>
                  <span className="text-sm">{CATEGORY_ICONS[event.category]}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${event.impact === 'high' ? 'bg-amber-900/50 text-amber-400' : 'bg-gray-800 text-gray-400'}`}>
                    {event.era}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{event.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related */}
      <section className="mt-16 mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Explore More</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/era-guide', label: 'Card Era Guide', icon: '📜' },
            { href: '/market-data', label: 'Market Data Room', icon: '📊' },
            { href: '/news', label: 'Hobby News', icon: '📰' },
            { href: '/calendar', label: 'Release Calendar', icon: '📅' },
            { href: '/market-report', label: 'Market Report', icon: '📈' },
            { href: '/guides', label: 'Collecting Guides', icon: '📚' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors"
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
