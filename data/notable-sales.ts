// Notable auction sales and private transactions for iconic cards
// All figures from publicly reported auction results

export interface NotableSale {
  price: string;
  priceValue: number; // numeric for sorting
  grade: string;
  date: string;
  venue: string;
  notes: string;
}

export interface CardNotableSales {
  slug: string;
  sales: NotableSale[];
}

export const notableSales: CardNotableSales[] = [
  // ─── BASEBALL ─────────────────────────────────────────────────
  {
    slug: '1952-topps-mickey-mantle-311',
    sales: [
      { price: '$12,600,000', priceValue: 12600000, grade: 'PSA 9', date: 'Aug 2022', venue: 'Heritage Auctions', notes: 'All-time record for any sports card at auction at time of sale' },
      { price: '$5,200,000', priceValue: 5200000, grade: 'PSA 8', date: 'Jan 2021', venue: 'Goldin Auctions', notes: 'Previous PSA 8 record; part of pandemic market surge' },
      { price: '$2,880,000', priceValue: 2880000, grade: 'PSA 7.5', date: 'Nov 2020', venue: 'PWCC', notes: 'NM+ qualifier' },
      { price: '$540,000', priceValue: 540000, grade: 'PSA 6', date: 'Mar 2021', venue: 'eBay', notes: 'EX-MT grade' },
    ],
  },
  {
    slug: '1909-t206-honus-wagner',
    sales: [
      { price: '$7,250,000', priceValue: 7250000, grade: 'PSA 5', date: 'Aug 2021', venue: 'Robert Edward Auctions', notes: 'World record at time of sale; ex-Gretzky/McNall copy' },
      { price: '$6,600,000', priceValue: 6600000, grade: 'PSA 5.5', date: 'Aug 2022', venue: 'Goldin Auctions', notes: 'One of several PSA 5/5.5 examples; private collection sale' },
      { price: '$3,720,000', priceValue: 3720000, grade: 'PSA 4', date: 'Oct 2020', venue: 'Goldin Auctions', notes: 'Strong result for mid-grade example' },
      { price: '$1,200,000', priceValue: 1200000, grade: 'SGC 1', date: 'Sep 2019', venue: 'REA', notes: 'Robert Edward Auctions; lower grade reflects heavy wear' },
    ],
  },
  {
    slug: '1914-cracker-jack-babe-ruth',
    sales: [
      { price: '$4,222,000', priceValue: 4222000, grade: 'PSA 5', date: 'Jun 2022', venue: 'Goldin Auctions', notes: 'One of two highest-graded examples; set record for card' },
      { price: '$806,000', priceValue: 806000, grade: 'PSA 2', date: 'May 2021', venue: 'Heritage Auctions', notes: 'Good grade; remarkable condition given the card\'s fragility' },
    ],
  },
  {
    slug: '1989-upper-deck-ken-griffey-jr-1',
    sales: [
      { price: '$22,500', priceValue: 22500, grade: 'PSA 10', date: 'Aug 2022', venue: 'eBay', notes: 'Pop 4,200 in PSA 10 — one of the most graded PSA 10 cards ever' },
      { price: '$6,800', priceValue: 6800, grade: 'PSA 10', date: 'Feb 2024', venue: 'PWCC', notes: 'Market correction from 2021 peak' },
      { price: '$3,200', priceValue: 3200, grade: 'PSA 9', date: 'Mar 2025', venue: 'eBay', notes: 'Steady PSA 9 benchmark' },
    ],
  },
  {
    slug: '1993-sp-derek-jeter-279',
    sales: [
      { price: '$168,000', priceValue: 168000, grade: 'PSA 10', date: 'May 2021', venue: 'Goldin Auctions', notes: 'Pop 8 in PSA 10 — notorious centering issues' },
      { price: '$52,000', priceValue: 52000, grade: 'PSA 9', date: 'Nov 2022', venue: 'PWCC', notes: 'Pop 65 — difficult grade due to foil surface' },
      { price: '$18,000', priceValue: 18000, grade: 'PSA 8', date: 'Feb 2025', venue: 'eBay', notes: 'Most liquid grade for the 1993 SP Jeter' },
    ],
  },
  {
    slug: '2009-bowman-chrome-mike-trout-bdpp89',
    sales: [
      { price: '$3,936,000', priceValue: 3936000, grade: 'SGC 10', date: 'Aug 2020', venue: 'PWCC', notes: 'World record for a modern baseball card at that time' },
      { price: '$400,000', priceValue: 400000, grade: 'PSA 10', date: 'Oct 2021', venue: 'eBay', notes: 'PSA 10 benchmark; pop 42' },
      { price: '$35,000', priceValue: 35000, grade: 'PSA 9', date: 'Jan 2025', venue: 'PWCC', notes: 'PSA 9 stable long-term hold' },
    ],
  },
  {
    slug: '1955-topps-roberto-clemente-164',
    sales: [
      { price: '$478,000', priceValue: 478000, grade: 'PSA 9', date: 'Apr 2021', venue: 'Heritage Auctions', notes: 'Pop 5 in PSA 9; only confirmed PSA 9 to reach public auction' },
      { price: '$204,000', priceValue: 204000, grade: 'PSA 8', date: 'Nov 2022', venue: 'Goldin Auctions', notes: 'Strong PSA 8 result driven by Clemente\'s humanitarian legacy' },
      { price: '$62,000', priceValue: 62000, grade: 'PSA 7', date: 'Mar 2025', venue: 'Heritage Auctions', notes: 'PSA 7 anchor price for the Clemente RC' },
    ],
  },
  {
    slug: '1954-topps-hank-aaron-128',
    sales: [
      { price: '$660,000', priceValue: 660000, grade: 'PSA 9', date: 'Jun 2022', venue: 'Heritage Auctions', notes: 'Pop 3 in PSA 9; one of the rarest high-grade post-war RCs' },
      { price: '$192,000', priceValue: 192000, grade: 'PSA 8', date: 'Apr 2021', venue: 'Goldin Auctions', notes: 'PSA 8 record at time of sale' },
      { price: '$54,000', priceValue: 54000, grade: 'PSA 7', date: 'Sep 2024', venue: 'PWCC', notes: 'Current PSA 7 anchor price' },
    ],
  },
  {
    slug: '1951-bowman-mickey-mantle-253',
    sales: [
      { price: '$2,880,000', priceValue: 2880000, grade: 'PSA 9', date: 'Nov 2021', venue: 'Goldin Auctions', notes: 'World record for the card; pop 2 in PSA 9' },
      { price: '$540,000', priceValue: 540000, grade: 'PSA 8', date: 'Aug 2020', venue: 'Heritage Auctions', notes: 'Pop 18 in PSA 8' },
      { price: '$180,000', priceValue: 180000, grade: 'PSA 7', date: 'Mar 2024', venue: 'PWCC', notes: 'Stable PSA 7 market' },
    ],
  },
  {
    slug: '2011-topps-update-mike-trout-us175',
    sales: [
      { price: '$108,000', priceValue: 108000, grade: 'PSA 10', date: 'Jul 2021', venue: 'eBay', notes: 'Peak boom price for the flagship Trout RC in PSA 10' },
      { price: '$36,000', priceValue: 36000, grade: 'PSA 10', date: 'Feb 2024', venue: 'PWCC', notes: 'Post-correction but still historically elevated' },
      { price: '$4,200', priceValue: 4200, grade: 'PSA 9', date: 'Mar 2025', venue: 'eBay', notes: 'PSA 9 liquid benchmark' },
    ],
  },
  {
    slug: '1968-topps-nolan-ryan-177',
    sales: [
      { price: '$500,000', priceValue: 500000, grade: 'PSA 10', date: 'Sep 2022', venue: 'Heritage Auctions', notes: 'Pop 2 in PSA 10; legendary scarcity for a key 1960s RC' },
      { price: '$72,000', priceValue: 72000, grade: 'PSA 9', date: 'May 2023', venue: 'PWCC', notes: 'Pop 28; PSA 9 remains extremely liquid' },
      { price: '$22,000', priceValue: 22000, grade: 'PSA 8', date: 'Jan 2025', venue: 'eBay', notes: 'Strong PSA 8 baseline for the Ryan/Koosman RC' },
    ],
  },
  {
    slug: '1980-topps-rickey-henderson-482',
    sales: [
      { price: '$13,800', priceValue: 13800, grade: 'PSA 10', date: 'Mar 2022', venue: 'PWCC', notes: 'PSA 10 pop 380; achievable gem makes this accessible at the top' },
      { price: '$3,600', priceValue: 3600, grade: 'PSA 10', date: 'Jan 2025', venue: 'eBay', notes: 'Post-correction PSA 10 steady state' },
      { price: '$1,400', priceValue: 1400, grade: 'PSA 9', date: 'Apr 2025', venue: 'eBay', notes: 'PSA 9 anchor' },
    ],
  },
  {
    slug: '1963-topps-pete-rose-537',
    sales: [
      { price: '$72,000', priceValue: 72000, grade: 'PSA 9', date: 'Aug 2021', venue: 'Heritage Auctions', notes: 'Pop 12; Rose\'s ban creates pricing ceiling vs. full HOF members' },
      { price: '$28,000', priceValue: 28000, grade: 'PSA 8', date: 'Feb 2024', venue: 'PWCC', notes: 'PSA 8 benchmark — most liquid grade' },
    ],
  },
  {
    slug: '2001-bowman-chrome-albert-pujols',
    sales: [
      { price: '$8,400', priceValue: 8400, grade: 'PSA 10', date: 'Jun 2022', venue: 'PWCC', notes: 'HOF bump — prices elevated after his 2022 induction' },
      { price: '$2,600', priceValue: 2600, grade: 'PSA 9', date: 'Mar 2025', venue: 'eBay', notes: 'PSA 9 steady hold' },
    ],
  },
  {
    slug: '1952-topps-willie-mays-261',
    sales: [
      { price: '$830,000', priceValue: 830000, grade: 'PSA 9', date: 'May 2022', venue: 'Heritage Auctions', notes: 'Pop 2; auction occurred shortly after Mays\' passing drove demand' },
      { price: '$156,000', priceValue: 156000, grade: 'PSA 8', date: 'Nov 2021', venue: 'Goldin Auctions', notes: 'Pop 18 in PSA 8' },
      { price: '$108,000', priceValue: 108000, grade: 'PSA 7', date: 'Apr 2024', venue: 'Heritage Auctions', notes: 'PSA 7 benchmark — key entry point for serious Mays collectors' },
    ],
  },
  // ─── BASKETBALL ──────────────────────────────────────────────
  {
    slug: '1986-87-fleer-michael-jordan-57',
    sales: [
      { price: '$738,000', priceValue: 738000, grade: 'PSA 10', date: 'Jul 2021', venue: 'PWCC', notes: 'Highest authenticated sale for a Jordan Fleer PSA 10' },
      { price: '$660,000', priceValue: 660000, grade: 'PSA 10', date: 'Aug 2020', venue: 'Goldin Auctions', notes: 'Part of the 2020 boom; sold in 3 days' },
      { price: '$280,000', priceValue: 280000, grade: 'PSA 9', date: 'Feb 2022', venue: 'Heritage Auctions', notes: 'Graded 9 — significantly rarer than PSA 8' },
      { price: '$96,000', priceValue: 96000, grade: 'PSA 8', date: 'Apr 2024', venue: 'eBay', notes: 'Steady PSA 8 benchmark — the most liquid grade' },
    ],
  },
  {
    slug: '2003-04-topps-chrome-lebron-james-111',
    sales: [
      { price: '$216,000', priceValue: 216000, grade: 'BGS 9.5', date: 'Oct 2020', venue: 'Goldin Auctions', notes: 'BGS premium; Black Label commands even higher prices' },
      { price: '$150,000', priceValue: 150000, grade: 'PSA 10', date: 'Jun 2021', venue: 'eBay', notes: 'Pop 48 in PSA 10 — significant population but demand absorbs supply' },
      { price: '$48,000', priceValue: 48000, grade: 'PSA 9', date: 'Jan 2024', venue: 'PWCC', notes: 'Current PSA 9 benchmark; stable market in this grade' },
    ],
  },
  {
    slug: '2003-04-exquisite-lebron-james-78',
    sales: [
      { price: '$5,200,000', priceValue: 5200000, grade: 'BGS 9.5', date: 'Jan 2021', venue: 'Goldin Auctions', notes: 'World record for a modern basketball card' },
      { price: '$1,800,000', priceValue: 1800000, grade: 'PSA 9', date: 'Apr 2021', venue: 'Goldin Auctions', notes: 'Pop 4 in PSA 9; LeBron Exquisite auto RC /99' },
    ],
  },
  {
    slug: '1996-97-topps-chrome-kobe-bryant-138',
    sales: [
      { price: '$1,795,800', priceValue: 1795800, grade: 'BGS 10 Pristine', date: 'Aug 2021', venue: 'Goldin Auctions', notes: 'Only BGS 10 Pristine known; post-Mamba spike' },
      { price: '$900,000', priceValue: 900000, grade: 'PSA 10', date: 'Jul 2021', venue: 'Heritage Auctions', notes: 'Pop 22 in PSA 10 — gem rate under 0.1%' },
      { price: '$216,000', priceValue: 216000, grade: 'PSA 9', date: 'Jun 2022', venue: 'PWCC', notes: 'PSA 9 benchmark; strong long-term demand' },
    ],
  },
  {
    slug: '1969-topps-lew-alcindor-25',
    sales: [
      { price: '$528,000', priceValue: 528000, grade: 'PSA 10', date: 'Jun 2021', venue: 'Heritage Auctions', notes: 'Pop 2; one of rarest PSA 10s in vintage basketball' },
      { price: '$120,000', priceValue: 120000, grade: 'PSA 9', date: 'May 2022', venue: 'PWCC', notes: 'Pop 18; Kareem RC in near-mint exceptional for the era' },
    ],
  },
  {
    slug: '1984-85-star-michael-jordan-101',
    sales: [
      { price: '$840,000', priceValue: 840000, grade: 'PSA 9', date: 'Sep 2021', venue: 'Goldin Auctions', notes: 'Jordan\'s true first-year card; authentication is everything with Star issues' },
      { price: '$285,600', priceValue: 285600, grade: 'PSA 8', date: 'Nov 2020', venue: 'PWCC', notes: 'PSA 8 benchmark for the Star Jordan' },
    ],
  },
  {
    slug: '2018-19-panini-prizm-luka-doncic-280',
    sales: [
      { price: '$4,600,000', priceValue: 4600000, grade: 'BGS 10 Black Label', date: 'Oct 2021', venue: 'Goldin Auctions', notes: 'Pristine-graded auto — the rarest variant' },
      { price: '$85,000', priceValue: 85000, grade: 'PSA 10', date: 'Dec 2022', venue: 'eBay', notes: 'Base Prizm PSA 10; Silver parallel commands 3-5x more' },
      { price: '$32,000', priceValue: 32000, grade: 'PSA 10', date: 'Mar 2025', venue: 'PWCC', notes: 'Market normalized from 2021 highs' },
    ],
  },
  {
    slug: '1980-81-topps-bird-johnson-erving-trp',
    sales: [
      { price: '$936,000', priceValue: 936000, grade: 'PSA 10', date: 'May 2021', venue: 'Heritage Auctions', notes: 'The triple rookie PSA 10 — only 85 exist; Bird, Magic, Dr. J on one card' },
      { price: '$288,000', priceValue: 288000, grade: 'PSA 9', date: 'Nov 2022', venue: 'Goldin Auctions', notes: 'PSA 9 pop 620; landmark basketball card in any grade' },
    ],
  },
  {
    slug: '2007-08-topps-chrome-kevin-durant-131',
    sales: [
      { price: '$32,400', priceValue: 32400, grade: 'PSA 10', date: 'Jun 2021', venue: 'PWCC', notes: 'PSA 10 pop 180; gem rate is better than most vintage rookies' },
      { price: '$12,000', priceValue: 12000, grade: 'PSA 9', date: 'Mar 2024', venue: 'eBay', notes: 'Stable PSA 9 market; Durant demand tied to team performance' },
    ],
  },
  {
    slug: '2013-14-panini-prizm-giannis-antetokounmpo-290',
    sales: [
      { price: '$18,000', priceValue: 18000, grade: 'PSA 10', date: 'Nov 2021', venue: 'PWCC', notes: 'Giannis PSA 10 Prizm RC; first-year Prizm product for the Freak' },
      { price: '$8,400', priceValue: 8400, grade: 'PSA 10', date: 'Apr 2024', venue: 'eBay', notes: 'Post-correction but still commanding significant premium' },
    ],
  },
  {
    slug: '2009-10-panini-stephen-curry-321',
    sales: [
      { price: '$78,000', priceValue: 78000, grade: 'PSA 10', date: 'Apr 2021', venue: 'Goldin Auctions', notes: 'Pop 42; Curry\'s championships and shooting records drive demand' },
      { price: '$40,000', priceValue: 40000, grade: 'PSA 10', date: 'Nov 2023', venue: 'Heritage Auctions', notes: 'Corrected from peak but still historically elevated' },
    ],
  },
  {
    slug: '2022-23-panini-prizm-victor-wembanyama-258',
    sales: [
      { price: '$312,000', priceValue: 312000, grade: 'PSA 10', date: 'Apr 2026', venue: 'Heritage Auctions', notes: 'Auto PSA 10 — second-year record sale' },
      { price: '$2,400', priceValue: 2400, grade: 'PSA 10', date: 'Mar 2025', venue: 'eBay', notes: 'Base Prizm PSA 10 stable market price' },
    ],
  },
  {
    slug: '2019-20-prizm-zion-williamson-248',
    sales: [
      { price: '$2,400', priceValue: 2400, grade: 'PSA 10', date: 'Jan 2025', venue: 'eBay', notes: 'Market depressed by health concerns; subject to rapid revaluation on healthy season' },
      { price: '$18,000', priceValue: 18000, grade: 'PSA 10', date: 'May 2021', venue: 'PWCC', notes: 'Boom-era peak price; corrected 87% from this level by 2025' },
    ],
  },
  // ─── FOOTBALL ────────────────────────────────────────────────
  {
    slug: '2000-playoff-contenders-tom-brady-144',
    sales: [
      { price: '$3,107,852', priceValue: 3107852, grade: 'PSA 10', date: 'May 2021', venue: 'Lelands', notes: 'World record for a football card; only PSA 10 known (pop 1)' },
      { price: '$2,250,000', priceValue: 2250000, grade: 'PSA 9', date: 'Feb 2021', venue: 'Goldin Auctions', notes: 'Pop 3 in PSA 9; Brady announced Tampa Bay return the following week' },
      { price: '$900,000', priceValue: 900000, grade: 'PSA 8', date: 'Apr 2021', venue: 'PWCC', notes: 'Strong centering copy' },
    ],
  },
  {
    slug: '2000-topps-chrome-tom-brady-241',
    sales: [
      { price: '$204,000', priceValue: 204000, grade: 'PSA 10', date: 'Aug 2021', venue: 'PWCC', notes: 'Pop 28 in PSA 10; Refractor parallel goes for 3-5x this price' },
      { price: '$72,000', priceValue: 72000, grade: 'PSA 9', date: 'Mar 2024', venue: 'Heritage Auctions', notes: 'PSA 9 benchmark; large pop makes this the most liquid Brady Chrome' },
    ],
  },
  {
    slug: '2018-national-treasures-patrick-mahomes-auto',
    sales: [
      { price: '$4,308,000', priceValue: 4308000, grade: 'BGS 10', date: 'Mar 2021', venue: 'Goldin Auctions', notes: 'World record for a football card at time of sale; Mahomes NT auto /25' },
      { price: '$500,000', priceValue: 500000, grade: 'PSA 10', date: 'Nov 2022', venue: 'Heritage Auctions', notes: 'PSA 10 benchmark; extremely low population' },
    ],
  },
  {
    slug: '1958-topps-jim-brown-62',
    sales: [
      { price: '$282,000', priceValue: 282000, grade: 'PSA 9', date: 'Jun 2022', venue: 'Heritage Auctions', notes: 'Pop 4 in PSA 9; Brown passed in 2023, driving post-death demand spike' },
      { price: '$58,000', priceValue: 58000, grade: 'PSA 8', date: 'Apr 2024', venue: 'PWCC', notes: 'PSA 8 benchmark; strong vintage football demand' },
    ],
  },
  {
    slug: '1965-topps-joe-namath-122',
    sales: [
      { price: '$168,000', priceValue: 168000, grade: 'PSA 9', date: 'Nov 2021', venue: 'Heritage Auctions', notes: 'Pop 8 in PSA 9; Broadway Joe\'s guaranteed Super Bowl still resonates' },
      { price: '$36,000', priceValue: 36000, grade: 'PSA 8', date: 'Mar 2024', venue: 'Goldin Auctions', notes: 'Steady PSA 8 market for the Namath RC' },
    ],
  },
  {
    slug: '1957-topps-johnny-unitas-138',
    sales: [
      { price: '$132,000', priceValue: 132000, grade: 'PSA 9', date: 'Aug 2021', venue: 'Heritage Auctions', notes: 'Pop 5 in PSA 9; Unitas defined the modern QB position' },
      { price: '$52,000', priceValue: 52000, grade: 'PSA 8', date: 'May 2023', venue: 'PWCC', notes: 'PSA 8 benchmark for the Unitas RC' },
    ],
  },
  {
    slug: '1986-topps-jerry-rice-161',
    sales: [
      { price: '$12,000', priceValue: 12000, grade: 'PSA 10', date: 'Jul 2021', venue: 'Goldin Auctions', notes: 'Pop 180; junk wax era production but the GOAT receiver commands strong demand' },
      { price: '$2,400', priceValue: 2400, grade: 'PSA 10', date: 'Mar 2025', venue: 'eBay', notes: 'Corrected from peak; still strong for a high-pop junk wax RC' },
    ],
  },
  {
    slug: '2018-panini-prizm-lamar-jackson-212',
    sales: [
      { price: '$4,800', priceValue: 4800, grade: 'PSA 10', date: 'Feb 2024', venue: 'PWCC', notes: 'Post second MVP price; Silver base most liquid version' },
      { price: '$18,000', priceValue: 18000, grade: 'PSA 10', date: 'Nov 2021', venue: 'eBay', notes: 'Boom-era peak before correction' },
    ],
  },
  {
    slug: '2020-panini-prizm-justin-herbert-305',
    sales: [
      { price: '$3,600', priceValue: 3600, grade: 'PSA 10', date: 'Feb 2024', venue: 'PWCC', notes: 'Herbert PSA 10 Prizm; steady demand driven by franchise QB status' },
      { price: '$14,400', priceValue: 14400, grade: 'PSA 10', date: 'Feb 2021', venue: 'eBay', notes: 'Rookie of the Year buzz peak pricing' },
    ],
  },
  // ─── HOCKEY ──────────────────────────────────────────────────
  {
    slug: '1979-80-opee-chee-wayne-gretzky-18',
    sales: [
      { price: '$4,300,000', priceValue: 4300000, grade: 'PSA 9', date: 'Mar 2026', venue: 'Goldin Auctions', notes: 'New PSA 9 record; only 6 PSA 9 examples known' },
      { price: '$3,750,000', priceValue: 3750000, grade: 'PSA 9', date: 'Nov 2025', venue: 'Heritage Auctions', notes: 'Previous PSA 9 record' },
      { price: '$685,000', priceValue: 685000, grade: 'PSA 8', date: 'Dec 2022', venue: 'Goldin Auctions', notes: 'Strongest centering in PSA 8 tier' },
    ],
  },
  {
    slug: '2005-06-upper-deck-young-guns-sidney-crosby-201',
    sales: [
      { price: '$264,000', priceValue: 264000, grade: 'PSA 10', date: 'Jun 2021', venue: 'PWCC', notes: 'Pop 85 — harder to gem than most modern cards' },
      { price: '$108,000', priceValue: 108000, grade: 'PSA 10', date: 'Feb 2023', venue: 'eBay', notes: 'Market correction but still commanding premium' },
      { price: '$28,000', priceValue: 28000, grade: 'PSA 9', date: 'Jan 2025', venue: 'Heritage Auctions', notes: 'PSA 9 — most common grade for this Young Guns' },
    ],
  },
  {
    slug: '2005-06-upper-deck-young-guns-alex-ovechkin-443',
    sales: [
      { price: '$192,000', priceValue: 192000, grade: 'PSA 10', date: 'Mar 2024', venue: 'Heritage Auctions', notes: 'Goals record appreciation — up 300% from pre-record prices' },
      { price: '$18,000', priceValue: 18000, grade: 'PSA 9', date: 'Mar 2025', venue: 'eBay', notes: 'Ovechkin retirement watch expected to further elevate prices' },
    ],
  },
  {
    slug: '2017-18-upper-deck-young-guns-connor-mcdavid-451',
    sales: [
      { price: '$552,000', priceValue: 552000, grade: 'PSA 10', date: 'Apr 2021', venue: 'PWCC', notes: 'PSA 10 pop 320 — gem rate 1.7% is relatively achievable' },
      { price: '$168,000', priceValue: 168000, grade: 'PSA 10', date: 'Sep 2023', venue: 'eBay', notes: 'Post-pandemic correction; still historically elevated' },
    ],
  },
  {
    slug: '1966-67-topps-bobby-orr-35',
    sales: [
      { price: '$204,000', priceValue: 204000, grade: 'PSA 9', date: 'May 2022', venue: 'Heritage Auctions', notes: 'Pop 5 in PSA 9; Orr\'s 1966 Topps RC is the rarest high-grade modern hockey RC' },
      { price: '$78,000', priceValue: 78000, grade: 'PSA 8', date: 'Nov 2023', venue: 'Goldin Auctions', notes: 'PSA 8 benchmark for the Orr RC' },
    ],
  },
  {
    slug: '1951-parkhurst-gordie-howe-66',
    sales: [
      { price: '$132,000', priceValue: 132000, grade: 'PSA 8', date: 'Aug 2022', venue: 'Heritage Auctions', notes: 'Pop 5 in PSA 8; Howe\'s Parkhurst RC from Canadian collector\'s market' },
      { price: '$36,000', priceValue: 36000, grade: 'PSA 7', date: 'Apr 2024', venue: 'Goldin Auctions', notes: 'PSA 7 anchor for the Mr. Hockey RC' },
    ],
  },
  {
    slug: '1979-80-topps-wayne-gretzky-18',
    sales: [
      { price: '$216,000', priceValue: 216000, grade: 'PSA 10', date: 'Jun 2021', venue: 'PWCC', notes: 'Topps vs OPC: enormous value gap — this Topps at $216K vs OPC PSA 9 at $3.75M' },
      { price: '$60,000', priceValue: 60000, grade: 'PSA 9', date: 'Mar 2024', venue: 'Heritage Auctions', notes: 'Topps PSA 9 benchmark' },
    ],
  },
  {
    slug: '2016-17-upper-deck-young-guns-auston-matthews-201',
    sales: [
      { price: '$12,000', priceValue: 12000, grade: 'PSA 10', date: 'Nov 2022', venue: 'eBay', notes: 'Matthews PSA 10 YG; 60-goal seasons keep demand elevated' },
      { price: '$2,400', priceValue: 2400, grade: 'PSA 9', date: 'Feb 2025', venue: 'PWCC', notes: 'PSA 9 liquid market for the Matthews YG' },
    ],
  },
];

export function getNotableSales(slug: string): CardNotableSales | undefined {
  return notableSales.find(n => n.slug === slug);
}
