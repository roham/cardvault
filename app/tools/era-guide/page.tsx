import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import EraGuide from './EraGuide';

export const metadata: Metadata = {
  title: 'Vintage Card Era Guide — Card Collecting Eras Explained',
  description: 'Interactive guide to every era of card collecting: Pre-War (1887-1945), Post-War Golden Age (1946-1969), Vintage (1970-1980), Junk Wax (1981-1993), Modern (1994-2010), and Ultra-Modern (2011-present). Key manufacturers, notable cards, grading tips, and investment outlook.',
  openGraph: {
    title: 'Card Collecting Era Guide — CardVault',
    description: 'Explore every era of card collecting from 1887 to today. Key cards, grading tips, and investment outlook per era.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Collecting Era Guide — CardVault',
    description: '6 eras of card collecting explained. Grading tips, notable cards, and investment outlook.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Era Guide' },
];

const faqItems = [
  {
    question: 'What are the main eras of card collecting?',
    answer: 'There are six main eras: Pre-War (1887-1945) when tobacco and candy companies issued cards, Post-War Golden Age (1946-1969) when Topps and Bowman dominated, Vintage (1970-1980) when the hobby expanded across sports, Junk Wax (1981-1993) when overproduction crashed the market, Modern (1994-2010) when Chrome refractors and autographs transformed collecting, and Ultra-Modern (2011-present) when social media and COVID drove mainstream adoption.',
  },
  {
    question: 'Which card collecting era has the best investment potential?',
    answer: 'Pre-War and Post-War Golden Age cards have the strongest long-term track record — scarcity increases every year. Modern era key rookies (Trout, LeBron, Brady) are also proven blue chips. Junk Wax era cards are mostly worthless except for key rookies in PSA 10 and error cards. Ultra-Modern is the most volatile — tied to current player performance.',
  },
  {
    question: 'What is the Junk Wax Era and why are those cards worthless?',
    answer: 'The Junk Wax Era (1987-1993) saw massive overproduction of baseball cards. Companies like Topps, Fleer, Donruss, Score, and Upper Deck printed millions of copies of each card. A 1989 Ken Griffey Jr. Upper Deck might have 2 million+ copies. Supply vastly exceeded demand, making most base cards worth under $1. However, key rookies in gem mint condition (PSA 10) and error cards from this era can still be valuable — a PSA 10 1986 Fleer Michael Jordan sells for $50K+.',
  },
  {
    question: 'How do I tell what era a card is from?',
    answer: 'Check the year and manufacturer. Pre-War: tobacco and candy company brands (T206, Goudey). Post-War: Bowman (1948-55), early Topps. Vintage: Topps-only era (1970s). Junk Wax: multiple brands (Topps, Fleer, Donruss, Score, Upper Deck). Modern: Chrome, refractors, numbered parallels, autographs. Ultra-Modern: Panini Prizm, Topps Chrome, Bowman Chrome, heavy parallel/insert focus.',
  },
  {
    question: 'Should I buy vintage or modern cards?',
    answer: 'It depends on your goals. Vintage cards (pre-1980) are better for long-term wealth preservation — they are scarce, have proven track records, and the population only decreases. Modern and ultra-modern cards are better if you enjoy following current players and want the excitement of value swings. Many collectors split their budget: 60% in proven vintage/modern blue chips and 40% in speculative ultra-modern rookies.',
  },
];

export default function EraGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Collecting Era Guide — Every Era Explained',
        description: 'Interactive guide to every era of card collecting from 1887 to present. Key manufacturers, notable cards, grading tips, and investment outlook for Pre-War, Post-War, Vintage, Junk Wax, Modern, and Ultra-Modern eras.',
        url: 'https://cardvault-two.vercel.app/tools/era-guide',
        applicationCategory: 'EducationalApplication',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          6 Eras &middot; 1887 to Present &middot; Grading Tips &middot; Investment Outlook &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Collecting Era Guide</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Explore every era of card collecting — from 1887 tobacco cards to today&apos;s ultra-modern Chrome refractors. Learn what makes each era unique, which cards to collect, and where the investment opportunities are.
        </p>
      </div>

      <EraGuide />

      {/* FAQ Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2">{f.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Internal Links Footer */}
      <section className="mt-12 pt-8 border-t border-gray-800">
        <p className="text-gray-500 text-sm">
          CardVault provides free tools for card collectors of all experience levels. Calculate your{' '}
          <a href="/tools/grading-roi" className="text-emerald-400 hover:underline">grading ROI</a>,{' '}
          check card <a href="/tools/rarity-score" className="text-emerald-400 hover:underline">rarity scores</a>,{' '}
          identify <a href="/tools/error-cards" className="text-emerald-400 hover:underline">error cards</a>,{' '}
          or explore <a href="/tools/investment-calc" className="text-emerald-400 hover:underline">investment returns</a>.{' '}
          Browse <a href="/sports" className="text-emerald-400 hover:underline">sports cards</a>{' '}
          or <a href="/pokemon" className="text-emerald-400 hover:underline">Pokemon cards</a> with real pricing data.
        </p>
      </section>
    </div>
  );
}
