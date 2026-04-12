import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Spot Fake Sports Cards and Pokémon Cards — Authentication Guide',
  description: 'Complete guide to identifying counterfeit sports cards and Pokémon cards. Learn to detect trimmed cards, fake PSA slabs, recolored cards, fake autographs, and counterfeit Pokémon cards using texture, light, and weight tests.',
  keywords: ['how to spot fake sports cards', 'fake pokemon cards', 'fake PSA slab', 'counterfeit sports cards', 'trimmed cards', 'how to authenticate cards', 'fake autograph cards'],
};

interface FakeType {
  title: string;
  description: string;
  indicators: string[];
  tools: string[];
  severity: 'critical' | 'high' | 'medium';
}

const severityColor: Record<string, string> = {
  critical: 'text-rose-400 bg-rose-950/40 border-rose-800/30',
  high: 'text-orange-400 bg-orange-950/40 border-orange-800/30',
  medium: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/30',
};

const severityLabel: Record<string, string> = {
  critical: 'Critical — Hard to detect',
  high: 'High — Common fraud',
  medium: 'Medium — Usually obvious',
};

const sportsFakes: FakeType[] = [
  {
    title: 'Trimmed Cards',
    description: 'Trimmed cards have had their borders cut down — sometimes by as little as 0.5mm per side — to remove chipping, rough edges, or print defects that would prevent a high grade. A PSA 3 can become a PSA 8 with careful trimming. This is the most dangerous fraud in sports card collecting because it\'s undetectable without specialized equipment and is classified as counterfeiting.',
    severity: 'critical',
    indicators: [
      'Card dimensions are slightly off — authentic cards have standardized dimensions (2.5" × 3.5" for modern cards)',
      'Borders appear unusually clean and sharp, especially on vintage cards that typically show some wear',
      'Centering looks "too perfect" on old cards — pre-1980s printing was rarely this precise',
      'Edge texture appears cut rather than die-cut — die-cut edges have a slightly rougher, layered look',
      'Card feels smaller when held next to authentic copies of the same set',
      'Under a loupe, the border ends in a clean knife line rather than a factory edge pattern',
    ],
    tools: [
      'Precision digital calipers ($15–30) — measure all four borders against population database averages',
      'Jeweler\'s loupe (10×) — examine edge texture closely; trimmed edges show a straight knife cut',
      'Reference card from the same set — compare dimensions side by side',
      'PSA Population Report — cross-reference: if a "PSA 9" raw card looks like it should have easily graded to 10, ask why it wasn\'t submitted',
    ],
  },
  {
    title: 'Fake or Altered Autographs',
    description: 'Forged autographs are a $100M+ per year fraud problem in sports memorabilia. Cards with on-card or sticker autographs — especially graded Beckett BGS or PSA cards with authentication stickers — are primary targets. Sellers add forged signatures to uncertified copies of buyback cards or blank sticker autos.',
    severity: 'critical',
    indicators: [
      'Ink sheen inconsistent with the card\'s age — 30-year-old Sharpie fades, fresh forgeries don\'t',
      'Pen pressure marks visible from the back of the card — authentic on-card autos often leave slight indentations',
      'Sticker auto placement is off-center or not in the designated signature area',
      'Autograph style differs from authenticated examples — compare against PSA certification database and player reference sites',
      'Card shows no wear consistent with its "age" while the auto looks fresh — mismatched aging patterns',
      'Hologram on a certified card looks slightly off-color, scratched, or has a seam line',
    ],
    tools: [
      'PSA Cert Verification (psacard.com/cert) — every PSA slab has a unique certification number; verify it matches the holder',
      'Beckett BGS Verify (beckett.com/graded) — same process for BGS/BVG slabs',
      'Reference sites: Sports Reference, player Wikipedia entries with photo galleries for signature comparison',
      'UV light — some authentication stickers fluoresce differently than counterfeits',
      'Never buy high-value unsigned cards "with" a signature not reflected in the certification label',
    ],
  },
  {
    title: 'Re-graded and Re-holdered Slabs',
    description: 'A PSA slab is a hard plastic case with a holographic label. Criminals crack open a legitimate PSA slab, replace the card inside with a lower-grade or outright fake card, then reseal the slab (or replace with a convincing reproduction). The fraudster keeps the authentic high-grade card and sells the "PSA 10" slab with a worthless card inside.',
    severity: 'critical',
    indicators: [
      'Slab edges show scratches, tool marks, or a seam that\'s slightly separated — authentic slabs are sonically welded with no visible seam',
      'Label edges appear rough, slightly misaligned, or have a different hologram pattern than current PSA labels',
      'The card inside rattles more than expected — authentic graded cards fit snugly in their wells',
      'Certification number on the label doesn\'t match PSA\'s database, or matches a different card/grade',
      'Barcode doesn\'t scan to the correct PSA verification page',
      'Label font or layout differs from the current PSA label design (PSA has updated labels over the years — know the era)',
    ],
    tools: [
      'PSA Cert Verification — scan the barcode or enter the cert number at psacard.com/cert',
      'Physical inspection: run your finger along all four edges of the slab — any separation or gap is a red flag',
      'UV light: PSA labels have UV-reactive security features that fakes rarely replicate accurately',
      'Magnifier for label inspection — font irregularities, pixelation, or color variance in holograms are detectable under magnification',
      'Compare slab thickness with a known authentic slab — counterfeit slabs sometimes use different plastic gauge',
    ],
  },
  {
    title: 'Recolored, Restored, or Pressed Cards',
    description: 'Recoloring adds pigment to faded or worn card stock, typically to borders that have yellowed or "toned" with age. Restoration applies amateur conservation techniques to hide creases, chips, and surface damage. Card pressing flattens creases without changing the paper structure — the crease is hidden but present. All three are fraud when not disclosed.',
    severity: 'high',
    indicators: [
      'Border color under UV light appears different from the center — recolored borders absorb UV differently than original printing',
      'Surface texture is inconsistent across the card — restored areas have a slightly different feel or reflectivity',
      'Under a loupe, pressed cards show crease lines as a faint texture change even after flattening',
      'White borders appear unusually bright on an old card — vintage cards accumulate ambient yellowing; "too white" borders on a 1952 Topps are suspicious',
      'Color bleeds or pools near the edge of restored areas — a telltale sign of brush-applied pigment',
    ],
    tools: [
      'UV light — the single most useful tool for detecting restoration and recoloring',
      '10× jeweler\'s loupe — examine surface texture for inconsistencies',
      'Touch test — restored areas often feel different from unaltered card stock; gently run a fingertip across the entire surface',
      'Photography under raking light — hold the card at a low angle to a bright light source; creases and surface irregularities cast shadows',
    ],
  },
  {
    title: 'Completely Counterfeit Sports Cards',
    description: 'Outright fakes printed to mimic authentic cards. More common with vintage high-value cards (1952 Topps Mantle, 1952 Bowman, 1933 Goudey) and modern inserts/parallels. Print quality has improved significantly — casual visual inspection is not sufficient for authentication of high-value vintage.',
    severity: 'high',
    indicators: [
      'Cardstock feels wrong — vintage cards have specific paper composition that\'s difficult to replicate; modern printer cardstock feels noticeably different',
      'Color saturation is "too good" — authentic vintage cards have aged ink that lacks the vibrancy of modern printing',
      'Rosette pattern (dot printing) doesn\'t match the era — examine under 10× loupe; authentic vintage shows era-appropriate printing dots',
      'Black light test: authentic vintage cards fluoresce differently than modern paper (paper whiteners weren\'t used in vintage production)',
      'Card back text/logo layout is slightly off — compare against authenticated reference images at the set level',
      'Perforations or star impressions don\'t match authentic pattern (for pre-war tobacco cards)',
    ],
    tools: [
      'UV blacklight — critical for vintage authentication; vintage paper has no optical brighteners, modern fakes do',
      'Jeweler\'s loupe at 10–30× — examine rosette printing pattern',
      'Reference guides: Standard Catalog of Vintage Baseball Cards, PSA Grading Standards',
      'Third-party grading (PSA, SGC, BGS) — for any vintage card over $500, send to a grader; it\'s the only true authentication',
      'Do not trust "raw" vintage above $200 without professional authentication',
    ],
  },
];

