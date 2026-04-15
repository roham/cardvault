import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GiftGuideClient from './GiftGuideClient';

export const metadata: Metadata = {
  title: 'Card Gift Guide — Find the Perfect Sports Card Gift | CardVault',
  description: 'Find the perfect sports card gift for any collector. Interactive quiz recommends cards by budget ($10-$500+), recipient age, favorite sport, and occasion. Real card picks from our database with prices and eBay links.',
  openGraph: {
    title: 'Card Gift Guide — CardVault',
    description: 'Find the perfect sports card gift. Personalized recommendations by budget, sport, and occasion.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Gift Guide — CardVault',
    description: 'Free sports card gift recommender. Find the perfect card for any budget and occasion.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Card Gift Guide' },
];

const faqItems = [
  {
    question: 'What is a good sports card to give as a gift?',
    answer: 'The best sports card gift depends on the recipient. For kids and beginners, rookie cards of current young stars like Victor Wembanyama (basketball), Elly De La Cruz (baseball), or CJ Stroud (football) in the $10-$50 range are exciting and accessible. For serious collectors, graded cards (PSA 9 or 10) of HOF players provide lasting value. Sealed hobby boxes are also popular gifts since the recipient gets the thrill of opening packs.',
  },
  {
    question: 'How much should I spend on a sports card gift?',
    answer: 'Budget depends on the occasion and relationship. For casual gifts ($10-$25), raw rookie cards of popular current players are great options. For birthdays ($25-$100), consider graded cards or sealed hobby boxes. For milestone occasions ($100-$500+), premium graded rookie cards of franchise players or vintage cards of the recipient\'s favorite team hold real investment value and make memorable gifts.',
  },
  {
    question: 'Are sports cards a good gift for kids?',
    answer: 'Yes! Sports cards are excellent gifts for kids aged 8 and up. They teach math (card values, statistics), encourage reading (player bios on the back), build organizational skills (sorting and cataloging), and connect kids to their favorite sports and athletes. Start with a sealed pack or box so they get the excitement of opening, plus 2-3 individual cards of players they know. Budget-friendly packs from Panini Donruss or Topps Series 1 start around $5-$10.',
  },
  {
    question: 'Should I buy raw or graded cards as gifts?',
    answer: 'For most gift-giving, raw (ungraded) cards are the best choice. They cost less, leaving more budget for the card itself, and the recipient can decide later if they want to get it graded. Graded cards (PSA, BGS, CGC, SGC) make sense for premium gifts ($100+) because the protective slab looks impressive and the grade guarantees condition. A PSA 10 card in a display case makes an excellent desk or shelf piece.',
  },
  {
    question: 'What sports card accessories make good add-on gifts?',
    answer: 'Great accessories to pair with a card gift include: a one-touch magnetic holder ($3-$5, displays one card beautifully), penny sleeves and top loaders ($5-$10 for a bundle, protects the collection), a 3-ring binder with 9-pocket pages ($15-$25, organizes cards), or a card storage box ($5-$10, holds hundreds of cards). For serious collectors, a UV display case ($20-$40) or a digital scale for authenticating graded cards ($10-$15) are thoughtful additions.',
  },
];

export default function GiftGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Gift Guide',
        description: 'Find the perfect sports card gift with personalized recommendations by budget, sport, recipient, and occasion.',
        url: 'https://cardvault-two.vercel.app/tools/gift-guide',
        applicationCategory: 'ShoppingApplication',
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
        <div className="inline-flex items-center gap-2 bg-rose-950/60 border border-rose-800/50 text-rose-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
          Personalized Recommendations &middot; Any Budget
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Gift Guide</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Find the perfect sports card gift for any collector. Answer a few questions and get personalized card recommendations with real prices and eBay links.
        </p>
      </div>

      <GiftGuideClient />

      {/* Gift-Giving Tips */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Sports Card Gift-Giving Tips</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Match the Recipient', tip: 'Choose cards of players from their favorite team or sport. A generic "valuable" card means less than their hero\'s rookie.' },
            { title: 'Presentation Matters', tip: 'Put the card in a magnetic one-touch holder or display case. The unboxing experience makes the gift feel premium.' },
            { title: 'Include a Story', tip: 'Write a note about why you chose the card — the player\'s stats, a memorable game, or the card\'s collecting significance.' },
            { title: 'Add Opening Excitement', tip: 'Pair individual cards with a sealed pack or two. The thrill of ripping packs is half the fun of collecting.' },
            { title: 'Consider Condition', tip: 'For display gifts, prioritize eye appeal over grade. A beautiful raw card can look better than a lower-graded slab.' },
            { title: 'Think Long-Term', tip: 'Rookie cards of young stars appreciate over time. A $20 card today could be worth $200 if the player becomes elite.' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
              <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/tools/quiz', label: 'What Should I Collect?', icon: '🎯' },
            { href: '/tools/starter-kit', label: 'Starter Kit Builder', icon: '🎒' },
            { href: '/tools/budget-planner', label: 'Hobby Budget Planner', icon: '💰' },
            { href: '/tools/sealed-ev', label: 'Sealed Product EV', icon: '📦' },
            { href: '/tools/pack-sim', label: 'Pack Simulator', icon: '🎰' },
            { href: '/tools/rookie-finder', label: 'Rookie Card Finder', icon: '🌟' },
            { href: '/tools/card-care', label: 'Card Care Guide', icon: '🧼' },
            { href: '/tools/storage-calc', label: 'Storage & Supplies', icon: '📦' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-sm transition-colors">
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700/50 rounded-xl">
              <summary className="cursor-pointer px-5 py-4 text-white font-medium text-sm flex items-center justify-between">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9662;</span>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Internal links */}
      <section className="border-t border-gray-800 pt-8 mt-8 text-sm text-gray-500">
        <p>
          Looking for more? Browse all <Link href="/tools" className="text-emerald-400 hover:underline">83+ collecting tools</Link>,
          find your <Link href="/tools/quiz" className="text-emerald-400 hover:underline">collector personality</Link>,
          check the <Link href="/tools/sealed-ev" className="text-emerald-400 hover:underline">best sealed products to gift</Link>,
          or explore <Link href="/players" className="text-emerald-400 hover:underline">6,000+ player profiles</Link>.
        </p>
      </section>
    </div>
  );
}
