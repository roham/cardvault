import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CostBasisClient from './CostBasisClient';

export const metadata: Metadata = {
  title: 'Cost Basis Aggregator — Multi-Lot Tax Basis Calculator | CardVault',
  description: 'Free multi-lot cost-basis aggregator for cards purchased across multiple transactions. Computes weighted-average, FIFO, LIFO, and specific-identification cost basis per IRS IRC §1012 rules. Essential for Schedule D reporting when you own multiple copies of the same card purchased at different prices.',
  openGraph: {
    title: 'Cost Basis Aggregator — CardVault',
    description: 'Multi-lot cost-basis computation for tax purposes. Weighted-average, FIFO, LIFO, specific-identification. IRS-compliant.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Cost Basis Aggregator — CardVault',
    description: 'Compute weighted-average, FIFO, LIFO, or specific-identification cost basis for multi-lot card holdings.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Cost Basis Aggregator' },
];

const faqItems = [
  {
    question: 'What is cost basis and why does it matter?',
    answer: 'Cost basis is the dollar amount you "paid" for an asset for tax purposes — usually the purchase price plus acquisition costs (shipping, grading fees, sales tax). When you sell, your taxable gain is (sale price - cost basis - selling costs). The IRS requires you to report cost basis on Schedule D of your tax return. For cards purchased in ONE transaction, cost basis is obvious. But if you bought 5 copies of the same card across 5 different dates at 5 different prices, your cost basis for each specific copy depends on which IDENTIFICATION METHOD you elect — weighted-average, FIFO, LIFO, or specific identification. Different methods can produce materially different tax liability.',
  },
  {
    question: 'What are the four cost-basis methods?',
    answer: 'WEIGHTED-AVERAGE (IRS default for mutual funds, allowed for collectibles on election): Sum of all lot costs ÷ total units. Every unit has the same basis. Simple but gives up the ability to harvest specific losses. FIFO (First-In, First-Out): When you sell, the FIRST units acquired are considered sold first. Typical IRS default for most assets. Produces longer holding periods for unsold lots (good for LTCG qualification) but higher taxes in a rising market. LIFO (Last-In, First-Out): When you sell, the LAST units acquired are considered sold first. NOT permitted for securities/collectibles by most IRS interpretations but documented here for completeness. SPECIFIC IDENTIFICATION: At sale time, you designate EXACTLY which lot the sold unit came from. Allowed by IRS if you can document the specific unit sold. Maximum tax flexibility — lets you harvest losses or LTCG-qualified lots as needed.',
  },
  {
    question: 'Which method should I use for cards?',
    answer: 'SPECIFIC IDENTIFICATION is almost always the right answer for cards, assuming you can track each physical card (serial number, cert number, photos). It lets you pick which specific card to sell at tax time — harvest losses, qualify long-term, or minimize gains on a per-sale basis. FIFO is the fallback if you cannot specifically identify which card was sold. WEIGHTED-AVERAGE simplifies but locks you into uniform basis — bad for tax planning. LIFO is generally not permitted for collectibles. The tool shows ALL FOUR methods side-by-side so you can see the tax impact before you elect.',
  },
  {
    question: 'Do I have to use the same method every year?',
    answer: 'Yes. Once you elect a method for a security/collectible class on your tax return, the IRS expects you to stick with it. Changing methods requires filing Form 3115 (Application for Change in Accounting Method). For specific identification, the election is made at each sale — you just designate which lot was sold at the time of sale. For weighted-average, the election is implicitly made when you first report using that method. FIFO is the default if no other election is made. Consult a tax professional before changing methods year-over-year.',
  },
  {
    question: 'What counts toward cost basis (vs "cost of sale")?',
    answer: 'COST BASIS includes: purchase price, shipping paid to acquire the card, sales tax paid on purchase, grading submission fees, authentication fees, and any card-show admission fees if the card was purchased at a show (proportional). COST OF SALE is SEPARATE and deducts at sale time: platform fees (eBay 13%, Whatnot 8%, etc.), shipping costs you pay to ship to buyer, payment processing fees, and consignment commissions. The tool tracks both separately. Many sellers incorrectly roll everything into "cost basis" — the IRS treats these as distinct categories on Schedule D.',
  },
  {
    question: 'What if I lost my purchase records?',
    answer: 'The IRS is STRICT about cost basis documentation — if you cannot prove the basis, they default your basis to ZERO and tax 100% of the sale as gain. If you have partial records, reconstruct what you can: bank statements, PayPal history, eBay purchase history (retained 18 months), Whatnot bid history, credit card statements, and any email receipts. If you truly cannot reconstruct, consult a tax professional about "reasonable reconstruction" techniques — some collectors use dated auction comps as evidence of approximate purchase price, but this is NOT guaranteed IRS acceptance. Going forward: maintain a purchase log (date / source / price / shipping / fees) for every card the moment you acquire it.',
  },
  {
    question: 'How does this handle grading cost basis additions?',
    answer: 'If you buy a RAW card for $100 and later send it to PSA for $50 grading fee, your cost basis is $150 (purchase + grading). The tool lets you add grading / authentication / related acquisition costs as BASIS ADDITIONS on each lot. Each basis addition includes: date, description, amount. When computing FIFO / specific-ID sales, the tool uses (lot purchase + all basis additions for that specific lot). This is IRS-compliant per Treasury Regulation 1.263(a)-1 which treats "cost incurred to acquire an improved state of the asset" as capitalizable to basis.',
  },
  {
    question: 'Is this tax advice?',
    answer: 'No. CardVault is a computation tool, not a tax advisor. The methodology cited references the U.S. Internal Revenue Code (IRC §1012, §1221, §1(h)(4) for collectibles rate, §263(a) for basis capitalization) and IRS publications as of April 2026. State tax treatment varies and is not modeled. For any tax position with material financial impact, consult a qualified CPA or tax attorney. The tool is designed to produce documentation you can hand to a tax professional, not replace their judgment.',
  },
];

