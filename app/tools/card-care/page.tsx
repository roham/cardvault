import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardCareGuide from './CardCareGuide';

export const metadata: Metadata = {
  title: 'Card Cleaning & Care Guide — How to Safely Clean Sports Cards',
  description: 'Free interactive card care guide. Learn how to safely clean fingerprints, dust, dirt, wax stains, and more from sports cards and Pokemon cards. Risk assessment, step-by-step instructions, and prevention tips.',
  openGraph: {
    title: 'Card Cleaning & Care Guide — CardVault',
    description: 'Learn how to safely clean and protect your card collection. Interactive guide with risk assessment.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Cleaning & Care Guide — CardVault',
    description: 'Safely clean and protect your cards. Free interactive guide with step-by-step instructions.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Card Care Guide' },
];

const faqItems = [
  {
    question: 'Can you clean a sports card without damaging it?',
    answer: 'It depends on the issue. Dust and fingerprints on modern cards can be safely removed with a dry microfiber cloth. However, dirt, wax stains, sticky residue, and yellowing are much riskier to address. The cardinal rule: never use water, cleaners, or solvents on any card. When in doubt, leave it alone — a dirty card is worth more than a damaged one.',
  },
  {
    question: 'Will cleaning a card affect its PSA or BGS grade?',
    answer: 'Yes, potentially. Grading companies can detect evidence of cleaning, and cleaned cards may receive a lower grade or a "cleaned" qualifier. Light dusting with a microfiber cloth is generally safe, but any aggressive cleaning that alters the card surface will likely be detected. For valuable cards you plan to grade, it is better to submit the card as-is.',
  },
  {
    question: 'How should I store my cards to prevent damage?',
    answer: 'The gold standard is: penny sleeve (acid-free) inside a semi-rigid toploader or One-Touch magnetic case. Store upright in a card box at room temperature (65-72F) and low humidity (35-45%). Keep away from direct sunlight, basements, attics, and garages. Add silica gel packets for humidity control. Never use rubber bands, which damage edges.',
  },
  {
    question: 'How do I remove wax stains from vintage cards?',
    answer: 'Unfortunately, wax stains from vintage pack packaging are generally permanent. The wax bonds with the card surface over time and cannot be safely removed at home. Professional card restorers may be able to reduce (not eliminate) the staining. For grading purposes, some wax staining is expected on vintage cards and does not automatically disqualify a card from receiving a decent grade.',
  },
  {
    question: 'What is the best way to handle valuable cards?',
    answer: 'Always handle by the edges — never touch the face or back surface. Wash your hands thoroughly before handling, or wear clean cotton gloves. Work on a clean, soft surface. Sleeve the card immediately after handling. For cards worth $100+, cotton gloves are strongly recommended. Never eat, drink, or smoke near your collection.',
  },
];

export default function CardCarePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Cleaning & Care Guide',
        description: 'Interactive guide to safely cleaning and maintaining sports cards and Pokemon cards. Risk assessment, step-by-step instructions, supplies, and prevention tips.',
        url: 'https://cardvault-two.vercel.app/tools/card-care',
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
        <div className="inline-flex items-center gap-2 bg-teal-950/60 border border-teal-800/50 text-teal-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
          8 Common Issues &middot; Risk Assessment &middot; Step-by-Step &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Cleaning &amp; Care Guide
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Select your card issue, material, and current protection to get a personalized care plan with risk assessment, step-by-step instructions, and prevention tips.
        </p>
      </div>

      <CardCareGuide />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-teal-400 transition-colors list-none flex justify-between items-center">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
