'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ---------- Utility ---------- */

function dateHash(): number {
  const d = new Date();
  const str = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function parseValue(raw: string): number {
  const m = raw.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10);
}

function todayStr(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

/* ---------- Sport Colors ---------- */

const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-red-400', basketball: 'text-orange-400', football: 'text-blue-400', hockey: 'text-cyan-400',
};

/* ---------- Question Types ---------- */

interface Question {
  question: string;
  answers: [string, string, string, string];
  correct: number; // 0-3
  value: number;
  category: string;
}

/* ---------- Static Question Bank (120+ questions, 20 per category) ---------- */

const GRADING_QUESTIONS: Omit<Question, 'value' | 'category'>[] = [
  { question: 'What does "GEM MT" mean in PSA grading?', answers: ['Perfect 10', 'Grade 9.5', 'Near Mint', 'Excellent'], correct: 0 },
  { question: 'What is the highest grade PSA awards?', answers: ['PSA 10', 'PSA 11', 'PSA 9.5', 'PSA Pristine'], correct: 0 },
  { question: 'Which grading company uses a 10-point scale with half-point increments?', answers: ['BGS (Beckett)', 'PSA', 'CGC', 'HGA'], correct: 0 },
  { question: 'What does BGS stand for?', answers: ['Beckett Grading Services', 'Best Grade Standard', 'Base Grading System', 'Beckett Gold Standard'], correct: 0 },
  { question: 'A BGS "Black Label" 10 means what?', answers: ['All four sub-grades are 10', 'The card is in a black holder', 'It scored above average', 'The label is printed in black'], correct: 0 },
  { question: 'What are the four BGS sub-grades?', answers: ['Centering, Corners, Edges, Surface', 'Front, Back, Sides, Top', 'Color, Gloss, Shape, Weight', 'Print, Cut, Stock, Finish'], correct: 0 },
  { question: 'What does "PSA Authentic" mean?', answers: ['Card is genuine but has a qualifying defect', 'Card received a perfect grade', 'Card is a reprint', 'Card was previously graded'], correct: 0 },
  { question: 'CGC stands for what in card grading?', answers: ['Certified Guaranty Company', 'Card Grading Corporation', 'Certified Grade Council', 'Collectible Grading Center'], correct: 0 },
  { question: 'What is a "slab" in card collecting?', answers: ['A graded card in its sealed case', 'A stack of raw cards', 'A display binder', 'A type of card sleeve'], correct: 0 },
  { question: 'What does "pop report" refer to?', answers: ['Population count of cards graded at each level', 'A report on popular cards', 'A price history chart', 'A list of new releases'], correct: 0 },
  { question: 'What is "crossover" in grading terms?', answers: ['Submitting a graded card to a different company for re-grading', 'A card featuring two sports', 'Trading a card between collectors', 'A card with a printing error'], correct: 0 },
  { question: 'What does a PSA 1 grade indicate?', answers: ['Poor condition, heavily worn', 'A counterfeit card', 'A misprint card', 'A card with no value'], correct: 0 },
  { question: 'Which grading company uses colored labels for tiers (Gem Mint, Pristine)?', answers: ['SGC', 'BGS', 'PSA', 'CGC'], correct: 0 },
  { question: 'What is the minimum PSA grade considered "investment quality"?', answers: ['PSA 8 (NM-MT)', 'PSA 6 (EX-MT)', 'PSA 10 (Gem MT)', 'PSA 3 (VG)'], correct: 0 },
  { question: 'A "cert number" on a graded card is used for what?', answers: ['Verifying authenticity on the grading company website', 'Tracking shipping', 'Identifying the card set', 'Recording the sale price'], correct: 0 },
  { question: 'What does "cracked out of a slab" mean?', answers: ['Removing a card from its graded case', 'A damaged grading case', 'A card that received a low grade', 'Opening a sealed box'], correct: 0 },
  { question: 'What is "eye appeal" in card grading?', answers: ['The overall visual attractiveness of a card', 'A special holographic feature', 'A type of card coating', 'The brightness of card colors'], correct: 0 },
  { question: 'Which grading term describes how well a card is cut within its borders?', answers: ['Centering', 'Surface', 'Corners', 'Registration'], correct: 0 },
  { question: 'What is a "qualifier" on a PSA label?', answers: ['A notation explaining a specific defect (like MC, OC, ST)', 'A bonus point for exceptional cards', 'A discount code', 'A card series identifier'], correct: 0 },
  { question: 'HGA stands for what?', answers: ['Hybrid Grading Approach', 'High Grade Authority', 'Heritage Grading Associates', 'Hobby Grading Alliance'], correct: 0 },
];

