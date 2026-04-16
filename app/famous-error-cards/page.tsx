import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Famous Error Cards — The Hall of Infamy (30 Legendary Printing Mistakes) | CardVault',
  description: 'The definitive catalog of the 30 most famous error cards ever printed. Billy Ripken FF, Frank Thomas NNOF, Sherry Magie T206, Reverse Negatives, and the wildest printing screw-ups in hobby history. Every story, every correction, every premium.',
  keywords: [
    'famous error cards', 'error card hall of infamy', 'billy ripken ff card', 'frank thomas nnof',
    'sherry magie t206', 'reverse negative error', 'baseball card errors', 'misprint cards',
    'most valuable error cards', 'error variation cards', 'card printing mistakes',
  ],
  openGraph: {
    title: 'Famous Error Cards — The Hall of Infamy',
    description: '30 legendary error cards. Billy Ripken, Frank Thomas NNOF, Sherry Magie, Dale Murphy Reverse Negative — the wildest printing screw-ups in cardboard history.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Famous Error Cards — Hall of Infamy | CardVault',
    description: '30 legendary error cards, their stories, corrections, and collector premiums.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Guides', href: '/guides' },
  { label: 'Famous Error Cards' },
];

interface ErrorCard {
  id: string;
  year: number;
  set: string;
  player: string;
  errorType: 'Misspelling' | 'Reverse Negative' | 'Wrong Back' | 'No Name' | 'Missing Element' | 'Offensive Text' | 'Wrong Photo' | 'Variation' | 'Short Print' | 'Color Error';
  tier: 'legendary' | 'iconic' | 'notable';
  sport: 'Baseball' | 'Basketball' | 'Football' | 'Hockey' | 'Multi';
  error: string;
  correction: string;
  story: string;
  premium: string;
  spotTip: string;
}

