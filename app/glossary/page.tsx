import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GlossaryClient from './GlossaryClient';

export const metadata: Metadata = {
  title: 'Card Collecting Glossary — 80+ Terms Every Collector Should Know',
  description: 'The complete card collecting glossary. Learn what PSA 10, refractor, rookie card, parallel, auto, relic, and 80+ other hobby terms mean. Perfect for beginners and experienced collectors alike.',
  openGraph: {
    title: 'Card Collecting Glossary — CardVault',
    description: 'The complete glossary of card collecting terms. PSA, BGS, refractor, rookie card, auto, relic, and 80+ more defined.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Collecting Glossary — CardVault',
    description: '80+ card collecting terms defined. From PSA 10 to refractors to RPAs — everything you need to know.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Glossary' },
];

const faqItems = [
  {
    question: 'What does PSA 10 mean in card collecting?',
    answer: 'PSA 10 is the highest grade given by Professional Sports Authenticator (PSA), the largest card grading company. A PSA 10 "Gem Mint" card has virtually perfect centering (55/45 or better), sharp corners, clean edges, and a flawless surface. PSA 10 cards sell for 2-10x more than a PSA 9 of the same card. Getting a PSA 10 is difficult — many modern cards have a 30-50% gem rate.',
  },
  {
    question: 'What is a refractor in trading cards?',
    answer: 'A refractor is a special parallel version of a card with a rainbow-like, holographic finish that "refracts" light. First introduced by Topps Chrome in 1996. Refractors come in many sub-variants: Silver (unnumbered), Gold (/50), Orange (/25), Red (/5), Superfractor (1/1). They are more scarce and valuable than base cards. Panini\'s equivalent is called a "Prizm."',
  },
  {
    question: 'What is the difference between a rookie card and a 1st Bowman?',
    answer: 'A rookie card (RC) is a player\'s first officially licensed card released during their first professional season. A 1st Bowman is a player\'s first card in any Bowman product, often released while the player is still in the minor leagues. In baseball, the 1st Bowman Chrome auto is often more valuable than the official rookie card because it is issued earlier and in lower quantities.',
  },
  {
    question: 'What does "wax" mean in card collecting?',
    answer: '"Wax" is hobby slang for sealed, unopened card products — boxes, packs, and cases. The term comes from the wax paper wrappers used on vintage packs in the 1950s-1980s. "Ripping wax" means opening packs. Sealed wax can appreciate in value over time, especially after key rookies in the set become stars and the product goes out of print.',
  },
  {
    question: 'What is an RPA in card collecting?',
    answer: 'RPA stands for Rookie Patch Auto — a rookie card that features both an autograph and a game-worn jersey patch. RPAs from National Treasures (Panini) are considered the most valuable modern card type in basketball and football. Low-numbered RPAs (/25, /10, /5, /1) of star rookies can sell for $10,000-$100,000+. The patch quality (logo, nameplate, number) significantly affects value.',
  },
];

export default function GlossaryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        name: 'Card Collecting Glossary',
        description: 'Comprehensive glossary of 80+ card collecting terms covering grading, card types, market terminology, and more.',
        url: 'https://cardvault-two.vercel.app/glossary',
      }} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }} />

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Collecting Glossary
        </h1>
        <p className="text-gray-400 text-lg">
          Every term you need to know in the card collecting hobby — from PSA 10 to refractors,
          RPAs to junk wax. Search by category, letter, or keyword.
        </p>
      </div>

      <GlossaryClient />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq, i) => (
            <div key={i}>
              <h3 className="text-white font-semibold mb-2">{faq.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/guides" className="block p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
          <h3 className="text-white font-semibold mb-1">Collecting Guides</h3>
          <p className="text-gray-400 text-sm">In-depth guides for beginners and experts</p>
        </Link>
        <Link href="/tools/grading-roi" className="block p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
          <h3 className="text-white font-semibold mb-1">Grading ROI Calculator</h3>
          <p className="text-gray-400 text-sm">See if grading your card is worth it</p>
        </Link>
        <Link href="/tools/quiz" className="block p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
          <h3 className="text-white font-semibold mb-1">What Should I Collect?</h3>
          <p className="text-gray-400 text-sm">Take the quiz to find your collector style</p>
        </Link>
        <Link href="/price-guide" className="block p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
          <h3 className="text-white font-semibold mb-1">Price Guide</h3>
          <p className="text-gray-400 text-sm">Check card values across all sports</p>
        </Link>
      </div>
    </div>
  );
}
