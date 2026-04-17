import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import DonationValueCalculator from './DonationValueCalculator';

export const metadata: Metadata = {
  title: 'Card Donation Value Calculator — IRS Deduction & Form 8283 Helper | CardVault',
  description: 'Free charitable-donation deduction calculator for sports and Pokémon cards. Models IRS Pub 561 rules: FMV vs cost-basis, related-use vs unrelated-use, AGI caps by organization type, Form 8283 thresholds, qualified-appraisal triggers, and the donate-the-card vs sell-then-donate-cash arbitrage.',
  openGraph: {
    title: 'Card Donation Value Calculator — CardVault',
    description: 'IRS deduction math for donated cards: FMV, basis, AGI caps, Form 8283 thresholds, appraisal requirements, tax-savings arbitrage.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Donation Value Calculator — CardVault',
    description: 'Free IRS-aware deduction calculator for donated sports cards. Form 8283, Pub 561, appraisal thresholds.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Donation Value Calculator' },
];

const faqItems = [
  {
    question: 'Can I really deduct the full fair market value of a donated card?',
    answer: 'Sometimes. For long-term (held more than 1 year) capital-gain property donated to a public charity that uses the card for its exempt purpose \u2014 say, a 52 Mantle donated to the National Baseball Hall of Fame for permanent display \u2014 you deduct the full FMV. But if the charity plans to SELL the card (unrelated use), or you held the card less than a year, or you donate to a non-operating private foundation, the deduction is capped at your cost basis. This is the single most important rule in IRC \u00a7170(e)(1)(B) and it trips up almost every first-time hobby donor.',
  },
  {
    question: 'What is "related use" vs "unrelated use"?',
    answer: 'Related use means the charity uses the donated card in its exempt purpose. A Hall of Fame museum that accessions the card for display or archival preservation is related use. Unrelated use means the charity will dispose of the card \u2014 typically by selling it through a charity auction. A children\u2019s hospital that auctions off your donated Jordan rookie is unrelated use. Unrelated use caps your deduction at cost basis, even for long-term property. The distinction MUST be certified by the charity in writing if you deduct FMV.',
  },
  {
    question: 'When do I need a qualified appraisal?',
    answer: 'If the claimed deduction for the card (or a group of similar cards) exceeds $5,000, you must obtain a written qualified appraisal from an IRS-defined "qualified appraiser" and attach Form 8283 Section B signed by the appraiser AND the donee organization. For donations over $500,000 you must attach a copy of the full appraisal to the return. Comp photos and eBay sold listings are NOT acceptable substitutes once you cross the $5,000 threshold.',
  },
  {
    question: 'Who qualifies as a "qualified appraiser" for trading cards?',
    answer: 'Per IRC \u00a7170(f)(11)(E), a qualified appraiser must have earned an appraisal designation from a recognized professional organization OR met minimum education-and-experience requirements, regularly perform appraisals for compensation, demonstrate verifiable education/experience in valuing the type of property being appraised, and cannot be the donor, the donee, or a party to the transaction that gave the donor the property. For sports cards specifically, look for appraisers credentialed through the American Society of Appraisers (ASA) Personal Property discipline with documented hobby-specific experience, or certain Heritage Auctions / Goldin Auctions senior specialists who accept non-sale appraisal engagements.',
  },
  {
    question: 'Why does donating the card beat selling it and donating the cash?',
    answer: 'Three reasons. First, you avoid the 28% federal long-term collectibles capital-gains rate on the appreciation. Second, you avoid state capital-gains tax (up to 13.3% in CA). Third, the charity still receives the full FMV. If your cost basis is $400 and FMV is $2,500, selling would trigger $588 in federal capital-gains tax (28% of $2,100 gain) plus state tax, leaving under $1,900 after-tax to donate. Donating the card directly puts the full $2,500 at the charity\u2019s disposal while still generating a deduction on the full FMV when rules allow.',
  },
  {
    question: 'Does the charity need to send me anything?',
    answer: 'Yes. For any donation of $250 or more, IRC \u00a7170(f)(8) requires a contemporaneous written acknowledgement from the charity stating the donor\u2019s name, description of the donated property (but not the value \u2014 the charity is not required to state a value), whether any goods or services were received in exchange (and if so, a description and fair-market-value estimate), and the date of the donation. You must receive this acknowledgement before you file the return. Without it, the deduction is fully disallowed \u2014 no de minimis exception.',
  },
  {
    question: 'What happens if my deduction exceeds the AGI cap?',
    answer: 'The excess carries forward for up to 5 succeeding tax years. If you deduct $40,000 worth of long-term appreciated cards against an AGI of $100,000 (30% cap = $30,000), you deduct $30,000 this year and carry $10,000 forward. In a subsequent year with higher AGI headroom, you use the carryforward subject to that year\u2019s cap. Carryforwards are tracked on Schedule A and Form 8283 attached to each year\u2019s return. Use-or-lose after year 5.',
  },
  {
    question: 'Can I donate a card I inherited?',
    answer: 'Yes. Inherited property takes a stepped-up cost basis equal to its FMV at the date of the decedent\u2019s death (IRC \u00a71014). It is also immediately treated as long-term property regardless of how long you actually hold it post-inheritance. So an inherited card sold or donated the next day still gets long-term treatment. The stepped-up basis is often close to FMV, which narrows the "donate vs sell" arbitrage \u2014 both paths end up similar if the card hasn\u2019t appreciated meaningfully since date of death.',
  },
];