const ROOKIE_QUESTIONS: Omit<Question, 'value' | 'category'>[] = [
  { question: 'Which card is considered the "Holy Grail" of baseball cards?', answers: ['T206 Honus Wagner', '1952 Topps Mickey Mantle', '1989 Upper Deck Ken Griffey Jr.', '1933 Goudey Babe Ruth'], correct: 0 },
  { question: 'What does "RC" mean on a sports card?', answers: ['Rookie Card', 'Rare Collection', 'Regular Card', 'Reprint Classic'], correct: 0 },
  { question: 'LeBron James\' most iconic rookie card is from what set?', answers: ['2003-04 Topps Chrome', '2003-04 Fleer', '2003-04 Panini Prizm', '2003-04 Upper Deck'], correct: 0 },
  { question: 'Tom Brady\'s key rookie card is from which product?', answers: ['2000 Playoff Contenders', '2000 Topps Chrome', '2000 Upper Deck', '2000 Bowman Chrome'], correct: 0 },
  { question: 'Which Wayne Gretzky card is his most valuable rookie?', answers: ['1979-80 O-Pee-Chee', '1979-80 Topps', '1980-81 O-Pee-Chee', '1978-79 Topps'], correct: 0 },
  { question: 'Michael Jordan\'s rookie card appears in which 1986 set?', answers: ['Fleer', 'Topps', 'Donruss', 'Upper Deck'], correct: 0 },
  { question: 'Ken Griffey Jr.\'s iconic 1989 rookie card is from which brand?', answers: ['Upper Deck', 'Topps', 'Donruss', 'Score'], correct: 0 },
  { question: 'Which player has the most valuable modern hockey "Young Guns" rookie?', answers: ['Connor McDavid', 'Sidney Crosby', 'Wayne Gretzky', 'Connor Bedard'], correct: 0 },
  { question: 'Derek Jeter\'s key rookie is from which 1993 set?', answers: ['SP', 'Topps', 'Bowman', 'Fleer'], correct: 0 },
  { question: 'Patrick Mahomes\' most sought-after rookie card is from which product?', answers: ['2017 Panini Prizm', '2017 Topps Chrome', '2017 Donruss', '2017 Select'], correct: 0 },
  { question: 'What year was Mike Trout\'s Bowman Chrome rookie card released?', answers: ['2011', '2009', '2012', '2010'], correct: 0 },
  { question: 'Luka Doncic\'s key rookie card is from which product?', answers: ['2018-19 Panini Prizm', '2018-19 Topps Chrome', '2018-19 Fleer', '2018-19 Upper Deck'], correct: 0 },
  { question: 'Which player\'s 1986-87 Fleer rookie card is the most valuable basketball card of the 1980s?', answers: ['Michael Jordan', 'Magic Johnson', 'Larry Bird', 'Hakeem Olajuwon'], correct: 0 },
  { question: 'Shohei Ohtani\'s first major rookie card came from which year?', answers: ['2018', '2017', '2019', '2021'], correct: 0 },
  { question: '"Bowman 1st" cards are significant because they represent what?', answers: ['A player\'s first licensed Bowman card, often from the minors', 'The first card in any Bowman set', 'A reprint of vintage Bowman cards', 'The highest-graded Bowman card'], correct: 0 },
  { question: 'Which NFL player\'s 2020 Prizm rookie card saw the biggest price spike?', answers: ['Justin Herbert', 'Joe Burrow', 'Tua Tagovailoa', 'CeeDee Lamb'], correct: 0 },
  { question: 'Sidney Crosby\'s most valuable rookie card is from which set?', answers: ['2005-06 Upper Deck Young Guns', '2005-06 O-Pee-Chee', '2005-06 Topps', '2005-06 Fleer'], correct: 0 },
  { question: 'What makes a "true rookie card" different from prospect cards?', answers: ['It is from the player\'s official rookie season with an RC logo', 'It is autographed', 'It is numbered', 'It features a game-used relic'], correct: 0 },
  { question: 'Victor Wembanyama\'s 2023 rookie cards are primarily produced by which company?', answers: ['Panini', 'Topps', 'Upper Deck', 'Leaf'], correct: 0 },
  { question: 'Which running back\'s 2001 Topps rookie card is the key football card of the 2000s?', answers: ['LaDainian Tomlinson', 'Peyton Manning', 'Drew Brees', 'Michael Vick'], correct: 0 },
];

const SET_QUESTIONS: Omit<Question, 'value' | 'category'>[] = [
  { question: 'Which brand produces the "Prizm" line of cards?', answers: ['Panini', 'Topps', 'Upper Deck', 'Bowman'], correct: 0 },
  { question: '"Young Guns" rookie cards are part of which brand\'s product?', answers: ['Upper Deck', 'Panini', 'Topps', 'Leaf'], correct: 0 },
  { question: 'What is a "Chrome" card known for?', answers: ['Chromium-style shiny finish', 'Extra thickness', 'Matte texture', 'Holographic foil'], correct: 0 },
  { question: '"Bowman" is primarily known for featuring what type of players?', answers: ['Prospects and minor leaguers', 'Retired legends', 'International players only', 'All-Stars only'], correct: 0 },
  { question: 'What is "Topps Series 1" in baseball?', answers: ['The flagship base set released early in the season', 'A premium insert set', 'A parallel-only product', 'An online-exclusive release'], correct: 0 },
  { question: 'Which set is known for its iconic "Silver Prizm" parallels?', answers: ['Panini Prizm', 'Topps Chrome', 'Upper Deck SP', 'Bowman Sterling'], correct: 0 },
  { question: '"National Treasures" is produced by which company?', answers: ['Panini', 'Topps', 'Upper Deck', 'Fleer'], correct: 0 },
  { question: 'What type of card contains a piece of game-worn material?', answers: ['Relic card', 'Insert card', 'Parallel card', 'Base card'], correct: 0 },
  { question: '"Optic" is the chromium version of which Panini product?', answers: ['Donruss', 'Prizm', 'Select', 'Mosaic'], correct: 0 },
  { question: 'What is a "parallel" in card collecting?', answers: ['A variation of a base card with different color/finish', 'Two identical cards packaged together', 'A card from a different sport', 'A misprint card'], correct: 0 },
  { question: '"Topps Heritage" recreates the design of what?', answers: ['Classic Topps sets from decades past', 'Modern digital-style cards', 'Foreign card sets', 'Error cards'], correct: 0 },
  { question: 'Which brand holds the exclusive MLB license as of 2025?', answers: ['Topps (Fanatics)', 'Panini', 'Upper Deck', 'Leaf'], correct: 0 },
  { question: '"Select" cards are known for which visual feature?', answers: ['Tie-dye and multi-colored prizm patterns', 'Black-and-white photography', 'Oversized dimensions', 'Wooden texture finish'], correct: 0 },
  { question: 'What does "SP" stand for in Upper Deck products?', answers: ['Short Print', 'Special Premium', 'Sport Proof', 'Superior Player'], correct: 0 },
  { question: '"Mosaic" is a product from which company?', answers: ['Panini', 'Topps', 'Upper Deck', 'Bowman'], correct: 0 },
  { question: 'What is "Sapphire" in the Topps Chrome line?', answers: ['An online-exclusive blue-tinted refractor set', 'A gem-embedded card', 'A grading holder color', 'A nickname for PSA 10 cards'], correct: 0 },
  { question: '"Immaculate Collection" cards are known for what?', answers: ['High-end patches and low print runs', 'Being free of defects', 'Having no rookie cards', 'Featuring only Hall of Famers'], correct: 0 },
  { question: 'Which product line features "Cracked Ice" parallels?', answers: ['Panini Prizm', 'Topps Chrome', 'Upper Deck Ice', 'Bowman Sterling'], correct: 0 },
  { question: '"Flawless" is an ultra-premium brand from which company?', answers: ['Panini', 'Topps', 'Upper Deck', 'Leaf'], correct: 0 },
  { question: 'What is "Bowman Chrome" primarily collected for?', answers: ['Prospect autographs and refractors', 'Vintage reprints', 'Game-used relics', 'Complete team sets'], correct: 0 },
];

