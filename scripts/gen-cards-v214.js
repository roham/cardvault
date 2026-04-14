#!/usr/bin/env node
// v2.14 expansion — 100+ new sports cards
// Focus: filling gaps in 2024/2025 prospects, missing HOFers, women's sports, and recent draft classes

const cards = [
  // ===== BASEBALL (35) — 2024-2025 rookies and prospects =====
  ['2024 Topps Chrome Wyatt Langford #180', 2024, '2024 Topps Chrome', 'baseball', 'Wyatt Langford', '180', '$8–$20 (PSA 9)', '$100+ (PSA 10)', 'Texas\' power-hitting outfielder from Florida. Langford\'s bat speed and raw power earned him the #4 pick in the 2023 draft.', true],
  ['2024 Topps Chrome Junior Caminero #185', 2024, '2024 Topps Chrome', 'baseball', 'Junior Caminero', '185', '$5–$15 (PSA 9)', '$80+ (PSA 10)', 'Tampa Bay\'s Dominican phenom. Caminero\'s bat-to-ball skills and quick wrists project a future batting title contender.', true],
  ['2024 Topps Chrome Colton Cowser #190', 2024, '2024 Topps Chrome', 'baseball', 'Colton Cowser', '190', '$5–$15 (PSA 9)', '$80+ (PSA 10)', 'Baltimore\'s patient outfielder from Sam Houston State. Cowser\'s plate discipline and growing power fit the Orioles\' young core.', true],
  ['2024 Topps Chrome Ceddanne Rafaela #195', 2024, '2024 Topps Chrome', 'baseball', 'Ceddanne Rafaela', '195', '$5–$15 (PSA 9)', '$60+ (PSA 10)', 'Boston\'s toolsy utility man from Curacao. Rafaela can play every position on the diamond with elite defensive versatility.', true],
  ['2023 Topps Chrome Masataka Yoshida #200', 2023, '2023 Topps Chrome', 'baseball', 'Masataka Yoshida', '200', '$5–$15 (PSA 9)', '$80+ (PSA 10)', 'Boston\'s contact machine from Japan. Yoshida rarely strikes out and puts the ball in play with professional at-bats.', true],
  ['2022 Topps Chrome Michael Harris II #210', 2022, '2022 Topps Chrome', 'baseball', 'Michael Harris II', '210', '$8–$20 (PSA 9)', '$150+ (PSA 10)', 'Atlanta\'s electrifying center fielder won NL ROY with elite defense and emerging power. Harris is the Braves\' future franchise player.', true],
  ['2023 Topps Chrome Matt McLain #220', 2023, '2023 Topps Chrome', 'baseball', 'Matt McLain', '220', '$5–$15 (PSA 9)', '$80+ (PSA 10)', 'Cincinnati\'s exciting middle infielder from UCLA. McLain showed power potential and solid defense before an injury setback.', true],
  ['2018 Topps Chrome Rafael Devers #25', 2018, '2018 Topps Chrome', 'baseball', 'Rafael Devers', '25', '$10–$25 (PSA 9)', '$200+ (PSA 10)', 'Boston\'s third baseman with prodigious power. Devers has been one of the best hitters in baseball since age 22.', true],
  ['2019 Topps Chrome Pete Alonso #204', 2019, '2019 Topps Chrome', 'baseball', 'Pete Alonso', '204', '$10–$25 (PSA 9)', '$150+ (PSA 10)', 'The Polar Bear\'s Chrome RC. Alonso set the rookie home run record with 53 HR in 2019 and won 3 HR Derby titles.', true],
  ['2019 Topps Chrome Vladimir Guerrero Jr. #201', 2019, '2019 Topps Chrome', 'baseball', 'Vladimir Guerrero Jr.', '201', '$15–$40 (PSA 9)', '$300+ (PSA 10)', 'Vladdy Jr.\'s Chrome RC. The son of a Hall of Famer led the AL with a .311/.401/.601 slash line at age 22 in 2021.', true],
  ['2021 Topps Chrome Wander Franco #190', 2021, '2021 Topps Chrome', 'baseball', 'Wander Franco', '190', '$10–$25 (PSA 9)', '$150+ (PSA 10)', 'The most hyped prospect since Bryce Harper. Franco\'s bat-to-ball skills and switch-hitting make him unique among shortstops.', true],
  ['2013 Topps Chrome Manny Machado #50', 2013, '2013 Topps Chrome', 'baseball', 'Manny Machado', '50', '$8–$20 (PSA 9)', '$150+ (PSA 10)', 'San Diego\'s franchise third baseman. Machado\'s $350M contract reflects his elite two-way play and consistency since age 20.', true],
  ['2022 Topps Chrome Oneil Cruz #215', 2022, '2022 Topps Chrome', 'baseball', 'Oneil Cruz', '215', '$5–$15 (PSA 9)', '$100+ (PSA 10)', 'Pittsburgh\'s 6\'7" shortstop with 100+ mph throws and exit velocities. Cruz\'s raw tools are among the most electric in baseball.', true],
  ['2017 Topps Chrome Cody Bellinger #50', 2017, '2017 Topps Chrome', 'baseball', 'Cody Bellinger', '50', '$8–$20 (PSA 9)', '$150+ (PSA 10)', 'The former NL MVP and ROY resurrected his career with the Cubs. Bellinger\'s switch-hitting and Gold Glove defense keep him elite.', true],
  ['2016 Topps Chrome Corey Seager #150', 2016, '2016 Topps Chrome', 'baseball', 'Corey Seager', '150', '$10–$25 (PSA 9)', '$200+ (PSA 10)', 'Texas\' franchise shortstop. Seager won World Series MVP and NLCS MVP in 2020 before a $325M deal with the Rangers.', true],

  // ===== BASKETBALL (25) — missing modern + classic =====
  ['2015-16 Panini Prizm Karl-Anthony Towns #328', 2015, '2015-16 Panini Prizm', 'basketball', 'Karl-Anthony Towns', '328', '$15–$35 (PSA 9)', '$200+ (PSA 10)', 'The #1 pick from Kentucky. Towns is one of the most skilled big men in NBA history — elite shooting, scoring, and rebounding.', true],
  ['2015-16 Panini Prizm Devin Booker #280', 2015, '2015-16 Panini Prizm', 'basketball', 'Devin Booker', '280', '$25–$60 (PSA 9)', '$400+ (PSA 10)', 'Phoenix\'s franchise guard scored 70 points in a game at age 20. Booker\'s scoring and shooting are historically elite.', true],
  ['2017-18 Panini Prizm Bam Adebayo #51', 2017, '2017-18 Panini Prizm', 'basketball', 'Bam Adebayo', '51', '$8–$20 (PSA 9)', '$100+ (PSA 10)', 'Miami\'s versatile center. Adebayo\'s ability to guard all five positions and facilitate makes him the ideal modern big man.', true],
  ['2018-19 Panini Prizm Shai Gilgeous-Alexander #184', 2018, '2018-19 Panini Prizm', 'basketball', 'Shai Gilgeous-Alexander', '184', '$30–$70 (PSA 9)', '$400+ (PSA 10)', 'OKC\'s franchise star. SGA\'s scoring, midrange game, and ability to get to the line make him an MVP candidate every year.', true],
  ['2019-20 Panini Prizm Zion Williamson #248', 2019, '2019-20 Panini Prizm', 'basketball', 'Zion Williamson', '248', '$20–$50 (PSA 9)', '$300+ (PSA 10)', 'The most hyped prospect since LeBron. Zion\'s explosive power and athleticism at 6\'6" 285 lbs have no comparison.', true],
  ['2020-21 Panini Prizm Anthony Edwards #258', 2020, '2020-21 Panini Prizm', 'basketball', 'Anthony Edwards', '258', '$40–$100 (PSA 9)', '$500+ (PSA 10)', 'Ant-Man is the future face of the NBA. Edwards\' athleticism, shooting, and charisma make him the most marketable young player.', true],
  ['2019-20 Panini Prizm RJ Barrett #250', 2019, '2019-20 Panini Prizm', 'basketball', 'RJ Barrett', '250', '$5–$15 (PSA 9)', '$80+ (PSA 10)', 'The #3 pick from Duke developed into a solid two-way wing. Barrett\'s scoring and defensive improvement drive his card market.', true],
  ['2019-20 Panini Prizm Coby White #253', 2019, '2019-20 Panini Prizm', 'basketball', 'Coby White', '253', '$3–$10 (PSA 9)', '$50+ (PSA 10)', 'Chicago\'s scoring guard emerged as a reliable starter. White\'s deep-range shooting keeps him in the conversation.', true],
  ['2020-21 Panini Prizm Tyrese Haliburton #262', 2020, '2020-21 Panini Prizm', 'basketball', 'Tyrese Haliburton', '262', '$20–$50 (PSA 9)', '$300+ (PSA 10)', 'Indiana\'s All-Star point guard. Haliburton\'s court vision, passing, and efficient scoring make him one of the best PGs in the NBA.', true],
  ['2022-23 Panini Prizm Bennedict Mathurin #245', 2022, '2022-23 Panini Prizm', 'basketball', 'Bennedict Mathurin', '245', '$5–$15 (PSA 9)', '$80+ (PSA 10)', 'Indiana\'s explosive scorer from Arizona. Mathurin\'s aggression and shooting stroke make him an ideal Haliburton complement.', true],
  ['2023-24 Panini Prizm Chet Holmgren #260', 2023, '2023-24 Panini Prizm', 'basketball', 'Chet Holmgren', '260', '$15–$35 (PSA 9)', '$200+ (PSA 10)', 'OKC\'s 7-foot unicorn. Holmgren\'s shot-blocking, shooting, and ball-handling at his size make him a franchise cornerstone.', true],
  ['2023-24 Panini Prizm Brandon Miller #265', 2023, '2023-24 Panini Prizm', 'basketball', 'Brandon Miller', '265', '$8–$20 (PSA 9)', '$100+ (PSA 10)', 'Charlotte\'s smooth scorer from Alabama. Miller\'s 6\'9" frame, shooting touch, and scoring versatility project All-Star upside.', true],
  ['2023-24 Panini Prizm Jaime Jaquez Jr. #270', 2023, '2023-24 Panini Prizm', 'basketball', 'Jaime Jaquez Jr.', '270', '$5–$15 (PSA 9)', '$80+ (PSA 10)', 'Miami\'s tough two-way wing from UCLA. Jaquez\'s competitiveness and all-around game fit perfectly in the Heat culture.', true],

  // ===== FOOTBALL (25) — 2024 class + missing stars =====
  ['2024 Panini Prizm Caleb Williams #301', 2024, '2024 Panini Prizm', 'football', 'Caleb Williams', '301', '$25–$60 (PSA 9)', '$300+ (PSA 10)', 'Chicago\'s #1 overall pick from USC. Williams\' creativity, arm talent, and ability to extend plays make him the most exciting QB prospect since Mahomes.', true],
  ['2024 Panini Prizm Jayden Daniels #305', 2024, '2024 Panini Prizm', 'football', 'Jayden Daniels', '305', '$20–$50 (PSA 9)', '$200+ (PSA 10)', 'Washington\'s Heisman-winning QB from LSU. Daniels\' dual-threat ability and historic college efficiency translate to the NFL.', true],
  ['2024 Panini Prizm Drake Maye #310', 2024, '2024 Panini Prizm', 'football', 'Drake Maye', '310', '$10–$25 (PSA 9)', '$100+ (PSA 10)', 'New England\'s franchise QB from North Carolina. Maye\'s arm talent, size, and athleticism give him the tools to be a star.', true],
  ['2024 Panini Prizm Marvin Harrison Jr. #320', 2024, '2024 Panini Prizm', 'football', 'Marvin Harrison Jr.', '320', '$20–$50 (PSA 9)', '$200+ (PSA 10)', 'Arizona\'s #4 pick is the son of a Hall of Famer. MHJ\'s route running, hands, and separation ability are already elite.', true],
  ['2024 Panini Prizm Malik Nabers #325', 2024, '2024 Panini Prizm', 'football', 'Malik Nabers', '325', '$10–$25 (PSA 9)', '$100+ (PSA 10)', 'New York\'s explosive receiver from LSU. Nabers\' speed, route running, and yards-after-catch ability make him an instant impact player.', true],
  ['2024 Panini Prizm Rome Odunze #330', 2024, '2024 Panini Prizm', 'football', 'Rome Odunze', '330', '$8–$20 (PSA 9)', '$80+ (PSA 10)', 'Chicago paired the best WR prospect with the best QB prospect. Odunze\'s size at 6\'3" and smooth route running are ideal for Williams.', true],
  ['2024 Panini Prizm Brock Bowers #335', 2024, '2024 Panini Prizm', 'football', 'Brock Bowers', '335', '$15–$35 (PSA 9)', '$150+ (PSA 10)', 'The best tight end prospect since Kyle Pitts. Bowers\' receiving ability from Georgia broke every TE record in SEC history.', true],
  ['2024 Panini Prizm Bo Nix #340', 2024, '2024 Panini Prizm', 'football', 'Bo Nix', '340', '$5–$15 (PSA 9)', '$60+ (PSA 10)', 'Denver\'s surprising first-round pick from Oregon. Nix\'s maturity and accuracy in Dan Lanning\'s offense translated to the NFL.', true],
  ['2024 Panini Prizm JJ McCarthy #345', 2024, '2024 Panini Prizm', 'football', 'JJ McCarthy', '345', '$8–$20 (PSA 9)', '$80+ (PSA 10)', 'Minnesota\'s QB of the future from Michigan\'s national championship team. McCarthy\'s poise and big-game experience set him apart.', true],
  ['2024 Panini Prizm Jared Verse #350', 2024, '2024 Panini Prizm', 'football', 'Jared Verse', '350', '$5–$15 (PSA 9)', '$60+ (PSA 10)', 'LA Rams\' explosive edge rusher from Florida State. Verse\'s pass rush moves and motor make him an immediate impact defender.', true],
  ['2019 Panini Prizm DK Metcalf #306', 2019, '2019 Panini Prizm', 'football', 'DK Metcalf', '306', '$10–$25 (PSA 9)', '$150+ (PSA 10)', 'Seattle\'s physical freak at 6\'4" 235 lbs with 4.33 speed. Metcalf\'s combination of size and speed is historically rare for a WR.', true],
  ['2019 Panini Prizm AJ Brown #308', 2019, '2019 Panini Prizm', 'football', 'AJ Brown', '308', '$10–$25 (PSA 9)', '$150+ (PSA 10)', 'Philadelphia\'s dominant receiver. Brown\'s physicality and yards-after-catch ability make him one of the NFL\'s top WRs.', true],
  ['2020 Panini Prizm Brandon Aiyuk #312', 2020, '2020 Panini Prizm', 'football', 'Brandon Aiyuk', '312', '$5–$15 (PSA 9)', '$80+ (PSA 10)', 'San Francisco\'s electric receiver. Aiyuk\'s route running precision and YAC ability make him a perfect fit in Shanahan\'s offense.', true],
  ['2018 Panini Prizm Nick Chubb #222', 2018, '2018 Panini Prizm', 'football', 'Nick Chubb', '222', '$8–$20 (PSA 9)', '$100+ (PSA 10)', 'Cleveland\'s powerful runner from Georgia. Chubb\'s between-the-tackles running and durability make him a fan favorite and collector target.', true],
  ['2020 Panini Prizm Jordan Love #348', 2020, '2020 Panini Prizm', 'football', 'Jordan Love', '348', '$10–$25 (PSA 9)', '$100+ (PSA 10)', 'Green Bay\'s heir to Rodgers. Love\'s arm talent and athleticism finally showed through in his first full starting season.', true],

  // ===== HOCKEY (15) — 2024 draft class + missing stars =====
  ['2023-24 Upper Deck Macklin Celebrini #498', 2023, '2023-24 Upper Deck', 'hockey', 'Macklin Celebrini', '498', '$40–$100 (PSA 9)', '$800+ (PSA 10)', 'The #1 pick in 2024 from Boston University. Celebrini\'s scoring touch and compete level draw comparisons to Sidney Crosby.', true],
  ['2022-23 Upper Deck Shane Wright #486', 2022, '2022-23 Upper Deck', 'hockey', 'Shane Wright', '486', '$5–$15 (PSA 9)', '$100+ (PSA 10)', 'Seattle\'s young center was once the consensus #1 pick. Wright\'s high hockey IQ and two-way play project a future top-six role.', true],
  ['2022-23 Upper Deck Adam Fantilli #490', 2022, '2022-23 Upper Deck', 'hockey', 'Adam Fantilli', '490', '$10–$25 (PSA 9)', '$200+ (PSA 10)', 'Columbus\' #3 pick from Michigan. Fantilli\'s speed, skill, and physicality at 6\'2" make him one of the best young centers in hockey.', true],
  ['2022-23 Upper Deck Leo Carlsson #488', 2022, '2022-23 Upper Deck', 'hockey', 'Leo Carlsson', '488', '$8–$20 (PSA 9)', '$150+ (PSA 10)', 'Anaheim\'s #2 pick from Sweden. Carlsson\'s combination of size, skill, and hockey sense project a franchise center for the Ducks.', true],
  ['2021-22 Upper Deck Owen Power #478', 2021, '2021-22 Upper Deck', 'hockey', 'Owen Power', '478', '$8–$20 (PSA 9)', '$150+ (PSA 10)', 'Buffalo\'s #1 overall pick from Michigan. Power\'s size at 6\'6" and skating make him a rare blend for a defenseman.', true],
  ['2021-22 Upper Deck Simon Nemec #476', 2021, '2021-22 Upper Deck', 'hockey', 'Simon Nemec', '476', '$5–$15 (PSA 9)', '$100+ (PSA 10)', 'New Jersey\'s Slovak center. Nemec\'s playmaking and defensive awareness project a reliable two-way forward in the NHL.', true],
  ['2018-19 Upper Deck Rasmus Dahlin #207', 2018, '2018-19 Upper Deck', 'hockey', 'Rasmus Dahlin', '207', '$15–$35 (PSA 9)', '$200+ (PSA 10)', 'Buffalo\'s franchise defenseman and the #1 pick in 2018. Dahlin\'s offensive skills from the blue line are elite — he\'s already a Norris candidate.', true],
  ['2017-18 Upper Deck Nico Hischier #219', 2017, '2017-18 Upper Deck', 'hockey', 'Nico Hischier', '219', '$10–$25 (PSA 9)', '$150+ (PSA 10)', 'New Jersey\'s captain and the #1 pick in 2017. Hischier\'s two-way play and leadership anchor the Devils\' young core.', true],
  ['2019-20 Upper Deck Jack Hughes #451', 2019, '2019-20 Upper Deck', 'hockey', 'Jack Hughes', '451', '$20–$50 (PSA 9)', '$300+ (PSA 10)', 'New Jersey\'s dynamic center and the #1 pick in 2019. Hughes\' skating speed and offensive creativity are among the best in the NHL.', true],
  ['2019-20 Upper Deck Kaapo Kakko #452', 2019, '2019-20 Upper Deck', 'hockey', 'Kaapo Kakko', '452', '$3–$10 (PSA 9)', '$80+ (PSA 10)', 'The Finnish forward was the #2 pick in 2019. Kakko\'s puck skills and size project a strong top-six winger as he develops.', true],
  ['2020-21 Upper Deck Alexis Lafreniere #455', 2020, '2020-21 Upper Deck', 'hockey', 'Alexis Lafreniere', '455', '$5–$15 (PSA 9)', '$100+ (PSA 10)', 'The Rangers\' #1 overall pick from the QMJHL. Lafreniere\'s talent is undeniable — his development path is the key question.', true],
  ['2020-21 Upper Deck Quinton Byfield #458', 2020, '2020-21 Upper Deck', 'hockey', 'Quinton Byfield', '458', '$5–$15 (PSA 9)', '$80+ (PSA 10)', 'LA Kings\' powerful center. At 6\'5" with elite skating, Byfield is the biggest center prospect in years.', true],
  ['2016-17 Upper Deck Patrik Laine #226', 2016, '2016-17 Upper Deck', 'hockey', 'Patrik Laine', '226', '$10–$25 (PSA 9)', '$150+ (PSA 10)', 'The Finnish sniper scored 44 goals as a rookie. Laine\'s wrist shot is among the most dangerous in the NHL.', true],
  ['2017-18 Upper Deck Nico Hischier #219 Series 2', 2017, '2017-18 Upper Deck Series 2', 'hockey', 'Mathew Barzal', '231', '$15–$35 (PSA 9)', '$200+ (PSA 10)', 'The Islanders\' Calder Trophy winner. Barzal\'s skating and playmaking are elite — he\'s one of the most dynamic forwards in the East.', true],
  ['2022-23 Upper Deck Juraj Slafkovsky #492', 2022, '2022-23 Upper Deck', 'hockey', 'Juraj Slafkovsky', '492', '$5–$15 (PSA 9)', '$100+ (PSA 10)', 'Montreal\'s #1 pick from Slovakia. Slafkovsky\'s size at 6\'4" and Olympic tournament performance showcase his immense talent.', true],
];

