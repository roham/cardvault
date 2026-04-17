import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GiftDeedClient from './GiftDeedClient';

export const metadata: Metadata = {
  title: 'Gift Deed Generator — Intra-Family Card Transfer with IRS Form 709 Logic | CardVault',
  description: 'Free deed-of-gift generator for sports and Pokémon card transfers between family and friends. Models IRS Form 709 annual exclusion ($19K 2026) and lifetime exemption ($13.99M), basis carryover under IRC §1015, unlimited marital deduction for U.S.-citizen spouses, UTMA/UGMA custodian handling for minors, and Connecticut state gift tax. Printable legal deed with notary and witness blocks.',
  openGraph: {
    title: 'Gift Deed Generator — CardVault',
    description: 'Legal deed-of-gift for card transfers. Form 709 logic, basis carryover, spouse / minor / CT handling, printable letter.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Gift Deed Generator — CardVault',
    description: 'Free intra-family card gift-deed generator with built-in IRS Form 709 and basis carryover logic.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Gift Deed' },
];

const faqItems = [
  {
    question: 'Why write a formal deed of gift for a card I\u2019m giving to a family member?',
    answer: 'Three reasons. First, if the gift is above the IRS annual exclusion ($19,000 per recipient for 2026), the donor must file Form 709 (United States Gift Tax Return). A written deed with date, FMV, donor, recipient, and relationship is the supporting documentation Form 709 requires. Second, a written deed establishes basis carryover under IRC §1015 — the recipient inherits the donor\u2019s cost basis, NOT fair-market value. Without written basis documentation, the IRS may treat the recipient\u2019s basis as zero on future sale, triggering full-FMV capital gains. Third, a witnessed / notarized deed prevents later disputes within the family about when ownership actually transferred.',
  },
  {
    question: 'What is the 2026 annual exclusion, and how do prior-year gifts factor in?',
    answer: 'The IRS annual exclusion is the amount a donor can give to any one recipient per year without triggering Form 709. For 2025 and 2026 the amount is $19,000 (up from $18,000 in 2024). It is per donor, per recipient, per year — a married couple can split-gift and effectively give $38,000 to one recipient annually. Prior gifts to the SAME recipient in the SAME year aggregate with the current gift for annual-exclusion purposes. If you gave your daughter $10,000 cash in January and are now gifting her a $12,000 card in April, total YTD is $22,000 and you exceed the $19,000 cap by $3,000 — triggering Form 709. Gifts to DIFFERENT recipients in the same year do not aggregate.',
  },
  {
    question: 'What happens if the gift exceeds the annual exclusion?',
    answer: 'Two things. First, the donor must file IRS Form 709 reporting the gift by April 15 of the year following the gift. Second, the excess above the annual exclusion reduces the donor\u2019s $13.99 million (2026) lifetime unified credit — it does NOT trigger an immediate out-of-pocket tax unless the donor has already used their lifetime amount (rare for most collectors). The lifetime exclusion is shared with the federal estate tax exclusion — gifts made during life reduce the estate exclusion at death. Form 709 is the running tally. For collectors with multi-million-dollar grails, cumulative lifetime gift tracking matters.',
  },
  {
    question: 'What is basis carryover and why does it matter?',
    answer: 'Under IRC §1015, when property is transferred by gift, the recipient\u2019s cost basis is the LOWER of (a) the donor\u2019s adjusted basis, or (b) fair market value at the date of gift (for loss calculations only). For gain calculations, the donor\u2019s basis carries over directly. This means if Dad gifts a card he bought for $400 to his son, and son sells it next year for $2,500, the son owes capital gains on $2,100 — not on $0. This is the single most important tax-planning difference between LIFETIME GIFTS and INHERITED PROPERTY. Inherited property gets a stepped-up basis to FMV at date of death under IRC §1014, which generally wipes out unrealized gain. For highly-appreciated cards, keeping them in the estate until death can be materially more tax-efficient for the recipient than gifting during life.',
  },
  {
    question: 'Is there an unlimited exclusion for gifts to my spouse?',
    answer: 'For gifts between U.S.-citizen spouses, yes — there is an UNLIMITED MARITAL DEDUCTION under IRC §2523. You can gift any amount to your U.S.-citizen spouse with no Form 709 obligation. However, for gifts to a NON-CITIZEN spouse (green-card holder or resident alien), the 2026 annual exclusion is capped at $190,000 (indexed annually from a base amount). Gifts above the cap require Form 709. The form toggles between these scenarios when you select spouse + non-citizen status.',
  },
  {
    question: 'What if the recipient is a minor?',
    answer: 'Minors cannot legally own valuable personal property in most U.S. states. The standard solution is a custodial account under the Uniform Transfers to Minors Act (UTMA) or Uniform Gifts to Minors Act (UGMA). The deed should name a custodian who holds legal title on behalf of the minor until they reach the age of majority (typically 18 or 21 depending on state). The custodian is usually a parent or grandparent but cannot be the donor (self-dealing issue). The deed generator offers a checkbox for minor recipients with a custodian-name field that inserts the standard custodial clause into the document.',
  },
  {
    question: 'Does any state charge its own gift tax?',
    answer: 'Only Connecticut. Connecticut is the last remaining U.S. state with a separate state-level gift tax on top of federal. Connecticut tracks its own annual exclusion (matching the federal amount) and its own lifetime exemption (also matching the federal $13.99M for 2026). Gifts above the Connecticut annual exclusion require Connecticut Form CT-706/709. All other 49 states have no separate gift tax. When you enter "Connecticut" as governing state in this generator, the preview adds a CT-specific notice clause and the summary shows a Connecticut-specific warning panel.',
  },
  {
    question: 'Is this deed legally binding?',
    answer: 'A signed, witnessed deed of gift is generally effective under common law to transfer ownership of personal property (including cards). Adding a notary acknowledgment adds evidentiary weight and is strongly recommended for gifts above the annual exclusion, gifts involving minors (where the custodial relationship must be clear), or gifts with any basis-carryover complexity. This generator produces drafting-aid output suitable for family transfers and low-complexity situations. For gifts involving trusts, grantor-retained annuity trusts (GRATs), intentionally defective grantor trusts (IDGTs), qualified personal residence trusts (QPRTs), or any estate-planning structure beyond a simple outright gift, consult a qualified estate-planning attorney before relying on this deed. This tool is informational, not legal or tax advice.',
  },
];