const VALUES_QUESTIONS: Omit<Question, 'value' | 'category'>[] = [
  { question: 'What does "comps" mean when pricing a card?', answers: ['Comparable recent sales of the same card', 'Complimentary bonus cards', 'Competition pricing', 'Complete set values'], correct: 0 },
  { question: 'What is "FMV" in card selling?', answers: ['Fair Market Value', 'Full Maximum Value', 'Final Mint Valuation', 'Factory Measured Value'], correct: 0 },
  { question: 'eBay\'s "sold listings" filter is used for what?', answers: ['Finding actual prices cards have sold for', 'Listing cards for sale', 'Finding unsold inventory', 'Tracking shipping costs'], correct: 0 },
  { question: 'What is "hype tax" in the card hobby?', answers: ['The premium paid for a player during peak popularity', 'Sales tax on card purchases', 'A fee charged by grading companies', 'The cost of shipping cards'], correct: 0 },
  { question: 'What does a "/25" after a card name mean?', answers: ['Only 25 copies of that card exist', 'The card is from page 25', 'It is the 25th card in the set', 'The player wore number 25'], correct: 0 },
  { question: 'What typically happens to card values during a player\'s injury?', answers: ['Values tend to decrease due to uncertainty', 'Values always increase dramatically', 'Values are completely unaffected', 'Cards become impossible to sell'], correct: 0 },
  { question: 'What is a "1/1" card?', answers: ['A one-of-one card, the only copy in existence', 'The first card in a set', 'A card graded PSA 1', 'A $1 card'], correct: 0 },
  { question: 'Which factor most affects a modern card\'s value?', answers: ['Player performance and popularity', 'The weight of the cardboard', 'The country of manufacture', 'The font used on the card'], correct: 0 },
  { question: 'What does "buy the dip" mean in card investing?', answers: ['Purchasing when a player\'s card prices temporarily drop', 'Buying damaged cards at a discount', 'Shopping at card shows on the last day', 'Purchasing cards during off-season sales'], correct: 0 },
  { question: 'What is "EV" in the context of opening card packs?', answers: ['Expected Value — the average return from opening a box', 'Exclusive Version of a card', 'Extra Valuable card designation', 'Entry-level Value for beginners'], correct: 0 },
  { question: 'What does "blue chip" mean for sports cards?', answers: ['A safe, established player whose cards hold long-term value', 'A card with a blue border', 'A casino-themed insert card', 'A card from the 1950s'], correct: 0 },
  { question: 'What is a "case hit"?', answers: ['An ultra-rare card averaging one per sealed case of boxes', 'A card damaged in shipping', 'The first card visible in a case', 'A card depicting a court case'], correct: 0 },
  { question: 'What tends to happen to card prices right after a draft or major signing?', answers: ['Prices spike due to hype and speculation', 'Prices always drop immediately', 'Prices remain perfectly stable', 'All cards become worthless'], correct: 0 },
  { question: 'What does "liquid" mean for a card in the market?', answers: ['Easy to sell quickly at fair market value', 'The card has water damage', 'The card has a glossy finish', 'The card is stored in a display case'], correct: 0 },
  { question: 'Which is typically more valuable: a numbered parallel or a base card?', answers: ['Numbered parallel (lower print run = more rare)', 'Base card (more recognizable)', 'They are always equal in value', 'Base card (higher demand)'], correct: 0 },
  { question: 'What does "ROI" mean for card investors?', answers: ['Return On Investment', 'Rate Of Increase', 'Record Of Items', 'Range Of Interest'], correct: 0 },
  { question: 'What is "wax" in card collecting slang?', answers: ['Sealed, unopened packs or boxes of cards', 'A card preservation coating', 'A type of card sleeve', 'A grading sealant'], correct: 0 },
  { question: 'What typically makes a card\'s value crash overnight?', answers: ['Player scandal, serious injury, or retirement', 'A new card design release', 'Another player winning an award', 'A change in card sleeve brands'], correct: 0 },
  { question: 'What is "DCA" in card investing?', answers: ['Dollar Cost Averaging — buying consistently over time', 'Direct Card Authentication', 'Digital Card Asset', 'Dealer Commission Agreement'], correct: 0 },
  { question: 'What does "concentration risk" mean for a card portfolio?', answers: ['Having too much invested in one player or sport', 'Cards stored too close together', 'A grading backlog', 'Ink saturation on a card surface'], correct: 0 },
];

