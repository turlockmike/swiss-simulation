import { normalRandom } from './utils';
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('normalRandom', () => {
  it('should generate numbers within expected range', () => {
    const mean = 100;
    const stdDev = 15;
    const results = Array.from({length: 1000}, () => normalRandom(mean, stdDev));
    
    // Check that all values are within 3 standard deviations
    // Allow for some statistical variation beyond 3 std devs
    results.forEach(value => {
      assert.ok(value >= mean - 4 * stdDev, `Value ${value} is below expected range`);
      assert.ok(value <= mean + 4 * stdDev, `Value ${value} is above expected range`);
    });
  });

  it('should handle edge cases', () => {
    // Test with zero standard deviation
    assert.strictEqual(normalRandom(100, 0), 100);
    
    // Test with very small standard deviation
    const smallStdDev = normalRandom(50, 0.0001);
    assert.ok(Math.abs(smallStdDev - 50) < 0.0003, `Value ${smallStdDev} is not within expected range`);
  });
});
