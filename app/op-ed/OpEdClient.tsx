'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

interface Columnist {
  key: string;
  name: string;
  beat: string;
  color: string;
  voice: string;
  signoff: string;
}

interface Topic {
  key: string;
  title: string;
  hook: string;
}

interface ColumnPayload {
  title: string;
  dek: string;
  date: string;
  columnist: Columnist;
  topic: Topic;
  body: string[];
  pullQuote: string;
  tags: string[];
  comments: { handle: string; stance: 'pro' | 'con' | 'meh'; text: string }[];
  agreeRate: number;
}

const COLUMNISTS: Columnist[] = [
  {
    key: 'hollingsworth',
    name: 'Margaret Hollingsworth',
    beat: 'Vintage Purist',
    color: 'rose',
    voice: 'measured, historical, skeptical of modern hype',
    signoff: 'From my binder to yours,\nMargaret Hollingsworth',
  },
  {
    key: 'abeyta',
    name: 'Marcus "Marc" Abeyta',
    beat: 'Modern Speculator',
    color: 'emerald',
    voice: 'finance-flavored, bullish on exposure, loves options metaphors',
    signoff: 'Size up or stay home.\nMarc Abeyta',
  },
  {
    key: 'subramanian',
    name: 'Dr. Priya Subramanian',
    beat: 'The Analyst',
    color: 'cyan',
    voice: 'data-first, methodical, refuses to speculate without numbers',
    signoff: 'Cite the comp or cite nothing.\nPriya Subramanian, PhD',
  },
  {
    key: 'caravella',
    name: 'Tony "T-Bone" Caravella',
    beat: 'Dealer Realist',
    color: 'amber',
    voice: 'gruff, 35-years-at-the-shop, sees every trend repeat',
    signoff: 'Saturday will tell you who was right.\nT-Bone',
  },
  {
    key: 'lin',
    name: 'Jess "BrrrBreaks" Lin',
    beat: 'Breaker · TikTok Native',
    color: 'fuchsia',
    voice: 'energetic, audience-first, writes how she talks',
    signoff: 'Catch me live tonight at 8.\n— Jess 💜',
  },
];

const TOPICS: Topic[] = [
  {
    key: 'grading-premium',
    title: 'Is the PSA 10 premium sustainable or a bubble?',
    hook: 'PSA 10s are trading at 4–6× their PSA 9 counterparts for modern rookies. Some say this is efficient market pricing. Others say it is pure mania.',
  },
  {
    key: 'bowman-prospect',
    title: 'Are Bowman Chrome 1st prospect autos still worth chasing?',
    hook: 'With Bowman Chrome prices cooling since the 2021 peak, should new collectors still buy prospects, or has the game changed?',
  },
  {
    key: 'breakers-market',
    title: 'Breakers: creating the market or destroying the margins?',
    hook: 'Breakers buy 40–60% of hobby box production at launch. Defenders call them distribution; critics call them a middleman tax.',
  },
  {
    key: 'vintage-vs-modern',
    title: 'Will vintage ever come back the way modern has?',
    hook: 'Vintage index is up 12% over 3 years. Modern flagship rookies up 40%+ over the same period. Has vintage permanently lost the retail audience?',
  },
  {
    key: 'numbered-parallels',
    title: 'Panini ships 80 parallels per set. Is that a feature or a disease?',
    hook: 'Every 2024 Prizm parallel has a serial number. Collectors have divergent opinions on whether set completion should exist anymore.',
  },
  {
    key: 'ai-grading',
    title: 'Should AI grade cards, or is this the end of trust in the market?',
    hook: 'Two grading startups now offer AI-assisted grading. Prices are half of PSA; turnaround is 48 hours. The hobby is split on whether this is progress.',
  },
  {
    key: 'sealed-vs-singles',
    title: 'Sealed wax: the last honest hobby asset, or the next correction?',
    hook: 'Wax prices have outperformed singles since 2020. The thesis is "no more wax is printed." The counterthesis is "people forget how much was printed."',
  },
  {
    key: 'female-players',
    title: 'Why does womens sports card inventory still lag demand?',
    hook: 'WNBA viewership set records in 2024. Caitlin Clark Prizms trade at football-star premiums. Yet Panini prints women roughly 1/20 as many autos as male counterparts.',
  },
  {
    key: 'rookie-card-rules',
    title: 'Is the "rookie card" label due for a redefinition?',
    hook: 'First Bowman, first Topps, first flagship, first auto — collectors disagree on which "first" counts. Industry bodies have not updated the rules in 20 years.',
  },
  {
    key: 'case-break-odds',
    title: 'Should break odds be printed on the pack, like cereal box nutrition?',
    hook: 'Sports card cases have no standardized odds disclosure. Compare Magic: The Gathering which lists pull rates on every pack.',
  },
  {
    key: 'flipper-vs-collector',
    title: 'The flipper problem: is speculation killing long-term collecting?',
    hook: 'Card shows report that 40% of buyers under 30 resell within 90 days. Shops are adjusting pricing assuming flip intent. Where is the line?',
  },
  {
    key: 'retail-scarcity',
    title: 'Retail is empty. Scalpers win. Is Panini incentivized to fix it?',
    hook: 'Blaster boxes are scalped from the shelf within 48 hours of restock. Manufacturer margins are higher at LCS and online — retail scarcity may be profitable for them.',
  },
];

