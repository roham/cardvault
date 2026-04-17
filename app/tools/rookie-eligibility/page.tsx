import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import RookieEligibilityClient from './RookieEligibilityClient';

export const metadata: Metadata = {
  title: 'Rookie Card Eligibility Checker — True RC vs Prospect vs XRC | CardVault',
  description: 'Determine whether a card qualifies as a True Rookie, a Prospect Card, an XRC (Extended Rookie Card), or a pre-rookie/veteran issue. Supports MLB (Topps RC logo), NBA, NFL (Panini post-draft licensed), NHL (Upper Deck Young Guns), and Pokémon. Paste player + year + set and get a sourced verdict.',
  openGraph: {
    title: 'Rookie Card Eligibility Checker — CardVault',
    description: 'True RC, Prospect, XRC, or Veteran? Check any card against the real eligibility rules for each sport.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Rookie Card Eligibility Checker — CardVault',
    description: 'True RC vs Prospect vs XRC — free rules-based eligibility check.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Rookie Eligibility' },
];

const faqItems = [
  {
    question: 'What is a "True Rookie"?',
    answer: 'A True Rookie is a player\'s first officially licensed card produced after their debut at the top professional level of their sport. In MLB, True Rookie cards since 2006 carry the official MLB RC logo and are issued the year after the player\'s MLB debut. In NBA, the True Rookie is typically the first Panini-licensed card issued after the player\'s NBA debut, which is distinct from pre-draft or NCAA cards. In NHL, it\'s the first Upper Deck Young Guns insert of the player (UD holds the exclusive NHL license and Young Guns is the canonical NHL rookie format). True Rookies carry significantly higher prices than prospect or amateur cards.',
  },
  {
    question: 'What is a "Prospect Card"?',
    answer: 'A Prospect Card is issued before the player reaches the pro level. In MLB, Bowman Chrome Prospects (1st Bowman Chrome) are the canonical prospect format — they feature players who are still in the minor leagues. In NBA, prospect cards include Panini Contenders Draft Picks and Bowman Chrome University (issued during the player\'s college career). In NFL, Panini Contenders Draft Picks and Bowman University similarly predate the player\'s pro career. In NHL, ITG Draft Prospects is the primary pre-draft amateur card product. Prospect cards can be valuable if the player eventually succeeds, but they are NOT the player\'s True Rookie card per hobby conventions.',
  },
  {
    question: 'What is an "XRC"?',
    answer: 'XRC = Extended Rookie Card. Used in MLB for cards issued in the "Update" or "Traded" series at the end of a season — these captured players who debuted in mid-season and whose True Rookie would otherwise wait until the following year\'s base set. The 1984 Donruss Kirby Puckett XRC is the classic example. XRCs were officially recognized as rookie cards in the late-90s/early-2000s hobby, though some purists still distinguish XRC from True Rookie. Modern products rarely use the XRC designation — Topps Update is the modern MLB equivalent and its late-season rookie inclusions are considered True Rookies today.',
  },
  {
    question: 'Why does the True Rookie designation matter?',
    answer: 'Four reasons. Price: True Rookie cards consistently command 2-10x the price of prospect cards of the same player, especially for high-grade copies. Liquidity: collector demand focuses on the True Rookie, making it easier to sell. Authentication: the True Rookie is the card graders, auction houses, and marketplaces reference when describing "rookie year" provenance. SEO / search: most buyers search for "rookie card" specifically when planning to buy — being the True Rookie vs a prospect card determines whether a listing is discoverable under the high-intent search pattern.',
  },
  {
    question: 'What makes this tool different from a standard rookie card lookup?',
    answer: 'Standard lookups return a database entry for a specific known card. This tool is a rules-engine: enter any card — even ones not in our database — with sport + year + set + license status, and the engine determines eligibility based on the actual hobby conventions for each sport. Useful for (a) checking cards whose rookie status isn\'t documented yet, (b) teaching collectors the underlying rules, and (c) validating dealer claims ("is this really his rookie?"). The rules used here match the official hobby-industry conventions from Beckett, PSA, and each sport\'s trading-card licensees.',
  },
  {
    question: 'Are there edge cases?',
    answer: 'Yes. MLB pre-2006 cards predate the RC logo — designation is inferential (first Topps/Donruss/Fleer base card after MLB debut). NBA "variation rookies" (photo variants within the same product) are all True Rookies if the base card is a True Rookie. NFL dual-signed RPA cards can qualify as True Rookies even in premium products (National Treasures, Immaculate). Pokemon "rookie" is not a concept — early-set cards have different price dynamics (first-print Base Set Shadowless, 1st Edition). Pre-draft hockey players can have MULTIPLE prospect cards from different manufacturers (ITG, Leaf, Upper Deck CHL) with distinct but non-True-Rookie status. The tool flags edge cases when detected.',
  },
  {
    question: 'Does licensing matter?',
    answer: 'Critically. "Unlicensed" products (Leaf NFL, Leaf NBA, Onyx MLB) do NOT produce True Rookie cards even when the player is a rookie at the time of issue. Unlicensed cards can\'t use team logos, uniform images, or league trademarks, which by hobby convention disqualifies them from True Rookie status. The same player\'s licensed Panini Prizm card the same year IS his True Rookie. This distinction matters especially for NFL where Leaf consistently issues pre-draft autos that are NOT True Rookies.',
  },
];

