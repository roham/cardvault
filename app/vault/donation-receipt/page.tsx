import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import DonationReceiptClient from './DonationReceiptClient';

export const metadata: Metadata = {
  title: 'Donation Acknowledgment Letter Generator — IRC §170 & Pub 1771 Compliant | CardVault',
  description: 'Free charitable-donation acknowledgment letter generator for sports and Pokémon cards donated to 501(c)(3) charities. Built-in IRS threshold logic for the $250 contemporaneous-written-acknowledgment rule, $500 Form 8283 Section A, $5,000 qualified-appraisal requirement, and $500,000 full-appraisal attachment. Models related-use vs unrelated-use doctrine, goods-and-services disclosure, and multi-card itemized schedules. Printable letter ready for the charity officer to sign.',
  openGraph: {
    title: 'Donation Acknowledgment Letter Generator — CardVault',
    description: 'Charity-side receipt that donors need for tax deduction. Threshold-aware IRS compliance for $250 / $500 / $5K / $500K tiers.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Donation Acknowledgment Letter Generator — CardVault',
    description: 'Free IRS Pub 1771-compliant donation acknowledgment generator for donated cards. Form 8283 thresholds + related-use doctrine built in.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Donation Acknowledgment' },
];

const faqItems = [
  {
    question: 'Why does a card donor need a written acknowledgment from the charity?',
    answer: 'Under IRC §170(f)(8), a donor cannot deduct any single charitable contribution of $250 or more without a contemporaneous written acknowledgment (CWA) from the donee organization. The cancelled check / credit card statement is not enough for non-cash property. The acknowledgment must state the donee\u2019s name, the date of the contribution, a description of the property (charities do NOT state the FMV — that is the donor\u2019s responsibility), and either a statement that no goods or services were provided OR a description and good-faith estimate of anything provided in exchange. Without this letter, the deduction is disallowed — even for perfectly legitimate donations.',
  },
  {
    question: 'What does "contemporaneous" mean for the acknowledgment?',
    answer: 'Contemporaneous means the donor must obtain the acknowledgment on or before the earlier of (a) the date they file their tax return for the year of the donation, or (b) the extended due date of that return. A letter written and signed after the IRS audit notice is NOT contemporaneous and will not save the deduction. Best practice: obtain the letter at the same time the physical card changes hands. This generator produces the letter in the form the charity officer signs at the transfer moment.',
  },
  {
    question: 'What is the $500 Form 8283 threshold?',
    answer: 'For any non-cash contribution over $500 (in total per year across all property donations), the donor must file IRS Form 8283 with their return. For donations between $501 and $5,000, Section A of Form 8283 is completed by the donor only — the charity does not sign. The acknowledgment letter serves as supporting documentation for Form 8283 Section A. This generator flags the Form 8283 Section A trigger whenever total claimed value exceeds $500.',
  },
  {
    question: 'What is the $5,000 qualified appraisal threshold?',
    answer: 'For any single item or group of similar items valued above $5,000, the donor must (1) obtain a qualified appraisal from a credentialed appraiser prior to filing, (2) complete Form 8283 Section B, and (3) have the charity officer sign Section B acknowledging receipt of the property. A "group of similar items" is a statutory term — three PSA-graded 1952 Topps cards are similar items, and their aggregate value counts toward the $5K threshold. For art and collectibles, a qualified appraiser must have verifiable credentials (ASA, ISA, AAA, or similar certification) and must NOT be the charity, the donor, or anyone related. This tool flags the Form 8283 Section B + appraiser requirement whenever any single lot or the total crosses $5K.',
  },
  {
    question: 'What is related-use vs unrelated-use and why does it matter?',
    answer: 'This is the single most important doctrine in charitable tangible-property giving. Under IRC §170(e)(1)(B)(i), if the donated property is put to a RELATED USE by the charity — e.g., a card museum displays it, a sports-hall-of-fame library archives it, a children\u2019s foundation uses it in educational programming — the donor deducts full fair market value. If the property is put to an UNRELATED USE — typically meaning the charity auctions or sells the card to raise cash — the deduction is LIMITED TO THE DONOR\u2019S COST BASIS. For highly-appreciated cards (e.g., bought for $400, worth $10,000 today), unrelated use cuts the deduction by 96%. The charity must certify related use in writing — typically inside the acknowledgment. This generator asks the donor to specify intended use and embeds the appropriate related-use statement. If unrelated use is selected, the tool warns about the basis limitation.',
  },
  {
    question: 'What happens if the charity sells or trades the card within three years?',
    answer: 'Under IRC §170(e)(7), if the charity disposes of the donated property within three years of the gift AND the original deduction was taken at FMV (e.g., related use was claimed), the charity must file IRS Form 8282 and the donor may have to recapture the difference between FMV and basis as ordinary income. Planned-disposition honesty matters: if the charity intends to sell the card within three years, the donor should NOT claim related use, and the deduction should be limited to basis upfront. The generator includes an optional "three-year disposal notice" clause that is standard language for the charity officer to acknowledge.',
  },
  {
    question: 'What if the charity provided goods or services in return for the donation?',
    answer: 'If the donor received anything of value — event tickets, a signed ball from the charity\u2019s inventory, a meet-and-greet, a dinner — the donor\u2019s deduction is reduced by the good-faith estimated value of the goods/services. The acknowledgment MUST state either (a) "No goods or services were provided" OR (b) a description and good-faith estimate of what was provided. "De minimis" benefits (low-value branded items under the annual threshold — $12.50 for 2026, indexed) can be disregarded under Rev. Proc. 90-12. The generator toggles between the two statements and computes the deductible amount when goods/services are provided.',
  },
  {
    question: 'Is this acknowledgment legally sufficient by itself?',
    answer: 'The acknowledgment, signed by an authorized officer of the donee charity on or before the tax-return filing deadline, meets the IRC §170(f)(8) contemporaneous-written-acknowledgment requirement. For donations above $500, the donor must also file Form 8283 (Section A for $501-$5K, Section B for $5K+). For donations above $5,000, a qualified appraisal must be obtained. For donations above $500,000, the full appraisal document must be attached to the return. This generator produces the acknowledgment letter only — it does NOT substitute for Form 8283, for a qualified appraisal, or for professional tax advice. For large or complex donations, consult a tax professional.',
  },
];

