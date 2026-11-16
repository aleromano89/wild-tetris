import { describe, expect, it } from 'vitest';
import { createEmptyBoard } from './board';
import { BOARD_COLS, BOARD_ROWS } from './config';

describe('createEmptyBoard', () => {
  it('usa di default la griglia 10×20 definita in regole-gioco.md', () => {
    expect(BOARD_COLS).toBe(10);
    expect(BOARD_ROWS).toBe(20);

    const board = createEmptyBoard();
    expect(board).toHaveLength(20);
    board.forEach((row) => expect(row).toHaveLength(10));
  });

  it('crea tutte le celle vuote (null)', () => {
    const board = createEmptyBoard();
    expect(board.flat().every((cell) => cell === null)).toBe(true);
  });

  it('accetta dimensioni personalizzate', () => {
    const board = createEmptyBoard(4, 3);
    expect(board).toHaveLength(4);
    board.forEach((row) => expect(row).toHaveLength(3));
  });

  it('crea righe indipendenti (nessun riferimento condiviso)', () => {
    const board = createEmptyBoard(2, 2);
    board[0][0] = 'X';
    expect(board[1][0]).toBeNull();
  });
});
