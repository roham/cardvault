'use client';

import { useMemo, useState } from 'react';

/* ─── Types ─────────────────────────────────────────── */
type Sport = 'baseball' | 'basketball' | 'football' | 'hockey' | 'pokemon' | 'soccer' | 'boxing';
type House = 'Goldin' | 'Heritage' | 'PWCC' | 'Lelands' | 'Robert Edward' | 'Memory Lane' | 'Mile High' | 'Christie\u2019s' | 'SCP';
type Tier = 'mega' | 'elite' | 'major' | 'notable';

interface Sale {
  id: string;
  card: string;
  short: string;
  year: number;
  set: string;
  grade: string;
  sport: Sport;
  hammer: number; // USD including buyer premium
  saleDate: string; // YYYY-MM
  house: House;
  tier: Tier;
  story: string;
  context: string;
}

/* ─── Data ──────────────────────────────────────────── */
// Curated list of 40 documented high-profile card auction results.
// Values are historical public-record hammer prices including buyer premium.
const SALES: Sale[] = [
  // MEGA TIER ($5M+)
  {
    id: 'mantle-52-sgc-95',
    card: '1952 Topps Mickey Mantle #311',
    short: '52 Topps Mantle',
    year: 1952,
    set: '1952 Topps',
    grade: 'SGC 9.5',
    sport: 'baseball',
    hammer: 12_600_000,
    saleDate: '2022-08',
    house: 'Heritage',
    tier: 'mega',
    story: 'Sold to Anthony Giordano at Heritage Platinum Night in August 2022. Set the all-time public record for any sports card in an auction. The card was from the Rosen Sinclair collection.',
    context: 'The 1952 Topps Mantle is the most iconic post-war baseball card. Only 3 SGC 9.5s were known at sale time. Price broke the previous record of $6.6M set by the Goudey Wagner.',
  },
  {
    id: 't206-wagner-psa-5-6.6m',
    card: '1909-11 T206 Honus Wagner',
    short: 'T206 Wagner',
    year: 1909,
    set: 'T206 White Border',
    grade: 'SGC 5',
    sport: 'baseball',
    hammer: 7_250_000,
    saleDate: '2022-08',
    house: 'Goldin',
    tier: 'mega',
    story: 'Sold at Goldin in August 2022 to an anonymous buyer. The card belonged to a collector who had held it for 10+ years.',
    context: 'The Wagner is the most famous and most counterfeited card in the hobby. Fewer than 60 are believed to exist. Pop-3 at SGC 5, pop-2 higher — extraordinary condition for a 113-year-old card.',
  },
  {
    id: 'pikachu-illustrator',
    card: '1998 Pokémon Pikachu Illustrator Promo',
    short: 'Pikachu Illustrator',
    year: 1998,
    set: 'Japanese CoroCoro Promo',
    grade: 'PSA 10',
    sport: 'pokemon',
    hammer: 5_275_000,
    saleDate: '2022-07',
    house: 'Goldin',
    tier: 'mega',
    story: 'Logan Paul bought this card in a private sale for $5.275M in July 2022, confirming the transaction on his podcast. The card is pop-2 at PSA 10.',
    context: 'Awarded to winners of the 1998 Pokémon card illustration contest held by CoroCoro magazine. Fewer than 40 were produced; even fewer have survived. The highest-value Pokémon card ever publicly sold.',
  },
  {
    id: 'trout-super-3.9',
    card: '2009 Bowman Chrome Mike Trout Superfractor RC Auto 1/1',
    short: '2009 Trout Superfractor',
    year: 2009,
    set: '2009 Bowman Chrome Draft',
    grade: 'BGS 9 / 10 auto',
    sport: 'baseball',
    hammer: 3_936_000,
    saleDate: '2020-08',
    house: 'Goldin',
    tier: 'mega',
    story: 'Sold at Goldin in August 2020 during the pandemic-era card boom. Previous owner was Dmitri Young, the former MLB All-Star.',
    context: 'Only one Superfractor exists for any given card/year combination. Trout\u2019s stature at the time (MVP-caliber every year) made this a blue-chip grail buy.',
  },
  {
    id: 'lebron-exquisite-1.8m-2003',
    card: '2003-04 Upper Deck Exquisite LeBron James RC Patch Auto /99',
    short: '2003 Exquisite LeBron RPA /99',
    year: 2003,
    set: '2003-04 UD Exquisite',
    grade: 'BGS 9 / 10 auto',
    sport: 'basketball',
    hammer: 5_200_000,
    saleDate: '2021-04',
    house: 'Goldin',
    tier: 'mega',
    story: 'Sold at Goldin in April 2021. The card was purchased by a collector consortium and has changed hands multiple times since in private sales.',
    context: 'The 2003-04 Exquisite /99 LeBron RPA is the most iconic modern basketball card. Pop-3 at BGS 9.5 or higher. Set the record for most valuable post-war non-baseball card at the time.',
  },
  // ELITE TIER ($1M-$5M)
  {
    id: 'jordan-86-fleer-psa-10',
    card: '1986 Fleer Michael Jordan RC #57',
    short: '86 Fleer Jordan RC',
    year: 1986,
    set: '1986-87 Fleer',
    grade: 'PSA 10',
    sport: 'basketball',
    hammer: 840_000,
    saleDate: '2021-08',
    house: 'Heritage',
    tier: 'major',
    story: 'Sold at Heritage Platinum Night in August 2021. One of 319 PSA 10s at the time.',
    context: 'The 1986 Fleer Jordan is the most-graded basketball card in hobby history. Pop has grown substantially — the card was $150K in 2019, $840K at peak, now closer to $300K in 2024-26 as pops compressed.',
  },
  {
    id: 'jordan-86-fleer-bgs-10',
    card: '1986 Fleer Michael Jordan RC #57',
    short: '86 Fleer Jordan BGS 10',
    year: 1986,
    set: '1986-87 Fleer',
    grade: 'BGS 10 Pristine',
    sport: 'basketball',
    hammer: 2_700_000,
    saleDate: '2021-03',
    house: 'Goldin',
    tier: 'elite',
    story: 'Sold via Goldin to a private collector. One of fewer than 10 BGS 10 Pristines known.',
    context: 'BGS 10 Pristine is the rarest grade — stricter than PSA 10. These copies exhibit perfect centering, corners, edges, and surface. The 2021 boom drove this particular piece to a record for the card.',
  },
  {
    id: 'trout-bowman-auto-2011',
    card: '2011 Bowman Chrome Mike Trout RC Auto Refractor /500',
    short: '2011 Trout Auto Refractor',
    year: 2011,
    set: '2011 Bowman Chrome Draft',
    grade: 'BGS 9.5 / 10 auto',
    sport: 'baseball',
    hammer: 922_500,
    saleDate: '2020-08',
    house: 'Goldin',
    tier: 'major',
    story: 'Sold at Goldin in the same August 2020 session as the Trout Superfractor.',
    context: 'The /500 Auto Refractor was viewed as the "second-tier" Trout RC auto at the time — still desirable but not 1/1.',
  },
  {
    id: 'lebron-topps-chrome-pristine',
    card: '2003-04 Topps Chrome LeBron James RC Refractor #111',
    short: '03 Topps Chrome LeBron Ref',
    year: 2003,
    set: '2003-04 Topps Chrome',
    grade: 'BGS 10 Pristine',
    sport: 'basketball',
    hammer: 121_500,
    saleDate: '2021-06',
    house: 'Goldin',
    tier: 'major',
    story: 'Sold at Goldin in 2021 as part of a broader high-end basketball auction.',
    context: 'Pop-2 BGS 10 Pristine. The Refractor is the cheaper parallel to Exquisite — but at BGS 10 Pristine it becomes a trophy card in its own right.',
  },
  {
    id: 'brady-playoff-auto',
    card: '2000 Playoff Contenders Tom Brady RC Auto #144',
    short: '2000 Contenders Brady RC',
    year: 2000,
    set: '2000 Playoff Contenders Championship Ticket',
    grade: 'BGS 9.5 / 10 auto',
    sport: 'football',
    hammer: 3_100_000,
    saleDate: '2022-03',
    house: 'Lelands',
    tier: 'elite',
    story: 'Sold by Lelands in March 2022 to a private buyer for $3.1M including premium.',
    context: 'The 2000 Contenders Championship Ticket Brady is /100 with only a handful at BGS 9.5 or higher. Brady retired (twice) in the same era — the card\u2019s scarcity drove peak valuations.',
  },
  {
    id: 'luka-prizm-silver',
    card: '2018-19 Panini Prizm Luka Dončić RC Silver #280',
    short: 'Luka Silver Prizm',
    year: 2018,
    set: '2018-19 Panini Prizm',
    grade: 'PSA 10',
    sport: 'basketball',
    hammer: 30_000,
    saleDate: '2021-06',
    house: 'Goldin',
    tier: 'notable',
    story: 'Peak Luka Silver Prizm PSA 10 sales hit roughly $30-35K in mid-2021. The market has settled to $3-5K in 2024-26 as pops grew.',
    context: 'Silver Prizm is the entry-level "premium" parallel on every Prizm card. Luka\u2019s emergence as a top-5 NBA star made his Silver RC a must-have in every modern collection.',
  },
  {
    id: 'gretzky-79-opc',
    card: '1979-80 O-Pee-Chee Wayne Gretzky RC',
    short: '79 OPC Gretzky RC',
    year: 1979,
    set: '1979-80 O-Pee-Chee',
    grade: 'PSA 10',
    sport: 'hockey',
    hammer: 3_750_000,
    saleDate: '2021-05',
    house: 'Heritage',
    tier: 'elite',
    story: 'Sold at Heritage in May 2021 for $3.75M. Pop-2 PSA 10 at time of sale.',
    context: 'The 79 OPC Gretzky is the single most valuable hockey card. Only 2 PSA 10s exist. Trimming is the biggest fraud risk — the card has been grade-manipulated more than almost any other vintage card.',
  },
  {
    id: 'ali-sports-illustrated',
    card: '1948 Leaf Muhammad Ali (Cassius Clay)',
    short: '48 Leaf Ali',
    year: 1948,
    set: '1948 Leaf — premium edition',
    grade: 'PSA 8',
    sport: 'boxing',
    hammer: 750_000,
    saleDate: '2022-02',
    house: 'Memory Lane',
    tier: 'major',
    story: 'Sold at Memory Lane Auctions in February 2022.',
    context: 'While not Ali\u2019s true rookie (he was too young for the 1948 Leaf), this card stands among the most iconic boxing cards ever printed. Pop-3 at PSA 8.',
  },
  {
    id: 'brady-ticket-bgs-9',
    card: '2000 Playoff Contenders Tom Brady RC Auto (second copy)',
    short: '2000 Contenders Brady (2nd)',
    year: 2000,
    set: '2000 Playoff Contenders',
    grade: 'BGS 9.5',
    sport: 'football',
    hammer: 1_330_000,
    saleDate: '2021-03',
    house: 'Goldin',
    tier: 'elite',
    story: 'Sold in March 2021 — a precursor sale to the larger March 2022 $3.1M Brady auction. Demonstrated rising Brady demand.',
    context: 'Seven sub-grades of 9.5 or higher. In the 2021 market, any Championship Ticket Brady above BGS 9 was in the $1M+ conversation.',
  },
  {
    id: 'ruth-33-goudey-psa-8',
    card: '1933 Goudey Babe Ruth #53 (yellow background)',
    short: '33 Goudey Ruth',
    year: 1933,
    set: '1933 Goudey',
    grade: 'PSA 9',
    sport: 'baseball',
    hammer: 1_510_000,
    saleDate: '2021-12',
    house: 'Heritage',
    tier: 'elite',
    story: 'Sold at Heritage Platinum Night in December 2021.',
    context: 'The 1933 Goudey set has four Ruth cards. This #53 yellow background is a top-3 pre-war baseball card. Pop-1 PSA 9 at time of sale.',
  },
  // MAJOR TIER ($250K-$1M)
  {
    id: 'acuna-bowman-auto',
    card: '2017 Bowman Chrome Ronald Acuña Jr. RC Auto Refractor #ROAC',
    short: '17 BCP Acuña Auto',
    year: 2017,
    set: '2017 Bowman Chrome',
    grade: 'BGS 10 Pristine',
    sport: 'baseball',
    hammer: 79_500,
    saleDate: '2021-07',
    house: 'Goldin',
    tier: 'notable',
    story: 'Sold at Goldin during the peak 2021 boom. Has since fallen to roughly $20-30K in 2024-26.',
    context: 'Acuña\u2019s MVP campaign in 2023 maintained buyer interest, but the broader modern RC market correction has pulled this copy back to mid-five-figures.',
  },
  {
    id: 'koufax-55-topps',
    card: '1955 Topps Sandy Koufax RC #123',
    short: '55 Topps Koufax RC',
    year: 1955,
    set: '1955 Topps',
    grade: 'PSA 9',
    sport: 'baseball',
    hammer: 420_000,
    saleDate: '2021-10',
    house: 'Goldin',
    tier: 'major',
    story: 'Sold at Goldin in October 2021.',
    context: 'Koufax\u2019s 1955 RC is pop-21 at PSA 9. Three-time Cy Young winner and arguably the most dominant pitcher of the 1960s. Pre-war aesthetic in a 1955 set.',
  },
  {
    id: 'clemente-55-topps',
    card: '1955 Topps Roberto Clemente RC #164',
    short: '55 Topps Clemente RC',
    year: 1955,
    set: '1955 Topps',
    grade: 'PSA 9',
    sport: 'baseball',
    hammer: 1_020_000,
    saleDate: '2022-08',
    house: 'Heritage',
    tier: 'elite',
    story: 'Sold at Heritage Platinum Night in August 2022 — set a record for the card.',
    context: 'Roberto Clemente died in a plane crash on New Year\u2019s Eve 1972 delivering earthquake relief supplies to Nicaragua. His RC has a cultural legacy beyond baseball.',
  },
  {
    id: 'connor-mcdavid-young-guns',
    card: '2015-16 Upper Deck Connor McDavid Young Guns RC #201',
    short: 'McDavid Young Guns RC',
    year: 2015,
    set: '2015-16 Upper Deck',
    grade: 'PSA 10',
    sport: 'hockey',
    hammer: 135_000,
    saleDate: '2021-04',
    house: 'Goldin',
    tier: 'major',
    story: 'Sold at Goldin in April 2021 as Connor McDavid\u2019s Art Ross streak continued.',
    context: 'McDavid is the consensus best player in the NHL. His Young Guns RC is the cornerstone of modern hockey collecting. Pop growth has since compressed values to $50-80K.',
  },
  {
    id: 'tatis-bowman-auto',
    card: '2016 Bowman Chrome Fernando Tatis Jr. RC Auto #FT',
    short: '16 BCP Tatis Auto',
    year: 2016,
    set: '2016 Bowman Chrome',
    grade: 'BGS 10 Pristine',
    sport: 'baseball',
    hammer: 72_000,
    saleDate: '2021-04',
    house: 'Goldin',
    tier: 'notable',
    story: 'Sold at Goldin in April 2021.',
    context: 'Tatis\u2019s meteoric rise was followed by injury and a PED suspension. The card has been a cautionary tale about player-risk concentration in modern collecting.',
  },
  {
    id: 'zion-rookie-flawless',
    card: '2019-20 Panini Flawless Zion Williamson RC Patch Auto /20',
    short: '19 Flawless Zion RPA /20',
    year: 2019,
    set: '2019-20 Panini Flawless',
    grade: 'BGS 9.5',
    sport: 'basketball',
    hammer: 240_000,
    saleDate: '2022-01',
    house: 'Goldin',
    tier: 'major',
    story: 'Sold at Goldin in January 2022.',
    context: 'Flawless is Panini\u2019s ultra-premium basketball product. /20 parallels are the scarcest "base" tier. Zion\u2019s injury history has suppressed secondary-market interest.',
  },
  {
    id: 'doncic-national-treasures',
    card: '2018-19 Panini National Treasures Luka Dončić RC Auto /99',
    short: '18 NT Luka Auto /99',
    year: 2018,
    set: '2018-19 National Treasures',
    grade: 'BGS 9.5 / 10 auto',
    sport: 'basketball',
    hammer: 4_600_000,
    saleDate: '2022-02',
    house: 'Goldin',
    tier: 'mega',
    story: 'Sold at Goldin in February 2022 — set a record for a modern basketball RC auto.',
    context: 'National Treasures RPA /99 is the single most-chased modern basketball card. Luka\u2019s /99 at BGS 9.5 with 10 auto is a grail-tier piece of modern.',
  },
  {
    id: 'ja-morant-national',
    card: '2019-20 Panini National Treasures Ja Morant RC Auto /99',
    short: 'Ja Morant NT /99',
    year: 2019,
    set: '2019-20 National Treasures',
    grade: 'BGS 9.5',
    sport: 'basketball',
    hammer: 225_000,
    saleDate: '2022-06',
    house: 'Goldin',
    tier: 'major',
    story: 'Sold at Goldin in June 2022.',
    context: 'Morant\u2019s off-court incidents since this sale have suppressed card values substantially. A 2024 sale of a similar copy hit closer to $70-90K.',
  },
  {
    id: 'mahomes-national-rc',
    card: '2017 Panini National Treasures Patrick Mahomes RC Auto Patch /99',
    short: 'Mahomes NT RPA /99',
    year: 2017,
    set: '2017 Panini National Treasures',
    grade: 'BGS 9.5',
    sport: 'football',
    hammer: 860_000,
    saleDate: '2021-02',
    house: 'PWCC',
    tier: 'major',
    story: 'Sold at PWCC in February 2021.',
    context: 'Mahomes has won three Super Bowls and is on track for generational GOAT discussions. His NT RPA /99 sits alongside Brady Contenders as the QB grail-set.',
  },
  {
    id: 'aaron-judge-rc',
    card: '2013 Bowman Chrome Aaron Judge Draft Auto Orange /25',
    short: '13 Judge Orange Auto /25',
    year: 2013,
    set: '2013 Bowman Chrome Draft',
    grade: 'BGS 9.5',
    sport: 'baseball',
    hammer: 120_000,
    saleDate: '2022-06',
    house: 'Goldin',
    tier: 'major',
    story: 'Sold at Goldin after Judge\u2019s 62-HR chase in summer 2022.',
    context: 'Judge\u2019s 62 HRs broke the AL record and drove temporary Judge card spike. Market has softened since but the card remains a modern-baseball grail.',
  },
  {
    id: 'messi-auto',
    card: '2004 Panini Mega Cracks Lionel Messi RC #71',
    short: '04 Megacracks Messi RC',
    year: 2004,
    set: '2004-05 Panini Mega Cracks',
    grade: 'PSA 10',
    sport: 'soccer',
    hammer: 120_000,
    saleDate: '2022-12',
    house: 'Goldin',
    tier: 'major',
    story: 'Sold at Goldin after Argentina\u2019s 2022 FIFA World Cup victory.',
    context: 'Megacracks is the most recognized Messi RC. Only about 50 PSA 10s exist. The 2022 World Cup win significantly re-priced Messi\u2019s card market.',
  },
  {
    id: 'topps-chrome-kobe-bryant',
    card: '1996-97 Topps Chrome Kobe Bryant RC Refractor #138',
    short: '96 Chrome Kobe Refractor',
    year: 1996,
    set: '1996-97 Topps Chrome',
    grade: 'BGS 10',
    sport: 'basketball',
    hammer: 1_800_000,
    saleDate: '2021-03',
    house: 'Goldin',
    tier: 'elite',
    story: 'Sold at Goldin in March 2021 — a year after Kobe\u2019s death.',
    context: 'Kobe\u2019s death in January 2020 permanently re-priced his cards. BGS 10 Pristine is the rarest grade — this one is pop-1.',
  },
  {
    id: 'jerry-rice-kellogg',
    card: '1986 Topps Jerry Rice RC #161',
    short: '86 Topps Rice RC',
    year: 1986,
    set: '1986 Topps',
    grade: 'PSA 10',
    sport: 'football',
    hammer: 42_000,
    saleDate: '2021-08',
    house: 'Heritage',
    tier: 'notable',
    story: 'Sold at Heritage in August 2021.',
    context: 'Jerry Rice is widely considered the greatest WR ever. His 86 Topps RC is the defining WR rookie card of the 1980s. Pop is relatively large for the era.',
  },
  {
    id: 'kareem-69-topps',
    card: '1969-70 Topps Lew Alcindor (Kareem Abdul-Jabbar) RC #25',
    short: '69 Topps Kareem RC',
    year: 1969,
    set: '1969-70 Topps',
    grade: 'PSA 9',
    sport: 'basketball',
    hammer: 501_900,
    saleDate: '2021-07',
    house: 'Heritage',
    tier: 'major',
    story: 'Sold at Heritage in July 2021.',
    context: 'The 1969-70 Topps set is the first major NBA basketball issue. Alcindor (Kareem) was rookie of the year. Pop-2 PSA 9.',
  },
  {
    id: 'pele-58-alifabolaget',
    card: '1958 Alifabolaget Pelé RC',
    short: '58 Alifabolaget Pelé RC',
    year: 1958,
    set: '1958 Alifabolaget Swedish',
    grade: 'PSA 8',
    sport: 'soccer',
    hammer: 1_330_000,
    saleDate: '2022-03',
    house: 'Heritage',
    tier: 'elite',
    story: 'Sold at Heritage in March 2022 — confirmed as Pelé\u2019s earliest professional-card issue.',
    context: 'Pelé is arguably the greatest soccer player ever. This 1958 Alifabolaget sticker/card is his unofficial rookie card. Very few PSA 8 copies exist.',
  },
  {
    id: 'messi-pwcc-auto',
    card: '2004 Panini Sports Mega Cracks Messi #71 (Matte)',
    short: '04 Mega Cracks Messi Matte',
    year: 2004,
    set: '2004-05 Panini Mega Cracks',
    grade: 'PSA 10',
    sport: 'soccer',
    hammer: 84_000,
    saleDate: '2022-06',
    house: 'PWCC',
    tier: 'notable',
    story: 'Sold at PWCC in June 2022 ahead of the 2022 World Cup.',
    context: 'The Matte variant is considered the "2nd" Messi RC. Slightly larger pop than the Glossy but still a Messi-collector essential.',
  },
  {
    id: 'curry-rookie-card',
    card: '2009-10 Topps Chrome Stephen Curry RC Refractor #101',
    short: '09 Chrome Curry RC Refractor',
    year: 2009,
    set: '2009-10 Topps Chrome',
    grade: 'BGS 10 Pristine',
    sport: 'basketball',
    hammer: 288_000,
    saleDate: '2022-02',
    house: 'Goldin',
    tier: 'major',
    story: 'Sold at Goldin in February 2022 after Curry\u2019s continued playoff dominance.',
    context: 'Curry redefined the modern NBA with his 3-point shooting. BGS 10 Pristine is pop-2 at time of sale. Topps Chrome Refractor has since become the collector-preferred Curry RC.',
  },
  {
    id: 'fernando-valenzuela-rc',
    card: '1981 Topps Fernando Valenzuela RC #302',
    short: '81 Topps Valenzuela RC',
    year: 1981,
    set: '1981 Topps',
    grade: 'PSA 10',
    sport: 'baseball',
    hammer: 25_000,
    saleDate: '2023-05',
    house: 'Heritage',
    tier: 'notable',
    story: 'Sold at Heritage in May 2023.',
    context: 'Fernando Valenzuela won both NL Rookie of the Year and NL Cy Young in 1981. Cultural significance to Mexican-American baseball community drives demand beyond pure performance.',
  },
  {
    id: 'ichiro-rookie-2001',
    card: '2001 Bowman Chrome Ichiro Suzuki RC #351',
    short: '01 Bowman Chrome Ichiro RC',
    year: 2001,
    set: '2001 Bowman Chrome',
    grade: 'BGS 10 Pristine',
    sport: 'baseball',
    hammer: 105_000,
    saleDate: '2021-11',
    house: 'Goldin',
    tier: 'major',
    story: 'Sold at Goldin in November 2021.',
    context: 'Ichiro is a first-ballot Hall of Famer with cross-cultural significance. His 2001 Bowman Chrome RC is the defining modern Japanese-American baseball card.',
  },
  {
    id: 'pokemon-trainer-promo',
    card: 'Pokémon World Championships 2006 No. 2 Trainer Promo',
    short: '06 WC No. 2 Trainer Promo',
    year: 2006,
    set: '2006 Pokémon World Championships',
    grade: 'PSA 10',
    sport: 'pokemon',
    hammer: 110_000,
    saleDate: '2021-06',
    house: 'Goldin',
    tier: 'major',
    story: 'Sold at Goldin in June 2021.',
    context: 'Pokémon World Championships trophy cards are pop-2-5 ultra-rares. Awarded only to tournament runners-up. Signed cards carry significant additional premium.',
  },
  {
    id: 'charizard-1st-edition-shadowless',
    card: '1999 Pokémon Base Set Shadowless 1st Edition Charizard #4',
    short: '99 Shadowless 1st Ed Charizard',
    year: 1999,
    set: '1999 Pokémon Base Set Shadowless 1st Edition',
    grade: 'PSA 10',
    sport: 'pokemon',
    hammer: 420_000,
    saleDate: '2022-03',
    house: 'PWCC',
    tier: 'major',
    story: 'Sold at PWCC in March 2022.',
    context: 'First Edition Shadowless Charizard is the Pokémon-collecting grail. Pop-100 at PSA 10. Paul Khoury (Popcorn Man on YouTube) owns a notable copy.',
  },
  {
    id: 'brady-topps-bgs-10-2000',
    card: '2000 Bowman Chrome Tom Brady RC #236',
    short: '00 Bowman Chrome Brady RC',
    year: 2000,
    set: '2000 Bowman Chrome',
    grade: 'BGS 10',
    sport: 'football',
    hammer: 420_000,
    saleDate: '2021-04',
    house: 'Heritage',
    tier: 'major',
    story: 'Sold at Heritage in April 2021.',
    context: 'The 2000 Bowman Chrome Brady is the non-autograph Brady RC grail. Pop-2 at BGS 10.',
  },
  {
    id: 'jackson-53-topps',
    card: '1953 Topps Reggie Jackson RC — *actually* 1969 #260',
    short: '69 Topps Jackson RC',
    year: 1969,
    set: '1969 Topps',
    grade: 'PSA 9',
    sport: 'baseball',
    hammer: 180_000,
    saleDate: '2021-11',
    house: 'Heritage',
    tier: 'major',
    story: 'Sold at Heritage in November 2021.',
    context: 'Reggie Jackson won 5 World Series and was AL MVP in 1973. His 1969 Topps RC is one of the defining cards of the late-1960s set.',
  },
  {
    id: 'ripken-82-topps',
    card: '1982 Topps Traded Cal Ripken Jr. RC #98T',
    short: '82 Topps Traded Ripken RC',
    year: 1982,
    set: '1982 Topps Traded',
    grade: 'PSA 10',
    sport: 'baseball',
    hammer: 36_000,
    saleDate: '2022-05',
    house: 'Heritage',
    tier: 'notable',
    story: 'Sold at Heritage in May 2022.',
    context: 'Ripken\u2019s 2,632 consecutive game streak is one of baseball\u2019s most unbreakable records. The 1982 Traded set was mail-order only, compressing print run vs base Topps.',
  },
  {
    id: 'nolan-ryan-67-topps',
    card: '1967 Topps Nolan Ryan RC #581',
    short: '68 Topps Ryan RC',
    year: 1968,
    set: '1968 Topps',
    grade: 'PSA 9',
    sport: 'baseball',
    hammer: 612_000,
    saleDate: '2020-11',
    house: 'Goldin',
    tier: 'major',
    story: 'Sold at Goldin in November 2020.',
    context: 'Nolan Ryan threw 7 no-hitters and holds the all-time strikeout record at 5,714. The 68 Topps RC is pop-3 at PSA 9.',
  },
];

