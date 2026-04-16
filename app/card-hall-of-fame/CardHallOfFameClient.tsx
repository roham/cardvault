'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

type Sport = 'all' | 'MLB' | 'NBA' | 'NFL' | 'NHL' | 'Multi';
type Era = 'all' | 'pre-war' | 'golden-age' | 'classic' | 'junk-wax' | 'modern' | 'current';
type Tier = 'all' | 'inner-circle' | 'hall-of-fame' | 'honors';

interface HofCard {
  rank: number;
  year: number;
  sport: Exclude<Sport, 'all'>;
  player: string;
  setName: string;
  tier: Exclude<Tier, 'all'>;
  era: Exclude<Era, 'all'>;
  significance: number;
  icon: string;
  story: string;
  inductionReason: string;
}

const ERA_LABEL: Record<Exclude<Era, 'all'>, string> = {
  'pre-war': 'Pre-War (1909–1940)',
  'golden-age': 'Golden Age (1948–1959)',
  'classic': 'Classic (1960–1979)',
  'junk-wax': 'Junk Wax (1980–1995)',
  'modern': 'Modern (1996–2015)',
  'current': 'Current (2016–Today)',
};

const SPORT_EMOJI: Record<Exclude<Sport, 'all'>, string> = {
  MLB: '⚾', NBA: '🏀', NFL: '🏈', NHL: '🏒', Multi: '🏆',
};

const TIER_LABEL: Record<Exclude<Tier, 'all'>, string> = {
  'inner-circle': 'Inner Circle',
  'hall-of-fame': 'Hall of Fame',
  'honors': 'Honors Wing',
};

const TIER_STYLE: Record<Exclude<Tier, 'all'>, string> = {
  'inner-circle': 'from-amber-500/20 to-yellow-600/10 border-amber-500/40 text-amber-300',
  'hall-of-fame': 'from-slate-400/20 to-slate-500/10 border-slate-400/40 text-slate-200',
  'honors': 'from-orange-600/20 to-rose-600/10 border-orange-600/40 text-orange-300',
};

