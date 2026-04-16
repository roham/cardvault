import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BillOfSaleClient from './BillOfSaleClient';

export const metadata: Metadata = {
  title: 'Card Bill of Sale Generator — Private Card Sale Document | CardVault',
  description: 'Free bill-of-sale generator for private card sales. Fill in buyer, seller, card, price, and condition — get a formatted document you can print, sign, and keep for insurance, tax, and provenance records. Essential for any card sale over $500 between private parties.',
  openGraph: {
    title: 'Card Bill of Sale Generator — CardVault',
    description: 'Free printable bill of sale for private card transactions. Insurance-ready, tax-compliant format.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Bill of Sale Generator — CardVault',
    description: 'Generate a bill of sale for your next private card transaction.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Bill of Sale' },
];

const faqItems = [
  {
    question: 'When do I actually need a bill of sale for cards?',
    answer: 'Three situations: (1) private-party sales over $500 — you want a paper trail in case the buyer disputes authenticity or condition, (2) sales you intend to report for tax purposes — the IRS treats collectibles as capital assets and requires basis + sale price documentation, (3) cards you want to add to a homeowner or jewelry-floater insurance rider — insurers typically require a bill of sale to establish the scheduled value. Below $500 most collectors skip the paperwork but the risk is yours.',
  },
  {
    question: 'Is this document legally binding?',
    answer: 'A properly executed bill of sale with both signatures, a date, and consideration (price) is generally enforceable as evidence of a completed transaction in most US states. It is not a contract of sale in the fuller legal sense — no warranties are created by this document unless you add them manually. For cards over $5,000 or transactions with significant warranty obligations, consult an attorney and consider a formal sales agreement with defects disclosure, as-is language, and return window terms.',
  },
  {
    question: 'What information is required?',
    answer: 'Standard fields: seller full legal name + address, buyer full legal name + address, card identification (year, set, player, card number, grade if graded + cert number), condition disclosure, sale price, payment method, date of transaction, signatures. Optional but recommended: included accessories (case, COA), photographic attachments referenced by filename, any warranties being made, "as is" language if no warranty.',
  },
  {
    question: 'How do I handle graded cards differently?',
    answer: 'Graded cards include the grading service (PSA/CGC/BGS/SGC), the grade, and the certification number. The cert number is the canonical identifier — any dispute can be resolved by checking the grading service database against that number. Always verify the cert number on a grading-service website before signing. Never accept a graded card whose cert number does not match the label or the database.',
  },
  {
    question: 'Can I use this for shows, Whatnot, or eBay?',
    answer: 'Card show and private in-person sales: yes, exactly the use case. Whatnot and eBay: not typically needed — the platform\'s transaction record (invoice, shipping label, payment log) serves as the bill of sale equivalent. Consider this tool for the ~30% of hobby transactions that happen off-platform — card shows, Facebook groups, Reddit r/sportscards listings, Instagram DMs, direct text trades.',
  },
  {
    question: 'Do I need to notarize it?',
    answer: 'Not for cards. Notarization is required for certain vehicle titles and real estate transfers but not for personal property sales like trading cards. Two signatures plus the date are sufficient in almost all cases. If you are in a dispute, the court will treat the signed document as evidence regardless of notarization status.',
  },
];

export default function BillOfSalePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <Breadcrumb items={breadcrumbs} />

      <header className="mt-4 mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-stone-500/40 bg-stone-500/10 px-3 py-1 text-xs font-semibold text-stone-300">
          LEGAL DOCUMENT · PRINTABLE
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Card Bill of Sale Generator
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400 sm:text-base">
          Generate a properly-formatted bill of sale for a private card transaction. Fill the form, preview the document, print or copy. Use it for insurance riders, tax records, and provenance history.
        </p>
      </header>

      <BillOfSaleClient />

      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="mb-3 text-lg font-semibold">When to use a bill of sale</h2>
        <ul className="space-y-2 text-sm text-slate-300">
          <li><span className="font-semibold text-stone-300">Private-party sales over $500</span> — card shows, Reddit, Facebook groups, Instagram DMs, direct text trades</li>
          <li><span className="font-semibold text-stone-300">Insurance scheduling</span> — cards added to a homeowner policy rider require documented purchase value</li>
          <li><span className="font-semibold text-stone-300">Capital gains reporting</span> — IRS requires basis + sale price documentation for collectibles treated as capital assets</li>
          <li><span className="font-semibold text-stone-300">Provenance tracking</span> — future sale history value. A card with documented chain-of-custody sells at a premium</li>
          <li><span className="font-semibold text-stone-300">Cross-border sales</span> — customs may request a bill of sale to verify declared value</li>
        </ul>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="mb-3 text-lg font-semibold">Frequently asked</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <div key={item.question}>
              <h3 className="text-sm font-semibold text-slate-200">{item.question}</h3>
              <p className="mt-1 text-sm text-slate-400">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Related vault tools</h2>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {[
            { href: '/vault/ship-it', label: 'Shipping Simulator' },
            { href: '/vault/insurance', label: 'Insurance Scheduler' },
            { href: '/vault/negotiator', label: 'Price Negotiator' },
            { href: '/vault/consignment', label: 'Consignment' },
            { href: '/vault/pawn-shop', label: 'Pawn Shop' },
            { href: '/vault', label: 'All Vault Tools →' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-300 hover:border-stone-500/40 hover:text-stone-300"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] text-amber-200">
        <span className="font-semibold">Not legal advice.</span> This generator produces a general bill-of-sale template suitable for routine private card transactions in most US states. For sales over $5,000, cross-border transactions, or disputes, consult a licensed attorney. Laws vary by state and jurisdiction.
      </div>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Card Bill of Sale Generator',
          url: 'https://cardvault-two.vercel.app/vault/bill-of-sale',
          description:
            'Generate a printable bill of sale for private sports card transactions. Buyer + seller + card details + price + signatures.',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        }}
      />
    </main>
  );
}