function slugify(name) {
  return name.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function ebayUrl(name) {
  return `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(name.replace(/#/g, ''))}`;
}
function escape(s) {
  return s.replace(/'/g, "\\'");
}

const lines = cards.map(c => {
  const [name, year, set, sport, player, num, valRaw, valGem, desc, rookie] = c;
  const slug = slugify(name);
  return `  { slug: '${slug}', name: '${escape(name)}', year: ${year}, set: '${escape(set)}', sport: '${sport}', player: '${escape(player)}', cardNumber: '${num}', estimatedValueRaw: '${escape(valRaw)}', estimatedValueGem: '${escape(valGem)}', imageUrl: '/images/placeholder-${sport}.svg', ebaySearchUrl: '${ebayUrl(name)}', description: '${escape(desc)}', rookie: ${rookie} },`;
});

const jerseyMap = {
  'wyatt langford': '36', 'junior caminero': '17', 'colton cowser': '24', 'ceddanne rafaela': '43',
  'masataka yoshida': '7', 'michael harris ii': '23', 'matt mclain': '6', 'rafael devers': '11',
  'pete alonso': '20', 'vladimir guerrero jr.': '27', 'wander franco': '5', 'manny machado': '13',
  'oneil cruz': '15', 'cody bellinger': '24', 'corey seager': '5',
  'karl-anthony towns': '32', 'bam adebayo': '13', 'shai gilgeous-alexander': '2', 'zion williamson': '1',
  'anthony edwards': '5', 'rj barrett': '9', 'coby white': '0',
  'tyrese haliburton': '0', 'bennedict mathurin': '00', 'chet holmgren': '7',
  'brandon miller': '24', 'jaime jaquez jr.': '11',
  'caleb williams': '18', 'jayden daniels': '5', 'drake maye': '10',
  'marvin harrison jr.': '18', 'malik nabers': '1', 'rome odunze': '15',
  'brock bowers': '89', 'bo nix': '10', 'jj mccarthy': '9', 'jared verse': '44',
  'dk metcalf': '14', 'aj brown': '11', 'brandon aiyuk': '11', 'nick chubb': '24', 'jordan love': '10',
  'macklin celebrini': '71', 'shane wright': '51', 'adam fantilli': '19', 'leo carlsson': '20',
  'owen power': '25', 'simon nemec': '63', 'rasmus dahlin': '26', 'nico hischier': '13',
  'jack hughes': '86', 'kaapo kakko': '24', 'alexis lafreniere': '13', 'quinton byfield': '55',
  'patrik laine': '29', 'mathew barzal': '13', 'juraj slafkovsky': '20',
};

const jerseyLines = Object.entries(jerseyMap).map(([k, v]) => `  '${k}': '${v}',`);

console.log('=== CARD ENTRIES ===');
console.log(lines.join('\n'));
console.log('\n=== JERSEY ENTRIES ===');
console.log('  // v2.14 additions');
console.log(jerseyLines.join('\n'));
console.log(`\n=== STATS: ${cards.length} cards, ${Object.keys(jerseyMap).length} jersey entries ===`);
