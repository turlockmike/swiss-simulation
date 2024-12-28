import { TournamentSimulation } from './tournament';
import { TournamentConfig, PlayerConfig } from './config';
import { Player } from './types';

export function runSimulation(config: TournamentConfig) {
  const startTime = Date.now();
  
  // Implementation of simulation runner
  const players = generatePlayers(config.players);
  const simulation = new TournamentSimulation(players, config.simulation);
  
  // Initialize overall stats
  const overallStats = players.map(player => ({
    id: player.id,
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0
  }));

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

    // Update overall stats
    players.forEach((player, index) => {
      overallStats[index].totalWins += player.wins;
      overallStats[index].totalLosses += player.losses;
      overallStats[index].totalDraws += player.draws;
    });

    if (config.simulation.showProgress) {
      console.log(`Running iteration ${i + 1} of ${config.simulation.iterations}`);
    }
    
    // Calculate and display iteration results
    const iterationResults = players.map(player => ({
      id: player.id,
      rating: player.rating,
      score: player.wins + (player.draws * 0.5)
    })).sort((a, b) => b.score - a.score);

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

  const endTime = Date.now();
  const duration = endTime - startTime;
  const seconds = Math.floor(duration / 1000);
  const milliseconds = duration % 1000;

  // Calculate and display overall performance
  const overallResults = overallStats.map(stats => ({
    id: stats.id,
    rating: players.find(p => p.id === stats.id)!.rating,
    avgPoints: (stats.totalWins + (stats.totalDraws * 0.5)) / config.simulation.iterations
  })).sort((a, b) => b.avgPoints - a.avgPoints);

  // Print overall results table
  console.log('\nOverall Performance Summary:');
  console.log('┌───────────┬──────────┬──────────────┐');
  console.log('│ Player ID │ Rating   │ Avg Points   │');
  console.log('├───────────┼──────────┼──────────────┤');
  overallResults.forEach(player => {
    console.log(`│ ${player.id.padEnd(9)} │ ${player.rating.toString().padEnd(8)} │ ${player.avgPoints.toFixed(2).padStart(12)} │`);
  });
  console.log('└───────────┴──────────┴──────────────┘');

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

function normalRandom(mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}
