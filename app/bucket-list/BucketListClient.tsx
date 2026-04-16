'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';

type Category =
  | 'Vintage Legends'
  | 'Modern Icons'
  | 'New Era Stars'
  | 'Error & Oddball Cards'
  | 'Record-Breakers & Firsts';

interface BucketCard {
  id: number;
  name: string;
  player: string;
  sport: Sport;
  category: Category;
  whyItMatters: string;
  priceRange: string;
  year: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

type SortOption = 'default' | 'year' | 'difficulty' | 'sport';

/* ------------------------------------------------------------------ */
/*  Data — 50 cards, 10 per category                                   */
/* ------------------------------------------------------------------ */

const BUCKET_CARDS: BucketCard[] = [
  /* ── Vintage Legends (pre-1980) ── */
  {
    id: 1,
    name: '1952 Topps Mickey Mantle #311',
    player: 'Mickey Mantle',
    sport: 'baseball',
    category: 'Vintage Legends',
    whyItMatters:
      'The most iconic post-war baseball card ever produced. A PSA 10 sold for $12.6 million in 2022, making it one of the most valuable cards in existence.',
    priceRange: '$50,000-$200,000 (raw) / $1M-$12.6M (PSA 8-10)',
    year: 1952,
    difficulty: 5,
  },
  {
    id: 2,
    name: '1933 Goudey Babe Ruth #53',
    player: 'Babe Ruth',
    sport: 'baseball',
    category: 'Vintage Legends',
    whyItMatters:
      'One of four Ruth cards in the iconic 1933 Goudey set. The Sultan of Swat on a pre-war card is the ultimate vintage baseball collectible.',
    priceRange: '$20,000-$80,000 (raw) / $200,000-$500,000+ (PSA 8+)',
    year: 1933,
    difficulty: 5,
  },
  {
    id: 3,
    name: 'T206 Honus Wagner',
    player: 'Honus Wagner',
    sport: 'baseball',
    category: 'Vintage Legends',
    whyItMatters:
      'The Holy Grail of card collecting. Fewer than 60 copies are known to exist. Wagner reportedly demanded production stop because he opposed tobacco advertising.',
    priceRange: '$500,000-$7.25M (any grade)',
    year: 1909,
    difficulty: 5,
  },
  {
    id: 4,
    name: '1951 Bowman Mickey Mantle #253',
    player: 'Mickey Mantle',
    sport: 'baseball',
    category: 'Vintage Legends',
    whyItMatters:
      'Mantle\'s true rookie card, issued a year before the legendary 1952 Topps. A cornerstone of any serious vintage collection.',
    priceRange: '$30,000-$100,000 (raw) / $500,000-$3M+ (PSA 8+)',
    year: 1951,
    difficulty: 5,
  },
  {
    id: 5,
    name: '1986 Fleer Michael Jordan #57',
    player: 'Michael Jordan',
    sport: 'basketball',
    category: 'Vintage Legends',
    whyItMatters:
      'The most recognized basketball card in the hobby. Jordan\'s rookie in the iconic Fleer design defines an entire generation of collecting.',
    priceRange: '$3,000-$15,000 (raw) / $50,000-$738,000 (PSA 10)',
    year: 1986,
    difficulty: 4,
  },
  {
    id: 6,
    name: '1979 O-Pee-Chee Wayne Gretzky #18',
    player: 'Wayne Gretzky',
    sport: 'hockey',
    category: 'Vintage Legends',
    whyItMatters:
      'The Great One\'s rookie card and the most valuable hockey card ever. The OPC version is the true RC, printed in Canada with slightly different stock than the Topps version.',
    priceRange: '$5,000-$30,000 (raw) / $100,000-$3.75M (PSA 10)',
    year: 1979,
    difficulty: 5,
  },
  {
    id: 7,
    name: '1958 Topps Jim Brown #62',
    player: 'Jim Brown',
    sport: 'football',
    category: 'Vintage Legends',
    whyItMatters:
      'The rookie card of arguably the greatest football player ever. One of the most sought-after vintage football cards, centering issues make high grades extremely rare.',
    priceRange: '$5,000-$20,000 (raw) / $100,000-$358,500 (PSA 9)',
    year: 1958,
    difficulty: 5,
  },
  {
    id: 8,
    name: '1966 Topps Bobby Orr #35',
    player: 'Bobby Orr',
    sport: 'hockey',
    category: 'Vintage Legends',
    whyItMatters:
      'The rookie card of the player who revolutionized the defenseman position. Orr\'s 1966 Topps is the second most valuable hockey card behind only the Gretzky OPC.',
    priceRange: '$5,000-$25,000 (raw) / $100,000-$500,000+ (PSA 8+)',
    year: 1966,
    difficulty: 5,
  },
  {
    id: 9,
    name: '1948 Leaf Jackie Robinson #79',
    player: 'Jackie Robinson',
    sport: 'baseball',
    category: 'Vintage Legends',
    whyItMatters:
      'The only recognized rookie card of the man who broke baseball\'s color barrier. A cultural artifact that transcends the hobby.',
    priceRange: '$15,000-$60,000 (raw) / $200,000-$780,000 (PSA 8+)',
    year: 1948,
    difficulty: 5,
  },
  {
    id: 10,
    name: '1955 Topps Roberto Clemente #164',
    player: 'Roberto Clemente',
    sport: 'baseball',
    category: 'Vintage Legends',
    whyItMatters:
      'The rookie card of one of baseball\'s greatest humanitarians and a 3,000-hit club member. Clemente\'s tragic death in a relief mission flight cements his legendary status.',
    priceRange: '$5,000-$25,000 (raw) / $100,000-$478,000 (PSA 8+)',
    year: 1955,
    difficulty: 5,
  },

  /* ── Modern Icons (1980-2010) ── */
  {
    id: 11,
    name: '1989 Upper Deck Ken Griffey Jr. #1',
    player: 'Ken Griffey Jr.',
    sport: 'baseball',
    category: 'Modern Icons',
    whyItMatters:
      'The card that launched Upper Deck and the modern era of premium cards. Card #1 in the set featuring The Kid — it practically defined junk wax era collecting.',
    priceRange: '$50-$200 (raw) / $2,000-$15,000 (PSA 10)',
    year: 1989,
    difficulty: 2,
  },
  {
    id: 12,
    name: '2001 Topps Chrome Albert Pujols #596',
    player: 'Albert Pujols',
    sport: 'baseball',
    category: 'Modern Icons',
    whyItMatters:
      'The Chrome RC of one of baseball\'s all-time greats. Pujols\' first-ballot Hall of Fame career and 700+ home runs make this a modern cornerstone.',
    priceRange: '$200-$800 (raw) / $5,000-$25,000 (PSA 10)',
    year: 2001,
    difficulty: 3,
  },
  {
    id: 13,
    name: '2000 Playoff Contenders Tom Brady #144 Auto',
    player: 'Tom Brady',
    sport: 'football',
    category: 'Modern Icons',
    whyItMatters:
      'The holy grail of modern football cards. A 6th-round pick who became the GOAT — this autographed RC has sold for over $3.1 million. The ultimate modern sports card.',
    priceRange: '$100,000-$500,000 (raw) / $1M-$3.1M (BGS 9+)',
    year: 2000,
    difficulty: 5,
  },
  {
    id: 14,
    name: '1986 Topps Jerry Rice #161',
    player: 'Jerry Rice',
    sport: 'football',
    category: 'Modern Icons',
    whyItMatters:
      'The rookie card of the greatest wide receiver in NFL history. Pop 53 in PSA 10 makes gem mints extremely desirable.',
    priceRange: '$50-$300 (raw) / $5,000-$30,000 (PSA 10)',
    year: 1986,
    difficulty: 3,
  },
  {
    id: 15,
    name: '2003 Topps Chrome LeBron James #111',
    player: 'LeBron James',
    sport: 'basketball',
    category: 'Modern Icons',
    whyItMatters:
      'The Chrome RC of the player many consider the greatest ever. LeBron\'s cultural impact and longevity make this the most important basketball card since the Jordan Fleer.',
    priceRange: '$1,000-$5,000 (raw) / $20,000-$100,000+ (PSA 10)',
    year: 2003,
    difficulty: 4,
  },
  {
    id: 16,
    name: '1997 Topps Chrome Derek Jeter Refractor #7',
    player: 'Derek Jeter',
    sport: 'baseball',
    category: 'Modern Icons',
    whyItMatters:
      'The refractor parallel of Jeter\'s Chrome card is one of the most coveted \'90s inserts. The Captain of the Yankees dynasty in the set that made refractors a hobby obsession.',
    priceRange: '$2,000-$8,000 (raw) / $20,000-$75,000 (PSA 10)',
    year: 1997,
    difficulty: 4,
  },
  {
    id: 17,
    name: '2009 Bowman Chrome Mike Trout #BDPP89',
    player: 'Mike Trout',
    sport: 'baseball',
    category: 'Modern Icons',
    whyItMatters:
      'The draft picks & prospects card of the best player of his generation. Trout\'s three MVPs and generational talent make this the modern Mantle equivalent.',
    priceRange: '$1,000-$5,000 (raw) / $30,000-$150,000 (PSA 10)',
    year: 2009,
    difficulty: 4,
  },
  {
    id: 18,
    name: '1993 SP Derek Jeter Foil #279',
    player: 'Derek Jeter',
    sport: 'baseball',
    category: 'Modern Icons',
    whyItMatters:
      'Jeter\'s true premium rookie card from the first year of SP. The foil stock is notoriously condition-sensitive, making high grades a serious challenge.',
    priceRange: '$500-$2,000 (raw) / $50,000-$99,000 (PSA 10)',
    year: 1993,
    difficulty: 4,
  },
  {
    id: 19,
    name: '1996 Topps Chrome Kobe Bryant #138',
    player: 'Kobe Bryant',
    sport: 'basketball',
    category: 'Modern Icons',
    whyItMatters:
      'The Chrome RC of the Black Mamba. Kobe\'s tragic passing in 2020 sent this card soaring as collectors honored his legacy. A pillar of \'90s basketball cards.',
    priceRange: '$1,000-$5,000 (raw) / $20,000-$60,000 (PSA 10)',
    year: 1996,
    difficulty: 4,
  },
  {
    id: 20,
    name: '2005 Upper Deck Young Guns Sidney Crosby #201',
    player: 'Sidney Crosby',
    sport: 'hockey',
    category: 'Modern Icons',
    whyItMatters:
      'The Young Guns RC of Sid the Kid — the most important hockey rookie card since Gretzky. Three Stanley Cups and two Conn Smythes solidify his legacy.',
    priceRange: '$200-$800 (raw) / $5,000-$20,000 (PSA 10)',
    year: 2005,
    difficulty: 3,
  },

  /* ── New Era Stars (2010+) ── */
  {
    id: 21,
    name: '2018 Topps Update Ronald Acuna Jr. #US250',
    player: 'Ronald Acuna Jr.',
    sport: 'baseball',
    category: 'New Era Stars',
    whyItMatters:
      'The flagship RC of baseball\'s most electrifying young star. A 40/70 season and generational athleticism make Acuna the face of modern baseball cards.',
    priceRange: '$30-$100 (raw) / $500-$3,000 (PSA 10)',
    year: 2018,
    difficulty: 2,
  },
  {
    id: 22,
    name: '2018 Topps Update Shohei Ohtani #US1',
    player: 'Shohei Ohtani',
    sport: 'baseball',
    category: 'New Era Stars',
    whyItMatters:
      'The RC of the most unique player in baseball history. Ohtani\'s two-way dominance — MVP hitting AND pitching — hasn\'t been seen since Babe Ruth.',
    priceRange: '$50-$200 (raw) / $1,000-$5,000 (PSA 10)',
    year: 2018,
    difficulty: 2,
  },
  {
    id: 23,
    name: '2018 Panini Prizm Luka Doncic #280',
    player: 'Luka Doncic',
    sport: 'basketball',
    category: 'New Era Stars',
    whyItMatters:
      'The Prizm RC of the Slovenian wonderboy who arrived in the NBA as a EuroLeague MVP at 19. Luka\'s court vision and scoring have drawn LeBron comparisons.',
    priceRange: '$100-$400 (raw) / $2,000-$10,000 (PSA 10)',
    year: 2018,
    difficulty: 3,
  },
  {
    id: 24,
    name: '2020 Panini Prizm Justin Herbert #325',
    player: 'Justin Herbert',
    sport: 'football',
    category: 'New Era Stars',
    whyItMatters:
      'Herbert shattered rookie passing records and immediately became one of the NFL\'s elite QBs. His Prizm RC is a cornerstone of modern football collecting.',
    priceRange: '$30-$150 (raw) / $500-$3,000 (PSA 10)',
    year: 2020,
    difficulty: 2,
  },
  {
    id: 25,
    name: '2019 Topps Chrome Fernando Tatis Jr. #203',
    player: 'Fernando Tatis Jr.',
    sport: 'baseball',
    category: 'New Era Stars',
    whyItMatters:
      'El Nino\'s Chrome RC captured the excitement of baseball\'s most exciting young shortstop. Despite controversy, the card remains a key modern baseball chase.',
    priceRange: '$30-$100 (raw) / $300-$2,000 (PSA 10)',
    year: 2019,
    difficulty: 2,
  },
  {
    id: 26,
    name: '2020 Panini Mosaic Joe Burrow #201',
    player: 'Joe Burrow',
    sport: 'football',
    category: 'New Era Stars',
    whyItMatters:
      'The #1 overall pick after the greatest college season ever at LSU. Burrow led the Bengals to the Super Bowl and is the new face of the AFC.',
    priceRange: '$20-$80 (raw) / $300-$1,500 (PSA 10)',
    year: 2020,
    difficulty: 2,
  },
  {
    id: 27,
    name: '2023 Topps Chrome Paul Skenes #PSA-1',
    player: 'Paul Skenes',
    sport: 'baseball',
    category: 'New Era Stars',
    whyItMatters:
      'The #1 pick who made the All-Star Game as a rookie — the hardest throwing starter in baseball with a devastating splinker. The hottest name in modern baseball cards.',
    priceRange: '$20-$80 (raw) / $200-$1,000 (PSA 10)',
    year: 2023,
    difficulty: 1,
  },
  {
    id: 28,
    name: '2023 Upper Deck Connor Bedard Young Guns #201',
    player: 'Connor Bedard',
    sport: 'hockey',
    category: 'New Era Stars',
    whyItMatters:
      'The most hyped hockey prospect since Crosby. Bedard\'s Young Guns RC is the biggest hockey card release in nearly two decades.',
    priceRange: '$50-$200 (raw) / $500-$2,500 (PSA 10)',
    year: 2023,
    difficulty: 2,
  },
  {
    id: 29,
    name: '2017 Panini Prizm Patrick Mahomes II #269',
    player: 'Patrick Mahomes',
    sport: 'football',
    category: 'New Era Stars',
    whyItMatters:
      'The Prizm RC of the most talented QB in NFL history. Three Super Bowl wins before age 30 — Mahomes\' cards have skyrocketed and show no signs of slowing down.',
    priceRange: '$500-$2,000 (raw) / $10,000-$50,000 (PSA 10)',
    year: 2017,
    difficulty: 3,
  },
  {
    id: 30,
    name: '2019 Panini Prizm Ja Morant #249',
    player: 'Ja Morant',
    sport: 'basketball',
    category: 'New Era Stars',
    whyItMatters:
      'The #2 pick with the most explosive athleticism in the NBA. Morant\'s highlight dunks and fearless play style make his Prizm RC a must-own for modern basketball collectors.',
    priceRange: '$50-$200 (raw) / $500-$3,000 (PSA 10)',
    year: 2019,
    difficulty: 2,
  },

  /* ── Error & Oddball Cards ── */
  {
    id: 31,
    name: '1989 Fleer Bill Ripken FF #616',
    player: 'Bill Ripken',
    sport: 'baseball',
    category: 'Error & Oddball Cards',
    whyItMatters:
      'The most notorious error card in hobby history — an obscenity written on the bat knob made it past quality control. Multiple corrected versions exist, but the original "FF" is legend.',
    priceRange: '$50-$300 (raw) / $1,000-$5,000 (PSA 10)',
    year: 1989,
    difficulty: 2,
  },
  {
    id: 32,
    name: '1990 Donruss Juan Gonzalez Reverse Negative #33',
    player: 'Juan Gonzalez',
    sport: 'baseball',
    category: 'Error & Oddball Cards',
    whyItMatters:
      'A striking reverse-negative printing error that makes Gonzalez appear to bat left-handed. One of the most visually dramatic error cards ever produced.',
    priceRange: '$20-$100 (raw) / $200-$800 (PSA 10)',
    year: 1990,
    difficulty: 2,
  },
  {
    id: 33,
    name: '1989 Upper Deck Dale Murphy Reverse Negative #357',
    player: 'Dale Murphy',
    sport: 'baseball',
    category: 'Error & Oddball Cards',
    whyItMatters:
      'Upper Deck\'s inaugural set included this reverse-negative error of the Braves slugger. A desirable error from the set that changed the hobby forever.',
    priceRange: '$10-$50 (raw) / $100-$500 (PSA 10)',
    year: 1989,
    difficulty: 1,
  },
  {
    id: 34,
    name: '1957 Topps Ted Williams #1',
    player: 'Ted Williams',
    sport: 'baseball',
    category: 'Error & Oddball Cards',
    whyItMatters:
      'Oddball because Williams had an exclusive deal with Fleer, making this Topps appearance a contractual anomaly. The #1 card in the 1957 set featuring the Splendid Splinter is incredibly scarce in high grade.',
    priceRange: '$2,000-$10,000 (raw) / $50,000-$150,000 (PSA 8+)',
    year: 1957,
    difficulty: 4,
  },
  {
    id: 35,
    name: '1969 Topps Reggie Jackson #260 (White Letter Variation)',
    player: 'Reggie Jackson',
    sport: 'baseball',
    category: 'Error & Oddball Cards',
    whyItMatters:
      'Jackson\'s rookie card exists in two variations — yellow letter and the scarcer white letter version. Mr. October\'s RC with the rare name variation is a top vintage chase.',
    priceRange: '$1,000-$5,000 (raw) / $20,000-$50,000+ (PSA 8+)',
    year: 1969,
    difficulty: 4,
  },
  {
    id: 36,
    name: '1968 Topps Nolan Ryan / Jerry Koosman Rookie #177',
    player: 'Nolan Ryan',
    sport: 'baseball',
    category: 'Error & Oddball Cards',
    whyItMatters:
      'An oddball shared rookie card pairing the all-time strikeout king with Koosman. Ryan\'s 7 no-hitters and 5,714 Ks make this shared RC one of the most valuable cards of the \'60s.',
    priceRange: '$2,000-$10,000 (raw) / $50,000-$200,000+ (PSA 8+)',
    year: 1968,
    difficulty: 4,
  },
  {
    id: 37,
    name: '1993 Topps Finest Refractor (Any Star)',
    player: 'Various',
    sport: 'baseball',
    category: 'Error & Oddball Cards',
    whyItMatters:
      'The first-ever refractor parallels, inserted at roughly 1:12 packs. These pioneered the chase-parallel concept that dominates the modern hobby. Any star player refractor is collectible.',
    priceRange: '$50-$500 (raw) / $500-$5,000+ (PSA 10, star players)',
    year: 1993,
    difficulty: 3,
  },
  {
    id: 38,
    name: '1990 Leaf Sammy Sosa #220',
    player: 'Sammy Sosa',
    sport: 'baseball',
    category: 'Error & Oddball Cards',
    whyItMatters:
      'An oddball premium entry from the revived Leaf brand. Sosa\'s role in the legendary 1998 home run chase with McGwire makes this a cultural touchstone despite the steroid era stigma.',
    priceRange: '$10-$40 (raw) / $200-$1,000 (PSA 10)',
    year: 1990,
    difficulty: 1,
  },
  {
    id: 39,
    name: '1990 Topps Frank Thomas No Name on Front #414',
    player: 'Frank Thomas',
    sport: 'baseball',
    category: 'Error & Oddball Cards',
    whyItMatters:
      'The Big Hurt\'s rookie card has a famous error variation where his name is completely missing from the front. One of the most well-known modern error cards and a key \'90s RC.',
    priceRange: '$100-$500 (raw) / $5,000-$20,000 (PSA 10)',
    year: 1990,
    difficulty: 3,
  },
  {
    id: 40,
    name: '1989 Upper Deck Ken Griffey Jr. Star Rookie #1',
    player: 'Ken Griffey Jr.',
    sport: 'baseball',
    category: 'Error & Oddball Cards',
    whyItMatters:
      'While also the flagship Modern Icons card, this card\'s numerous counterfeits make authenticating originals a hobby challenge. The hologram was Upper Deck\'s anti-counterfeit innovation.',
    priceRange: '$50-$200 (raw) / $2,000-$15,000 (PSA 10)',
    year: 1989,
    difficulty: 2,
  },

  /* ── Record-Breakers & Firsts ── */
  {
    id: 41,
    name: '1982 Topps Traded Cal Ripken Jr. #98T',
    player: 'Cal Ripken Jr.',
    sport: 'baseball',
    category: 'Record-Breakers & Firsts',
    whyItMatters:
      'The Iron Man\'s key rookie card from the Traded set. Ripken\'s 2,632 consecutive games record may never be broken — a monument to durability and dedication.',
    priceRange: '$100-$500 (raw) / $5,000-$15,000 (PSA 10)',
    year: 1982,
    difficulty: 3,
  },
  {
    id: 42,
    name: '1986 Fleer Update Barry Bonds #U-14',
    player: 'Barry Bonds',
    sport: 'baseball',
    category: 'Record-Breakers & Firsts',
    whyItMatters:
      'The RC of baseball\'s all-time home run king (762). Bonds\' record-breaking career — including the single-season 73 HR mark — remains unmatched despite the steroid controversy.',
    priceRange: '$30-$150 (raw) / $2,000-$8,000 (PSA 10)',
    year: 1986,
    difficulty: 2,
  },
  {
    id: 43,
    name: '1963 Topps Pete Rose #537',
    player: 'Pete Rose',
    sport: 'baseball',
    category: 'Record-Breakers & Firsts',
    whyItMatters:
      'The RC of Charlie Hustle, baseball\'s all-time hits leader with 4,256. Rose\'s lifetime ban adds mystique to a card that represents both greatness and controversy.',
    priceRange: '$1,000-$5,000 (raw) / $50,000-$200,000+ (PSA 8+)',
    year: 1963,
    difficulty: 4,
  },
  {
    id: 44,
    name: '1954 Topps Hank Aaron #128',
    player: 'Hank Aaron',
    sport: 'baseball',
    category: 'Record-Breakers & Firsts',
    whyItMatters:
      'The rookie card of Hammerin\' Hank, who broke Babe Ruth\'s career home run record with 755. Aaron achieved greatness while facing horrific racism — a true American hero.',
    priceRange: '$5,000-$25,000 (raw) / $100,000-$500,000+ (PSA 8+)',
    year: 1954,
    difficulty: 5,
  },
  {
    id: 45,
    name: '1985 Topps Mark McGwire RC #401',
    player: 'Mark McGwire',
    sport: 'baseball',
    category: 'Record-Breakers & Firsts',
    whyItMatters:
      'Big Mac\'s RC from his Olympic year. McGwire\'s 70 home runs in 1998 captivated America and saved baseball after the 1994 strike — a pivotal card in hobby history.',
    priceRange: '$5-$20 (raw) / $200-$1,000 (PSA 10)',
    year: 1985,
    difficulty: 1,
  },
  {
    id: 46,
    name: '2001 Topps Ichiro Suzuki #726',
    player: 'Ichiro Suzuki',
    sport: 'baseball',
    category: 'Record-Breakers & Firsts',
    whyItMatters:
      'The flagship RC of the first Japanese position player to star in MLB. Ichiro\'s 262-hit season (2004) broke a record that stood for 84 years. A pioneer who bridged two baseball worlds.',
    priceRange: '$30-$100 (raw) / $500-$3,000 (PSA 10)',
    year: 2001,
    difficulty: 2,
  },
  {
    id: 47,
    name: '2001 SP Authentic Tiger Woods #51',
    player: 'Tiger Woods',
    sport: 'golf' as Sport,
    category: 'Record-Breakers & Firsts',
    whyItMatters:
      'The first major Tiger Woods card, crossing golf into mainstream card collecting. Tiger\'s 15 majors and cultural impact made this the most valuable non-team-sport card in the hobby.',
    priceRange: '$500-$2,000 (raw) / $10,000-$50,000+ (PSA 10)',
    year: 2001,
    difficulty: 3,
  },
  {
    id: 48,
    name: '1992 Topps Shaquille O\'Neal #362',
    player: 'Shaquille O\'Neal',
    sport: 'basketball',
    category: 'Record-Breakers & Firsts',
    whyItMatters:
      'Shaq\'s most accessible rookie card from his dominant debut season. The most physically imposing player in NBA history — 4 titles, 3 Finals MVPs, and a cultural icon.',
    priceRange: '$10-$40 (raw) / $500-$2,000 (PSA 10)',
    year: 1992,
    difficulty: 1,
  },
  {
    id: 49,
    name: '1979 O-Pee-Chee Wayne Gretzky RC #18',
    player: 'Wayne Gretzky',
    sport: 'hockey',
    category: 'Record-Breakers & Firsts',
    whyItMatters:
      'The record-breaker angle: Gretzky holds 61 NHL records including 2,857 career points — nearly 1,000 more than second place. No athlete has dominated their sport\'s record book so thoroughly.',
    priceRange: '$5,000-$30,000 (raw) / $100,000-$3.75M (PSA 10)',
    year: 1979,
    difficulty: 5,
  },
  {
    id: 50,
    name: '1986 Fleer Michael Jordan #57',
    player: 'Michael Jordan',
    sport: 'basketball',
    category: 'Record-Breakers & Firsts',
    whyItMatters:
      'From the record-breakers perspective: 6 Finals MVPs, 10 scoring titles, 5 MVPs. Jordan\'s Fleer RC launched the modern basketball card market and remains the benchmark for greatness.',
    priceRange: '$3,000-$15,000 (raw) / $50,000-$738,000 (PSA 10)',
    year: 1986,
    difficulty: 4,
  },
];

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CATEGORIES: Category[] = [
  'Vintage Legends',
  'Modern Icons',
  'New Era Stars',
  'Error & Oddball Cards',
  'Record-Breakers & Firsts',
];

const SPORT_OPTIONS: Array<Sport | 'all'> = ['all', 'baseball', 'basketball', 'football', 'hockey'];

const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string; badge: string }> = {
  'Vintage Legends': {
    bg: 'bg-amber-950/30',
    text: 'text-amber-400',
    border: 'border-amber-800/50',
    badge: 'bg-amber-900/60 text-amber-300',
  },
  'Modern Icons': {
    bg: 'bg-blue-950/30',
    text: 'text-blue-400',
    border: 'border-blue-800/50',
    badge: 'bg-blue-900/60 text-blue-300',
  },
  'New Era Stars': {
    bg: 'bg-emerald-950/30',
    text: 'text-emerald-400',
    border: 'border-emerald-800/50',
    badge: 'bg-emerald-900/60 text-emerald-300',
  },
  'Error & Oddball Cards': {
    bg: 'bg-rose-950/30',
    text: 'text-rose-400',
    border: 'border-rose-800/50',
    badge: 'bg-rose-900/60 text-rose-300',
  },
  'Record-Breakers & Firsts': {
    bg: 'bg-purple-950/30',
    text: 'text-purple-400',
    border: 'border-purple-800/50',
    badge: 'bg-purple-900/60 text-purple-300',
  },
};

