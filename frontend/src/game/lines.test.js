import { describe, expect, it } from 'vitest';
import { clearLines } from './lines';

const full = (v = 'X', n = 4) => Array(n).fill(v);
const empty = (n = 4) => Array(n).fill(null);

describe('clearLines', () => {
  it('senza righe complete restituisce la stessa griglia e 0 righe', () => {
    const board = [empty(), ['A', null, null, null], ['A', 'A', null, 'A']];
    const result = clearLines(board);
    expect(result.cleared).toBe(0);
    expect(result.board).toBe(board);
  });

  it('elimina una riga completa e fa scendere quelle superiori', () => {
    const board = [empty(), ['A', null, null, null], full('B')];
    const { board: next, cleared } = clearLines(board);
    expect(cleared).toBe(1);
    expect(next).toEqual([empty(), empty(), ['A', null, null, null]]);
  });

  it('elimina più righe anche non adiacenti, mantenendo l\'ordine delle altre', () => {
    const board = [
      ['A', null, null, null],
      full('B'),
      [null, 'C', null, null],
      full('D'),
      [null, null, 'E', null],
    ];
    const { board: next, cleared } = clearLines(board);
    expect(cleared).toBe(2);
    expect(next).toEqual([
      empty(),
      empty(),
      ['A', null, null, null],
      [null, 'C', null, null],
      [null, null, 'E', null],
    ]);
  });

  it('elimina 4 righe insieme', () => {
    const board = [empty(), full(), full(), full(), full()];
    const { board: next, cleared } = clearLines(board);
    expect(cleared).toBe(4);
    expect(next).toHaveLength(5);
    expect(next.flat().every((c) => c === null)).toBe(true);
  });

  it('non modifica la griglia originale', () => {
    const board = [empty(), full()];
    const copy = JSON.stringify(board);
    clearLines(board);
    expect(JSON.stringify(board)).toBe(copy);
  });
});