// Column templates — each columnist has 3 paragraphs written in their voice,
// parameterized by the topic hook/title. The final paragraph closes.

function buildBody(columnist: Columnist, topic: Topic): string[] {
  const t = topic.title;
  const h = topic.hook;
  switch (columnist.key) {
    case 'hollingsworth':
      return [
        `${h} When I look at this debate I see the same pattern I saw in 1991 — a segment of the hobby convinces itself that "this time is different," and then the market hands them a lesson. The cards that held up through the Junk Wax Era were not the ones with the biggest short-term runs. They were the ones with real scarcity, real history, and buyers who still wanted them twenty years later.`,
        `What is interesting about ${t.toLowerCase()} is how often the discussion omits the long view. I have seen the "sustainable premium" argument applied to 1988 Fleer stickers. I have seen the "efficient market" argument applied to 1990 Leaf. The vocabulary evolves; the overconfidence does not. Every generation discovers scarcity, mispriced supply, and the "new collector class," and every generation overestimates how long the pricing holds.`,
        `My rule is simple: if a card cannot survive a recession, it is not an investment; it is a trade. Pre-1973 cards have survived four recessions. Modern cards have survived one, partially, and the verdict is still open. Before paying a premium on anything printed this decade, ask whether you would hold the card if prices dropped 60%. If you would not, you were never collecting it. You were renting it.`,
      ];
    case 'abeyta':
      return [
        `${h} Let me frame this the way I think about every position: you are long an asset, and the question is whether the premium represents embedded volatility or embedded pricing power. Those are different things. Embedded volatility means the price is about to mean-revert. Embedded pricing power means the market has re-rated the asset class upward. Confusing the two is how hobbyists lose money.`,
        `On ${t.toLowerCase()}: the simplest test is delta against the underlying. If the modern rookie auto has 3× the price action of the raw card, you are paying for convexity — and convexity has a cost in time decay. Parallels, graded premiums, and speculative autos all have positive convexity during bull cycles and negative convexity the moment sentiment turns. Do not short volatility by accident.`,
        `My book right now is overweight Bowman 1st Prospect autos with sub-5 POP 10 data, underweight flagship Topps Update RCs already above $2,000. I am adding on dips, not chasing tops. If you wouldn't write a 1-year call option on the card at current prices, you probably shouldn't be long at current prices either. That's the whole game.`,
      ];
    case 'subramanian':
      return [
        `${h} Before we argue the thesis, let us fix the methodology. Too much of this debate relies on anecdote — "a friend sold one for X" — instead of the three data surfaces that actually matter: sold comp velocity, pop report trajectory, and price-to-pop ratio over time. Any position that cannot be defended on those three surfaces is vibes, not analysis.`,
        `Looking at ${t.toLowerCase()} through the sold-comp lens, the picture is less binary than commentators suggest. The aggregate index masks significant subsegment divergence: top-5 players in each sport are behaving differently from the 6–50 tier, which in turn differs from the long tail. Grouping them into one narrative is the analytical equivalent of averaging your temperature with the oven and calling it comfortable.`,
        `My recommendation is diagnostic, not prescriptive. Pull the VCP sold-comp chart for the five cards that are supposedly representative of this trend, overlay the pop report growth, and look at the price-per-pop figure over 12 months. If price rises faster than pop grows, you are looking at real demand acceleration. If pop grows faster than price, you are looking at supply outrunning conviction. Everything else is noise until the data says otherwise.`,
      ];
    case 'caravella':
      return [
        `${h} Been hearing this argument around the shop for thirty-five years, just with different nouns. In 1991 it was wax. In 1999 it was Mantle rookies. In 2008 it was PSA 10 Griffeys. In 2020 it was Luka Prizms. The specific answer changes; the structure of the overreaction does not. I stopped placing bets on the trend and started placing bets on the regulars. The regulars are right more often than the headlines.`,
        `On ${t.toLowerCase()}: my Saturday foot-traffic tells a different story than the Twitter consensus. The collectors coming through my door are mostly buying in the $20-$200 range, one card at a time, and they do not care what the online influencer said about the $5,000 card. They care whether the card looks good in a binder and whether they can afford it. That is the market. Everything above $500 is a side hustle, not the hobby.`,
        `If you want to know what the next five years look like, spend a Saturday behind a show table. Listen to what kids ask for. They ask for names, not parallels. They ask for their favorite player, not pop-5 variations. The industry forgot that the hobby is built on player fandom, not speculation products. When fandom returns to the center, the speculative tiers correct. That is my prediction and I have been wrong about six of the last thirty-five years, so take that however you want.`,
      ];
    case 'lin':
      return [
        `${h} Okay so I've been thinking about this all week on stream and here's my honest take — the people arguing about this online are missing the part where the hobby is actually growing because more people are watching breaks, not because more people are "investing." Those are two different ecosystems. One is retail collecting for fun, one is a secondary market. When Twitter argues, it's usually the secondary market talking over the retail crowd.`,
        `On ${t.toLowerCase()}: my audience doesn't care about the thesis. They care if the rip is fun, if the cards are good, if the community is real. I've had 2,000 people in my live room watching a $400 break. That's 2,000 people who weren't in the hobby five years ago. That's the signal. Everything else is noise until somebody quantifies it against that retention number.`,
        `If you want the truth, log into any breaker's Whatnot room between 8 and 11 PM Eastern. Watch for 45 minutes. Count the first-time viewers who buy a spot. Count the repeat faces. That's the growth curve. Not auction totals, not pop reports, not "index" charts. People showing up on a Tuesday night. That's the hobby. Everything else is just people trying to price it.`,
      ];
    default:
      return [h, t, 'Take.'];
  }
}

