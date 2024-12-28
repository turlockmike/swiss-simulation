export interface PlayerConfig {
  count: number;
  distribution: 'linear' | 'normal';
  minRating: number;
  maxRating: number;
}

export interface SimulationConfig {
  format: 'bo1' | 'bo3';
  iterations: number;
  rounds: number;
  showProgress: boolean;
  drawProbability?: number;
  ratingSystem: 'elo' | 'trueskill';
  bo3NoDraws?: boolean;
}

export interface TournamentConfig {
  players: PlayerConfig;
  simulation: SimulationConfig;
}

export function validateConfig(config: TournamentConfig): boolean {
  // Basic validation
  if (config.players.count < 2) return false;
  if (config.players.minRating >= config.players.maxRating) return false;
  if (config.simulation.iterations < 1) return false;
  
  // Draw probability validation
  if (config.simulation.drawProbability !== undefined && 
      (config.simulation.drawProbability < 0 || config.simulation.drawProbability > 1)) {
    return false;
  }
  
  // Distribution-specific validation
  if (config.players.distribution === 'normal' && 
      config.players.maxRating - config.players.minRating < 400) {
    return false;
  }
  
  return true;
}
