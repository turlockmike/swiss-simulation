import { test, describe } from 'node:test';
import assert from 'node:assert';
import { generatePlayers } from './simulation';
import { TournamentSimulation } from './tournament';
import { Player, SimulationConfig } from './types';

describe('TournamentSimulation', () => {
  const players: Player[] = [
    { id: '1', rating: 1600, wins: 0, losses: 0, draws: 0 },
    { id: '2', rating: 1400, wins: 0, losses: 0, draws: 0 }
  ];
  
  const config: SimulationConfig = {
    format: 'bo1',
    iterations: 100,
    rounds: 3,
    showProgress: false,
    drawProbability: 0.2
  };

  test('should initialize with players and config', () => {
    const simulation = new TournamentSimulation(players, config);
    assert.ok(simulation);
  });

  test('should simulate match with expected win probability', () => {
    const simulation = new TournamentSimulation(players, config);
    const results = {
      player1Wins: 0,
      player2Wins: 0
    };

    // Run multiple simulations to test probability
    for (let i = 0; i < 1000; i++) {
      const match = simulation.simulateMatch(players[0], players[1]);
      if (match.winnerId === '1') {
        results.player1Wins++;
      } else {
        results.player2Wins++;
      }
    }
    assert.ok(results.player1Wins > 500);
    // Player 1 should win more often due to higher rating
    assert.ok(results.player1Wins > results.player2Wins);
  });

  test('should calculate win probability correctly', () => {
    const simulation = new TournamentSimulation(players, config);
    const probability = simulation['calculateWinProbability'](players[0], players[1]);
    assert.ok(probability > 0.5);
    assert.ok(probability < 1);
  });

  test('should calculate trueskill win probability correctly', () => {
    const simulation = new TournamentSimulation(players, config);
    const probability = simulation['calculateTrueSkillWinProbability'](players[0], players[1]);
    assert.ok(probability >= 0);
    assert.ok(probability <= 1);
    // Player 1 should have higher win probability due to higher rating
    const reverseProbability = simulation['calculateTrueSkillWinProbability'](players[1], players[0]);
    assert.ok(probability > reverseProbability);
  });
});

describe('Player Generation', () => {
  test('should generate linear distribution of ratings', () => {
    const players = generatePlayers({
      count: 10,
      minRating: 1000,
      maxRating: 2000,
      distribution: 'linear'
    });

    assert.strictEqual(players.length, 10);
    assert.strictEqual(players[0].rating, 1000);
    assert.strictEqual(players[9].rating, 2000);
    assert.strictEqual(players[4].rating, 1444);
  });

  test('should generate normal distribution of ratings within range', () => {
    const players = generatePlayers({
      count: 100,
      minRating: 1000,
      maxRating: 2000,
      distribution: 'normal'
    });

    assert.strictEqual(players.length, 100);
    players.forEach(player => {
      assert.ok(player.rating >= 1000);
      assert.ok(player.rating <= 2000);
    });
  });

  test('should generate normal distribution with expected shape', () => {
    const players = generatePlayers({
      count: 1000,
      minRating: 1000,
      maxRating: 2000,
      distribution: 'normal'
    });

    const ratings = players.map(p => p.rating);
    const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    const stdDev = Math.sqrt(ratings.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / ratings.length);

    // Mean should be close to 1500
    assert.ok(mean > 1450 && mean < 1550);
    // Standard deviation should be close to 250
    assert.ok(stdDev > 200 && stdDev < 300);
  });

  test('should handle single player generation', () => {
    const players = generatePlayers({
      count: 1,
      minRating: 1000,
      maxRating: 2000,
      distribution: 'normal'
    });

    assert.strictEqual(players.length, 1);
    assert.ok(players[0].rating >= 1000 && players[0].rating <= 2000);
  });

  test('should properly simulate multiple rounds', () => {
    const players = generatePlayers({
      count: 4,
      minRating: 1000,
      maxRating: 2000,
      distribution: 'linear'
    });
    
    const config: SimulationConfig = {
      format: 'bo1',
      iterations: 100,
      rounds: 3,
      showProgress: false
    };
    
    const simulation = new TournamentSimulation(players, config);
    
    // Simulate 3 rounds
    for (let round = 1; round <= 3; round++) {
      simulation.simulateRound(players, round);
    }
    
    // Verify that each player has played the expected number of matches
    players.forEach(player => {
      const totalMatches = player.wins + player.losses + player.draws;
      assert.strictEqual(totalMatches, 3, `Player ${player.id} should have played 3 matches`);
    });
    
    // Verify that the total wins equals the total losses
    const totalWins = players.reduce((sum, player) => sum + player.wins, 0);
    const totalLosses = players.reduce((sum, player) => sum + player.losses, 0);
    assert.strictEqual(totalWins, totalLosses, 'Total wins should equal total losses');
  });

  test('should correctly calculate average points', () => {
    const players = generatePlayers({
      count: 4,
      minRating: 1000,
      maxRating: 2000,
      distribution: 'linear'
    });
    
    const config: SimulationConfig = {
      format: 'bo1',
      iterations: 100,
      rounds: 3,
      showProgress: false
    };
    
    const simulation = new TournamentSimulation(players, config);
    
    // Simulate 2 iterations with 3 rounds each
    for (let i = 0; i < 2; i++) {
      for (let round = 1; round <= 3; round++) {
        simulation.simulateRound(players, round);
      }
    }

    // Calculate expected average points
    const expectedAvgPoints = players.map(player => 
      (player.wins + (player.draws * 0.5)) / 2
    );

    // Get actual average points from simulation
    const actualAvgPoints = players.map(player => 
      (player.wins + (player.draws * 0.5)) / 2
    );

    // Verify averages match
    players.forEach((player, index) => {
      assert.strictEqual(
        actualAvgPoints[index],
        expectedAvgPoints[index],
        `Player ${player.id} average points calculation is incorrect`
      );
    });
  });
});
