import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ErrorCards from './ErrorCards';

export const metadata: Metadata = {
  title: 'Error Card Value Guide — Identify & Price Printing Errors',
  description: 'Free error card identification and value guide for sports cards and Pokemon. Learn to spot miscuts, wrong backs, blank backs, missing foil, color errors, and more. Estimate error card premiums with our calculator.',
  openGraph: {
    title: 'Error Card Value Guide — CardVault',
    description: 'Identify printing errors on sports cards and estimate their premium over base value. 10 error types covered.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Error Card Value Guide — CardVault',
    description: 'Spot valuable error cards. Free identification guide + premium calculator.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Error Card Value Guide' },
];

const faqItems = [
  {
    question: 'What are error cards and why are they valuable?',
    answer: 'Error cards are trading cards with printing mistakes — miscuts, wrong backs, blank backs, missing foil, color errors, and more. They are valuable because they are unintentional, limited in quantity, and highly collectible. Some error cards like the 1990 Topps Frank Thomas "No Name On Front" sell for $500-$5,000+ while the normal version sells for $5-$20.',
  },
  {
    question: 'How do I know if my card has a real error or is just damaged?',
    answer: 'Real errors are printing mistakes that happened at the factory. Key differences: (1) Errors are consistent across the entire card — damage affects only specific areas. (2) Errors look "clean" — the mistake is precise, not worn or scratched. (3) Many errors are documented in price guides. (4) When in doubt, submit to PSA or BGS — they will authenticate real errors and note alterations. Common fakes include removed foil (check for residue), trimmed borders, and erased text.',
  },
  {
    question: 'Should I get my error card graded?',
    answer: 'Yes, almost always. Authenticated error cards sell for 2-10x more than raw copies because the grading label confirms the error is genuine. PSA, BGS, and CGC all note error designations on their labels (e.g., "NNOF", "Wrong Back", "Blank Back"). The grading cost ($25-$150) is almost always worth it for confirmed error cards on star players.',
  },
  {
    question: 'Which error types are most valuable?',
    answer: 'The most valuable error types are: (1) Wrong backs on star players (5-50x premium), (2) Missing name / No Name On Front on star players (3-50x), (3) Inverted/upside down printing (5-100x), (4) Blank backs (3-20x), and (5) Missing foil on premium cards (2-10x). The value depends heavily on the base card — an error on a Mike Trout rookie is worth exponentially more than the same error on a common player.',
  },
  {
    question: 'How common are error cards in modern sets?',
    answer: 'Modern printing technology has made error cards significantly rarer than in the 1980s-90s. The "junk wax era" (1987-1993) produced the most errors due to massive overproduction and looser quality control. Today, modern sets like Topps Chrome, Prizm, and Select occasionally produce errors, but they are caught faster and in smaller quantities — which actually makes them more collectible and valuable per-error.',
  },
];

export default function ErrorCardsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Error Card Value Guide & Premium Calculator',
        description: 'Identify printing errors on sports cards, learn how to spot them, and estimate the premium over base value. Covers 10 error types including miscuts, wrong backs, blank backs, and more.',
        url: 'https://cardvault-two.vercel.app/tools/error-cards',
        applicationCategory: 'UtilitiesApplication',
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
          10 Error Types &middot; Premium Calculator &middot; Grading Advice &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Error Card Value Guide</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Is your card worth more because of a printing error? Select an error type to learn how to identify it, see famous examples, and estimate the premium over the normal card value.
        </p>
      </div>

      <ErrorCards />

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
          CardVault provides free tools for card collectors. Check your card&apos;s{' '}
          <a href="/tools/grading-roi" className="text-emerald-400 hover:underline">grading ROI</a>,{' '}
          verify with our <a href="/tools/auth-check" className="text-emerald-400 hover:underline">authentication checker</a>,{' '}
          or use the <a href="/tools/centering-calc" className="text-emerald-400 hover:underline">centering calculator</a>{' '}
          before submitting for grading. Browse <a href="/sports" className="text-emerald-400 hover:underline">sports cards</a>{' '}
          or <a href="/pokemon" className="text-emerald-400 hover:underline">Pokemon cards</a> with real pricing data.
        </p>
      </section>
    </div>
  );
}