const ERROR_CARDS: ErrorCard[] = [
  {
    id: 'magie-1909',
    year: 1909,
    set: 'T206 American Tobacco',
    player: 'Sherry Magee',
    errorType: 'Misspelling',
    tier: 'legendary',
    sport: 'Baseball',
    error: 'Surname printed as "MAGIE" instead of "MAGEE" on the front nameplate of the Philadelphia outfielder\'s T206 card.',
    correction: 'American Tobacco caught the typo mid-run and re-engraved the nameplate to the correct "MAGEE" spelling. Both versions exist in the population — the error is dramatically rarer.',
    story: 'One of the earliest and most valuable error cards in the hobby. Sherry Magee was a four-time NL RBI leader, so his card was always desirable — but the MAGIE misprint turned it into a legend. The correct "MAGEE" version is a common T206; the MAGIE is one of the scarcest cards in the set, with under 50 known in all grades.',
    premium: 'PSA 5 MAGIE: $90,000-$150,000+. MAGEE equivalent: $400-$800. Premium: roughly 200x.',
    spotTip: 'The nameplate is the only difference. Compare letter by letter: E-A-G-E-E vs E-A-G-I-E. Look at the fourth letter.',
  },
  {
    id: 'ripken-ff-1989',
    year: 1989,
    set: 'Fleer #616',
    player: 'Billy Ripken',
    errorType: 'Offensive Text',
    tier: 'legendary',
    sport: 'Baseball',
    error: 'The knob of Billy Ripken\'s bat clearly displays the letters "F*CK FACE" hand-written in black marker.',
    correction: 'Fleer scrambled to suppress it. Multiple corrections followed: black box over the knob, white-out over the words, scribble cover-up, and finally an airbrushed removal. At least seven distinct variations exist.',
    story: 'The most famous error card of all time. The story: Ripken\'s teammates had labeled his bat as a prank, and the Fleer photographer caught it clean in the at-bat pose. Fleer didn\'t notice until after shipping. By the time they tried to kill it, collectors were already ripping packs to hunt the uncensored original. It turned a backup-infielder card into an enduring piece of hobby culture.',
    premium: 'Uncorrected (clear words) PSA 9: $300-$600. Black box: $15-$30. Scribble: $20-$40. White-out: $30-$75. The full 7-variation set is a collector\'s holy grail.',
    spotTip: 'Look at the bat knob in his hands. Crystal-clear black writing = the original. Any cover-up = a later correction.',
  },
  {
    id: 'frank-thomas-nnof-1990',
    year: 1990,
    set: 'Topps #414',
    player: 'Frank Thomas',
    errorType: 'No Name',
    tier: 'legendary',
    sport: 'Baseball',
    error: 'Frank Thomas\'s name is completely missing from the front of his rookie card — the nameplate is blank.',
    correction: 'Topps corrected the printing plates almost immediately. The No-Name-On-Front (NNOF) variation is estimated at under 100 confirmed copies, vs millions of the corrected version.',
    story: 'Frank Thomas was already projected as a star rookie, which made the NNOF error explosive from day one. It\'s the most valuable rookie-card error of the modern era. Topps has never officially commented on how many slipped through. PSA has graded fewer than 75 NNOF copies in all grades combined.',
    premium: 'NNOF PSA 10: $300,000-$500,000+. PSA 9: $75,000-$150,000. Regular 1990 Topps Frank Thomas: $3-$8. Premium: 10,000x+ at high grade.',
    spotTip: 'Flip to the front nameplate — the strip where "FRANK THOMAS" should appear in red on the bottom border. Blank = NNOF.',
  },
  {
    id: 'mantle-yellow-letters-1969',
    year: 1969,
    set: 'Topps #500',
    player: 'Mickey Mantle',
    errorType: 'Color Error',
    tier: 'iconic',
    sport: 'Baseball',
    error: 'The "MANTLE" nameplate appears in yellow letters on some copies and white letters on others. The yellow-letter version is the error.',
    correction: 'The printing run shifted from yellow ink to white mid-production. Both are valid pulls from 1969 packs, but the yellow is substantially rarer.',
    story: 'Mantle\'s last Topps card during his playing career — released as he retired after spring training 1969. The yellow-letter version is one of the most iconic modern-era variations. Some experts argue it\'s a running-change variation rather than a true error; either way, the market treats it as a premium card.',
    premium: 'Yellow Letter PSA 8: $30,000-$45,000. White Letter PSA 8: $4,000-$6,000. Premium: 5-8x.',
    spotTip: 'Look at the color of the letters in "MANTLE" at the bottom. Yellow = the rarer variation. Hold at an angle to confirm in good light.',
  },
  {
    id: 'aaron-reverse-1957',
    year: 1957,
    set: 'Topps #20',
    player: 'Hank Aaron',
    errorType: 'Reverse Negative',
    tier: 'iconic',
    sport: 'Baseball',
    error: 'Hank Aaron appears to be batting left-handed on his card. Aaron was a right-handed hitter. The photo negative was printed flipped.',
    correction: 'The error was never formally corrected in the 1957 run — every 1957 Topps #20 Aaron shows him "batting left." It is technically not a variation, just a universal printing flaw.',
    story: 'One of the most famous "wrong-handed" cards. Aaron hit 755 home runs right-handed, but the 1957 Topps set shows him with the bat on his left shoulder. Topps didn\'t catch it. It\'s a beloved quirk of a beloved card rather than a true value-driver — the fame of Aaron dwarfs the error premium.',
    premium: 'No premium over corrected version — there is no corrected version. PSA 8: $3,000-$5,000. The error status just adds storytelling.',
    spotTip: 'Hand position reveals it. The bat rests on his left shoulder, and his hands are positioned for a left-handed swing. Compare to any other Aaron card.',
  },
  {
    id: 'murphy-reverse-1989',
    year: 1989,
    set: 'Upper Deck #357',
    player: 'Dale Murphy',
    errorType: 'Reverse Negative',
    tier: 'iconic',
    sport: 'Baseball',
    error: 'Dale Murphy appears to bat left-handed in his inaugural Upper Deck release. The negative was flipped.',
    correction: 'Upper Deck corrected it within weeks of release. The error version is scarce compared to the corrected run.',
    story: 'In Upper Deck\'s inaugural 1989 set — the set that changed the entire industry with premium cardstock and holograms — the most prominent error was Dale Murphy batting the wrong way. Murphy was a two-time NL MVP known as a classic right-handed power hitter. The error landed in the first print run, making it a chronological hobby milestone: the first Upper Deck error.',
    premium: 'Reverse Negative PSA 9: $150-$300. Corrected PSA 9: $8-$15. Premium: 15-25x.',
    spotTip: 'Letter "B" on his jersey should appear normal. On the error, the text and uniform detail run backwards. Batting stance is the giveaway.',
  },
  {
    id: 'bonds-no-position-1991',
    year: 1991,
    set: 'Topps Desert Shield',
    player: 'Barry Bonds',
    errorType: 'Variation',
    tier: 'notable',
    sport: 'Baseball',
    error: 'Barry Bonds\'s Topps Desert Shield card was part of a limited 6,800-card insert-set run distributed only to U.S. troops during Operation Desert Shield. Some copies show print defects from the foil-stamp process.',
    correction: 'Not a true error — a scarcity play. But many copies have off-center foil stamps that collectors treat as a minor variation tier.',
    story: 'Desert Shield parallels were printed at 6,800 copies each and shipped overseas to U.S. servicemembers. Many were lost, damaged, or destroyed. Those that survive are among the scarcest baseball cards of the modern era. The off-center foil stamps on the Bonds card add a second layer of collectibility.',
    premium: 'Desert Shield Bonds PSA 9: $2,500-$5,000. Regular 1991 Topps Bonds: $1-$3. Premium for the parallel: 1,000x+.',
    spotTip: 'The gold "Operation Desert Shield" foil stamp in the top-right corner is the marker. Check centering of the stamp itself.',
  },
  {
    id: 'clemente-right-bat-1968',
    year: 1968,
    set: 'Topps #150',
    player: 'Roberto Clemente',
    errorType: 'Reverse Negative',
    tier: 'iconic',
    sport: 'Baseball',
    error: 'A subset of 1968 Topps Clemente prints show him batting with the bat on the right shoulder (his right) — the negative was reversed.',
    correction: 'Corrected in a later printing. The error is considerably scarcer than the standard version.',
    story: 'Clemente batted right-handed. The reverse-negative version is a known collector quirk on one of the most beloved cards of the 1960s. Because Clemente\'s legend is so outsized, even the error is often bought for nostalgia rather than scarcity.',
    premium: 'Reverse Negative PSA 8: $2,500-$4,000. Regular PSA 8: $1,200-$1,800. Premium: 2-3x.',
    spotTip: 'Check the "P" on his Pirates cap — it will appear mirrored on the error version. The bat position is the other tell.',
  },
  {
    id: 'gonzalez-gone-zales-1990',
    year: 1990,
    set: 'Donruss Diamond Kings #29',
    player: 'Juan Gonzalez',
    errorType: 'Misspelling',
    tier: 'notable',
    sport: 'Baseball',
    error: 'Donruss Diamond Kings subset: his last name was spelled "GONZALES" with an S instead of the correct "GONZALEZ" with a Z.',
    correction: 'Corrected in later print runs. Both versions are valid pulls from 1990 Donruss boxes.',
    story: 'Donruss had a recurring problem with Latin names in the early 1990s — Gonzalez became Gonzales, Cabrera had a similar swap in 1991. The Diamond Kings subset was the premier artwork-based insert of the era, so the error landed in a high-visibility card.',
    premium: 'GONZALES error PSA 9: $40-$80. GONZALEZ corrected PSA 9: $10-$15. Premium: 4-8x.',
    spotTip: 'Last letter of the surname — S or Z. Check the nameplate carefully.',
  },
  {
    id: 'nettles-craig-1981',
    year: 1981,
    set: 'Fleer #87',
    player: 'Graig Nettles',
    errorType: 'Misspelling',
    tier: 'notable',
    sport: 'Baseball',
    error: 'Fleer printed his first name as "CRAIG" instead of the correct "GRAIG."',
    correction: 'Corrected mid-run. Both versions appear in roughly equal numbers — Fleer fixed it but didn\'t destroy the earlier sheets.',
    story: 'Fleer entered the market in 1981 after a federal ruling broke Topps\'s monopoly. Their first set was plagued with spelling errors, missing stats, and printing issues — the Nettles "Craig" is one of the best-known. First-year production glitches are common in newly-founded card companies.',
    premium: 'CRAIG error PSA 9: $30-$60. GRAIG corrected PSA 9: $6-$10. Premium: 4-6x.',
    spotTip: 'First letter of the first name: C or G. Look at the bottom of the card where his name appears.',
  },
  {
    id: 'bo-jackson-score-1990',
    year: 1990,
    set: 'Score Football',
    player: 'Bo Jackson',
    errorType: 'Wrong Photo',
    tier: 'notable',
    sport: 'Football',
    error: 'On some 1990 Score "Bo Jackson" football cards, the photo shows Jackson in a Kansas City Royals baseball uniform rather than his Raiders uniform.',
    correction: 'The baseball-uniform version was corrected to a proper Raiders football photo in a later print run.',
    story: 'Bo Jackson was the ultimate two-sport star — NFL Pro Bowl RB and MLB All-Star OF simultaneously. The Score photo editor apparently grabbed the wrong image from the file. Given Bo\'s cult status, collectors pursue both versions aggressively.',
    premium: 'Baseball-photo variation PSA 9: $50-$120. Football-photo corrected PSA 9: $8-$15. Premium: 6-12x.',
    spotTip: 'Look at the jersey and helmet. White Royals jersey with "KC" = error. Raiders silver-and-black = corrected.',
  },
  {
    id: 'jordan-mvp-1986',
    year: 1986,
    set: 'Fleer #57',
    player: 'Michael Jordan',
    errorType: 'Variation',
    tier: 'legendary',
    sport: 'Basketball',
    error: 'Not strictly an error — but the 1986 Fleer Michael Jordan rookie has a known variation where the sticker version (Fleer Sticker #8) shows a different photo crop from the base #57 rookie.',
    correction: 'The base card and sticker were intentionally different; however, the stickers exist in a smaller print run.',
    story: 'The most valuable modern basketball card by an order of magnitude. The sticker version is often lumped into "1986 Fleer Jordan" marketing, creating confusion. Serious collectors distinguish the two — the sticker commands a separate market at a lower price point.',
    premium: 'Base #57 PSA 10: $400,000-$750,000+. Sticker #8 PSA 10: $90,000-$150,000. Completely separate markets.',
    spotTip: 'Back of the card: #57 = base rookie. #8 = sticker (back has sticker-set numbering and different design).',
  },
  {
    id: 'ohtani-miscut-2018',
    year: 2018,
    set: 'Topps Update US1',
    player: 'Shohei Ohtani',
    errorType: 'Missing Element',
    tier: 'notable',
    sport: 'Baseball',
    error: 'A small number of 2018 Topps Update Ohtani rookie cards were printed with severe miscuts — the borders wrapped, leaving text bleeding off the edges.',
    correction: 'Topps quality control rejected most miscuts, but some slipped into retail blasters.',
    story: 'Ohtani was the biggest rookie phenomenon since Ichiro — a two-way player winning AL Rookie of the Year. The US1 rookie is one of the most chased modern cards. Severe miscuts become novelty collectibles rather than traditional value drivers, but they move for 3-5x over pristine copies in the right auction.',
    premium: 'Severe miscut raw: $150-$400. Pristine PSA 10 base: $300-$450. Depends heavily on how dramatic the miscut is.',
    spotTip: 'Hold the card against a ruler. Border should be even all around. Bleeding text or upside-down portion = miscut.',
  },
  {
    id: 'mays-5cent-1952',
    year: 1952,
    set: 'Topps #261',
    player: 'Willie Mays',
    errorType: 'Short Print',
    tier: 'iconic',
    sport: 'Baseball',
    error: 'Willie Mays appears in the high-number series (#311-#407) of 1952 Topps, which was printed in much smaller quantities and partially destroyed. Technically not an error — a scarcity variation driven by Topps dumping unsold cases in the Atlantic Ocean in 1960.',
    correction: 'N/A — the high-numbers scarcity is permanent. Topps did not reprint.',
    story: 'The legendary Atlantic Ocean dump. Topps had unsold 1952 Topps high-number cases sitting in warehouses. In 1960, Sy Berger personally oversaw dumping them into the Atlantic off the New Jersey coast. The cards that survived became the rarest modern-era baseball cards. Mays is the star of the high-number series alongside Mantle #311.',
    premium: '1952 Topps Mays PSA 8: $85,000-$140,000. Mays base series equivalents would be 1/10th the price. The scarcity is irrevocable.',
    spotTip: 'Card number on the back: if it\'s between #311 and #407, it\'s a high-number — and permanently scarce.',
  },
  {
    id: 'brian-david-1988',
    year: 1988,
    set: 'Donruss #613',
    player: 'Brian Holton / David Cone',
    errorType: 'Wrong Photo',
    tier: 'notable',
    sport: 'Baseball',
    error: 'Donruss #613 was labeled "Brian Holton" but featured David Cone\'s photo in some print runs.',
    correction: 'Donruss corrected the photo in a later print. Both versions pull from 1988 Donruss packs.',
    story: 'David Cone was a budding star pitcher; Brian Holton was a journeyman reliever. The swapped photo was caught after initial distribution. Cone\'s fame makes the error variant more collectible than the corrected Holton card.',
    premium: 'Wrong photo (Cone\'s face on Holton card) PSA 9: $40-$80. Corrected PSA 9: $4-$8. Premium: 8-15x.',
    spotTip: 'Compare the face to a known David Cone or Brian Holton photo. Cone had a distinctive narrow jaw and goatee.',
  },
  {
    id: 'randy-johnson-marlboro-1989',
    year: 1989,
    set: 'Fleer #381',
    player: 'Randy Johnson',
    errorType: 'Missing Element',
    tier: 'iconic',
    sport: 'Baseball',
    error: 'Randy Johnson\'s rookie card shows him pitching with a prominent "Marlboro" cigarette advertisement visible in the background ballpark wall.',
    correction: 'Fleer airbrushed the Marlboro ad to a generic solid color in later print runs. At least two distinct variations exist.',
    story: 'One of the most famous "hidden background" errors. Professional sports and tobacco advertising had long been entangled, and Fleer\'s photo editor missed the wall ad on the original print. Once noticed, Fleer covered the logo. The original Marlboro version is the rarer and more desirable variant for his rookie card.',
    premium: 'Marlboro background PSA 9: $100-$200. Airbrushed corrected PSA 9: $15-$25. Premium: 5-10x.',
    spotTip: 'Look at the outfield wall behind Johnson. "Marlboro" lettering visible = the error. Solid color wall = corrected.',
  },
  {
    id: 'koufax-wrong-1959',
    year: 1959,
    set: 'Topps #163',
    player: 'Sandy Koufax',
    errorType: 'Wrong Photo',
    tier: 'notable',
    sport: 'Baseball',
    error: 'A small production error in 1959 Topps resulted in some Koufax cards where his name is correctly printed but his cap logo shows the wrong team inset colors.',
    correction: 'A running-change correction during the print run.',
    story: 'Pre-1970s Topps sets had dozens of minor variations that went unnoticed for decades. Koufax\'s cards during his Dodgers run have been heavily studied by collectors, revealing these small variations. They add flavor to vintage collecting without dramatically moving prices.',
    premium: 'Cap-color variation PSA 8: $1,800-$2,400. Base PSA 8: $1,400-$1,800. Premium: 20-30%.',
    spotTip: 'Requires side-by-side comparison. Most collectors don\'t chase this variation unless they\'re doing deep Koufax studies.',
  },
  {
    id: 'griffey-ud-1989-preprod',
    year: 1989,
    set: 'Upper Deck #1',
    player: 'Ken Griffey Jr.',
    errorType: 'Variation',
    tier: 'iconic',
    sport: 'Baseball',
    error: 'Extremely rare "preproduction" proofs exist of the 1989 Upper Deck Griffey Jr. RC #1 — differing card stock, differing hologram placement, or blank backs.',
    correction: 'Not an error but a preproduction proof. Never meant to reach the public.',
    story: 'Upper Deck\'s 1989 debut set was printed at their Carlsbad CA facility. Early test runs created a handful of proof cards with atypical attributes. A few leaked through employees or distributors. Genuine preproduction Griffey #1s are among the most authenticated-only cards in the hobby because fakes are rampant.',
    premium: 'Authenticated blank-back Griffey PSA Authentic: $40,000-$80,000. Base #1 PSA 10: $3,500-$5,500.',
    spotTip: 'Preproductions require top-tier authentication (PSA, Beckett) given the forgery risk. Weight, thickness, and hologram micro-print are the markers.',
  },
  {
    id: 'mcrae-back-1989',
    year: 1989,
    set: 'Fleer Brian McRae',
    player: 'Brian McRae',
    errorType: 'Wrong Back',
    tier: 'notable',
    sport: 'Baseball',
    error: 'Some 1989 Fleer cards have front/back mismatches — Brian McRae\'s photo on the front but a teammate\'s stats on the back.',
    correction: 'Fleer caught the mismatch and corrected the bindery run.',
    story: 'Front/back mismatches happen when the printing and binding are not perfectly synced during production. The 1989 Fleer set, under tight deadline pressure, shipped with multiple known front/back mix-ups. McRae is the most collected of this subset because he was a top prospect at the time.',
    premium: 'Wrong-back McRae PSA 9: $80-$150. Base PSA 9: $3-$6. Premium: 15-30x.',
    spotTip: 'Flip the card — if the back stats and player bio don\'t match the name on the front, you have a wrong-back.',
  },
  {
    id: 'jeter-sp-1993',
    year: 1993,
    set: 'SP Foil #279',
    player: 'Derek Jeter',
    errorType: 'Short Print',
    tier: 'legendary',
    sport: 'Baseball',
    error: 'The 1993 SP Derek Jeter RC is notoriously prone to edge chipping — the foil-card design flaked off along the edges during packaging, making high-grade copies nearly impossible to find.',
    correction: 'SP never corrected the foil issue. It\'s a design flaw, not an error — but it became the defining condition challenge of 1990s cards.',
    story: 'The 1993 SP set was premium-priced and foil-stamped, marketed as an elite product. But the foil stock chipped at the slightest handling. Jeter\'s rookie card — his only true Upper Deck RC — appeared in this set. PSA 10 examples are vanishingly rare given the centering and edge-chipping problems. The card became a hobby legend not for a printing error but for its near-impossibility to preserve.',
    premium: 'SP Jeter PSA 10: $500,000-$1,000,000. PSA 9: $10,000-$18,000. PSA 8: $1,500-$2,500. Grade matters more than almost any other modern card.',
    spotTip: 'Inspect all four edges under a loupe. Even microscopic foil chipping caps this card at PSA 8 or below.',
  },
  {
    id: 'rockstar-1990',
    year: 1990,
    set: 'Pro Set Football',
    player: 'Sterling Sharpe',
    errorType: 'Missing Element',
    tier: 'notable',
    sport: 'Football',
    error: 'Sterling Sharpe\'s 1990 Pro Set card showed no team logo on the helmet for a print run, then corrected.',
    correction: 'Pro Set added the Packers "G" logo in a later print.',
    story: 'Pro Set was a dominant football-card brand in 1990 but rushed production to beat competitors. Multiple cards had missing helmet logos, missing names, or wrong positions. Sharpe was the Packers\' young star receiver, making his error the most tracked of the 1990 Pro Set quirks.',
    premium: 'No-logo PSA 9: $40-$80. With-logo PSA 9: $4-$8. Premium: 8-15x.',
    spotTip: 'Look at his helmet. Packers "G" logo visible = corrected. Blank gold helmet = error.',
  },
  {
    id: 'jordan-rookie-fleer-sticker-1986',
    year: 1986,
    set: 'Fleer Sticker #8',
    player: 'Michael Jordan',
    errorType: 'Variation',
    tier: 'iconic',
    sport: 'Basketball',
    error: 'The 1986 Fleer Jordan sticker uses a different photo than the base rookie card, yet both are frequently conflated as "his rookie."',
    correction: 'N/A — intentional design difference, but creates endless market confusion.',
    story: 'Fleer\'s 1986 set included both a base 132-card series and a separate 11-card sticker insert. Jordan appeared as base #57 (the iconic dunk pose) and sticker #8 (a different action shot). Grading companies slab them as distinct products. Casual sellers often list the sticker as "the rookie" — misleading buyers into overpaying or dealers underpricing it.',
    premium: 'Base #57 PSA 10: $400K-$750K+. Sticker #8 PSA 10: $90K-$150K. Distinct but both authentic 1986 Fleer Jordan products.',
    spotTip: 'Base has #57 on the back and full standard card dimensions. Sticker has #8 and a peel-away backing.',
  },
  {
    id: 'elway-rookie-1984',
    year: 1984,
    set: 'Topps Football',
    player: 'John Elway',
    errorType: 'Short Print',
    tier: 'notable',
    sport: 'Football',
    error: 'John Elway\'s 1984 Topps rookie is known for severe centering issues — a majority of pack-pulled copies are off-center, making PSA 10 grades extremely rare.',
    correction: 'Centering was never corrected; it\'s a perpetual production flaw.',
    story: 'Elway was the #1 pick in the 1983 NFL Draft, and his 1984 Topps is his iconic rookie card. Topps\' 1984 print run suffered from consistent off-center cuts — side-to-side margins routinely came in at 70/30 or worse. PSA 10 copies require near-perfect 55/45 centering, which fewer than 2% of the print run achieved.',
    premium: 'Elway RC PSA 10: $30,000-$45,000. PSA 9: $800-$1,500. PSA 8: $200-$350. Centering drives the grade.',
    spotTip: 'Use a ruler on the left and right borders. Anything outside 60/40 caps the grade at PSA 9.',
  },
  {
    id: 'gretzky-opc-1979',
    year: 1979,
    set: 'O-Pee-Chee #18',
    player: 'Wayne Gretzky',
    errorType: 'Short Print',
    tier: 'legendary',
    sport: 'Hockey',
    error: 'The 1979-80 O-Pee-Chee Gretzky RC has a prominent left-border color inconsistency. Cards from different print sheets show slight variations in the blue border thickness.',
    correction: 'O-Pee-Chee did not correct the variation. The rarer sheet position creates minor price differences among graded copies.',
    story: 'The most valuable modern hockey card. Gretzky\'s 1979-80 OPC RC has sold for over $3.75 million at PSA 10. Subtle print variations between sheet positions have been cataloged by collectors. The card is notorious for centering and corner issues — only a tiny fraction grade PSA 10.',
    premium: 'Gretzky OPC RC PSA 10: $3,500,000+. PSA 9: $95,000-$140,000. PSA 8: $18,000-$25,000.',
    spotTip: 'Centering and print alignment matter most. Print variations are secondary to grade.',
  },
  {
    id: 'lebron-rookie-chrome-2003',
    year: 2003,
    set: 'Topps Chrome Refractor #111',
    player: 'LeBron James',
    errorType: 'Short Print',
    tier: 'iconic',
    sport: 'Basketball',
    error: 'The 2003-04 Topps Chrome LeBron Refractor is one of the modern basketball hobby\'s most-forged cards. Authentic copies show specific refractor etching patterns that counterfeiters struggle to replicate.',
    correction: 'Topps did not issue a correction — the card is legitimate. But the forgery rate means any raw Refractor should be authenticated.',
    story: 'LeBron\'s Topps Chrome Refractor rookie is one of the defining modern rookies alongside his Exquisite Collection and SP Authentic rookies. Because it\'s the most attainable of his high-end rookies, the forgery economy has targeted it heavily. Raw copies carry significant risk; graded copies command premium due to the authentication seal alone.',
    premium: 'Chrome Refractor PSA 10: $55,000-$85,000. PSA 9: $3,500-$6,000. Base Chrome PSA 10: $3,500-$6,000.',
    spotTip: 'Authentic refractor shows diagonal rainbow lines across the foil. Counterfeits often have visible dot-pattern print. Always buy graded.',
  },
  {
    id: 'panini-prizm-emoji-2022',
    year: 2022,
    set: 'Panini Prizm Basketball',
    player: 'Ja Morant',
    errorType: 'Variation',
    tier: 'notable',
    sport: 'Basketball',
    error: 'Some 2022-23 Panini Prizm Ja Morant base cards have visible print registration dots in the border, a common Panini QC miss in recent years.',
    correction: 'Running correction during print run; both versions exist in the population.',
    story: 'Panini\'s quality control has been a recurring hobby complaint since they inherited the exclusive NBA license in 2009. Print dots, silver-stamp offsets, and color shifts are common in modern Prizm products. Morant is one of the most collected young stars, making his print quirks a focus of collector attention.',
    premium: 'Error with visible dots PSA 9: $35-$60. Clean PSA 9: $15-$25. Premium: 2-3x.',
    spotTip: 'Use a loupe on the bottom borders. Tiny registration dots or color offsets = error. Clean = standard.',
  },
  {
    id: 'roberts-photo-1990',
    year: 1990,
    set: 'Topps Traded #30T',
    player: 'Cornelius Bennett',
    errorType: 'Wrong Photo',
    tier: 'notable',
    sport: 'Football',
    error: 'A run of 1990 Topps Traded cards swapped photos between Bennett and a teammate. Cards with the swapped photo were corrected mid-run.',
    correction: 'Topps caught and corrected the photo swap within weeks.',
    story: 'Topps Traded football sets were produced on tight turnarounds to reflect late-season player movement. The photo database was often misindexed, leading to occasional swaps. Bennett was a Bills Pro Bowl linebacker; his error card commands a modest premium among Bills collectors.',
    premium: 'Wrong photo PSA 9: $25-$40. Corrected PSA 9: $3-$5. Premium: 6-10x.',
    spotTip: 'Compare the face to a verified Bennett photo. The error typically shows a different player\'s face.',
  },
  {
    id: 'pujols-missing-1999',
    year: 2001,
    set: 'Bowman Chrome #340',
    player: 'Albert Pujols',
    errorType: 'Variation',
    tier: 'notable',
    sport: 'Baseball',
    error: 'The 2001 Bowman Chrome Pujols RC has Refractor, X-Fractor, and Gold Refractor parallels. Miscuts and severe centering issues are common due to Bowman\'s cutting equipment of the era.',
    correction: 'Bowman never fully resolved the centering issue. It\'s a persistent condition challenge.',
    story: 'Pujols\'s Bowman Chrome RC is one of the most important modern rookies. The card is notorious for centering problems — many pulls come in at 65/35 or worse side-to-side. PSA 10 copies are scarce; the card regularly prices above Pujols\'s other 2001 rookies due to the grading bottleneck.',
    premium: 'Bowman Chrome Refractor PSA 10: $30,000-$50,000. PSA 9: $3,000-$5,000.',
    spotTip: 'Centering is the universal issue. Buy graded for this card — raw copies require expert inspection.',
  },
  {
    id: 'tatis-rookie-blue-2019',
    year: 2019,
    set: 'Topps Chrome Update',
    player: 'Fernando Tatis Jr.',
    errorType: 'Color Error',
    tier: 'notable',
    sport: 'Baseball',
    error: 'A subset of 2019 Topps Chrome Update Tatis Jr. rookie cards were miscut to show an entirely blue-tinted card back instead of the standard black-and-white.',
    correction: 'Topps removed defective miscuts during QC; some slipped into retail blasters.',
    story: 'Topps\'s chrome printing process uses layered inks and cut sheets. When the cutting alignment is off, back-ink color can shift. The Tatis blue-back variation is rare and novel — collectors treat it as a miscut error rather than an intentional parallel.',
    premium: 'Blue-back miscut PSA 9: $100-$250. Base PSA 9: $12-$20. Premium: 10-20x.',
    spotTip: 'Flip the card. If the back is entirely blue-tinted instead of black-and-white, you have the miscut.',
  },
  {
    id: 'ohtani-rookiecup-2018',
    year: 2018,
    set: 'Topps Update US1',
    player: 'Shohei Ohtani',
    errorType: 'Variation',
    tier: 'iconic',
    sport: 'Baseball',
    error: 'The 2018 Topps Update Ohtani US1 card has multiple photo variations: base (batting), SSP (pitching), and a "rookie cup" variant with a gold cup icon.',
    correction: 'Intentional short-print variation, not an error — but heavily confused in listings.',
    story: 'Ohtani is baseball\'s most important modern rookie. His US1 card has three distinct photo variations, each at dramatically different print runs. The pitching SSP is the most valuable. Sellers often mislabel variants, creating buying opportunities for knowledgeable collectors.',
    premium: 'SSP pitching PSA 10: $3,500-$5,000. Base PSA 10: $300-$450. Rookie cup PSA 10: $800-$1,200.',
    spotTip: 'Check the photo action: batting = base. Pitching = SSP. Gold cup icon in the corner = rookie cup variant.',
  },
  {
    id: 'sanders-dual-position-1989',
    year: 1989,
    set: 'Topps Traded Football',
    player: 'Deion Sanders',
    errorType: 'Variation',
    tier: 'notable',
    sport: 'Multi',
    error: 'Deion Sanders appeared in both baseball (1989 Topps) and football (1989 Topps Traded Football) rookie cards in the same year. Some football cards were misfiled in baseball pack-outs, creating cross-sport confusion.',
    correction: 'Not an error per se — but a unique two-sport issuance that creates ongoing market confusion.',
    story: 'Neon Deion is one of two athletes (with Bo Jackson) to play in both the MLB and NFL at star level. His 1989 rookie cards appear in both sports\' releases that year. The dual-sport rookie market is small but enthusiastic — collectors debate which counts as "the" Deion rookie.',
    premium: 'Football RC PSA 10: $1,500-$2,500. Baseball RC PSA 10: $450-$750. Both are legitimate rookies.',
    spotTip: 'Position on the card: CB or KR = football RC. OF = baseball RC. Both printed 1989.',
  },
];

