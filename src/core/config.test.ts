import { test, describe } from 'node:test';
import assert from 'node:assert';
import { validateConfig, TournamentConfig } from './config';

describe('Configuration Validation', () => {
  const validConfig: TournamentConfig = {
    players: {
      count: 8,
      distribution: 'linear',
      minRating: 1000,
      maxRating: 2000
    },
    simulation: {
      format: 'bo1',
      iterations: 100,
      rounds: 9,
      showProgress: true
    }
  };

  test('should validate correct configuration', () => {
    assert.ok(validateConfig(validConfig));
  });

  test('should reject invalid player count', () => {
    const config = { ...validConfig, players: { ...validConfig.players, count: 1 } };
    assert.ok(!validateConfig(config));
  });

  test('should reject invalid rating range', () => {
    const config = { ...validConfig, players: { ...validConfig.players, minRating: 2000, maxRating: 1000 } };
    assert.ok(!validateConfig(config));
  });

  test('should reject normal distribution with insufficient rating range', () => {
    const config = { 
      ...validConfig, 
      players: { 
        ...validConfig.players, 
        distribution: 'normal' as const,
        minRating: 1000,
        maxRating: 1200
      } 
    };
    assert.ok(!validateConfig(config));
  });

  test('should reject invalid simulation iterations', () => {
    const config = { ...validConfig, simulation: { ...validConfig.simulation, iterations: 0 } };
    assert.ok(!validateConfig(config));
  });

  test('should accept valid normal distribution', () => {
    const config = { 
      ...validConfig, 
      players: { 
        ...validConfig.players, 
        distribution: 'normal' as const,
        minRating: 1000,
        maxRating: 2000
      } 
    };
    assert.ok(validateConfig(config));
  });
});