export default function CostBasisPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Cost Basis Aggregator',
        description: 'Multi-lot cost-basis computation for cards across weighted-average, FIFO, LIFO, and specific-identification methods per IRC §1012.',
        url: 'https://cardvault-two.vercel.app/tools/cost-basis',
        applicationCategory: 'FinanceApplication',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-yellow-950/60 border border-yellow-800/50 text-yellow-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span>🧮</span>
          Multi-lot tax basis · 4 methods · IRC §1012
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Cost Basis Aggregator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Compute weighted-average, FIFO, LIFO, and specific-identification cost basis for any card where you own multiple
          copies acquired at different prices. Side-by-side tax impact per method. Essential before filing Schedule D.
        </p>
      </div>

      <CostBasisClient />

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/tools/sell-by" className="block bg-slate-900/60 border border-slate-800 hover:border-yellow-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Sell-By Date Tracker →</div>
          <div className="text-xs text-slate-400">Which cards to sell when. Pairs with cost basis for end-to-end tax workflow.</div>
        </Link>
        <Link href="/tools/tax-calc" className="block bg-slate-900/60 border border-slate-800 hover:border-yellow-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Capital Gains Tax Calculator →</div>
          <div className="text-xs text-slate-400">Once you know your cost basis, compute the tax on the realized gain.</div>
        </Link>
        <Link href="/tools/tax1099k-tracker" className="block bg-slate-900/60 border border-slate-800 hover:border-yellow-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">1099-K Threshold Tracker →</div>
          <div className="text-xs text-slate-400">Track platform-reported gross sales toward the 1099-K reporting threshold.</div>
        </Link>
        <Link href="/tools/estate-planner" className="block bg-slate-900/60 border border-slate-800 hover:border-yellow-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Estate Planner →</div>
          <div className="text-xs text-slate-400">Document your collection for heirs + calculate step-up basis under IRC §1014.</div>
        </Link>
      </div>

      <div className="mt-12 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group border-b border-slate-800 pb-3 last:border-0">
              <summary className="cursor-pointer text-sm font-semibold text-white py-2 hover:text-yellow-300 transition">
                {f.question}
              </summary>
              <div className="text-sm text-slate-300 leading-relaxed mt-2 pl-2">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 text-xs text-slate-500">
        Disclaimer: CardVault is not a tax advisor. Methodology references IRC §1012 (basis), §1221 (capital asset),
        §1(h)(4) (28% collectibles cap), §263(a) (basis capitalization), and Treasury Reg 1.263(a)-1 as of April 2026.
        State tax treatment varies. Consult a qualified CPA before filing.
      </div>
    </div>
  );
}
