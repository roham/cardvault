import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SetBreakCalculator from './SetBreakCalculator';

export const metadata: Metadata = {
  title: 'Set Break Profit Calculator — Should You Break or Keep a Complete Set?',
  description: 'Free set break profit calculator for sports cards. Calculate if breaking a complete set into singles is profitable after platform fees, shipping, and time costs. Compare break vs hold strategies.',
  openGraph: {
    title: 'Set Break Profit Calculator — CardVault',
    description: 'Should you break a complete set? Calculate profit after fees, shipping, and time. Free tool.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Set Break Profit Calculator — CardVault',
    description: 'Calculate if breaking a complete set into singles is profitable.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Set Break Calculator' },
];

const faqItems = [
  {
    question: 'What is a set break in sports cards?',
    answer: 'A set break is when someone buys a complete set of cards and sells each card individually. The idea is that the sum of individual card values exceeds what you paid for the complete set. This is common with vintage sets, high-end modern sets, and sets with valuable rookies or star cards.',
  },
  {
    question: 'When is breaking a set profitable?',
    answer: 'Set breaks tend to be most profitable when: (1) the set has a few very high-value cards that carry most of the value, (2) complete set prices are depressed relative to individual card prices, (3) you can sell commons in bulk lots rather than one at a time, and (4) the set has strong collector demand for individual cards. Sets where value is evenly distributed are usually not worth breaking.',
  },
  {
    question: 'What costs should I factor into a set break?',
    answer: 'You need to account for: platform selling fees (eBay 13.25%, COMC 20%, MySlabs 5%), shipping costs per sale (typically $1-4 per card), packaging supplies ($0.25-1.00 per card), listing time, and potential unsold inventory. Many new breakers underestimate fees and time, which can turn a profitable-looking break into a loss.',
  },
  {
    question: 'How do I handle commons in a set break?',
    answer: 'Commons are the cards in a set that are not star players or rookies. Individually they are worth $0.25-$2 each, so selling them one-by-one is not worth your time. Most breakers sell commons in bulk lots of 25-100 cards at a discount. Our calculator lets you set a bulk price per common to reflect realistic revenue from the non-key cards.',
  },
  {
    question: 'Should I grade key cards before selling?',
    answer: 'Grading can significantly increase the value of key cards (rookies, star players) but adds $15-150 per card in cost and 1-12 months in turnaround time. Generally, grade cards worth $50+ raw that are in near-mint or better condition. Use our Grading ROI Calculator to evaluate specific cards before submitting.',
  },
];

export default function SetBreakPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Set Break Profit Calculator',
        description: 'Calculate if breaking a complete card set into singles is profitable. Factor in fees, shipping, time, and unsold inventory.',
        url: 'https://cardvault-two.vercel.app/tools/set-break',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Break vs Keep &middot; Fee Calculator &middot; Profit Analysis &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Set Break Profit Calculator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Should you break a complete set into singles or keep it intact? Calculate profit after platform fees, shipping, packaging, and time to decide.
        </p>
      </div>

      <SetBreakCalculator />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-amber-400 transition-colors list-none flex justify-between items-center">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-12 bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/tools/set-cost', label: 'Set Completion Cost', desc: 'Estimate cost to complete any set' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', desc: 'Calculate profit on individual card flips' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', desc: 'Should you grade before selling?' },
            { href: '/tools/listing-generator', label: 'eBay Listing Generator', desc: 'Create optimized eBay listings fast' },
          ].map(tool => (
            <a key={tool.href} href={tool.href} className="block p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-lg transition-colors">
              <div className="text-white text-sm font-medium">{tool.label}</div>
              <div className="text-gray-500 text-xs mt-1">{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
