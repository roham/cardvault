#!/usr/bin/env node
// Generate new sports cards for v2.12 — DEDUPED against existing data

const cards = [
  // ===== BASEBALL (30 new) =====
  ['1955 Bowman Hank Aaron #179', 1955, '1955 Bowman', 'baseball', 'Hank Aaron', '179', '$2,000–$8,000 (PSA 7)', '$200,000+ (PSA 9)', 'Hammerin Hank\'s second-year Bowman card. Aaron\'s 755 career home runs stood as the record for 33 years.', false],
  ['2022 Topps Chrome Julio Rodriguez #200', 2022, '2022 Topps Chrome', 'baseball', 'Julio Rodriguez', '200', '$15–$40 (PSA 9)', '$200+ (PSA 10)', 'J-Rod\'s Chrome RC. Seattle\'s centerpiece signed a record-breaking extension based on his five-tool ceiling.', true],
  ['2023 Topps Chrome Corbin Carroll #15', 2023, '2023 Topps Chrome', 'baseball', 'Corbin Carroll', '15', '$10–$25 (PSA 9)', '$150+ (PSA 10)', 'Arizona\'s speedster. Carroll\'s ROY season combined elite speed, solid power, and premium defense in center field.', true],
  ['2023 Bowman Chrome Jackson Holliday #BCP-1', 2023, '2023 Bowman Chrome', 'baseball', 'Jackson Holliday', 'BCP-1', '$20–$60 (PSA 9)', '$300+ (PSA 10)', 'The #1 prospect in baseball. Holliday\'s Bowman Chrome 1st is the most sought-after prospect card since Wander Franco.', true],
  ['2024 Topps Chrome Paul Skenes #150', 2024, '2024 Topps Chrome', 'baseball', 'Paul Skenes', '150', '$15–$40 (PSA 9)', '$200+ (PSA 10)', 'Pittsburgh\'s ace arrived with triple-digit heat and a devastating splinker. Skenes dominated from his first start.', true],
  ['2024 Bowman Chrome Roki Sasaki #BCP-25', 2024, '2024 Bowman Chrome', 'baseball', 'Roki Sasaki', 'BCP-25', '$25–$60 (PSA 9)', '$300+ (PSA 10)', 'The Japanese phenom who threw a perfect game at 18. Sasaki\'s posting to MLB has made his Bowman Chrome the most international chase card.', false],
  ['2019 Topps Chrome Yordan Alvarez #US1', 2019, '2019 Topps Chrome Update', 'baseball', 'Yordan Alvarez', 'US1', '$15–$40 (PSA 9)', '$300+ (PSA 10)', 'Houston\'s Cuban powerhouse. Alvarez won ROY unanimously and has been one of the best hitters in baseball since.', true],
  ['2020 Topps Chrome Bo Bichette #150', 2020, '2020 Topps Chrome', 'baseball', 'Bo Bichette', '150', '$8–$20 (PSA 9)', '$150+ (PSA 10)', 'Toronto\'s swashbuckling shortstop. Bichette\'s flowing hair and clutch hitting make him one of the most marketable stars.', true],
  ['2021 Topps Chrome Bobby Witt Jr. #USC-100', 2021, '2021 Topps Chrome Update', 'baseball', 'Bobby Witt Jr.', 'USC-100', '$15–$40 (PSA 9)', '$200+ (PSA 10)', 'Kansas City\'s franchise cornerstone. Witt\'s 30-30 seasons and Gold Glove defense at short make him a five-tool star.', true],
  ['2021 Topps Chrome Riley Greene #USC-50', 2021, '2021 Topps Chrome Update', 'baseball', 'Riley Greene', 'USC-50', '$5–$15 (PSA 9)', '$100+ (PSA 10)', 'Detroit\'s center fielder is the face of the Tigers rebuild. Greene\'s smooth swing and defensive range project a long career.', true],
  ['2022 Topps Chrome Adley Rutschman #USC-75', 2022, '2022 Topps Chrome Update', 'baseball', 'Adley Rutschman', 'USC-75', '$10–$25 (PSA 9)', '$150+ (PSA 10)', 'The #1 overall pick from 2019 has become the best catcher in baseball. Rutschman\'s switch-hitting and elite framing anchor Baltimore.', true],
  ['1987 Donruss Greg Maddux #36', 1987, '1987 Donruss', 'baseball', 'Greg Maddux', '36', '$5–$15 (PSA 8)', '$300+ (PSA 10)', 'Mad Dog\'s Donruss RC. Maddux won 4 consecutive Cy Youngs (1992-95) and was the most precise pitcher of his generation.', true],
  ['1988 Score Roberto Alomar #80', 1988, '1988 Score', 'baseball', 'Roberto Alomar', '80', '$3–$10 (PSA 9)', '$100+ (PSA 10)', 'One of the greatest second basemen ever. Alomar\'s 12 All-Star selections and 10 Gold Gloves set the standard for the position.', true],
  ['1990 Leaf Frank Thomas #300', 1990, '1990 Leaf', 'baseball', 'Frank Thomas', '300', '$10–$30 (PSA 9)', '$500+ (PSA 10)', 'The Big Hurt\'s Leaf RC — the premium version of his rookie year. Thomas\'s .330/.440/.575 peak was historically dominant.', true],
  ['2020 Topps Chrome Kyle Tucker #176', 2020, '2020 Topps Chrome', 'baseball', 'Kyle Tucker', '176', '$8–$20 (PSA 9)', '$150+ (PSA 10)', 'Houston\'s five-tool outfielder. Tucker\'s combination of power, speed, and defense makes him one of the most complete players in baseball.', true],
  ['2023 Topps Chrome Evan Carter #215', 2023, '2023 Topps Chrome', 'baseball', 'Evan Carter', '215', '$8–$20 (PSA 9)', '$100+ (PSA 10)', 'Texas\' playoff hero as a 20-year-old. Carter\'s patient approach and advanced plate discipline project an All-Star career.', true],
  ['2022 Topps Chrome Spencer Strider #220', 2022, '2022 Topps Chrome', 'baseball', 'Spencer Strider', '220', '$8–$20 (PSA 9)', '$100+ (PSA 10)', 'Atlanta\'s strikeout machine with a 100 mph fastball. Strider broke the single-season K-rate record before his injury.', true],
  ['2024 Topps Chrome Jackson Merrill #175', 2024, '2024 Topps Chrome', 'baseball', 'Jackson Merrill', '175', '$10–$25 (PSA 9)', '$100+ (PSA 10)', 'San Diego\'s breakout rookie in 2024. Merrill\'s power and center field defense earned him ROY consideration in his first full season.', true],
  ['1985 Topps Kirby Puckett #536', 1985, '1985 Topps', 'baseball', 'Kirby Puckett', '536', '$10–$30 (PSA 8)', '$500+ (PSA 10)', 'Puck\'s rookie card. Puckett\'s 2 World Series rings and the iconic Game 6 catch-and-homer combo in 1991 are legendary Minnesota moments.', true],
  ['2014 Bowman Chrome Mookie Betts #BCP-109', 2014, '2014 Bowman Chrome', 'baseball', 'Mookie Betts', 'BCP-109', '$20–$50 (PSA 9)', '$300+ (PSA 10)', 'The best player in baseball. Betts\' MVP, World Series ring, and perennial Gold Glove play in right field make him generationally elite.', true],

  // ===== BASKETBALL (25 new) =====
  ['1980-81 Topps Larry Bird #34', 1980, '1980-81 Topps', 'basketball', 'Larry Bird', '34', '$200–$800 (PSA 7)', '$30,000+ (PSA 9)', 'Larry Legend\'s RC alongside Magic. Bird\'s shooting, passing, and basketball IQ made him the definitive 1980s NBA player.', true],
  ['1980-81 Topps Magic Johnson #18', 1980, '1980-81 Topps', 'basketball', 'Magic Johnson', '18', '$200–$800 (PSA 7)', '$30,000+ (PSA 9)', 'Magic\'s RC alongside Bird. His 6\'9" point guard play revolutionized basketball and sparked the NBA\'s popularity explosion.', true],
  ['2009-10 Topps Chrome James Harden #99', 2009, '2009-10 Topps Chrome', 'basketball', 'James Harden', '99', '$30–$80 (PSA 9)', '$500+ (PSA 10)', 'The Beard\'s Chrome RC. Harden\'s 3 scoring titles, MVP, and stepback three made him the most unguardable scorer of his era.', true],
  ['2012-13 Panini Prizm Kawhi Leonard #199', 2012, '2012-13 Panini Prizm', 'basketball', 'Kawhi Leonard', '199', '$25–$60 (PSA 9)', '$400+ (PSA 10)', 'The Claw. Leonard\'s two Finals MVPs with two different teams and his 2019 playoff run are among the greatest individual postseasons ever.', true],
  ['2021-22 Panini Prizm Cade Cunningham #282', 2021, '2021-22 Panini Prizm', 'basketball', 'Cade Cunningham', '282', '$10–$25 (PSA 9)', '$150+ (PSA 10)', 'Detroit\'s #1 pick has shown flashes of being a franchise cornerstone. Cunningham\'s size and playmaking at 6\'6" are rare.', true],
  ['2021-22 Panini Prizm Scottie Barnes #303', 2021, '2021-22 Panini Prizm', 'basketball', 'Scottie Barnes', '303', '$15–$35 (PSA 9)', '$200+ (PSA 10)', 'Toronto\'s versatile forward won ROY and has grown into one of the best young players in the East. Barnes\' point-forward skills are elite.', true],
  ['2022-23 Panini Prizm Paolo Banchero #231', 2022, '2022-23 Panini Prizm', 'basketball', 'Paolo Banchero', '231', '$15–$40 (PSA 9)', '$200+ (PSA 10)', 'Orlando\'s franchise centerpiece. Banchero\'s size, handle, and scoring at 6\'10" make him a matchup nightmare for every defense.', true],
  ['2023-24 Panini Prizm Victor Wembanyama #275', 2023, '2023-24 Panini Prizm', 'basketball', 'Victor Wembanyama', '275', '$80–$200 (PSA 9)', '$1,000+ (PSA 10)', 'The generational prospect\'s Prizm RC. Wemby\'s 7\'4" frame, 8\'0" wingspan, and guard skills make him the most unique player in NBA history.', true],
  ['2013-14 Panini Prizm CJ McCollum #253', 2013, '2013-14 Panini Prizm', 'basketball', 'CJ McCollum', '253', '$5–$15 (PSA 9)', '$100+ (PSA 10)', 'Portland\'s smooth scoring guard. McCollum\'s mid-range game and series-clinching shot against Denver in 2019 are iconic.', true],
  ['2014-15 Panini Prizm Nikola Jokic #335', 2014, '2014-15 Panini Prizm', 'basketball', 'Nikola Jokic', '335', '$80–$200 (PSA 9)', '$1,500+ (PSA 10)', 'The Joker. Jokic won 3 consecutive MVPs and led Denver to the 2023 NBA title. The greatest passing big man in NBA history.', true],
  ['2016-17 Panini Prizm Jaylen Brown #44', 2016, '2016-17 Panini Prizm', 'basketball', 'Jaylen Brown', '44', '$15–$40 (PSA 9)', '$200+ (PSA 10)', 'Boston\'s two-way force. Brown\'s athletic finishing and improved shot-making earned him a $300M max extension.', true],
  ['2017-18 Panini Prizm De\'Aaron Fox #24', 2017, '2017-18 Panini Prizm', 'basketball', 'De\'Aaron Fox', '24', '$10–$25 (PSA 9)', '$150+ (PSA 10)', 'Sacramento\'s blazing point guard. Fox\'s speed in transition is genuinely elite — he\'s one of the fastest players in NBA history with the ball.', true],
  ['2018-19 Panini Prizm Trae Young #78', 2018, '2018-19 Panini Prizm', 'basketball', 'Trae Young', '78', '$20–$50 (PSA 9)', '$300+ (PSA 10)', 'Atlanta\'s floor general. Young\'s unlimited range, lob passing, and Madison Square Garden dominance make him must-watch TV.', true],
  ['2019-20 Panini Prizm Tyler Herro #259', 2019, '2019-20 Panini Prizm', 'basketball', 'Tyler Herro', '259', '$5–$15 (PSA 9)', '$100+ (PSA 10)', 'Miami\'s microwave scorer. Herro won 6th Man of the Year and was a key piece of the Heat\'s Finals run.', true],
  ['2022-23 Panini Prizm Jalen Williams #268', 2022, '2022-23 Panini Prizm', 'basketball', 'Jalen Williams', '268', '$8–$20 (PSA 9)', '$100+ (PSA 10)', 'OKC\'s Swiss Army knife. Williams does everything — score, pass, defend, rebound — and does it all at 6\'6" with elite feel for the game.', true],
  ['1996-97 Topps Chrome Ray Allen #217', 1996, '1996-97 Topps Chrome', 'basketball', 'Ray Allen', '217', '$20–$50 (PSA 9)', '$500+ (PSA 10)', 'Jesus Shuttlesworth. Allen\'s clutch Game 6 three in the 2013 Finals is the most important shot this century. Greatest shooter of his era.', true],
  ['2003-04 Topps Chrome Chris Paul #161', 2003, '2003-04 Topps Chrome', 'basketball', 'Chris Paul', '161', '$15–$40 (PSA 9)', '$300+ (PSA 10)', 'The Point God. CP3\'s floor generalship, 11 All-NBA selections, and steals record define the modern point guard position.', true],

  // ===== FOOTBALL (20 new) =====
  ['2021 Panini Prizm Mac Jones #330', 2021, '2021 Panini Prizm', 'football', 'Mac Jones', '330', '$3–$10 (PSA 9)', '$50+ (PSA 10)', 'New England\'s first-round pick from Alabama. Jones\' accuracy and poise earned him the starting job immediately.', true],
  ['2019 Panini Prizm Kyler Murray #301', 2019, '2019 Panini Prizm', 'football', 'Kyler Murray', '301', '$15–$40 (PSA 9)', '$200+ (PSA 10)', 'The #1 pick and two-sport athlete. Murray\'s dual-threat ability earned him ROY and a franchise-altering contract.', true],
  ['2022 Panini Prizm Garrett Wilson #367', 2022, '2022 Panini Prizm', 'football', 'Garrett Wilson', '367', '$8–$20 (PSA 9)', '$100+ (PSA 10)', 'New York\'s electrifying receiver. Wilson won ROY and has emerged as one of the most explosive route runners in the NFL.', true],
  ['2022 Panini Prizm Chris Olave #371', 2022, '2022 Panini Prizm', 'football', 'Chris Olave', '371', '$5–$15 (PSA 9)', '$100+ (PSA 10)', 'New Orleans\' silky-smooth receiver. Olave\'s route running and deep-ball tracking are elite for his age.', true],
  ['2022 Panini Prizm Kenneth Walker III #381', 2022, '2022 Panini Prizm', 'football', 'Kenneth Walker III', '381', '$5–$15 (PSA 9)', '$100+ (PSA 10)', 'Seattle\'s explosive back from Michigan State. Walker\'s cutting ability and breakaway speed make him a home run threat.', true],
  ['2023 Panini Prizm C.J. Stroud #301', 2023, '2023 Panini Prizm', 'football', 'C.J. Stroud', '301', '$20–$50 (PSA 9)', '$200+ (PSA 10)', 'Houston\'s franchise QB had one of the greatest rookie seasons in NFL history, leading the Texans to the playoffs.', true],
  ['2023 Panini Prizm Anthony Richardson #310', 2023, '2023 Panini Prizm', 'football', 'Anthony Richardson', '310', '$10–$25 (PSA 9)', '$100+ (PSA 10)', 'Indianapolis\' physical marvel. Richardson\'s size, arm strength, and rushing ability give him the highest physical ceiling in the class.', true],
  ['2020 Panini Prizm Tua Tagovailoa #320', 2020, '2020 Panini Prizm', 'football', 'Tua Tagovailoa', '320', '$10–$30 (PSA 9)', '$150+ (PSA 10)', 'Miami\'s lefty with the fastest release in the NFL. Tua\'s accuracy and quick processing drive the Dolphins\' explosive offense.', true],
  ['2020 Panini Prizm CeeDee Lamb #314', 2020, '2020 Panini Prizm', 'football', 'CeeDee Lamb', '314', '$15–$35 (PSA 9)', '$200+ (PSA 10)', 'Dallas\' top receiver emerged as one of the best WRs in football. Lamb\'s route running and contested catch ability are elite.', true],
  ['2021 Panini Prizm Micah Parsons #380', 2021, '2021 Panini Prizm', 'football', 'Micah Parsons', '380', '$15–$35 (PSA 9)', '$200+ (PSA 10)', 'The most dominant defensive player in the NFL. Parsons\' ability to rush the passer and drop into coverage is unprecedented.', true],
  ['2018 Panini Prizm Sam Darnold #204', 2018, '2018 Panini Prizm', 'football', 'Sam Darnold', '204', '$2–$5 (PSA 9)', '$30+ (PSA 10)', 'The former #3 overall pick found new life in Minnesota. Darnold\'s arm talent and pocket presence keep him in starting conversations.', true],
  ['2021 Panini Prizm Najee Harris #337', 2021, '2021 Panini Prizm', 'football', 'Najee Harris', '337', '$5–$15 (PSA 9)', '$80+ (PSA 10)', 'Pittsburgh\'s workhorse back from Alabama. Harris\' receiving ability and durability as a three-down back keep him relevant.', true],
  ['2020 Panini Prizm Chase Young #383', 2020, '2020 Panini Prizm', 'football', 'Chase Young', '383', '$5–$15 (PSA 9)', '$80+ (PSA 10)', 'The #2 overall pick and former Defensive ROY. Young\'s pass rushing ability off the edge was generational coming out of Ohio State.', true],
  ['2022 Panini Prizm Jalen Carter #396', 2022, '2022 Panini Prizm', 'football', 'Jalen Carter', '396', '$5–$15 (PSA 9)', '$80+ (PSA 10)', 'Philadelphia\'s interior force. Carter\'s combination of power and quickness on the defensive line disrupts every offense.', true],
  ['2023 Panini Prizm Will Anderson Jr. #315', 2023, '2023 Panini Prizm', 'football', 'Will Anderson Jr.', '315', '$8–$20 (PSA 9)', '$100+ (PSA 10)', 'Houston\'s pass rush terror. Anderson\'s DROY season showed he can be the NFL\'s next dominant edge rusher.', true],

  // ===== HOCKEY (18 new) =====
  ['1990-91 Score Sergei Fedorov #328', 1990, '1990-91 Score', 'hockey', 'Sergei Fedorov', '328', '$3–$10 (PSA 9)', '$100+ (PSA 10)', 'The most complete two-way forward of his era. Fedorov won the Hart Trophy, Selke Trophy, and 3 Stanley Cups with Detroit.', true],
  ['2003-04 Upper Deck Alexander Ovechkin #443', 2003, '2003-04 Upper Deck', 'hockey', 'Alexander Ovechkin', '443', '$100–$300 (PSA 9)', '$3,000+ (PSA 10)', 'The Great Eight\'s Young Guns RC. Ovechkin\'s 800+ career goals are approaching Wayne Gretzky\'s all-time record.', true],
  ['2005-06 Upper Deck Sidney Crosby #201', 2005, '2005-06 Upper Deck', 'hockey', 'Sidney Crosby', '201', '$200–$500 (PSA 9)', '$5,000+ (PSA 10)', 'Sid the Kid\'s Young Guns RC. Crosby\'s 3 Stanley Cups, 2 Conn Smythes, and 2 Hart Trophies define hockey excellence.', true],
  ['2016-17 Upper Deck Auston Matthews #201', 2016, '2016-17 Upper Deck', 'hockey', 'Auston Matthews', '201', '$80–$200 (PSA 9)', '$2,000+ (PSA 10)', 'Toronto\'s franchise center scored 4 goals in his NHL debut. Matthews won the Rocket Richard Trophy with 60+ goals.', true],
  ['2019-20 Upper Deck Cale Makar #222', 2019, '2019-20 Upper Deck', 'hockey', 'Cale Makar', '222', '$30–$80 (PSA 9)', '$500+ (PSA 10)', 'Colorado\'s dynamic defenseman won the Norris and Conn Smythe in back-to-back seasons. Makar is the best D-man of his generation.', true],
  ['2019-20 Upper Deck Quinn Hughes #249', 2019, '2019-20 Upper Deck', 'hockey', 'Quinn Hughes', '249', '$10–$25 (PSA 9)', '$200+ (PSA 10)', 'Vancouver\'s fleet-footed defenseman. Hughes\' skating and playmaking earned him a Norris Trophy nomination by age 23.', true],
  ['2020-21 Upper Deck Tim Stutzle #482', 2020, '2020-21 Upper Deck', 'hockey', 'Tim Stutzle', '482', '$10–$25 (PSA 9)', '$200+ (PSA 10)', 'Ottawa\'s German-born star. Stutzle\'s offensive creativity and speed project him as a perennial point-per-game player.', true],
  ['2020-21 Upper Deck Trevor Zegras #451', 2020, '2020-21 Upper Deck', 'hockey', 'Trevor Zegras', '451', '$10–$25 (PSA 9)', '$200+ (PSA 10)', 'Anaheim\'s creative genius. Zegras\' Michigan goal went viral and established him as hockey\'s most entertaining young player.', true],
  ['2022-23 Upper Deck Connor Bedard #201', 2022, '2022-23 Upper Deck', 'hockey', 'Connor Bedard', '201', '$80–$200 (PSA 9)', '$1,500+ (PSA 10)', 'The #1 overall pick and generational talent. Bedard\'s skill set at 18 drew comparisons to Connor McDavid and Sidney Crosby.', true],
  ['2019-20 Upper Deck Kirby Dach #226', 2019, '2019-20 Upper Deck', 'hockey', 'Kirby Dach', '226', '$3–$10 (PSA 9)', '$100+ (PSA 10)', 'Montreal\'s young center after a trade from Chicago. Dach\'s size and skill at 6\'4" make him a top-six forward with high upside.', true],
  ['2016-17 Upper Deck Mitch Marner #223', 2016, '2016-17 Upper Deck', 'hockey', 'Mitch Marner', '223', '$20–$50 (PSA 9)', '$400+ (PSA 10)', 'Toronto\'s playmaking wizard. Marner\'s vision and passing ability make him one of the best setup men in the NHL.', true],
  ['2017-18 Upper Deck Brock Boeser #221', 2017, '2017-18 Upper Deck', 'hockey', 'Brock Boeser', '221', '$8–$20 (PSA 9)', '$150+ (PSA 10)', 'Vancouver\'s sniper. Boeser\'s shot release and power-play production make him one of the most dangerous finishers in the Pacific.', true],
  ['2018-19 Upper Deck Elias Pettersson #248', 2018, '2018-19 Upper Deck', 'hockey', 'Elias Pettersson', '248', '$20–$50 (PSA 9)', '$300+ (PSA 10)', 'Vancouver\'s Swedish franchise center. Pettersson\'s vision, skating, and two-way play earned him the Calder Trophy.', true],
  ['2017-18 Upper Deck Charlie McAvoy #227', 2017, '2017-18 Upper Deck', 'hockey', 'Charlie McAvoy', '227', '$10–$25 (PSA 9)', '$150+ (PSA 10)', 'Boston\'s shutdown defenseman. McAvoy\'s physicality and skating at 6\'1" make him one of the NHL\'s most reliable two-way D-men.', true],
  ['2021-22 Upper Deck Mason McTavish #469', 2021, '2021-22 Upper Deck', 'hockey', 'Mason McTavish', '469', '$5–$15 (PSA 9)', '$100+ (PSA 10)', 'Anaheim\'s power center. McTavish\'s physical play and scoring touch at 6\'1" project a franchise center role for the Ducks rebuild.', true],
  ['2018-19 Upper Deck Brady Tkachuk #499', 2018, '2018-19 Upper Deck', 'hockey', 'Brady Tkachuk', '499', '$10–$25 (PSA 9)', '$150+ (PSA 10)', 'Ottawa\'s captain and pest extraordinaire. Tkachuk\'s power forward game combines scoring, hitting, and agitation into one package.', true],
  ['2021-22 Upper Deck Lucas Raymond #475', 2021, '2021-22 Upper Deck', 'hockey', 'Lucas Raymond', '475', '$8–$20 (PSA 9)', '$150+ (PSA 10)', 'Detroit\'s silky Swedish winger. Raymond\'s offensive instincts and playmaking have made him the cornerstone of the Red Wings rebuild.', true],
  ['2022-23 Upper Deck Logan Cooley #481', 2022, '2022-23 Upper Deck', 'hockey', 'Logan Cooley', '481', '$10–$25 (PSA 9)', '$200+ (PSA 10)', 'Arizona\'s speedy center from the University of Minnesota. Cooley\'s skating and offensive IQ made him the #3 overall pick.', true],
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
  'hank aaron': '44',
  'julio rodriguez': '44', 'corbin carroll': '7', 'jackson holliday': '1', 'paul skenes': '30',
  'roki sasaki': '17', 'yordan alvarez': '44', 'bo bichette': '11', 'bobby witt jr.': '7',
  'riley greene': '31', 'adley rutschman': '35', 'greg maddux': '31', 'roberto alomar': '12',
  'frank thomas': '35', 'kyle tucker': '30', 'evan carter': '33', 'spencer strider': '99',
  'jackson merrill': '3', 'kirby puckett': '34', 'mookie betts': '50',
  'larry bird': '33', 'magic johnson': '32',
  'james harden': '1', 'kawhi leonard': '2',
  'cade cunningham': '2', 'scottie barnes': '4', 'paolo banchero': '5',
  'cj mccollum': '3', 'nikola jokic': '15', 'jaylen brown': '7', 'de\'aaron fox': '5',
  'trae young': '11', 'tyler herro': '14', 'jalen williams': '8', 'ray allen': '34',
  'chris paul': '3',
  'mac jones': '10', 'kyler murray': '1', 'garrett wilson': '17', 'chris olave': '12',
  'kenneth walker iii': '9', 'c.j. stroud': '7', 'anthony richardson': '5',
  'tua tagovailoa': '1', 'micah parsons': '11',
  'sam darnold': '14', 'najee harris': '22', 'chase young': '56', 'jalen carter': '98',
  'will anderson jr.': '3',
  'sergei fedorov': '91', 'alexander ovechkin': '8', 'sidney crosby': '87',
  'auston matthews': '34', 'cale makar': '8', 'quinn hughes': '43', 'tim stutzle': '18',
  'trevor zegras': '11', 'connor bedard': '98', 'kirby dach': '77', 'mitch marner': '16',
  'brock boeser': '6', 'elias pettersson': '40', 'charlie mcavoy': '73',
  'mason mctavish': '14', 'brady tkachuk': '7', 'lucas raymond': '23', 'logan cooley': '92',
};

const jerseyLines = Object.entries(jerseyMap).map(([k, v]) => `  '${k}': '${v}',`);

console.log('=== CARD ENTRIES ===');
console.log(lines.join('\n'));
console.log('\n=== JERSEY ENTRIES ===');
console.log('  // v2.12 additions');
console.log(jerseyLines.join('\n'));
console.log(`\n=== STATS: ${cards.length} cards, ${Object.keys(jerseyMap).length} jersey entries ===`);
