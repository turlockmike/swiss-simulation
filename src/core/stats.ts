import { Player } from './types';

export class SimulationStats {
  private players: Player[];
  private iterations: number;
  private overallStats: PlayerStats[];
  private tournamentStats: TournamentStats;

  constructor(players: Player[], iterations: number) {
    this.players = players.sort((a, b) => b.rating - a.rating);
    this.iterations = iterations;
    this.overallStats = this.players.map(player => ({
      id: player.id,
      totalWins: 0,
      totalLosses: 0,
      totalDraws: 0,
      winStreak: 0,
      maxWinStreak: 0,
      placements: [],
      scores: [],
      headToHead: new Map<string, number>()
    }));
    
    this.tournamentStats = {
      topPlayerWins: 0,
      top8Accuracy: 0
    };
  }

  public recordIterationResults(players: Player[]): void {
    // Sort players by points for placement calculation
    const sortedPlayers = [...players].sort((a, b) => 
      (b.wins + (b.draws * 0.5)) - (a.wins + (a.draws * 0.5))
    );

    // Update individual player stats
    players.forEach((player, index) => {
      const stats = this.overallStats.find(p => p.id === player.id)!;
      const points = player.wins + (player.draws * 0.5);
      const placement = sortedPlayers.findIndex(p => p.id === player.id) + 1;
      
      stats.totalWins += player.wins;
      stats.totalLosses += player.losses;
      stats.totalDraws += player.draws;
      stats.scores.push(points);
      stats.placements.push(placement);

      // Update win streak
      if (player.wins > 0) {
        stats.winStreak += player.wins;
        stats.maxWinStreak = Math.max(stats.maxWinStreak, stats.winStreak);
      } else {
        stats.winStreak = 0;
      }
    });

    // Update tournament-wide stats
    const topRatedPlayer = this.players[0];
    const topPerformingPlayer = sortedPlayers[0];
    if (topRatedPlayer.id === topPerformingPlayer.id) {
      this.tournamentStats.topPlayerWins++;
    }

    // Calculate top 8 accuracy
    const playerCount = this.players.length;
    const topN = Math.min(8, playerCount);
    if (topN > 0) {
      const top8Rated = [...this.players]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, topN)
        .map(p => p.id);
      const top8Performing = [...players]
        .sort((a, b) => (b.wins + (b.draws * 0.5)) - (a.wins + (a.draws * 0.5)))
        .slice(0, topN)
        .map(p => p.id);
      const matches = top8Rated.filter(id => top8Performing.includes(id));
      this.tournamentStats.top8Accuracy += matches.length / topN;
    }
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  public getOverallResults(): PlayerResult[] {
    return this.overallStats.map(stats => {
      const totalGames = stats.totalWins + stats.totalLosses + stats.totalDraws;
      const meanScore = this.iterations > 0 ? stats.scores.reduce((sum, val) => sum + val, 0) / this.iterations : 0;
      const scoreVariance = totalGames > 0 ? this.calculateVariance(stats.scores, meanScore) : 0;
      const meanPlacement = totalGames > 0 ? this.calculateMean(stats.placements) : 0;
      const placementVariance = totalGames > 0 ? this.calculateVariance(stats.placements, meanPlacement) : 0;
      
      return {
        id: stats.id,
        rating: this.players.find(p => p.id === stats.id)!.rating,
        meanScore,
        scoreVariance,
        meanPlacement,
        placementVariance,
        maxWinStreak: stats.maxWinStreak
      };
    }).sort((a, b) => b.meanScore - a.meanScore);
  }

  public printOverallResults(): void {
    const overallResults = this.getOverallResults();
    const topPlayerWinRate = this.tournamentStats.topPlayerWins / this.iterations;
    const avgTop8Accuracy = this.tournamentStats.top8Accuracy / this.iterations;

    console.log('\nOverall Performance Summary:');
    console.log('┌───────────┬──────────┬──────────────┬──────────────┬──────────────┬──────────────┐');
    console.log('│ Player ID │ Rating   │ Mean Score   │ Score Var    │ Mean Place   │ Place Var    │');
    console.log('├───────────┼──────────┼──────────────┼──────────────┼──────────────┼──────────────┤');
    overallResults.forEach(player => {
      console.log(`│ ${player.id.padEnd(9)} │ ${player.rating.toString().padEnd(8)} │ ${player.meanScore.toFixed(2).padStart(12)} │ ${player.scoreVariance.toFixed(2).padStart(12)} │ ${player.meanPlacement.toFixed(1).padStart(12)} │ ${player.placementVariance.toFixed(1).padStart(12)} │`);
    });
    console.log('└───────────┴──────────┴──────────────┴──────────────┴──────────────┴──────────────┘');

    console.log('\nTournament Statistics:');
    console.log(`Top Player Win Rate: ${(topPlayerWinRate * 100).toFixed(1)}%`);
    console.log(`Average Top 8 Accuracy: ${(avgTop8Accuracy * 100).toFixed(1)}%`);
  }
}

interface PlayerStats {
  id: string;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  winStreak: number;
  maxWinStreak: number;
  placements: number[];
  scores: number[];
  headToHead: Map<string, number>;
}

interface PlayerResult {
  id: string;
  rating: number;
  meanScore: number;
  scoreVariance: number;
  meanPlacement: number;
  placementVariance: number;
  maxWinStreak: number;
}

interface TournamentStats {
  topPlayerWins: number;
  top8Accuracy: number;
}
