import { describe, expect, it } from 'vitest';
import { calculateXirr } from './xirr';

describe('calculateXirr', () => {
  it('calculates a one-year money-weighted return', () => {
    expect(calculateXirr([
      { date: '2024-01-01', amount: -1000 },
      { date: '2025-01-01', amount: 1100 },
    ])).toBeCloseTo(0.1, 3);
  });

  it('supports irregular contributions', () => {
    const result = calculateXirr([
      { date: '2024-01-01', amount: -500 },
      { date: '2024-07-01', amount: -500 },
      { date: '2025-01-01', amount: 1100 },
    ]);
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThan(0);
  });

  it('returns null without both positive and negative cash flows', () => {
    expect(calculateXirr([{ date: '2024-01-01', amount: -1000 }])).toBeNull();
  });
});
