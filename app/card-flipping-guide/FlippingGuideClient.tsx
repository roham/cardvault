'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Section {
  id: string;
  title: string;
  icon: string;
  color: string;
  content: {
    heading: string;
    text: string;
    tips?: string[];
    warning?: string;
  }[];
}

const sections: Section[] = [
  {
    id: 'what-is-flipping',
    title: 'What Is Card Flipping?',
    icon: '🔄',
    color: 'from-blue-900/40 to-blue-800/20 border-blue-700/30',
    content: [
      {
        heading: 'The Basics',
        text: 'Card flipping is the practice of buying sports cards at one price and selling them at a higher price for profit. Think of it like day trading, but with physical collectibles. Successful flippers understand market timing, player performance catalysts, and platform arbitrage.',
      },
      {
        heading: 'Flipping vs Investing',
        text: 'Flipping is short-term (hours to weeks). Investing is long-term (months to years). Flippers target quick price movements from news, performance, or seasonal demand. Investors buy and hold based on long-term value appreciation.',
        tips: [
          'Flipping requires active attention — checking prices, watching games, monitoring news daily',
          'Average flip timeline: 3-14 days from purchase to sale',
          'Target margin: 20-40% after all fees and shipping',
          'Start with $200-500 in capital to learn without major risk',
        ],
      },
      {
        heading: 'Is Flipping Worth It?',
        text: 'At small scale, flipping teaches you the market faster than any other activity. At scale, experienced flippers consistently generate $500-2,000/month in profit. But it requires real time, knowledge, and risk tolerance. Most beginners lose money in the first month while learning.',
        warning: 'Card flipping involves real financial risk. Never flip with money you cannot afford to lose. Past results do not guarantee future profits.',
      },
    ],
  },
  {
    id: 'finding-deals',
    title: 'Finding Undervalued Cards',
    icon: '🔍',
    color: 'from-emerald-900/40 to-emerald-800/20 border-emerald-700/30',
    content: [
      {
        heading: 'Platform Arbitrage',
        text: 'The same card often sells for different prices on different platforms. A card listed at $40 on Facebook Marketplace might sell for $65 on eBay. The price gap exists because sellers on casual platforms price lower, and buyers on established marketplaces pay market rates.',
        tips: [
          'Facebook Marketplace and local groups: 20-40% below eBay prices',
          'Card shows: negotiate 15-30% off sticker prices, especially late in the day',
          'Estate sales and garage sales: occasional home runs at 10% of value',
          'Offerup/Mercari: casual sellers who underprice by 25-50%',
          'COMC: check "Just Listed" for mispriced inventory',
        ],
      },
      {
        heading: 'News-Driven Flips',
        text: 'Player performance and news create buying windows. A player gets traded to a contender — his cards spike 30-50% within 48 hours. A rookie gets called up — his cards jump before most people notice. The key is speed: buy in the first 30 minutes of breaking news.',
        tips: [
          'Follow beat reporters on X/Twitter for real-time breaking news',
          'NFL: trades, injuries, depth chart changes, contract extensions',
          'NBA: All-Star selections, trade deadlines, playoff seeding clinches',
          'MLB: call-ups, no-hitters, milestone home runs, trade deadline',
          'NHL: trades, Calder Trophy races, playoff clinches',
        ],
      },
      {
        heading: 'Seasonal Buying Windows',
        text: 'Card prices follow predictable seasonal patterns. Football cards are cheapest in March-April (off-season). Baseball cards dip in November-December. Understanding these cycles lets you buy low in the off-season and sell during peak demand.',
        tips: [
          'Buy football: March-May | Sell football: August-January',
          'Buy baseball: November-February | Sell baseball: April-October',
          'Buy basketball: June-September | Sell basketball: October-April',
          'Buy hockey: May-August | Sell hockey: October-April',
        ],
      },
    ],
  },
  {
    id: 'best-platforms',
    title: 'Best Platforms for Flipping',
    icon: '💻',
    color: 'from-purple-900/40 to-purple-800/20 border-purple-700/30',
    content: [
      {
        heading: 'Where to Buy',
        text: 'Your buying platform determines your profit margin. The best flippers source from casual, low-fee platforms and sell on high-traffic, established ones.',
        tips: [
          'Facebook Groups: Best for raw cards. Join sport-specific groups (50K+ members). Negotiate directly.',
          'Card Shows: Touch and inspect cards. Negotiate in person. Best for bulk deals.',
          'eBay Auctions: Watch for ending auctions at odd hours (3-6 AM) with few bidders.',
          'Mercari: Casual sellers often underprice. Make offers 20% below listing.',
          'Local Card Shops (LCS): Build relationships. First access to fresh inventory.',
        ],
      },
      {
        heading: 'Where to Sell',
        text: 'High-traffic platforms with buyer trust command the best prices. eBay remains king for most card sales, but platform choice depends on card value and speed needed.',
        tips: [
          'eBay (13% final value fee): Best for $20-500 cards. Largest buyer pool. Use auction for hot cards, BIN for stable ones.',
          'PWCC/Goldin: Best for $500+ graded cards. Lower fees, curated audience, premium prices.',
          'Facebook Groups: Zero fees but slower sales. Best for $10-100 raw cards.',
          'Whatnot: Live selling platform. Great for bulk lots and creating urgency.',
          'COMC: Consignment model. List and forget. Best for large inventory of $5-50 cards.',
        ],
      },
    ],
  },
  {
    id: 'grading-arbitrage',
    title: 'Grading Arbitrage',
    icon: '📊',
    color: 'from-amber-900/40 to-amber-800/20 border-amber-700/30',
    content: [
      {
        heading: 'The Grading Profit Zone',
        text: 'Buy raw cards that look like PSA 9-10 candidates. Grade them. Sell the graded cards at a premium. The profit zone exists because most sellers of raw cards price them at the raw market rate, not the graded potential. A raw card at $50 that grades PSA 10 might sell for $200+.',
        tips: [
          'Focus on cards where PSA 10 is 3x+ the raw price — that\'s your profit margin',
          'Learn to spot centering, surface, and corner quality with a loupe',
          'Submit in batches of 20+ to reduce per-card grading costs',
          'Use PSA Economy ($22/card) for cards under $200 raw value',
          'Track your hit rates: aim for 60%+ PSA 9-10 on your submissions',
        ],
      },
      {
        heading: 'Cross-Grade Flips',
        text: 'Buy BGS 9 or SGC 9.5 cards, crack them out of the slab, and resubmit to PSA. PSA slabs command a 15-30% premium over equivalent BGS/SGC grades for most cards. The key: only crack cards that look like strong PSA candidates.',
        warning: 'Cross-grading is risky. A BGS 9 does not guarantee a PSA 9. Expect 20-30% to come back lower than expected. Only crack-and-resubmit when the PSA premium justifies the risk.',
      },
    ],
  },
  {
    id: 'pricing-strategy',
    title: 'Pricing & Fee Math',
    icon: '🧮',
    color: 'from-red-900/40 to-red-800/20 border-red-700/30',
    content: [
      {
        heading: 'Know Your True Costs',
        text: 'Most beginners underestimate fees and overestimate profits. A $100 eBay sale does not put $100 in your pocket. After eBay fees (13%), PayPal/payment processing, shipping, and original purchase price, your real margin might be 15-25%.',
        tips: [
          'eBay: ~13% final value fee + 2.9% payment processing + $0.30',
          'Shipping: $3-5 for PWE, $5-8 for bubble mailer, $8-15 for box',
          'Supplies: top loaders ($0.15), penny sleeves ($0.02), tape, labels',
          'PSA grading: $22-150/card depending on service level',
          'Rule of thumb: you need 30%+ gross margin to net a real profit',
        ],
      },
      {
        heading: 'The Flip Calculator',
        text: 'Before every purchase, run the numbers. Buy price + fees + shipping + supplies = total cost. Expected sell price × (1 - platform fee) - shipping cost = net revenue. Net revenue - total cost = profit. If profit is under 20% of total cost, skip it.',
      },
    ],
  },
  {
    id: 'shipping',
    title: 'Shipping Like a Pro',
    icon: '📦',
    color: 'from-teal-900/40 to-teal-800/20 border-teal-700/30',
    content: [
      {
        heading: 'Shipping Methods',
        text: 'How you ship affects your reputation and your costs. Poor packaging leads to damaged cards, returns, and negative feedback. Professional packaging builds trust and repeat buyers.',
        tips: [
          'PWE (Plain White Envelope): Cards under $20. Top loader + team bag + non-machinable stamp. $1-2 cost.',
          'Bubble Mailer (BMwT): Cards $20-200. Top loader + team bag + bubble mailer. USPS First Class. $4-6.',
          'Small Box: Cards $200+. Graded slabs. Use painter\'s tape (not packing tape) on slabs. Priority Mail. $8-12.',
          'Always get tracking for cards over $20. No exceptions.',
          'Ship within 1-2 business days. Speed builds seller reputation.',
        ],
      },
      {
        heading: 'Cost-Saving Tips',
        text: 'Buy supplies in bulk. 100-pack top loaders cost $8 vs $0.25 each at card shops. Use eBay shipping labels (discounted rates). Reuse bubble mailers from incoming packages. Free USPS Priority boxes from the post office.',
      },
    ],
  },
  {
    id: 'risk-management',
    title: 'Risk Management',
    icon: '🛡️',
    color: 'from-zinc-800/40 to-zinc-700/20 border-zinc-600/30',
    content: [
      {
        heading: 'The Rules of Risk',
        text: 'Every flip carries risk. The card might not sell. The market might crash. The grading might disappoint. Professional flippers manage risk systematically.',
        tips: [
          'Never put more than 10% of your capital into a single card',
          'Diversify across sports, eras, and price points',
          'Set a stop-loss: if a card drops 20% from your buy price, sell and move on',
          'Keep 30% of your capital liquid for unexpected buying opportunities',
          'Track every purchase and sale in a spreadsheet — know your P&L',
        ],
      },
      {
        heading: 'Common Traps',
        text: 'Beginner flippers fall into predictable traps. Buying at the top of a hype spike. Holding losers too long hoping for recovery. Ignoring fees when calculating profit. Over-concentrating in one player or sport.',
        tips: [
          'If everyone on Twitter is talking about a card, you\'re probably too late',
          'The best time to buy is when nobody is talking about a player',
          'Never chase a card that already spiked 50%+ in the last 24 hours',
          'Injury news crashes prices fast — have alerts set for your holdings',
          'Rookie cards are volatile: 60% lose value within 12 months of release',
        ],
      },
    ],
  },
  {
    id: 'advanced-strategies',
    title: 'Advanced Strategies',
    icon: '🎯',
    color: 'from-indigo-900/40 to-indigo-800/20 border-indigo-700/30',
    content: [
      {
        heading: 'Stack and Flip',
        text: 'Buy 5-10 copies of the same card at a low price point, then sell individually as the price rises. Works best with $5-20 raw rookies of breakout candidates. One big game can double your stack value overnight.',
      },
      {
        heading: 'Event Flipping',
        text: 'Buy cards 1-2 weeks before predictable events (All-Star game, playoffs, draft). Sell during or immediately after the event while demand peaks. NFL Draft picks, NBA playoff performers, and MLB trade deadline acquisitions create reliable flip windows.',
        tips: [
          'NFL Draft: Buy top prospect cards 2 weeks before. Sell draft night.',
          'NBA Playoffs: Buy role players on deep teams. Sell during their breakout series.',
          'MLB Trade Deadline: Buy cards of rumored trade targets. Sell on trade announcement.',
          'Award Announcements: Buy frontrunners 1 month before. Sell on announcement day.',
        ],
      },
      {
        heading: 'The Parallel Premium',
        text: 'Numbered parallels (/25, /50, /99, /199) often have more volatile pricing than base cards. A /99 parallel might sell for $30 one week and $80 the next after a big game. Low population means fewer comps and wider price swings — which means more flip opportunities.',
      },
    ],
  },
];

