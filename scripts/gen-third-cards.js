// Generate third cards for players currently at 2 cards to unlock comparison pages
// Each unlocked player generates ~50+ new comparison pages

const thirdCards = [
  // BASEBALL — alternate cards for 2-card players (avoid duplicating existing slugs)
  { player: 'Alex Rodriguez', year: 1994, set: '1994 SP', number: '15', sport: 'baseball', value_raw: '$300-$1,200 (PSA 8)', value_gem: '$20,000+ (PSA 10)', desc: "A-Rod's SP rookie is the premium rookie card from the 1994 draft class. The foil design and short print run make this more scarce than his Upper Deck issue.", rookie: true },
  { player: 'Fernando Tatis Jr.', year: 2019, set: '2019 Bowman Chrome', number: '73', sport: 'baseball', value_raw: '$40-$150 (PSA 9)', value_gem: '$800+ (PSA 10)', desc: "Tatis Jr.'s Bowman Chrome card features the San Diego star in Bowman's premiere prospect format. Color parallels are highly sought after.", rookie: true },
  { player: 'Jose Altuve', year: 2012, set: '2012 Topps Chrome', number: '140', sport: 'baseball', value_raw: '$20-$80 (PSA 9)', value_gem: '$600+ (PSA 10)', desc: "Altuve's first Chrome card. The reigning batting champion was already proving that size was irrelevant to baseball greatness.", rookie: false },
  { player: 'Joe DiMaggio', year: 1936, set: '1936 World Wide Gum', number: '51', sport: 'baseball', value_raw: '$8,000-$25,000 (PSA 3)', value_gem: '$500,000+ (PSA 7)', desc: "One of the earliest DiMaggio cards, issued in his debut MLB season. The Canadian-produced World Wide Gum set is extremely scarce in any condition.", rookie: true },
  { player: 'Don Mattingly', year: 1984, set: '1984 Fleer', number: '131', sport: 'baseball', value_raw: '$15-$40 (PSA 8)', value_gem: '$1,000+ (PSA 10)', desc: "Donnie Baseball's Fleer rookie is the preferred issue for some collectors. Mattingly was the most popular player in baseball throughout the mid-1980s.", rookie: true },
  { player: 'Roger Clemens', year: 1985, set: '1985 Donruss', number: '273', sport: 'baseball', value_raw: '$15-$40 (PSA 8)', value_gem: '$800+ (PSA 10)', desc: "The Rocket's Donruss card from his breakout season. Clemens would win the AL MVP and Cy Young in 1986, beginning a Hall of Fame career.", rookie: false },
  { player: 'Ryne Sandberg', year: 1983, set: '1983 Fleer', number: '507', sport: 'baseball', value_raw: '$15-$40 (PSA 8)', value_gem: '$1,000+ (PSA 10)', desc: "Sandberg's Fleer rookie is the preferred option for some collectors over the Topps issue. Same iconic player, different vintage aesthetic.", rookie: true },
  { player: 'Tony Gwynn', year: 1983, set: '1983 Donruss', number: '598', sport: 'baseball', value_raw: '$30-$80 (PSA 8)', value_gem: '$2,000+ (PSA 10)', desc: "Gwynn's Donruss rookie completes the Big 3 rookie card trifecta alongside his Topps and Fleer issues. Eight batting titles and a .338 career average.", rookie: true },
  { player: 'Eddie Murray', year: 1978, set: '1978 OPC', number: '154', sport: 'baseball', value_raw: '$30-$100 (PSA 7)', value_gem: '$3,000+ (PSA 10)', desc: "Steady Eddie's Canadian OPC issue is scarcer than the Topps version. A quiet Hall of Famer with 504 home runs and 3,255 hits.", rookie: true },
  { player: 'Miguel Cabrera', year: 2001, set: '2001 Bowman Chrome', number: '259', sport: 'baseball', value_raw: '$30-$100 (PSA 8)', value_gem: '$800+ (PSA 10)', desc: "Miggy's Bowman Chrome prospect card. The future Triple Crown winner's premium early career issue commands strong premiums in high grade.", rookie: true },
  { player: 'Roki Sasaki', year: 2025, set: '2025 Bowman', number: 'BP-1', sport: 'baseball', value_raw: '$30-$100 (PSA 9)', value_gem: '$500+ (PSA 10)', desc: "Sasaki's Bowman prospect debut. The Japanese phenom's 102mph fastball and NPB perfect game made this the most anticipated Bowman card of the year.", rookie: true },
  { player: 'Kyle Tucker', year: 2020, set: '2020 Topps Series 2', number: '551', sport: 'baseball', value_raw: '$10-$30 (PSA 9)', value_gem: '$150+ (PSA 10)', desc: "Tucker's flagship Topps rookie. A five-tool outfielder who emerged as one of the best players in baseball with back-to-back elite seasons.", rookie: true },
  { player: 'Jose Canseco', year: 1986, set: '1986 Topps Traded', number: '20T', sport: 'baseball', value_raw: '$8-$25 (PSA 8)', value_gem: '$300+ (PSA 10)', desc: "Canseco's Topps Traded issue. The Bash Brother would go on to hit 462 home runs and become one of the most culturally significant players of the steroid era.", rookie: true },
  { player: 'Honus Wagner', year: 1911, set: '1911 T205 Gold Border', number: 'N/A', sport: 'baseball', value_raw: '$5,000-$20,000 (PSA 3)', value_gem: '$100,000+ (PSA 7)', desc: "While the T206 gets all the attention, Wagner's T205 Gold Border is a stunning card in its own right. Gold-bordered tobacco cards of the Flying Dutchman are scarce.", rookie: false },
  { player: 'Rafael Devers', year: 2018, set: '2018 Topps Series 1', number: '18', sport: 'baseball', value_raw: '$5-$15 (PSA 9)', value_gem: '$80+ (PSA 10)', desc: "Raffy's flagship Topps rookie. The Red Sox third baseman emerged as one of the best pure hitters in baseball with elite contact skills.", rookie: true },

  // BASKETBALL — alternate cards for 2-card players
  { player: 'Carmelo Anthony', year: 2003, set: '2003-04 Upper Deck', number: '303', sport: 'basketball', value_raw: '$20-$60 (PSA 8)', value_gem: '$800+ (PSA 10)', desc: "Melo's Upper Deck rookie from the legendary 2003 draft class. A scoring machine who finished with 28,289 career points across 19 NBA seasons.", rookie: true },
  { player: 'Kevin Garnett', year: 1995, set: '1995-96 Finest', number: '115', sport: 'basketball', value_raw: '$30-$100 (PSA 8)', value_gem: '$2,500+ (PSA 10)', desc: "KG's Finest rookie with its distinctive refractor technology. The intensity and versatility that won him an MVP and championship started here.", rookie: true },
  { player: 'Tim Duncan', year: 1997, set: '1997-98 Finest', number: '101', sport: 'basketball', value_raw: '$30-$100 (PSA 8)', value_gem: '$3,000+ (PSA 10)', desc: "The Big Fundamental's Finest rookie. Five championships and two MVPs from the most fundamentally sound player in NBA history. Chronically undervalued.", rookie: true },
  { player: 'Zion Williamson', year: 2019, set: '2019-20 Panini Mosaic', number: '209', sport: 'basketball', value_raw: '$20-$60 (PSA 9)', value_gem: '$300+ (PSA 10)', desc: "Zion's Mosaic rookie. The physical specimen who generated more pre-draft hype than anyone since LeBron. Injuries remain the risk factor.", rookie: true },
  { player: 'Isiah Thomas', year: 1981, set: '1981-82 Topps', number: 'MW36', sport: 'basketball', value_raw: '$20-$50 (PSA 7)', value_gem: '$1,200+ (PSA 10)', desc: "Zeke's Topps Midwest Regional card. The Bad Boy Pistons leader who won back-to-back championships with toughness and basketball IQ.", rookie: true },
  { player: 'Bill Russell', year: 1961, set: '1961-62 Fleer', number: '62', sport: 'basketball', value_raw: '$200-$800 (PSA 5)', value_gem: '$10,000+ (PSA 8)', desc: "Russell's In Action card from the iconic 1961-62 Fleer set. Eleven championships in thirteen years — the most dominant winner in team sports history.", rookie: false },
  { player: 'Grant Hill', year: 1994, set: '1994-95 Flair', number: '213', sport: 'basketball', value_raw: '$5-$15 (PSA 8)', value_gem: '$100+ (PSA 10)', desc: "Hill's Flair rookie features the Duke star who was the most complete young player in the NBA before injuries. One of the best bargains in 90s basketball cards.", rookie: true },
  { player: 'Dominique Wilkins', year: 1986, set: '1986-87 Fleer Sticker', number: '11', sport: 'basketball', value_raw: '$10-$30 (PSA 7)', value_gem: '$500+ (PSA 10)', desc: "The Human Highlight Film's sticker from the iconic 86-87 Fleer set. A more affordable way to own a piece of the most important basketball card set ever.", rookie: true },
  { player: 'Ben Simmons', year: 2016, set: '2016-17 Donruss Optic', number: '151', sport: 'basketball', value_raw: '$5-$20 (PSA 9)', value_gem: '$100+ (PSA 10)', desc: "Simmons's Donruss Optic rookie. Once one of the most hyped prospects in basketball. A reminder that injury risk is the biggest variable in card investing.", rookie: true },
  { player: 'Kareem Abdul-Jabbar', year: 1970, set: '1970-71 Topps', number: '75', sport: 'basketball', value_raw: '$300-$1,000 (PSA 6)', value_gem: '$30,000+ (PSA 9)', desc: "Kareem's second-year Topps card as Lew Alcindor. Already dominant — he won MVP and Rookie of the Year in his first season.", rookie: false },

  // FOOTBALL — alternate cards for 2-card players
  { player: 'Aaron Rodgers', year: 2005, set: '2005 Score', number: '352', sport: 'football', value_raw: '$10-$30 (PSA 9)', value_gem: '$400+ (PSA 10)', desc: "Rodgers' Score rookie. Fell to pick 24 despite being the consensus best player. Four MVPs later, this affordable rookie is one of the best values in football cards.", rookie: true },
  { player: 'Brett Favre', year: 1991, set: '1991 Stadium Club', number: '94', sport: 'football', value_raw: '$5-$15 (PSA 8)', value_gem: '$150+ (PSA 10)', desc: "Favre's Stadium Club rookie with premium photography. The Gunslinger's 297 consecutive starts is a record that defines football durability.", rookie: true },
  { player: 'Joe Montana', year: 1982, set: '1982 Topps', number: '488', sport: 'football', value_raw: '$40-$150 (PSA 7)', value_gem: '$5,000+ (PSA 10)', desc: "Joe Cool's second-year Topps card. By 1982 Montana was already a Super Bowl champion, confirming the promise of his rookie card.", rookie: false },
  { player: 'Joe Namath', year: 1966, set: '1966 Topps', number: '96', sport: 'football', value_raw: '$200-$800 (PSA 6)', value_gem: '$15,000+ (PSA 9)', desc: "Broadway Joe's second Topps card. The Super Bowl III guarantee was still years away but Namath was already the most electrifying figure in football.", rookie: false },
  { player: 'Troy Aikman', year: 1989, set: '1989 Score', number: '270', sport: 'football', value_raw: '$3-$10 (PSA 8)', value_gem: '$80+ (PSA 10)', desc: "Aikman's Score rookie. Three Super Bowls in four years and the centerpiece of the 1990s Cowboys dynasty makes this an incredible value.", rookie: true },
  { player: 'Randy Moss', year: 1998, set: '1998 Topps', number: '352', sport: 'football', value_raw: '$10-$30 (PSA 8)', value_gem: '$400+ (PSA 10)', desc: "Moss's flagship Topps rookie. The most naturally gifted receiver ever. His rookie season TD record announced an all-time talent.", rookie: true },
  { player: 'LaDainian Tomlinson', year: 2001, set: '2001 Topps', number: '350', sport: 'football', value_raw: '$5-$15 (PSA 8)', value_gem: '$150+ (PSA 10)', desc: "LT's flagship Topps rookie. His 2006 season with 31 touchdowns remains one of the greatest individual campaigns in NFL history.", rookie: true },
  { player: 'Lawrence Taylor', year: 1982, set: '1982 Topps', number: '434', sport: 'football', value_raw: '$30-$100 (PSA 7)', value_gem: '$3,000+ (PSA 10)', desc: "LT's second-year Topps card. Already the most feared defensive player in football by his second season. A more affordable entry than his rookie.", rookie: false },
  { player: 'Eli Manning', year: 2004, set: '2004 Topps', number: '350', sport: 'football', value_raw: '$3-$10 (PSA 8)', value_gem: '$100+ (PSA 10)', desc: "Eli's flagship Topps rookie. Two Super Bowl MVPs against the unbeaten Patriots. A bargain for one of the most clutch quarterbacks in NFL history.", rookie: true },
  { player: 'Odell Beckham Jr.', year: 2014, set: '2014 Panini Prizm', number: '253', sport: 'football', value_raw: '$10-$30 (PSA 9)', value_gem: '$150+ (PSA 10)', desc: "OBJ's Prizm rookie. The one-handed catch against Dallas in 2014 made him a cultural icon beyond football.", rookie: true },
  { player: 'Baker Mayfield', year: 2018, set: '2018 Donruss Optic', number: '153', sport: 'football', value_raw: '$5-$15 (PSA 9)', value_gem: '$80+ (PSA 10)', desc: "Mayfield's Optic rookie. The #1 pick's journey from Cleveland to Tampa Bay has been one of the most interesting career arcs in modern NFL history.", rookie: true },

  // HOCKEY — alternate cards for 2-card players
  { player: 'Alexander Ovechkin', year: 2005, set: '2005-06 Upper Deck', number: '443', sport: 'hockey', value_raw: '$50-$200 (PSA 8)', value_gem: '$3,000+ (PSA 10)', desc: "Ovi's base Upper Deck rookie. The greatest goal scorer in NHL history with 900+ goals. A more affordable entry than the Young Guns variant.", rookie: true },
  { player: 'Patrick Kane', year: 2007, set: '2007-08 OPC', number: '520', sport: 'hockey', value_raw: '$20-$60 (PSA 8)', value_gem: '$500+ (PSA 10)', desc: "Kane's OPC rookie. Three Stanley Cups and the most electrifying American-born player in NHL history. The OPC brand adds vintage cachet.", rookie: true },
  { player: 'Jonathan Toews', year: 2007, set: '2007-08 OPC', number: '521', sport: 'hockey', value_raw: '$10-$30 (PSA 8)', value_gem: '$300+ (PSA 10)', desc: "Captain Serious on his OPC rookie. Three Stanley Cups and a Conn Smythe. Toews defined leadership in modern hockey.", rookie: true },
  { player: 'Evgeni Malkin', year: 2006, set: '2006-07 OPC', number: '594', sport: 'hockey', value_raw: '$10-$30 (PSA 8)', value_gem: '$300+ (PSA 10)', desc: "Geno's OPC rookie. Three Cups, a Conn Smythe, and a Hart Trophy. The most complete Russian center since Fedorov.", rookie: true },
  { player: 'Bobby Hull', year: 1959, set: '1959-60 Topps', number: '47', sport: 'hockey', value_raw: '$100-$400 (PSA 5)', value_gem: '$8,000+ (PSA 8)', desc: "The Golden Jet's second Topps card. Hull's devastating slap shot and charismatic personality made him hockey's biggest star of the 1960s.", rookie: false },
  { player: 'Maurice Richard', year: 1953, set: '1953-54 Parkhurst', number: '24', sport: 'hockey', value_raw: '$300-$1,000 (PSA 4)', value_gem: '$15,000+ (PSA 8)', desc: "The Rocket's later Parkhurst issue. The first player to score 50 goals in a season remains one of hockey's most revered figures.", rookie: false },
  { player: 'Teemu Selanne', year: 1993, set: '1993-94 Upper Deck', number: '281', sport: 'hockey', value_raw: '$3-$10 (PSA 8)', value_gem: '$80+ (PSA 10)', desc: "The Finnish Flash after his record-breaking 76-goal rookie season. This card captures the most explosive debut in NHL history.", rookie: false },
  { player: 'Sergei Fedorov', year: 1991, set: '1991-92 Upper Deck', number: '145', sport: 'hockey', value_raw: '$2-$5 (PSA 8)', value_gem: '$50+ (PSA 10)', desc: "Fedorov's second-year card. Already emerging as the most talented two-way forward since Bobby Orr. A true Red Wings dynasty cornerstone.", rookie: false },
  { player: 'Brady Tkachuk', year: 2019, set: '2019-20 Upper Deck', number: '131', sport: 'hockey', value_raw: '$3-$10 (PSA 9)', value_gem: '$50+ (PSA 10)', desc: "Brady's second-year UD card. The Senators captain and emotional heart of the franchise. Half of hockey's most collected sibling duo.", rookie: false },
  { player: 'Matthew Tkachuk', year: 2017, set: '2017-18 Upper Deck', number: '30', sport: 'hockey', value_raw: '$5-$15 (PSA 9)', value_gem: '$80+ (PSA 10)', desc: "Tkachuk's second-year card. The 2023 Conn Smythe winner would lead Florida to a Stanley Cup. A pest who became a champion.", rookie: false },
  { player: 'David Pastrnak', year: 2015, set: '2015-16 Upper Deck', number: '20', sport: 'hockey', value_raw: '$5-$15 (PSA 9)', value_gem: '$80+ (PSA 10)', desc: "Pasta's second UD card. One of the most dynamic offensive players in the NHL with a lethal shot and creative playmaking.", rookie: false },
  { player: 'John Tavares', year: 2010, set: '2010-11 Upper Deck', number: '166', sport: 'hockey', value_raw: '$3-$10 (PSA 9)', value_gem: '$60+ (PSA 10)', desc: "Tavares' sophomore card. The former #1 pick became one of the most consistent centers in hockey for over a decade.", rookie: false },
];

