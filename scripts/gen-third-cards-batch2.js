// Batch 2: Third cards for remaining 2-card players
const thirdCards = [
  // BASEBALL
  { player: 'Willie McCovey', year: 1962, set: '1962 Topps', number: '544', sport: 'baseball', value_raw: '$50-$200 (PSA 6)', value_gem: '$3,000+ (PSA 9)', desc: "Stretch McCovey's 1962 Topps high-number card. 521 career homers and the 1969 NL MVP. One of the most feared left-handed hitters ever.", rookie: false },
  { player: 'Walter Johnson', year: 1912, set: '1912 T207 Brown Background', number: 'N/A', sport: 'baseball', value_raw: '$3,000-$10,000 (PSA 2)', value_gem: '$80,000+ (PSA 7)', desc: "The Big Train's T207 brown-background tobacco card. Johnson's 417 wins and 110 shutouts are records that will never be broken.", rookie: false },
  { player: 'Robin Yount', year: 1975, set: '1975 Topps Mini', number: '223', sport: 'baseball', value_raw: '$60-$250 (PSA 7)', value_gem: '$8,000+ (PSA 10)', desc: "Yount's Topps Mini rookie — the scarcer mini version. Two MVPs, 3,142 hits, and a Hall of Fame career at age 18 debut.", rookie: true },
  { player: 'Ryan Braun', year: 2007, set: '2007 Topps Chrome', number: '238', sport: 'baseball', value_raw: '$5-$15 (PSA 9)', value_gem: '$80+ (PSA 10)', desc: "Braun's Chrome rookie from his NL Rookie of the Year season. A complicated legacy but undeniable on-field talent.", rookie: true },
  { player: 'Matt Olson', year: 2018, set: '2018 Topps Series 1', number: '233', sport: 'baseball', value_raw: '$3-$10 (PSA 9)', value_gem: '$40+ (PSA 10)', desc: "Olson's flagship Topps rookie. One of the premier power hitters in baseball with elite defense at first base.", rookie: true },
  { player: 'Marcus Semien', year: 2014, set: '2014 Topps Update', number: 'US182', sport: 'baseball', value_raw: '$2-$5 (PSA 9)', value_gem: '$20+ (PSA 10)', desc: "Semien's flagship rookie. Transformed from a solid shortstop into one of the best second basemen in baseball.", rookie: true },
  { player: 'Joe Carter', year: 1984, set: '1984 Fleer', number: '95', sport: 'baseball', value_raw: '$3-$10 (PSA 8)', value_gem: '$60+ (PSA 10)', desc: "Joe Carter hit the walk-off home run to win the 1993 World Series — one of the most iconic moments in baseball history.", rookie: true },
  { player: 'Jim Palmer', year: 1967, set: '1967 Topps', number: '475', sport: 'baseball', value_raw: '$30-$100 (PSA 6)', value_gem: '$2,000+ (PSA 9)', desc: "Palmer's 1967 Topps. The Orioles ace won three Cy Young Awards and pitched in six World Series.", rookie: false },
  { player: 'Joe Morgan', year: 1966, set: '1966 Topps', number: '195', sport: 'baseball', value_raw: '$20-$60 (PSA 6)', value_gem: '$1,500+ (PSA 9)', desc: "Little Joe's second Topps card. Back-to-back MVPs with the Big Red Machine. The greatest second baseman in baseball history.", rookie: false },
  { player: 'Jimmie Foxx', year: 1934, set: '1934 Goudey', number: '1', sport: 'baseball', value_raw: '$1,500-$5,000 (PSA 4)', value_gem: '$60,000+ (PSA 8)', desc: "Double X's 1934 Goudey — card #1 in the set. Three MVP awards and 534 home runs.", rookie: false },
  { player: 'Mike Schmidt', year: 1974, set: '1974 Topps', number: '283', sport: 'baseball', value_raw: '$20-$60 (PSA 7)', value_gem: '$1,000+ (PSA 10)', desc: "Schmidt's second-year Topps card. The greatest third baseman in baseball history with 548 home runs and three MVP awards.", rookie: false },

  // BASKETBALL
  { player: 'Tyrese Maxey', year: 2020, set: '2020-21 Panini Mosaic', number: '217', sport: 'basketball', value_raw: '$10-$30 (PSA 9)', value_gem: '$150+ (PSA 10)', desc: "Maxey's Mosaic rookie. The Sixers guard emerged as a franchise cornerstone alongside Embiid.", rookie: true },
  { player: 'Tyler Herro', year: 2019, set: '2019-20 Panini Mosaic', number: '223', sport: 'basketball', value_raw: '$5-$15 (PSA 9)', value_gem: '$100+ (PSA 10)', desc: "Herro's Mosaic rookie. The Bubble playoff hero proved himself on the biggest stage as a 20-year-old.", rookie: true },
  { player: 'Pete Maravich', year: 1971, set: '1971-72 Topps', number: '55', sport: 'basketball', value_raw: '$80-$300 (PSA 5)', value_gem: '$5,000+ (PSA 9)', desc: "Pistol Pete's second-year Topps card. The most creative scorer in basketball history averaged 44.2 points per game in college.", rookie: false },
  { player: 'John Wall', year: 2010, set: '2010-11 Panini Prizm', number: '1', sport: 'basketball', value_raw: '$5-$15 (PSA 9)', value_gem: '$80+ (PSA 10)', desc: "Wall's Prizm rookie. The #1 pick was the most explosive point guard in the NBA before injuries changed his trajectory.", rookie: true },
  { player: 'Jalen Green', year: 2021, set: '2021-22 Panini Mosaic', number: '201', sport: 'basketball', value_raw: '$3-$10 (PSA 9)', value_gem: '$50+ (PSA 10)', desc: "Green's Mosaic rookie. The Rockets guard has one of the most explosive scoring packages in the young NBA generation.", rookie: true },
  { player: 'Jalen Williams', year: 2022, set: '2022-23 Panini Prizm', number: '203', sport: 'basketball', value_raw: '$5-$15 (PSA 9)', value_gem: '$80+ (PSA 10)', desc: "Williams' Prizm rookie. The Thunder wing emerged as one of the most complete young players in the NBA.", rookie: true },
  { player: 'Keegan Murray', year: 2022, set: '2022-23 Panini Prizm', number: '246', sport: 'basketball', value_raw: '$2-$5 (PSA 9)', value_gem: '$30+ (PSA 10)', desc: "Murray's Prizm rookie. The Kings forward showed why he was a lottery pick with efficient scoring from day one.", rookie: true },
  { player: 'RJ Barrett', year: 2019, set: '2019-20 Panini Mosaic', number: '218', sport: 'basketball', value_raw: '$3-$8 (PSA 9)', value_gem: '$40+ (PSA 10)', desc: "Barrett's Mosaic rookie. The former Duke star and #3 pick brought hope to the Raptors after his trade from New York.", rookie: true },

  // FOOTBALL
  { player: 'Reggie White', year: 1987, set: '1987 Topps', number: '301', sport: 'football', value_raw: '$10-$30 (PSA 7)', value_gem: '$300+ (PSA 10)', desc: "The Minister of Defense's second-year Topps card. Already dominating — 198 career sacks and the most feared pass rusher ever.", rookie: false },
  { player: 'Otto Graham', year: 1951, set: '1951 Bowman', number: '2', sport: 'football', value_raw: '$400-$1,500 (PSA 4)', value_gem: '$20,000+ (PSA 8)', desc: "Otto Graham's 1951 Bowman. 7 championship games in 10 seasons — the most dominant QB run in football history.", rookie: false },
  { player: 'Johnny Unitas', year: 1959, set: '1959 Topps', number: '1', sport: 'football', value_raw: '$200-$600 (PSA 5)', value_gem: '$10,000+ (PSA 9)', desc: "The Golden Arm's 1959 Topps — card #1 in the set. Unitas revolutionized the QB position and played in The Greatest Game Ever Played.", rookie: false },
  { player: 'Sauce Gardner', year: 2022, set: '2022 Panini Prizm', number: '308', sport: 'football', value_raw: '$10-$30 (PSA 9)', value_gem: '$150+ (PSA 10)', desc: "Sauce's Prizm rookie. The Jets cornerback won Defensive Rookie of the Year and was immediately one of the NFL's best cover corners.", rookie: true },
  { player: 'Kenneth Walker III', year: 2022, set: '2022 Panini Prizm', number: '354', sport: 'football', value_raw: '$5-$15 (PSA 9)', value_gem: '$80+ (PSA 10)', desc: "Walker's Prizm rookie. The Seahawks running back burst onto the scene with explosive speed and vision.", rookie: true },
  { player: 'Jordan Addison', year: 2023, set: '2023 Panini Prizm', number: '301', sport: 'football', value_raw: '$5-$15 (PSA 9)', value_gem: '$80+ (PSA 10)', desc: "Addison's Prizm rookie. The Vikings receiver showed elite route-running from day one in the NFL.", rookie: true },
  { player: 'Jordan Love', year: 2020, set: '2020 Panini Mosaic', number: '211', sport: 'football', value_raw: '$5-$15 (PSA 9)', value_gem: '$80+ (PSA 10)', desc: "Love's Mosaic rookie. The Packers QB stepped out of Rodgers' shadow to become a franchise quarterback.", rookie: true },
  { player: 'Khalil Mack', year: 2014, set: '2014 Panini Prizm', number: '267', sport: 'football', value_raw: '$3-$8 (PSA 9)', value_gem: '$40+ (PSA 10)', desc: "Mack's Prizm rookie. The Defensive Player of the Year (2016) has been one of the NFL's most feared pass rushers for a decade.", rookie: true },
  { player: 'Jared Verse', year: 2024, set: '2024 Panini Prizm', number: '320', sport: 'football', value_raw: '$5-$15 (PSA 9)', value_gem: '$80+ (PSA 10)', desc: "Verse's Prizm rookie. The Rams edge rusher won Defensive Rookie of the Year with an immediate impact.", rookie: true },

  // HOCKEY
  { player: 'Nicklas Lidstrom', year: 1991, set: '1991-92 Upper Deck', number: '26', sport: 'hockey', value_raw: '$5-$15 (PSA 8)', value_gem: '$200+ (PSA 10)', desc: "The Perfect Human's UD rookie. Lidstrom won 7 Norris Trophies as the NHL's best defenseman — a record. Four Stanley Cups with Detroit.", rookie: true },
  { player: 'Tim Stützle', year: 2020, set: '2020-21 Upper Deck', number: '201', sport: 'hockey', value_raw: '$5-$15 (PSA 9)', value_gem: '$80+ (PSA 10)', desc: "Stützle's base UD card. The German forward is one of the most exciting young centers in the NHL.", rookie: false },
  { player: 'Mike Bossy', year: 1978, set: '1978-79 Topps', number: '115', sport: 'hockey', value_raw: '$50-$150 (PSA 6)', value_gem: '$3,000+ (PSA 9)', desc: "Bossy's Topps card from his 53-goal rookie season. 573 goals in 752 games — the highest goals-per-game rate in modern NHL history.", rookie: false },
  { player: 'Ken Dryden', year: 1972, set: '1972-73 OPC', number: '145', sport: 'hockey', value_raw: '$50-$200 (PSA 5)', value_gem: '$2,000+ (PSA 9)', desc: "Dryden's second OPC card. The Canadiens goalie won 6 Stanley Cups in 8 seasons, then retired at 31 to become a lawyer.", rookie: false },
  { player: 'Moritz Seider', year: 2021, set: '2021-22 Upper Deck Young Guns', number: '451', sport: 'hockey', value_raw: '$10-$30 (PSA 9)', value_gem: '$200+ (PSA 10)', desc: "Seider's Young Guns rookie. The Calder Trophy winner brought elite two-way defense to Detroit immediately.", rookie: true },
  { player: 'Paul Kariya', year: 1993, set: '1993-94 Upper Deck', number: '233', sport: 'hockey', value_raw: '$3-$10 (PSA 8)', value_gem: '$100+ (PSA 10)', desc: "Kariya's UD rookie. The Mighty Ducks franchise player was one of the most skilled and fastest players of his generation.", rookie: true },
  { player: 'Tyler Seguin', year: 2010, set: '2010-11 Upper Deck Young Guns', number: '245', sport: 'hockey', value_raw: '$10-$30 (PSA 9)', value_gem: '$200+ (PSA 10)', desc: "Seguin's Young Guns rookie. The #2 pick won a Stanley Cup as a rookie and became one of the NHL's most prolific scorers.", rookie: true },
  { player: 'Quinton Byfield', year: 2021, set: '2021-22 Upper Deck Young Guns', number: '469', sport: 'hockey', value_raw: '$5-$15 (PSA 9)', value_gem: '$80+ (PSA 10)', desc: "Byfield's Young Guns rookie. The Kings center was the highest-drafted Black player in NHL history at #2 overall.", rookie: true },
  { player: 'Patrice Bergeron', year: 2004, set: '2004-05 Upper Deck', number: '21', sport: 'hockey', value_raw: '$5-$15 (PSA 8)', value_gem: '$100+ (PSA 10)', desc: "Saint Patrice's second UD card. Six Selke Trophies as the NHL's best defensive forward — the most ever.", rookie: false },
  { player: 'Mathew Barzal', year: 2017, set: '2017-18 Upper Deck Young Guns', number: '226', sport: 'hockey', value_raw: '$15-$40 (PSA 9)', value_gem: '$200+ (PSA 10)', desc: "Barzal's Young Guns rookie. The Calder Trophy winner is one of the most dynamic playmakers in the NHL.", rookie: true },
  { player: 'Eric Staal', year: 2004, set: '2004-05 Upper Deck', number: '66', sport: 'hockey', value_raw: '$3-$10 (PSA 8)', value_gem: '$50+ (PSA 10)', desc: "Staal's second UD card. A Stanley Cup champion and 1,000+ point scorer who anchored the Hurricanes.", rookie: false },
];

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const lines = [];
for (const c of thirdCards) {
  const setSlug = slugify(c.set);
  const playerSlug = slugify(c.player);
  const numSlug = c.number.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const slug = `${c.year}-${setSlug.replace(`${c.year}-`, '')}-${playerSlug}-${numSlug}`;
  const name = `${c.set} ${c.player} #${c.number}`;
  const desc = c.desc.replace(/'/g, "\\'");
  const playerEscaped = c.player.replace(/'/g, "\\'");
  const nameEscaped = name.replace(/'/g, "\\'");
  const setEscaped = c.set.replace(/'/g, "\\'");
  const ebayClean = `${c.set.replace(/[^a-z0-9 ]/gi, '').replace(/ +/g, '+')}+${c.player.replace(/['']/g, '').replace(/ /g, '+')}+${c.number}`.replace(/\+{2,}/g, '+');
  const ebayUrl = `https://www.ebay.com/sch/i.html?_nkw=${ebayClean}`;

  lines.push(`  { slug: '${slug}', name: '${nameEscaped}', year: ${c.year}, set: '${setEscaped}', sport: '${c.sport}', player: '${playerEscaped}', cardNumber: '${c.number}', estimatedValueRaw: '${c.value_raw}', estimatedValueGem: '${c.value_gem}', imageUrl: '/images/placeholder-${c.sport}.svg', ebaySearchUrl: '${ebayUrl}', description: '${desc}', rookie: ${c.rookie} },`);
}

console.log('// v2.18 expansion — batch 2: third cards for remaining 2-card players');
console.log(lines.join('\n'));
console.log('\n// Total new cards: ' + thirdCards.length);
