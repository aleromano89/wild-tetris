import { describe, expect, it } from 'vitest';
import { createEmptyBoard } from './board';
import { BOARD_COLS, BOARD_ROWS, HIDDEN_ROWS } from './config';
import { createGame, hardDrop, spawnPiece, tick } from './engine';

const ROWS = BOARD_ROWS + HIDDEN_ROWS;

/** Partita con le ultime `n` righe piene tranne le colonne 3..6 e una I pronta sopra il buco. */
function stateWithGap(n, { lines = 0, level = 1, vertical = false } = {}) {
  const board = createEmptyBoard(ROWS, BOARD_COLS);
  const gap = vertical ? [0] : [3, 4, 5, 6];
  for (let r = ROWS - n; r < ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) if (!gap.includes(c)) board[r][c] = 'Z';
  }
  const piece = vertical
    ? { type: 'I', shape: [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]], row: 0, col: -1 }
    : { ...spawnPiece('I'), col: 3 };
  return { ...createGame(() => 0), board, piece, lines, level };
}

describe('livelli', () => {
  it('passando da 9 a 10 righe si sale al livello 2', () => {
    const r = hardDrop(stateWithGap(1, { lines: 9 }));
    expect(r.lines).toBe(10);
    expect(r.level).toBe(2);
  });

  it('sotto le 10 righe il livello non cambia', () => {
    const r = hardDrop(stateWithGap(1, { lines: 8 }));
    expect(r.lines).toBe(9);
    expect(r.level).toBe(1);
  });

  it('i punti delle righe usano il livello di prima della salita', () => {
    const before = stateWithGap(4, { lines: 8, vertical: true });
    const r = hardDrop(before);
    expect(r.lines).toBe(12);
    expect(r.level).toBe(2);
    const dropPoints = (ROWS - 4) * 2; // la I verticale scende dalla riga 0 alla ROWS-4
    expect(r.score).toBe(dropPoints + 800 * 1);
  });

  it('dal livello 2 le righe valgono il doppio', () => {
    const r = hardDrop(stateWithGap(1, { lines: 12, level: 2 }));
    const dropPoints = (ROWS - 1) * 2; // la I (riga 1 della forma) dalla riga 0 alla ROWS-1
    expect(r.score).toBe(dropPoints + 200);
    expect(r.level).toBe(2);
  });
});

describe('game over', () => {
  /** Colonne 3..6 piene fino alla riga 2: il nuovo pezzo non può comparire. */
  function almostFull() {
    const board = createEmptyBoard(ROWS, BOARD_COLS);
    for (let r = 2; r < ROWS; r++) for (let c = 3; c <= 6; c++) board[r][c] = 'Z';
    return board;
  }

  it('quando il nuovo pezzo non ha spazio la partita termina', () => {
    const s = { ...createGame(() => 0), board: almostFull(), piece: { ...spawnPiece('O'), col: 4 } };
    const r = tick(s);
    expect(r.status).toBe('over');
  });

  it('a fine partita punteggio, righe e livello restano quelli raggiunti', () => {
    const s = {
      ...createGame(() => 0),
      board: almostFull(),
      piece: { ...spawnPiece('O'), col: 4 },
      score: 1234,
      lines: 27,
      level: 3,
    };
    const r = tick(s);
    expect(r).toMatchObject({ status: 'over', score: 1234, lines: 27, level: 3 });
  });

  it('a partita finita nessun comando modifica lo stato', () => {
    const over = { ...createGame(() => 0), status: 'over' };
    expect(tick(over)).toBe(over);
    expect(hardDrop(over)).toBe(over);
  });
});
