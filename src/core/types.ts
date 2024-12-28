export interface MatchResult {
  winnerId: string | null;
  loserId: string | null;
  draw: boolean;
}

export interface Player {
  id: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface SimulationConfig {
  format: 'bo1' | 'bo3' | 'bo3-no-draws';
  iterations: number;
  rounds: number;
  showProgress: boolean;
  drawProbability?: number;
  ratingSystem: 'elo' | 'trueskill';
}