const FAQ = [
  {
    question: 'What qualifies as a "famous" error card?',
    answer: 'This catalog covers cards where (a) the error is visible, documented, and repeatable across multiple copies, (b) the error created a distinct market separate from the corrected version, and (c) collectors have named, photographed, and traded the error for decades. Printing hiccups on random modern cards don\'t qualify unless they\'ve reached cultural status. Examples like the 1989 Fleer Billy Ripken "FF" or the 1990 Topps Frank Thomas NNOF are textbook "famous" errors — everyone in the hobby knows them by shorthand.',
  },
  {
    question: 'Which error cards are worth the most?',
    answer: 'The 1990 Topps Frank Thomas NNOF (No Name On Front) is the most valuable modern error card — PSA 10 copies sell for $300,000-$500,000+ versus a few dollars for the corrected card. The 1909 T206 Sherry MAGIE misspelling is the most valuable vintage error at $90K-$150K+ for PSA 5. Most error premiums are 5-15x over the corrected version; the NNOF premium of 10,000x+ is an outlier driven by extreme scarcity plus Thomas\'s Hall of Fame career.',
  },
  {
    question: 'How do I spot a fake error card?',
    answer: 'The most-forged errors are the Billy Ripken FF (uncorrected), Frank Thomas NNOF, and Dale Murphy Reverse Negative because the "error" is visually obvious and easily doctored. Signs of forgery: suspicious ink color or texture on the nameplate, edges that don\'t match the rest of the card\'s wear pattern, back that shows ghosting or printing misalignment. For valuable errors, only buy PSA/BGS/CGC-slabbed copies. Raw purchases above $100 are high-risk.',
  },
  {
    question: 'Are reverse-negative errors always valuable?',
    answer: 'Not always. The 1957 Topps Hank Aaron reverse negative has no premium because every copy in the print run is flipped — there is no corrected version to compare against. The 1989 Upper Deck Dale Murphy reverse negative has a 15-25x premium because a corrected version exists and collectors actively chase the rarer error. Value comes from the error being a minority variant, not just from the error existing.',
  },
  {
    question: 'Should I buy error cards as investments?',
    answer: 'Error cards are a niche within the niche. They typically hold value well but underperform the blue-chip rookie market in bull cycles. Strong candidates: errors tied to star players (Frank Thomas NNOF, Ripken FF, Jordan variations). Weak candidates: errors on obscure players with no career follow-through. Graded and authenticated copies preserve value best. Treat errors as conversation pieces and diversifiers rather than core portfolio positions.',
  },
];

