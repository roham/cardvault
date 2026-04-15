import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BulkGradingRoi from './BulkGradingRoi';

export const metadata: Metadata = {
  title: 'Bulk Grading ROI Calculator — Should You Submit Your Cards?',
  description: 'Free bulk grading ROI calculator. Add multiple cards, see which are worth grading and which to skip. Compare PSA, BGS, CGC, and SGC costs. Optimize your grading submission for maximum profit.',
  openGraph: {
    title: 'Bulk Grading ROI Calculator — CardVault',
    description: 'Add your cards, see which are worth grading. Optimize bulk submissions for PSA, BGS, CGC, SGC.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Bulk Grading ROI Calculator — CardVault',
    description: 'Know exactly which cards to grade before you submit. Free bulk ROI calculator.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Bulk Grading ROI' },
];

const faqItems = [
  {
    question: 'How many cards should I submit at once for grading?',
    answer: 'Most grading companies offer volume discounts starting at 20+ cards. PSA offers price breaks at 20, 50, and 100+ cards. BGS and CGC have similar tiers. The optimal batch size is 20-50 cards — large enough for discounts but small enough to manage risk. Never submit cards just to fill a batch if they have negative ROI.',
  },
  {
    question: 'What is the minimum card value worth grading?',
    answer: 'As a general rule, a card should be worth at least 3-4x the grading cost in its current raw condition to justify grading. For PSA Economy at $20/card, the raw card should be worth at least $60-80. For Express at $100/card, the raw card should be worth $300+. Our calculator shows the exact ROI for each card in your submission.',
  },
  {
    question: 'Should I use PSA, BGS, CGC, or SGC for my submission?',
    answer: 'PSA has the largest market share and highest resale premium for most sports cards. BGS is preferred for modern cards due to subgrades and the coveted Black Label. CGC is the cheapest option and gaining market share. SGC is popular for vintage cards. For bulk submissions of modern sports cards, PSA Economy typically offers the best ROI.',
  },
  {
    question: 'How do I estimate my card condition accurately?',
    answer: 'Use our Condition Grader tool for detailed assessment. For this calculator: 5 = pack fresh (PSA 10 candidate), 4 = near mint (PSA 9), 3 = excellent (PSA 8), 2 = good with minor flaws (PSA 7), 1 = visible wear (PSA 5). Be conservative — most collectors overestimate their card conditions by 1-2 grades.',
  },
  {
    question: 'Can I mix grading companies in one submission?',
    answer: 'No. Each grading company requires a separate submission. However, you can strategically split your cards — send high-end modern cards to PSA for maximum resale, vintage to SGC for their holder style, and budget cards to CGC for the lowest cost. Our calculator helps you compare costs across services.',
  },
];

export default function BulkGradingRoiPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Bulk Grading ROI Calculator',
        description: 'Calculate ROI for bulk card grading submissions. Compare PSA, BGS, CGC, SGC costs and determine which cards are worth grading.',
        url: 'https://cardvault-two.vercel.app/tools/bulk-grading-roi',
        applicationCategory: 'FinanceApplication',
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
          Multi-Card Analysis &middot; PSA/BGS/CGC/SGC &middot; Per-Card Verdict &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Bulk Grading ROI Calculator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Add your cards, set conditions, and see exactly which ones are worth grading — and which to skip. Optimize your bulk submission for maximum profit.
        </p>
      </div>

      <BulkGradingRoi />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-purple-400 transition-colors list-none flex justify-between items-center">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* SEO Content */}
      <div className="mt-12 prose prose-invert prose-sm max-w-none">
        <h2>How Bulk Grading ROI Works</h2>
        <p>
          Professional card grading from PSA, BGS, CGC, or SGC adds significant value to sports cards and Pokemon cards — but only if the card is valuable enough to justify the cost. Our bulk calculator analyzes every card in your planned submission individually and as a batch.
        </p>
        <p>
          For each card, we estimate the likely PSA grade based on your condition assessment, calculate the graded value using real market multipliers, subtract the grading cost, and show you the net profit or loss. Cards marked &ldquo;SKIP&rdquo; are costing you money to grade — remove them to improve your batch ROI.
        </p>
        <h3>The 3x Rule of Thumb</h3>
        <p>
          A card&apos;s PSA 10 value should be at least 3x the grading cost for submission to make sense. At $20/card economy pricing, that means the gem mint value should be $60+. This accounts for the risk that not every card will get a 10 — some will come back as 9s or 8s.
        </p>
      </div>
    </div>
  );
}
