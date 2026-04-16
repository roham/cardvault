import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Autographs & Memorabilia Cards — The Complete Collecting Guide',
  description: 'On-card vs sticker autographs, patch auto premiums, authentication companies, logoman & NFL shield explained, and how to avoid forgeries. The definitive guide to hit cards.',
  keywords: ['autograph cards', 'patch auto', 'on-card autograph', 'sticker auto', 'logoman card', 'NFL shield patch', 'jersey patch card', 'PSA DNA', 'JSA authentication', 'Upper Deck Authenticated', 'cut autograph', '1/1 patch', 'rookie patch auto', 'RPA cards'],
  alternates: { canonical: './' },
};

type AutoType = {
  name: string;
  description: string;
  premium: string;
  examples: string[];
  risk: 'low' | 'medium' | 'high';
};

const autographTypes: AutoType[] = [
  {
    name: 'On-card Autograph',
    description: 'Player signed the card itself before the card was cut and foiled. The ink is on the same cardstock as the artwork, meaning the signature is part of the card permanently. This is the most desirable autograph type because the signature cannot be replaced or swapped.',
    premium: 'Baseline for modern auto premiums',
    examples: [
      'Topps Chrome Rookie Autograph (MLB)',
      'Bowman Chrome Prospect Autograph (MLB)',
      'Panini Contenders Rookie Ticket (NFL)',
      'Upper Deck SP Authentic Future Watch Autograph (NHL)',
      'Panini Flawless On-Card (NBA)',
    ],
    risk: 'low',
  },
  {
    name: 'Sticker Autograph',
    description: 'Player signs a clear sticker, which the manufacturer then applies to the card at the factory. Allows signatures to be collected in advance and combined with cards produced later. Collectors generally discount these 20-40% versus on-card autographs of the same player from the same year.',
    premium: 'Typically 60-80% of on-card premium',
    examples: [
      'Panini Prizm Rookie Autographs (NBA/NFL) — most rookies signed on stickers',
      'Topps Chrome Stadium Club (MLB) — often sticker in high-series',
      'Panini Select (multi-sport)',
      'Upper Deck SPx (NHL) — sticker for many autos',
    ],
    risk: 'low',
  },
  {
    name: 'Patch Auto / RPA',
    description: 'Rookie Patch Autograph — a card that combines a player-worn jersey or patch swatch with an on-card or sticker signature. Considered the premier modern rookie card format. A true "1/1 logoman RPA" of a star rookie can reach six figures.',
    premium: '2-5x base rookie autograph',
    examples: [
      'Panini National Treasures RPA (NBA/NFL/MLB) — the benchmark',
      'Panini Immaculate Rookie Patch Auto (NBA/NFL)',
      'Topps Dynasty Baseball (MLB) — patch auto 1/1 and low-numbered',
      'Upper Deck The Cup Rookie Patch Auto (NHL) — the NHL equivalent of NT',
      'Panini Flawless Patch Auto (multi-sport)',
    ],
    risk: 'medium',
  },
  {
    name: 'Cut Signature',
    description: 'A signature cut from an authenticated source document (check, letter, photograph, index card) and embedded into a trading card. Used to produce autograph cards of deceased or non-signing historical figures — Babe Ruth, Lou Gehrig, Ted Williams, Presidents.',
    premium: 'Varies — tied to source document',
    examples: [
      'Historic Autographs (all sports, historical figures)',
      'Upper Deck SP Legendary Cuts',
      'Leaf Heroes of Sport',
      'Panini Flawless Cut Signatures',
    ],
    risk: 'medium',
  },
  {
    name: 'Inscribed Autograph',
    description: 'Signature plus a written inscription — stat, quote, nickname, Hall of Fame year. Typically numbered lower than the base auto and priced 1.5-3x higher. "MVP 09", "HOF 09", "6x Champs", or a full inscription like "Flu Game 55" all carry meaningful premiums.',
    premium: '1.5-3x base autograph',
    examples: [
      'Panini Immaculate Inscriptions',
      'Leaf Q Inscriptions',
      'Topps Dynasty Inscribed',
      'Upper Deck Authenticated (UDA) inscribed cards',
    ],
    risk: 'low',
  },
  {
    name: 'Dual / Triple / Quad Autograph',
    description: 'Multiple signatures on a single card. Usually themed — teammates, draft class, HOF class, father/son pairs. Scarcity increases with signature count, but so does swap risk if the card is ever cracked from a slab.',
    premium: 'Scales with signer quality and count',
    examples: [
      'Panini Immaculate Dual Patch Autos',
      'Topps Triple Threads Triple Auto',
      'Upper Deck The Cup Honored Members (multi-sig)',
      'Panini Crown Royale Silhouettes Dual',
    ],
    risk: 'medium',
  },
];

