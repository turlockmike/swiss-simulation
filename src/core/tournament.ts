import { MatchResult, Player, SimulationConfig } from './types';

export class TournamentSimulation {
  private players: Player[];
  private config: SimulationConfig;

  constructor(players: Player[], config: SimulationConfig) {
    this.players = players;
    this.config = config;
  }

  public simulateMatch(playerA: Player, playerB: Player): MatchResult {
    const aWinProbability = this.calculateWinProbability(playerA, playerB);
    const baseDrawProbability = this.config.drawProbability ?? 0.1;
    const drawProbability = baseDrawProbability * (1 - Math.abs(aWinProbability - 0.5)); // Higher draw chance for closer matches
    const result = Math.random();
    
    if (result < aWinProbability - drawProbability/2) {
      return { winnerId: playerA.id, loserId: playerB.id, draw: false };
    } else if (result < aWinProbability + drawProbability/2) {
      return { winnerId: null, loserId: null, draw: true };
    } else {
      return { winnerId: playerB.id, loserId: playerA.id, draw: false };
    }
  }

  public simulateRound(players: Player[], roundNumber: number): void {
    const pairings = this.createPairings(players, roundNumber);
    
    for (const [playerA, playerB] of pairings) {
      const result = this.simulateMatch(playerA, playerB);
      this.updatePlayerStats(playerA, playerB, result);
    }
  }

  private createPairings(players: Player[], roundNumber: number): [Player, Player][] {
    // First round: random pairings
    if (roundNumber === 1) {
      const shuffledPlayers = this.shufflePlayers(players);
      return this.createSequentialPairings(shuffledPlayers);
    }
    
    // Subsequent rounds: pair by score
    return this.createSwissPairings(players);
  }

  private shufflePlayers(players: Player[]): Player[] {
    return players
      .map(player => ({ player, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ player }) => player);
  }

  private createSequentialPairings(players: Player[]): [Player, Player][] {
    const pairings: [Player, Player][] = [];
    for (let i = 0; i < players.length; i += 2) {
      if (i + 1 < players.length) {
        pairings.push([players[i], players[i + 1]]);
      }
    }
    return pairings;
  }

  private createSwissPairings(players: Player[]): [Player, Player][] {
    // Sort players by score (descending)
    const sortedPlayers = [...players].sort((a, b) => {
      const scoreDiff = (b.wins - b.losses) - (a.wins - a.losses);
      return scoreDiff !== 0 ? scoreDiff : b.rating - a.rating;
    });

    return this.createSequentialPairings(sortedPlayers);
  }

  private updatePlayerStats(playerA: Player, playerB: Player, result: MatchResult): void {
    if (result.draw) {
      playerA.draws++;
      playerB.draws++;
    } else if (result.winnerId === playerA.id) {
      playerA.wins++;
      playerB.losses++;
    } else if (result.winnerId === playerB.id) {
      playerB.wins++;
      playerA.losses++;
    }
  }

  private calculateWinProbability(playerA: Player, playerB: Player): number {
    const ratingDiff = playerA.rating - playerB.rating;
    return 1 / (1 + Math.pow(10, -ratingDiff / 400));
  }

  private calculateTrueSkillWinProbability(playerA: Player, playerB: Player): number {
    const beta = 25 / 6; // Default value for beta in TrueSkill
    const ratingDiff = playerA.rating - playerB.rating;
    return 1 / (1 + Math.exp(-ratingDiff / (Math.sqrt(2) * beta)));
  }
}
