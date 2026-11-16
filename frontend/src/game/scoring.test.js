import { describe, expect, it } from 'vitest';
import { HARD_DROP_POINTS, SOFT_DROP_POINTS, lineClearPoints } from './scoring';

describe('lineClearPoints', () => {
  it('assegna 100 / 300 / 500 / 800 punti per 1 / 2 / 3 / 4 righe al livello 1', () => {
    expect(lineClearPoints(0, 1)).toBe(0);
    expect(lineClearPoints(1, 1)).toBe(100);
    expect(lineClearPoints(2, 1)).toBe(300);
    expect(lineClearPoints(3, 1)).toBe(500);
    expect(lineClearPoints(4, 1)).toBe(800);
  });

  it('moltiplica per il livello', () => {
    expect(lineClearPoints(1, 3)).toBe(300);
    expect(lineClearPoints(4, 2)).toBe(1600);
  });
});

describe('punti caduta', () => {
  it('caduta veloce +1 per cella, caduta istantanea +2 per cella', () => {
    expect(SOFT_DROP_POINTS).toBe(1);
    expect(HARD_DROP_POINTS).toBe(2);
  });
});