type MemoType = {
  name: string;
  description: string;
  premium: string;
};

const memoTypes: MemoType[] = [
  {
    name: 'Jersey / Swatch',
    description: 'A plain piece of player-worn or event-worn jersey fabric. Single-color solid swatches (white home, team-color road) are the base tier. Most modern memorabilia swatches are from event-worn (rookie premiere, all-star weekend) material, not game-worn.',
    premium: 'Baseline (1x)',
  },
  {
    name: 'Patch (multi-color)',
    description: 'A swatch that includes multiple colors — a team logo edge, a seam, or a color-change area like a stripe. Premium depends on specificity and rarity. "Prime patch" means numbered lower or more elaborate patching.',
    premium: '1.5-3x base jersey',
  },
  {
    name: 'Logoman (NBA) / Shield (NFL)',
    description: 'NBA: the Jerry West silhouette logo from the back of the jersey neck. NFL: the NFL shield logo. Both are always 1/1 because only one exists per jersey. These are the crown jewel patches of basketball and football respectively.',
    premium: '20-100x base jersey — always 1/1',
  },
  {
    name: 'Laundry Tag',
    description: 'The white size/washing tag sewn inside jerseys. Always 1/1 per jersey. Less iconic than logoman/shield but still a desirable 1/1 element on patch autograph cards.',
    premium: '5-15x base jersey — always 1/1',
  },
  {
    name: 'Button',
    description: 'The jersey button (MLB, some NHL throwbacks) or a pant button. Always 1/1. Niche but collectible — a true button auto from a star rookie can be a chase card.',
    premium: '3-8x base jersey — always 1/1',
  },
  {
    name: 'NOB (Name on Back)',
    description: 'A letter or the full "Name on Back" patch from the player\'s jersey. Usually numbered by the letter (e.g., "/8" if the player has 8 letters in their last name). "Nameplate" refers to the full piece if the jersey had a nameplate.',
    premium: '3-10x base jersey',
  },
  {
    name: 'MLB Batting Glove / Bat Knob',
    description: 'Baseball memorabilia expanded beyond jerseys in the 2010s. Bat knob cards (the knob end of a game-used bat) and batting glove swatches are common in Topps Dynasty and Triple Threads.',
    premium: '2-5x base jersey',
  },
  {
    name: 'NHL Stick / Skate Lace',
    description: 'Hockey-specific memorabilia pieces. Stick blade swatches, skate lace, and rarely goalie pad fragments show up in Upper Deck Exquisite and The Cup.',
    premium: '2-4x base jersey',
  },
  {
    name: 'Letterman Patch',
    description: 'Multi-letter patches, usually from throwback jerseys or event-worn material, that spell words or team names. Can include team names, "USA", or event inscriptions. Desirable because every card is visually unique.',
    premium: '2-6x base jersey',
  },
];

type AuthCompany = {
  name: string;
  scope: string;
  notes: string;
  trust: 'gold standard' | 'industry leader' | 'high trust' | 'caution';
};