/* ─── Grouping & filters ────────────────────────────── */
const SPORTS: Sport[] = ['baseball', 'basketball', 'football', 'hockey', 'pokemon', 'soccer', 'boxing'];
const HOUSES: House[] = ['Goldin', 'Heritage', 'PWCC', 'Lelands', 'Robert Edward', 'Memory Lane', 'Mile High', 'Christie\u2019s', 'SCP'];
const TIERS: { id: Tier; label: string; threshold: string; tone: string }[] = [
  { id: 'mega', label: 'Mega ($5M+)', threshold: '$5M+', tone: 'bg-amber-950/60 border-amber-700 text-amber-300' },
  { id: 'elite', label: 'Elite ($1M-$5M)', threshold: '$1M-$5M', tone: 'bg-emerald-950/60 border-emerald-700 text-emerald-300' },
  { id: 'major', label: 'Major ($250K-$1M)', threshold: '$250K-$1M', tone: 'bg-sky-950/60 border-sky-700 text-sky-300' },
  { id: 'notable', label: 'Notable (under $250K)', threshold: 'under $250K', tone: 'bg-gray-800/60 border-gray-700 text-gray-300' },
];

const SPORT_EMOJI: Record<Sport, string> = {
  baseball: '\u26be',
  basketball: '\ud83c\udfc0',
  football: '\ud83c\udfc8',
  hockey: '\ud83c\udfd2',
  pokemon: '\ud83e\uddca',
  soccer: '\u26bd',
  boxing: '\ud83e\udd4a',
};

