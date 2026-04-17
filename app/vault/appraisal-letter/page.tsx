import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import AppraisalLetterClient from './AppraisalLetterClient';

export const metadata: Metadata = {
  title: 'Insurance Appraisal Letter Generator — Scheduled Property Endorsement | CardVault',
  description: 'Free carrier-format sworn-statement appraisal letter for insuring a sports card collection under a Scheduled Personal Property (SPP) endorsement. Per-card identification, condition, valuation, replacement source, and 5-carrier letter format (CIS / American Collectors / Private Client / USAA / State Farm).',
  openGraph: {
    title: 'Insurance Appraisal Letter Generator — CardVault',
    description: 'Carrier-format sworn-statement appraisal letter for scheduled-property insurance on a sports card collection.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Insurance Appraisal Letter — CardVault',
    description: 'Generate a carrier-ready scheduled-property appraisal letter for your card collection insurance rider.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Appraisal Letter' },
];

const faqItems = [
  {
    question: 'What is a Scheduled Personal Property endorsement?',
    answer: 'A Scheduled Personal Property (SPP) endorsement — sometimes called a "floater," "rider," or "Schedule A" — is an add-on to a homeowners or renters insurance policy that lists specific high-value items individually rather than rolling them into the general personal-property cap. Standard homeowners policies cap collectibles at $1,000-$2,500 aggregate. An SPP endorsement raises the per-item cap to match the item\'s true replacement value, typically with no deductible and worldwide coverage against mysterious disappearance (loss not explained by theft or damage). To add a card to an SPP endorsement, the carrier requires a CURRENT APPRAISAL LETTER identifying the item, its condition, its appraised value, and the appraiser or source.',
  },
  {
    question: 'Do I need a professional appraisal?',
    answer: 'It depends on the carrier and the item value. Most hobby-specific carriers (Collectibles Insurance Services, American Collectors Insurance) accept a self-prepared appraisal letter for items under $5,000 per card, provided it references recent public comparables (sales on eBay, PWCC, Goldin, Heritage) and includes the appraiser\'s signature. Above $5,000, most carriers require a third-party appraisal from a certified appraiser, auction-house evaluator, or a major grading company (PSA, CGC, SGC offer paid appraisal services). Private Client carriers (AIG Private Client, Chubb Masterpiece, PURE) typically require third-party appraisals for all scheduled items regardless of value. The tool flags these thresholds and suggests the right path.',
  },
  {
    question: 'What does an appraisal letter need to include?',
    answer: 'Carrier-standard elements: (1) APPRAISER IDENTIFICATION — name, address, qualifications, relationship to the item owner. (2) APPRAISAL DATE — current within the policy year (stale appraisals get rejected). (3) ITEM-BY-ITEM DETAIL — each card listed with full identification (year / set / player / card number / grade / certification number), physical condition description, appraised value, and basis for the value (recent comparable sales cited with dates and sources). (4) TOTAL SCHEDULED VALUE. (5) APPRAISER SIGNATURE AND DATE. (6) STATEMENT OF PURPOSE (typically "this appraisal is prepared for insurance scheduling purposes"). Some carriers additionally require photographic documentation — CardVault recommends attaching high-resolution front/back photos of each card as an appendix.',
  },
  {
    question: 'What are the main hobby-specific insurance carriers?',
    answer: 'Five carriers dominate hobby-collection insurance: (1) COLLECTIBLES INSURANCE SERVICES (CIS) — the largest hobby specialist, accepts self-appraisals under $5K, worldwide coverage, mysterious disappearance covered. (2) AMERICAN COLLECTORS INSURANCE — second-largest, similar terms to CIS. (3) PRIVATE CLIENT CARRIERS (AIG / Chubb / PURE) — required for collections >$250K, requires third-party appraisals, premium pricing but broad coverage. (4) USAA VALUABLE PERSONAL PROPERTY — for military members, pairs with homeowners, requires bill-of-sale + appraisal. (5) STATE FARM PERSONAL ARTICLES POLICY — widely available, requires appraisal for items >$2,500. Each carrier has minor formatting preferences — the tool generates letters matching each carrier\'s expected layout.',
  },
  {
    question: 'How current does the appraisal need to be?',
    answer: 'Most carriers require the appraisal to be dated within the past 12 months for the initial scheduling. After scheduling, many carriers require periodic re-appraisals every 3-5 years to account for market appreciation. Sports card values in particular have moved dramatically 2019-2026 (both up and down) — a 2021 appraisal of a 2003 LeBron Topps Chrome RC would be seriously out of date. If your scheduled values have doubled, your coverage is UNDER-INSURED; if they halved, you are OVER-PAYING premium. The tool recommends re-appraising every 18-24 months and flags outdated lines.',
  },
  {
    question: 'What if the card is raw (ungraded)?',
    answer: 'Raw cards can absolutely be scheduled, but the appraisal must document the condition clearly (centering / corners / edges / surface description, or equivalent Grade Estimate from a photo grade tool). Carriers will generally NOT pay the graded-equivalent value for a raw card at claim time — they will pay the raw-condition value cited in the appraisal. If the raw card is "likely PSA 9" condition per the appraisal, the insured value should be the raw market value, NOT the PSA 9 graded value. Under-grading your scheduled value for a raw card is a common mistake that leaves collectors under-covered.',
  },
  {
    question: 'Why list each card individually vs. a blanket collection policy?',
    answer: 'Blanket collection policies (common for card dealers and bulk collectors) cover the aggregate collection up to a stated limit with a single premium. They are simpler but have two drawbacks: (1) PER-ITEM LIMITS: a blanket policy often caps each single item at 10-20% of the policy limit, which means a grail card could be under-insured. (2) PROOF OF LOSS: at claim time, you must prove which items were lost from an un-scheduled inventory, which is harder than pointing to a specific Schedule A line. Scheduled (per-card) is the right structure for collections with 5-50 named items; blanket is right for 1000-card bulk vaults with no single item above $500.',
  },
  {
    question: 'Is the letter legally binding?',
    answer: 'The appraisal letter is a SWORN STATEMENT of the items and values as of the appraisal date — it is not a contract with the insurer, but it IS the basis for the scheduled coverage and is admissible in a claim dispute. Intentionally overstating values on an appraisal is insurance fraud (18 U.S.C. § 1341 / § 1343 depending on medium). Reasonable overstatement of ~10% to account for retail replacement cost is acceptable and expected; overstating by 50%+ is a red flag the carrier will investigate. The tool errors on the side of citing recent market comparables to document the appraised value — making the letter defensible in any claim review.',
  },
];