const authCompanies: AuthCompany[] = [
  {
    name: 'Manufacturer-Certified (Panini, Topps, Upper Deck)',
    scope: 'Autographs produced inside sealed packs — factory-authenticated at the card level',
    notes: 'An autograph pulled from a sealed pack is authenticated by definition. The manufacturer signed contracts with players, produced the cards, and the signature never left the supply chain. This is the highest-confidence autograph you can own. Red flag: a "pack-pulled" card with no serial number, no COA box, or where the auto sits outside the designed signature area.',
    trust: 'gold standard',
  },
  {
    name: 'Upper Deck Authenticated (UDA)',
    scope: 'Off-card memorabilia signings — jerseys, photos, pucks, signed pieces that become cards later',
    notes: 'Upper Deck\'s exclusive signing program. Every UDA auto comes with a tamper-evident hologram and a unique serial number searchable at upperdeckstore.com. Used for Michael Jordan, Tiger Woods, Wayne Gretzky, LeBron James exclusives. Extremely trustworthy — UDA has never had a major authentication scandal.',
    trust: 'gold standard',
  },
  {
    name: 'PSA/DNA',
    scope: 'Third-party autograph authentication on all cards, memorabilia, and signed items',
    notes: 'The largest third-party auto authentication service. PSA/DNA slabs integrate with PSA graded card slabs and are searchable at psacard.com/cert. Their Quick Opinion pre-authentication service is widely used at card shows. Not infallible — a small percentage of forgeries have passed and been recalled — but the industry standard for off-card signings.',
    trust: 'industry leader',
  },
  {
    name: 'JSA (James Spence Authentication)',
    scope: 'Third-party authentication, strongest on historical and non-sports signatures',
    notes: 'Widely respected for historical autographs (presidential, entertainment, deceased sports figures). Many collectors prefer JSA over PSA/DNA for Babe Ruth, Mickey Mantle, and pre-war signatures. Full LOA (Letter of Authenticity) is the premium tier — a JSA sticker alone is less trustworthy than a slab plus LOA.',
    trust: 'industry leader',
  },
  {
    name: 'Beckett Authentication Services (BAS)',
    scope: 'Third-party auto authentication integrated with Beckett card grading',
    notes: 'BAS encapsulates autographs in a BGS/BVG slab and issues a certification number. Less market share than PSA/DNA and JSA, but still widely accepted. Works best when paired with a BGS grade on the card itself.',
    trust: 'high trust',
  },
  {
    name: 'TriStar / Steiner / Fanatics Authentic',
    scope: 'Event and memorabilia signing companies — primarily non-card signed items',
    notes: 'Event authenticators who witness and tag signings at private sessions and conventions. Their COAs are trustworthy if the hologram matches their database — but these are rarely card-specific. Primarily used for signed photos, jerseys, and balls.',
    trust: 'high trust',
  },
  {
    name: 'GAI (Global Authentication Inc.) / others',
    scope: 'Smaller or defunct authenticators',
    notes: 'GAI is no longer in business. Older GAI slabs still circulate but carry a discount — submit to PSA/BGS/CGC for re-holder or sell at GAI-discounted prices. Any company outside the four majors (PSA/DNA, JSA, BAS, UDA) warrants extra scrutiny.',
    trust: 'caution',
  },
];

type ProductsBySport = {
  sport: string;
  emoji: string;
  products: {
    name: string;
    tier: 'flagship RPA' | 'premium auto' | 'rookie auto workhorse' | 'prospect auto' | 'legends auto';
    notes: string;
  }[];
};

