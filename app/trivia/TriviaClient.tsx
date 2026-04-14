'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Types ───────────────────────────────────────────────────────────

type Category = 'history' | 'players' | 'values' | 'grading' | 'pokemon' | 'market';

interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  category: Category;
  explanation: string;
}

interface DayScore {
  date: string;
  score: number;
  answers: boolean[];
}

interface TriviaState {
  scores: DayScore[];
  totalPlayed: number;
  streak: number;
  lastPlayDate: string;
}

type Phase = 'ready' | 'playing' | 'answered' | 'results';

// ─── Constants ──────────────────────────────────────────────────────

const STORAGE_KEY = 'cardvault-trivia';
const QUESTIONS_PER_DAY = 5;
const TIMER_SECONDS = 10;

const categoryLabels: Record<Category, string> = {
  history: 'Card History',
  players: 'Player Records',
  values: 'Card Values',
  grading: 'Grading',
  pokemon: 'Pokemon',
  market: 'Market',
};

const categoryColors: Record<Category, string> = {
  history: 'text-amber-400',
  players: 'text-blue-400',
  values: 'text-emerald-400',
  grading: 'text-purple-400',
  pokemon: 'text-yellow-400',
  market: 'text-rose-400',
};

// ─── Question Bank ──────────────────────────────────────────────────