const pokemonFakes: FakeType[] = [
  {
    title: 'Counterfeit Pokémon Card Texture Test',
    description: 'Authentic Pokémon cards have a specific texture on both sides that results from Wizards of the Coast / The Pokémon Company\'s printing process. Counterfeits often fail the texture test immediately.',
    severity: 'medium',
    indicators: [
      'Authentic card backs have a subtle dot texture — run your thumbnail across it; you should feel a fine grain',
      'Fake backs often feel smooth like a photo print or have an inconsistent texture pattern',
      'Authentic holos have a specific pattern (grid, cosmos, or other era-appropriate pattern) — fakes use random sparkle or wrong patterns',
      'Card edges feel flimsy or different thickness — authentic cards have a 3-layer sandwich construction visible at edges',
      'The holo foil on authentic cards catches light in a specific directional pattern; fakes often show static sparkle that doesn\'t shift with viewing angle',
      'Front texture: authentic cards have a slight sheen on the illustration area and matte feel on the text box boundary — fakes often miss this transition',
    ],
    tools: [
      'Fingertip texture check — immediate test, no tools needed',
      'Holo tilt test — tilt at multiple angles under a single-point light; authentic holos show a consistent pattern shift',
      'Direct comparison with a confirmed authentic from the same set',
      'Phone flashlight at low angle — raking light reveals texture inconsistencies within seconds',
    ],
  },
  {
    title: 'Light and Print Quality Test',
    description: 'Authentic Pokémon cards are printed at extremely high resolution using commercial offset printing. Counterfeits almost always show printing artifacts visible under magnification.',
    severity: 'medium',
    indicators: [
      'Hold the card up to a bright light — authentic cards have a specific semi-opacity; fakes are often more opaque (thicker) or fully transparent',
      'Text edges under magnification: authentic text has clean vector-sharp edges; fakes show pixel roughness or ink spread',
      'Color registration: check where colored areas meet — authentic cards have precise registration; fakes show color misalignment or halos',
      'HP number, attack cost symbols, and energy symbols are slightly off-size or positioned wrong on fakes',
      'The black border: authentic black borders are a specific density; fakes often use a noticeably lighter or more greenish black',
      'The copyright line at the bottom is a reliable check — font size, spacing, and the specific copyright year and company name must be exactly correct',
    ],
    tools: [
      '10× jeweler\'s loupe — standard tool for any Pokémon card authentication',
      'Bright LED light for backlight test',
      'Reference image: check the card against a high-resolution scan from PSA or the Pokémon card database (pokemoncard.io or serebii.net)',
    ],
  },
  {
    title: 'Weight Test',
    description: 'Authentic Pokémon cards have a standardized weight. Counterfeits are frequently too heavy (laminated) or too light (inferior cardstock). This test is accurate but requires a precise scale.',
    severity: 'medium',
    indicators: [
      'Standard authentic weight: 1.78–1.80 grams for modern Pokémon cards',
      'Fakes are commonly 1.6g (too light) or 2.0–2.2g (too heavy, laminated)',
      'Weight test is especially useful for bulk checking — weigh multiple cards; any outliers warrant closer inspection',
      'Vintage Base Set cards weigh slightly more (thicker stock) — use era-appropriate reference weights',
    ],
    tools: [
      'Jewelry scale accurate to 0.01g ($15–25 on Amazon) — required for reliable results',
      'Weigh 5 confirmed-authentic cards from the same set to establish your baseline before testing suspected fakes',
    ],
  },
  {
    title: 'Color and Font Accuracy Test',
    description: 'The Pokémon TCG uses specific proprietary fonts and exact Pantone-matched colors across all its sets. Counterfeiters rarely replicate colors precisely or use the correct fonts — and the differences are detectable with a trained eye.',
    severity: 'medium',
    indicators: [
      'Yellow border color: authentic cards use a specific warm gold-yellow; fakes often use brighter, cooler, or more saturated yellow',
      'The font used for card names is proprietary — counterfeits use similar-but-wrong fonts with slightly different letter spacing or weight',
      'Energy symbol colors: fire, water, grass, lightning, psychic all have exact colors; even subtle shifts indicate a fake',
      'Pokémon stage indicator (Basic, Stage 1, Stage 2) has specific typography and positioning — check against authentic reference',
      'Damage numbers are a consistent size and font weight — irregularities are immediate flags',
      'The "Set symbol" in the lower right of authentic cards is exact; fakes often have fuzzy edges or wrong sizing on set symbols',
    ],
    tools: [
      'Reference card from the same set — a known-authentic copy is the best calibration tool',
      'Pokémon card database with high-res scans (pokemoncard.io, pkmncards.com) for side-by-side comparison',
      'Color calibrated phone camera — photograph both cards under the same lighting and compare digitally',
    ],
  },
  {
    title: 'Fake Graded Pokémon Slabs',
    description: 'The same slab-swapping and counterfeit slab fraud that exists in sports cards exists in Pokémon. PSA 10 Base Set Charizard at $60,000+ is a major target. BGS 10 Black Label examples are also targets.',
    severity: 'critical',
    indicators: [
      'Certification number does not match PSA database, or matches a different card/grade than advertised',
      'Slab edges show any gap, separation, or tool marks — authentic slabs are sealed with no accessible seam',
      'Hologram label color is slightly off — PSA labels have a specific holographic pattern that shifts color consistently at different angles',
      'Label text appears pixelated or uses slightly wrong font — this is visible under a loupe',
      'Card inside doesn\'t match the label description (wrong year, wrong art, wrong card number)',
      'The card appears to float or rattle in the holder — authentic slabs hold the card snugly in form-fitting wells',
    ],
    tools: [
      'psacard.com/cert — verify every PSA cert before purchase of any card over $200',
      'beckett.com/graded — BGS/BVG verification',
      'CGC Verify (cgccards.com) — for CGC-graded Pokémon cards',
      'Physical inspection: run your finger along all four edges of the slab looking for any seam or gap',
    ],
  },
];