const productsBySport: ProductsBySport[] = [
  {
    sport: 'NBA',
    emoji: '🏀',
    products: [
      { name: 'Panini National Treasures', tier: 'flagship RPA', notes: 'The benchmark NBA rookie patch auto. Low numbering (99 to 1/1), logoman cards are the six-figure chase.' },
      { name: 'Panini Immaculate Collection', tier: 'flagship RPA', notes: 'Patch-forward design with numbered RPA tiers and shadowbox-style layering.' },
      { name: 'Panini Flawless', tier: 'premium auto', notes: 'Diamond-embedded cards; Flawless Transitions and Patch Auto Gold Vinyl are chase tiers.' },
      { name: 'Panini Prizm Autographs', tier: 'rookie auto workhorse', notes: 'Sticker auto on the Prizm base design. The most widely available NBA rookie auto; parallel hierarchy (Silver, Gold, Black 1/1) drives value.' },
      { name: 'Panini Select Rookie Signatures', tier: 'rookie auto workhorse', notes: 'Three-tier design (Concourse, Premier, Courtside) with sticker autos across levels.' },
      { name: 'Panini Optic', tier: 'rookie auto workhorse', notes: 'Chrome-finish Donruss equivalent. Optic rookie autos sit just below Prizm in desirability.' },
      { name: 'Panini Contenders Rookie Ticket Auto', tier: 'rookie auto workhorse', notes: 'On-card auto on ticket-themed design. Cracked Ice and Championship Ticket parallels are the chase.' },
    ],
  },
  {
    sport: 'NFL',
    emoji: '🏈',
    products: [
      { name: 'Panini National Treasures Football', tier: 'flagship RPA', notes: 'NFL equivalent of the NBA flagship. Rookie Patch Auto numbered to 99 or lower is the benchmark.' },
      { name: 'Panini Contenders Rookie Ticket Auto', tier: 'rookie auto workhorse', notes: 'Arguably the most iconic NFL rookie auto product. Autographed ticket design, on-card, huge checklist depth. Championship Ticket 1/1 is the chase.' },
      { name: 'Panini Prizm Autographs', tier: 'rookie auto workhorse', notes: 'NFL flagship sticker auto — every major rookie class has Prizm autos available across 20+ parallels.' },
      { name: 'Panini Immaculate Collection Football', tier: 'flagship RPA', notes: 'Patch auto and inscribed variants; shadowbox design.' },
      { name: 'Panini Playbook', tier: 'premium auto', notes: 'Booklet-format RPAs with multi-piece patches. Inherently more elaborate patching per card.' },
      { name: 'Panini Flawless Football', tier: 'premium auto', notes: 'Low-numbered diamond-embedded patch autos.' },
      { name: 'Panini Select Rookie Signatures', tier: 'rookie auto workhorse', notes: 'Three-tier design with die-cut parallels.' },
    ],
  },
  {
    sport: 'MLB',
    emoji: '⚾',
    products: [
      { name: 'Bowman Chrome Prospect Autographs', tier: 'prospect auto', notes: 'The dominant prospect auto product in baseball. Signed BEFORE MLB debut. 1st Bowman Chrome auto is the key tier. Refractor parallels (Orange /25, Red /5, Superfractor 1/1) are the high-end chase.' },
      { name: 'Topps Chrome Rookie Autographs', tier: 'rookie auto workhorse', notes: 'Post-debut rookie autographs. Chrome-finish design with refractor parallel ladder.' },
      { name: 'Topps Dynasty Baseball', tier: 'flagship RPA', notes: 'Super-premium product. Every card is a patch auto numbered to 10 or lower, or a 1/1. Bat knob and bat nameplate 1/1s are the chase.' },
      { name: 'Topps Triple Threads', tier: 'premium auto', notes: 'Letterman-patch-heavy product with triple relic + triple auto combos.' },
      { name: 'Panini National Treasures Baseball', tier: 'flagship RPA', notes: 'Panini\'s MLB RPA flagship (uses retired players due to licensing).' },
      { name: 'Bowman Sterling / Bowman Inception', tier: 'prospect auto', notes: 'Alternative prospect auto products with different parallel structures.' },
      { name: 'Topps Tier One', tier: 'premium auto', notes: 'On-card autographs of veterans and legends with inscription variants.' },
    ],
  },
  {
    sport: 'NHL',
    emoji: '🏒',
    products: [
      { name: 'Upper Deck The Cup', tier: 'flagship RPA', notes: 'The NHL equivalent of National Treasures. Rookie Patch Auto numbered to 249 with patch 1/1s as the chase. Exquisite tier and Cup Rookies /99 define the high-end hockey market.' },
      { name: 'Upper Deck SP Authentic Future Watch', tier: 'rookie auto workhorse', notes: 'On-card Future Watch rookie autographs numbered to 999. The workhorse NHL rookie autograph for 20+ years.' },
      { name: 'Upper Deck SPx Rookie Autographs', tier: 'rookie auto workhorse', notes: 'Sticker auto rookie product. Clear acetate design.' },
      { name: 'Upper Deck Artifacts', tier: 'premium auto', notes: 'Aurum and Jersey Auto inserts.' },
      { name: 'Upper Deck Ultimate Collection', tier: 'premium auto', notes: 'Low-numbered rookie autographs.' },
      { name: 'Upper Deck Premier', tier: 'premium auto', notes: 'Premium patch autographs of stars and rookies.' },
    ],
  },
];