export default function DonationValuePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Donation Value Calculator',
        description: 'IRS-aware charitable-contribution deduction calculator for donated sports cards and Pokémon cards. Models FMV vs cost-basis rules, related-use vs unrelated-use for long-term capital-gain property, AGI caps by organization type, Form 8283 thresholds, qualified-appraisal triggers, and the donate-versus-sell-then-donate-cash tax arbitrage.',
        url: 'https://cardvault-two.vercel.app/tools/donation-value',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Charitable donations &middot; IRS Pub 526 / Pub 561 &middot; Form 8283 thresholds
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Card Donation Value Calculator</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Models the IRS rules for donating sports and Pokémon cards to charity. Computes your deductible value (FMV vs cost-basis), AGI cap by organization type, Form 8283 / qualified-appraisal thresholds, and the donate-the-card-directly vs sell-then-donate-cash arbitrage.
        </p>
      </div>

      <DonationValueCalculator />

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">The rules, in plain English</h2>
        <div className="prose prose-invert max-w-none text-sm text-gray-300 space-y-3">
          <p>
            The federal charitable deduction for donated tangible personal property \u2014 which is the IRS category that sports cards and Pokémon cards fall into \u2014 is governed by <strong>IRC \u00a7170</strong>, with operational rules in <strong>Publication 526</strong> (deduction mechanics) and <strong>Publication 561</strong> (valuing non-cash contributions). The tool implements the key rules from those documents.
          </p>
          <p>
            The single most consequential rule is the <strong>related-use doctrine</strong>. A long-term capital-gain card donated to a public charity that USES the card for its exempt purpose (display, preservation, teaching) is deductible at fair market value. The same card donated to a charity that plans to SELL it (even through a charity auction) is deductible only at cost basis. Most collectors default-assume FMV treatment; Form 8283 asks for a certification, and the charity must attest to related use in writing for FMV to stick.
          </p>
          <p>
            Above <strong>$5,000</strong> per item (or per group of similar items donated to one charity in one year), the IRS requires a <strong>qualified appraisal</strong>. A receipt, a PSA price guide, or a Goldin sold-listing is not a qualified appraisal \u2014 the IRS will disallow the deduction on audit if the signed appraisal is missing, regardless of how well-supported the FMV number is.
          </p>
          <p>
            The arbitrage panel compares donating the card directly to selling it first and donating the after-tax cash. Because the long-term federal collectibles capital-gains rate is <strong>28%</strong> (higher than the 15-20% rate for stocks), the arbitrage favors direct donation for appreciated long-term cards by a meaningful margin.
          </p>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-violet-300 transition-colors">
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
          <Link href="/tools/tax-calc" className="text-violet-300 hover:text-violet-200">Capital Gains Tax Calculator</Link>
          <Link href="/tools/estate-planner" className="text-violet-300 hover:text-violet-200">Estate Planner</Link>
          <Link href="/tools/inheritance-guide" className="text-violet-300 hover:text-violet-200">Inheritance Guide</Link>
          <Link href="/tools/insurance-calc" className="text-violet-300 hover:text-violet-200">Insurance Calculator</Link>
          <Link href="/tools/appraisal-report" className="text-violet-300 hover:text-violet-200">Appraisal Report</Link>
          <Link href="/tools/provenance" className="text-violet-300 hover:text-violet-200">Provenance Tracker</Link>
          <Link href="/tools/comp-calculator" className="text-violet-300 hover:text-violet-200">Comp Calculator</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/tools" className="text-violet-300 hover:text-violet-200">&larr; All Tools</Link>
        <Link href="/guides" className="text-violet-300 hover:text-violet-200">Guides</Link>
        <Link href="/" className="text-violet-300 hover:text-violet-200">Home</Link>
      </div>
    </div>
  );
}
