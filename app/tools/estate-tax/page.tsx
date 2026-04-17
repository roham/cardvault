import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import EstateTaxClient from './EstateTaxClient';

export const metadata: Metadata = {
  title: 'Estate Tax & Step-Up Basis Calculator — Federal, State, IRC §1014 | CardVault',
  description: 'Free estate tax calculator for inherited sports and Pokémon card collections. Models the 2026 federal exclusion of $13.99M and 40% top rate, estate-tax states (CT, HI, IL, MA, ME, MD, MN, NY, OR, RI, VT, WA, DC), inheritance-tax states (IA, KY, MD, NE, NJ, PA), IRC §1014 step-up in basis, IRC §2032 alternate valuation date election, and the lifetime-gift vs bequest decision on appreciated collectibles.',
  openGraph: {
    title: 'Estate Tax & Step-Up Basis Calculator — CardVault',
    description: 'Federal + state estate tax, inheritance tax, IRC §1014 step-up basis, and the lifetime-gift vs bequest trade-off on appreciated cards.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Estate Tax & Step-Up Calculator — CardVault',
    description: 'Federal + 13 estate-tax states + 6 inheritance-tax states + IRC §1014 step-up basis math on inherited card collections.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Estate Tax & Step-Up Basis' },
];

const faqItems = [
  {
    question: 'What is the step-up in basis and why does it matter so much for cards?',
    answer: 'Under IRC §1014, when property passes to an heir at death, the heir\u2019s cost basis is reset to the fair market value on the date of death (or the alternate valuation date six months later if the executor elects under IRC §2032). Any unrealized gain during the decedent\u2019s lifetime is wiped out. For a card bought in 1987 for $40 and worth $30,000 at death, the heir inherits a $30,000 basis — if they sell the day they inherit, they owe zero capital gains tax. This is the single largest tax-planning advantage in the entire Internal Revenue Code for appreciated collectibles. Compare to a lifetime gift: under IRC §1015, the heir would inherit the donor\u2019s $40 basis and owe 28% collectibles capital gains on $29,960. Step-up vs carryover is a $8,000+ tax difference on this single card.',
  },
  {
    question: 'What is the 2026 federal estate tax exclusion?',
    answer: 'For 2026, the federal estate tax exclusion (also called the "unified credit" because it is shared with the lifetime gift tax exclusion) is $13.99 million per individual. A married couple using portability (IRC §2010(c)(4)) can shield $27.98 million combined. Gross estates below the exclusion pay no federal estate tax. Above the exclusion, the federal rate is 40% on the excess. The exclusion amount is tentatively scheduled to drop by roughly half when the Tax Cuts and Jobs Act sunsets, but legislation remains in flux — this tool uses the current 2026 figure.',
  },
  {
    question: 'Which states have their own estate tax?',
    answer: 'Thirteen jurisdictions have a separate estate tax on top of federal: Connecticut, Hawaii, Illinois, Maine, Maryland, Massachusetts, Minnesota, New York, Oregon, Rhode Island, Vermont, Washington, and the District of Columbia. Each state sets its own exclusion (ranging from Oregon\u2019s $1M to Connecticut\u2019s $13.99M) and its own rate schedule (typically 10-16%, progressive). This tool models each state\u2019s 2026 threshold and top marginal rate. State estate tax is NOT deductible against federal estate tax, though the federal tax is not owed if the gross estate is below the federal exclusion.',
  },
  {
    question: 'What is the difference between estate tax and inheritance tax?',
    answer: 'Estate tax is paid BY THE ESTATE before distribution to heirs — the decedent\u2019s final accountant files and pays. Inheritance tax is paid BY THE HEIR after receiving the property — the heir files and pays. Six states have an inheritance tax: Iowa (phased out by 2025), Kentucky, Maryland, Nebraska, New Jersey, and Pennsylvania. Rates vary by beneficiary class — spouses and direct descendants are typically exempt or taxed at a low rate, while distant relatives and non-relatives pay the highest rates (often 10-18%). Maryland is the only state with BOTH an estate tax AND an inheritance tax. This tool asks the heir\u2019s state and relationship to the decedent and computes both applicable taxes.',
  },
  {
    question: 'Should the executor elect the alternate valuation date under IRC §2032?',
    answer: 'The executor may elect to value the estate on the date exactly six months after death rather than the date of death. The election applies to ALL assets, not just cards. It is only available if the election reduces both the total estate tax AND the step-up basis (IRS will not let you pick the lower of the two). The election makes sense in a DECLINING market: a sudden market drop within six months reduces estate tax owed. But it also reduces the step-up basis, which can hurt the heir\u2019s future sale. For card portfolios specifically, the 2022 crash-and-recovery pattern shows why this matters. If the decedent died in early 2022 with $500K in modern cards, by mid-2022 the portfolio may have been worth $350K — alternate valuation would save $60K of federal estate tax but would also reduce the heir\u2019s basis by $150K. The executor must weigh the immediate estate tax savings against the heir\u2019s future-sale gain exposure.',
  },
  {
    question: 'What if the decedent gave cards during life instead of leaving them in the estate?',
    answer: 'Lifetime gifts use the donor\u2019s basis (IRC §1015) — the recipient inherits the lower of donor\u2019s basis or FMV for loss calculations, and donor\u2019s basis for gain calculations. Bequests at death get step-up (IRC §1014) — basis resets to FMV at death. For appreciated cards, bequest is almost always better for the heir. For depreciated cards (rare but possible — a grail that dropped below purchase price), lifetime gift is better because the donor can deduct the loss if they sell first, then gift the cash. This tool shows the lifetime-gift path vs the bequest path side-by-side, including the 28% collectibles capital gains rate under IRC §1(h)(4) that would apply to a heir selling under the carryover-basis scenario.',
  },
  {
    question: 'How does the cards-as-investment character affect this?',
    answer: 'If the decedent treated cards as investment property (bought for appreciation, held long-term, sometimes sold), the cards are capital assets and step-up under §1014 applies at death. If cards were held as inventory for a hobby-turned-business (frequent buying and selling, registered as a business, depreciating over time), the cards are NOT capital assets — they are ordinary income property, and step-up does NOT apply the same way. Step-up basis is only available for capital assets per §1014(c). For most hobby collectors, cards ARE capital assets — occasional sales don\u2019t convert investment property into inventory. But dealers and high-volume flippers should consult a tax advisor about whether their cards qualify for step-up or are treated as Section 1221(a)(1) inventory excluded from §1014 treatment.',
  },
  {
    question: 'Is this estate tax calculation legal advice?',
    answer: 'No. This tool is educational and produces an approximate tax estimate based on stated 2026 federal and state rates. Actual estate tax planning involves trust structures (revocable living trusts, bypass trusts, grantor-retained annuity trusts, qualified personal residence trusts, intentionally defective grantor trusts), portability elections between spouses (IRS Form 706 filing even if below threshold), charitable remainder trusts, and state-specific rules that materially affect the outcome. For any estate with assets above $3M or complex family situations (blended families, non-citizen spouses, special-needs beneficiaries), consult a qualified estate-planning attorney and a CPA. The math in this tool is a starting point for the conversation, not a substitute for professional advice.',
  },
];

