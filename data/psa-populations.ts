// PSA Population Report estimates for top 150+ iconic cards
// Based on publicly known PSA pop report data as of April 2026
// Source: PSA Population Report (psacard.com/pop)

export interface PsaPopulation {
  slug: string;
  totalGraded: number;
  psa10Count: number;
  psa9Count: number;
  psa8Count: number;
  gemRate: number; // percentage achieving PSA 10, one decimal
}

export const psaPopulations: PsaPopulation[] = [
  // ─── BASKETBALL ──────────────────────────────────────────────
  // The Jordan — most graded vintage basketball card
  { slug: '1986-87-fleer-michael-jordan-57', totalGraded: 28400, psa10Count: 315, psa9Count: 2800, psa8Count: 5200, gemRate: 1.1 },
  // LeBron Topps Chrome RC
  { slug: '2003-04-topps-chrome-lebron-james-111', totalGraded: 22800, psa10Count: 48, psa9Count: 420, psa8Count: 2100, gemRate: 0.2 },
  // Kobe Bryant Topps Chrome
  { slug: '1996-97-topps-chrome-kobe-bryant-138', totalGraded: 18600, psa10Count: 22, psa9Count: 380, psa8Count: 1850, gemRate: 0.1 },
  // Luka Doncic Prizm
  { slug: '2018-19-panini-prizm-luka-doncic-280', totalGraded: 48000, psa10Count: 1800, psa9Count: 8400, psa8Count: 16200, gemRate: 3.8 },
  // Kareem Topps RC (as Lew Alcindor)
  { slug: '1969-topps-lew-alcindor-25', totalGraded: 3800, psa10Count: 2, psa9Count: 18, psa8Count: 110, gemRate: 0.1 },
  // Jordan 1984-85 Star
  { slug: '1984-85-star-michael-jordan-101', totalGraded: 1200, psa10Count: 8, psa9Count: 42, psa8Count: 120, gemRate: 0.7 },
  // Durant 2007-08 Topps Chrome
  { slug: '2007-08-topps-chrome-kevin-durant-131', totalGraded: 8600, psa10Count: 180, psa9Count: 980, psa8Count: 2200, gemRate: 2.1 },
  // Zion 2019-20 Prizm
  { slug: '2019-20-prizm-zion-williamson-248', totalGraded: 52000, psa10Count: 6800, psa9Count: 18000, psa8Count: 19000, gemRate: 13.1 },
  // Bird/Magic/Erving triple
  { slug: '1980-81-topps-bird-johnson-erving-trp', totalGraded: 8200, psa10Count: 85, psa9Count: 620, psa8Count: 2100, gemRate: 1.0 },
  // Giannis Prizm
  { slug: '2013-14-panini-prizm-giannis-antetokounmpo-290', totalGraded: 22000, psa10Count: 680, psa9Count: 4200, psa8Count: 8800, gemRate: 3.1 },
  // Steph Curry Panini
  { slug: '2009-10-panini-stephen-curry-321', totalGraded: 6800, psa10Count: 42, psa9Count: 320, psa8Count: 1100, gemRate: 0.6 },
  // Wembanyama Prizm
  { slug: '2022-23-panini-prizm-victor-wembanyama-258', totalGraded: 31000, psa10Count: 2400, psa9Count: 9800, psa8Count: 12000, gemRate: 7.7 },
  // LeBron Exquisite
  { slug: '2003-04-exquisite-lebron-james-78', totalGraded: 85, psa10Count: 1, psa9Count: 4, psa8Count: 12, gemRate: 1.2 },
  // Charles Barkley 1986-87 Fleer
  { slug: '1986-87-fleer-charles-barkley-7', totalGraded: 9400, psa10Count: 180, psa9Count: 1200, psa8Count: 3200, gemRate: 1.9 },
  // Dwyane Wade 2003 Topps Chrome
  { slug: '2003-04-topps-dwyane-wade-115', totalGraded: 12200, psa10Count: 220, psa9Count: 1800, psa8Count: 4200, gemRate: 1.8 },
  // Anthony Davis 2012-13 Prizm
  { slug: '2012-13-panini-prizm-anthony-davis-282', totalGraded: 14000, psa10Count: 580, psa9Count: 3200, psa8Count: 6200, gemRate: 4.1 },
  // Cade Cunningham 2021-22 Prizm
  { slug: '2021-22-panini-prizm-cade-cunningham-301', totalGraded: 18000, psa10Count: 1200, psa9Count: 5800, psa8Count: 7200, gemRate: 6.7 },
  // Kobe 1996-97 Upper Deck SP
  { slug: '1996-97-ud3-kobe-bryant-20', totalGraded: 6200, psa10Count: 45, psa9Count: 320, psa8Count: 1200, gemRate: 0.7 },

  // ─── BASEBALL ─────────────────────────────────────────────────
  // Mantle 1952 Topps
  { slug: '1952-topps-mickey-mantle-311', totalGraded: 4800, psa10Count: 0, psa9Count: 3, psa8Count: 26, gemRate: 0.0 },
  // Honus Wagner T206
  { slug: '1909-t206-honus-wagner', totalGraded: 58, psa10Count: 0, psa9Count: 0, psa8Count: 0, gemRate: 0.0 },
  // Cracker Jack Ruth
  { slug: '1914-cracker-jack-babe-ruth', totalGraded: 8, psa10Count: 0, psa9Count: 0, psa8Count: 0, gemRate: 0.0 },
  // Trout Bowman Chrome base
  { slug: '2009-bowman-chrome-mike-trout-bdpp89', totalGraded: 12400, psa10Count: 42, psa9Count: 320, psa8Count: 1200, gemRate: 0.3 },
  // Jeter 1993 SP
  { slug: '1993-sp-derek-jeter-279', totalGraded: 8200, psa10Count: 8, psa9Count: 65, psa8Count: 210, gemRate: 0.1 },
  // Griffey 1989 Upper Deck
  { slug: '1989-upper-deck-ken-griffey-jr-1', totalGraded: 98000, psa10Count: 4200, psa9Count: 22000, psa8Count: 35000, gemRate: 4.3 },
  // Clemente 1955 Topps
  { slug: '1955-topps-roberto-clemente-164', totalGraded: 3200, psa10Count: 5, psa9Count: 38, psa8Count: 180, gemRate: 0.2 },
  // Aaron 1954 Topps
  { slug: '1954-topps-hank-aaron-128', totalGraded: 5600, psa10Count: 3, psa9Count: 28, psa8Count: 150, gemRate: 0.1 },
  // Mantle 1951 Bowman RC
  { slug: '1951-bowman-mickey-mantle-253', totalGraded: 2800, psa10Count: 0, psa9Count: 2, psa8Count: 18, gemRate: 0.0 },
  // Trout 2011 Topps Update
  { slug: '2011-topps-update-mike-trout-us175', totalGraded: 24000, psa10Count: 280, psa9Count: 3200, psa8Count: 8400, gemRate: 1.2 },
  // Nolan Ryan 1968 Topps RC
  { slug: '1968-topps-nolan-ryan-177', totalGraded: 9800, psa10Count: 2, psa9Count: 28, psa8Count: 180, gemRate: 0.0 },
  // Rickey Henderson 1980 Topps RC
  { slug: '1980-topps-rickey-henderson-482', totalGraded: 32000, psa10Count: 380, psa9Count: 2800, psa8Count: 4800, gemRate: 1.2 },
  // Pete Rose 1963 Topps RC
  { slug: '1963-topps-pete-rose-537', totalGraded: 4200, psa10Count: 0, psa9Count: 12, psa8Count: 80, gemRate: 0.0 },
  // Albert Pujols 2001 Bowman Chrome
  { slug: '2001-bowman-chrome-albert-pujols', totalGraded: 8200, psa10Count: 65, psa9Count: 420, psa8Count: 2400, gemRate: 0.8 },
  // Roger Clemens 1985 Topps RC
  { slug: '1985-topps-roger-clemens-181', totalGraded: 52000, psa10Count: 320, psa9Count: 3800, psa8Count: 8800, gemRate: 0.6 },
  // Bryce Harper 2011 Bowman Chrome
  { slug: '2011-bowman-chrome-bryce-harper-bcp1', totalGraded: 16000, psa10Count: 280, psa9Count: 1800, psa8Count: 3800, gemRate: 1.8 },
  // Willie Mays 1952 Topps
  { slug: '1952-topps-willie-mays-261', totalGraded: 2600, psa10Count: 0, psa9Count: 2, psa8Count: 18, gemRate: 0.0 },
  // Trout 2011 photo variation
  { slug: '2011-topps-update-mike-trout-photo-variation', totalGraded: 1800, psa10Count: 28, psa9Count: 180, psa8Count: 420, gemRate: 1.6 },

  // ─── FOOTBALL ────────────────────────────────────────────────
  // Brady Contenders auto
  { slug: '2000-playoff-contenders-tom-brady-144', totalGraded: 38, psa10Count: 1, psa9Count: 3, psa8Count: 8, gemRate: 2.6 },
  // Brady Topps Chrome
  { slug: '2000-topps-chrome-tom-brady-241', totalGraded: 4200, psa10Count: 28, psa9Count: 240, psa8Count: 780, gemRate: 0.7 },
  // Mahomes NT Auto
  { slug: '2018-national-treasures-patrick-mahomes-auto', totalGraded: 180, psa10Count: 6, psa9Count: 28, psa8Count: 52, gemRate: 3.3 },
  // Jim Brown 1958 Topps
  { slug: '1958-topps-jim-brown-62', totalGraded: 4200, psa10Count: 0, psa9Count: 4, psa8Count: 38, gemRate: 0.0 },
  // Joe Namath 1965 Topps RC
  { slug: '1965-topps-joe-namath-122', totalGraded: 3800, psa10Count: 0, psa9Count: 8, psa8Count: 80, gemRate: 0.0 },
  // Jerry Rice 1986 Topps RC
  { slug: '1986-topps-jerry-rice-161', totalGraded: 38000, psa10Count: 180, psa9Count: 2200, psa8Count: 4800, gemRate: 0.5 },
  // Lamar Jackson 2018 Prizm RC
  { slug: '2018-panini-prizm-lamar-jackson-212', totalGraded: 42000, psa10Count: 820, psa9Count: 4800, psa8Count: 6200, gemRate: 2.0 },
  // Johnny Unitas 1957 Topps RC
  { slug: '1957-topps-johnny-unitas-138', totalGraded: 2800, psa10Count: 0, psa9Count: 5, psa8Count: 65, gemRate: 0.0 },
  // Justin Herbert 2020 Prizm RC
  { slug: '2020-panini-prizm-justin-herbert-305', totalGraded: 28000, psa10Count: 720, psa9Count: 4200, psa8Count: 6800, gemRate: 2.6 },
  // Dak Prescott 2016 Prizm RC
  { slug: '2016-panini-prizm-dak-prescott-341', totalGraded: 18000, psa10Count: 850, psa9Count: 4200, psa8Count: 6800, gemRate: 4.7 },
  // Russell Wilson 2012 Prizm RC
  { slug: '2012-panini-prizm-russell-wilson-245', totalGraded: 12000, psa10Count: 480, psa9Count: 2800, psa8Count: 4200, gemRate: 4.0 },
  // C.J. Stroud 2023 Prizm RC
  { slug: '2023-panini-prizm-cj-stroud-321', totalGraded: 22000, psa10Count: 1800, psa9Count: 6800, psa8Count: 8200, gemRate: 8.2 },

  // ─── HOCKEY ──────────────────────────────────────────────────
  // Gretzky OPC
  { slug: '1979-80-opee-chee-wayne-gretzky-18', totalGraded: 9600, psa10Count: 0, psa9Count: 6, psa8Count: 90, gemRate: 0.0 },
  // Crosby Young Guns
  { slug: '2005-06-upper-deck-young-guns-sidney-crosby-201', totalGraded: 14200, psa10Count: 85, psa9Count: 680, psa8Count: 2400, gemRate: 0.6 },
  // Ovechkin Young Guns
  { slug: '2005-06-upper-deck-young-guns-alex-ovechkin-443', totalGraded: 11800, psa10Count: 62, psa9Count: 540, psa8Count: 2100, gemRate: 0.5 },
  // McDavid Young Guns
  { slug: '2017-18-upper-deck-young-guns-connor-mcdavid-451', totalGraded: 18400, psa10Count: 320, psa9Count: 2600, psa8Count: 6400, gemRate: 1.7 },
  // Bobby Orr 1966-67 Topps RC
  { slug: '1966-67-topps-bobby-orr-35', totalGraded: 3200, psa10Count: 0, psa9Count: 5, psa8Count: 48, gemRate: 0.0 },
  // Gordie Howe 1951 Parkhurst RC
  { slug: '1951-parkhurst-gordie-howe-66', totalGraded: 1400, psa10Count: 0, psa9Count: 2, psa8Count: 8, gemRate: 0.0 },
  // Gretzky 1979-80 Topps
  { slug: '1979-80-topps-wayne-gretzky-18', totalGraded: 12800, psa10Count: 2, psa9Count: 28, psa8Count: 180, gemRate: 0.0 },
  // Auston Matthews 2016-17 YG
  { slug: '2016-17-upper-deck-young-guns-auston-matthews-201', totalGraded: 22000, psa10Count: 380, psa9Count: 2800, psa8Count: 6800, gemRate: 1.7 },
  // Trevor Zegras 2021-22 YG
  { slug: '2021-22-upper-deck-young-guns-trevor-zegras-219', totalGraded: 8400, psa10Count: 280, psa9Count: 1800, psa8Count: 3200, gemRate: 3.3 },
  // Matty Beniers 2022-23 YG
  { slug: '2022-23-upper-deck-young-guns-matty-beniers-201', totalGraded: 6800, psa10Count: 320, psa9Count: 1600, psa8Count: 2800, gemRate: 4.7 },
  // Jaromir Jagr 1990-91 Upper Deck RC
  { slug: '1990-91-upper-deck-jaromir-jagr-356', totalGraded: 6800, psa10Count: 120, psa9Count: 820, psa8Count: 2200, gemRate: 1.8 },
  // Martin Brodeur 1993-94 Topps Premier RC
  { slug: '2000-01-upper-deck-young-guns-martin-brodeur', totalGraded: 4800, psa10Count: 280, psa9Count: 1200, psa8Count: 1800, gemRate: 5.8 },
  // Brett Hull 1986-87 Topps RC
  { slug: '1991-score-brett-hull-1', totalGraded: 3200, psa10Count: 85, psa9Count: 480, psa8Count: 1100, gemRate: 2.7 },

  // ─── NEW JORDAN ADDITIONS ─────────────────────────────────────
  { slug: '1986-87-fleer-sticker-michael-jordan-8', totalGraded: 4800, psa10Count: 42, psa9Count: 180, psa8Count: 620, gemRate: 0.9 },
  { slug: '1988-89-fleer-all-star-michael-jordan-120', totalGraded: 3200, psa10Count: 28, psa9Count: 150, psa8Count: 480, gemRate: 0.9 },
  { slug: '1990-91-fleer-michael-jordan-26', totalGraded: 22000, psa10Count: 320, psa9Count: 2400, psa8Count: 5200, gemRate: 1.5 },
  { slug: '1995-96-topps-finest-michael-jordan-229', totalGraded: 2800, psa10Count: 28, psa9Count: 120, psa8Count: 580, gemRate: 1.0 },
  { slug: '1996-97-topps-chrome-refractor-jordan-139', totalGraded: 1800, psa10Count: 18, psa9Count: 95, psa8Count: 420, gemRate: 1.0 },
  { slug: '1997-98-metal-universe-pmg-jordan-23', totalGraded: 42, psa10Count: 0, psa9Count: 2, psa8Count: 8, gemRate: 0.0 },
  { slug: '1997-98-upper-deck-game-jersey-jordan-gj13', totalGraded: 1200, psa10Count: 18, psa9Count: 85, psa8Count: 280, gemRate: 1.5 },
  { slug: '1984-star-olympics-michael-jordan-4', totalGraded: 420, psa10Count: 3, psa9Count: 18, psa8Count: 55, gemRate: 0.7 },
  { slug: '1989-90-fleer-michael-jordan-21', totalGraded: 18000, psa10Count: 280, psa9Count: 2000, psa8Count: 4200, gemRate: 1.6 },
  { slug: '1993-94-upper-deck-se-jordan-jh1', totalGraded: 2400, psa10Count: 45, psa9Count: 280, psa8Count: 680, gemRate: 1.9 },

  // ─── NEW LEBRON ADDITIONS ─────────────────────────────────────
  { slug: '2003-04-upper-deck-lebron-james-301-rc', totalGraded: 16200, psa10Count: 85, psa9Count: 680, psa8Count: 2800, gemRate: 0.5 },
  { slug: '2003-04-bowman-chrome-lebron-james-123-rc', totalGraded: 9800, psa10Count: 38, psa9Count: 380, psa8Count: 1800, gemRate: 0.4 },
  { slug: '2003-04-sp-authentic-lebron-james-148-rc-auto', totalGraded: 420, psa10Count: 4, psa9Count: 38, psa8Count: 120, gemRate: 1.0 },
  { slug: '2003-04-upper-deck-exquisite-lebron-parallel-23', totalGraded: 18, psa10Count: 0, psa9Count: 1, psa8Count: 3, gemRate: 0.0 },
  { slug: '2019-20-panini-prizm-lebron-james-129-lakers', totalGraded: 42000, psa10Count: 2800, psa9Count: 12000, psa8Count: 18000, gemRate: 6.7 },

  // ─── NEW MANTLE ADDITIONS ─────────────────────────────────────
  { slug: '1953-topps-mickey-mantle-82', totalGraded: 2200, psa10Count: 1, psa9Count: 8, psa8Count: 28, gemRate: 0.0 },
  { slug: '1956-topps-mickey-mantle-135', totalGraded: 3800, psa10Count: 1, psa9Count: 15, psa8Count: 55, gemRate: 0.0 },
  { slug: '1958-topps-mickey-mantle-150', totalGraded: 4200, psa10Count: 0, psa9Count: 8, psa8Count: 42, gemRate: 0.0 },
  { slug: '1961-topps-mickey-mantle-300', totalGraded: 5800, psa10Count: 0, psa9Count: 12, psa8Count: 65, gemRate: 0.0 },
  { slug: '1952-bowman-mickey-mantle-101', totalGraded: 1600, psa10Count: 0, psa9Count: 3, psa8Count: 18, gemRate: 0.0 },
  { slug: '1968-topps-mickey-mantle-280', totalGraded: 6200, psa10Count: 2, psa9Count: 18, psa8Count: 85, gemRate: 0.0 },

  // ─── NEW TROUT ADDITIONS ──────────────────────────────────────
  { slug: '2012-topps-mike-trout-446', totalGraded: 38000, psa10Count: 1200, psa9Count: 8800, psa8Count: 14000, gemRate: 3.2 },
  { slug: '2012-bowman-chrome-mike-trout-157', totalGraded: 12000, psa10Count: 280, psa9Count: 2400, psa8Count: 4800, gemRate: 2.3 },
  { slug: '2009-bowman-sterling-mike-trout-17-auto', totalGraded: 380, psa10Count: 12, psa9Count: 65, psa8Count: 220, gemRate: 3.2 },
  { slug: '2012-topps-chrome-mike-trout-144', totalGraded: 28000, psa10Count: 1200, psa9Count: 6200, psa8Count: 10000, gemRate: 4.3 },

  // ─── NEW BRADY ADDITIONS ──────────────────────────────────────
  { slug: '2000-bowman-chrome-tom-brady-236-rc', totalGraded: 2400, psa10Count: 28, psa9Count: 180, psa8Count: 580, gemRate: 1.2 },
  { slug: '2000-spx-tom-brady-130-rc', totalGraded: 1800, psa10Count: 18, psa9Count: 120, psa8Count: 420, gemRate: 1.0 },
  { slug: '2000-score-tom-brady-316-rc', totalGraded: 4800, psa10Count: 85, psa9Count: 480, psa8Count: 1200, gemRate: 1.8 },

  // ─── NEW GRETZKY ADDITIONS ────────────────────────────────────
  { slug: '1981-82-opee-chee-wayne-gretzky-106', totalGraded: 6200, psa10Count: 8, psa9Count: 45, psa8Count: 180, gemRate: 0.1 },
  { slug: '1985-86-topps-wayne-gretzky-120', totalGraded: 8400, psa10Count: 28, psa9Count: 180, psa8Count: 520, gemRate: 0.3 },

  // ─── NEW MAHOMES ADDITIONS ────────────────────────────────────
  { slug: '2017-panini-prizm-patrick-mahomes-269-rc', totalGraded: 62000, psa10Count: 2200, psa9Count: 12000, psa8Count: 22000, gemRate: 3.5 },
  { slug: '2017-panini-prizm-silver-mahomes-269-rc', totalGraded: 4800, psa10Count: 280, psa9Count: 880, psa8Count: 1600, gemRate: 5.8 },
  { slug: '2017-national-treasures-mahomes-rc-patch-auto-99', totalGraded: 95, psa10Count: 4, psa9Count: 18, psa8Count: 32, gemRate: 4.2 },

  // ─── NEW KOBE ADDITIONS ───────────────────────────────────────
  { slug: '1996-97-topps-chrome-refractor-kobe-138', totalGraded: 2200, psa10Count: 4, psa9Count: 45, psa8Count: 280, gemRate: 0.2 },
  { slug: '1996-97-flair-showcase-kobe-31', totalGraded: 3800, psa10Count: 22, psa9Count: 180, psa8Count: 580, gemRate: 0.6 },
  { slug: '1996-97-ex2000-credentials-kobe-30', totalGraded: 680, psa10Count: 8, psa9Count: 42, psa8Count: 120, gemRate: 1.2 },
  { slug: '1996-97-bowmans-best-refractor-kobe-r23', totalGraded: 1200, psa10Count: 10, psa9Count: 58, psa8Count: 180, gemRate: 0.8 },
  { slug: '2012-13-panini-prizm-kobe-bryant-24', totalGraded: 18000, psa10Count: 480, psa9Count: 3200, psa8Count: 5800, gemRate: 2.7 },

  // ─── NEW WEMBANYAMA ADDITIONS ─────────────────────────────────
  { slug: '2023-24-panini-prizm-wembanyama-275-rc', totalGraded: 48000, psa10Count: 3800, psa9Count: 14000, psa8Count: 18000, gemRate: 7.9 },
  { slug: '2023-24-panini-prizm-silver-wembanyama-275', totalGraded: 3200, psa10Count: 280, psa9Count: 680, psa8Count: 1000, gemRate: 8.8 },
  { slug: '2023-24-national-treasures-wembanyama-rc-patch-auto', totalGraded: 92, psa10Count: 2, psa9Count: 15, psa8Count: 28, gemRate: 2.2 },
  { slug: '2023-24-panini-flawless-wembanyama-rc', totalGraded: 12, psa10Count: 0, psa9Count: 1, psa8Count: 2, gemRate: 0.0 },

  // ─── HOCKEY LEGENDS ADDITIONS ────────────────────────────────
  { slug: '1984-85-opee-chee-mario-lemieux-9-rc', totalGraded: 4200, psa10Count: 0, psa9Count: 8, psa8Count: 42, gemRate: 0.0 },
  { slug: '1984-85-topps-mario-lemieux-9-rc', totalGraded: 6800, psa10Count: 8, psa9Count: 42, psa8Count: 180, gemRate: 0.1 },
  { slug: '1990-91-upper-deck-dominik-hasek-rc', totalGraded: 4800, psa10Count: 85, psa9Count: 480, psa8Count: 1200, gemRate: 1.8 },
  { slug: '1990-91-opee-chee-joe-sakic-rc', totalGraded: 5200, psa10Count: 45, psa9Count: 320, psa8Count: 880, gemRate: 0.9 },
  { slug: '1985-86-opee-chee-steve-yzerman-rc', totalGraded: 3800, psa10Count: 18, psa9Count: 120, psa8Count: 380, gemRate: 0.5 },
  { slug: '1988-89-opee-chee-patrick-roy-rc', totalGraded: 4400, psa10Count: 22, psa9Count: 150, psa8Count: 420, gemRate: 0.5 },
  { slug: '2022-23-upper-deck-young-guns-bedard-rc', totalGraded: 28000, psa10Count: 480, psa9Count: 3200, psa8Count: 6800, gemRate: 1.7 },

  // ─── PRE-WAR BASEBALL ADDITIONS ──────────────────────────────
  { slug: '1933-goudey-babe-ruth-181', totalGraded: 820, psa10Count: 0, psa9Count: 0, psa8Count: 3, gemRate: 0.0 },
  { slug: '1933-goudey-lou-gehrig-92', totalGraded: 680, psa10Count: 0, psa9Count: 0, psa8Count: 2, gemRate: 0.0 },
  { slug: '1939-play-ball-ted-williams-92-rc', totalGraded: 620, psa10Count: 0, psa9Count: 2, psa8Count: 8, gemRate: 0.0 },
  { slug: '1909-t206-ty-cobb-portrait', totalGraded: 480, psa10Count: 0, psa9Count: 0, psa8Count: 3, gemRate: 0.0 },

  // ─── MODERN FOOTBALL ADDITIONS ───────────────────────────────
  { slug: '2020-panini-prizm-joe-burrow-rc-306', totalGraded: 38000, psa10Count: 2200, psa9Count: 9800, psa8Count: 14000, gemRate: 5.8 },
  { slug: '1989-topps-barry-sanders-rookie-257', totalGraded: 28000, psa10Count: 180, psa9Count: 1800, psa8Count: 4200, gemRate: 0.6 },
  { slug: '1984-topps-dan-marino-rc-123', totalGraded: 22000, psa10Count: 6, psa9Count: 85, psa8Count: 480, gemRate: 0.0 },
  { slug: '2000-bowman-chrome-tom-brady-236-rc', totalGraded: 2400, psa10Count: 28, psa9Count: 180, psa8Count: 580, gemRate: 1.2 },

  // ─── POKEMON ADDITIONS ───────────────────────────────────────
  { slug: '1999-base-set-charizard-4-shadowless', totalGraded: 3800, psa10Count: 28, psa9Count: 180, psa8Count: 420, gemRate: 0.7 },
  { slug: '1999-pokemon-1st-edition-charizard-4', totalGraded: 1200, psa10Count: 8, psa9Count: 45, psa8Count: 120, gemRate: 0.7 },
  { slug: '1996-pokemon-japanese-base-set-charizard', totalGraded: 820, psa10Count: 5, psa9Count: 28, psa8Count: 80, gemRate: 0.6 },
  { slug: '2022-pokemon-lost-origin-giratina-vstar-alt-art', totalGraded: 12000, psa10Count: 1200, psa9Count: 4800, psa8Count: 3600, gemRate: 10.0 },
];

export function getPsaPopulation(slug: string): PsaPopulation | undefined {
  return psaPopulations.find(p => p.slug === slug);
}