function TierBadge({ tier }: { tier: ErrorCard['tier'] }) {
  const styles = {
    legendary: 'bg-rose-950/80 border-rose-800 text-rose-300',
    iconic: 'bg-amber-950/80 border-amber-800 text-amber-300',
    notable: 'bg-slate-800/80 border-slate-700 text-slate-300',
  } as const;
  const label = { legendary: 'LEGENDARY', iconic: 'ICONIC', notable: 'NOTABLE' }[tier];
  return (
    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded border ${styles[tier]}`}>{label}</span>
  );
}

function SportBadge({ sport }: { sport: ErrorCard['sport'] }) {
  const colors = {
    Baseball: 'bg-emerald-950/60 border-emerald-800/50 text-emerald-300',
    Basketball: 'bg-orange-950/60 border-orange-800/50 text-orange-300',
    Football: 'bg-blue-950/60 border-blue-800/50 text-blue-300',
    Hockey: 'bg-cyan-950/60 border-cyan-800/50 text-cyan-300',
    Multi: 'bg-purple-950/60 border-purple-800/50 text-purple-300',
  } as const;
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${colors[sport]}`}>{sport}</span>;
}

export default function FamousErrorCardsPage() {
  const legendary = ERROR_CARDS.filter(e => e.tier === 'legendary');
  const iconic = ERROR_CARDS.filter(e => e.tier === 'iconic');
  const notable = ERROR_CARDS.filter(e => e.tier === 'notable');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Famous Error Cards — The Hall of Infamy: 30 Legendary Printing Mistakes',
        description: 'Comprehensive catalog of the 30 most famous error cards in trading-card history, organized by tier with stories, corrections, and value premiums.',
        url: 'https://cardvault-two.vercel.app/famous-error-cards',
        author: { '@type': 'Organization', name: 'CardVault' },
        publisher: { '@type': 'Organization', name: 'CardVault' },
        datePublished: '2026-04-16',
        dateModified: '2026-04-16',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }} />

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-rose-950/60 border border-rose-800/50 text-rose-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
          The Hall of Infamy &middot; 30 Cards &middot; Every Story
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Famous Error Cards</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Thirty printing mistakes that became legends. The Billy Ripken FF. The Frank Thomas NNOF. The 1909 MAGIE typo.
          The Dale Murphy batting the wrong way. Every error, every correction, every premium — the complete hobby infamy record.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-rose-400">{legendary.length}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Legendary</div>
        </div>
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-amber-400">{iconic.length}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Iconic</div>
        </div>
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-slate-300">{notable.length}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Notable</div>
        </div>
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{ERROR_CARDS.length}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Total Entries</div>
        </div>
      </div>

      {/* Legendary Section */}
      <section className="mb-12">
        <div className="border-b border-rose-800/40 pb-3 mb-6">
          <h2 className="text-2xl font-bold text-white">The Legendary Tier</h2>
          <p className="text-sm text-gray-500 mt-1">Every collector knows these by shorthand. They transcend the hobby.</p>
        </div>
        <div className="space-y-6">
          {legendary.map((e) => <ErrorEntry key={e.id} entry={e} />)}
        </div>
      </section>

      {/* Iconic Section */}
      <section className="mb-12">
        <div className="border-b border-amber-800/40 pb-3 mb-6">
          <h2 className="text-2xl font-bold text-white">The Iconic Tier</h2>
          <p className="text-sm text-gray-500 mt-1">Defining errors of their era. Well-documented. Market-tested.</p>
        </div>
        <div className="space-y-6">
          {iconic.map((e) => <ErrorEntry key={e.id} entry={e} />)}
        </div>
      </section>

      {/* Notable Section */}
      <section className="mb-12">
        <div className="border-b border-slate-700 pb-3 mb-6">
          <h2 className="text-2xl font-bold text-white">The Notable Tier</h2>
          <p className="text-sm text-gray-500 mt-1">Specialist favorites. Minor premiums. Completist targets.</p>
        </div>
        <div className="space-y-6">
          {notable.map((e) => <ErrorEntry key={e.id} entry={e} />)}
        </div>
      </section>

      {/* How to Spot Errors Sidebar */}
      <div className="bg-gradient-to-br from-rose-950/40 to-amber-950/30 border border-rose-800/30 rounded-xl p-6 mb-12">
        <h2 className="text-xl font-bold text-white mb-4">The Error-Hunter&apos;s Checklist</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex gap-2"><span className="text-rose-400">1.</span><span><strong className="text-white">Read every nameplate.</strong> Misspellings are the cheapest mistake to make and the easiest to catch. Compare the printed name to the player&apos;s known spelling letter by letter.</span></li>
          <li className="flex gap-2"><span className="text-rose-400">2.</span><span><strong className="text-white">Verify batting/pitching hand.</strong> If a right-handed hitter appears to bat left, suspect a reverse negative. Check hat logos and jersey lettering — mirror images reveal flipped negatives.</span></li>
          <li className="flex gap-2"><span className="text-rose-400">3.</span><span><strong className="text-white">Compare the photo to the player.</strong> Wrong-photo errors are common in 1980s-1990s traded/update sets produced under deadline pressure. When in doubt, image-search the player.</span></li>
          <li className="flex gap-2"><span className="text-rose-400">4.</span><span><strong className="text-white">Inspect backgrounds for brand-logo leaks.</strong> The Randy Johnson Marlboro card is the classic example. Advertising peeks through airbrush corrections.</span></li>
          <li className="flex gap-2"><span className="text-rose-400">5.</span><span><strong className="text-white">Flip the card.</strong> Wrong-back errors sync the wrong player&apos;s stats with the wrong front photo. A mismatch between name and career numbers is a red flag.</span></li>
          <li className="flex gap-2"><span className="text-rose-400">6.</span><span><strong className="text-white">Authenticate anything worth $100+.</strong> Error cards are heavily forged — especially Ripken FF, Thomas NNOF, and Murphy reverse negative. PSA, BGS, or CGC slabs protect your capital.</span></li>
        </ul>
      </div>

      {/* FAQ */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQ.map((faq, idx) => (
            <details key={idx} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-rose-400 transition-colors list-none flex items-center gap-2">
                <span className="text-rose-400/60 group-open:rotate-90 transition-transform">&#9654;</span>
                {faq.question}
              </summary>
              <p className="text-gray-400 text-sm mt-2 ml-5 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-8 text-sm text-gray-500 leading-relaxed">
        <p>
          Part of the <Link href="/guides" className="text-rose-400 hover:underline">CardVault Guides</Link> collection.
          Related reading:{' '}
          <Link href="/card-hall-of-fame" className="text-rose-400 hover:underline">Card Hall of Fame</Link>,{' '}
          <Link href="/hobby-timeline" className="text-rose-400 hover:underline">Hobby Timeline</Link>,{' '}
          <Link href="/card-encyclopedia" className="text-rose-400 hover:underline">Card Encyclopedia</Link>,{' '}
          <Link href="/tools/error-cards" className="text-rose-400 hover:underline">Error Card Value Guide</Link>,{' '}
          <Link href="/tools/error-spotter" className="text-rose-400 hover:underline">Error Spotter</Link>,{' '}
          <Link href="/market-psychology" className="text-rose-400 hover:underline">Market Psychology</Link>.
        </p>
      </div>
    </div>
  );
}

function ErrorEntry({ entry }: { entry: ErrorCard }) {
  return (
    <article className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <TierBadge tier={entry.tier} />
            <SportBadge sport={entry.sport} />
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-gray-900/60 border-gray-700 text-gray-400">{entry.errorType.toUpperCase()}</span>
          </div>
          <h3 className="text-xl font-bold text-white leading-tight">
            {entry.year} {entry.set} — {entry.player}
          </h3>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-1">The Error</div>
          <p className="text-gray-300 leading-relaxed">{entry.error}</p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">The Correction</div>
          <p className="text-gray-300 leading-relaxed">{entry.correction}</p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">The Story</div>
          <p className="text-gray-300 leading-relaxed">{entry.story}</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 pt-2">
          <div className="bg-gray-900/50 border border-gray-700/40 rounded-lg p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">Premium</div>
            <p className="text-gray-300 text-xs leading-relaxed">{entry.premium}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-700/40 rounded-lg p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-violet-400 mb-1">How to Spot It</div>
            <p className="text-gray-300 text-xs leading-relaxed">{entry.spotTip}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
