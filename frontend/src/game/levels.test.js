import { describe, expect, it } from 'vitest';
import { DROP_INTERVAL_MS, LINES_PER_LEVEL, MIN_DROP_INTERVAL_MS } from './config';
import { dropInterval, levelForLines } from './levels';

describe('levelForLines', () => {
  it('si sale di livello ogni 10 righe, partendo dal livello 1', () => {
    expect(LINES_PER_LEVEL).toBe(10);
    expect(levelForLines(0)).toBe(1);
    expect(levelForLines(9)).toBe(1);
    expect(levelForLines(10)).toBe(2);
    expect(levelForLines(19)).toBe(2);
    expect(levelForLines(25)).toBe(3);
    expect(levelForLines(100)).toBe(11);
  });
});

describe('dropInterval', () => {
  it('al livello 1 vale la velocità di base', () => {
    expect(dropInterval(1)).toBe(DROP_INTERVAL_MS);
  });

  it('diminuisce a ogni livello (caduta più veloce)', () => {
    for (let level = 1; level < 12; level++) {
      expect(dropInterval(level + 1)).toBeLessThan(dropInterval(level));
    }
  });

  it('non scende mai sotto il minimo', () => {
    expect(MIN_DROP_INTERVAL_MS).toBeGreaterThan(0);
    for (let level = 1; level <= 50; level++) {
      expect(dropInterval(level)).toBeGreaterThanOrEqual(MIN_DROP_INTERVAL_MS);
    }
    expect(dropInterval(50)).toBe(MIN_DROP_INTERVAL_MS);
  });

  it('restituisce millisecondi interi', () => {
    for (let level = 1; level <= 20; level++) expect(Number.isInteger(dropInterval(level))).toBe(true);
  });
});