export default function RookieEligibilityPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Rookie Card Eligibility Checker',
        description: 'Rules-based eligibility checker for trading-card rookie status across MLB, NBA, NFL, NHL, and Pokémon. Determines True Rookie vs Prospect vs XRC vs Veteran classifications with sourced explanations per sport.',
        url: 'https://cardvault-two.vercel.app/tools/rookie-eligibility',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-teal-950/60 border border-teal-800/50 text-teal-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
          True Rookie &middot; Prospect &middot; XRC &middot; Veteran &middot; sourced rules per sport
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Rookie Card Eligibility Checker</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          "Is this really his rookie card?" &mdash; the most common question from new collectors, and the most-exploited confusion in the hobby. This tool runs a rules engine over the real eligibility conventions for MLB, NBA, NFL, NHL, and Pokémon and returns a sourced verdict with explanation.
        </p>
      </div>

      <RookieEligibilityClient />

      <div className="mt-6 rounded-xl bg-amber-950/30 border border-amber-900/40 p-4 text-sm text-amber-200">
        Rules are synthesized from Beckett, PSA, and each sport\u2019s trading-card licensees. Edge cases (pre-RC-logo MLB, multi-card same-year issues, unlicensed products) are flagged but not always definitively resolved &mdash; consult a specialist grader for the highest-stakes authentications.
      </div>

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-teal-300 transition-colors">{faq.question}<span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span></summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Tools</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/tools/psa-tier-picker" className="text-teal-300 hover:text-teal-200">PSA Tier Picker</Link>
          <Link href="/tools/submission-planner" className="text-teal-300 hover:text-teal-200">Submission Planner</Link>
          <Link href="/tools/cert-check" className="text-teal-300 hover:text-teal-200">PSA Cert Check</Link>
          <Link href="/tools/auth-check" className="text-teal-300 hover:text-teal-200">Authentication Check</Link>
          <Link href="/hobby-glossary" className="text-teal-300 hover:text-teal-200">Hobby Glossary</Link>
          <Link href="/tools/identify" className="text-teal-300 hover:text-teal-200">Card Identifier</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/tools" className="text-teal-300 hover:text-teal-200">&larr; All Tools</Link>
        <Link href="/vault" className="text-teal-300 hover:text-teal-200">Vault</Link>
        <Link href="/" className="text-teal-300 hover:text-teal-200">Home</Link>
      </div>
    </div>
  );
}
