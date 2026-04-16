import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GoldenRulesClient from './GoldenRulesClient';

export const metadata: Metadata = {
  title: '25 Golden Rules of Card Collecting — Every Collector Must Know | CardVault',
  description: 'The 25 essential rules every sports card collector should follow. Interactive checklist with examples, tool links, and a discipline score. From the 3x Grading Rule to the 90-Day Hype Rule.',
  openGraph: {
    title: '25 Golden Rules of Card Collecting — CardVault',
    description: 'The definitive card collecting rulebook. Check off the rules you follow and get your collector discipline score.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '25 Golden Rules — CardVault',
    description: 'How many of the 25 golden rules do you follow? Get your score.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Media', href: '/news' },
  { label: '25 Golden Rules' },
];

const faqItems = [
  {
    question: 'What are the most important card collecting rules for beginners?',
    answer: 'Start with the Sold Listings Rule (always check eBay sold prices before buying), the Penny Sleeve First Rule (protect every card immediately), the Singles Math Rule (buy singles instead of ripping boxes for specific cards), and the Junk Wax Awareness Rule (1987-1993 cards were massively overproduced). These four rules alone will save beginners hundreds of dollars.',
  },
  {
    question: 'How does the 3x Grading Rule work?',
    answer: 'Only submit a card for grading if the PSA 10 value is at least 3x the raw card value plus all grading fees (submission, shipping, insurance). For example, if a raw card is worth $20 and grading costs $30, the PSA 10 needs to be worth at least $150 to justify the investment. Use our Grading ROI Calculator to check any card.',
  },
  {
    question: 'Why should I wait 90 days after hype events to buy cards?',
    answer: 'Card prices spike 50-200% immediately after draft picks, championships, viral moments, and award announcements. This hype premium fades over 30-90 days as the market normalizes. By waiting, you typically save 30-60% on the same card. The 90-Day Hype Rule has been validated by every major card price spike in the last decade.',
  },
  {
    question: 'What is the best way to protect card value long-term?',
    answer: 'Follow the Protecting rules: penny sleeve before toploader (always), store at 65-72°F with 40-50% humidity, handle with clean hands or cotton gloves, and insure collections over $5,000. These simple habits preserve card condition — and condition is value. A PSA 10 vs PSA 8 can be a 5-10x price difference.',
  },
  {
    question: 'How many of these rules do advanced collectors follow?',
    answer: 'Most advanced collectors follow 18-22 of the 25 rules consistently. Elite collectors (90%+ score) follow nearly all of them. The most commonly broken rules are the Break Math Rule (collectors enjoy breaks despite the negative EV) and the Seasonal Buy Rule (emotion overrides patience). Score 75%+ and you are ahead of 90% of the hobby.',
  },
];

export default function GoldenRulesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: '25 Golden Rules of Card Collecting',
        description: 'Interactive checklist of the 25 essential card collecting rules with discipline scoring, examples, and tool recommendations.',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: 'https://cardvault-two.vercel.app/golden-rules',
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

      <GoldenRulesClient />

      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <details key={i} className="group" open={i === 0}>
              <summary className="cursor-pointer text-gray-300 hover:text-white font-medium">{f.question}</summary>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