const LEGENDS_QUESTIONS: Omit<Question, 'value' | 'category'>[] = [
  { question: 'Who has the most valuable modern hockey rookie card?', answers: ['Wayne Gretzky', 'Connor McDavid', 'Connor Bedard', 'Mario Lemieux'], correct: 0 },
  { question: 'Which basketball player\'s cards dominated the 1990s hobby?', answers: ['Michael Jordan', 'Magic Johnson', 'Larry Bird', 'Shaquille O\'Neal'], correct: 0 },
  { question: 'Whose rookie card set the record for most expensive football card ever sold?', answers: ['Tom Brady', 'Patrick Mahomes', 'Joe Montana', 'Peyton Manning'], correct: 0 },
  { question: 'Which baseball legend has cards from both T206 and modern Topps sets?', answers: ['Honus Wagner (via reprints/tributes)', 'Babe Ruth', 'Ty Cobb', 'Lou Gehrig'], correct: 0 },
  { question: 'Mickey Mantle\'s most famous card is from which year?', answers: ['1952', '1951', '1955', '1961'], correct: 0 },
  { question: 'Which player is featured on the first-ever Upper Deck card (#1)?', answers: ['Ken Griffey Jr.', 'Nolan Ryan', 'Bo Jackson', 'Cal Ripken Jr.'], correct: 0 },
  { question: 'Babe Ruth\'s cards are primarily from which era?', answers: ['Pre-war (1910s-1930s)', 'Post-war (1950s)', 'Modern (1980s-1990s)', 'Vintage (1960s-1970s)'], correct: 0 },
  { question: 'Which NBA player\'s cards are known as "The Black Mamba" collection?', answers: ['Kobe Bryant', 'LeBron James', 'Kevin Durant', 'Allen Iverson'], correct: 0 },
  { question: 'Who is the most collected NFL player in the modern card hobby?', answers: ['Patrick Mahomes', 'Tom Brady', 'Peyton Manning', 'Aaron Rodgers'], correct: 0 },
  { question: 'Bobby Orr\'s iconic 1966-67 rookie card is from which brand?', answers: ['Topps', 'O-Pee-Chee', 'Parkhurst', 'Upper Deck'], correct: 0 },
  { question: 'Which pitcher has the most valuable modern baseball cards?', answers: ['Shohei Ohtani', 'Jacob deGrom', 'Max Scherzer', 'Clayton Kershaw'], correct: 0 },
  { question: 'Which NBA legend\'s 1969-70 Topps rookie card is a key vintage basketball card?', answers: ['Lew Alcindor (Kareem Abdul-Jabbar)', 'Wilt Chamberlain', 'Bill Russell', 'Oscar Robertson'], correct: 0 },
  { question: 'Which player is nicknamed "The Kid" and has a famous 1989 Upper Deck rookie?', answers: ['Ken Griffey Jr.', 'Alex Rodriguez', 'Gary Sheffield', 'Frank Thomas'], correct: 0 },
  { question: 'Which hockey legend is associated with "The Great One" moniker on cards?', answers: ['Wayne Gretzky', 'Mario Lemieux', 'Bobby Orr', 'Gordie Howe'], correct: 0 },
  { question: 'Whose 2009 Bowman Chrome rookie card is the most valuable modern baseball card?', answers: ['Mike Trout', 'Bryce Harper', 'Manny Machado', 'Buster Posey'], correct: 0 },
  { question: 'Which quarterback\'s 2000 Playoff Contenders Championship Ticket is a holy grail card?', answers: ['Tom Brady', 'Peyton Manning', 'Drew Brees', 'Daunte Culpepper'], correct: 0 },
  { question: 'Magic Johnson and Larry Bird share a famous rookie card from which year?', answers: ['1980-81', '1979-80', '1981-82', '1984-85'], correct: 0 },
  { question: 'Which soccer/football player has the most valuable modern card?', answers: ['Lionel Messi', 'Cristiano Ronaldo', 'Pele', 'Diego Maradona'], correct: 0 },
  { question: 'Which female athlete broke barriers by appearing in mainstream sports card sets?', answers: ['Serena Williams', 'Mia Hamm', 'Simone Biles', 'Sue Bird'], correct: 0 },
  { question: 'Gordie Howe\'s most famous card is from which decade?', answers: ['1950s', '1940s', '1960s', '1970s'], correct: 0 },
];

const HISTORY_QUESTIONS: Omit<Question, 'value' | 'category'>[] = [
  { question: 'What year did Topps first produce baseball cards?', answers: ['1951', '1948', '1955', '1960'], correct: 0 },
  { question: 'What is the "Junk Wax Era" in card collecting?', answers: ['Late 1980s to early 1990s mass overproduction period', 'The 1970s when cards were made of cheap material', 'The 2000s digital transition period', 'The 1960s budget card era'], correct: 0 },
  { question: 'What year did Upper Deck revolutionize the card industry with premium cards?', answers: ['1989', '1985', '1991', '1993'], correct: 0 },
  { question: 'The T206 set was originally packaged with what product?', answers: ['Tobacco/cigarettes', 'Chewing gum', 'Cereal', 'Cracker Jack'], correct: 0 },
  { question: 'What happened to the card market in the mid-1990s?', answers: ['The market crashed due to overproduction', 'Cards were banned by the government', 'Digital cards replaced physical ones', 'A new golden age began'], correct: 0 },
  { question: '"Wax packs" got their name because of what?', answers: ['The wax paper wrapping on early card packs', 'The waxy coating on cards', 'A brand name', 'The texture of the cardboard'], correct: 0 },
  { question: 'Which company produced the first modern basketball cards in 1948?', answers: ['Bowman', 'Topps', 'Fleer', 'Panini'], correct: 0 },
  { question: 'When did Panini become the exclusive NBA card manufacturer?', answers: ['2009-10 season', '2005-06 season', '2012-13 season', '2015-16 season'], correct: 0 },
  { question: 'The "hobby" vs "retail" distinction in card boxes refers to what?', answers: ['Distribution channel — hobby shops vs big-box stores', 'Card condition quality', 'Print run size', 'Country of origin'], correct: 0 },
  { question: 'What was significant about the 1989 baseball card season?', answers: ['Upper Deck debuted, Griffey Jr. rookie launched the modern era', 'Cards were first sold in stores', 'The first autograph cards appeared', 'Topps went out of business'], correct: 0 },
  { question: 'Cracker Jack baseball cards were first produced in what year?', answers: ['1914', '1920', '1933', '1909'], correct: 0 },
  { question: 'What year were the first ever known baseball cards produced (tobacco era)?', answers: ['1860s-1870s', '1900s', '1920s', '1940s'], correct: 0 },
  { question: 'Fleer won a lawsuit against Topps in what year, breaking their monopoly?', answers: ['1981', '1975', '1986', '1989'], correct: 0 },
  { question: '"Card breaks" or "group breaks" became popular around what era?', answers: ['2010s with the rise of streaming platforms', '1990s at card shows', '2000s on eBay', '1980s at conventions'], correct: 0 },
  { question: 'What is a "whatnot" in modern card collecting?', answers: ['A live-streaming marketplace popular for card breaks', 'A type of card storage box', 'A grading company', 'A vintage card set'], correct: 0 },
  { question: 'The PWCC marketplace was significant in the hobby for what?', answers: ['Being a major auction house for high-end sports cards', 'Producing budget card sets', 'Creating a new grading scale', 'Manufacturing card sleeves'], correct: 0 },
  { question: 'What event in 2020-2021 caused a massive sports card boom?', answers: ['COVID-19 pandemic and lockdowns driving online hobby interest', 'A new card factory opening', 'The invention of digital cards', 'A government stimulus for collectibles'], correct: 0 },
  { question: 'What is the LCS in card collecting?', answers: ['Local Card Shop', 'Licensed Card Series', 'Large Card Set', 'Legal Card Standard'], correct: 0 },
  { question: 'The "Hobby Box" typically guarantees what compared to retail?', answers: ['At least one autograph or relic hit per box', 'More base cards', 'Lower price', 'Better centering on cards'], correct: 0 },
  { question: 'Fanatics acquired Topps in what year?', answers: ['2022', '2020', '2023', '2019'], correct: 0 },
];