const CARDS: HofCard[] = [
  // Inner Circle — the 10 most iconic cards ever printed
  { rank: 1, year: 1909, sport: 'MLB', player: 'Honus Wagner', setName: 'T206 (American Tobacco)', tier: 'inner-circle', era: 'pre-war', significance: 10, icon: '👑',
    story: 'Fewer than 60 authenticated copies exist. Wagner refused to let his likeness promote tobacco products, halting the print run. A PSA 3 sold for $7.25M in 2022.',
    inductionReason: 'The single most famous trading card ever made. Every hobby discussion eventually circles back to this card.' },
  { rank: 2, year: 1952, sport: 'MLB', player: 'Mickey Mantle', setName: 'Topps #311', tier: 'inner-circle', era: 'golden-age', significance: 10, icon: '🗽',
    story: 'The first card in the high-number series; thousands of unsold 1952 Topps cases were famously dumped in the Atlantic Ocean. A PSA 9 sold for $12.6M in 2022 — the most expensive sports card ever.',
    inductionReason: 'The "Mona Lisa" of baseball cards. Set the template for post-war Topps design.' },
  { rank: 3, year: 1933, sport: 'MLB', player: 'Babe Ruth', setName: 'Goudey #53', tier: 'inner-circle', era: 'pre-war', significance: 10, icon: '🏟️',
    story: 'Four Ruth cards appeared in the 1933 Goudey set; #53 (yellow background) is the most iconic. A PSA 9 sold for $7.2M in 2023.',
    inductionReason: 'The definitive Babe Ruth card and the keystone of Depression-era cardboard.' },
  { rank: 4, year: 1979, sport: 'NHL', player: 'Wayne Gretzky', setName: 'O-Pee-Chee #18', tier: 'inner-circle', era: 'classic', significance: 10, icon: '🥅',
    story: 'The O-Pee-Chee version is scarcer than the Topps parallel. The best known PSA 10 copy sold for $3.75M in 2021. Centering is nearly impossible at gem mint.',
    inductionReason: 'The single most valuable post-WWII card outside the Mantle 52. Hockey\'s gold standard.' },
  { rank: 5, year: 1986, sport: 'NBA', player: 'Michael Jordan', setName: 'Fleer #57', tier: 'inner-circle', era: 'junk-wax', significance: 10, icon: '🐂',
    story: 'Jordan\'s widely-recognized rookie (Star Company 1984 is his XRC). PSA 10s regularly clear $500K; a BGS 10 once hit $840K.',
    inductionReason: 'Defined the concept of a blue-chip basketball card. Every modern NBA rookie is priced in reference to it.' },
  { rank: 6, year: 2000, sport: 'NFL', player: 'Tom Brady', setName: 'Playoff Contenders Championship Ticket Auto #144', tier: 'inner-circle', era: 'modern', significance: 10, icon: '🐐',
    story: '100 copies printed; auto on-card. The Logan Paul copy (BGS 9.5/10) sold for $3.1M in 2021 — the record for any post-2000 card.',
    inductionReason: 'The single most important modern football card. Redefined what a 6th-round pick\'s rookie could be worth.' },
  { rank: 7, year: 1951, sport: 'MLB', player: 'Mickey Mantle', setName: 'Bowman #253', tier: 'inner-circle', era: 'golden-age', significance: 10, icon: '🌟',
    story: 'Mantle\'s true rookie card — predates the 1952 Topps by a year. A PSA 9 sold for $2.8M. Iconic painted-portrait style.',
    inductionReason: 'The technically-correct answer to "what is Mantle\'s rookie card." A cornerstone of any vintage collection.' },
  { rank: 8, year: 1966, sport: 'NHL', player: 'Bobby Orr', setName: 'Topps USA Test #35', tier: 'inner-circle', era: 'classic', significance: 9, icon: '🛡️',
    story: 'Orr revolutionized the defenseman position — scoring like a forward from the back end. The USA Test variation is the rarest pre-rookie.',
    inductionReason: 'The defenseman who changed hockey. Every two-way defenseman is measured against this card\'s subject.' },
  { rank: 9, year: 2003, sport: 'NBA', player: 'LeBron James', setName: 'Topps Chrome Refractor #111', tier: 'inner-circle', era: 'modern', significance: 9, icon: '👑',
    story: '/500 printed. PSA 10s clear $200K. The definitive modern NBA rookie — no modern player has a clearer "definitive RC" than LeBron.',
    inductionReason: 'The moment modern chrome rookies became investment-grade. Set the playbook for every subsequent Prizm/Select hit.' },
  { rank: 10, year: 1948, sport: 'MLB', player: 'Jackie Robinson', setName: 'Leaf #79', tier: 'inner-circle', era: 'golden-age', significance: 10, icon: '🕊️',
    story: 'Robinson broke baseball\'s color barrier in 1947. His 1948 Leaf rookie is the most important rookie card in American sports for reasons beyond the hobby.',
    inductionReason: 'The card that carries the most cultural weight of any in the pantheon. Not just iconic — historically indispensable.' },

  // Hall of Fame — the next tier of all-time greats
  { rank: 11, year: 1989, sport: 'MLB', player: 'Ken Griffey Jr.', setName: 'Upper Deck #1', tier: 'hall-of-fame', era: 'junk-wax', significance: 9, icon: '✨',
    story: 'Card #1 in Upper Deck\'s debut set. Considered the rookie that signaled the modern premium-card era and single-handedly rescued card collecting from the late-80s glut.',
    inductionReason: 'The card that made "rookie card" a marketing category. Still affordable in low grades — a rite of passage for every collector.' },
  { rank: 12, year: 1984, sport: 'NBA', player: 'Michael Jordan', setName: 'Star Company XRC', tier: 'hall-of-fame', era: 'classic', significance: 9, icon: '⭐',
    story: 'The true Jordan XRC — issued via team-set distribution, not traditional retail. Hobby purists argue this is his real rookie, not the 1986 Fleer.',
    inductionReason: 'The technical rookie. A card that settles arguments and rewards collectors who go deep.' },
  { rank: 13, year: 2011, sport: 'MLB', player: 'Mike Trout', setName: 'Bowman Chrome Draft Auto Superfractor', tier: 'hall-of-fame', era: 'current', significance: 9, icon: '🎣',
    story: '1-of-1. The copy Trout personally owned before it was acquired by a collector for a reported $3.9M — the first modern non-Brady card to cross $3M.',
    inductionReason: 'The modern MLB equivalent of the 1952 Mantle. One copy, infinite demand.' },
  { rank: 14, year: 1957, sport: 'NBA', player: 'Bill Russell', setName: 'Topps #77', tier: 'hall-of-fame', era: 'golden-age', significance: 8, icon: '💍',
    story: 'Russell won 11 titles in 13 seasons. His 1957 Topps is the earliest-era Hall of Fame NBA rookie alongside the 1948 Bowman Mikan.',
    inductionReason: 'The winningest player ever gets one of the earliest premium NBA rookies. Historically weighty.' },
  { rank: 15, year: 1981, sport: 'NFL', player: 'Joe Montana', setName: 'Topps #216', tier: 'hall-of-fame', era: 'classic', significance: 9, icon: '🏆',
    story: '4x Super Bowl champion, 3x SB MVP. His Topps rookie was underrated for years until the post-2020 boom re-priced every football rookie before 2000.',
    inductionReason: 'Pre-Brady, this was THE football GOAT card. The benchmark for vintage NFL QBs.' },
  { rank: 16, year: 1986, sport: 'NFL', player: 'Jerry Rice', setName: 'Topps #161', tier: 'hall-of-fame', era: 'junk-wax', significance: 8, icon: '🏃',
    story: '3x Super Bowl champion, all-time receiving leader in every major category. PSA 10 rookies are condition-sensitive — centering and corners are the chase.',
    inductionReason: 'The greatest receiver ever. Pairs iconically with Montana for the classic 49ers duo.' },
  { rank: 17, year: 1969, sport: 'NBA', player: 'Lew Alcindor (Kareem)', setName: 'Topps #25', tier: 'hall-of-fame', era: 'classic', significance: 9, icon: '☁️',
    story: '6x NBA champion, 6x MVP, was the all-time scoring leader until LeBron. Listed under his birth name before his conversion to Islam.',
    inductionReason: 'The most decorated player in NBA history gets the most iconic late-60s basketball card.' },
  { rank: 18, year: 1996, sport: 'NBA', player: 'Kobe Bryant', setName: 'Topps Chrome #138', tier: 'hall-of-fame', era: 'modern', significance: 9, icon: '🎯',
    story: '5x champion, 18x All-Star, Mamba Mentality icon. Demand spiked after his tragic death in 2020; PSA 10 Refractors regularly clear $150K.',
    inductionReason: 'The chrome refractor era\'s definitive basketball rookie. Generational appeal.' },
  { rank: 19, year: 1965, sport: 'NFL', player: 'Joe Namath', setName: 'Topps Tall Boys #122', tier: 'hall-of-fame', era: 'classic', significance: 8, icon: '🎖️',
    story: 'The Super Bowl III guarantee made Namath a cultural icon. The tall-boy format is iconic to the 1965 Topps football set.',
    inductionReason: 'First AFL Super Bowl winner; pivotal card in football\'s cultural rise.' },
  { rank: 20, year: 1951, sport: 'NHL', player: 'Gordie Howe', setName: 'Parkhurst #66', tier: 'hall-of-fame', era: 'golden-age', significance: 9, icon: '🔨',
    story: 'Mr. Hockey played 26 NHL seasons. The 1951-52 Parkhurst is hockey\'s equivalent of the 1952 Topps — thin stock, brutal centering.',
    inductionReason: 'Hockey\'s most durable legend gets the hardest-to-find vintage rookie.' },
  { rank: 21, year: 1985, sport: 'NHL', player: 'Mario Lemieux', setName: 'O-Pee-Chee #9', tier: 'hall-of-fame', era: 'classic', significance: 9, icon: '✨',
    story: 'Le Magnifique. 2x champion, 3x MVP, came back from cancer to post 76 points in 43 games. Centering is the enemy; PSA 10s are four-figure rare.',
    inductionReason: 'The second-greatest hockey player ever by most rankings. An essential OPC rookie.' },
  { rank: 22, year: 1990, sport: 'NHL', player: 'Jaromir Jagr', setName: 'O-Pee-Chee Premier #50', tier: 'hall-of-fame', era: 'junk-wax', significance: 8, icon: '🦁',
    story: '#2 all-time NHL points (behind Gretzky). Still playing professionally past age 50 in Czech Extraliga. Premier was OPC\'s first premium set.',
    inductionReason: 'The longevity legend. Every hockey collector under 50 started with this card as their gateway to chase cards.' },
  { rank: 23, year: 2005, sport: 'NHL', player: 'Sidney Crosby', setName: 'The Cup RC Auto Patch /99', tier: 'hall-of-fame', era: 'modern', significance: 10, icon: '💎',
    story: '/99. The single most important modern hockey card. A BGS 9.5/10 sold for $1.29M in 2021 — a record for any hockey card.',
    inductionReason: 'The crown jewel of modern hockey. Every high-end hockey box release is still measured against The Cup.' },
  { rank: 24, year: 2015, sport: 'NHL', player: 'Connor McDavid', setName: 'Upper Deck Young Guns #201', tier: 'hall-of-fame', era: 'current', significance: 9, icon: '⚡',
    story: '3x MVP. Young Guns is the hobby\'s most successful rookie format — a democratic RC available in $5 packs that still rules the chase.',
    inductionReason: 'The best player alive in hockey. Proves Young Guns is the most efficient rookie-card platform in sports.' },
  { rank: 25, year: 2018, sport: 'NBA', player: 'Luka Doncic', setName: 'Panini Prizm #280', tier: 'hall-of-fame', era: 'current', significance: 9, icon: '🇸🇮',
    story: 'Base Prizm sells for $100; Silver Prizm clears $1,000; Gold Prizm /10 has crossed $300K. The Prizm format made modern basketball collecting mainstream.',
    inductionReason: 'The European import who broke the chrome era wide open. Defines the 2010s-2020s basketball rookie.' },
  { rank: 26, year: 2018, sport: 'MLB', player: 'Shohei Ohtani', setName: 'Topps Update #US1', tier: 'hall-of-fame', era: 'current', significance: 10, icon: '🦄',
    story: 'The first two-way MLB player since Babe Ruth. His dual-role season in 2021 broke what was considered possible. The base Topps Update RC spiked 20x in under 4 years.',
    inductionReason: 'Generational uniqueness. No one in any modern era has altered what\'s possible on the diamond like Ohtani.' },
  { rank: 27, year: 1993, sport: 'MLB', player: 'Derek Jeter', setName: 'SP #279', tier: 'hall-of-fame', era: 'junk-wax', significance: 8, icon: '🗽',
    story: '5x champion, 14x All-Star, Mr. November. SP rookies have razor-thin borders — PSA 10s are population-rare and command a massive premium.',
    inductionReason: 'The modern Yankee captain. Iconic card with a notoriously difficult grading profile.' },
  { rank: 28, year: 2001, sport: 'MLB', player: 'Albert Pujols', setName: 'Bowman Chrome Auto #340', tier: 'hall-of-fame', era: 'modern', significance: 8, icon: '🔥',
    story: '700+ career HRs, 3x MVP, 2x champion. One of only four players with 700 HRs / 2,000 RBI / 3,000 hits.',
    inductionReason: 'The most productive right-handed power hitter of the modern era. Bowman Chrome\'s crown jewel from 2001.' },
  { rank: 29, year: 2001, sport: 'MLB', player: 'Ichiro Suzuki', setName: 'Bowman Chrome #139', tier: 'hall-of-fame', era: 'modern', significance: 8, icon: '🎌',
    story: 'Combined NPB + MLB: 4,367 hits, more than Pete Rose. His MLB rookie year: AL MVP, ROY, batting title, stolen base title.',
    inductionReason: 'Opened Japan\'s pipeline to MLB. His 2001 rookie class alongside Pujols is the strongest in modern history.' },
  { rank: 30, year: 1989, sport: 'NFL', player: 'Barry Sanders', setName: 'Score #257', tier: 'hall-of-fame', era: 'junk-wax', significance: 8, icon: '💨',
    story: 'The most elusive runner ever. Retired at 30 while chasing the all-time rushing record — left 1,457 yards shy of Payton.',
    inductionReason: 'Short-career mythology. What-if appeal that intensifies every year.' },
  { rank: 31, year: 2017, sport: 'NFL', player: 'Patrick Mahomes', setName: 'Panini Prizm #269', tier: 'hall-of-fame', era: 'current', significance: 9, icon: '👑',
    story: '3x Super Bowl champion, 2x MVP. The heir to Brady. Silver Prizm PSA 10s have crossed $15K during his Super Bowl runs.',
    inductionReason: 'The current-day GOAT trajectory QB. Already re-defines what modern football rookies are worth.' },
  { rank: 32, year: 1980, sport: 'NBA', player: 'Larry Bird / Magic Johnson / Julius Erving', setName: 'Topps #6', tier: 'hall-of-fame', era: 'classic', significance: 10, icon: '🃏',
    story: 'A three-panel card with three Hall of Famers. The perforated "tri-star" format is unique in basketball card history.',
    inductionReason: 'Three HOF rookies on one card — the best-value entry point to vintage NBA. A crown jewel concept.' },
  { rank: 33, year: 2009, sport: 'NBA', player: 'Stephen Curry', setName: 'Topps Chrome #101', tier: 'hall-of-fame', era: 'modern', significance: 8, icon: '🎯',
    story: '4x champion, 2x MVP, all-time 3P leader. Curry rewrote the shot chart of the entire league.',
    inductionReason: 'The player who changed how basketball is played. A chrome refractor RC in the mold of the Kobe 96.' },
  { rank: 34, year: 2013, sport: 'NBA', player: 'Giannis Antetokounmpo', setName: 'Panini Select Concourse #168', tier: 'hall-of-fame', era: 'modern', significance: 7, icon: '🇬🇷',
    story: '2x MVP, 2021 champion, Finals MVP. From selling trinkets in Athens to Bucks legend — the best single-career arc in modern NBA.',
    inductionReason: 'Underdog-to-champion mythology. Underrated Select rookie that routinely breaks records.' },
  { rank: 35, year: 2001, sport: 'Multi', player: 'Tiger Woods', setName: 'Upper Deck Golf #1', tier: 'hall-of-fame', era: 'modern', significance: 9, icon: '⛳',
    story: '15x major champion. The only golfer with a mainstream rookie card. PSA 10s cleared $1M during the 2020 collector boom.',
    inductionReason: 'Golf\'s singular iconic card. Proves sport-crossover rookies can carry the pantheon.' },
  { rank: 36, year: 1955, sport: 'MLB', player: 'Roberto Clemente', setName: 'Topps #164', tier: 'hall-of-fame', era: 'golden-age', significance: 8, icon: '🇵🇷',
    story: 'First Latino player in the Hall of Fame. Died in a 1972 plane crash delivering earthquake relief to Nicaragua — his 3,000th hit came 3 months earlier.',
    inductionReason: 'Cultural pillar. The most important Latino player in baseball history.' },
  { rank: 37, year: 1975, sport: 'MLB', player: 'George Brett', setName: 'Topps #228', tier: 'hall-of-fame', era: 'classic', significance: 7, icon: '🏏',
    story: 'The only player with 3,000 hits, 300 HRs, and a .300 lifetime average. The 1980 .390 season is the closest anyone has come to .400 since Ted Williams.',
    inductionReason: 'The 1975 Topps set is the most colorful vintage design ever. Brett is its headliner.' },
  { rank: 38, year: 1975, sport: 'MLB', player: 'Robin Yount', setName: 'Topps #223', tier: 'hall-of-fame', era: 'classic', significance: 7, icon: '🌾',
    story: '2x MVP at two different positions (SS and CF). Debuted at 18, retired with 3,142 hits.',
    inductionReason: '1975 Topps\'s other HOF rookie. Teammate to George Brett in the pantheon of 1975 Topps.' },
  { rank: 39, year: 1955, sport: 'MLB', player: 'Sandy Koufax', setName: 'Topps #123', tier: 'hall-of-fame', era: 'golden-age', significance: 8, icon: '⚡',
    story: '4x champion, 3x Cy Young, retired at 30 due to arthritis. His final 4 seasons: 97-27, 1.86 ERA.',
    inductionReason: 'Peak pitcher. The Koufax peak is the mountain every modern pitcher is compared to.' },
  { rank: 40, year: 1989, sport: 'NFL', player: 'Troy Aikman', setName: 'Score #270', tier: 'hall-of-fame', era: 'junk-wax', significance: 7, icon: '🌟',
    story: '3x Super Bowl champion in 4 years. Score was the underdog brand in 1989 but produced the cleanest design.',
    inductionReason: 'The original Score rookie renaissance. Stands alongside Sanders as the top 1989 Score rookie.' },
  { rank: 41, year: 1954, sport: 'MLB', player: 'Hank Aaron', setName: 'Topps #128', tier: 'hall-of-fame', era: 'golden-age', significance: 9, icon: '🏆',
    story: '755 HRs, 2,297 RBIs (all-time leader), 25x All-Star. Broke Ruth\'s HR record in 1974 amid racist death threats.',
    inductionReason: 'The home run king. A cultural and statistical giant.' },
  { rank: 42, year: 1954, sport: 'MLB', player: 'Ernie Banks', setName: 'Topps #94', tier: 'hall-of-fame', era: 'golden-age', significance: 7, icon: '🌞',
    story: 'Mr. Cub. 2x MVP at shortstop — unprecedented for a power-hitting SS. "Let\'s play two."',
    inductionReason: 'The original shortstop power prototype. Chicago\'s eternal goodwill ambassador.' },
  { rank: 43, year: 1978, sport: 'NHL', player: 'Mike Bossy', setName: 'O-Pee-Chee #115', tier: 'hall-of-fame', era: 'classic', significance: 7, icon: '🥍',
    story: '4x Stanley Cup champion, 9 straight 50-goal seasons. Retired at 30 due to back injuries — his pace was Gretzky-adjacent.',
    inductionReason: 'Short career, staggering rate stats. The hockey equivalent of Sandy Koufax\'s peak.' },
  { rank: 44, year: 1948, sport: 'NBA', player: 'George Mikan', setName: 'Bowman #69', tier: 'hall-of-fame', era: 'golden-age', significance: 8, icon: '🌆',
    story: 'The original NBA superstar. 5x champion before 30. The 24-second shot clock and goaltending rule both exist because of Mikan.',
    inductionReason: 'The first card that justified a pre-1960 basketball RC. The NBA\'s founding father.' },
  { rank: 45, year: 1972, sport: 'NFL', player: 'Franco Harris / Roger Staubach (Dallas)', setName: 'Topps #200 (Staubach RC)', tier: 'hall-of-fame', era: 'classic', significance: 7, icon: '⭐',
    story: 'Staubach\'s 1972 Topps rookie is the key football RC of the early 70s. The Cowboys dynasty\'s founding document.',
    inductionReason: '1972 Topps was the last 3-series release; getting Staubach in high-number form is pure vintage chase.' },
  { rank: 46, year: 1979, sport: 'NHL', player: 'Bobby Clarke / Mark Howe / Dan Bouchard', setName: 'O-Pee-Chee puzzle back team insert', tier: 'hall-of-fame', era: 'classic', significance: 6, icon: '🧩',
    story: 'The 1979-80 OPC set contains the Gretzky RC and a cast of 70s-era HOF filler cards. A gateway vintage set.',
    inductionReason: 'The set that launched a thousand hockey collections. A complete 1979-80 OPC is a rite of passage.' },
  { rank: 47, year: 1986, sport: 'NBA', player: 'Hakeem Olajuwon / Patrick Ewing', setName: 'Fleer #82 (Olajuwon RC)', tier: 'hall-of-fame', era: 'junk-wax', significance: 7, icon: '🏙️',
    story: 'The 1986 Fleer set is the single greatest basketball set ever printed: Jordan, Olajuwon, Ewing, Barkley, Stockton, Drexler all in one product.',
    inductionReason: 'The set that made basketball cards a legitimate investment category.' },
  { rank: 48, year: 1984, sport: 'MLB', player: 'Don Mattingly', setName: 'Donruss #248', tier: 'hall-of-fame', era: 'junk-wax', significance: 6, icon: '🗽',
    story: '1985 AL MVP. 1984 Donruss was a short-printed set (compared to Topps/Fleer), and the Mattingly is its headliner rookie.',
    inductionReason: 'The original "was he really a rookie card king?" debate. Iconic to 80s Yankee collectors.' },
  { rank: 49, year: 1989, sport: 'MLB', player: 'Randy Johnson', setName: 'Donruss #42', tier: 'hall-of-fame', era: 'junk-wax', significance: 6, icon: '🎯',
    story: '4,875 career strikeouts (2nd all-time), 5x Cy Young, 2001 co-MVP.',
    inductionReason: 'The Big Unit. Left-handed fastball pitcher archetype forever.' },
  { rank: 50, year: 2001, sport: 'MLB', player: 'Chipper Jones', setName: 'Bowman Chrome #348 Refractor', tier: 'hall-of-fame', era: 'modern', significance: 6, icon: '🌲',
    story: '.303/.401/.529, 1999 MVP. Bowman Chrome Refractors from 2001 have become the modern vintage.',
    inductionReason: 'Refractor era landmark. Arguably the best-designed Bowman Chrome insert year.' },

  // Honors — modern cards that have entered the conversation
  { rank: 51, year: 2020, sport: 'NBA', player: 'LaMelo Ball', setName: 'Panini Prizm #278', tier: 'honors', era: 'current', significance: 7, icon: '🐻',
    story: 'ROY 2021. Silver Prizm PSA 10s have cleared $5K. Part of the "Big Baller" cultural wave that sold cards to a new audience.',
    inductionReason: 'The post-2020 collecting-boom headliner alongside Anthony Edwards.' },
  { rank: 52, year: 2020, sport: 'NFL', player: 'Justin Herbert', setName: 'Panini Prizm #1', tier: 'honors', era: 'current', significance: 7, icon: '🐉',
    story: 'OROY 2020. The first-card-in-the-set numbering carries premium demand; Silver Prizm rookies crossed $3K at peak.',
    inductionReason: 'Prizm #1 in a banner rookie class. Pairs iconically with Burrow (#307).' },
  { rank: 53, year: 2019, sport: 'NBA', player: 'Ja Morant', setName: 'Panini Prizm #249', tier: 'honors', era: 'current', significance: 6, icon: '🚀',
    story: 'ROY 2020. Jumps into the pantheon whenever he\'s on the court; injury volatility keeps the card cheap enough to still be a buy.',
    inductionReason: 'Volatility icon. Exemplifies the risk/reward of honoring current-era cards.' },
  { rank: 54, year: 2018, sport: 'MLB', player: 'Ronald Acuna Jr.', setName: 'Topps Chrome #193', tier: 'honors', era: 'current', significance: 7, icon: '🇻🇪',
    story: 'First 40/70 season in MLB history (2023). 2023 NL MVP. The most exciting player in baseball by multiple measures.',
    inductionReason: 'The current face of MLB marketing. Chrome rookies in the Soto/Acuna/Guerrero class are the new standard.' },
  { rank: 55, year: 2017, sport: 'NBA', player: 'Jayson Tatum', setName: 'Panini Prizm #7', tier: 'honors', era: 'current', significance: 6, icon: '🍀',
    story: '2024 NBA champion, 5x All-Star. A top-3 player in the NBA by age 25.',
    inductionReason: 'The quietest Hall-of-Fame trajectory in the current NBA. Championship-era Celtics\' cornerstone.' },
  { rank: 56, year: 2017, sport: 'MLB', player: 'Aaron Judge', setName: 'Topps Update #US1', tier: 'honors', era: 'current', significance: 7, icon: '⚖️',
    story: '62 HRs in 2022 (AL record). 2022 AL MVP. Yankees captain.',
    inductionReason: 'Modern AL home run king. The first AL player to break Maris\'s 61 cleanly.' },
  { rank: 57, year: 2020, sport: 'NFL', player: 'Joe Burrow', setName: 'Panini Prizm #307', tier: 'honors', era: 'current', significance: 7, icon: '😼',
    story: 'The Burrow rookie class (alongside Herbert, Jefferson) is widely considered the strongest NFL rookie class of the 2020s.',
    inductionReason: 'Super Bowl appearance in Year 2 after a 2-14 team. The quickest modern franchise turnaround.' },
  { rank: 58, year: 2019, sport: 'NHL', player: 'Cale Makar', setName: 'Upper Deck Young Guns #201', tier: 'honors', era: 'current', significance: 7, icon: '🏔️',
    story: 'Norris, Conn Smythe, Stanley Cup by age 24. The best offensive defenseman since peak Orr.',
    inductionReason: 'Modern defenseman archetype. Young Guns continues to be the hobby\'s best rookie-card format.' },
  { rank: 59, year: 2023, sport: 'NBA', player: 'Victor Wembanyama', setName: 'Panini Prizm #136', tier: 'honors', era: 'current', significance: 7, icon: '🗼',
    story: 'ROY 2024, 7\'3" with point-guard skills. The most physically unique prospect in basketball history.',
    inductionReason: 'Generational prospect. The 2023-24 rookie class\'s defining figure.' },
  { rank: 60, year: 2024, sport: 'MLB', player: 'Paul Skenes', setName: 'Bowman Chrome Draft Auto', tier: 'honors', era: 'current', significance: 6, icon: '🔥',
    story: '2024 NL ROY, sub-2.00 ERA debut season. The most-hyped pitcher draft pick since Strasburg.',
    inductionReason: 'New-generation ace. The Bowman Chrome rookie debut card set 2024\'s secondary-market standard.' },
];

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [val, setVal] = useState<T>(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setVal(JSON.parse(raw));
    } catch {}
  }, [key]);
  const set = (v: T) => {
    setVal(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  };
  return [val, set];
}