const questions: TriviaQuestion[] = [
  // ── History ────────────────────────────────────────────
  {
    id: 'h1',
    question: 'What year was the T206 Honus Wagner card produced?',
    options: ['1903', '1909', '1915', '1921'],
    correctIndex: 1,
    category: 'history',
    explanation: 'The T206 Honus Wagner was produced between 1909-1911 as part of the American Tobacco Company set.',
  },
  {
    id: 'h2',
    question: 'Which company produced the first widely distributed baseball card set?',
    options: ['Topps', 'Bowman', 'Goodwin & Company', 'Fleer'],
    correctIndex: 2,
    category: 'history',
    explanation: 'Goodwin & Company produced Old Judge cigarette cards starting in 1887, the first widely distributed baseball cards.',
  },
  {
    id: 'h3',
    question: 'What year did Topps release its first major baseball card set?',
    options: ['1948', '1951', '1952', '1955'],
    correctIndex: 2,
    category: 'history',
    explanation: 'The 1952 Topps set is considered the first modern baseball card set and features the iconic Mickey Mantle rookie card.',
  },
  {
    id: 'h4',
    question: 'What event is the "Junk Wax Era" associated with?',
    options: ['A factory fire at Topps', 'Massive overproduction of cards in the late 1980s-early 1990s', 'The introduction of plastic card sleeves', 'A baseball strike in 1981'],
    correctIndex: 1,
    category: 'history',
    explanation: 'The Junk Wax Era (roughly 1987-1994) saw massive overproduction of cards, making most cards from this period nearly worthless today.',
  },
  {
    id: 'h5',
    question: 'What was the first basketball card set ever produced?',
    options: ['1948 Bowman', '1957 Topps', '1961 Fleer', '1969 Topps'],
    correctIndex: 0,
    category: 'history',
    explanation: 'The 1948 Bowman set was the first basketball card set, featuring George Mikan as the key rookie card.',
  },
  {
    id: 'h6',
    question: 'In what decade did Upper Deck enter the trading card market?',
    options: ['1970s', '1980s', '1990s', '2000s'],
    correctIndex: 1,
    category: 'history',
    explanation: 'Upper Deck released its first baseball card set in 1989, famously featuring the Ken Griffey Jr. rookie card.',
  },
  {
    id: 'h7',
    question: 'Which card set introduced the concept of "chase cards" or inserts?',
    options: ['1990 Score', '1991 Donruss', '1993 Topps Finest', '1993 Upper Deck SP'],
    correctIndex: 2,
    category: 'history',
    explanation: '1993 Topps Finest pioneered the modern insert/chase card concept with refractor parallels that became iconic.',
  },
  {
    id: 'h8',
    question: 'What year was the first autographed card included in a pack?',
    options: ['1990', '1993', '1997', '2000'],
    correctIndex: 1,
    category: 'history',
    explanation: 'The 1993 Signature Rookies set was among the first to include certified autograph cards inserted into packs.',
  },
  {
    id: 'h9',
    question: 'Which company held an exclusive MLB license from 2009 to 2025?',
    options: ['Panini', 'Topps', 'Upper Deck', 'Leaf'],
    correctIndex: 1,
    category: 'history',
    explanation: 'Topps held the exclusive MLB trading card license starting in 2009. Fanatics took over in 2025.',
  },
  {
    id: 'h10',
    question: 'What was the "1952 Topps Find" that shocked the hobby in 1985?',
    options: ['A warehouse of unopened cases', 'A hidden vault of printing plates', 'Cases dumped in the ocean by Topps', 'A counterfeit ring discovery'],
    correctIndex: 2,
    category: 'history',
    explanation: 'Topps famously dumped unsold cases of 1952 cards into the Atlantic Ocean. Some cases were saved and discovered decades later.',
  },
  {
    id: 'h11',
    question: 'Which brand introduced the first game-used memorabilia card?',
    options: ['Upper Deck', 'Topps', 'Fleer', 'Donruss/Playoff'],
    correctIndex: 0,
    category: 'history',
    explanation: 'Upper Deck pioneered game-used memorabilia cards in the late 1990s, embedding jersey swatches into cards.',
  },
  // ── Players ────────────────────────────────────────────
  {
    id: 'p1',
    question: 'Who holds the MLB single-season home run record with 73?',
    options: ['Mark McGwire', 'Sammy Sosa', 'Barry Bonds', 'Babe Ruth'],
    correctIndex: 2,
    category: 'players',
    explanation: 'Barry Bonds hit 73 home runs in 2001, breaking Mark McGwire\'s record of 70 set in 1998.',
  },
  {
    id: 'p2',
    question: 'How many career goals does Wayne Gretzky have?',
    options: ['801', '851', '894', '921'],
    correctIndex: 2,
    category: 'players',
    explanation: 'Wayne Gretzky scored 894 career NHL goals, a record that still stands today.',
  },
  {
    id: 'p3',
    question: 'Which NBA player has the most championship rings?',
    options: ['Michael Jordan (6)', 'Kareem Abdul-Jabbar (6)', 'Bill Russell (11)', 'Robert Horry (7)'],
    correctIndex: 2,
    category: 'players',
    explanation: 'Bill Russell won an incredible 11 NBA championships with the Boston Celtics between 1957 and 1969.',
  },
  {
    id: 'p4',
    question: 'Who was the first NFL player to rush for 2,000 yards in a season?',
    options: ['Jim Brown', 'O.J. Simpson', 'Eric Dickerson', 'Barry Sanders'],
    correctIndex: 1,
    category: 'players',
    explanation: 'O.J. Simpson rushed for 2,003 yards in 1973 with the Buffalo Bills, the first to break the 2,000-yard barrier.',
  },
  {
    id: 'p5',
    question: 'Which baseball player has the most career hits?',
    options: ['Ty Cobb', 'Hank Aaron', 'Pete Rose', 'Derek Jeter'],
    correctIndex: 2,
    category: 'players',
    explanation: 'Pete Rose holds the all-time hits record with 4,256 career hits over his 24-year career.',
  },
  {
    id: 'p6',
    question: 'Who is the all-time leading scorer in NBA history?',
    options: ['Kareem Abdul-Jabbar', 'Karl Malone', 'LeBron James', 'Michael Jordan'],
    correctIndex: 2,
    category: 'players',
    explanation: 'LeBron James surpassed Kareem Abdul-Jabbar in February 2023 to become the NBA\'s all-time leading scorer.',
  },
  {
    id: 'p7',
    question: 'Which hockey player is known as "Mr. Hockey"?',
    options: ['Bobby Orr', 'Mario Lemieux', 'Gordie Howe', 'Wayne Gretzky'],
    correctIndex: 2,
    category: 'players',
    explanation: 'Gordie Howe earned the nickname "Mr. Hockey" for his legendary career spanning five decades.',
  },
  {
    id: 'p8',
    question: 'Who threw the most career touchdown passes in NFL history?',
    options: ['Peyton Manning', 'Tom Brady', 'Drew Brees', 'Brett Favre'],
    correctIndex: 1,
    category: 'players',
    explanation: 'Tom Brady holds the record with 649 career touchdown passes, set during his legendary career.',
  },
  {
    id: 'p9',
    question: 'Which player\'s rookie card is the most valuable modern basketball card?',
    options: ['LeBron James', 'Michael Jordan', 'Kobe Bryant', 'Giannis Antetokounmpo'],
    correctIndex: 1,
    category: 'players',
    explanation: 'The 1986-87 Fleer Michael Jordan rookie card (#57) is the most valuable modern basketball card, with PSA 10 copies selling for over $700K.',
  },
  {
    id: 'p10',
    question: 'Who holds the record for most career strikeouts by a pitcher?',
    options: ['Roger Clemens', 'Randy Johnson', 'Nolan Ryan', 'Steve Carlton'],
    correctIndex: 2,
    category: 'players',
    explanation: 'Nolan Ryan holds the all-time strikeout record with 5,714 career strikeouts.',
  },
  // ── Values ─────────────────────────────────────────────
  {
    id: 'v1',
    question: 'Which card sold for the highest price ever at auction (as of 2024)?',
    options: ['1952 Topps Mickey Mantle', 'T206 Honus Wagner', '2009 Bowman Chrome Mike Trout Superfractor', '1916 Sporting News Babe Ruth'],
    correctIndex: 0,
    category: 'values',
    explanation: 'A 1952 Topps Mickey Mantle PSA 9.5 sold for $12.6 million in August 2022, the highest price for any sports card.',
  },
  {
    id: 'v2',
    question: 'What does "1/1" mean on a trading card?',
    options: ['First card in the set', 'First edition printing', 'One of one — the only copy that exists', 'The first card pulled from a case'],
    correctIndex: 2,
    category: 'values',
    explanation: 'A 1/1 card means only one copy exists in the entire print run, making it the ultimate chase card.',
  },
  {
    id: 'v3',
    question: 'What is a "Superfractor" parallel?',
    options: ['A card with extra UV coating', 'A 1/1 gold refractor parallel', 'A card with embedded diamonds', 'A holographic full-art card'],
    correctIndex: 1,
    category: 'values',
    explanation: 'A Superfractor is the rarest refractor parallel, numbered 1/1 with a distinctive gold finish.',
  },
  {
    id: 'v4',
    question: 'What makes a "short print" (SP) card valuable?',
    options: ['It is physically smaller', 'It was printed in lower quantities', 'It has a shorter player bio', 'It was only available for a short time'],
    correctIndex: 1,
    category: 'values',
    explanation: 'Short print cards are produced in lower quantities than base cards, creating scarcity that drives up value.',
  },
  {
    id: 'v5',
    question: 'Which of these factors most affects a vintage card\'s value?',
    options: ['The color of the card back', 'Centering and condition', 'The weight of the cardboard', 'Whether it was hand-cut'],
    correctIndex: 1,
    category: 'values',
    explanation: 'Centering and overall condition are the primary factors in determining a vintage card\'s value and grade.',
  },
  {
    id: 'v6',
    question: 'What is a "rookie card" (RC) designation?',
    options: ['Any card of a player in their first year', 'The first licensed card of a player in a major set', 'A card from a player\'s rookie season only', 'Only Topps-branded first cards'],
    correctIndex: 1,
    category: 'values',
    explanation: 'An official RC designation marks the first licensed card of a player in a flagship or major product release.',
  },
  {
    id: 'v7',
    question: 'What does "raw" mean when describing a card?',
    options: ['The card has damage', 'The card has not been professionally graded', 'The card is from a raw materials set', 'The card has never been sold'],
    correctIndex: 1,
    category: 'values',
    explanation: 'A "raw" card simply means it has not been submitted to or graded by a professional grading service.',
  },
  {
    id: 'v8',
    question: 'What is a "patch card"?',
    options: ['A card with a software update', 'A card with a piece of game-used jersey patch embedded', 'A damaged card that has been repaired', 'A card from a limited repair set'],
    correctIndex: 1,
    category: 'values',
    explanation: 'Patch cards contain a piece of game-used jersey patch material, often featuring team logos or numbers that add value.',
  },
  {
    id: 'v9',
    question: 'Which type of autograph card is generally most valuable?',
    options: ['Sticker auto', 'Pre-print auto', 'On-card auto', 'Digital auto'],
    correctIndex: 2,
    category: 'values',
    explanation: 'On-card autographs (signed directly on the card surface) are generally more valuable than sticker autos because they look more authentic.',
  },
  {
    id: 'v10',
    question: 'What does "numbered to /25" mean?',
    options: ['The card costs $25', 'Only 25 copies of that parallel exist', 'It was the 25th card printed', 'The player wore number 25'],
    correctIndex: 1,
    category: 'values',
    explanation: 'When a card is "numbered to /25," only 25 copies exist, with each card individually serial-numbered (e.g., 13/25).',
  },
  // ── Grading ────────────────────────────────────────────
  {
    id: 'g1',
    question: 'What does PSA stand for?',
    options: ['Professional Sports Association', 'Professional Sports Authenticator', 'Premier Slab Authority', 'Professional Standards Agency'],
    correctIndex: 1,
    category: 'grading',
    explanation: 'PSA stands for Professional Sports Authenticator, founded in 1991 and the largest card grading service.',
  },
  {
    id: 'g2',
    question: 'What is the highest grade PSA can give a card?',
    options: ['PSA 9', 'PSA 10', 'PSA 10 Pristine', 'PSA 10 Gem Mint'],
    correctIndex: 3,
    category: 'grading',
    explanation: 'PSA 10 Gem Mint is the highest grade, indicating perfect centering, sharp corners, clean surfaces, and no imperfections.',
  },
  {
    id: 'g3',
    question: 'Which grading service uses half-point subgrades?',
    options: ['PSA', 'BGS (Beckett)', 'SGC', 'CGC'],
    correctIndex: 1,
    category: 'grading',
    explanation: 'BGS (Beckett Grading Services) uses half-point subgrades for centering, corners, edges, and surface.',
  },
  {
    id: 'g4',
    question: 'What does SGC stand for?',
    options: ['Sports Grading Company', 'Sportscard Guaranty Corporation', 'Standard Grade Certification', 'Specialist Grading Center'],
    correctIndex: 1,
    category: 'grading',
    explanation: 'SGC stands for Sportscard Guaranty Corporation, known for vintage card grading expertise.',
  },
  {
    id: 'g5',
    question: 'What is a BGS "Black Label" grade?',
    options: ['A card with black borders', 'All four subgrades are 10', 'A card that failed authentication', 'The lowest possible grade'],
    correctIndex: 1,
    category: 'grading',
    explanation: 'A BGS Black Label (also called "Pristine") means all four subgrades — centering, corners, edges, and surface — received a perfect 10.',
  },
  {
    id: 'g6',
    question: 'What is "centering" in card grading?',
    options: ['How the player is positioned in the photo', 'The alignment of the image within the card borders', 'The location of the card number', 'How the card sits in the holder'],
    correctIndex: 1,
    category: 'grading',
    explanation: 'Centering measures how evenly the image is positioned within the card borders. A 60/40 or worse centering will lower a grade.',
  },
  {
    id: 'g7',
    question: 'What does it mean when a card is in a "slab"?',
    options: ['It is stored in a binder page', 'It has been encapsulated by a grading company', 'It is in a thick toploader', 'It has been laminated for protection'],
    correctIndex: 1,
    category: 'grading',
    explanation: 'A "slab" is the hard plastic case a grading company seals a card in after grading, protecting it and displaying the grade.',
  },
  {
    id: 'g8',
    question: 'Which grading company is most popular for Pokemon cards?',
    options: ['SGC', 'BGS', 'PSA', 'CGC'],
    correctIndex: 2,
    category: 'grading',
    explanation: 'PSA is the most popular grading service for Pokemon cards, with PSA 10 grades commanding the highest premiums.',
  },
  {
    id: 'g9',
    question: 'What PSA grade indicates a card is in "Near Mint" condition?',
    options: ['PSA 6', 'PSA 7', 'PSA 8', 'PSA 9'],
    correctIndex: 1,
    category: 'grading',
    explanation: 'PSA 7 is the Near Mint grade, indicating a card with slight wear on corners or a minor printing imperfection.',
  },
  {
    id: 'g10',
    question: 'What is "population" (pop) in card grading?',
    options: ['The number of people who own the card', 'How many copies of a card have been graded at each level', 'The print run of the card', 'The total cards graded by a company'],
    correctIndex: 1,
    category: 'grading',
    explanation: 'Population (pop) refers to how many copies of a specific card have been graded at each grade level by a grading company.',
  },
  // ── Pokemon ────────────────────────────────────────────
  {
    id: 'pk1',
    question: 'What was the first Pokemon TCG set released in English?',
    options: ['Jungle', 'Base Set (1999)', 'Fossil', 'Team Rocket'],
    correctIndex: 1,
    category: 'pokemon',
    explanation: 'The Pokemon Base Set was released in English in January 1999, launching the Pokemon TCG phenomenon in the West.',
  },
  {
    id: 'pk2',
    question: 'What is the most valuable Pokemon card ever sold?',
    options: ['1st Edition Charizard Base Set', 'Pikachu Illustrator', 'Shadowless Blastoise', 'Gold Star Rayquaza'],
    correctIndex: 1,
    category: 'pokemon',
    explanation: 'The Pikachu Illustrator card, given as a prize in a 1998 Japanese contest, has sold for over $5 million.',
  },
  {
    id: 'pk3',
    question: 'What does "shadowless" mean for a Base Set Pokemon card?',
    options: ['The Pokemon has no shadow in the artwork', 'An early print run without shadow on the right side of the art box', 'The card has no holo pattern', 'A misprint with missing text'],
    correctIndex: 1,
    category: 'pokemon',
    explanation: 'Shadowless Base Set cards lack the shadow on the right side of the artwork window, indicating an earlier, more valuable print run.',
  },
  {
    id: 'pk4',
    question: 'How many Pokemon were in the original Base Set?',
    options: ['69', '102', '130', '151'],
    correctIndex: 1,
    category: 'pokemon',
    explanation: 'The original English Base Set contained 102 cards, including 16 holographic rare cards.',
  },
  {
    id: 'pk5',
    question: 'What does the star symbol on a Pokemon card indicate?',
    options: ['The card is holographic', 'It is a rare card', 'The Pokemon is shiny', 'It is a first edition'],
    correctIndex: 1,
    category: 'pokemon',
    explanation: 'The star symbol indicates the card\'s rarity: circle = common, diamond = uncommon, star = rare.',
  },
  {
    id: 'pk6',
    question: 'Which Pokemon TCG expansion introduced EX cards?',
    options: ['Neo Genesis', 'Ruby & Sapphire', 'Diamond & Pearl', 'Black & White'],
    correctIndex: 1,
    category: 'pokemon',
    explanation: 'Pokemon EX cards were introduced in the Ruby & Sapphire expansion in 2003.',
  },
  {
    id: 'pk7',
    question: 'What is a "God Pack" in Pokemon TCG?',
    options: ['A pack with only energy cards', 'A pack where every card is a rare or ultra rare', 'A pack signed by the game creators', 'A special pack sold only in Japan'],
    correctIndex: 1,
    category: 'pokemon',
    explanation: 'A "God Pack" is an extremely rare pack where every single card is a rare or ultra rare hit, most famously from Japanese sets.',
  },
  {
    id: 'pk8',
    question: 'Which Pokemon TCG set is considered the most valuable vintage expansion?',
    options: ['Team Rocket', 'Jungle', 'Base Set 1st Edition', 'Gym Heroes'],
    correctIndex: 2,
    category: 'pokemon',
    explanation: 'Base Set 1st Edition is the most valuable vintage Pokemon expansion, with sealed booster boxes selling for hundreds of thousands of dollars.',
  },
  {
    id: 'pk9',
    question: 'What is an "Alt Art" Pokemon card?',
    options: ['A card with alternate coloring', 'A card with unique full artwork not in the standard art style', 'A card from an alternate dimension set', 'A card with art on both sides'],
    correctIndex: 1,
    category: 'pokemon',
    explanation: 'Alternate Art (Alt Art) cards feature unique, often panoramic artwork that differs from the standard card illustration.',
  },
  {
    id: 'pk10',
    question: 'In what year was the Pokemon TCG first released in Japan?',
    options: ['1995', '1996', '1998', '1999'],
    correctIndex: 1,
    category: 'pokemon',
    explanation: 'The Pokemon TCG was first released in Japan in October 1996, nearly three years before its English release.',
  },
  // ── Market ─────────────────────────────────────────────
  {
    id: 'm1',
    question: 'What grading service uses subgrades for centering, corners, edges, and surface?',
    options: ['PSA', 'SGC', 'BGS (Beckett)', 'CGC'],
    correctIndex: 2,
    category: 'market',
    explanation: 'BGS (Beckett Grading Services) assigns subgrades in four categories: centering, corners, edges, and surface.',
  },
  {
    id: 'm2',
    question: 'What does "comp" or "comps" mean in card collecting?',
    options: ['Complimentary cards given away', 'Comparable recent sales used to estimate value', 'Complete sets', 'Competition between sellers'],
    correctIndex: 1,
    category: 'market',
    explanation: 'Comps (comparables) are recent sales of the same card used to determine current market value.',
  },
  {
    id: 'm3',
    question: 'What platform is the largest marketplace for buying and selling raw cards?',
    options: ['COMC', 'StockX', 'eBay', 'Goldin'],
    correctIndex: 2,
    category: 'market',
    explanation: 'eBay remains the largest marketplace for buying and selling raw (ungraded) trading cards.',
  },
  {
    id: 'm4',
    question: 'What is "flipping" in the card market?',
    options: ['Literally flipping cards to see the back', 'Buying cards and quickly reselling for profit', 'Trading cards between collectors', 'A card photography technique'],
    correctIndex: 1,
    category: 'market',
    explanation: 'Flipping refers to buying cards (often new releases) and quickly reselling them for a profit.',
  },
  {
    id: 'm5',
    question: 'What does "EV" stand for in the context of sealed products?',
    options: ['Enhanced Value', 'Expected Value', 'External Verification', 'Exclusive Variant'],
    correctIndex: 1,
    category: 'market',
    explanation: 'Expected Value (EV) is the average return you can expect from opening a sealed product based on card odds and market prices.',
  },
  {
    id: 'm6',
    question: 'What is a "break" in card collecting?',
    options: ['When a card gets damaged', 'A group opening where participants buy spots for specific teams or slots', 'A pause in card production', 'When a card breaks a price record'],
    correctIndex: 1,
    category: 'market',
    explanation: 'A break is a group opening event where participants buy spots (usually by team) and receive cards pulled for their team.',
  },
  {
    id: 'm7',
    question: 'What does "wax" refer to in the hobby?',
    options: ['A card cleaning product', 'Sealed packs or boxes (from wax paper wrapping)', 'A type of card finish', 'Cards from the Wax Era (1920s)'],
    correctIndex: 1,
    category: 'market',
    explanation: 'The term "wax" comes from the wax paper used to wrap vintage packs. Today it refers to any sealed packs or boxes.',
  },
  {
    id: 'm8',
    question: 'What is a "hobby box" vs a "retail box"?',
    options: ['Hobby has more cards per pack', 'Hobby guarantees hits (autos/relics) while retail typically does not', 'Hobby is cheaper', 'There is no difference'],
    correctIndex: 1,
    category: 'market',
    explanation: 'Hobby boxes are sold through card shops and typically guarantee autographs or memorabilia cards, while retail boxes from stores usually do not.',
  },
  {
    id: 'm9',
    question: 'What is "PWCC" in the card market?',
    options: ['A grading company', 'An auction house specializing in trading cards', 'A card storage service', 'A card printing company'],
    correctIndex: 1,
    category: 'market',
    explanation: 'PWCC (now Goldin) was one of the largest auction houses for high-end trading cards and memorabilia.',
  },
  {
    id: 'm10',
    question: 'What does "PC" mean when collectors say "this is in my PC"?',
    options: ['Price Check', 'Personal Collection', 'Premium Card', 'Pre-Certified'],
    correctIndex: 1,
    category: 'market',
    explanation: '"PC" stands for Personal Collection — cards the collector keeps and does not intend to sell or trade.',
  },
  {
    id: 'm11',
    question: 'What is the "Beckett price guide"?',
    options: ['A stock market index for cards', 'A monthly publication listing estimated card values', 'A grading fee calculator', 'A list of counterfeit cards'],
    correctIndex: 1,
    category: 'market',
    explanation: 'Beckett publishes price guides that list estimated card values, though real-time sales data has become more popular.',
  },
  // ── More History ───────────────────────────────────────
  {
    id: 'h12',
    question: 'Which card set is nicknamed "The Rookie Card Set" for basketball?',
    options: ['1984-85 Star', '1986-87 Fleer', '1990-91 Hoops', '1996-97 Topps Chrome'],
    correctIndex: 1,
    category: 'history',
    explanation: 'The 1986-87 Fleer set is nicknamed "The Rookie Card Set" because it includes rookies of Michael Jordan, Charles Barkley, Patrick Ewing, Hakeem Olajuwon, and more.',
  },
  {
    id: 'h13',
    question: 'What was the first "premium" card brand?',
    options: ['Topps Chrome', 'Upper Deck', 'Bowman Chrome', 'Donruss Elite'],
    correctIndex: 1,
    category: 'history',
    explanation: 'Upper Deck launched in 1989 as the first premium card brand with higher quality card stock, anti-counterfeit holograms, and better photography.',
  },
  {
    id: 'h14',
    question: 'In what year did Panini acquire the exclusive NBA card license?',
    options: ['2005', '2009', '2012', '2015'],
    correctIndex: 2,
    category: 'history',
    explanation: 'Panini acquired the exclusive NBA trading card license starting in the 2012-13 season.',
  },
  // ── More Players ───────────────────────────────────────
  {
    id: 'p11',
    question: 'Which player has the most valuable modern football rookie card?',
    options: ['Peyton Manning', 'Tom Brady', 'Patrick Mahomes', 'Joe Montana'],
    correctIndex: 1,
    category: 'players',
    explanation: 'Tom Brady\'s 2000 Playoff Contenders Championship Ticket autograph rookie card has sold for millions.',
  },
  {
    id: 'p12',
    question: 'Who was the first overall pick in the 2003 NBA Draft?',
    options: ['Carmelo Anthony', 'Dwyane Wade', 'Chris Bosh', 'LeBron James'],
    correctIndex: 3,
    category: 'players',
    explanation: 'LeBron James was the #1 overall pick in 2003, drafted by the Cleveland Cavaliers straight out of high school.',
  },
  {
    id: 'p13',
    question: 'Which baseball player is known as "The Say Hey Kid"?',
    options: ['Mickey Mantle', 'Willie Mays', 'Hank Aaron', 'Roberto Clemente'],
    correctIndex: 1,
    category: 'players',
    explanation: 'Willie Mays earned the nickname "The Say Hey Kid" early in his career with the New York Giants.',
  },
  // ── More Values ────────────────────────────────────────
  {
    id: 'v11',
    question: 'What is a "refractor" card?',
    options: ['A card made of metal', 'A card with a rainbow light-refracting finish', 'A card that changes color in light', 'A card with 3D printing'],
    correctIndex: 1,
    category: 'values',
    explanation: 'Refractor cards have a special chromium coating that refracts light into rainbow patterns, first introduced by Topps Finest in 1993.',
  },
  {
    id: 'v12',
    question: 'What is "card trimming" and why is it controversial?',
    options: ['Cutting off damaged edges to make the card appear mint', 'Adding extra borders to a card', 'A legal way to improve centering', 'Removing sticker autographs'],
    correctIndex: 0,
    category: 'values',
    explanation: 'Card trimming is the illegal practice of cutting a card\'s edges to improve apparent centering or remove damage. Grading companies reject trimmed cards.',
  },
  // ── More Market ────────────────────────────────────────
  {
    id: 'm12',
    question: 'What is a "case hit" in trading cards?',
    options: ['When a case is damaged during shipping', 'A very rare card found approximately once per sealed case', 'The first card in every case', 'A card that tracks case sales'],
    correctIndex: 1,
    category: 'market',
    explanation: 'A case hit is an extremely rare insert or parallel card found on average only once per sealed case (typically 10-20 boxes).',
  },
  {
    id: 'm13',
    question: 'What is "buy the rumor, sell the news" in cards?',
    options: ['Only buy rumored counterfeit cards', 'Buy when hype is building, sell when the event happens', 'Never trust card market news', 'A journalism ethics code'],
    correctIndex: 1,
    category: 'market',
    explanation: 'This strategy means buying cards when hype is building (e.g., trade rumors, playoff runs) and selling when the news breaks and prices peak.',
  },
  {
    id: 'm14',
    question: 'What does "invest in the player, not the card" mean?',
    options: ['Buy stocks in sports teams', 'Focus on players with career upside rather than chasing rare parallels', 'Only collect autograph cards', 'Sponsor an athlete directly'],
    correctIndex: 1,
    category: 'market',
    explanation: 'This hobby wisdom means a star player\'s base rookie card often outperforms rare parallels of mediocre players long-term.',
  },
  // ── More Pokemon ───────────────────────────────────────
  {
    id: 'pk11',
    question: 'What is a "Special Illustration Rare" (SIR) in Pokemon TCG?',
    options: ['A common card with special foiling', 'The highest rarity tier with immersive full-art illustration', 'A misprint card', 'A promotional card from events'],
    correctIndex: 1,
    category: 'pokemon',
    explanation: 'Special Illustration Rare (SIR) cards feature immersive, full-card artwork and are among the most sought-after cards in modern Pokemon sets.',
  },
  {
    id: 'pk12',
    question: 'What was the original Japanese name of the Pokemon TCG?',
    options: ['Pokemon Battle Cards', 'Pocket Monsters Card Game', 'Pokemon Fight!', 'Monster Collection TCG'],
    correctIndex: 1,
    category: 'pokemon',
    explanation: 'The Pokemon TCG was originally called the "Pocket Monsters Card Game" in Japan, matching the franchise\'s original Japanese name.',
  },
  // ── Extra Questions ────────────────────────────────────
  {
    id: 'h15',
    question: 'What is the "1989 Upper Deck Ken Griffey Jr." card famous for?',
    options: ['Being the first hologram card', 'Being the most iconic card of the Junk Wax Era', 'Having a printing error', 'Being the first card ever sold for $1 million'],
    correctIndex: 1,
    category: 'history',
    explanation: 'The 1989 Upper Deck Ken Griffey Jr. #1 is the most iconic and valuable card from the Junk Wax Era.',
  },
  {
    id: 'g11',
    question: 'What is a "crossover" in card grading?',
    options: ['A card graded by two companies simultaneously', 'Submitting a card graded by one company to another for re-grading', 'A card that spans two sports', 'When a grade is overturned on appeal'],
    correctIndex: 1,
    category: 'grading',
    explanation: 'A crossover is submitting a card already graded by one company (e.g., SGC) to another (e.g., PSA) for re-grading, hoping for a higher or equal grade.',
  },
  {
    id: 'g12',
    question: 'What is the minimum grade for a card to be considered "investment grade"?',
    options: ['PSA 6', 'PSA 7', 'PSA 8', 'PSA 9'],
    correctIndex: 3,
    category: 'grading',
    explanation: 'While subjective, most collectors consider PSA 9 (Mint) or higher as "investment grade" for modern cards.',
  },
  {
    id: 'v13',
    question: 'What is a "printing plate" card?',
    options: ['A card printed on metal', 'An actual plate used to print the cards, inserted into packs as a 1/1', 'A card with plate-like foil finish', 'A prototype card never released'],
    correctIndex: 1,
    category: 'values',
    explanation: 'Printing plate cards are the actual metal plates used in the card printing process, inserted into packs as unique 1/1 collectibles (typically 4 per card: cyan, magenta, yellow, black).',
  },
  {
    id: 'p14',
    question: 'Which MLB player\'s 2011 Bowman Chrome autograph is known as one of the best modern investments?',
    options: ['Bryce Harper', 'Mike Trout', 'Mookie Betts', 'Clayton Kershaw'],
    correctIndex: 1,
    category: 'players',
    explanation: 'The 2011 Bowman Chrome Mike Trout autograph rookie has been one of the best long-term investments in modern cards, with prices consistently rising.',
  },
  {
    id: 'h16',
    question: 'What major event caused the 1994 baseball card market crash?',
    options: ['A counterfeiting scandal', 'The 1994 MLB players\' strike', 'Topps going bankrupt', 'A warehouse fire destroyed cards'],
    correctIndex: 1,
    category: 'history',
    explanation: 'The 1994 MLB players\' strike, combined with massive overproduction during the Junk Wax Era, caused the baseball card market to crash.',
  },
  {
    id: 'm15',
    question: 'What is a "Dutch auction" in card selling?',
    options: ['An auction starting high and dropping until someone buys', 'An auction held in the Netherlands', 'Bidding in euros only', 'A silent auction format'],
    correctIndex: 0,
    category: 'market',
    explanation: 'A Dutch auction starts at a high price and gradually decreases until a buyer accepts the current price.',
  },
  {
    id: 'pk13',
    question: 'What is a "Booster Bundle" in the modern Pokemon TCG?',
    options: ['A pack with 30 cards', 'A bundle of 6 booster packs sold at retail', 'A box of only rare cards', 'A subscription service'],
    correctIndex: 1,
    category: 'pokemon',
    explanation: 'Booster Bundles are retail products containing 6 booster packs, offering a middle ground between single packs and full booster boxes.',
  },
  {
    id: 'v14',
    question: 'What is "card sick" in the hobby?',
    options: ['A card that makes you feel ill', 'When a card looks incredible and you must have it', 'When a card is damaged by moisture', 'Buying too many cards impulsively'],
    correctIndex: 2,
    category: 'values',
    explanation: 'A "card sick" or "sick card" actually refers to an amazing looking card. But moisture damage causing warping is sometimes called being "sick" too.',
  },
  {
    id: 'g13',
    question: 'What does CGC stand for in card grading?',
    options: ['Certified Grade Cards', 'Certified Guaranty Company', 'Card Grading Corporation', 'Collectors Grade Center'],
    correctIndex: 1,
    category: 'grading',
    explanation: 'CGC stands for Certified Guaranty Company, which expanded from comic book grading into trading cards.',
  },
  {
    id: 'p15',
    question: 'Which athlete\'s cards saw the biggest price spike during COVID-19?',
    options: ['Tom Brady', 'LeBron James', 'Michael Jordan', 'Mike Trout'],
    correctIndex: 2,
    category: 'players',
    explanation: 'Michael Jordan cards saw massive price spikes during COVID-19, fueled by "The Last Dance" documentary on Netflix in 2020.',
  },
];

