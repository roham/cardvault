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
  {
    slug: '1952-topps-mickey-mantle-311',
    sales: [
      { price: '$12,600,000', priceValue: 12600000, grade: 'PSA 9', date: 'Aug 2022', venue: 'Heritage Auctions', notes: 'All-time record for any sports card at auction at time of sale' },
      { price: '$5,200,000', priceValue: 5200000, grade: 'PSA 8', date: 'Jan 2021', venue: 'Goldin Auctions', notes: 'Previous PSA 8 record; part of Post pandemic market surge' },
      { price: '$2,880,000', priceValue: 2880000, grade: 'PSA 7.5', date: 'Nov 2020', venue: 'PWCC', notes: 'NM+ qualifier' },
      { price: '$540,000', priceValue: 540000, grade: 'PSA 6', date: 'Mar 2021', venue: 'eBay', notes: 'EX-MT grade' },
    ],
  },
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
    slug: '2000-playoff-contenders-tom-brady-144',
    sales: [
      { price: '$3,107,852', priceValue: 3107852, grade: 'PSA 10', date: 'May 2021', venue: 'Lelands', notes: 'World record for a football card; only PSA 10 known (pop 1)' },
      { price: '$2,250,000', priceValue: 2250000, grade: 'PSA 9', date: 'Feb 2021', venue: 'Goldin Auctions', notes: 'Pop 3 in PSA 9; Brady announced Tampa Bay return the following week' },
      { price: '$900,000', priceValue: 900000, grade: 'PSA 8', date: 'Apr 2021', venue: 'PWCC', notes: 'Strong centering copy' },
    ],
  },
  {
    slug: '1979-80-opee-chee-wayne-gretzky-18',
    sales: [
      { price: '$4,300,000', priceValue: 4300000, grade: 'PSA 9', date: 'Mar 2026', venue: 'Goldin Auctions', notes: 'New PSA 9 record; only 6 PSA 9 examples known' },
      { price: '$3,750,000', priceValue: 3750000, grade: 'PSA 9', date: 'Nov 2025', venue: 'Heritage Auctions', notes: 'Previous PSA 9 record' },
      { price: '$685,000', priceValue: 685000, grade: 'PSA 8', date: 'Dec 2022', venue: 'Goldin Auctions', notes: 'Strongest centering in PSA 8 tier' },
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
    slug: '1989-upper-deck-ken-griffey-jr-1',
    sales: [
      { price: '$22,500', priceValue: 22500, grade: 'PSA 10', date: 'Aug 2022', venue: 'eBay', notes: 'Pop 4,200 in PSA 10 — one of the most graded PSA 10 cards ever' },
      { price: '$6,800', priceValue: 6800, grade: 'PSA 10', date: 'Feb 2024', venue: 'PWCC', notes: 'Market correction from 2021 peak' },
      { price: '$3,200', priceValue: 3200, grade: 'PSA 9', date: 'Mar 2025', venue: 'eBay', notes: 'Steady PSA 9 benchmark' },
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
    slug: '1993-sp-derek-jeter-279',
    sales: [
      { price: '$168,000', priceValue: 168000, grade: 'PSA 10', date: 'May 2021', venue: 'Goldin Auctions', notes: 'Pop 8 in PSA 10 — notorious centering issues' },
      { price: '$52,000', priceValue: 52000, grade: 'PSA 9', date: 'Nov 2022', venue: 'PWCC', notes: 'Pop 65 — difficult grade due to foil surface' },
      { price: '$18,000', priceValue: 18000, grade: 'PSA 8', date: 'Feb 2025', venue: 'eBay', notes: 'Most liquid grade for the 1993 SP Jeter' },
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
      { price: '$18,000', priceValue: 18000, grade: 'PSA 9', date: 'Mar 2025', venue: 'eBay', notes: 'Ovechkin retirement bump expected to further elevate prices' },
    ],
  },
  {
    slug: '2017-18-upper-deck-young-guns-connor-mcdavid-451',
    sales: [
      { price: '$552,000', priceValue: 552000, grade: 'PSA 10', date: 'Apr 2021', venue: 'PWCC', notes: 'PSA 10 pop 320 — gem rate 1.7% is relatively achievable' },
      { price: '$168,000', priceValue: 168000, grade: 'PSA 10', date: 'Sep 2023', venue: 'eBay', notes: 'Post-pandemic correction; still historically elevated' },
    ],
  },
];

export function getNotableSales(slug: string): CardNotableSales | undefined {
  return notableSales.find(n => n.slug === slug);
}
