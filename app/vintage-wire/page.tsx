import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import VintageWireClient from './VintageWireClient';

export const metadata: Metadata = {
  title: 'Vintage Wire — Pre-1980 Card Sales Live Feed | CardVault',
  description: 'Live simulated feed of vintage card moments: pre-war tobacco, Golden Age Topps, 70s vintage. Auction hammers from Heritage / REA / Memory Lane, private-dealer sales, show-floor deals, PSA Registry moves, and institutional acquisitions. The one ticker a vintage collector keeps open.',
  openGraph: {
    title: 'Vintage Wire — CardVault',
    description: 'Pre-1980 vintage card feed. Hammers, privates, shows, registry, museums. Era filters, $1K-$100K+ floors.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Vintage Wire — CardVault',
    description: 'Live-feel ticker for pre-1980 vintage cards across auction houses, shows, and private dealer flow.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Vintage Wire' },
];

const faqItems = [
  {
    question: 'What counts as "vintage" on this feed?',
    answer: 'Anything with a card year of 1979 or earlier. This spans three era bands you can filter independently. PRE-WAR covers T206 through the 1933 Goudey / 1938 Play Ball / 1941 Play Ball window \u2014 the tobacco, caramel, and gum-era foundation of the hobby. GOLDEN AGE covers 1946\u20131970: 1948 Bowman, 1948 Leaf, the full Topps run from 1951 Redbacks forward, 1957 Topps, 1961 Fleer, 1969 Topps. 70S VINTAGE covers 1971\u20131979: 1971 Topps (black-borders), 1974 Topps, 1979 Topps Ozzie Smith, 1979 O-Pee-Chee Gretzky. 1980 forward is treated as modern on our live feeds and excluded from this one.',
  },
  {
    question: 'What are the five context streams?',
    answer: 'Every event is tagged with one of five vintage-specific contexts. AUCTION HAMMER is a live-auction lot closing at a vintage-specialty house (Heritage Sports, Robert Edward Auctions, Goldin Vintage, Memory Lane, Huggins & Scott, Mile High Card Co., Sterling Sports, Love of the Game). PRIVATE SALE is off-market: collector-to-collector, private dealer network, estate, or eBay Live buy-it-now. SHOW DEAL is a show-floor transaction at a major vintage show (The National, Chantilly, Dallas, White Plains, Hunt Live, Philly, Cincinnati, Cleveland). REGISTRY MOVE is a PSA or SGC Set Registry advancement \u2014 a new #1, a set completion, or a major upgrade. INSTITUTIONAL is a Hall of Fame, university, or museum acquisition \u2014 rare but high-signal for the highest-value vintage.',
  },
  {
    question: 'Why is this a separate feed from Grail Watch?',
    answer: 'Grail Watch is multi-era and runs $1K+ across modern, ultra-modern, and vintage pools. The pool skews heavily modern because that\u2019s where hobby volume sits today \u2014 most events on Grail Watch are 1990s Hall of Famers, 2000s rookies, and 2020s Prizm parallels. A dedicated Vintage Wire lets a vintage-focused collector watch the pre-1980 market without modern noise. The context streams are also different: Grail Watch includes break pulls and graded mailday returns (both modern-dominant channels), while Vintage Wire adds Show Deal and Registry Move (vintage-dominant channels that barely move the modern market).',
  },
  {
    question: 'Why the era-specific context weighting?',
    answer: 'Pre-war vintage flows disproportionately through auction houses and institutional acquisitions because provenance and grading density dominate pricing \u2014 the T206 Wagner, 1933 Goudey Ruths, and the handful of surviving pre-war national-level cards change hands through Heritage, REA, and Memory Lane, not card shows. 70s vintage flows more heavily through private dealer networks and show floors because dealer inventory at sub-$10K is still the default channel for 70s Topps and OPC hockey. Golden Age (50s\u201360s) sits in the middle, with a balanced mix. The feed models this by weighting contexts per era: pre-war events are 40% more likely to be hammer/institutional; 70s events are 50% more likely to be show/private.',
  },
  {
    question: 'Are the grades realistic?',
    answer: 'Each event assigns a plausible grade based on era. Pre-war cards almost never grade above PSA 8 \u2014 the population is dominated by 3\u20137 ranges with a handful of 8s and an occasional 8.5. Golden Age cards top out at PSA 9 with most examples in the 5\u20138 range. 70s vintage can reach PSA 10, though 9 is the realistic ceiling for most issues. Gradeable events pull from PSA, SGC, and BVG (Beckett Vintage Grading) \u2014 these are the three grading services that vintage collectors actually trust. Raw events fire about 25% of the time for private and show contexts (the classic "ungraded vintage changes hands" pattern).',
  },
  {
    question: 'What do the flair badges mean?',
    answer: 'BIG MONEY fires on a price multiplier above 1.35x FMV AND a sale above $25K \u2014 a genuine outlier that either resets comp thinking or reflects an unusually graded example. MUSEUM fires on any Institutional context \u2014 these are rare and high-signal regardless of price. PREMIUM fires on any event that closed 15%+ over FMV but below the BIG MONEY threshold \u2014 a healthy premium, not a record. No flair means the sale cleared within normal range \u2014 still meaningful, just not noteworthy for this ticker.',
  },
  {
    question: 'Why include Registry Moves as a context?',
    answer: 'PSA Set Registry and SGC Registry are where vintage set collectors actually live. A #1 all-time slot change on the 1952 Topps Mantle subject collection, or a completed 100% 1948 Bowman Basketball set, is a real hobby event that moves player-specific demand AND pricing. Registry moves are often precede market moves by weeks \u2014 a collector completing a set creates buying pressure in similar-grade upgrades from other registry competitors chasing them. Seeing a Registry Move on the feed is a signal; tracking enough of them shows where vintage set-building attention is concentrated.',
  },
  {
    question: 'Is this showing real sales?',
    answer: 'No. Every event on Vintage Wire is simulated using CardVault\u2019s pre-1980 card database (800+ vintage entries as of this release) with era-weighted and value-weighted sampling. This is a live-feel demonstration of what a vintage-aggregator ticker could look like if hooked to live data sources from Heritage / REA / Goldin Vintage / Memory Lane auction APIs, major show-floor transaction logs, and PSA/SGC Registry events. Use it for entertainment and for building intuition about how vintage moves across contexts \u2014 not as a record of actual historical sales.',
  },
];

