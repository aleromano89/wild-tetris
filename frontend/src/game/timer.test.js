import { describe, expect, it } from 'vitest';
import { createTimer, elapsedMs, formatElapsed, startTimer, stopTimer } from './timer';

describe('timer - tempo di gioco', () => {
  it('fermo a 0 finché non parte', () => {
    expect(elapsedMs(createTimer(), 5000)).toBe(0);
  });

  it('conta il tempo trascorso da quando parte', () => {
    const t = startTimer(createTimer(), 1000);
    expect(elapsedMs(t, 1000)).toBe(0);
    expect(elapsedMs(t, 4500)).toBe(3500);
  });

  it('fermato non avanza; ripartito somma il tempo precedente', () => {
    let t = startTimer(createTimer(), 0);
    t = stopTimer(t, 2000);
    expect(elapsedMs(t, 10_000)).toBe(2000);
    t = startTimer(t, 10_000);
    expect(elapsedMs(t, 11_500)).toBe(3500);
  });

  it('start e stop ripetuti non alterano il conteggio', () => {
    let t = startTimer(createTimer(), 0);
    expect(startTimer(t, 500)).toBe(t);
    t = stopTimer(t, 1000);
    expect(stopTimer(t, 9000)).toBe(t);
    expect(elapsedMs(t, 9000)).toBe(1000);
  });

  it('un orologio che torna indietro non dà tempi negativi', () => {
    expect(elapsedMs(startTimer(createTimer(), 1000), 500)).toBe(0);
  });
});

describe('formatElapsed', () => {
  it.each([
    [0, '0:00'],
    [999, '0:00'],
    [1000, '0:01'],
    [59_999, '0:59'],
    [60_000, '1:00'],
    [605_000, '10:05'],
    [3_599_000, '59:59'],
    [3_600_000, '1:00:00'],
    [3_661_000, '1:01:01'],
  ])('%i ms → %s', (ms, text) => {
    expect(formatElapsed(ms)).toBe(text);
  });
});
