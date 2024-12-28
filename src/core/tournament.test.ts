import { test, describe } from 'node:test';
import assert from 'node:assert';
import { TournamentSimulation } from './tournament';
import { Player, SimulationConfig } from './types';

describe('TournamentSimulation - simulateMatch', () => {
  const playerA: Player = { id: '1', rating: 1600, wins: 0, losses: 0, draws: 0 };
  const playerB: Player = { id: '2', rating: 1400, wins: 0, losses: 0, draws: 0 };

  test('should return correct result for bo1 match', () => {
    const config: SimulationConfig = {
      format: 'bo1',
      iterations: 1,
      rounds: 1,
      showProgress: false,
      drawProbability: 0.1,
      ratingSystem: 'elo'
    };
    const simulation = new TournamentSimulation([playerA, playerB], config);
    
    const result = simulation.simulateMatch(playerA, playerB);
    assert.ok(result.winnerId === playerA.id || result.winnerId === playerB.id || result.draw);
    if (result.draw) {
      assert.strictEqual(result.winnerId, null);
      assert.strictEqual(result.loserId, null);
    } else {
      assert.ok(result.loserId === playerA.id || result.loserId === playerB.id);
    }
  });

  test('should return draw for bo1 match when probability indicates draw', () => {
    const config: SimulationConfig = {
      format: 'bo1',
      iterations: 1,
      rounds: 1,
      showProgress: false,
      drawProbability: 1.0, // Force draw
      ratingSystem: 'elo'
    };
    const simulation = new TournamentSimulation([playerA, playerB], config);
    
    const result = simulation.simulateMatch(playerA, playerB);
    assert.strictEqual(result.draw, true);
    assert.strictEqual(result.winnerId, null);
    assert.strictEqual(result.loserId, null);
  });

  test('should return correct result for bo3 match', () => {
    const config: SimulationConfig = {
      format: 'bo3',
      iterations: 1,
      rounds: 1,
      showProgress: false,
      drawProbability: 0.1,
      ratingSystem: 'elo'
    };
    const simulation = new TournamentSimulation([playerA, playerB], config);
    
    const result = simulation.simulateMatch(playerA, playerB);
    assert.ok(result.winnerId === playerA.id || result.winnerId === playerB.id || result.draw);
    if (result.draw) {
      assert.strictEqual(result.winnerId, null);
      assert.strictEqual(result.loserId, null);
    } else {
      assert.ok(result.loserId === playerA.id || result.loserId === playerB.id);
    }
  });

  test('should return draw for bo3 match when neither player wins 2 games', () => {
    const config: SimulationConfig = {
      format: 'bo3',
      iterations: 1,
      rounds: 1,
      showProgress: false,
      drawProbability: 1.0, // Force draws in all games
      ratingSystem: 'elo'
    };
    const simulation = new TournamentSimulation([playerA, playerB], config);
    
    const result = simulation.simulateMatch(playerA, playerB);
    assert.strictEqual(result.draw, true);
    assert.strictEqual(result.winnerId, null);
    assert.strictEqual(result.loserId, null);
  });

  test('should use trueskill rating system when specified', () => {
    const config: SimulationConfig = {
      format: 'bo1',
      iterations: 1,
      rounds: 1,
      showProgress: false,
      drawProbability: 0.1,
      ratingSystem: 'trueskill'
    };
    const simulation = new TournamentSimulation([playerA, playerB], config);
    
    const result = simulation.simulateMatch(playerA, playerB);
    assert.ok(result.winnerId === playerA.id || result.winnerId === playerB.id || result.draw);
  });

  test('should handle equal rated players correctly', () => {
    const equalPlayer: Player = { ...playerA, id: '3', rating: playerA.rating };
    const config: SimulationConfig = {
      format: 'bo1',
      iterations: 1,
      rounds: 1,
      showProgress: false,
      drawProbability: 0.1,
      ratingSystem: 'elo'
    };
    const simulation = new TournamentSimulation([playerA, equalPlayer], config);
    
    const result = simulation.simulateMatch(playerA, equalPlayer);
    assert.ok(result.winnerId === playerA.id || result.winnerId === equalPlayer.id || result.draw);
  });

  test('should resolve bo3 no draws with coin flip', () => {
    const config: SimulationConfig = {
      format: 'bo3-no-draws',
      iterations: 1,
      rounds: 1,
      showProgress: false,
      drawProbability: 1.0, // Force draws in all games
      ratingSystem: 'elo'
    };

    // Test multiple iterations to ensure consistent behavior
    for (let i = 0; i < 100; i++) {
      // Create fresh players for each iteration
      const playerA: Player = { id: '1', rating: 1600, wins: 0, losses: 0, draws: 0 };
      const playerB: Player = { id: '2', rating: 1400, wins: 0, losses: 0, draws: 0 };
      
      const simulation = new TournamentSimulation([playerA, playerB], config);
      const result = simulation.simulateMatch(playerA, playerB);
      
      // Verify match result properties
      assert.strictEqual(result.draw, false);
      assert.ok(result.winnerId === playerA.id || result.winnerId === playerB.id);
      assert.ok(result.loserId === playerA.id || result.loserId === playerB.id);
      assert.notStrictEqual(result.winnerId, result.loserId);
      
      // Verify exactly one player has 1 win
      const totalWins = playerA.wins + playerB.wins;
      assert.strictEqual(totalWins, 1);
    }
  });
});