export default function CardHallOfFameClient() {
  const [sport, setSport] = useState<Sport>('all');
  const [era, setEra] = useState<Era>('all');
  const [tier, setTier] = useState<Tier>('all');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [rushmore, setRushmore] = useLocalStorage<number[]>('hof-rushmore-v1', []);
  const [shareMsg, setShareMsg] = useState('');

  const filtered = useMemo(() => {
    return CARDS.filter(c =>
      (sport === 'all' || c.sport === sport) &&
      (era === 'all' || c.era === era) &&
      (tier === 'all' || c.tier === tier)
    );
  }, [sport, era, tier]);

  const stats = useMemo(() => {
    const byEra = new Map<string, number>();
    const bySport = new Map<string, number>();
    let oldest = 9999; let newest = 0;
    for (const c of CARDS) {
      byEra.set(c.era, (byEra.get(c.era) || 0) + 1);
      bySport.set(c.sport, (bySport.get(c.sport) || 0) + 1);
      if (c.year < oldest) oldest = c.year;
      if (c.year > newest) newest = c.year;
    }
    const topEra = [...byEra.entries()].sort((a, b) => b[1] - a[1])[0];
    return { oldest, newest, topEra: topEra ? ERA_LABEL[topEra[0] as Exclude<Era, 'all'>] : '', topEraCount: topEra ? topEra[1] : 0 };
  }, []);

  const toggleRushmore = (rank: number) => {
    if (rushmore.includes(rank)) {
      setRushmore(rushmore.filter(r => r !== rank));
    } else if (rushmore.length < 4) {
      setRushmore([...rushmore, rank]);
    } else {
      setShareMsg('Mount Rushmore is full — remove one to swap.');
      setTimeout(() => setShareMsg(''), 2500);
    }
  };

  const shareRushmore = () => {
    if (rushmore.length === 0) {
      setShareMsg('Pick 1–4 cards for your Mount Rushmore first.');
      setTimeout(() => setShareMsg(''), 2500);
      return;
    }
    const picks = rushmore
      .map(r => CARDS.find(c => c.rank === r))
      .filter((c): c is HofCard => !!c);
    const lines = picks.map((c, i) => `${i + 1}. ${c.icon} ${c.year} ${c.player} — ${c.setName}`);
    const text = `My Card Hall of Fame Mount Rushmore 🗿\n${lines.join('\n')}\n\nBuild yours → cardvault-two.vercel.app/card-hall-of-fame`;
    try {
      navigator.clipboard.writeText(text);
      setShareMsg('Copied — paste it anywhere.');
      setTimeout(() => setShareMsg(''), 2500);
    } catch {
      setShareMsg('Clipboard blocked — select the text above to copy.');
      setTimeout(() => setShareMsg(''), 3000);
    }
  };

  const featuredOfDay = useMemo(() => {
    const today = new Date();
    const seed = today.getUTCFullYear() * 10000 + (today.getUTCMonth() + 1) * 100 + today.getUTCDate();
    const pool = seededShuffle(CARDS, seed);
    return pool[0];
  }, []);

  const sports: Sport[] = ['all', 'MLB', 'NBA', 'NFL', 'NHL', 'Multi'];
  const eras: Era[] = ['all', 'pre-war', 'golden-age', 'classic', 'junk-wax', 'modern', 'current'];
  const tiers: Tier[] = ['all', 'inner-circle', 'hall-of-fame', 'honors'];

  return (
    <div>
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-gradient-to-br from-amber-950/60 to-yellow-900/30 border border-amber-800/50 rounded-xl p-4">
          <div className="text-amber-400 text-xs uppercase tracking-wide font-semibold">Enshrined</div>
          <div className="text-white text-2xl font-bold mt-1">{CARDS.length}</div>
          <div className="text-gray-500 text-xs mt-1">Iconic cards</div>
        </div>
        <div className="bg-gradient-to-br from-slate-900/60 to-gray-900/30 border border-slate-700/50 rounded-xl p-4">
          <div className="text-slate-300 text-xs uppercase tracking-wide font-semibold">Span</div>
          <div className="text-white text-2xl font-bold mt-1">{stats.newest - stats.oldest}y</div>
          <div className="text-gray-500 text-xs mt-1">{stats.oldest}–{stats.newest}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-950/60 to-red-900/30 border border-orange-800/50 rounded-xl p-4">
          <div className="text-orange-400 text-xs uppercase tracking-wide font-semibold">Deepest Era</div>
          <div className="text-white text-sm font-bold mt-1 leading-tight">{stats.topEra}</div>
          <div className="text-gray-500 text-xs mt-1">{stats.topEraCount} cards</div>
        </div>
        <div className="bg-gradient-to-br from-purple-950/60 to-indigo-900/30 border border-purple-800/50 rounded-xl p-4">
          <div className="text-purple-400 text-xs uppercase tracking-wide font-semibold">Your Rushmore</div>
          <div className="text-white text-2xl font-bold mt-1">{rushmore.length}/4</div>
          <div className="text-gray-500 text-xs mt-1">Picks locked in</div>
        </div>
      </div>

      {/* Card of the Day */}
      <div className="mb-8 bg-gradient-to-r from-amber-950/50 via-yellow-900/20 to-amber-950/50 border border-amber-700/40 rounded-xl p-5">
        <div className="text-amber-400 text-xs uppercase tracking-wider font-semibold mb-2">Today in the Pantheon</div>
        <div className="flex items-start gap-3">
          <span className="text-3xl">{featuredOfDay.icon}</span>
          <div className="flex-1">
            <div className="text-white font-bold text-lg">
              #{featuredOfDay.rank}. {featuredOfDay.year} {featuredOfDay.player}
            </div>
            <div className="text-gray-400 text-sm">{featuredOfDay.setName}</div>
            <p className="text-gray-300 text-sm mt-2">{featuredOfDay.story}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div>
          <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Sport</div>
          <div className="flex flex-wrap gap-2">
            {sports.map(s => (
              <button key={s} onClick={() => setSport(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  sport === s ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}>
                {s === 'all' ? 'All sports' : `${SPORT_EMOJI[s as Exclude<Sport, 'all'>]} ${s}`}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Era</div>
          <div className="flex flex-wrap gap-2">
            {eras.map(e => (
              <button key={e} onClick={() => setEra(e)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  era === e ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}>
                {e === 'all' ? 'All eras' : ERA_LABEL[e as Exclude<Era, 'all'>]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Tier</div>
          <div className="flex flex-wrap gap-2">
            {tiers.map(t => (
              <button key={t} onClick={() => setTier(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  tier === t ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}>
                {t === 'all' ? 'All tiers' : TIER_LABEL[t as Exclude<Tier, 'all'>]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-3 text-gray-500 text-sm">
        Showing <span className="text-white font-semibold">{filtered.length}</span> of {CARDS.length} cards
      </div>

      {/* Card list */}
      <div className="space-y-3">
        {filtered.map(c => {
          const isOpen = expanded === c.rank;
          const picked = rushmore.includes(c.rank);
          return (
            <div key={c.rank} className={`bg-gradient-to-r ${TIER_STYLE[c.tier]} border rounded-xl overflow-hidden`}>
              <button onClick={() => setExpanded(isOpen ? null : c.rank)}
                className="w-full text-left p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="text-3xl flex-shrink-0">{c.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-amber-400">#{c.rank}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-black/40 text-gray-400">
                        {SPORT_EMOJI[c.sport]} {c.sport}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-black/40 text-gray-400">
                        {ERA_LABEL[c.era].split(' ')[0]} {c.year}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                        c.tier === 'inner-circle' ? 'bg-amber-900/60 text-amber-300'
                          : c.tier === 'hall-of-fame' ? 'bg-slate-700/60 text-slate-200'
                          : 'bg-orange-900/60 text-orange-300'
                      }`}>
                        {TIER_LABEL[c.tier]}
                      </span>
                      <span className="text-xs text-amber-400 ml-auto">
                        {'★'.repeat(c.significance)}
                      </span>
                    </div>
                    <div className="mt-1.5 text-white font-bold text-base sm:text-lg">{c.player}</div>
                    <div className="text-gray-300 text-sm">{c.setName}</div>
                  </div>
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-white/10 pt-3 space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1">The Story</div>
                    <p className="text-gray-300 text-sm">{c.story}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1">Why It's In</div>
                    <p className="text-gray-300 text-sm">{c.inductionReason}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button onClick={() => toggleRushmore(c.rank)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                        picked
                          ? 'bg-amber-600 text-white hover:bg-amber-500'
                          : 'bg-gray-800 text-amber-300 hover:bg-gray-700 border border-amber-700/50'
                      }`}>
                      {picked ? '✓ On Your Rushmore' : '🗿 Add to Rushmore'}
                    </button>
                    <span className="text-xs text-gray-500">
                      {rushmore.length}/4 selected
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rushmore block */}
      {rushmore.length > 0 && (
        <div className="mt-10 bg-gradient-to-br from-purple-950/50 to-indigo-950/40 border border-purple-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Your Mount Rushmore</h2>
              <p className="text-gray-400 text-sm">{rushmore.length} of 4 picks — swap anytime.</p>
            </div>
            <button onClick={shareRushmore}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-md text-sm font-semibold">
              Copy Share Text
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rushmore.map(r => {
              const c = CARDS.find(x => x.rank === r);
              if (!c) return null;
              return (
                <div key={r} className="bg-black/30 border border-purple-800/40 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{c.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm truncate">{c.player}</div>
                      <div className="text-gray-400 text-xs truncate">{c.year} {c.setName}</div>
                    </div>
                    <button onClick={() => toggleRushmore(r)} className="text-gray-500 hover:text-rose-400 text-sm">✕</button>
                  </div>
                </div>
              );
            })}
          </div>
          {shareMsg && <div className="mt-3 text-sm text-purple-300">{shareMsg}</div>}
        </div>
      )}
      {shareMsg && rushmore.length === 0 && (
        <div className="mt-3 text-sm text-amber-300">{shareMsg}</div>
      )}

      {/* Voting / community note */}
      <div className="mt-10 bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
        <h3 className="text-white font-bold mb-2">How the Pantheon Was Curated</h3>
        <p className="text-gray-400 text-sm mb-2">
          Cards were selected across three tiers based on historical significance, cultural weight,
          market consensus, and set-design legacy:
        </p>
        <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
          <li><span className="text-amber-300 font-semibold">Inner Circle</span> — 10 cards every collector recognizes on sight.</li>
          <li><span className="text-slate-200 font-semibold">Hall of Fame</span> — 40 cards that define entire eras and sports.</li>
          <li><span className="text-orange-300 font-semibold">Honors Wing</span> — 10 modern cards on a clear trajectory toward permanent status.</li>
        </ul>
        <p className="text-gray-500 text-xs mt-3">
          Significance is measured on a 1–10 scale combining market demand, historical importance, and
          cultural reach. Stars are not price — they are gravitational pull.
        </p>
      </div>
    </div>
  );
}