export default function AppraisalLetterPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Insurance Appraisal Letter Generator',
        description: 'Generates carrier-format sworn-statement appraisal letters for Scheduled Personal Property insurance endorsements on sports card collections.',
        url: 'https://cardvault-two.vercel.app/vault/appraisal-letter',
        applicationCategory: 'BusinessApplication',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-orange-950/60 border border-orange-800/50 text-orange-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span>📄</span>
          10th paper-trail doc · Carrier-ready SPP endorsement · Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Insurance Appraisal Letter</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Generate a carrier-ready sworn-statement appraisal letter for your Scheduled Personal Property insurance rider.
          Per-card identification, condition, valuation, and comparable-sale basis — formatted for 5 major hobby-insurance carriers.
        </p>
      </div>

      <AppraisalLetterClient />

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/vault/insurance" className="block bg-slate-900/60 border border-slate-800 hover:border-orange-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Collection Insurance Estimator →</div>
          <div className="text-xs text-slate-400">Estimate your total coverage need and compare 4 hobby-specific carriers.</div>
        </Link>
        <Link href="/vault/appraisal" className="block bg-slate-900/60 border border-slate-800 hover:border-orange-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Card Appraisal Service →</div>
          <div className="text-xs text-slate-400">Per-card grade estimate and valuation for a single card.</div>
        </Link>
        <Link href="/vault/bill-of-sale" className="block bg-slate-900/60 border border-slate-800 hover:border-orange-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Bill of Sale Generator →</div>
          <div className="text-xs text-slate-400">Purchase paper trail — pairs with appraisal letter at claim time.</div>
        </Link>
        <Link href="/vault/gift-deed" className="block bg-slate-900/60 border border-slate-800 hover:border-orange-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Gift Deed Generator →</div>
          <div className="text-xs text-slate-400">Intra-family card transfer deed with IRS Form 709 + IRC §1015 basis carryover.</div>
        </Link>
      </div>

      <div className="mt-12 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group border-b border-slate-800 pb-3 last:border-0">
              <summary className="cursor-pointer text-sm font-semibold text-white py-2 hover:text-orange-300 transition">
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
        Disclaimer: CardVault does not provide insurance, legal, or appraisal advice. This tool generates a template letter based on industry-standard formats current as of April 2026. Consult a licensed insurance agent and, for items above $5,000, a certified appraiser before submitting to your carrier. Intentionally misstating values on a sworn appraisal is insurance fraud.
      </div>
    </div>
  );
}