export default function GiftDeedPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Gift Deed Generator',
        description: 'Free deed-of-gift generator for intra-family sports and Pokémon card transfers. Models IRS annual exclusion, lifetime exemption, Form 709 filing thresholds, basis carryover under IRC §1015, marital deduction for U.S.-citizen spouses, non-citizen spouse cap, UTMA/UGMA custodian handling for minors, and Connecticut state gift tax. Produces printable, witness-ready legal deed.',
        url: 'https://cardvault-two.vercel.app/vault/gift-deed',
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
        <div className="inline-flex items-center gap-2 bg-sky-950/60 border border-sky-800/50 text-sky-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
          Deed of Gift &middot; IRS Form 709 &middot; IRC &sect;1015 basis carryover &middot; UTMA / UGMA support
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Gift Deed Generator</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Draft a witness-ready deed of gift for sports and Pokémon card transfers between family members and friends. Built-in logic for the 2026 annual exclusion, lifetime unified credit, Form 709 filing triggers, basis carryover, U.S.-citizen vs non-citizen spouse treatment, UTMA/UGMA custodianship for minors, and Connecticut state gift tax.
        </p>
      </div>

      <GiftDeedClient />

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">The rules, in plain English</h2>
        <div className="prose prose-invert max-w-none text-sm text-gray-300 space-y-3">
          <p>
            Gifts between family members are one of the most common card-transfer scenarios in the hobby, but they rarely generate any written documentation. That is a mistake. Gifts above the IRS annual exclusion require <strong>Form 709</strong> reporting; the lifetime cumulative tally affects the donor&apos;s estate-tax exclusion at death; and the recipient&apos;s cost basis is the donor&apos;s carryover basis (<strong>IRC §1015</strong>), not fair market value. Without a deed, the recipient may have no proof of basis at all, which can force the IRS to treat the basis as zero on a future sale.
          </p>
          <p>
            The unlimited marital deduction (<strong>IRC §2523</strong>) lets U.S.-citizen spouses gift to each other without limit. A non-U.S.-citizen spouse is capped at a higher-but-not-unlimited amount ($190,000 for 2026). Gifts to minors require a <strong>UTMA</strong> or <strong>UGMA</strong> custodian because minors cannot legally hold title to valuable personal property. <strong>Connecticut</strong> is the last U.S. state with its own state-level gift tax.
          </p>
          <p>
            The key tax-planning difference: <strong>lifetime gifts carry over basis; inherited property steps up basis to FMV at death</strong>. For a grail card with $400 basis and $10,000 FMV, gifting it during life means the recipient owes capital gains on $9,600 when they sell. Holding it until death and passing by bequest resets basis to $10,000, and the recipient can sell at FMV with zero gain. For appreciated grails, the math usually favors bequest over gift — but that requires intact estate planning. This generator produces the drafting-aid for scenarios where a lifetime gift is the right choice.
          </p>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-sky-300 transition-colors">
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
          <Link href="/vault/bill-of-sale" className="text-sky-300 hover:text-sky-200">Bill of Sale</Link>
          <Link href="/vault/return-request" className="text-sky-300 hover:text-sky-200">Return Request</Link>
          <Link href="/vault/trade-contract" className="text-sky-300 hover:text-sky-200">Trade Contract</Link>
          <Link href="/vault/consignment-agreement" className="text-sky-300 hover:text-sky-200">Consignment Agreement</Link>
          <Link href="/vault/break-agreement" className="text-sky-300 hover:text-sky-200">Break Agreement</Link>
          <Link href="/vault/shipping-claim" className="text-sky-300 hover:text-sky-200">Shipping Claim</Link>
          <Link href="/vault/escrow-letter" className="text-sky-300 hover:text-sky-200">Escrow Letter</Link>
          <Link href="/vault/power-of-attorney" className="text-sky-300 hover:text-sky-200">Power of Attorney</Link>
          <Link href="/tools/donation-value" className="text-sky-300 hover:text-sky-200">Donation Value Calculator</Link>
          <Link href="/tools/tax-calc" className="text-sky-300 hover:text-sky-200">Capital Gains Calculator</Link>
          <Link href="/tools/estate-planner" className="text-sky-300 hover:text-sky-200">Estate Planner</Link>
          <Link href="/tools/inheritance-guide" className="text-sky-300 hover:text-sky-200">Inheritance Guide</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/vault" className="text-sky-300 hover:text-sky-200">&larr; Vault</Link>
        <Link href="/tools" className="text-sky-300 hover:text-sky-200">All Tools</Link>
        <Link href="/" className="text-sky-300 hover:text-sky-200">Home</Link>
      </div>
    </div>
  );
}