// Generate the card entries
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
  const ebayTerms = `${c.year}+${c.set.replace(/[^a-z0-9 ]/gi, '').replace(/ +/g, '+')}+${c.player.replace(/['']/g, '').replace(/ /g, '+')}+${c.number}`.replace(/\+{2,}/g, '+');
  const ebayUrl = `https://www.ebay.com/sch/i.html?_nkw=${ebayTerms}`;

  const name = `${c.set} ${c.player} #${c.number}`;
  const desc = c.desc.replace(/'/g, "\\'");
  const playerEscaped = c.player.replace(/'/g, "\\'");
  const nameEscaped = name.replace(/'/g, "\\'");
  const setEscaped = c.set.replace(/'/g, "\\'");
  const ebayClean = `${c.set.replace(/[^a-z0-9 ]/gi, '').replace(/ +/g, '+')}+${c.player.replace(/['']/g, '').replace(/ /g, '+')}+${c.number}`.replace(/\+{2,}/g, '+');
  const ebayUrlFixed = `https://www.ebay.com/sch/i.html?_nkw=${ebayClean}`;

  lines.push(`  { slug: '${slug}', name: '${nameEscaped}', year: ${c.year}, set: '${setEscaped}', sport: '${c.sport}', player: '${playerEscaped}', cardNumber: '${c.number}', estimatedValueRaw: '${c.value_raw}', estimatedValueGem: '${c.value_gem}', imageUrl: '/images/placeholder-${c.sport}.svg', ebaySearchUrl: '${ebayUrlFixed}', description: '${desc}', rookie: ${c.rookie} },`);
}

console.log('// v2.16 expansion — third cards for 2-card players (unlocks comparison pages)');
console.log(lines.join('\n'));
console.log('\n// Total new cards: ' + thirdCards.length);
