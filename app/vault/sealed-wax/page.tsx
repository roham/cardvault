import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SealedWaxVault from './SealedWaxVault';

export const metadata: Metadata = {
  title: 'Sealed Wax Investment Vault — Track Hobby Box & Sealed Product Appreciation',
  description: 'Track your sealed wax investments. 58 products across baseball, basketball, football, hockey, and Pokemon. Monitor appreciation, get rip-or-hold signals, and analyze your sealed product portfolio ROI.',
  openGraph: {
    title: 'Sealed Wax Investment Vault — CardVault',
    description: 'Track sealed product investments. Appreciation tracking, rip-or-hold signals, and portfolio ROI analysis for hobby boxes, blasters, ETBs, and more.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Sealed Wax Investment Vault — CardVault',
    description: 'Track sealed product investments with appreciation, rip-or-hold signals, and portfolio ROI.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Sealed Wax' },
];

const faqItems = [
  {
    question: 'What is the Sealed Wax Investment Vault?',
    answer: 'The Sealed Wax Investment Vault tracks your sealed product investments — hobby boxes, blasters, ETBs, mega boxes, and more. Add products you own with your purchase price, and we calculate estimated market appreciation, rip-or-hold signals, and portfolio ROI. We track 58 products across baseball, basketball, football, hockey, and Pokemon.',
  },
  {
    question: 'How is sealed product appreciation calculated?',
    answer: 'Appreciation is estimated using a model that considers product age, type (hobby boxes appreciate faster than retail), sport (Pokemon sealed typically carries the highest premium), and original retail price. Older products and hobby-tier boxes generally show stronger appreciation. These are estimates — actual market values vary by condition, demand, and availability.',
  },
  {
    question: 'What does the rip-or-hold signal mean?',
    answer: 'The rip-or-hold signal compares the expected value (EV) of opening the product to its estimated sealed market value. HOLD means the sealed premium is strong — you get more value keeping it sealed. RIP IT means opening the product offers better expected value than selling it sealed. NEUTRAL means the values are close and it depends on your preference.',
  },
  {
    question: 'Why do sealed hobby boxes appreciate more than retail products?',
    answer: 'Hobby boxes typically contain guaranteed hits (autographs, relics, numbered parallels) and more packs per box, making them more desirable to collectors and investors. They are also produced in smaller quantities than retail products like blasters and hangers, creating scarcity. Once a product goes out of print, hobby boxes tend to command significantly higher premiums.',
  },
  {
    question: 'Is my sealed wax portfolio data saved?',
    answer: 'Yes, your portfolio is saved locally in your browser using localStorage. Your data stays on your device — we do not collect or store any personal investment information. Clear your browser data to reset your vault.',
  },
];

export default function SealedWaxVaultPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Sealed Wax Investment Vault',
        description: 'Track sealed product investments with appreciation estimates, rip-or-hold signals, and portfolio ROI analysis.',
        url: 'https://cardvault-two.vercel.app/vault/sealed-wax',
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
          58 Products &middot; 5 Sports &middot; Rip-or-Hold Signals &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Sealed Wax Investment Vault</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Track your sealed product investments. Monitor appreciation on hobby boxes, blasters, ETBs, and more.
          Get rip-or-hold signals and analyze your sealed wax portfolio&rsquo;s ROI.
        </p>
      </div>

      <SealedWaxVault />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-gray-700/50 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/30 border border-gray-700/30 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-indigo-300 transition-colors list-none flex items-center justify-between">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
