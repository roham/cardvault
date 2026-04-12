// Real team colors for card frame rendering
// Format: [primary, secondary, text]
export const teamColors: Record<string, [string, string, string]> = {
  // NBA
  'Chicago Bulls': ['#CE1141', '#000000', '#FFFFFF'],
  'Los Angeles Lakers': ['#552583', '#FDB927', '#FFFFFF'],
  'Boston Celtics': ['#007A33', '#BA9653', '#FFFFFF'],
  'Golden State Warriors': ['#1D428A', '#FFC72C', '#FFFFFF'],
  'Miami Heat': ['#98002E', '#F9A01B', '#FFFFFF'],
  'New York Knicks': ['#006BB6', '#F58426', '#FFFFFF'],
  'Brooklyn Nets': ['#000000', '#FFFFFF', '#FFFFFF'],
  'Milwaukee Bucks': ['#00471B', '#EEE1C6', '#FFFFFF'],
  'Phoenix Suns': ['#1D1160', '#E56020', '#FFFFFF'],
  'New Orleans Pelicans': ['#0C2340', '#C8102E', '#FFFFFF'],
  'Oklahoma City Thunder': ['#007AC1', '#EF3B24', '#FFFFFF'],
  'San Antonio Spurs': ['#C4CED4', '#000000', '#000000'],
  'Cleveland Cavaliers': ['#860038', '#041E42', '#FFFFFF'],
  'Philadelphia 76ers': ['#006BB6', '#ED174C', '#FFFFFF'],
  'Detroit Pistons': ['#C8102E', '#1D42BA', '#FFFFFF'],
  'Orlando Magic': ['#0077C0', '#C4CED4', '#FFFFFF'],
  'Seattle SuperSonics': ['#006837', '#FFC200', '#FFFFFF'],
  // MLB
  'New York Yankees': ['#003087', '#E4002C', '#FFFFFF'],
  'Los Angeles Dodgers': ['#005A9C', '#EF3E42', '#FFFFFF'],
  'Chicago Cubs': ['#0E3386', '#CC3433', '#FFFFFF'],
  'Boston Red Sox': ['#BD3039', '#0C2340', '#FFFFFF'],
  'San Francisco Giants': ['#FD5A1E', '#27251F', '#FFFFFF'],
  'St. Louis Cardinals': ['#C41E3A', '#0C2340', '#FFFFFF'],
  'Pittsburgh Pirates': ['#FDB827', '#27251F', '#FDB827'],
  'Cincinnati Reds': ['#C6011F', '#000000', '#FFFFFF'],
  'Oakland Athletics': ['#003831', '#EFB21E', '#FFFFFF'],
  'Atlanta Braves': ['#CE1141', '#13274F', '#FFFFFF'],
  'New York Mets': ['#002D72', '#FF5910', '#FFFFFF'],
  'Houston Astros': ['#002D62', '#EB6E1F', '#FFFFFF'],
  'Texas Rangers': ['#003278', '#C0111F', '#FFFFFF'],
  'Los Angeles Angels': ['#BA0021', '#003263', '#FFFFFF'],
  'Seattle Mariners': ['#0C2C56', '#005C5C', '#FFFFFF'],
  // NFL
  'New England Patriots': ['#002244', '#C60C30', '#FFFFFF'],
  'Kansas City Chiefs': ['#E31837', '#FFB81C', '#FFFFFF'],
  'Dallas Cowboys': ['#003594', '#041E42', '#FFFFFF'],
  'Green Bay Packers': ['#203731', '#FFB612', '#FFFFFF'],
  'Pittsburgh Steelers': ['#FFB612', '#101820', '#FFB612'],
  'San Francisco 49ers': ['#AA0000', '#B3995D', '#FFFFFF'],
  'Baltimore Ravens': ['#241773', '#9E7C0C', '#FFFFFF'],
  'Philadelphia Eagles': ['#004C54', '#A5ACAF', '#FFFFFF'],
  'Denver Broncos': ['#FB4F14', '#002244', '#FFFFFF'],
  'Buffalo Bills': ['#00338D', '#C60C30', '#FFFFFF'],
  'Los Angeles Rams': ['#003594', '#FFA300', '#FFFFFF'],
  'Tampa Bay Buccaneers': ['#D50A0A', '#FF7900', '#FFFFFF'],
  'Seattle Seahawks': ['#002244', '#69BE28', '#FFFFFF'],
  'Houston Texans': ['#03202F', '#A71930', '#FFFFFF'],
  'Indianapolis Colts': ['#002C5F', '#A2AAAD', '#FFFFFF'],
  // NHL
  'Edmonton Oilers': ['#CF4520', '#00205B', '#FFFFFF'],
  'Pittsburgh Penguins': ['#FCB514', '#000000', '#FCB514'],
  'Detroit Red Wings': ['#CE1126', '#FFFFFF', '#FFFFFF'],
  'Montreal Canadiens': ['#AF1E2D', '#192168', '#FFFFFF'],
  'Toronto Maple Leafs': ['#00205B', '#FFFFFF', '#FFFFFF'],
  'New York Rangers': ['#0038A8', '#CE1126', '#FFFFFF'],
  'Boston Bruins': ['#FFB81C', '#000000', '#FFB81C'],
  'Chicago Blackhawks': ['#CF0A2C', '#000000', '#FFFFFF'],
  'San Jose Sharks': ['#006D75', '#EA7200', '#FFFFFF'],
  'Anaheim Ducks': ['#F47A38', '#B9975B', '#FFFFFF'],
};

// Fallback by sport
export const sportFallbackColors: Record<string, [string, string, string]> = {
  baseball: ['#8B1A1A', '#1A1A2E', '#FFFFFF'],
  basketball: ['#C84B00', '#1A1A2E', '#FFFFFF'],
  football: ['#1A3A6B', '#1A1A2E', '#FFFFFF'],
  hockey: ['#0A4D6B', '#1A1A2E', '#FFFFFF'],
};

export function getTeamColors(teamName: string, sport: string): [string, string, string] {
  if (teamColors[teamName]) return teamColors[teamName];
  return sportFallbackColors[sport] ?? ['#1F2937', '#374151', '#FFFFFF'];
}
