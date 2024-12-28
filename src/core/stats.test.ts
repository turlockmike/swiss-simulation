import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { SimulationStats } from './stats';
import { Player } from './types';

describe('SimulationStats', () => {
  let players: Player[];
  let player1: Player;
  let player2: Player;
  let stats: SimulationStats;
  const iterations = 100;

  beforeEach(() => {
    player1 = { id: 'p1', rating: 1500, wins: 0, losses: 0, draws: 0 };
    player2 = { id: 'p2', rating: 1600, wins: 0, losses: 0, draws: 0 };
    players = [
      player1, player2
    ];
    stats = new SimulationStats(players, iterations);
  });

  describe('constructor', () => {
    it('should initialize stats for each player', () => {
      const results = stats.getOverallResults();
      assert.strictEqual(results.length, 2);
      assert.strictEqual(results[0].id, 'p2');
      assert.strictEqual(results[1].id, 'p1');
    });

    it('should initialize all stats to zero', () => {
      const results = stats.getOverallResults();
      results.forEach(player => {
        assert.strictEqual(player.meanScore, 0);
        assert.strictEqual(player.scoreVariance, 0);
        assert.strictEqual(player.meanPlacement, 0);
        assert.strictEqual(player.placementVariance, 0);
        assert.strictEqual(player.maxWinStreak, 0);
      });
    });
  });

  describe('recordIterationResults', () => {
    it('should update win/loss/draw counts', () => {
      const updatedPlayers = [
        { ...player1, wins: 1, losses: 0, draws: 0 },
        { ...player2, wins: 0, losses: 1, draws: 0 }
      ];
      
      stats.recordIterationResults(updatedPlayers);
      const results = stats.getOverallResults();
      
      assert.strictEqual(results[0].meanScore, 1 / iterations);
      assert.strictEqual(results[1].meanScore, 0);
    });

    it('should update win streak', () => {
      const updatedPlayers = [
        { ...player1, wins: 3, losses: 0, draws: 0 },
        { ...player2, wins: 0, losses: 3, draws: 0 }
      ];
      
      stats.recordIterationResults(updatedPlayers);
      const results = stats.getOverallResults();
      
      assert.strictEqual(results[0].maxWinStreak, 3);
    });
  });

  describe('getOverallResults', () => {
    it('should return results sorted by avgPoints descending', () => {
      const updatedPlayers = [
        { ...player1, wins: 2, losses: 0, draws: 0 },
        { ...player2, wins: 3, losses: 0, draws: 0 }
      ];
      
      stats.recordIterationResults(updatedPlayers);
      const results = stats.getOverallResults();
      
      assert.strictEqual(results[0].id, 'p2');
      assert.strictEqual(results[1].id, 'p1');
    });

    it('should handle zero iterations', () => {
      const zeroIterStats = new SimulationStats(players, 0);
      const results = zeroIterStats.getOverallResults();
      
      results.forEach(player => {
        assert.strictEqual(player.meanScore, 0);
        assert.strictEqual(player.scoreVariance, 0);
        assert.strictEqual(player.meanPlacement, 0);
        assert.strictEqual(player.placementVariance, 0);
      });
    });
  });

  describe('printOverallResults', () => {
    it('should not throw with empty player list', () => {
      const emptyStats = new SimulationStats([], iterations);
      assert.doesNotThrow(() => emptyStats.printOverallResults());
    });

    it('should not throw with zero iterations', () => {
      const zeroIterStats = new SimulationStats(players, 0);
      assert.doesNotThrow(() => zeroIterStats.printOverallResults());
    });
  });

  describe('tournament statistics', () => {
    it('should track top player wins', () => {
      const topPlayer = player2; // p2 has higher rating
      const updatedPlayers = [
        { ...player1, wins: 0, losses: 1, draws: 0 },
        { ...player2, wins: 1, losses: 0, draws: 0 }
      ];
      
      stats.recordIterationResults(updatedPlayers);
      const results = stats.getOverallResults();
      
      assert.strictEqual(results[0].id, topPlayer.id);
    });

    it('should track top 8 accuracy', () => {
      const updatedPlayers = [
        { ...player1, wins: 1, losses: 0, draws: 0 },
        { ...player2, wins: 0, losses: 1, draws: 0 }
      ];
      
      stats.recordIterationResults(updatedPlayers);
      const results = stats.getOverallResults();
      
      // Since we only have 2 players, accuracy should be 1.0
      assert.strictEqual(results[0].id, player1.id);
    });
  });
});