const CATEGORY_NAMES = [
  'Grading Lingo',
  'Rookie Records',
  'Set Knowledge',
  'Card Values',
  'Player Legends',
  'Hobby History',
] as const;

const STATIC_BANKS: Record<string, Omit<Question, 'value' | 'category'>[]> = {
  'Grading Lingo': GRADING_QUESTIONS,
  'Rookie Records': ROOKIE_QUESTIONS,
  'Set Knowledge': SET_QUESTIONS,
  'Card Values': VALUES_QUESTIONS,
  'Player Legends': LEGENDS_QUESTIONS,
  'Hobby History': HISTORY_QUESTIONS,
};

const POINT_VALUES = [200, 400, 600, 800, 1000];

/* ---------- Dynamic card-value questions from sportsCards ---------- */

function buildDynamicValueQuestions(rng: () => number): Omit<Question, 'value' | 'category'>[] {
  const valid = sportsCards
    .filter(c => parseValue(c.estimatedValueRaw) >= 10)
    .map(c => ({ ...c, val: parseValue(c.estimatedValueRaw) }));

  if (valid.length < 10) return [];

  const shuffled = shuffle(valid, rng);
  const selected = shuffled.slice(0, 10);
  const questions: Omit<Question, 'value' | 'category'>[] = [];

  for (const card of selected) {
    const correctVal = card.val;
    // Generate plausible wrong answers
    const wrongMultipliers = [0.25, 0.5, 2, 3, 5, 0.1, 1.5, 4];
    const shuffledMults = shuffle(wrongMultipliers, rng);
    const wrongs = shuffledMults.slice(0, 3).map(m => {
      const v = Math.round(correctVal * m);
      return v < 1 ? 5 : v;
    });

    const correctStr = `$${correctVal.toLocaleString()}`;
    const wrongStrs = wrongs.map(w => `$${w.toLocaleString()}`);

    // Ensure no duplicates
    const allAnswers = [correctStr, ...wrongStrs.filter(w => w !== correctStr)];
    while (allAnswers.length < 4) allAnswers.push(`$${Math.round(correctVal * (rng() * 3 + 0.5)).toLocaleString()}`);

    // Shuffle answer positions
    const positions = shuffle([0, 1, 2, 3], rng);
    const answers: [string, string, string, string] = ['', '', '', ''];
    const correctIndex = positions[0];
    answers[correctIndex] = allAnswers[0];
    let wrongIdx = 1;
    for (const pos of positions.slice(1)) {
      answers[pos] = allAnswers[wrongIdx++];
    }

    const sport = SPORT_COLORS[card.sport] ? card.sport : 'baseball';
    questions.push({
      question: `What is the estimated raw value of a ${card.name}?`,
      answers,
      correct: correctIndex,
    });
  }

  return questions;
}

/* ---------- Board Builder ---------- */

interface Cell {
  row: number;      // 0-4
  col: number;      // 0-5
  value: number;    // 200-1000
  question: Question;
  answered: boolean;
  correct: boolean | null;
  isDailyDouble: boolean;
}

interface BoardState {
  cells: Cell[];
  finalQuestion: Question;
  dailyDoubleIndices: [number, number];
}

function buildBoard(rng: () => number): BoardState {
  const dynamicValues = buildDynamicValueQuestions(rng);
  const cells: Cell[] = [];

  for (let col = 0; col < 6; col++) {
    const categoryName = CATEGORY_NAMES[col];
    let bank = [...STATIC_BANKS[categoryName]];

    // Merge dynamic value questions into the Card Values category
    if (categoryName === 'Card Values' && dynamicValues.length > 0) {
      bank = [...bank, ...dynamicValues];
    }

    const shuffledBank = shuffle(bank, rng);
    const selected = shuffledBank.slice(0, 5);

    for (let row = 0; row < 5; row++) {
      const q = selected[row] || shuffledBank[row % shuffledBank.length];
      cells.push({
        row,
        col,
        value: POINT_VALUES[row],
        question: {
          ...q,
          value: POINT_VALUES[row],
          category: categoryName,
        },
        answered: false,
        correct: null,
        isDailyDouble: false,
      });
    }
  }

  // Place 2 Daily Doubles randomly
  const indices = shuffle(Array.from({ length: 30 }, (_, i) => i), rng);
  const dd1 = indices[0];
  const dd2 = indices[1];
  cells[dd1].isDailyDouble = true;
  cells[dd2].isDailyDouble = true;

  // Final Jeopardy question — pick from a random category
  const finalCatIdx = Math.floor(rng() * 6);
  const finalCat = CATEGORY_NAMES[finalCatIdx];
  const finalBank = shuffle([...STATIC_BANKS[finalCat]], rng);
  // Pick a question not used in the board
  const usedQuestions = new Set(cells.map(c => c.question.question));
  const finalQ = finalBank.find(q => !usedQuestions.has(q.question)) || finalBank[0];

  return {
    cells,
    finalQuestion: {
      ...finalQ,
      value: 0,
      category: 'Final Jeopardy',
    },
    dailyDoubleIndices: [dd1, dd2],
  };
}

/* ---------- LocalStorage Stats ---------- */

interface Stats {
  gamesPlayed: number;
  bestScore: number;
  totalScore: number;
  currentStreak: number;
  lastPlayedDate: string;
}

function loadStats(): Stats {
  if (typeof window === 'undefined') return { gamesPlayed: 0, bestScore: 0, totalScore: 0, currentStreak: 0, lastPlayedDate: '' };
  try {
    const raw = localStorage.getItem('cardvault-jeopardy-stats');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { gamesPlayed: 0, bestScore: 0, totalScore: 0, currentStreak: 0, lastPlayedDate: '' };
}

function saveStats(stats: Stats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('cardvault-jeopardy-stats', JSON.stringify(stats));
  } catch {}
}

/* ---------- Component ---------- */