export default function VintageWirePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Vintage Wire',
        description: 'Live-feel ticker for pre-1980 vintage sports cards. Aggregates simulated events across auction hammers (Heritage, REA, Memory Lane, Huggins & Scott, Mile High), private-dealer sales, major show-floor deals, PSA/SGC Registry advancements, and institutional acquisitions. Filterable by era band (pre-war / Golden Age / 70s), value floor, sport, and context type.',
        url: 'https://cardvault-two.vercel.app/vintage-wire',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-stone-950/60 border border-stone-700/50 text-stone-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Live ticker &middot; Pre-1980 vintage only &middot; Heritage / REA / Memory Lane / shows / registry
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Vintage Wire</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Live-feel feed of pre-1980 vintage card moments. Auction hammers from the vintage-specialty houses, off-market private-dealer sales, show-floor transactions, PSA and SGC Registry moves, and institutional acquisitions \u2014 all in one stream, filtered by era, value floor, sport, and context.
        </p>
      </div>

      <VintageWireClient />

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">How vintage moves differently</h2>
        <div className="prose prose-invert max-w-none text-sm text-gray-300 space-y-3">
          <p>
            Vintage cards \u2014 for the purposes of this feed, anything before 1980 \u2014 flow through a fundamentally different set of channels than modern. A 1986 Fleer Jordan PSA 10 might change hands on eBay, on Whatnot Live, in a group break, or via a Fanatics Collect listing. A 1952 Topps Mantle PSA 8 almost certainly does not. It moves through Heritage, REA, Memory Lane, a private-dealer network, or a show.
          </p>
          <p>
            The Vintage Wire is built to reflect that distinction. The five context streams are chosen to match how pre-1980 cards actually change hands: two public-auction streams (Auction Hammer), two peer channels (Private Sale, Show Deal), one registry-building signal (Registry Move), and one high-end provenance channel (Institutional). Break pulls and graded-mailday returns \u2014 the dominant modern streams \u2014 are deliberately excluded because they almost never produce vintage events.
          </p>
          <p>
            The era weighting is also different. Pre-war cards are auction-and-provenance-dominated. 70s vintage is show-and-private-dealer-dominated. Golden Age sits in between. Over an hour of watching, you\u2019ll see the mix shift naturally as the pool pulls events from each era \u2014 a 33 Goudey Ruth will be a Heritage hammer, a 75 Topps Brett will be a Philly Show cash deal, and a 52 Topps Mantle could go either way.
          </p>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-amber-300 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Live Feeds & Archives</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/grail-watch" className="text-amber-300 hover:text-amber-200">Grail Watch ($1K+, all eras)</Link>
          <Link href="/steal-watch" className="text-amber-300 hover:text-amber-200">Steal Watch (under-FMV closings)</Link>
          <Link href="/consignment-drop" className="text-amber-300 hover:text-amber-200">Consignment Drop (opening lots)</Link>
          <Link href="/auction-wire" className="text-amber-300 hover:text-amber-200">Auction Wire (closings)</Link>
          <Link href="/auction-archive" className="text-amber-300 hover:text-amber-200">Auction Archive</Link>
          <Link href="/pop-watch" className="text-amber-300 hover:text-amber-200">Pop Watch (grading velocity)</Link>
          <Link href="/year-in-cards" className="text-amber-300 hover:text-amber-200">The Year in Cards</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/live-hub" className="text-amber-300 hover:text-amber-200">&larr; Live Hub</Link>
        <Link href="/" className="text-amber-300 hover:text-amber-200">Home</Link>
      </div>
    </div>
  );
}
