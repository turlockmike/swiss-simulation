// Generates a normally distributed random number using Box-Muller transform
export function normalRandom(mean = 0, stdDev = 1): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  const normal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + stdDev * normal;
}

export function calculateWinProbability(playerA: { rating: number }, playerB: { rating: number }, ratingSystem: 'elo' | 'trueskill' = 'elo'): number {
  const ratingDiff = playerA.rating - playerB.rating;
  
  if (ratingSystem === 'trueskill') {
    const beta = 25 / 6; // Default value for beta in TrueSkill
    return 1 / (1 + Math.exp(-ratingDiff / (Math.sqrt(2) * beta)));
  }
  
  // Default to ELO calculation
  return 1 / (1 + Math.pow(10, -ratingDiff / 400));
}