export default function DonationReceiptPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Donation Acknowledgment Letter Generator',
        description: 'Free IRS Pub 1771-compliant charitable-donation acknowledgment letter generator for sports and Pokémon cards donated to 501(c)(3) organizations. Threshold-aware for the $250 CWA rule, $500 Form 8283 Section A trigger, $5,000 qualified-appraisal + Section B trigger, and $500,000 full-appraisal-attachment trigger. Related-use vs unrelated-use doctrine built in. Printable letter ready for the charity officer to sign.',
        url: 'https://cardvault-two.vercel.app/vault/donation-receipt',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-lime-950/60 border border-lime-800/50 text-lime-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
          Donation Receipt &middot; IRC &sect;170 &middot; IRS Pub 1771 &middot; Form 8283 thresholds
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Donation Acknowledgment Generator</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Produce the IRS Pub 1771-compliant letter the charity signs at the moment of a card donation. Built-in threshold detection for the $250 contemporaneous-written-acknowledgment rule, $500 Form 8283 Section A, $5,000 qualified-appraisal + Section B, and $500,000 full-appraisal attachment. Related-use vs unrelated-use doctrine selected inline.
        </p>
      </div>

      <DonationReceiptClient />

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">The rules, in plain English</h2>
        <div className="prose prose-invert max-w-none text-sm text-gray-300 space-y-3">
          <p>
            Charitable deduction of appreciated cards is one of the most tax-efficient ways to redeploy grails — the donor avoids the 28% long-term collectibles capital-gains rate under <strong>IRC §1(h)(4)</strong> while still deducting full fair-market value (subject to the AGI cap). But the deduction is conditional on paperwork. The charity must provide a <strong>contemporaneous written acknowledgment</strong> for every single donation of $250 or more — under <strong>IRC §170(f)(8)</strong>, the deduction is disallowed without one.
          </p>
          <p>
            The letter is not the only requirement. <strong>Form 8283 Section A</strong> attaches to the return for any non-cash contribution over $500 in total. For donations above $5,000 in any single lot or group-of-similar-items, the donor must obtain a <strong>qualified appraisal</strong> before filing and complete <strong>Form 8283 Section B</strong>, which the charity officer also signs. Above $500,000, the full appraisal document attaches to the return. This generator handles the acknowledgment letter portion — Form 8283 itself is filed by the donor separately.
          </p>
          <p>
            The single largest controllable variable in the deduction is <strong>related use</strong>. A card donated to a sports-hall-of-fame archive that displays it = full FMV deduction. A card donated to a charity that auctions it for cash = basis-only deduction. For appreciated grails this distinction changes the deduction by 90%+. The charity officer must certify related use in writing, typically on the acknowledgment itself. This generator asks the donor to specify intended use and embeds the correct related-use clause.
          </p>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-lime-300 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Vault Documents &amp; Tools</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/vault/gift-deed" className="text-lime-300 hover:text-lime-200">Gift Deed</Link>
          <Link href="/vault/bill-of-sale" className="text-lime-300 hover:text-lime-200">Bill of Sale</Link>
          <Link href="/vault/trade-contract" className="text-lime-300 hover:text-lime-200">Trade Contract</Link>
          <Link href="/vault/consignment-agreement" className="text-lime-300 hover:text-lime-200">Consignment Agreement</Link>
          <Link href="/vault/escrow-letter" className="text-lime-300 hover:text-lime-200">Escrow Letter</Link>
          <Link href="/vault/power-of-attorney" className="text-lime-300 hover:text-lime-200">Power of Attorney</Link>
          <Link href="/tools/donation-value" className="text-lime-300 hover:text-lime-200">Donation Value Calculator</Link>
          <Link href="/tools/tax-calc" className="text-lime-300 hover:text-lime-200">Capital Gains Calculator</Link>
          <Link href="/tools/estate-planner" className="text-lime-300 hover:text-lime-200">Estate Planner</Link>
          <Link href="/tools/inheritance-guide" className="text-lime-300 hover:text-lime-200">Inheritance Guide</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/vault" className="text-lime-300 hover:text-lime-200">&larr; Vault</Link>
        <Link href="/tools" className="text-lime-300 hover:text-lime-200">All Tools</Link>
        <Link href="/" className="text-lime-300 hover:text-lime-200">Home</Link>
      </div>
    </div>
  );
}