export default function FlippingGuideClient() {
  const [activeSection, setActiveSection] = useState<string>(sections[0].id);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const readinessChecklist = [
    { id: 'r1', text: 'Set aside $200-500 as starting capital that you can afford to lose' },
    { id: 'r2', text: 'Created eBay seller account with completed profile' },
    { id: 'r3', text: 'Joined 3+ Facebook card groups for your primary sport' },
    { id: 'r4', text: 'Purchased basic shipping supplies (top loaders, penny sleeves, bubble mailers)' },
    { id: 'r5', text: 'Set up a tracking spreadsheet (purchase date, cost, sell price, fees, profit)' },
    { id: 'r6', text: 'Followed 5+ card market accounts on X/Twitter for real-time news' },
    { id: 'r7', text: 'Studied eBay completed listings for 10+ cards you plan to flip' },
    { id: 'r8', text: 'Understand platform fees for your primary selling platform' },
    { id: 'r9', text: 'Identified your primary sport and era focus (don\'t try to flip everything)' },
    { id: 'r10', text: 'Bookmarked CardVault tools: Quick-Flip Scorer, Selling Platforms, Flip Window' },
  ];

  const completedCount = readinessChecklist.filter(item => checkedItems.has(item.id)).length;

  return (
    <div className="space-y-8">
      {/* Table of Contents */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-zinc-400 mb-3">JUMP TO SECTION</h2>
        <div className="flex flex-wrap gap-2">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => {
                setActiveSection(s.id);
                document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeSection === s.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              {s.icon} {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Sections */}
      {sections.map(section => (
        <section
          key={section.id}
          id={section.id}
          className={`bg-gradient-to-br ${section.color} border rounded-xl p-6`}
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">{section.icon}</span>
            {section.title}
          </h2>

          <div className="space-y-6">
            {section.content.map((block, bi) => (
              <div key={bi}>
                <h3 className="text-base font-semibold text-white mb-2">{block.heading}</h3>
                <p className="text-zinc-300 text-sm leading-relaxed mb-3">{block.text}</p>

                {block.tips && (
                  <ul className="space-y-1.5 ml-1">
                    {block.tips.map((tip, ti) => (
                      <li key={ti} className="flex gap-2 text-sm">
                        <span className="text-indigo-400 shrink-0 mt-0.5">&#8226;</span>
                        <span className="text-zinc-400">{tip}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {block.warning && (
                  <div className="mt-3 bg-red-950/40 border border-red-800/40 rounded-lg p-3">
                    <p className="text-red-300 text-xs font-medium flex gap-2">
                      <span>&#9888;</span>
                      {block.warning}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Readiness Checklist */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Flip Readiness Checklist</h2>
          <span className={`text-sm font-bold ${completedCount === 10 ? 'text-green-400' : completedCount >= 7 ? 'text-amber-400' : 'text-zinc-400'}`}>
            {completedCount}/10
          </span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all ${completedCount === 10 ? 'bg-green-500' : completedCount >= 7 ? 'bg-amber-500' : 'bg-indigo-500'}`}
            style={{ width: `${(completedCount / 10) * 100}%` }}
          />
        </div>
        <div className="space-y-2">
          {readinessChecklist.map(item => (
            <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkedItems.has(item.id)}
                onChange={() => toggleCheck(item.id)}
                className="mt-1 w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-indigo-500 focus:ring-indigo-500 shrink-0"
              />
              <span className={`text-sm ${checkedItems.has(item.id) ? 'text-zinc-500 line-through' : 'text-zinc-300'} group-hover:text-white transition-colors`}>
                {item.text}
              </span>
            </label>
          ))}
        </div>
        {completedCount === 10 && (
          <div className="mt-4 bg-green-950/40 border border-green-800/40 rounded-lg p-3 text-center">
            <p className="text-green-400 text-sm font-medium">You are ready to start flipping. Good luck and manage your risk.</p>
          </div>
        )}
      </div>

      {/* Quick Reference - Fee Comparison */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Platform Fee Quick Reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-zinc-400 font-medium py-2 pr-4">Platform</th>
                <th className="text-left text-zinc-400 font-medium py-2 pr-4">Seller Fee</th>
                <th className="text-left text-zinc-400 font-medium py-2 pr-4">Best For</th>
                <th className="text-left text-zinc-400 font-medium py-2">Net on $100 Sale</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {[
                { platform: 'eBay', fee: '13% + 2.9%', best: '$20-500 cards', net: '$84.10' },
                { platform: 'Facebook Groups', fee: '0%', best: 'Raw cards, local', net: '$100.00' },
                { platform: 'Mercari', fee: '10%', best: 'Quick sales', net: '$90.00' },
                { platform: 'COMC', fee: '5-20%', best: 'Bulk inventory', net: '$80-95' },
                { platform: 'Whatnot', fee: '9.5%', best: 'Live selling', net: '$90.50' },
                { platform: 'Goldin', fee: '0% seller', best: '$500+ graded', net: '$100.00' },
                { platform: 'MySlabs', fee: '8%', best: 'Graded cards', net: '$92.00' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-zinc-800/50">
                  <td className="py-2 pr-4 font-medium text-white">{row.platform}</td>
                  <td className="py-2 pr-4">{row.fee}</td>
                  <td className="py-2 pr-4 text-zinc-400">{row.best}</td>
                  <td className="py-2 text-emerald-400 font-medium">{row.net}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Related Tools */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">CardVault Flipping Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/tools/quick-flip', label: 'Quick-Flip Scorer', desc: 'Score any card\'s flip potential 0-100' },
            { href: '/tools/flip-window', label: 'Flip Window Calculator', desc: 'Best buy/sell timing by sport and month' },
            { href: '/tools/selling-platforms', label: 'Selling Platforms', desc: 'Compare fees and payouts across 8 platforms' },
            { href: '/tools/regrade-calc', label: 'Regrade Calculator', desc: 'Is cracking and resubmitting worth it?' },
            { href: '/tools/grading-roi', label: 'Grading ROI', desc: 'Calculate grading profit by card and grade' },
            { href: '/tools/listing-advisor', label: 'Smart Listing Advisor', desc: 'Optimize your eBay listing title and price' },
          ].map(tool => (
            <Link
              key={tool.href}
              href={tool.href}
              className="bg-zinc-800/60 border border-zinc-700/30 rounded-lg p-3 hover:border-indigo-500/50 transition-colors"
            >
              <p className="text-white text-sm font-medium">{tool.label}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