const fakeRedFlags = [
  'Autograph sits outside the manufacturer\'s designated signature area on the card — packs are engineered so the sticker or on-card signing lands in a specific zone',
  'Ink shows scratch-off characteristics (flaking, patchy coverage) that suggest a Sharpie applied to the case, not the card',
  'Serial number on the card doesn\'t match PSA/BGS/CGC/UDA database when verified',
  'Card is slabbed by a less-known authenticator (GAI, SGA, World Auth) — re-authenticate before paying a premium',
  'Seller claims "private signing" but the card design has no designated auto area — a real signing would use UDA-style off-card authentication',
  '"Pack-pulled unsigned card plus authenticated signature" — this is not a real product; walk away',
  'PSA/DNA sticker alone on a raw card (no slab) — these stickers have been counterfeited. Full slab or LOA is the standard of trust',
  'The word "autograph" or "auto" appears in the listing but the cert number matches a base card, not an autograph',
  'Patch looks too elaborate for the card\'s numbering — /99 cards almost never have logoman patches; that\'s a 1/1 tier',
];

const faq = [
  {
    q: 'On-card vs sticker auto — is the premium real?',
    a: 'Yes, and it\'s roughly 20-40% in the aftermarket. Collectors value on-card because the signature is physically part of the card and cannot be transferred or swapped. Sticker autos can theoretically be peeled (though manufacturers use tamper-destroy stickers now). For a given player in a given year, an on-card Prizm, Chrome, or Contenders parallel will trade higher than the sticker equivalent of the same player from the same set-year.',
  },
  {
    q: 'What\'s a logoman card?',
    a: 'NBA: the Jerry West silhouette logo patch from the back of a jersey. Every NBA jersey has exactly one logoman patch, which makes every logoman card a 1/1 by definition. In NFL, the equivalent is the "NFL Shield" patch — also 1/1 per jersey. Logoman cards of star rookies in National Treasures or Flawless are the most expensive modern basketball cards, with six-figure sales common for LeBron, Giannis, Luka, Wembanyama, and other generational rookies.',
  },
  {
    q: 'What\'s the difference between PSA/DNA and JSA?',
    a: 'Both are the top tier of third-party autograph authentication. PSA/DNA is more common for modern card autographs and is integrated with PSA card grading. JSA is traditionally stronger for historical and deceased-player signatures (Babe Ruth, pre-war baseball, presidential). For a modern card with an on-card auto, PSA/DNA in a slab is the preferred format. For a historical cut signature card, JSA LOA is often preferred.',
  },
  {
    q: 'Are patch autos better than straight autos for investment?',
    a: 'They carry a premium (2-5x the base auto) but also concentrate risk. Every patch auto has specific risks: swap fraud if ever removed from its slab, subjective "patch quality" grading (dealers discount plain swatches, premium multi-color patches, and logoman chase), and lower liquidity at the very high end. For a star rookie class, collectors who buy mid-numbered patch autos (/99, /49, /25) tend to see consistent appreciation; collectors who buy 1/1 logomans at market peak can lose significant value if the player underperforms.',
  },
  {
    q: 'What is an RPA?',
    a: 'RPA = Rookie Patch Auto. A card containing the combination of: the player\'s rookie season, a player-worn or event-worn jersey patch, and an autograph (usually on-card at the premium tier). The RPA is the modern rookie card benchmark for NBA and NFL. MLB uses Topps Dynasty and Panini National Treasures for the equivalent format. NHL uses Upper Deck The Cup.',
  },
  {
    q: 'Are memorabilia swatches game-worn?',
    a: 'Sometimes, but usually not. Most modern MLB and NBA swatches are labeled "player-worn" and come from rookie premiere events, all-star weekend, or photo shoots. True "game-used" memorabilia is typically called out explicitly (e.g., "Game-Used" tier in Upper Deck The Cup, or "Game-Worn Jersey" callouts in Topps Dynasty) and commands a premium. Default assumption for modern patches should be event-worn or photo-shoot-worn unless the card specifies otherwise.',
  },
  {
    q: 'Can autographs fade or damage over time?',
    a: 'Yes. Sharpie ink on cardstock can fade under UV light, and humidity can cause ink bleed or smearing. On-card autos are more resilient than stickers because ink penetrates cardstock fibers. Store autographed cards in UV-protective holders (one-touches with UV layer, slabs) and avoid display under direct sunlight. Vintage on-card autos (1970s-80s) are often significantly faded today even when kept in collections.',
  },
  {
    q: 'How do I verify a PSA-slabbed autograph card?',
    a: 'Every PSA/DNA slab and every PSA card slab has a unique certification number on the label. Go to psacard.com/cert and enter the number. The result should show the player name, card year, set, card number, grade, and autograph grade (if auto-graded). If any detail doesn\'t match the physical card, do not complete the purchase. Same process for Beckett (beckett.com/graded), CGC (cgccards.com), and UDA (upperdeckstore.com).',
  },
  {
    q: 'Is Fanatics buying Panini going to change auto card collecting?',
    a: 'Fanatics acquired Topps and is set to take over NBA, NFL, and MLB licensing exclusivity over the coming years. Expect product consolidation, likely a unified "Topps Chrome" rookie format across all major sports, and potentially a new RPA flagship replacing National Treasures. Short-term impact on existing inventory has been minimal. Long-term, collectors should expect the current Panini flagship lines to be wound down and replaced with Topps-branded equivalents.',
  },
];

