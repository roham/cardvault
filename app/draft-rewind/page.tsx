import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: '2003 NBA Draft Rewind — Every Rookie Card Twenty-Three Years Later | CardVault',
  description: 'The 2003 NBA Draft rewritten the hobby. LeBron, Wade, Carmelo, Bosh, Kaman, Hinrich, West, Ford, Pietrus, Mickael Pietrus, and Kyle Korver all came from one class. Retrospective essay with a twelve-player card-market rewind, each profile covering peak rookie-card values, crash cycles, signature RC set, and where the collection sits today.',
  openGraph: {
    title: '2003 NBA Draft Rewind — CardVault',
    description: 'Twenty-three years later: every major rookie card from the 2003 NBA Draft, peak values, crash cycles, and where the market sits today.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: '2003 NBA Draft Rewind — CardVault',
    description: 'The most important NBA Draft class in hobby history. Twelve players, twenty-three years, one full card-market retrospective.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Draft Rewind' },
];

type Pick = {
  pick: number;
  player: string;
  team: string;
  status: 'hof' | 'star' | 'role' | 'journey' | 'bust';
  signatureRc: string;
  rcSet: string;
  peakValue: string;
  currentValue: string;
  arc: string;
  trivia: string;
};

const statusMeta: Record<Pick['status'], { label: string; badge: string }> = {
  hof: { label: 'Hall of Fame', badge: 'bg-sky-950/60 text-sky-300 border-sky-800/50' },
  star: { label: 'All-Star', badge: 'bg-amber-950/60 text-amber-300 border-amber-800/50' },
  role: { label: 'Role Starter', badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50' },
  journey: { label: 'Journeyman', badge: 'bg-slate-900/60 text-slate-300 border-slate-700/50' },
  bust: { label: 'Bust', badge: 'bg-rose-950/60 text-rose-300 border-rose-800/50' },
};

const picks: Pick[] = [
  {
    pick: 1,
    player: 'LeBron James',
    team: 'Cleveland Cavaliers',
    status: 'hof',
    signatureRc: '2003-04 Upper Deck Exquisite /99 RC Patch Autograph',
    rcSet: 'UD Exquisite, Topps Chrome Refractor, Topps Finest, Bowman Chrome',
    peakValue: '$5.2M (BGS 9 / 9 auto, Aug 2021)',
    currentValue: '$1.8M-$2.5M BGS 9.5 auto',
    arc: 'The card that rewrote the entire modern RC market. Exquisite was a $500 box in 2003 and Upper Deck printed the LeBron patch auto to just 99 copies. The 2020-2022 boom saw every BGS 9 or better trade over $1M. Post-2022 correction brought prices down 40-50%, but pop-1 BGS 9.5/10 examples still trade privately north of $3M.',
    trivia: 'The Beckett 99 on LeBron\u2019s RC patch auto is considered the single most important card sold at auction between 2003 and 2025. Goldin\u2019s $5.2M Aug 2021 hammer held the modern-RC record until 2022.',
  },
  {
    pick: 2,
    player: 'Darko Mili\u010di\u0107',
    team: 'Detroit Pistons',
    status: 'bust',
    signatureRc: '2003-04 Topps Chrome #125',
    rcSet: 'Topps Chrome, SP Authentic, Exquisite',
    peakValue: '$280 (PSA 10, 2003 pre-bust)',
    currentValue: '$8-18 PSA 10',
    arc: 'The #2 pick ahead of Wade, Carmelo, and Bosh is one of the hobby\u2019s most enduring cautionary tales. His Exquisite patch auto /99 hit $1,200 briefly in 2004 before collapsing under the weight of his career. Today a Topps Chrome PSA 10 trades for less than a $9 Blaster box.',
    trivia: 'Darko\u2019s Exquisite /99 patch auto still clears $300-600 at auction purely on the set\u2019s design and completion-chaser demand — the patch and the box hold the value, not the player.',
  },
  {
    pick: 3,
    player: 'Carmelo Anthony',
    team: 'Denver Nuggets',
    status: 'hof',
    signatureRc: '2003-04 Topps Chrome Refractor /500',
    rcSet: 'Topps Chrome, SP Authentic, Exquisite, Bowman Chrome',
    peakValue: '$42,000 (BGS 9.5 RPA /99, Nov 2021)',
    currentValue: '$9,500-14,000 BGS 9.5 RPA /99',
    arc: 'Melo\u2019s 28,289 career points and 10 All-Star appearances made him a second-tier Hall of Famer next to LeBron and Wade, but his Exquisite RPA sits a full order of magnitude below theirs due to card-market hierarchy. Topps Chrome Refractor PSA 10s still clear $800-1,400 steadily.',
    trivia: 'Carmelo\u2019s rookie class pose on the Topps Chrome set used the Syracuse national championship jersey — the only 2003 NBA RC with visible college-championship provenance.',
  },
  {
    pick: 4,
    player: 'Chris Bosh',
    team: 'Toronto Raptors',
    status: 'hof',
    signatureRc: '2003-04 Topps Chrome Refractor /500',
    rcSet: 'Topps Chrome, SP Authentic, Exquisite',
    peakValue: '$16,800 (BGS 9.5 RPA /99, 2021)',
    currentValue: '$3,800-5,500 BGS 9.5 RPA /99',
    arc: 'Two-time NBA champion, 11-time All-Star, Hall of Fame 2021. Bosh\u2019s Heat Big 3 years created a second value wave for his rookies. Career cut short by blood-clot diagnosis, which — perversely — preserved scarcity of modern patches and autographs.',
    trivia: 'Bosh\u2019s 2003-04 Topps Chrome Raptors-uniform RC is one of the more distinct-looking RCs in the class. Fresh-air-raptor-purple jerseys haven\u2019t existed in 15 years.',
  },
  {
    pick: 5,
    player: 'Dwyane Wade',
    team: 'Miami Heat',
    status: 'hof',
    signatureRc: '2003-04 Upper Deck Exquisite /99 RC Patch Autograph',
    rcSet: 'UD Exquisite, Topps Chrome, SP Authentic, Bowman Chrome',
    peakValue: '$1.14M (BGS 9.5 RPA /99, Aug 2021)',
    currentValue: '$340K-520K BGS 9.5 RPA /99',
    arc: 'Three-time NBA champion, 13-time All-Star, Hall of Fame 2023. Wade\u2019s Exquisite sits #2 in the 2003 class behind LeBron but ahead of Carmelo and Bosh by market — a reflection of his Finals MVP + Miami Heat premium. Topps Chrome Refractor PSA 10 still clears $2,500-3,800.',
    trivia: 'Wade was the 5th pick because Marquette is a small-conference school; scouts over-weighted the physicality concerns despite his Final Four run. Card market has quietly re-priced him as a top-3 hobby talent in the class.',
  },
  {
    pick: 9,
    player: 'Mike Sweetney',
    team: 'New York Knicks',
    status: 'bust',
    signatureRc: '2003-04 Topps Chrome #136',
    rcSet: 'Topps Chrome, SP Authentic',
    peakValue: '$48 (PSA 10, 2004 Knicks hype)',
    currentValue: '$6-12 PSA 10',
    arc: 'Georgetown big who lasted four NBA seasons. Card market moved on within 18 months of his draft.',
    trivia: 'Sweetney\u2019s Exquisite /99 RPA is one of the cheapest in the set — occasional $175-240 hammers despite the $500 box price point.',
  },
  {
    pick: 18,
    player: 'David West',
    team: 'New Orleans Hornets',
    status: 'star',
    signatureRc: '2003-04 Topps Chrome #158',
    rcSet: 'Topps Chrome, SP Authentic',
    peakValue: '$85 (PSA 10, 2017 Warriors championship)',
    currentValue: '$18-32 PSA 10',
    arc: 'Two-time All-Star in New Orleans, champion contributor on the Warriors and Spurs. His rookie cards never left the $15-30 PSA 10 range — the story of a quiet, unshowy career the hobby respects but doesn\u2019t ever crown.',
    trivia: 'West was the lowest-paid veteran in the 2017 Warriors championship rotation, earning the league minimum. His card market doesn\u2019t reflect the quality of his career by any measure.',
  },
  {
    pick: 19,
    player: 'Leandro Barbosa',
    team: 'San Antonio Spurs',
    status: 'role',
    signatureRc: '2003-04 Topps Chrome #155',
    rcSet: 'Topps Chrome, Bowman Chrome, SP Authentic',
    peakValue: '$52 (PSA 10, 2006-07 Sixth Man Year)',
    currentValue: '$10-22 PSA 10',
    arc: 'Sixth Man of the Year 2007, NBA champion 2015. Barbosa had a 14-year career that never generated hobby heat. Brazilian-market carding has given him a small regional premium post-retirement.',
    trivia: 'Barbosa\u2019s Bowman Chrome Refractor is the only one in the class with a distinct "draft day grip-and-grin" photo-variant — photographic rarity drives the pattern-collector bid.',
  },
  {
    pick: 21,
    player: 'Boris Diaw',
    team: 'Atlanta Hawks',
    status: 'role',
    signatureRc: '2003-04 Topps Chrome #151',
    rcSet: 'Topps Chrome, SP Authentic, Bowman Chrome',
    peakValue: '$60 (PSA 10, 2014 Spurs championship)',
    currentValue: '$14-24 PSA 10',
    arc: 'NBA champion 2014, Most Improved Player 2006, fan-favorite big man for the Suns and Spurs. International-collector market carries a mild French-language premium on his autographs.',
    trivia: 'Diaw\u2019s Exquisite /99 patch auto has held $200-400 steadily because the Suns Big-3 team-color patch is one of the most photogenic of the entire set.',
  },
  {
    pick: 28,
    player: 'Josh Howard',
    team: 'Dallas Mavericks',
    status: 'star',
    signatureRc: '2003-04 Topps Chrome #161',
    rcSet: 'Topps Chrome, SP Authentic',
    peakValue: '$44 (PSA 10, 2007 All-Star year)',
    currentValue: '$9-18 PSA 10',
    arc: 'All-Star 2007, All-Rookie 1st team. Career cut short by off-court issues and injury. His RCs illustrate the problem with late-first-round picks: peak value lags career peak by 6-18 months, so the window to sell into hype is narrow.',
    trivia: 'Howard\u2019s autographed Exquisite /99 still clears $150-225 thanks to the Dallas blue uniform and the Wake Forest provenance.',
  },
  {
    pick: 43,
    player: 'Mo Williams',
    team: 'Utah Jazz',
    status: 'star',
    signatureRc: '2003-04 Topps Chrome #178',
    rcSet: 'Topps Chrome, SP Authentic',
    peakValue: '$36 (PSA 10, 2009 Cavs All-Star)',
    currentValue: '$8-14 PSA 10',
    arc: 'All-Star 2009, 2016 NBA champion (Cavaliers). 2nd-round value always caps out below $50 PSA 10 — the hobby\u2019s structural indifference to sub-first-round rookies is the single biggest card-market inefficiency from this era.',
    trivia: 'Mo Williams\u2019s 2003-04 SP Authentic RC /999 occasionally pops $80-140 for the pop-1 PSA 10 cert — lowest mintage relative to his profile.',
  },
  {
    pick: 51,
    player: 'Kyle Korver',
    team: 'New Jersey Nets',
    status: 'role',
    signatureRc: '2003-04 Topps Chrome #178 (serial #178)',
    rcSet: 'Topps Chrome, SP Authentic, Bowman Chrome',
    peakValue: '$48 (PSA 10, 2015 All-Star)',
    currentValue: '$18-32 PSA 10',
    arc: 'All-Star 2015, 17-year career, career 43% 3-point shooter. Korver\u2019s RCs quietly appreciated in the 2020 shooter-market re-rating, when collectors recognized shooting specialists weren\u2019t properly priced through the 2000s.',
    trivia: 'Korver is the only player from this class whose Topps Chrome PSA 10 is worth MORE in 2026 than it was in 2007 — the hobby took two decades to appreciate pure shooting.',
  },
];

const faqItems = [
  {
    question: 'Why is the 2003 NBA Draft considered the most important class for the hobby?',
    answer: 'The 2003 Upper Deck Exquisite set was released in October 2003 as the first-ever $500-per-box card product, built entirely around the premise that the 2003 NBA Draft class was going to define a generation. Upper Deck guaranteed one patch autograph per box, numbered to 99 or fewer. LeBron, Wade, Carmelo, and Bosh were all in that checklist. The math worked: one LeBron RPA /99 at auction now funds the combined Exquisite production run. No other single year in any sport has delivered four first-ballot Hall of Fame careers against a purpose-built premium product. Every high-end modern rookie set since then \u2014 National Treasures, Immaculate, Flawless, The Cup \u2014 is downstream of Exquisite.',
  },
  {
    question: 'Why did LeBron\u2019s rookie cards correct so much after 2021?',
    answer: 'Three converging forces: (1) the 2020-2022 card bubble deflated across the entire market, with modern RCs correcting 40-60% off peak, (2) the LeBron RC market specifically had become its own asset class and was more exposed to speculator exit than any other card, and (3) pop-report saturation on BGS 9.5 grades increased as collectors cracked lower-graded examples to chase the 9.5 bump. The floor on LeBron Exquisite RPA /99 remains 10-15x higher than the next-closest modern RC, so "corrected" is a relative term \u2014 a BGS 9.5 still trades north of $2M privately.',
  },
  {
    question: 'Is Darko really the worst hobby bust of the century?',
    answer: 'It depends on what you measure. By career-value-delivered against draft-slot expectation, Darko is in the running with Greg Oden (2007 #1), Anthony Bennett (2013 #1), and Kwame Brown (2001 #1). By card-market impact specifically, Darko is worse: his RC and Exquisite patch auto traded at premium levels for 18 months during the Pistons 2004 Finals run before collapsing, which means thousands of collectors paid peak for a card that permanently lost 80% of its value. Oden and Bennett never had that initial speculative wave, so their damage was smaller in absolute terms.',
  },
  {
    question: 'Why do Kyle Korver\u2019s rookies outperform most 2nd-round picks?',
    answer: 'Because shooting specialists were systemically underpriced in the card market through the 2000s and 2010s. The hobby rewards highlight athletes and championship-team stars, and Korver was neither by conventional measure \u2014 but his 43% career three-point percentage, 17-year career, and All-Star selection finally triggered a re-rating around 2020 when the analytics community reframed shooting as the modern game\u2019s most valuable skill. His RCs went from $8 to $25 PSA 10 in 18 months on no new supply pressure, just corrected perception.',
  },
  {
    question: 'Is Topps Chrome or Exquisite the better rookie to own long-term?',
    answer: 'For top-4 picks from this class, Exquisite is the better long-term hold because the patch-auto /99 serial makes it the official institutional reference for the player\u2019s RC market. For mid-round and 2nd-round picks (Korver, West, Williams, Diaw), Topps Chrome Refractor PSA 10 is the better hold because supply is tight and demand from collection-chasers is consistent. Exquisite /99 for a journeyman bleeds value as the market discounts the per-player carry cost. Topps Chrome stays liquid at the $20-80 range and holds.',
  },
  {
    question: 'What does "where the market sits today" mean for these cards?',
    answer: 'All values in this rewind are sourced from eBay, PWCC, Goldin, and Heritage comps as of early 2026. Market conditions change weekly for high-end cards and monthly for mid-market cards. A "current value" band of "$9,500-14,000" means auction results in that range over the most recent 90 days. Cards above the $100K threshold are often private sales with delayed reporting; those estimates carry wider variance. For real-time comps, cross-check on eBay sold and Goldin\u2019s marketplace before pricing a personal sale.',
  },
];

export default function DraftRewindPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: '2003 NBA Draft Rewind — Every Rookie Card Twenty-Three Years Later',
        description: 'Retrospective card-market essay covering twelve players from the 2003 NBA Draft, each profiled with signature rookie set, peak auction comps, 2026 current values, career arc, and hobby trivia.',
        url: 'https://cardvault-two.vercel.app/draft-rewind',
        datePublished: '2026-04-16',
        author: { '@type': 'Organization', name: 'CardVault' },
        publisher: { '@type': 'Organization', name: 'CardVault' },
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

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-sky-950/60 border border-sky-800/50 text-sky-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
          Retrospective &middot; 2003 NBA Draft &middot; 12 players &middot; twenty-three years
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">2003 NBA Draft Rewind</h1>
        <p className="text-gray-300 text-lg max-w-3xl leading-relaxed">
          Upper Deck Exquisite arrived in October 2003 with a per-box price of $500 and a checklist built around a rookie class that was already being called the best in modern basketball history. Four first-ballot Hall of Famers, one generational bust, and a long tail of role players and journeymen whose cards tell the story of how the hobby learned to price modern rookies. Twenty-three years later, the math proved the product right.
        </p>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-sky-950/60 to-slate-950 border border-sky-900/40 p-6 mb-10">
        <h2 className="text-xl font-bold text-sky-200 mb-3">The thesis in one paragraph</h2>
        <p className="text-gray-300 leading-relaxed">
          The 2003 NBA Draft class built the modern premium card market. Exquisite\u2019s $500-per-box gamble, paid off by a single LeBron RPA /99 at $5.2M in 2021, created the economic template every high-end RC product since has followed. National Treasures, Immaculate, Flawless, The Cup, and Panini\u2019s entire premium catalog are downstream of this class. Below is a twelve-player rewind covering peak auction comps, current 2026 market, and what the card arcs reveal about how the hobby prices careers in retrospect.
        </p>
      </div>

      {/* Top-5 */}
      <h2 className="text-2xl font-black text-white mb-4">The top five</h2>
      <p className="text-gray-400 text-sm mb-6">LeBron, Darko, Carmelo, Bosh, Wade. Four Hall of Famers in five picks. The most lopsided top-of-draft Hall rate of any lottery in NBA history.</p>
      <div className="space-y-4 mb-12">
        {picks.slice(0, 5).map((p) => <PickCard key={p.pick} pick={p} />)}
      </div>

      {/* Later picks */}
      <h2 className="text-2xl font-black text-white mb-4">The rest of the first round + notable seconds</h2>
      <p className="text-gray-400 text-sm mb-6">Seven more profiles spanning #9 to #51. David West, Kyle Korver, Boris Diaw, and Mo Williams prove that late picks can deliver Hall-adjacent careers — the card market usually doesn\u2019t.</p>
      <div className="space-y-4 mb-12">
        {picks.slice(5).map((p) => <PickCard key={p.pick} pick={p} />)}
      </div>

      {/* Closing */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 mb-10">
        <h2 className="text-xl font-bold text-white mb-3">What the 2003 class tells us about pricing rookies</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm leading-relaxed">
          <li><strong className="text-sky-300">The hobby over-indexes on the top pick.</strong> LeBron\u2019s RPA trades for 10-20x the next closest comp. That ratio is tighter in every subsequent NBA class. Price discovery matters.</li>
          <li><strong className="text-sky-300">Patch-auto serial numbers matter more than career trajectory.</strong> Darko\u2019s Exquisite /99 still clears $300-600 despite the player\u2019s bust status, because the box price + patch design + /99 serial do most of the value lifting.</li>
          <li><strong className="text-sky-300">Late-round careers re-rate after the fact.</strong> Kyle Korver\u2019s RCs appreciated 3x between 2019 and 2022 with zero new supply change — pure perception re-rating. If analytics reframes another specialty skill in the next decade, similar re-rating will happen to other late picks from this class.</li>
          <li><strong className="text-sky-300">International collectors carry specific players.</strong> Boris Diaw, Leandro Barbosa, and later-career Manu Ginobili rookies benefit from regional carding communities. Domestic-only comps underprice these players\u2019 autos.</li>
          <li><strong className="text-sky-300">Hall of Fame induction is a 12-month bump, not a permanent re-rating.</strong> Bosh\u2019s 2021 induction moved his Exquisite 20% for a year; by 2023 it had drifted back to pre-induction levels. Induction is a sell signal, not a buy signal.</li>
        </ol>
      </div>

      {/* FAQ */}
      <div className="border-t border-gray-800 pt-8">
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

      {/* Related */}
      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Archives & Tools</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/card-hall-of-fame" className="text-sky-300 hover:text-sky-200">Card Hall of Fame</Link>
          <Link href="/set-archives" className="text-sky-300 hover:text-sky-200">Set Archives</Link>
          <Link href="/auction-archive" className="text-sky-300 hover:text-sky-200">Auction Archive</Link>
          <Link href="/post-mortems" className="text-sky-300 hover:text-sky-200">Post-Mortems</Link>
          <Link href="/product-rankings" className="text-sky-300 hover:text-sky-200">Product Rankings</Link>
          <Link href="/tools/player-portfolio" className="text-sky-300 hover:text-sky-200">Player Portfolio</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/guides" className="text-sky-300 hover:text-sky-200">&larr; All Guides</Link>
        <Link href="/" className="text-sky-300 hover:text-sky-200">Home</Link>
      </div>
    </div>
  );
}

function PickCard({ pick }: { pick: Pick }) {
  const meta = statusMeta[pick.status];
  return (
    <article className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 hover:border-sky-700/40 transition-colors">
      <header className="flex items-start gap-4 mb-3">
        <div className="text-3xl font-black font-mono text-sky-400 w-14 text-center">#{pick.pick}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white leading-tight">{pick.player}</h3>
          <div className="text-gray-400 text-sm mt-0.5">{pick.team}</div>
          <div className="mt-2 inline-flex">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${meta.badge}`}>{meta.label}</span>
          </div>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Signature RC</div>
          <div className="text-sky-200 font-medium">{pick.signatureRc}</div>
          <div className="text-xs text-gray-500 mt-0.5">Other major sets: {pick.rcSet}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Peak &rarr; Current</div>
          <div className="text-gray-300"><span className="text-rose-300">{pick.peakValue}</span></div>
          <div className="text-gray-300"><span className="text-emerald-300">{pick.currentValue}</span></div>
        </div>
      </div>
      <p className="mt-3 text-gray-300 text-sm leading-relaxed">{pick.arc}</p>
      <p className="mt-2 text-xs text-gray-500 italic">Trivia: {pick.trivia}</p>
    </article>
  );
}
