import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BGSSubgradeCalc from './BGSSubgradeCalc';

export const metadata: Metadata = {
  title: 'BGS Subgrade Calculator — Calculate Your Beckett Overall Grade',
  description: 'Free BGS subgrade calculator. Enter your Centering, Corners, Edges, and Surface subgrades to instantly calculate the overall Beckett grade. See what-if scenarios, value multipliers, and PSA equivalents.',
  openGraph: {
    title: 'BGS Subgrade Calculator — CardVault',
    description: 'Calculate your overall Beckett grade from 4 subgrades. Free BGS grade calculator with what-if scenarios.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'BGS Subgrade Calculator — CardVault',
    description: 'Enter BGS subgrades and instantly see your overall Beckett grade.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'BGS Subgrade Calculator' },
];

const faqItems = [
  {
    question: 'How does BGS calculate the overall grade from subgrades?',
    answer: 'BGS takes the simple average of all four subgrades (Centering, Corners, Edges, and Surface) and rounds to the nearest half-grade using specific thresholds. For example, an average of 9.375 or higher earns a BGS 9.5 Gem Mint. However, there is a cap rule: no subgrade can be more than 1.0 below the overall grade, so a single weak subgrade can limit your final result.',
  },
  {
    question: 'What subgrade combination gives a BGS 10 Pristine?',
    answer: 'To achieve a BGS 10 Pristine, the average of all four subgrades must be 9.875 or higher. The only combinations that work are all four at 10, or three at 10 and one at 9.5 (average = 9.875). You cannot get a BGS 10 with any subgrade below 9.5 due to the cap rule.',
  },
  {
    question: 'What is the BGS cap rule for subgrades?',
    answer: 'The cap rule states that no subgrade can be more than 1.0 below the overall grade. For instance, if you have subgrades of 10, 10, 10, and 8, the average would be 9.5, but the 8.0 subgrade limits the overall to BGS 9 because 8.0 is more than 1.0 below 9.5. This rule prevents cards with one severely weak area from getting a high overall grade.',
  },
  {
    question: 'Is a BGS 9.5 the same as a PSA 10?',
    answer: 'A BGS 9.5 Gem Mint is generally considered comparable to a PSA 10 Gem Mint in terms of card quality. However, the market typically values PSA 10s slightly higher for most modern cards due to PSA brand recognition. A BGS 10 Pristine (also called "Black Label" when all four subgrades are 10) is considered superior to a PSA 10 and commands significant premiums.',
  },
  {
    question: 'Which BGS subgrade is most commonly the lowest?',
    answer: 'Centering is the most commonly limited subgrade because it is affected by the card manufacturer cutting process, which collectors cannot control. Off-center cuts are easy to spot and consistently result in a lower Centering subgrade. Surface is the second most common limiter, especially on foil, chrome, and refractor cards that show micro-scratches under magnification.',
  },
];

export default function BGSSubgradePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'BGS Subgrade Calculator',
        description: 'Calculate the overall Beckett BGS grade from Centering, Corners, Edges, and Surface subgrades.',
        url: 'https://cardvault-two.vercel.app/tools/bgs-subgrade',
        applicationCategory: 'UtilityApplication',
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
          Centering &middot; Corners &middot; Edges &middot; Surface &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">BGS Subgrade Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Enter your four Beckett subgrades to instantly calculate the overall BGS grade. See what-if scenarios to find which subgrade is holding your card back, plus value multipliers and PSA equivalents.
        </p>
      </div>

      <BGSSubgradeCalc />

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
    </div>
  );
}
