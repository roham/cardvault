import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PaymentPlanClient from './PaymentPlanClient';

export const metadata: Metadata = {
  title: 'Card Payment Plan Calculator — True Cost of Financing Cards | CardVault',
  description: 'Calculate the real cost of financing expensive sports card purchases. Compare eBay Pay Later, PWCC Vault layaway, Afterpay, Klarna, and credit cards. See monthly payments, total interest, and whether card appreciation covers financing costs. Free payment plan calculator for card collectors.',
  openGraph: {
    title: 'Card Payment Plan Calculator — True Cost of Financing | CardVault',
    description: 'Compare eBay, PWCC, Afterpay, Klarna, and credit card financing for sports cards. See the real cost.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Payment Plan Calculator — CardVault',
    description: 'Calculate the true cost of financing card purchases across eBay, PWCC, Afterpay, and credit cards. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Payment Plan Calculator' },
];

const faqItems = [
  {
    question: 'Should I finance a sports card purchase?',
    answer: 'It depends on the financing terms and the card. 0% interest plans (eBay 4-6 month, Afterpay, Klarna) make sense for cards you are confident in — you spread the cost without paying extra. Interest-bearing plans (eBay 12-24 month at 9.99% APR, credit cards at 20%+) should only be used if you believe the card will appreciate faster than the interest rate. For most cards, saving up and buying with cash is the smartest financial move.',
  },
  {
    question: 'What is the cheapest way to finance a card purchase?',
    answer: 'The cheapest financing options are: (1) eBay Pay Later at 0% for 4 or 6 months on purchases over $99, (2) Afterpay or Klarna which split the cost into 4 payments over 6 weeks with no interest, and (3) a credit card with a 0% introductory APR offer (usually 12-18 months on new cards). Avoid carrying a balance on a regular credit card — 22% APR turns a $1,000 card into a $1,220 card over one year.',
  },
  {
    question: 'How does eBay Pay Later work for cards?',
    answer: 'eBay Pay Later offers installment plans on purchases over $99. The 4-month and 6-month plans are 0% interest. The 12-month plan (for $499+) and 24-month plan (for $999+) charge 9.99% APR. You must have an eBay account in good standing to qualify. Payments are automatically charged to your payment method. Late payments may result in losing the promotional rate.',
  },
  {
    question: 'Is PWCC Vault layaway worth it?',
    answer: 'PWCC Vault layaway charges a flat fee (typically 5-8%) instead of interest. This means you know the exact total cost upfront. For a $5,000 card, a 5% fee is $250 — comparable to 6 months of 9.99% APR interest. The advantage is predictability and the card is securely stored in PWCC\'s vault during the payment period. Best for high-value auction wins where you need time to fund the purchase.',
  },
  {
    question: 'How do I calculate if card appreciation covers financing costs?',
    answer: 'The calculator compares your expected annual appreciation rate against the total financing cost. For example, if you finance a $2,000 card at 9.99% APR for 12 months, you will pay about $105 in interest. If the card appreciates 10% in that year ($200 gain), the appreciation more than covers the financing cost — making it a net positive. However, card appreciation is never guaranteed, so this analysis should be one factor among many in your decision.',
  },
];

export default function PaymentPlanPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Payment Plan Calculator — True Cost of Financing Cards',
        description: 'Calculate the real cost of financing sports card purchases. Compare eBay, PWCC, Afterpay, Klarna, and credit cards.',
        url: 'https://cardvault-two.vercel.app/tools/payment-plan',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          eBay &middot; PWCC &middot; Afterpay &middot; Klarna &middot; Credit Cards &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Payment Plan Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Thinking about financing that grail card? See the true cost of every payment option — from 0% eBay installments to credit card debt. Compare monthly payments, total interest, and whether card appreciation makes financing worth it.
        </p>
      </div>

      <PaymentPlanClient />

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-lg font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="px-4 py-3 text-white text-sm font-medium cursor-pointer hover:text-blue-400 transition-colors list-none flex items-center justify-between">
                {f.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9662;</span>
              </summary>
              <div className="px-4 pb-3 text-gray-400 text-sm leading-relaxed">{f.answer}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Footer breadcrumb */}
      <div className="mt-12 pt-6 border-t border-gray-800 flex flex-wrap gap-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-300">Home</Link>
        <span>/</span>
        <Link href="/tools" className="hover:text-gray-300">Tools</Link>
        <span>/</span>
        <span className="text-gray-400">Payment Plan Calculator</span>
      </div>
    </div>
  );
}