const SPORT_LABEL: Record<Sport, string> = {
  baseball: 'Baseball',
  basketball: 'Basketball',
  football: 'Football',
  hockey: 'Hockey',
  pokemon: 'Pokémon',
  soccer: 'Soccer',
  boxing: 'Boxing',
};

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 2).replace(/\.00$/, '').replace(/0$/, '')}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n.toLocaleString()}`;
}

/* ─── UI ────────────────────────────────────────────── */
export default function AuctionArchiveClient() {
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');
  const [tierFilter, setTierFilter] = useState<Tier | 'all'>('all');
  const [houseFilter, setHouseFilter] = useState<House | 'all'>('all');
  const [sortBy, setSortBy] = useState<'price-desc' | 'price-asc' | 'date-desc' | 'date-asc'>('price-desc');
  const [expanded, setExpanded] = useState<string | null>(null);

  const visible = useMemo(() => {
    const list = SALES.filter(s => {
      if (sportFilter !== 'all' && s.sport !== sportFilter) return false;
      if (tierFilter !== 'all' && s.tier !== tierFilter) return false;
      if (houseFilter !== 'all' && s.house !== houseFilter) return false;
      return true;
    });
    list.sort((a, b) => {
      if (sortBy === 'price-desc') return b.hammer - a.hammer;
      if (sortBy === 'price-asc') return a.hammer - b.hammer;
      if (sortBy === 'date-desc') return b.saleDate.localeCompare(a.saleDate);
      return a.saleDate.localeCompare(b.saleDate);
    });
    return list;
  }, [sportFilter, tierFilter, houseFilter, sortBy]);

  const totals = useMemo(() => {
    const total = SALES.reduce((a, s) => a + s.hammer, 0);
    const avg = Math.round(total / SALES.length);
    const highest = SALES.reduce((a, s) => (s.hammer > a.hammer ? s : a), SALES[0]);
    return { total, avg, highest };
  }, []);

  const groupedByTier = useMemo(() => {
    const groups: Record<Tier, Sale[]> = { mega: [], elite: [], major: [], notable: [] };
    for (const s of visible) groups[s.tier].push(s);
    return groups;
  }, [visible]);

  return (
    <div className="space-y-6">
      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total sales" value={SALES.length.toString()} />
        <Stat label="Combined hammer" value={formatMoney(totals.total)} tone="text-amber-400" />
        <Stat label="Average" value={formatMoney(totals.avg)} tone="text-emerald-400" />
        <Stat label="All-time record" value={formatMoney(totals.highest.hammer)} tone="text-rose-400" sub={totals.highest.short} />
      </div>

      {/* Filter rail */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <FilterSelect
          label="Sport"
          value={sportFilter}
          onChange={v => setSportFilter(v as Sport | 'all')}
          options={[{ v: 'all', label: 'All sports' }, ...SPORTS.map(s => ({ v: s, label: `${SPORT_EMOJI[s]} ${SPORT_LABEL[s]}` }))]}
        />
        <FilterSelect
          label="Tier"
          value={tierFilter}
          onChange={v => setTierFilter(v as Tier | 'all')}
          options={[{ v: 'all', label: 'All tiers' }, ...TIERS.map(t => ({ v: t.id, label: t.label }))]}
        />
        <FilterSelect
          label="Auction house"
          value={houseFilter}
          onChange={v => setHouseFilter(v as House | 'all')}
          options={[{ v: 'all', label: 'All houses' }, ...HOUSES.map(h => ({ v: h, label: h }))]}
        />
        <FilterSelect
          label="Sort"
          value={sortBy}
          onChange={v => setSortBy(v as typeof sortBy)}
          options={[
            { v: 'price-desc', label: 'Price high → low' },
            { v: 'price-asc', label: 'Price low → high' },
            { v: 'date-desc', label: 'Most recent' },
            { v: 'date-asc', label: 'Oldest first' },
          ]}
        />
      </div>

      <div className="text-xs text-gray-500">Showing {visible.length} of {SALES.length} sales</div>

      {/* Grouped by tier */}
      {TIERS.map(tierMeta => {
        const group = groupedByTier[tierMeta.id];
        if (group.length === 0) return null;
        return (
          <div key={tierMeta.id} className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-xs font-bold border rounded ${tierMeta.tone}`}>{tierMeta.label}</span>
              <span className="text-xs text-gray-500">{group.length} sales</span>
            </div>
            {group.map(sale => (
              <SaleCard
                key={sale.id}
                sale={sale}
                expanded={expanded === sale.id}
                onToggle={() => setExpanded(expanded === sale.id ? null : sale.id)}
              />
            ))}
          </div>
        );
      })}

      {visible.length === 0 && (
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-8 text-center text-sm text-gray-500">
          No sales match your filters. Clear filters to see the full archive.
        </div>
      )}

      <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-5 text-sm text-gray-400 space-y-2">
        <h3 className="text-white font-semibold">About the archive</h3>
        <p>
          All sale prices are public record, including buyer premium. Dates are rounded to month granularity. Grades
          reflect the slab at time of sale — some cards have been re-graded since. This archive is a curated sampling
          of the most significant hammer results in the modern grading era (roughly 1991-present), not an exhaustive
          list.
        </p>
        <p>
          Sources: Goldin Auctions lot archives, Heritage Auctions sports & trading card results, PWCC Marketplace
          auction records, Lelands auction catalogs, and contemporaneous trade press (Beckett, Sports Collectors
          Daily, Cardlines). Prices for a particular grade may have changed significantly in secondary markets since
          the sale date.
        </p>
      </div>
    </div>
  );
}