function buildPullQuote(c: Columnist, t: Topic): string {
  switch (c.key) {
    case 'hollingsworth':
      return 'If a card cannot survive a recession, it is not an investment. It is a rental.';
    case 'abeyta':
      return "Don't short volatility by accident.";
    case 'subramanian':
      return 'Vibes are not a methodology.';
    case 'caravella':
      return 'The regulars are right more often than the headlines.';
    case 'lin':
      return "People showing up on a Tuesday night — that's the hobby.";
    default:
      return t.title;
  }
}

function buildTags(c: Columnist, t: Topic): string[] {
  const base = ['Op-Ed', c.beat];
  if (t.key.includes('grading')) base.push('Grading');
  if (t.key.includes('bowman')) base.push('Prospects');
  if (t.key.includes('breakers')) base.push('Breakers');
  if (t.key.includes('vintage')) base.push('Vintage');
  if (t.key.includes('parallels')) base.push('Parallels');
  if (t.key.includes('ai')) base.push('Technology');
  if (t.key.includes('sealed')) base.push('Sealed Wax');
  if (t.key.includes('female')) base.push('WNBA');
  if (t.key.includes('rookie')) base.push('Rookies');
  if (t.key.includes('odds')) base.push('Transparency');
  if (t.key.includes('flipper')) base.push('Flipping');
  if (t.key.includes('retail')) base.push('Retail');
  return base;
}