// ─── Helpers ────────────────────────────────────────────────────────

function dateHash(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const ch = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getDailyQuestions(dateStr: string): TriviaQuestion[] {
  const baseHash = dateHash(dateStr);
  const selected: TriviaQuestion[] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < QUESTIONS_PER_DAY; i++) {
    const subHash = dateHash(dateStr + '-q' + i);
    let idx = (baseHash + subHash + i * 7) % questions.length;
    // Avoid duplicates
    let attempts = 0;
    while (usedIndices.has(idx) && attempts < questions.length) {
      idx = (idx + 1) % questions.length;
      attempts++;
    }
    usedIndices.add(idx);
    selected.push(questions[idx]);
  }

  return selected;
}

function loadState(): TriviaState {
  if (typeof window === 'undefined') {
    return { scores: [], totalPlayed: 0, streak: 0, lastPlayDate: '' };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { scores: [], totalPlayed: 0, streak: 0, lastPlayDate: '' };
}

function saveState(state: TriviaState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

function getYesterday(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getTimeUntilTomorrow(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const diff = tomorrow.getTime() - now.getTime();
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function getScoreMessage(score: number): string {
  switch (score) {
    case 5: return 'Perfect! You\'re a card expert!';
    case 4: return 'Impressive! Almost perfect.';
    case 3: return 'Good knowledge! Room to grow.';
    case 2: return 'Keep collecting and learning!';
    case 1: return 'Everyone starts somewhere!';
    default: return 'Time to hit the guides!';
  }
}

// ─── Component ──────────────────────────────────────────────────────

export default function TriviaClient() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<TriviaState>(loadState);
  const [phase, setPhase] = useState<Phase>('ready');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [todayQuestions, setTodayQuestions] = useState<TriviaQuestion[]>([]);
  const [countdown, setCountdown] = useState(getTimeUntilTomorrow());
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const today = getTodayString();
  const alreadyPlayed = state.scores.some(s => s.date === today);

  // Mount + load daily questions
  useEffect(() => {
    setMounted(true);
    const freshState = loadState();
    setState(freshState);
    setTodayQuestions(getDailyQuestions(today));

    if (freshState.scores.some(s => s.date === today)) {
      setPhase('results');
      const todayScore = freshState.scores.find(s => s.date === today);
      if (todayScore) {
        setAnswers(todayScore.answers);
      }
    }
  }, [today]);

  // Countdown to tomorrow
  useEffect(() => {
    if (phase !== 'results') return;
    const interval = setInterval(() => {
      setCountdown(getTimeUntilTomorrow());
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Question timer
  useEffect(() => {
    if (phase !== 'playing') return;
    setTimer(TIMER_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          // Time's up — mark as wrong
          if (timerRef.current) clearInterval(timerRef.current);
          handleAnswer(-1); // -1 signals timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentIndex]);

  const handleAnswer = useCallback((optionIndex: number) => {
    if (phase !== 'playing' || selectedOption !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const question = todayQuestions[currentIndex];
    const isCorrect = optionIndex === question.correctIndex;
    setSelectedOption(optionIndex);
    setAnswers(prev => [...prev, isCorrect]);
    setPhase('answered');
  }, [phase, selectedOption, todayQuestions, currentIndex]);

  const nextQuestion = useCallback(() => {
    if (currentIndex + 1 < QUESTIONS_PER_DAY) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setPhase('playing');
    } else {
      // Quiz complete — save results
      const finalAnswers = [...answers];
      const score = finalAnswers.filter(Boolean).length;
      const yesterday = getYesterday(today);
      const streak = state.lastPlayDate === yesterday ? state.streak + 1 : 1;

      const newState: TriviaState = {
        scores: [...state.scores, { date: today, score, answers: finalAnswers }],
        totalPlayed: state.totalPlayed + 1,
        streak,
        lastPlayDate: today,
      };

      setState(newState);
      saveState(newState);
      setPhase('results');
    }
  }, [currentIndex, answers, today, state]);

  const startQuiz = useCallback(() => {
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setPhase('playing');
  }, []);

  const shareScore = useCallback(() => {
    const todayScore = state.scores.find(s => s.date === today);
    if (!todayScore) return;
    const emojis = todayScore.answers.map(a => a ? '🟢' : '🔴').join('');
    const text = `CardVault Daily Trivia ${today}\n${emojis}\nScore: ${todayScore.score}/${QUESTIONS_PER_DAY}\nStreak: ${state.streak} day${state.streak !== 1 ? 's' : ''}\n\nhttps://cardvault-two.vercel.app/trivia`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [state, today]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Stats View (always visible at bottom or in results) ──────────

  const todayScore = state.scores.find(s => s.date === today);
  const avgScore = state.totalPlayed > 0
    ? (state.scores.reduce((sum, s) => sum + s.score, 0) / state.scores.length).toFixed(1)
    : '0';
  const bestScore = state.scores.length > 0
    ? Math.max(...state.scores.map(s => s.score))
    : 0;

  // Score distribution
  const distribution = [0, 0, 0, 0, 0, 0];
  state.scores.forEach(s => { distribution[s.score]++; });
  const maxDist = Math.max(...distribution, 1);

  // ─── Ready Screen ─────────────────────────────────────

  if (phase === 'ready' && !alreadyPlayed) {
    return (
      <div className="text-center space-y-8">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 max-w-lg mx-auto">
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-2xl font-bold text-white mb-2">Today&apos;s Quiz</h2>
          <p className="text-gray-400 mb-6">
            {QUESTIONS_PER_DAY} questions &middot; {TIMER_SECONDS} seconds each &middot; New quiz daily
          </p>

          {state.streak > 0 && (
            <div className="inline-flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2 mb-6">
              <span className="text-orange-400 text-lg">🔥</span>
              <span className="text-white font-semibold">{state.streak} day streak</span>
            </div>
          )}

          <button
            onClick={startQuiz}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold rounded-xl text-lg transition-all active:scale-[0.98]"
          >
            Start Quiz
          </button>
        </div>

        {state.totalPlayed > 0 && (
          <StatsSection
            totalPlayed={state.totalPlayed}
            avgScore={avgScore}
            bestScore={bestScore}
            streak={state.streak}
            distribution={distribution}
            maxDist={maxDist}
          />
        )}
      </div>
    );
  }

  // ─── Playing / Answered Screen ────────────────────────

  if (phase === 'playing' || phase === 'answered') {
    const question = todayQuestions[currentIndex];

    return (
      <div className="max-w-lg mx-auto space-y-6">
        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 whitespace-nowrap">
            {currentIndex + 1} / {QUESTIONS_PER_DAY}
          </span>
          <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex + (phase === 'answered' ? 1 : 0)) / QUESTIONS_PER_DAY) * 100}%` }}
            />
          </div>
        </div>

        {/* Timer */}
        {phase === 'playing' && (
          <div className="flex justify-center">
            <div className={`
              relative w-14 h-14 rounded-full flex items-center justify-center border-2 transition-colors
              ${timer <= 3 ? 'border-red-500 text-red-400' : 'border-purple-500 text-purple-400'}
            `}>
              <span className="text-xl font-bold">{timer}</span>
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r="26"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - timer / TIMER_SECONDS)}`}
                  className="transition-all duration-1000 linear opacity-30"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Category Badge */}
        <div className="text-center">
          <span className={`text-xs font-medium uppercase tracking-wider ${categoryColors[question.category]}`}>
            {categoryLabels[question.category]}
          </span>
        </div>

        {/* Question */}
        <h2 className="text-xl sm:text-2xl font-bold text-white text-center leading-snug">
          {question.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, idx) => {
            let btnClass = 'bg-gray-800 border-gray-700 hover:border-purple-500 text-white';

            if (phase === 'answered') {
              if (idx === question.correctIndex) {
                btnClass = 'bg-emerald-500/10 border-emerald-500 text-emerald-400';
              } else if (idx === selectedOption && idx !== question.correctIndex) {
                btnClass = 'bg-red-500/10 border-red-500 text-red-400';
              } else {
                btnClass = 'bg-gray-800/50 border-gray-700/50 text-gray-500';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={phase === 'answered'}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all ${btnClass} ${
                  phase === 'playing' ? 'active:scale-[0.98] cursor-pointer' : 'cursor-default'
                }`}
              >
                <span className="text-sm opacity-50 mr-3">{String.fromCharCode(65 + idx)}</span>
                {option}
              </button>
            );
          })}
        </div>

        {/* Explanation (after answering) */}
        {phase === 'answered' && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                {question.explanation}
              </p>
            </div>

            <button
              onClick={nextQuestion}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              {currentIndex + 1 < QUESTIONS_PER_DAY ? 'Next Question' : 'See Results'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── Results Screen ───────────────────────────────────

  const finalScore = todayScore?.score ?? answers.filter(Boolean).length;
  const finalAnswers = todayScore?.answers ?? answers;

  // Category breakdown
  const categoryResults: Record<string, { correct: number; total: number }> = {};
  todayQuestions.forEach((q, i) => {
    if (!categoryResults[q.category]) {
      categoryResults[q.category] = { correct: 0, total: 0 };
    }
    categoryResults[q.category].total++;
    if (finalAnswers[i]) {
      categoryResults[q.category].correct++;
    }
  });

  return (
    <div className="max-w-lg mx-auto space-y-8">
      {/* Score Card */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center">
        <div className="text-6xl font-extrabold bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-500 bg-clip-text text-transparent mb-2">
          {finalScore}/{QUESTIONS_PER_DAY}
        </div>
        <p className="text-lg text-gray-300 mb-4">{getScoreMessage(finalScore)}</p>

        {/* Answer dots */}
        <div className="flex justify-center gap-2 mb-6">
          {finalAnswers.map((correct, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full ${correct ? 'bg-emerald-500' : 'bg-red-500'}`}
            />
          ))}
        </div>

        {/* Category Breakdown */}
        <div className="space-y-2 mb-6">
          {Object.entries(categoryResults).map(([cat, result]) => (
            <div key={cat} className="flex items-center justify-between text-sm">
              <span className={`${categoryColors[cat as Category]}`}>
                {categoryLabels[cat as Category]}
              </span>
              <span className="text-gray-400">
                {result.correct}/{result.total}
              </span>
            </div>
          ))}
        </div>

        {/* Share */}
        <button
          onClick={shareScore}
          className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl border border-gray-700 transition-colors"
        >
          {copied ? 'Copied to clipboard!' : 'Share Your Score'}
        </button>
      </div>

      {/* Streak + Countdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">🔥 {state.streak}</div>
          <div className="text-sm text-gray-400 mt-1">Day Streak</div>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
          <div className="text-lg font-bold text-white font-mono">
            {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
          </div>
          <div className="text-sm text-gray-400 mt-1">Next Quiz</div>
        </div>
      </div>

      {/* Stats */}
      <StatsSection
        totalPlayed={state.totalPlayed}
        avgScore={avgScore}
        bestScore={bestScore}
        streak={state.streak}
        distribution={distribution}
        maxDist={maxDist}
      />
    </div>
  );
}

// ─── Stats Component ────────────────────────────────────────────────

function StatsSection({
  totalPlayed,
  avgScore,
  bestScore,
  streak,
  distribution,
  maxDist,
}: {
  totalPlayed: number;
  avgScore: string;
  bestScore: number;
  streak: number;
  distribution: number[];
  maxDist: number;
}) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-6">
      <h3 className="text-lg font-bold text-white">Your Stats</h3>

      {/* Stat Grid */}
      <div className="grid grid-cols-4 gap-3 text-center">
        <div>
          <div className="text-xl font-bold text-white">{totalPlayed}</div>
          <div className="text-xs text-gray-400">Played</div>
        </div>
        <div>
          <div className="text-xl font-bold text-white">{avgScore}</div>
          <div className="text-xs text-gray-400">Avg Score</div>
        </div>
        <div>
          <div className="text-xl font-bold text-white">{bestScore}</div>
          <div className="text-xs text-gray-400">Best</div>
        </div>
        <div>
          <div className="text-xl font-bold text-orange-400">{streak}</div>
          <div className="text-xs text-gray-400">Streak</div>
        </div>
      </div>

      {/* Score Distribution */}
      <div>
        <h4 className="text-sm font-semibold text-gray-400 mb-3">Score Distribution</h4>
        <div className="space-y-2">
          {distribution.map((count, score) => (
            <div key={score} className="flex items-center gap-2">
              <span className="text-sm text-gray-400 w-4 text-right">{score}</span>
              <div className="flex-1 h-5 bg-gray-800 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded transition-all"
                  style={{ width: count > 0 ? `${Math.max((count / maxDist) * 100, 8)}%` : '0%' }}
                />
              </div>
              <span className="text-sm text-gray-500 w-6">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
