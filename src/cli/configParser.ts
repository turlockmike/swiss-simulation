import { program } from 'commander';
import { TournamentConfig } from '../core/config';
import { validateConfig } from '../core/config';

export function parseCliArgs(): TournamentConfig {
  program
    .option('-p, --players <number>', 'Number of players', '100')
    .option('--min, --minRating <number>', 'Minimum player rating', '1000')
    .option('--max, --maxRating <number>', 'Maximum player rating', '2000')
    .option('-d, --distribution <type>', 'Rating distribution (linear|normal)', 'linear')
    .option('-f, --format <type>', 'Match format (bo1|bo3)', 'bo1')
    .option('-i, --iterations <number>', 'Number of simulations', '100')
    .option('-r, --rounds <number>', 'Number of rounds per tournament', '7')
    .option('--draw <probability>', 'Probability of a draw (0-1)', '0.1')
    .option('--rating <system>', 'Rating system to use (elo|trueskill)', 'elo')
    .option('--progress', 'Show simulation progress', false)
    .parse(process.argv);

  const options = program.opts();

  const config: TournamentConfig = {
    players: {
      count: parseInt(options.players, 10),
      minRating: parseInt(options.minRating, 10),
      maxRating: parseInt(options.maxRating, 10),
      distribution: options.distribution
    },
    simulation: {
      format: options.format,
      iterations: parseInt(options.iterations, 10),
      rounds: parseInt(options.rounds, 10),
      showProgress: !!options.progress,
      drawProbability: parseFloat(options.draw),
      ratingSystem: options.rating as 'elo' | 'trueskill'
    }
  };

  if (!validateConfig(config)) {
    program.error('Invalid configuration provided');
  }

  return config;
}