function buildComments(c: Columnist, t: Topic, seed: number) {
  const pros = [
    { handle: '@SlabSteward', text: 'Finally a take that isn\'t copy-paste from a YouTube thumbnail.' },
    { handle: '@binder_broker', text: 'Margaret is right and the vintage crowd has been saying this for a decade.' },
    { handle: '@prizmpriest', text: 'Saved. Sending this to my whole group chat.' },
    { handle: '@ripsandgrips', text: 'The methodology paragraph is the one. Most of hobby discourse fails this test.' },
    { handle: '@nickelvintage', text: 'Cited three data surfaces. That alone is rarer than a 1/1.' },
    { handle: '@darksidecards', text: 'Jess speaking truth, the secondary crowd dismisses retail growth at their peril.' },
    { handle: '@gradesgonewild', text: 'T-Bone with 35 years behind the counter > anyone with a Twitter account.' },
    { handle: '@packhunter_OH', text: 'Convexity framing is actually how I think about this too. Marc nailed it.' },
  ];
  const cons = [
    { handle: '@tradeupking', text: 'Respectfully, this is a take from someone who hasn\'t bought a card since 2007.' },
    { handle: '@coastcardsco', text: 'Citing the 1991 wax crash every time gets old. Different era, different product, different buyer.' },
    { handle: '@vibescharter', text: 'Marc, no offense, but calling hobby assets "convexity" is how the 2021 crash happened.' },
    { handle: '@dealerpit', text: 'The LCS-regulars take ignores that LCS foot traffic is down 22% in 3 years. Something changed.' },
    { handle: '@whaleorbust', text: 'Data is great until the data is 12 months stale. Most VCP charts are.' },
    { handle: '@panchoprizm', text: 'The online market IS the hobby now. Saturday foot-traffic is a lagging indicator.' },
    { handle: '@longplaycards', text: 'Disagree that female player inventory is demand-limited — it\'s supply-limited by Panini contracts.' },
    { handle: '@the_flipless', text: 'Respectfully, this feels like you wrote the conclusion first and reverse-engineered the argument.' },
  ];
  const mehs = [
    { handle: '@hobbyhedger', text: 'I see both sides honestly.' },
    { handle: '@quietcollect', text: 'No strong take either way but appreciate the piece.' },
    { handle: '@midpack', text: 'Reading this, the truth is probably somewhere in between.' },
    { handle: '@slowsleeves', text: 'Interesting framing. Going to sit with this.' },
  ];

  // Seeded pick of 8 comments biased by columnist stance
  const rng = (() => {
    let s = seed | 0;
    return () => {
      s = (s * 1664525 + 1013904223) | 0;
      return ((s >>> 0) % 100000) / 100000;
    };
  })();

  const proWeight = c.key === 'hollingsworth' || c.key === 'subramanian' || c.key === 'caravella' ? 0.55 : 0.45;
  const out: { handle: string; stance: 'pro' | 'con' | 'meh'; text: string }[] = [];
  const used = new Set<string>();
  while (out.length < 8) {
    const r = rng();
    let pool: typeof pros;
    let stance: 'pro' | 'con' | 'meh';
    if (r < proWeight) {
      pool = pros;
      stance = 'pro';
    } else if (r < proWeight + 0.4) {
      pool = cons;
      stance = 'con';
    } else {
      pool = mehs;
      stance = 'meh';
    }
    const pick = pool[Math.floor(rng() * pool.length)];
    if (!pick || used.has(pick.handle)) continue;
    used.add(pick.handle);
    out.push({ handle: pick.handle, stance, text: pick.text });
  }
  return out;
}