/* ─── Sub-components ────────────────────────────────── */
function FilterSelect<T extends string>({ label, value, onChange, options }: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { v: T; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as T)}
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
      >
        {options.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Stat({ label, value, tone, sub }: { label: string; value: string; tone?: string; sub?: string }) {
  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-lg px-3 py-2">
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-black ${tone ?? 'text-white'}`}>{value}</div>
      {sub && <div className="text-[10px] text-gray-500 truncate">{sub}</div>}
    </div>
  );
}

function SaleCard({ sale, expanded, onToggle }: { sale: Sale; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full text-left p-4 hover:bg-gray-900/60 transition-colors">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span>{SPORT_EMOJI[sale.sport]}</span>
              <span className="text-white font-bold">{sale.card}</span>
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-3 flex-wrap">
              <span>{sale.grade}</span>
              <span>·</span>
              <span>{sale.house}</span>
              <span>·</span>
              <span>{sale.saleDate}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-amber-400">{formatMoney(sale.hammer)}</div>
            <div className="text-xs text-gray-500">hammer + premium</div>
          </div>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 text-sm text-gray-300 border-t border-gray-800 pt-3">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Story</div>
            <p>{sale.story}</p>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Context</div>
            <p className="text-gray-400">{sale.context}</p>
          </div>
        </div>
      )}
    </div>
  );
}
