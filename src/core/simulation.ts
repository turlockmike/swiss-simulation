import { TournamentSimulation } from './tournament';
import { TournamentConfig, PlayerConfig } from './config';
import { Player } from './types';
import { SimulationStats } from './stats';
import { normalRandom } from './utils';

export function runSimulation(config: TournamentConfig) {
  const startTime = Date.now();
  
  // Implementation of simulation runner
  const players = generatePlayers(config.players);
  const simulation = new TournamentSimulation(players, config.simulation);
  
  // Initialize statistics tracking
  const stats = new SimulationStats(players, config.simulation.iterations);

  for (let i = 0; i < config.simulation.iterations; i++) {
    // Reset player stats for this iteration
    players.forEach(player => {
      player.wins = 0;
      player.losses = 0;
      player.draws = 0;
    });

    // Run tournament rounds
    for (let round = 1; round <= config.simulation.rounds; round++) {
      simulation.simulateRound(players, round);
    }

    // Record iteration results
    stats.recordIterationResults(players);

    if (config.simulation.showProgress) {
      console.log(`Running iteration ${i + 1} of ${config.simulation.iterations}`);
    }
    
    // Calculate and display iteration results
    const iterationResults = players.map(player => ({
      id: player.id,
      rating: player.rating,
      score: player.wins + (player.draws * 0.5)
    })).sort((a, b) => b.score - a.score);

    if (config.simulation.showProgress) {
      console.log(`\nIteration ${i + 1} Results:`);
      console.log('┌───────────┬──────────┬──────────┐');
      console.log('│ Player ID │ Rating   │ Score    │');
      console.log('├───────────┼──────────┼──────────┤');
      iterationResults.forEach(player => {
        console.log(`│ ${player.id.padEnd(9)} │ ${player.rating.toString().padEnd(8)} │ ${player.score.toFixed(1).padStart(8)} │`);
      });
      console.log('└───────────┴──────────┴──────────┘');

      // Determine and log the winner of this iteration
      const winner = iterationResults[0];
      console.log(`\nWinner of iteration ${i + 1}: Player ${winner.id} (Rating: ${winner.rating})`);
    }
  }

  const endTime = Date.now();
  const duration = endTime - startTime;
  const seconds = Math.floor(duration / 1000);
  const milliseconds = duration % 1000;

  // Display overall performance statistics
  stats.printOverallResults();

  console.log(`\nSimulation completed in ${seconds}.${milliseconds.toString().padStart(3, '0')} seconds`);
}

export function generatePlayers(playerConfig: PlayerConfig): Player[] {
  const players: Player[] = [];
  const ratingStep = (playerConfig.maxRating - playerConfig.minRating) / (playerConfig.count - 1);

  for (let i = 0; i < playerConfig.count; i++) {
    let rating: number;
    
    if (playerConfig.distribution === 'linear') {
      rating = playerConfig.minRating + i * ratingStep;
    } else { // normal distribution
      const mean = (playerConfig.minRating + playerConfig.maxRating) / 2;
      const stdDev = (playerConfig.maxRating - playerConfig.minRating) / 4;
      rating = Math.round(Math.min(Math.max(
        normalRandom(mean, stdDev),
        playerConfig.minRating
      ), playerConfig.maxRating));
    }

    players.push({
      id: `player-${i + 1}`,
      rating: Math.round(rating),
      wins: 0,
      losses: 0,
      draws: 0
    });
  }

  return players;
}
