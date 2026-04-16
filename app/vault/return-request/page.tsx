import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ReturnRequestClient from './ReturnRequestClient';

export const metadata: Metadata = {
  title: 'Card Return Request Generator — Draft a Refund Letter | CardVault',
  description: 'Free return and refund request letter generator for card buyers. Fill in order details, issue type (damage, counterfeit, misrepresentation, never arrived), and requested resolution — get a professional letter you can send to any seller, marketplace, or chargeback dispute. Works for eBay, COMC, Facebook, Instagram, and private sales.',
  openGraph: {
    title: 'Card Return Request Generator — CardVault',
    description: 'Draft a professional refund request for any card purchase gone wrong. Platform-neutral, chargeback-ready format.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Refund Request Generator — CardVault',
    description: 'Generate a return and refund letter for a bad card purchase. Free, professional template.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Return Request' },
];

const faqItems = [
  {
    question: 'When should I send a formal return request letter?',
    answer: 'Use a formal letter when a marketplace dispute form is not enough — typically when: (1) the seller is on a platform without buyer protection (Facebook, Instagram, direct DM), (2) the seller has already refused an informal request and you need a paper trail, (3) you plan to file a credit card chargeback and need documentation showing you tried to resolve with the seller first (most banks require this), (4) the transaction value is over $200 and you want a clear record. A polite, professional letter resolves ~60% of disputes without escalation because it shows the seller you are serious and prepared.',
  },
  {
    question: 'What is the right timeline for a return request?',
    answer: 'Send within 7 days of receiving the card (or realizing it never arrived). Most marketplaces have 30-day buyer protection windows (eBay Money Back Guarantee is 30 days from delivery). Credit card chargebacks are usually 60 days from the statement date. Acting fast preserves every escalation path. Include a reasonable response deadline in your letter — usually 7-10 business days for the seller to acknowledge and 14 business days for resolution.',
  },
  {
    question: 'What evidence should I include?',
    answer: 'For damaged cards: unopened packaging photos, card photos (front, back, edges, corners), side-by-side comparison with the listing photos, timestamped video of unboxing if possible. For counterfeits: high-resolution photos of the suspect area, reference photos of known authentic versions, third-party authenticator opinion if you obtained one. For misrepresentation: screenshot of the original listing, screenshots of messages, photo of the card received. For never-arrived: tracking screenshot, order confirmation, postal claim number if filed.',
  },
  {
    question: 'What if the seller refuses to respond or refund?',
    answer: 'Escalate in this order: (1) marketplace dispute process (eBay, PayPal, etc.), (2) credit card chargeback — contact the card issuer that processed the payment with your return request letter and evidence as documentation, (3) for sales over $5,000, small claims court in the seller\'s jurisdiction, (4) FBI IC3 report if the transaction appears to involve fraud. Keep copies of every letter, response, and denial — they become evidence at each escalation level.',
  },
  {
    question: 'Can I use this letter for a chargeback?',
    answer: 'Yes — most credit card issuers accept this letter as documentation when you file a chargeback for "not as described" or "service not rendered." Attach the letter, the seller\'s non-response (or refusal), and your evidence. Tell the card issuer you attempted to resolve with the seller first. Banks typically rule in the buyer\'s favor when you have documented evidence and a reasonable written resolution request that the seller ignored or refused.',
  },
  {
    question: 'What if I bought from an out-of-country seller?',
    answer: 'International private-party sales are harder to enforce but not impossible. Marketplace buyer protection (eBay Global Shipping Program, PayPal) usually applies regardless of seller country. Credit card chargebacks also work internationally. For direct DM purchases from overseas sellers: your main leverage is your payment processor. Send the letter in English plus (if possible) a translated version. Mention any platform terms of service the seller agreed to.',
  },
  {
    question: 'Is being polite in the letter necessary?',
    answer: 'Yes. A calm, factual, professional tone resolves disputes faster than emotional language. Sellers are more likely to refund a buyer who comes across as reasonable and organized than one who appears hostile or unhinged. Save the heat for follow-ups if they refuse — the first letter should always read as a straightforward business request. Banks and marketplace dispute reviewers also favor buyers whose correspondence shows good faith.',
  },
  {
    question: 'Should I send the letter via email or certified mail?',
    answer: 'Email works for digital-native platforms (eBay messages, Facebook DM, Instagram, COMC). For private sellers who gave you a physical address — send both email and certified mail with return receipt requested. The certified mail receipt is strong evidence in small claims court and chargeback disputes. Cost is roughly $8-12. Keep the receipt forever.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map(f => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};

export default function ReturnRequestPage() {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={faqSchema} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold mb-4 border border-rose-500/20">
            📨 DOCUMENT GENERATOR
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
            Return &amp; Refund Request
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-3xl">
            Draft a professional refund letter for any card purchase gone wrong — damage, counterfeit, misrepresentation, never arrived. Works on any platform and is ready for chargeback disputes.
          </p>
        </div>

        <ReturnRequestClient />

        <div className="mt-12 space-y-8">
          <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map((f, i) => (
                <details key={i} className="group bg-black/40 border border-gray-800 rounded-xl p-4 hover:border-rose-500/40 transition-colors">
                  <summary className="font-semibold text-white cursor-pointer list-none flex items-start justify-between gap-4">
                    <span>{f.question}</span>
                    <span className="text-rose-400 text-sm mt-0.5 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-gray-400 text-sm leading-relaxed">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="bg-amber-500/5 border border-amber-500/30 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">⚠️</span>
              <div>
                <h3 className="font-bold text-amber-300 mb-1 text-sm">Not legal advice</h3>
                <p className="text-sm text-amber-100/80 leading-relaxed">
                  This generator produces a standard return request letter based on common templates. It does NOT replace legal counsel. For disputes over $5,000, cross-border transactions, allegations of fraud, or situations where the seller has retained a lawyer, consult a consumer-protection attorney in your jurisdiction.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-br from-rose-500/10 to-orange-500/5 border border-rose-500/30 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Related Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/vault/bill-of-sale" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-rose-500/40 transition-colors">
                <span className="text-2xl">📜</span>
                <div>
                  <div className="font-semibold text-white text-sm">Bill of Sale Generator</div>
                  <div className="text-xs text-gray-400">Seller-side document for private sales</div>
                </div>
              </Link>
              <Link href="/tools/auth-check" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-rose-500/40 transition-colors">
                <span className="text-2xl">🔍</span>
                <div>
                  <div className="font-semibold text-white text-sm">Authentication Checker</div>
                  <div className="text-xs text-gray-400">12-point inspection for fake cards</div>
                </div>
              </Link>
              <Link href="/tools/cert-check" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-rose-500/40 transition-colors">
                <span className="text-2xl">✅</span>
                <div>
                  <div className="font-semibold text-white text-sm">PSA Cert Verifier</div>
                  <div className="text-xs text-gray-400">Verify graded card authenticity</div>
                </div>
              </Link>
              <Link href="/tools/damage-assessment" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-rose-500/40 transition-colors">
                <span className="text-2xl">🔬</span>
                <div>
                  <div className="font-semibold text-white text-sm">Damage Assessment</div>
                  <div className="text-xs text-gray-400">Document card condition issues</div>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