const SPORT_BADGES: Record<string, string> = {
  baseball: 'bg-red-900/50 text-red-300',
  basketball: 'bg-orange-900/50 text-orange-300',
  football: 'bg-green-900/50 text-green-300',
  hockey: 'bg-cyan-900/50 text-cyan-300',
  golf: 'bg-lime-900/50 text-lime-300',
};

const STORAGE_KEY = 'cardvault-bucket-list';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BucketListClient() {
  /* ---- State ---- */
  const [isMounted, setIsMounted] = useState(false);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [shareMessage, setShareMessage] = useState('');

  /* ---- SSR guard + localStorage hydration ---- */
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: number[] = JSON.parse(stored);
        setChecked(new Set(parsed));
      }
    } catch {
      /* ignore corrupt data */
    }
  }, []);

  /* ---- Persist to localStorage on change ---- */
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(checked)));
    } catch {
      /* storage full — ignore */
    }
  }, [checked, isMounted]);

  /* ---- Toggle handler ---- */
  const toggle = useCallback((id: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /* ---- Filtered + sorted cards ---- */
  const filteredCards = useMemo(() => {
    let cards = [...BUCKET_CARDS];

    if (categoryFilter !== 'all') {
      cards = cards.filter((c) => c.category === categoryFilter);
    }
    if (sportFilter !== 'all') {
      cards = cards.filter((c) => c.sport === sportFilter);
    }

    switch (sortOption) {
      case 'year':
        cards.sort((a, b) => a.year - b.year);
        break;
      case 'difficulty':
        cards.sort((a, b) => b.difficulty - a.difficulty);
        break;
      case 'sport':
        cards.sort((a, b) => a.sport.localeCompare(b.sport));
        break;
      default:
        break;
    }

    return cards;
  }, [categoryFilter, sportFilter, sortOption]);

  /* ---- Stats ---- */
  const totalChecked = checked.size;
  const categoriesCompleted = CATEGORIES.filter(
    (cat) => BUCKET_CARDS.filter((c) => c.category === cat).every((c) => checked.has(c.id))
  ).length;

  const remainingCards = BUCKET_CARDS.filter((c) => !checked.has(c.id));
  const avgDifficultyRemaining =
    remainingCards.length > 0
      ? (remainingCards.reduce((sum, c) => sum + c.difficulty, 0) / remainingCards.length).toFixed(1)
      : '0';

  const categoryProgress = (cat: Category) => {
    const catCards = BUCKET_CARDS.filter((c) => c.category === cat);
    return catCards.filter((c) => checked.has(c.id)).length;
  };

  /* ---- Share ---- */
  const generateShareText = useCallback(() => {
    const catBreakdown = CATEGORIES.map((cat) => {
      const count = BUCKET_CARDS.filter((c) => c.category === cat && checked.has(c.id)).length;
      return `${cat}: ${count}/10`;
    }).join(' | ');

    return `\u{1F3C6} My Card Collecting Bucket List Progress: ${checked.size}/50 \u{2705}\n${catBreakdown}\ncardvault-two.vercel.app/bucket-list`;
  }, [checked]);

  const handleShare = useCallback(
    async (target: 'clipboard' | 'x') => {
      const text = generateShareText();
      if (target === 'clipboard') {
        try {
          await navigator.clipboard.writeText(text);
          setShareMessage('Copied to clipboard!');
        } catch {
          setShareMessage('Failed to copy');
        }
      } else {
        const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        setShareMessage('Opened X!');
      }
      setTimeout(() => setShareMessage(''), 3000);
    },
    [generateShareText]
  );

  /* ---- Difficulty stars renderer ---- */
  const renderStars = (difficulty: number) => (
    <span className="inline-flex gap-0.5" aria-label={`Difficulty: ${difficulty} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= difficulty ? 'text-yellow-400' : 'text-gray-700'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );

  /* ---- Render ---- */
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-lg">Loading Bucket List...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* ── Header ── */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Card Collecting Bucket List
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            50 iconic cards every serious collector should own. Track your progress and build the ultimate collection.
          </p>
        </div>

        {/* ── Progress Bar ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Overall Progress</span>
            <span className="text-sm font-semibold text-white">{totalChecked}/50</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(totalChecked / 50) * 100}%` }}
            />
          </div>
        </div>

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{totalChecked}/50</div>
            <div className="text-xs text-gray-400 mt-1">Cards Owned</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{categoriesCompleted}/5</div>
            <div className="text-xs text-gray-400 mt-1">Categories Complete</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{avgDifficultyRemaining}</div>
            <div className="text-xs text-gray-400 mt-1">Avg Difficulty Left</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleShare('clipboard')}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                title="Copy progress to clipboard"
              >
                Copy
              </button>
              <button
                onClick={() => handleShare('x')}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                title="Share to X"
              >
                Post
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {shareMessage || 'Share Progress'}
            </div>
          </div>
        </div>

        {/* ── Per-Category Progress ── */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-8">
          {CATEGORIES.map((cat) => {
            const prog = categoryProgress(cat);
            const colors = CATEGORY_COLORS[cat];
            return (
              <div
                key={cat}
                className={`rounded-lg border p-3 ${colors.bg} ${colors.border}`}
              >
                <div className={`text-xs font-medium mb-1 ${colors.text}`}>{cat}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-current rounded-full transition-all duration-500"
                      style={{
                        width: `${(prog / 10) * 100}%`,
                        color:
                          cat === 'Vintage Legends'
                            ? '#f59e0b'
                            : cat === 'Modern Icons'
                            ? '#3b82f6'
                            : cat === 'New Era Stars'
                            ? '#10b981'
                            : cat === 'Error & Oddball Cards'
                            ? '#f43f5e'
                            : '#a855f7',
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 tabular-nums">{prog}/10</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Filters ── */}
        <div className="space-y-4 mb-8">
          {/* Category filter tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-white text-gray-950'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => {
              const colors = CATEGORY_COLORS[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    categoryFilter === cat
                      ? `${colors.badge} ring-1 ring-current`
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Sport filter + Sort */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sport:</span>
              {SPORT_OPTIONS.map((sport) => (
                <button
                  key={sport}
                  onClick={() => setSportFilter(sport)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                    sportFilter === sport
                      ? 'bg-white text-gray-950'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {sport === 'all' ? 'All Sports' : sport}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-400">Sort:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-gray-800 text-gray-200 text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="default">Default Order</option>
                <option value="year">By Year</option>
                <option value="difficulty">By Difficulty</option>
                <option value="sport">By Sport</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Card Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCards.map((card) => {
            const isChecked = checked.has(card.id);
            const colors = CATEGORY_COLORS[card.category];
            const ebayQuery = encodeURIComponent(card.name);

            return (
              <div
                key={card.id}
                className={`relative rounded-xl border transition-all duration-300 ${
                  isChecked
                    ? `${colors.bg} ${colors.border} opacity-80`
                    : `bg-gray-900 border-gray-800 hover:border-gray-700`
                }`}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggle(card.id)}
                      className={`flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                        isChecked
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                      aria-label={`${isChecked ? 'Uncheck' : 'Check'} ${card.name}`}
                    >
                      {isChecked && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    {/* Card content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3
                          className={`font-semibold text-base leading-snug transition-colors duration-300 ${
                            isChecked ? 'text-gray-400 line-through decoration-emerald-500/50' : 'text-white'
                          }`}
                        >
                          {card.name}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-sm ${isChecked ? 'text-gray-500' : 'text-gray-300'}`}>
                          {card.player}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wide ${
                            SPORT_BADGES[card.sport] || 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {card.sport}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${colors.badge}`}
                        >
                          {card.category}
                        </span>
                      </div>

                      <p
                        className={`text-sm leading-relaxed mb-3 ${
                          isChecked ? 'text-gray-600' : 'text-gray-400'
                        }`}
                      >
                        {card.whyItMatters}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Price: </span>
                          <span className={isChecked ? 'text-gray-500' : 'text-emerald-400'}>
                            {card.priceRange}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500">Difficulty:</span>
                          {renderStars(card.difficulty)}
                        </div>

                        <a
                          href={`https://www.ebay.com/sch/i.html?_nkw=${ebayQuery}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          Search eBay
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Empty state ── */}
        {filteredCards.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No cards match the selected filters.</p>
            <button
              onClick={() => {
                setCategoryFilter('all');
                setSportFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="mt-12 text-center text-gray-600 text-sm">
          <p>Prices reflect approximate market values as of 2025. Actual prices vary by condition, grade, and market trends.</p>
        </div>
      </div>
    </div>
  );
}