function dateToSeed(d: Date): number {
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function prettyDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function buildColumn(d: Date): ColumnPayload {
  const seed = dateToSeed(d);
  const cIdx = seed % COLUMNISTS.length;
  const tIdx = Math.floor(seed / COLUMNISTS.length) % TOPICS.length;
  const columnist = COLUMNISTS[cIdx];
  const topic = TOPICS[tIdx];
  const comments = buildComments(columnist, topic, seed);
  const proCount = comments.filter((c) => c.stance === 'pro').length;
  const agreeRate = proCount / comments.length;
  return {
    title: topic.title,
    dek: `${columnist.name} takes on today's hot topic in ${columnist.beat.toLowerCase()} fashion.`,
    date: isoDate(d),
    columnist,
    topic,
    body: buildBody(columnist, topic),
    pullQuote: buildPullQuote(columnist, topic),
    tags: buildTags(columnist, topic),
    comments,
    agreeRate,
  };
}

function colorClasses(c: string) {
  const map: Record<string, { border: string; bg: string; text: string; chipBorder: string }> = {
    rose: { border: 'border-rose-500/40', bg: 'bg-rose-500/5', text: 'text-rose-300', chipBorder: 'border-rose-500/40' },
    emerald: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/5', text: 'text-emerald-300', chipBorder: 'border-emerald-500/40' },
    cyan: { border: 'border-cyan-500/40', bg: 'bg-cyan-500/5', text: 'text-cyan-300', chipBorder: 'border-cyan-500/40' },
    amber: { border: 'border-amber-500/40', bg: 'bg-amber-500/5', text: 'text-amber-300', chipBorder: 'border-amber-500/40' },
    fuchsia: { border: 'border-fuchsia-500/40', bg: 'bg-fuchsia-500/5', text: 'text-fuchsia-300', chipBorder: 'border-fuchsia-500/40' },
  };
  return map[c] || map.cyan;
}

const STORAGE_KEY = 'cv_op_ed_votes_v1';

function loadVotes(): Record<string, 'agree' | 'disagree'> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveVotes(v: Record<string, 'agree' | 'disagree'>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {}
}

export default function OpEdClient() {
  const today = useMemo(() => new Date(), []);
  const [offset, setOffset] = useState(0);
  const [votes, setVotes] = useState<Record<string, 'agree' | 'disagree'>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setVotes(loadVotes());
    setHydrated(true);
  }, []);

  const viewDate = useMemo(() => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - offset);
    return d;
  }, [today, offset]);

  const col = useMemo(() => buildColumn(viewDate), [viewDate]);
  const colorset = colorClasses(col.columnist.color);

  const myVote = votes[col.date];

  function vote(v: 'agree' | 'disagree') {
    const next = { ...votes };
    if (next[col.date] === v) delete next[col.date];
    else next[col.date] = v;
    setVotes(next);
    saveVotes(next);
  }

  function shareCol() {
    const text = `"${col.pullQuote}"\n\n— ${col.columnist.name}, ${prettyDate(col.date)}\nThe CardVault Op-Ed\nhttps://cardvault-two.vercel.app/op-ed`;
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
  }

  if (!hydrated) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
        Loading today's column…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date navigator */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => setOffset(offset + 1)}
          disabled={offset >= 6}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-slate-300 hover:border-slate-500 disabled:opacity-50"
        >
          ← Earlier
        </button>
        <button
          onClick={() => setOffset(Math.max(0, offset - 1))}
          disabled={offset <= 0}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-slate-300 hover:border-slate-500 disabled:opacity-50"
        >
          Later →
        </button>
        <button
          onClick={() => setOffset(0)}
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-amber-200 hover:bg-amber-500/20"
        >
          Today
        </button>
        <span className="text-slate-500">
          Viewing: <span className="text-slate-300">{prettyDate(col.date)}</span>
        </span>
      </div>

      {/* Column */}
      <article
        className={`rounded-2xl border ${colorset.border} bg-slate-950/60 p-6 sm:p-8`}
      >
        <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider">
          {col.tags.map((t) => (
            <span
              key={t}
              className={`rounded-full border ${colorset.chipBorder} ${colorset.bg} ${colorset.text} px-2 py-0.5`}
            >
              {t}
            </span>
          ))}
        </div>

        <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {col.title}
        </h2>

        <div className="mt-2 text-sm text-slate-400 italic">{col.topic.hook}</div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-b border-slate-800 pb-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${colorset.border} ${colorset.bg} text-lg font-semibold ${colorset.text}`}>
            {col.columnist.name
              .split(' ')
              .filter((_, i, a) => i === 0 || i === a.length - 1)
              .map((n) => n[0])
              .join('')}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">By {col.columnist.name}</div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500">
              {col.columnist.beat} · {prettyDate(col.date)}
            </div>
          </div>
        </div>

        <div className="prose prose-invert mt-6 max-w-none">
          <p className="text-base leading-relaxed text-slate-200">{col.body[0]}</p>

          <blockquote
            className={`my-6 border-l-4 ${colorset.border} pl-4 font-serif text-xl italic ${colorset.text}`}
          >
            "{col.pullQuote}"
          </blockquote>

          <p className="text-base leading-relaxed text-slate-200">{col.body[1]}</p>
          <p className="mt-4 text-base leading-relaxed text-slate-200">{col.body[2]}</p>

          <pre className="mt-6 whitespace-pre-wrap border-t border-slate-800 pt-4 font-mono text-xs text-slate-500">
{col.columnist.signoff}
          </pre>
        </div>

        {/* Vote + share */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            onClick={() => vote('agree')}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
              myVote === 'agree'
                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-emerald-500/40'
            }`}
          >
            ⬆ Agree
          </button>
          <button
            onClick={() => vote('disagree')}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
              myVote === 'disagree'
                ? 'border-rose-400 bg-rose-500/20 text-rose-200'
                : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-rose-500/40'
            }`}
          >
            ⬇ Disagree
          </button>
          <button
            onClick={shareCol}
            className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/20"
          >
            Copy pull-quote
          </button>
          <span className="text-xs text-slate-500">
            Reader agreement on the floor: {Math.round(col.agreeRate * 100)}%
          </span>
        </div>
      </article>

      {/* Comment signal */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Comment signal ({col.comments.length})
        </h3>
        <ul className="space-y-3">
          {col.comments.map((c) => (
            <li key={c.handle} className="flex gap-3 border-b border-slate-800/60 pb-3 last:border-b-0">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] text-slate-400">
                {c.handle.replace('@', '').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-200">{c.handle}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wide ${
                      c.stance === 'pro'
                        ? 'bg-emerald-500/20 text-emerald-200'
                        : c.stance === 'con'
                          ? 'bg-rose-500/20 text-rose-200'
                          : 'bg-slate-700/50 text-slate-300'
                    }`}
                  >
                    {c.stance === 'pro' ? 'agrees' : c.stance === 'con' ? 'disagrees' : 'neutral'}
                  </span>
                </div>
                <div className="mt-1 text-sm text-slate-300">{c.text}</div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3 text-[11px] text-slate-500">
          Comments are simulated NPC responses seeded from the column&apos;s stance. Real commenting
          ships with accounts.
        </div>
      </section>

      {/* 7-day archive */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          7-day archive
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(today);
            d.setUTCDate(d.getUTCDate() - i);
            const c = buildColumn(d);
            const cc = colorClasses(c.columnist.color);
            return (
              <button
                key={i}
                onClick={() => setOffset(i)}
                className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                  i === offset
                    ? `${cc.border} ${cc.bg}`
                    : 'border-slate-800 bg-slate-950/30 hover:border-slate-600'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider text-slate-500">
                  {i === 0 ? 'TODAY' : `${i}d ago`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-xs font-semibold text-slate-200">
                    {c.title}
                  </div>
                  <div className={`truncate text-[11px] ${cc.text}`}>
                    By {c.columnist.name} · {c.columnist.beat}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-[11px] text-slate-500">
        The CardVault Op-Ed is a rotating opinion column with five fictional columnist personas.
        Positions are hobby-authentic archetypes; bylines are not real people. Published daily
        (topic + columnist rotate deterministically from the date). See{' '}
        <Link href="/news" className="text-amber-300 hover:underline">
          News Feed
        </Link>{' '}
        for factual reporting.
      </div>
    </div>
  );
}