const redFlags = [
  'Price is 40%+ below comparable eBay sold listings with no explanation',
  '"No returns" policy on a high-value vintage or graded card',
  'Seller refuses to provide additional photos of the card back, edges, and corners',
  'Feedback below 98% on eBay for a seller offering cards over $200',
  'No authentication or provenance documentation on a card claiming to be PSA 9+ raw vintage',
  '"Recently pulled from a pack" for a vintage card — sealed vintage packs haven\'t been pulled in decades',
  'Hologram label described as "slightly damaged" — this is a red flag for tampered slabs',
  'Multiple listings of the same high-value certified card from one seller',
  'Facebook Marketplace, Instagram DMs, or Discord — non-traceable transaction platforms for expensive cards',
  'Seller is willing to accept cash, Zelle, Venmo Friends & Family, or cryptocurrency — no buyer protection',
];

const safeSources = [
  { name: 'eBay', note: 'Buyer protection via eBay Guarantee. Always use tracked shipping and purchase protection, never Friends & Family payment methods.', trust: 'High with caution' },
  { name: 'PSA Auction', note: 'PSA-authenticated cards sold at auction. Graded by the issuer — as close to risk-free as exists.', trust: 'Very High' },
  { name: 'Goldin Auctions', note: 'Premier sports card auction house with in-house authentication. Track record of major sales.', trust: 'Very High' },
  { name: 'Heritage Auctions', note: 'Established auction house with extensive card authentication expertise.', trust: 'Very High' },
  { name: 'PWCC', note: 'Large consignment auction platform. Has had historical fraud issues that led to reforms — improved since 2021.', trust: 'High' },
  { name: 'TCGPlayer', note: 'For raw Pokémon cards. Seller ratings, buyer protection, and high transaction volume for price reference.', trust: 'High for raw Pokémon' },
  { name: 'COMC', note: 'Sports cards consignment with physical inspection. Cards are physically handled and can be verified.', trust: 'High' },
  { name: 'Local card shows', note: 'Inspect in person, no shipping risk. Reputable dealers at established shows have reputations to protect.', trust: 'High with inspection' },
  { name: 'Facebook Marketplace', note: 'No buyer protection, no accountability. Use only for sub-$50 trades where fraud risk is manageable.', trust: 'Low — cash only under $50' },
  { name: 'Instagram DMs / Discord', note: 'Zero protection. Avoid for anything over $30–50. Fraud is rampant on social platforms.', trust: 'Very Low' },
];