export default function AutographsGuidePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Autographs & Memorabilia Cards — The Complete Collecting Guide',
        description: 'On-card vs sticker autographs, patch auto premiums, authentication companies, logoman & NFL shield explained, and how to avoid forgeries.',
        author: { '@type': 'Organization', name: 'CardVault' },
        publisher: { '@type': 'Organization', name: 'CardVault', url: 'https://cardvault-two.vercel.app' },
        datePublished: '2026-04-16',
        dateModified: '2026-04-16',
        mainEntityOfPage: 'https://cardvault-two.vercel.app/autographs-guide',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cardvault-two.vercel.app' },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://cardvault-two.vercel.app/guides' },
          { '@type': 'ListItem', position: 3, name: 'Autographs & Memorabilia Guide', item: 'https://cardvault-two.vercel.app/autographs-guide' },
        ],
      }} />

      {/* Breadcrumbs */}
      <nav className="mb-6 text-xs text-gray-500 flex items-center gap-2">
        <Link href="/" className="hover:text-gray-300">Home</Link>
        <span>›</span>
        <Link href="/guides" className="hover:text-gray-300">Guides</Link>
        <span>›</span>
        <span className="text-gray-400">Autographs & Memorabilia</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          Hit Cards · Patches · Authentication
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Autographs & Memorabilia Cards — The Complete Guide
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Patch autos, on-card vs sticker, logoman and shield explained, the authentication hierarchy, and the fraud patterns that cost collectors tens of thousands per year. Written for buyers, not sellers.
        </p>
      </div>

      {/* Market at a glance */}
      <div className="bg-gradient-to-br from-amber-900/30 via-gray-900/30 to-gray-900/30 border border-amber-800/30 rounded-2xl p-6 mb-10">
        <h2 className="text-white font-bold text-lg mb-2">The hit-card market, at a glance</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-5">
          Autographed and memorabilia cards — "hits" — drive the majority of modern trading card value. A typical National Treasures NFL box contains roughly 8 hits across 100+ total cards, yet those 8 hits represent 95%+ of the box\'s aftermarket value. The hit premium is the product.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { stat: '95%+', label: 'Box EV in hits', sub: 'Base cards of a premium product are near-worthless; hits carry the product' },
            { stat: '2-5x', label: 'RPA premium', sub: 'Rookie patch autos trade 2-5x over base rookie autos of the same player' },
            { stat: '1/1', label: 'Logoman / shield', sub: 'Every jersey has exactly one logoman patch — every logoman card is a 1/1' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <div className="text-amber-400 text-xl font-bold mb-1">{s.stat}</div>
              <div className="text-white text-sm font-medium mb-1">{s.label}</div>
              <div className="text-gray-500 text-xs">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TOC */}
      <nav className="mb-10 bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-3 font-medium">On this page</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {[
            { href: '#autograph-types', label: '1. Types of Autograph Cards' },
            { href: '#memorabilia', label: '2. Memorabilia & Patch Types' },
            { href: '#authentication', label: '3. The Authentication Hierarchy' },
            { href: '#by-sport', label: '4. Major Autograph Products by Sport' },
            { href: '#fake-flags', label: '5. Red Flags for Forgeries' },
            { href: '#faq', label: '6. FAQ' },
          ].map(item => (
            <a key={item.href} href={item.href} className="text-emerald-400 hover:text-emerald-300">
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Autograph Types */}
      <section id="autograph-types" className="mb-14">
        <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-3">
          <span>✍️</span> Types of Autograph Cards
        </h2>
        <div className="space-y-4">
          {autographTypes.map(t => (
            <div key={t.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{t.name}</h3>
                  <div className="text-amber-400 text-sm font-medium">{t.premium}</div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                  t.risk === 'low' ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/30' :
                  t.risk === 'medium' ? 'text-yellow-400 bg-yellow-950/40 border-yellow-800/30' :
                  'text-rose-400 bg-rose-950/40 border-rose-800/30'
                }`}>
                  {t.risk === 'low' ? 'Low fraud risk' : t.risk === 'medium' ? 'Medium fraud risk' : 'High fraud risk'}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">{t.description}</p>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Representative products</div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {t.examples.map(ex => (
                  <li key={ex} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="text-amber-500 mt-0.5 shrink-0">·</span>
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Memorabilia */}
      <section id="memorabilia" className="mb-14">
        <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-3">
          <span>🧵</span> Memorabilia & Patch Types
        </h2>
        <p className="text-gray-400 text-sm mb-6 max-w-3xl">
          Not every "patch" is equal. Premium scales with color complexity, scarcity, and iconicity of the patch element. Knowing the hierarchy helps you price cards correctly and spot overpriced listings.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memoTypes.map(m => (
            <div key={m.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-white font-bold">{m.name}</h3>
                <div className="text-amber-400 text-xs font-semibold shrink-0">{m.premium}</div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{m.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Authentication */}
      <section id="authentication" className="mb-14">
        <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-3">
          <span>🔐</span> The Authentication Hierarchy
        </h2>
        <p className="text-gray-400 text-sm mb-6 max-w-3xl">
          Not all "authenticated" autographs carry equal weight. Here\'s the hierarchy collectors actually use when pricing cards.
        </p>
        <div className="space-y-3">
          {authCompanies.map(a => (
            <div key={a.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <h3 className="text-white font-bold">{a.name}</h3>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${
                  a.trust === 'gold standard' ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/30' :
                  a.trust === 'industry leader' ? 'text-emerald-400 bg-emerald-950/30 border-emerald-800/30' :
                  a.trust === 'high trust' ? 'text-blue-400 bg-blue-950/40 border-blue-800/30' :
                  'text-yellow-400 bg-yellow-950/40 border-yellow-800/30'
                }`}>
                  {a.trust}
                </span>
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">{a.scope}</div>
              <p className="text-gray-300 text-sm leading-relaxed">{a.notes}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Products by sport */}
      <section id="by-sport" className="mb-14">
        <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-3">
          <span>🏆</span> Major Autograph Products by Sport
        </h2>
        <div className="space-y-6">
          {productsBySport.map(s => (
            <div key={s.sport} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                <span>{s.emoji}</span> {s.sport}
              </h3>
              <div className="space-y-3">
                {s.products.map(p => (
                  <div key={p.name} className="flex items-start gap-4 bg-gray-800/50 rounded-xl p-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <div className="text-white font-semibold text-sm">{p.name}</div>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border uppercase tracking-wide ${
                          p.tier === 'flagship RPA' ? 'text-amber-400 bg-amber-950/40 border-amber-800/30' :
                          p.tier === 'premium auto' ? 'text-violet-400 bg-violet-950/40 border-violet-800/30' :
                          p.tier === 'rookie auto workhorse' ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/30' :
                          p.tier === 'prospect auto' ? 'text-sky-400 bg-sky-950/40 border-sky-800/30' :
                          'text-gray-400 bg-gray-800 border-gray-700'
                        }`}>
                          {p.tier}
                        </span>
                      </div>
                      <div className="text-gray-400 text-sm leading-relaxed">{p.notes}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Red flags */}
      <section id="fake-flags" className="mb-14">
        <div className="bg-rose-950/20 border border-rose-800/30 rounded-2xl p-6">
          <h2 className="text-white text-2xl font-bold mb-3 flex items-center gap-3">
            <span>🚩</span> Red Flags for Forged or Altered Autographs
          </h2>
          <p className="text-gray-400 text-sm mb-5">
            Autograph fraud is a nine-figure annual problem in the hobby. The following are the most common patterns. If any apply, walk away from the transaction.
          </p>
          <ul className="space-y-2.5">
            {fakeRedFlags.map((flag, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                <span className="text-rose-400 mt-0.5 shrink-0 text-base">✗</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <div className="text-white text-sm font-semibold mb-2">Rule of thumb</div>
            <p className="text-gray-400 text-sm leading-relaxed">
              For any autograph card over $500, require a PSA, BGS, CGC, or UDA slab with a verifiable cert number before payment. Never accept a raw auto at graded-card prices. If you\'re uncertain, submit the card for authentication before reselling — the small fee is insurance.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mb-14">
        <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-3">
          <span>❓</span> Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faq.map(f => (
            <details key={f.q} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 group">
              <summary className="text-white font-semibold cursor-pointer list-none flex items-start justify-between gap-3">
                <span>{f.q}</span>
                <span className="text-emerald-400 text-xl shrink-0 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-gray-300 text-sm leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
        <h2 className="text-white font-bold text-lg mb-4">Related Tools & Guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/fake-cards', title: 'How to Spot Fake Cards', sub: 'Trimmed cards, fake slabs, forged autographs — detection methods' },
            { href: '/tools/auth-check', title: 'Card Authentication Checker', sub: '12-point inspection with weighted verdict' },
            { href: '/tools/cert-check', title: 'PSA Cert Verifier', sub: 'Analyze cert numbers; flag counterfeit slab patterns' },
            { href: '/tools/slab-comparison', title: 'Slab Comparison', sub: 'PSA vs BGS vs CGC vs SGC across 6 dimensions' },
            { href: '/grading', title: 'Grading Company Hub', sub: 'Pricing, scales, strengths for PSA, BGS, CGC, SGC' },
            { href: '/guides/most-valuable-sports-cards', title: 'Most Valuable Sports Cards', sub: 'What the market\'s top hits have sold for' },
          ].map(r => (
            <Link
              key={r.href}
              href={r.href}
              className="block bg-gray-800/50 hover:bg-gray-800 border border-gray-700/30 hover:border-emerald-800/40 rounded-xl p-4 transition-colors"
            >
              <div className="text-white text-sm font-semibold mb-1">{r.title}</div>
              <div className="text-gray-400 text-xs">{r.sub}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-wrap gap-3">
        <Link href="/guides" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          ← All Guides
        </Link>
        <Link href="/tools/auth-check" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
          Authenticate a Card →
        </Link>
        <Link href="/tools/slab-comparison" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
          Compare Slab Types →
        </Link>
      </div>
    </div>
  );
}
