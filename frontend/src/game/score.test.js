import { describe, expect, it } from 'vitest';
import { createEmptyBoard } from './board';
import { BOARD_COLS, BOARD_ROWS, HIDDEN_ROWS } from './config';
import { createGame, hardDrop, softDrop, spawnPiece, tick } from './engine';

const ROWS = BOARD_ROWS + HIDDEN_ROWS;

/** Griglia con le ultime `n` righe piene tranne le colonne indicate. */
function boardWithGaps(n, gapCols) {
  const board = createEmptyBoard(ROWS, BOARD_COLS);
  for (let r = ROWS - n; r < ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) if (!gapCols.includes(c)) board[r][c] = 'Z';
  }
  return board;
}

function stateWith(type, { row, col, board = createEmptyBoard(ROWS, BOARD_COLS), level = 1 } = {}) {
  const spawned = spawnPiece(type);
  return {
    board,
    piece: { ...spawned, row: row ?? spawned.row, col: col ?? spawned.col },
    next: 'O',
    queue: ['T'],
    status: 'running',
    rng: () => 0,
    score: 0,
    lines: 0,
    level,
  };
}

describe('stato iniziale', () => {
  it('punteggio 0, righe 0, livello 1', () => {
    const g = createGame(() => 0);
    expect(g.score).toBe(0);
    expect(g.lines).toBe(0);
    expect(g.level).toBe(1);
  });
});

describe('eliminazione righe nel gioco', () => {
  it('una riga completata dal pezzo viene eliminata e conta 100 punti', () => {
    // I orizzontale (colonne 3..6) nel buco dell'ultima riga
    const s = stateWith('I', { row: ROWS - 2, col: 3, board: boardWithGaps(1, [3, 4, 5, 6]) });
    const r = tick(s);
    expect(r.lines).toBe(1);
    expect(r.score).toBe(100);
    expect(r.board.flat().filter(Boolean)).toHaveLength(0);
  });

  it('4 righe insieme valgono 800 punti, moltiplicati per il livello', () => {
    // I verticale nella colonna 0, buco di 4 righe
    const board = boardWithGaps(4, [0]);
    const vertical = { type: 'I', shape: [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]] };
    const s = { ...stateWith('I', { board, level: 2 }), piece: { ...vertical, row: ROWS - 4, col: -1 } };
    const r = tick(s);
    expect(r.lines).toBe(4);
    expect(r.score).toBe(1600);
  });

  it('le righe incomplete restano e scendono', () => {
    const board = boardWithGaps(1, [3, 4, 5, 6]);
    board[ROWS - 2][0] = 'S'; // blocco sopra la riga da eliminare
    const r = tick(stateWith('I', { row: ROWS - 2, col: 3, board }));
    expect(r.board[ROWS - 1][0]).toBe('S');
    expect(r.board.flat().filter(Boolean)).toHaveLength(1);
  });

  it('senza righe complete punteggio e righe non cambiano', () => {
    const r = tick(stateWith('O', { row: ROWS - 2 }));
    expect(r.lines).toBe(0);
    expect(r.score).toBe(0);
  });

  it('le righe vengono eliminate prima di verificare lo spazio per il nuovo pezzo', () => {
    // il prossimo pezzo (O, colonne 4-5, righe 0-1) troverebbe un blocco in riga 1:
    // eliminando l'ultima riga il blocco scende in riga 2 e lascia spazio
    const board = boardWithGaps(1, [3, 4, 5, 6]);
    board[1][4] = 'Z';
    const s = stateWith('I', { row: ROWS - 2, col: 3, board });
    expect(tick(s).status).toBe('running');
  });
});

describe('punti di caduta', () => {
  it('caduta veloce: +1 per ogni cella scesa', () => {
    const s = stateWith('T', { row: 5 });
    const r = softDrop(softDrop(s));
    expect(r.piece.row).toBe(7);
    expect(r.score).toBe(2);
  });

  it('caduta veloce sul fondo: nessun punto (il pezzo non scende)', () => {
    const r = softDrop(stateWith('O', { row: ROWS - 2 }));
    expect(r.score).toBe(0);
  });

  it('la gravità non assegna punti', () => {
    expect(tick(stateWith('T', { row: 5 })).score).toBe(0);
  });

  it('caduta istantanea: +2 per ogni cella percorsa', () => {
    const r = hardDrop(stateWith('O', { row: 2 })); // fondo: row ROWS - 2 → 18 celle
    expect(r.score).toBe((ROWS - 2 - 2) * 2);
  });

  it('caduta istantanea che completa una riga: punti caduta + punti riga', () => {
    const s = stateWith('I', { row: ROWS - 6, col: 3, board: boardWithGaps(1, [3, 4, 5, 6]) });
    const r = hardDrop(s); // I (riga 1 della forma) da riga ROWS-5 a ROWS-1 → 4 celle
    expect(r.lines).toBe(1);
    expect(r.score).toBe(4 * 2 + 100);
  });

  it('i punti dei livelli superiori: le righe si moltiplicano, le cadute no', () => {
    const r = hardDrop(stateWith('I', { row: ROWS - 6, col: 3, board: boardWithGaps(1, [3, 4, 5, 6]), level: 3 }));
    expect(r.score).toBe(4 * 2 + 300);
  });
});
