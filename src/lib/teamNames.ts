/**
 * Team name canonicalization utilities.
 *
 * Normalizes team names from different sources (football-data.org API, AI model
 * responses, user input) into a single consistent slug format. This ensures
 * game_id values are deterministic regardless of which part of the system
 * generates them.
 */

/**
 * Known team name variants mapped to their canonical slug.
 * Add new entries here when a mismatch is discovered.
 */
const TEAM_ALIASES: Record<string, string> = {
  // Premier League
  "arsenal fc": "arsenal",
  "arsenal": "arsenal",
  "aston villa fc": "aston-villa",
  "aston villa": "aston-villa",
  "villa": "aston-villa",
  "afc bournemouth": "bournemouth",
  "bournemouth": "bournemouth",
  "brentford fc": "brentford",
  "brentford": "brentford",
  "brighton & hove albion fc": "brighton",
  "brighton and hove albion fc": "brighton",
  "brighton & hove albion": "brighton",
  "brighton and hove albion": "brighton",
  "brighton": "brighton",
  "chelsea fc": "chelsea",
  "chelsea": "chelsea",
  "crystal palace fc": "crystal-palace",
  "crystal palace": "crystal-palace",
  "everton fc": "everton",
  "everton": "everton",
  "fulham fc": "fulham",
  "fulham": "fulham",
  "ipswich town fc": "ipswich",
  "ipswich town": "ipswich",
  "ipswich": "ipswich",
  "leicester city fc": "leicester",
  "leicester city": "leicester",
  "leicester": "leicester",
  "liverpool fc": "liverpool",
  "liverpool": "liverpool",
  "manchester city fc": "manchester-city",
  "manchester city": "manchester-city",
  "man city": "manchester-city",
  "man. city": "manchester-city",
  "manchester united fc": "manchester-united",
  "manchester united": "manchester-united",
  "man utd": "manchester-united",
  "man united": "manchester-united",
  "man. united": "manchester-united",
  "newcastle united fc": "newcastle",
  "newcastle united": "newcastle",
  "newcastle": "newcastle",
  "nottingham forest fc": "nottingham-forest",
  "nottingham forest": "nottingham-forest",
  "nott'm forest": "nottingham-forest",
  "southampton fc": "southampton",
  "southampton": "southampton",
  "tottenham hotspur fc": "tottenham",
  "tottenham hotspur": "tottenham",
  "tottenham": "tottenham",
  "spurs": "tottenham",
  "west ham united fc": "west-ham",
  "west ham united": "west-ham",
  "west ham": "west-ham",
  "wolverhampton wanderers fc": "wolves",
  "wolverhampton wanderers": "wolves",
  "wolves": "wolves",

  // Recently promoted / common alternates
  "leeds united fc": "leeds",
  "leeds united": "leeds",
  "leeds": "leeds",
  "burnley fc": "burnley",
  "burnley": "burnley",
  "luton town fc": "luton",
  "luton town": "luton",
  "luton": "luton",
  "sheffield united fc": "sheffield-united",
  "sheffield united": "sheffield-united",
  "sheffield utd": "sheffield-united",

  // Champions League - common teams
  "fc barcelona": "barcelona",
  "barcelona": "barcelona",
  "barca": "barcelona",
  "real madrid cf": "real-madrid",
  "real madrid": "real-madrid",
  "fc bayern münchen": "bayern-munich",
  "fc bayern munich": "bayern-munich",
  "bayern münchen": "bayern-munich",
  "bayern munich": "bayern-munich",
  "bayern": "bayern-munich",
  "paris saint-germain fc": "psg",
  "paris saint-germain": "psg",
  "paris sg": "psg",
  "psg": "psg",
  "juventus fc": "juventus",
  "juventus": "juventus",
  "juve": "juventus",
  "ac milan": "ac-milan",
  "milan": "ac-milan",
  "fc internazionale milano": "inter-milan",
  "inter milan": "inter-milan",
  "internazionale": "inter-milan",
  "inter": "inter-milan",
  "ssc napoli": "napoli",
  "napoli": "napoli",
  "borussia dortmund": "dortmund",
  "dortmund": "dortmund",
  "bvb": "dortmund",
  "club atlético de madrid": "atletico-madrid",
  "atlético de madrid": "atletico-madrid",
  "atletico madrid": "atletico-madrid",
  "atletico": "atletico-madrid",
  "rb leipzig": "rb-leipzig",
  "rasen ballsport leipzig": "rb-leipzig",
  "sl benfica": "benfica",
  "benfica": "benfica",
  "fc porto": "porto",
  "porto": "porto",
  "sporting cp": "sporting-cp",
  "sporting lisbon": "sporting-cp",
  "sporting": "sporting-cp",
  "ajax amsterdam": "ajax",
  "afc ajax": "ajax",
  "ajax": "ajax",
  "psv eindhoven": "psv",
  "psv": "psv",
  "celtic fc": "celtic",
  "celtic": "celtic",
  "red bull salzburg": "salzburg",
  "fc salzburg": "salzburg",
  "salzburg": "salzburg",
  "galatasaray sk": "galatasaray",
  "galatasaray": "galatasaray",
};

/**
 * Converts a team name to its canonical slug form.
 *
 * First checks the TEAM_ALIASES map for a known mapping. If no alias is found,
 * falls back to a generic slugification (strip "FC", lowercase, replace spaces
 * and special chars with hyphens).
 *
 * @example
 * canonicalize("Manchester City FC") // "manchester-city"
 * canonicalize("Man City")           // "manchester-city"
 * canonicalize("Brighton & Hove Albion FC") // "brighton"
 */
export function canonicalize(teamName: string): string {
  const normalized = teamName.trim().toLowerCase();

  // Check alias map first
  if (TEAM_ALIASES[normalized]) {
    return TEAM_ALIASES[normalized];
  }

  // Fallback: generic slugification
  return normalized
    .replace(/\bfc\b/g, "")       // Remove "FC" anywhere
    .replace(/&/g, "and")          // & → and
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .trim()
    .replace(/\s+/g, "-")         // Spaces → hyphens
    .replace(/-+/g, "-")          // Collapse multiple hyphens
    .replace(/^-|-$/g, "");       // Trim leading/trailing hyphens
}

/**
 * Generates a deterministic game_id from month and team names.
 *
 * Format: `YYYY-MM/home-slug-vs-away-slug`
 *
 * Using `-vs-` as separator avoids ambiguity with hyphens inside team slugs
 * (e.g. "manchester-city").
 *
 * @example
 * generateGameId("2026-03", "Arsenal FC", "Man City")
 * // "2026-03/arsenal-vs-manchester-city"
 */
export function generateGameId(month: string, homeTeam: string, awayTeam: string): string {
  return `${month}/${canonicalize(homeTeam)}-vs-${canonicalize(awayTeam)}`;
}

export { TEAM_ALIASES };