export default function EstateTaxPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Estate Tax & Step-Up Basis Calculator',
        description: 'Free estate tax calculator for inherited sports and Pokémon card collections. Models federal exclusion ($13.99M 2026), 40% top rate, 13 estate-tax states (CT/HI/IL/MA/ME/MD/MN/NY/OR/RI/VT/WA/DC), 6 inheritance-tax states (IA/KY/MD/NE/NJ/PA), IRC §1014 step-up in basis, IRC §2032 alternate valuation date, and the lifetime-gift vs bequest trade-off on appreciated collectibles.',
        url: 'https://cardvault-two.vercel.app/tools/estate-tax',
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
        <div className="inline-flex items-center gap-2 bg-fuchsia-950/60 border border-fuchsia-800/50 text-fuchsia-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-pulse" />
          Estate Tax &middot; IRC &sect;1014 step-up &middot; &sect;2032 alt-valuation &middot; 13 estate + 6 inheritance states
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Estate Tax &amp; Step-Up Basis Calculator</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Model the tax treatment of an inherited card collection. Federal estate tax, state estate &amp; inheritance tax, IRC §1014 step-up basis math, alternate valuation election, and a lifetime-gift vs bequest comparison for appreciated grails.
        </p>
      </div>

      <EstateTaxClient />

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">The rules, in plain English</h2>
        <div className="prose prose-invert max-w-none text-sm text-gray-300 space-y-3">
          <p>
            The <strong>step-up in basis under IRC §1014</strong> is the single most powerful tax provision for appreciated collectibles. When cards pass at death, the heir\u2019s basis resets to fair market value on the date of death (or six months later under §2032 election). Unrealized appreciation during the decedent\u2019s lifetime escapes capital gains tax entirely. A $30,000 card bought for $40 passes to the heir with a $30,000 basis — sell the next day, zero gain.
          </p>
          <p>
            For estates over the <strong>$13.99M 2026 federal exclusion</strong>, the estate pays 40% on the excess before distribution. Thirteen states add their own estate tax (with their own thresholds and schedules), and six states impose an inheritance tax on heirs. Maryland stacks both. State estate tax is NOT deductible against federal.
          </p>
          <p>
            The practical implication for most collectors: <strong>for appreciated cards, bequest is materially better than a lifetime gift</strong>. A lifetime gift uses IRC §1015 carryover basis — the recipient inherits the donor\u2019s old cost basis and owes 28% collectibles capital gains on the full appreciation when they sell. Holding until death and passing by bequest wipes that tax out. The exceptions are (1) estates above the $13.99M threshold where bequest adds to estate-tax-owed, and (2) depreciated cards where lifetime sale captures a loss the heir cannot claim.
          </p>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-fuchsia-300 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Tools &amp; Documents</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/tools/tax-calc" className="text-fuchsia-300 hover:text-fuchsia-200">Capital Gains Calculator</Link>
          <Link href="/tools/donation-value" className="text-fuchsia-300 hover:text-fuchsia-200">Donation Value Calculator</Link>
          <Link href="/tools/estate-planner" className="text-fuchsia-300 hover:text-fuchsia-200">Estate Planner</Link>
          <Link href="/tools/inheritance-guide" className="text-fuchsia-300 hover:text-fuchsia-200">Inheritance Guide</Link>
          <Link href="/vault/gift-deed" className="text-fuchsia-300 hover:text-fuchsia-200">Gift Deed</Link>
          <Link href="/vault/donation-receipt" className="text-fuchsia-300 hover:text-fuchsia-200">Donation Acknowledgment</Link>
          <Link href="/vault/escrow-letter" className="text-fuchsia-300 hover:text-fuchsia-200">Escrow Letter</Link>
          <Link href="/vault/power-of-attorney" className="text-fuchsia-300 hover:text-fuchsia-200">Power of Attorney</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/tools" className="text-fuchsia-300 hover:text-fuchsia-200">&larr; All Tools</Link>
        <Link href="/vault" className="text-fuchsia-300 hover:text-fuchsia-200">Vault</Link>
        <Link href="/" className="text-fuchsia-300 hover:text-fuchsia-200">Home</Link>
      </div>
    </div>
  );
}
