import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CheatSheetsClient from './CheatSheetsClient';

export const metadata: Metadata = {
  title: 'Card Collecting Cheat Sheets — Quick-Reference Guides for Every Scenario | CardVault',
  description: '8 mobile-friendly cheat sheets for card collectors. Card show buying guide, eBay selling checklist, grading decision tree, authentication checks, storage tips, rookie investing, condition assessment, and shipping guide. 82 actionable tips with interactive checklists.',
  openGraph: {
    title: 'Card Collecting Cheat Sheets | CardVault',
    description: '8 quick-reference guides with 82 tips for buying, selling, grading, and collecting sports cards.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Collecting Cheat Sheets — CardVault',
    description: '8 cheat sheets for card shows, eBay selling, grading, authentication, storage, and more.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'News', href: '/news' },
  { label: 'Cheat Sheets' },
];

const faqItems = [
  {
    question: 'What are card collecting cheat sheets?',
    answer: 'Cheat sheets are quick-reference guides designed to be used in real collecting scenarios — at card shows, while listing on eBay, before grading submissions, and when evaluating card purchases. Each sheet contains 10-12 actionable tips with detailed explanations you can check off as you complete them.',
  },
  {
    question: 'Can I use these cheat sheets at a card show on my phone?',
    answer: 'Yes — these cheat sheets are designed mobile-first for exactly that use case. Open the Card Show Buying Guide on your phone before you walk in, and check off items as you go. The interactive checkboxes help you track your progress through the show.',
  },
  {
    question: 'How do I know if a card is fake?',
    answer: 'Our Authentication Quick Check sheet covers 10 red flags including card stock thickness, rosette dot patterns under magnification, edge cutting quality, holographic element verification, and slab label authentication. The most reliable method is checking PSA cert numbers on psacard.com/cert for slabbed cards.',
  },
  {
    question: 'When should I grade a sports card?',
    answer: 'Our Grading Decision Tree helps you decide. The general rule: only grade if the gem mint (PSA 10) value is at least 3x the raw value plus grading cost. Cards worth less than $50 raw rarely justify grading fees. Focus on key rookies, vintage cards, and high-demand players in flagship sets like Topps Chrome, Prizm, and Upper Deck Young Guns.',
  },
  {
    question: 'What is the safest way to ship sports cards?',
    answer: 'Our Shipping Guide covers the 10-step process: penny sleeve first, then top loader, sealed with team bag, sandwiched between cardboard, in a bubble mailer with tracking. Cards under $20 can go in a plain white envelope (PWE) with a non-machinable stamp. Cards over $100 should include insurance. Always get a receipt when dropping off at the post office.',
  },
];

export default function CheatSheetsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Collecting Cheat Sheets',
        description: '8 quick-reference guides with 82 actionable tips for buying, selling, grading, and collecting sports cards.',
        applicationCategory: 'ReferenceApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: 'https://cardvault-two.vercel.app/cheat-sheets',
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

      <CheatSheetsClient />

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

      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold mb-4 text-white">Related Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', desc: 'Is grading worth it for your card?' },
            { href: '/tools/flip-profit', label: 'Flip Profit Calculator', desc: 'Calculate your net profit after fees' },
            { href: '/tools/shipping-cost', label: 'Shipping Cost Calculator', desc: 'Compare carrier rates and insurance' },
            { href: '/tools/smart-buy-list', label: 'Smart Buy List', desc: 'Build your card show shopping list' },
            { href: '/tools/condition-grader', label: 'Condition Self-Grader', desc: 'Estimate your card\'s grade' },
            { href: '/tools/slab-weight', label: 'Slab Weight Verifier', desc: 'Authenticate slabbed cards by weight' },
            { href: '/guides/card-storage', label: 'Card Storage Guide', desc: 'Complete guide to protecting your cards' },
            { href: '/product-reviews', label: 'Product Reviews', desc: 'Which boxes are worth buying?' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="block p-3 rounded-lg bg-gray-900/60 border border-gray-800 hover:border-gray-600 transition-colors">
              <div className="text-sm font-medium text-white">{l.label}</div>
              <div className="text-xs text-gray-400">{l.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