export default function FakeCardsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-rose-950/60 border border-rose-800/50 text-rose-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-rose-400 rounded-full" />
          Authentication Guide
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          How to Spot Fake Sports Cards and Pokémon Cards
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Trimmed vintage, fake slabs, re-holdered PSA cases, forged autographs, Pokémon counterfeits — every major fraud type explained with specific detection methods. Know before you buy.
        </p>
      </div>

      {/* Scale of the problem */}
      <div className="bg-gradient-to-br from-rose-900/30 via-gray-900/30 to-gray-900/30 border border-rose-800/30 rounded-2xl p-6 mb-10">
        <h2 className="text-white font-bold text-lg mb-2">The scale of card fraud</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          The sports card and Pokémon card market generates approximately $10B+ in annual transactions. Fraud — ranging from counterfeit cards to altered grades to forged autographs — has been estimated at hundreds of millions per year. PSA alone has graded over 80 million cards. The sophistication of counterfeiting has increased dramatically with improvements in home printing and access to grading standards.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Trimming', stat: '#1 most dangerous', sub: 'Undetectable without calipers — can pass visual inspection' },
            { label: 'Fake slabs', stat: 'Target: $500+', sub: 'Slab swapping targets any card worth more than the cost to fake it' },
            { label: 'Pokémon fakes', stat: 'Mass market', sub: 'Counterfeit Pokémon cards flood retail — mostly obvious, some sophisticated' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <div className="text-rose-400 text-lg font-bold mb-1">{stat.stat}</div>
              <div className="text-white text-sm font-medium mb-1">{stat.label}</div>
              <div className="text-gray-500 text-xs">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sports card fraud section */}
      <section className="mb-14">
        <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-3">
          <span>⚾</span> Sports Card Fraud Types
        </h2>
        <div className="space-y-6">
          {sportsFakes.map(fake => (
            <div key={fake.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-white font-bold text-lg">{fake.title}</h3>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${severityColor[fake.severity]}`}>
                  {severityLabel[fake.severity]}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-5">{fake.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Warning indicators</div>
                  <ul className="space-y-1.5">
                    {fake.indicators.map((ind, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-rose-500 mt-0.5 shrink-0">·</span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Detection tools</div>
                  <ul className="space-y-1.5">
                    {fake.tools.map((tool, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-emerald-500 mt-0.5 shrink-0">·</span>
                        <span>{tool}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pokémon section */}
      <section className="mb-14">
        <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-3">
          <span>⚡</span> Pokémon Card Fraud Types
        </h2>
        <div className="space-y-6">
          {pokemonFakes.map(fake => (
            <div key={fake.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-white font-bold text-lg">{fake.title}</h3>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${severityColor[fake.severity]}`}>
                  {severityLabel[fake.severity]}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-5">{fake.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Warning indicators</div>
                  <ul className="space-y-1.5">
                    {fake.indicators.map((ind, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-rose-500 mt-0.5 shrink-0">·</span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Detection tools</div>
                  <ul className="space-y-1.5">
                    {fake.tools.map((tool, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-emerald-500 mt-0.5 shrink-0">·</span>
                        <span>{tool}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick toolkit */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
        <h2 className="text-white font-bold text-xl mb-4">Authentication toolkit under $100</h2>
        <p className="text-gray-400 text-sm mb-5">
          Every serious collector should own these. Total cost is under $75 and they protect you on every purchase indefinitely.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { item: 'Jeweler\'s Loupe — 10× or 30×', price: '$8–15', why: 'Examine rosette printing, edges, text quality, holo patterns. The single most useful authentication tool.' },
            { item: 'Digital Calipers', price: '$12–20', why: 'Measure card dimensions to 0.01mm. Non-negotiable for trimming detection on vintage cards.' },
            { item: 'UV Blacklight (395nm)', price: '$8–15', why: 'Detect restoration, recoloring, and counterfeit cardstock. Works instantly on any card.' },
            { item: 'Precision Scale (0.01g)', price: '$12–20', why: 'Weight test for Pokémon cards. Any deviation from 1.78–1.80g warrants further inspection.' },
            { item: 'Card Savers + Penny Sleeves', price: '$15–25 for 100', why: 'Not authentication tools, but protect cards while you examine them and during submission.' },
          ].map(tool => (
            <div key={tool.item} className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="text-white font-semibold text-sm">{tool.item}</div>
                <div className="text-emerald-400 font-bold text-sm shrink-0">{tool.price}</div>
              </div>
              <div className="text-gray-400 text-xs leading-relaxed">{tool.why}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PSA cert verification */}
      <div className="bg-gradient-to-br from-blue-900/30 via-gray-900/20 to-gray-900/30 border border-blue-800/30 rounded-2xl p-6 mb-8">
        <h2 className="text-white font-bold text-xl mb-3">PSA Cert Verification — Use It Every Time</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          Every legitimate PSA-graded card has a unique certification number printed on the label. This number is directly linked to PSA\'s database and shows the exact card, grade, and year graded.
        </p>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Find the cert number on the PSA label — typically below the grade, in the format 12345678 or similar.' },
            { step: '2', text: 'Go to psacard.com/cert and enter the number, or scan the barcode with your phone camera.' },
            { step: '3', text: 'Verify: player name, card year, set, card number, and grade all match the physical card in the slab.' },
            { step: '4', text: 'If anything doesn\'t match — wrong grade, wrong card, "not found" — do not complete the purchase.' },
          ].map(step => (
            <div key={step.step} className="flex items-start gap-4 bg-gray-900/60 rounded-xl p-4">
              <div className="w-8 h-8 rounded-full bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
                {step.step}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed pt-1">{step.text}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-xs mt-4">
          Same process applies for BGS (beckett.com/graded), CGC (cgccards.com), and SGC — every major grading company has a cert verification portal. Use it for any card over $100.
        </p>
      </div>

      {/* Red flags */}
      <div className="bg-rose-950/20 border border-rose-800/30 rounded-2xl p-6 mb-8">
        <h2 className="text-white font-bold text-xl mb-4">Walk-away red flags</h2>
        <p className="text-gray-400 text-sm mb-4">If any of these apply, stop the transaction.</p>
        <ul className="space-y-2">
          {redFlags.map((flag, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
              <span className="text-rose-400 mt-0.5 shrink-0 text-base">✗</span>
              <span>{flag}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Safe sources */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
        <h2 className="text-white font-bold text-xl mb-4">Where to buy safely</h2>
        <div className="space-y-3">
          {safeSources.map(source => (
            <div key={source.name} className="flex items-start gap-4 bg-gray-800/50 rounded-xl p-4">
              <div className="shrink-0">
                <div className="text-white font-semibold text-sm">{source.name}</div>
                <div className={`text-xs mt-0.5 font-medium ${
                  source.trust.startsWith('Very High') ? 'text-emerald-400' :
                  source.trust.startsWith('High') ? 'text-emerald-400' :
                  source.trust.startsWith('Low') || source.trust.startsWith('Very Low') ? 'text-rose-400' :
                  'text-yellow-400'
                }`}>{source.trust}</div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{source.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-wrap gap-3">
        <Link href="/guides/best-cards-under-100" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          Best Cards Under $100
        </Link>
        <Link href="/guides/most-valuable-sports-cards" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
          Most Valuable Sports Cards
        </Link>
        <Link href="/guides/best-pokemon-investments" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
          Pokémon Investments Guide
        </Link>
      </div>
    </div>
  );
}
