import { MatchResult, Player, SimulationConfig } from './types';
import { calculateWinProbability } from './utils';

export class TournamentSimulation {
  private players: Player[];
  private config: SimulationConfig;

  constructor(players: Player[], config: SimulationConfig) {
    this.players = players;
    this.config = config;
  }

  private simulateGame(playerA: Player, playerB: Player): MatchResult {
    const aWinProbability = calculateWinProbability(playerA, playerB, this.config.ratingSystem);
    const drawProbability = this.config.drawProbability ?? 0.1;

    // Handle forced draws
    if (drawProbability === 1.0) {
      return { winnerId: null, loserId: null, draw: true };
    }

    const adjustedDrawProbability = drawProbability * (1 - Math.abs(aWinProbability - 0.5));
    const result = Math.random();

    if (result < aWinProbability * (1 - adjustedDrawProbability)) {
      return { winnerId: playerA.id, loserId: playerB.id, draw: false };
    } else if (result < aWinProbability * (1 - adjustedDrawProbability) + adjustedDrawProbability) {
      return { winnerId: null, loserId: null, draw: true };
    } else {
      return { winnerId: playerB.id, loserId: playerA.id, draw: false };
    }
  }

  public simulateMatch(playerA: Player, playerB: Player): MatchResult {
    if (this.config.format === 'bo1') {
      return this.simulateGame(playerA, playerB);
    }

    // Best of 3 logic - exactly 3 games
    let playerAWins = 0;
    let playerBWins = 0;
    
    for (let game = 0; game < 3; game++) {
      const result = this.simulateGame(playerA, playerB);
      if (result.winnerId === playerA.id) {
        playerAWins++;
      } else if (result.winnerId === playerB.id) {
        playerBWins++;
      }
      // Draws count as no result for the game
    }

    if (playerAWins >= 2) {
      playerA.wins++;
      playerB.losses++;
      return { winnerId: playerA.id, loserId: playerB.id, draw: false };
    } else if (playerBWins >= 2) {
      playerB.wins++;
      playerA.losses++;
      return { winnerId: playerB.id, loserId: playerA.id, draw: false };
    }
    
    if (this.config.format === 'bo3-no-draws') {
      // Coin flip to decide winner when match would normally draw
      const winner = Math.random() < 0.5 ? playerA : playerB;
      const loser = winner === playerA ? playerB : playerA;
      
      // Update stats for the forced win/loss
      winner.wins++;
      loser.losses++;
      
      return { 
        winnerId: winner.id, 
        loserId: loser.id, 
        draw: false 
      };
    }
    
    // Regular bo3 format results in a draw
    playerA.draws++;
    playerB.draws++;
    return { winnerId: null, loserId: null, draw: true };
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
}
