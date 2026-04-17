import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ChargebackScannerClient from './ChargebackScannerClient';

export const metadata: Metadata = {
  title: 'Chargeback Risk Scanner — Before You Ship, Score the Sale | CardVault',
  description: 'Free seller-side chargeback risk scanner for sports and Pokemon card sellers. Enter payment platform, buyer profile, card value, shipping method, and ten other signals \u2014 get a 0-100 chargeback risk score with a pre-ship hardening checklist.',
  openGraph: {
    title: 'Chargeback Risk Scanner — CardVault',
    description: 'Before you ship: score the sale. Ten signal axes and six red-flag toggles. 0-100 chargeback risk with verdict and playbook.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Chargeback Risk Scanner — CardVault',
    description: 'Will this buyer chargeback? Free 0-100 seller-side scanner for eBay, PayPal, Zelle, Venmo, wire, and more.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Chargeback Risk Scanner' },
];

const faqItems = [
  {
    question: 'What is a chargeback and how is it different from a return?',
    answer: 'A return is a voluntary refund you issue within a return window you set. A chargeback is the buyer\u2019s credit-card issuer or bank reversing the transaction against you, typically 7-120 days after sale, and almost always decided in the buyer\u2019s favor unless you have documented proof of delivery, proof of condition, and a legitimate return process. Chargebacks also carry a $15-25 bank fee on top of the refunded amount. For sports card sellers, chargebacks are the single most common loss vector after lost-mail claims.',
  },
  {
    question: 'Why does the payment platform matter so much?',
    answer: 'Because seller protection varies by an order of magnitude across platforms. eBay Managed Payments will cover authenticity and Item-Not-Received claims IF you ship with tracking and signature on items over $750. PayPal Goods & Services offers similar protection, weaker. PayPal Friends & Family, Venmo Friends & Family, and Zelle have ZERO seller protection \u2014 but the buyer\u2019s credit-card issuer can still file a bank chargeback on the underlying card used to fund the payment, so you are not protected even on a "final" P2P transfer. Cash or in-person-verified cashier\u2019s check are the only payment methods with zero chargeback exposure.',
  },
  {
    question: 'What is the single biggest chargeback tell?',
    answer: 'A buyer who insists on paying off-platform. When a buyer says "I don\u2019t trust PayPal, let me Zelle / Venmo / Cash App you," their usual goal is to strip your seller protection so they can file a bank chargeback without a dispute process to contend with. The less obvious version: a buyer who asks you to upgrade from eBay to a direct Stripe invoice "because of the fees." Every layer of platform stripped out is a layer of your protection stripped out. Refuse politely; real buyers accept platform fees as a cost of transacting safely.',
  },
  {
    question: 'What should I do for an ELEVATED or HIGH RISK verdict?',
    answer: 'First: do not ship until conditions change. Second: offer the buyer a choice to migrate the payment to a protected platform (eBay Managed or PayPal G&S) with signature-required shipping; if they refuse, cancel and refund the original payment. Third: if you do proceed, maximize documentation \u2014 video-pack the card with a 360-degree shot of the card, the tracking label being applied, and the sealed package being handed to the carrier. Fourth: ship with signature required and adult-signature adult-only where available. Fifth: retain the video, photos, and shipping receipt for 180 days post-delivery, which is the typical chargeback filing window.',
  },
  {
    question: 'Does using a $3-5 "extra" signature-required upgrade actually help?',
    answer: 'Yes. Signature confirmation is the single most effective anti-chargeback measure for hobby shipments above $250. Without signature, the buyer\u2019s Item-Not-Received claim relies only on tracking, which shows delivery to a location but not to a person. With signature confirmation, you have documented proof that someone at the delivery address accepted the package \u2014 which is dispositive in 80%+ of INR disputes. On a $500 card, a $4 signature upgrade is 0.8% of the transaction and prevents the typical chargeback outcome of full refund + $25 fee = $525 lost.',
  },
  {
    question: 'What is the "video unboxing" the scanner mentions?',
    answer: 'Some sellers ask buyers of high-value cards to record an unboxing video the moment the package arrives, showing the seal intact, the card inside the sealed condition, and any defects. This creates a mutual documentation record that limits future dispute options for both sides. Most legitimate buyers will agree. Refusal from the buyer is itself a red flag \u2014 why would someone who paid real money object to a 60-second video that protects them too? Note that video unboxing is negotiable and not something you can demand; framing it as "for both of our records" usually gets a yes.',
  },
  {
    question: 'Are international sales really that risky?',
    answer: 'Most major destinations (Canada, UK, Australia, Germany, Japan) are manageable with the standard protections \u2014 signature required, tracked insured, Customs declaration with accurate value. Risk jumps for: destinations without reliable postal systems (parts of Latin America, Africa, CIS), for freight-forwarder addresses (which obscure the true recipient and strip buyer-protection in some cases), and for buyers who ask you to mark the package as "gift" to avoid customs duties \u2014 which is illegal and will void your insurance if a claim is needed. For cards over $2,000 shipping internationally, use DDP (Delivered Duty Paid) with a registered carrier and declare full value.',
  },
];

export default function ChargebackScannerPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Chargeback Risk Scanner',
        description: 'Seller-side chargeback risk scoring tool for sports and Pokemon card sellers. Combines payment platform, buyer profile, card value, shipping method, return policy, and procedural red flags into a 0-100 chargeback risk score with pre-ship hardening checklist.',
        url: 'https://cardvault-two.vercel.app/tools/chargeback-scanner',
        applicationCategory: 'SecurityApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 text-red-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          Chargeback Risk &middot; 0-100 seller-side score &middot; 10 signal axes &middot; 6 red-flag toggles
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Chargeback Risk Scanner</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Before you drop that package in the mailbox, score the sale. The scanner weights payment platform, buyer profile, card value, off-platform pressure, photos, shipping method, destination, return policy, and prior dispute history into a 0-100 chargeback risk score with a verdict and a pre-ship hardening checklist.
        </p>
      </div>

      <ChargebackScannerClient />

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-red-300 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Tools & Guides</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/tools/counterfeit-scanner" className="text-red-300 hover:text-red-200">Counterfeit Risk Scanner</Link>
          <Link href="/tools/shill-detector" className="text-red-300 hover:text-red-200">Shill Bid Detector</Link>
          <Link href="/vault/shipping-claim" className="text-red-300 hover:text-red-200">Shipping Insurance Claim</Link>
          <Link href="/vault/bill-of-sale" className="text-red-300 hover:text-red-200">Bill of Sale Generator</Link>
          <Link href="/tools/shipping-calc" className="text-red-300 hover:text-red-200">Shipping Calculator</Link>
          <Link href="/tools/selling-platforms" className="text-red-300 hover:text-red-200">Selling Platforms Comparison</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/tools" className="text-red-300 hover:text-red-200">&larr; All Tools</Link>
        <Link href="/guides" className="text-red-300 hover:text-red-200">Guides</Link>
        <Link href="/" className="text-red-300 hover:text-red-200">Home</Link>
      </div>
    </div>
  );
}