type GamePhase = 'menu' | 'board' | 'question' | 'daily-double' | 'final-wager' | 'final-question' | 'results';

export default function CardJeopardyClient() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [isDaily, setIsDaily] = useState(true);
  const [board, setBoard] = useState<BoardState | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [wager, setWager] = useState(200);
  const [wagerInput, setWagerInput] = useState('200');
  const [finalAnswered, setFinalAnswered] = useState(false);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => loadStats(), []);

  const startGame = useCallback((daily: boolean) => {
    const seed = daily ? dateHash() : Date.now();
    const rng = seededRng(seed);
    const newBoard = buildBoard(rng);
    setBoard(newBoard);
    setIsDaily(daily);
    setScore(0);
    setQuestionsAnswered(0);
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setActiveCell(null);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setFinalAnswered(false);
    setPhase('board');
  }, []);

  const answeredCount = useMemo(() => {
    if (!board) return 0;
    return board.cells.filter(c => c.answered).length;
  }, [board]);

  const handleCellClick = useCallback((cellIndex: number) => {
    if (!board || board.cells[cellIndex].answered) return;
    setActiveCell(cellIndex);
    setSelectedAnswer(null);
    setShowAnswer(false);

    if (board.cells[cellIndex].isDailyDouble) {
      const maxWager = score > 0 ? score : 1000;
      setWager(200);
      setWagerInput('200');
      setPhase('daily-double');
    } else {
      setPhase('question');
    }
  }, [board, score]);

  const confirmDailyDoubleWager = useCallback(() => {
    const maxWager = score > 0 ? score : 1000;
    const parsed = parseInt(wagerInput, 10);
    const validWager = isNaN(parsed) ? 200 : Math.max(200, Math.min(parsed, maxWager));
    setWager(validWager);
    setPhase('question');
  }, [score, wagerInput]);

  const handleAnswer = useCallback((answerIndex: number) => {
    if (showAnswer || activeCell === null || !board) return;
    setSelectedAnswer(answerIndex);
    setShowAnswer(true);

    const cell = board.cells[activeCell];
    const isCorrect = answerIndex === cell.question.correct;
    const pointsEarned = cell.isDailyDouble ? wager : cell.value;

    const updatedCells = [...board.cells];
    updatedCells[activeCell] = { ...cell, answered: true, correct: isCorrect };
    setBoard({ ...board, cells: updatedCells });

    if (isCorrect) {
      setScore(prev => prev + pointsEarned);
      setCorrectCount(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(best => Math.max(best, newStreak));
        return newStreak;
      });
    } else {
      if (cell.isDailyDouble) {
        setScore(prev => prev - wager);
      }
      setStreak(0);
    }
    setQuestionsAnswered(prev => prev + 1);
  }, [showAnswer, activeCell, board, wager]);

  const closeQuestion = useCallback(() => {
    if (!board) return;
    const allAnswered = board.cells.every(c => c.answered);
    if (allAnswered) {
      // Move to Final Jeopardy
      const maxWager = Math.max(0, score);
      setWager(0);
      setWagerInput('0');
      setPhase('final-wager');
    } else {
      setActiveCell(null);
      setPhase('board');
    }
  }, [board, score]);

  const confirmFinalWager = useCallback(() => {
    const maxWager = Math.max(0, score);
    const parsed = parseInt(wagerInput, 10);
    const validWager = isNaN(parsed) ? 0 : Math.max(0, Math.min(parsed, maxWager));
    setWager(validWager);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setPhase('final-question');
  }, [score, wagerInput]);

  const handleFinalAnswer = useCallback((answerIndex: number) => {
    if (!board || finalAnswered) return;
    setSelectedAnswer(answerIndex);
    setShowAnswer(true);
    setFinalAnswered(true);

    const isCorrect = answerIndex === board.finalQuestion.correct;
    const finalScore = isCorrect ? score + wager : score - wager;
    setScore(finalScore);
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
    setQuestionsAnswered(prev => prev + 1);

    // Save stats
    const s = loadStats();
    s.gamesPlayed += 1;
    s.totalScore += finalScore;
    if (finalScore > s.bestScore) s.bestScore = finalScore;
    const today = todayStr();
    if (s.lastPlayedDate === today) {
      // Already played today, don't increment streak
    } else {
      s.currentStreak += 1;
    }
    s.lastPlayedDate = today;
    saveStats(s);
  }, [board, finalAnswered, score, wager]);

  const goToResults = useCallback(() => {
    setPhase('results');
  }, []);

  const shareResults = useCallback(async () => {
    const dayLabel = isDaily ? `Daily ${todayStr()}` : 'Random';
    const text = `Card Jeopardy: $${score.toLocaleString()} | ${correctCount}/${questionsAnswered} correct | ${dayLabel}\nhttps://cardvault-two.vercel.app/card-jeopardy`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [isDaily, score, correctCount, questionsAnswered]);

  /* ---------- Render ---------- */

  // Menu
  if (phase === 'menu') {
    const s = stats;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => startGame(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-6 rounded-xl transition-colors text-left"
          >
            <div className="text-lg">Daily Challenge</div>
            <div className="text-indigo-200 text-sm mt-1">Same board for everyone today</div>
          </button>
          <button
            onClick={() => startGame(false)}
            className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-4 px-6 rounded-xl transition-colors text-left"
          >
            <div className="text-lg">Random Game</div>
            <div className="text-zinc-300 text-sm mt-1">Fresh board every time</div>
          </button>
        </div>

        {s.gamesPlayed > 0 && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Your Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-white">{s.gamesPlayed}</div>
                <div className="text-xs text-zinc-500">Games Played</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">${s.bestScore.toLocaleString()}</div>
                <div className="text-xs text-zinc-500">Best Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-400">
                  ${s.gamesPlayed > 0 ? Math.round(s.totalScore / s.gamesPlayed).toLocaleString() : 0}
                </div>
                <div className="text-xs text-zinc-500">Avg Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{s.currentStreak}</div>
                <div className="text-xs text-zinc-500">Game Streak</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">How to Play</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li className="flex items-start gap-2"><span className="text-indigo-400 font-bold">1.</span> Click any dollar amount on the board to reveal a question</li>
            <li className="flex items-start gap-2"><span className="text-indigo-400 font-bold">2.</span> Answer correctly to earn that amount. Wrong answers on regular questions cost nothing.</li>
            <li className="flex items-start gap-2"><span className="text-yellow-400 font-bold">DD</span> Two cells are Daily Doubles — wager up to your current score</li>
            <li className="flex items-start gap-2"><span className="text-indigo-400 font-bold">3.</span> After all 30 questions, face Final Jeopardy for a big wager</li>
          </ul>
        </div>
      </div>
    );
  }

  // Board
  if (phase === 'board' && board) {
    return (
      <div className="space-y-4">
        {/* Score bar */}
        <div className="flex items-center justify-between bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-zinc-500">Score</div>
              <div className={`text-xl font-bold ${score >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ${score.toLocaleString()}
              </div>
            </div>
            <div className="border-l border-zinc-700 pl-4">
              <div className="text-xs text-zinc-500">Correct</div>
              <div className="text-lg font-bold text-white">{correctCount}/{questionsAnswered}</div>
            </div>
            {streak >= 3 && (
              <div className="border-l border-zinc-700 pl-4">
                <div className="text-xs text-zinc-500">Streak</div>
                <div className="text-lg font-bold text-yellow-400">{streak}</div>
              </div>
            )}
          </div>
          <div className="text-xs text-zinc-500">{answeredCount}/30 answered</div>
        </div>

        {/* Jeopardy Board */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-6 gap-1.5 min-w-[600px]">
            {/* Category Headers */}
            {CATEGORY_NAMES.map((cat) => (
              <div key={cat} className="bg-indigo-900/80 border border-indigo-700/50 rounded-lg px-2 py-3 text-center">
                <span className="text-xs sm:text-sm font-bold text-indigo-200 leading-tight block">{cat}</span>
              </div>
            ))}

            {/* Cells — organized by row then col */}
            {POINT_VALUES.map((_, rowIdx) =>
              CATEGORY_NAMES.map((_, colIdx) => {
                const cellIdx = colIdx * 5 + rowIdx;
                const cell = board.cells[cellIdx];
                if (!cell) return null;

                if (cell.answered) {
                  return (
                    <div
                      key={cellIdx}
                      className={`rounded-lg px-2 py-4 text-center border opacity-40 ${
                        cell.correct
                          ? 'bg-emerald-900/40 border-emerald-700/40'
                          : 'bg-red-900/40 border-red-700/40'
                      }`}
                    >
                      <span className={`text-sm font-bold ${cell.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                        ${cell.value}
                      </span>
                    </div>
                  );
                }

                return (
                  <button
                    key={cellIdx}
                    onClick={() => handleCellClick(cellIdx)}
                    className="bg-indigo-900/60 border border-indigo-700/40 rounded-lg px-2 py-4 text-center hover:bg-indigo-800/60 hover:border-indigo-600/60 transition-colors cursor-pointer"
                  >
                    <span className="text-lg sm:text-xl font-bold text-yellow-400">${cell.value}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => setPhase('menu')}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // Daily Double wager screen
  if (phase === 'daily-double' && board && activeCell !== null) {
    const cell = board.cells[activeCell];
    const maxWager = score > 0 ? score : 1000;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border-2 border-yellow-500/60 rounded-2xl p-6 max-w-md w-full text-center space-y-5 shadow-[0_0_40px_rgba(234,179,8,0.2)]">
          <div className="text-yellow-400 text-3xl font-black tracking-wider animate-pulse">DAILY DOUBLE!</div>
          <div className="text-zinc-400 text-sm">
            Category: <span className="text-white font-semibold">{cell.question.category}</span>
          </div>
          <div className="text-zinc-400 text-sm">
            Your score: <span className={`font-bold ${score >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${score.toLocaleString()}</span>
          </div>
          <div className="text-zinc-300 text-sm">Wager between $200 and ${maxWager.toLocaleString()}</div>
          <div className="flex items-center gap-3 justify-center">
            <span className="text-zinc-400">$</span>
            <input
              type="number"
              min={200}
              max={maxWager}
              value={wagerInput}
              onChange={(e) => setWagerInput(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-center text-xl font-bold w-40 focus:outline-none focus:border-yellow-500"
            />
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setWagerInput('200')}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              Min $200
            </button>
            <button
              onClick={() => setWagerInput(String(Math.floor(maxWager / 2)))}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              Half
            </button>
            <button
              onClick={() => setWagerInput(String(maxWager))}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              All In ${maxWager.toLocaleString()}
            </button>
          </div>
          <button
            onClick={confirmDailyDoubleWager}
            className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-8 py-3 rounded-xl transition-colors w-full"
          >
            Lock In Wager
          </button>
        </div>
      </div>
    );
  }

  // Question screen
  if (phase === 'question' && board && activeCell !== null) {
    const cell = board.cells[activeCell];
    const q = cell.question;
    const pointLabel = cell.isDailyDouble ? `DD: $${wager.toLocaleString()}` : `$${cell.value}`;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className={`bg-zinc-900 border rounded-2xl p-6 max-w-lg w-full space-y-5 ${cell.isDailyDouble ? 'border-yellow-500/60' : 'border-zinc-700'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{q.category}</span>
            <span className={`text-sm font-bold ${cell.isDailyDouble ? 'text-yellow-400' : 'text-indigo-400'}`}>{pointLabel}</span>
          </div>
          <p className="text-white text-lg font-medium leading-relaxed">{q.question}</p>
          <div className="grid grid-cols-1 gap-2.5">
            {q.answers.map((answer, i) => {
              let btnClass = 'bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-zinc-200';
              if (showAnswer) {
                if (i === q.correct) {
                  btnClass = 'bg-emerald-900/60 border border-emerald-600 text-emerald-200';
                } else if (i === selectedAnswer && i !== q.correct) {
                  btnClass = 'bg-red-900/60 border border-red-600 text-red-200';
                } else {
                  btnClass = 'bg-zinc-800/40 border border-zinc-700/40 text-zinc-500';
                }
              }
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={showAnswer}
                  className={`${btnClass} rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors`}
                >
                  <span className="text-zinc-500 mr-2">{String.fromCharCode(65 + i)}.</span>
                  {answer}
                </button>
              );
            })}
          </div>
          {showAnswer && (
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm">
                {selectedAnswer === board.cells[activeCell].question.correct ? (
                  <span className="text-emerald-400 font-semibold">
                    Correct! {cell.isDailyDouble ? `+$${wager.toLocaleString()}` : `+$${cell.value}`}
                  </span>
                ) : (
                  <span className="text-red-400 font-semibold">
                    Wrong!{cell.isDailyDouble ? ` -$${wager.toLocaleString()}` : ''}
                  </span>
                )}
              </div>
              <button
                onClick={closeQuestion}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2 rounded-lg transition-colors text-sm"
              >
                {answeredCount >= 29 ? 'Final Jeopardy' : 'Continue'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Final Jeopardy wager
  if (phase === 'final-wager' && board) {
    const maxWager = Math.max(0, score);
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border-2 border-indigo-500/60 rounded-2xl p-6 max-w-md w-full text-center space-y-5">
          <div className="text-indigo-400 text-2xl font-black tracking-wider">FINAL JEOPARDY</div>
          <div className="text-zinc-400 text-sm">
            Category: <span className="text-white font-semibold">{board.finalQuestion.category}</span>
          </div>
          <div className="text-zinc-400 text-sm">
            Your score: <span className={`font-bold ${score >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${score.toLocaleString()}</span>
          </div>
          {maxWager > 0 ? (
            <>
              <div className="text-zinc-300 text-sm">Wager $0 to ${maxWager.toLocaleString()}</div>
              <div className="flex items-center gap-3 justify-center">
                <span className="text-zinc-400">$</span>
                <input
                  type="number"
                  min={0}
                  max={maxWager}
                  value={wagerInput}
                  onChange={(e) => setWagerInput(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-center text-xl font-bold w-40 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setWagerInput('0')}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  $0
                </button>
                <button
                  onClick={() => setWagerInput(String(Math.floor(maxWager / 2)))}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  Half
                </button>
                <button
                  onClick={() => setWagerInput(String(maxWager))}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  All In
                </button>
              </div>
            </>
          ) : (
            <div className="text-zinc-500 text-sm">
              {score <= 0 ? 'Score is $0 or below — nothing to wager. Answer for pride!' : ''}
            </div>
          )}
          <button
            onClick={confirmFinalWager}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition-colors w-full"
          >
            {maxWager > 0 ? 'Lock In Wager' : 'Proceed to Final Question'}
          </button>
        </div>
      </div>
    );
  }

  // Final Jeopardy question
  if (phase === 'final-question' && board) {
    const q = board.finalQuestion;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border-2 border-indigo-500/60 rounded-2xl p-6 max-w-lg w-full space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-indigo-400 text-sm font-black tracking-wider">FINAL JEOPARDY</span>
            <span className="text-sm font-bold text-yellow-400">Wager: ${wager.toLocaleString()}</span>
          </div>
          <p className="text-white text-lg font-medium leading-relaxed">{q.question}</p>
          <div className="grid grid-cols-1 gap-2.5">
            {q.answers.map((answer, i) => {
              let btnClass = 'bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-zinc-200';
              if (showAnswer) {
                if (i === q.correct) {
                  btnClass = 'bg-emerald-900/60 border border-emerald-600 text-emerald-200';
                } else if (i === selectedAnswer && i !== q.correct) {
                  btnClass = 'bg-red-900/60 border border-red-600 text-red-200';
                } else {
                  btnClass = 'bg-zinc-800/40 border border-zinc-700/40 text-zinc-500';
                }
              }
              return (
                <button
                  key={i}
                  onClick={() => handleFinalAnswer(i)}
                  disabled={showAnswer}
                  className={`${btnClass} rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors`}
                >
                  <span className="text-zinc-500 mr-2">{String.fromCharCode(65 + i)}.</span>
                  {answer}
                </button>
              );
            })}
          </div>
          {showAnswer && (
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm">
                {selectedAnswer === q.correct ? (
                  <span className="text-emerald-400 font-semibold">Correct! +${wager.toLocaleString()}</span>
                ) : (
                  <span className="text-red-400 font-semibold">Wrong! -${wager.toLocaleString()}</span>
                )}
              </div>
              <button
                onClick={goToResults}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2 rounded-lg transition-colors text-sm"
              >
                See Results
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Results
  if (phase === 'results' && board) {
    const accuracy = questionsAnswered > 0 ? Math.round((correctCount / questionsAnswered) * 100) : 0;
    const grade = score >= 15000 ? 'S' : score >= 10000 ? 'A' : score >= 7000 ? 'B' : score >= 4000 ? 'C' : score >= 1000 ? 'D' : 'F';
    const gradeColor = grade === 'S' ? 'text-yellow-400' : grade === 'A' ? 'text-emerald-400' : grade === 'B' ? 'text-blue-400' : grade === 'C' ? 'text-orange-400' : 'text-red-400';

    return (
      <div className="space-y-6">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 text-center space-y-4">
          <div className="text-sm text-zinc-500 uppercase tracking-wider font-medium">Final Score</div>
          <div className={`text-5xl font-black ${score >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${score.toLocaleString()}
          </div>
          <div className={`text-4xl font-black ${gradeColor}`}>
            Grade: {grade}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{correctCount}/{questionsAnswered}</div>
            <div className="text-xs text-zinc-500">Correct</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{accuracy}%</div>
            <div className="text-xs text-zinc-500">Accuracy</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{bestStreak}</div>
            <div className="text-xs text-zinc-500">Best Streak</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-indigo-400">{isDaily ? 'Daily' : 'Random'}</div>
            <div className="text-xs text-zinc-500">Mode</div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Category Breakdown</h3>
          <div className="space-y-2">
            {CATEGORY_NAMES.map((cat, colIdx) => {
              const catCells = board.cells.filter(c => c.col === colIdx);
              const catCorrect = catCells.filter(c => c.correct === true).length;
              const catEarned = catCells.filter(c => c.correct === true).reduce((sum, c) => sum + c.value, 0);
              return (
                <div key={cat} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300">{cat}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500">{catCorrect}/5</span>
                    <span className="text-emerald-400 font-medium w-16 text-right">${catEarned.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={shareResults}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            {copied ? 'Copied!' : 'Share Results'}
          </button>
          <button
            onClick={() => setPhase('menu')}
            className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}
