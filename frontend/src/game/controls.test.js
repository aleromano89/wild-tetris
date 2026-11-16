import { describe, expect, it } from 'vitest';
import { createEmptyBoard } from './board';
import { BOARD_COLS, BOARD_ROWS, HIDDEN_ROWS } from './config';
import { PIECES } from './pieces';
import { getPieceCells, hardDrop, move, rotate, rotateShape, softDrop, spawnPiece } from './engine';

const ROWS = BOARD_ROWS + HIDDEN_ROWS;

/** Stato di test con un pezzo dato in una posizione data. */
function stateWith(type, { row = 5, col = 3, board = createEmptyBoard(ROWS, BOARD_COLS) } = {}) {
  return {
    board,
    piece: { ...spawnPiece(type), row, col },
    next: 'O',
    queue: ['T', 'S'],
    status: 'running',
    rng: () => 0,
    score: 0,
    lines: 0,
    level: 1,
  };
}

const cells = (s) => getPieceCells(s.piece).map(([r, c]) => `${r},${c}`).sort();

describe('move (← →)', () => {
  it('sposta il pezzo di una colonna a sinistra e a destra', () => {
    const s = stateWith('T');
    expect(move(s, -1).piece.col).toBe(2);
    expect(move(s, 1).piece.col).toBe(4);
  });

  it('non oltrepassa i bordi', () => {
    const left = stateWith('O', { col: 0 });
    expect(move(left, -1)).toBe(left);
    const right = stateWith('O', { col: BOARD_COLS - 2 });
    expect(move(right, 1)).toBe(right);
  });

  it('non entra nei blocchi già fissati', () => {
    const board = createEmptyBoard(ROWS, BOARD_COLS);
    board[5][2] = 'Z';
    const s = stateWith('O', { row: 5, col: 3, board });
    expect(move(s, -1)).toBe(s);
  });

  it('non fa nulla se la partita non è in corso', () => {
    const s = { ...stateWith('T'), status: 'over' };
    expect(move(s, 1)).toBe(s);
  });
});

describe('rotateShape', () => {
  it('ruota in senso orario e antiorario', () => {
    expect(rotateShape(PIECES.J, 1)).toEqual([
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ]);
    expect(rotateShape(PIECES.J, -1)).toEqual([
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ]);
  });

  it('4 rotazioni riportano alla forma iniziale; orario + antiorario si annullano', () => {
    Object.values(PIECES).forEach((shape) => {
      let s = shape;
      for (let i = 0; i < 4; i++) s = rotateShape(s, 1);
      expect(s).toEqual(shape);
      expect(rotateShape(rotateShape(shape, 1), -1)).toEqual(shape);
    });
  });
});

describe('rotate (↑ / X orario, Z antiorario)', () => {
  it('ruota il pezzo in campo libero', () => {
    const s = stateWith('T');
    const r = rotate(s, 1);
    expect(r.piece.shape).toEqual(rotateShape(PIECES.T, 1));
    expect(r.piece.col).toBe(3);
    expect(rotate(s, -1).piece.shape).toEqual(rotateShape(PIECES.T, -1));
  });

  it('contro il muro sposta il pezzo di 1 colonna per poter ruotare', () => {
    // T ruotata in senso orario ha la colonna 0 vuota: la porto contro il muro sinistro
    const vertical = stateWith('T', { col: -1 });
    vertical.piece.shape = rotateShape(PIECES.T, 1);
    const r = rotate(vertical, 1);
    expect(r).not.toBe(vertical);
    expect(r.piece.col).toBe(0);
    getPieceCells(r.piece).forEach(([, c]) => expect(c).toBeGreaterThanOrEqual(0));
  });

  it('se non c\'è spazio nemmeno spostando di 1 colonna la rotazione viene annullata', () => {
    const board = createEmptyBoard(ROWS, BOARD_COLS);
    // I orizzontale in riga 6 (shape riga 1), colonne 3..6; blocco tutto intorno
    for (let c = 0; c < BOARD_COLS; c++) {
      board[5][c] = 'Z';
      board[7][c] = 'Z';
    }
    const s = stateWith('I', { row: 5, col: 3, board });
    expect(rotate(s, 1)).toBe(s);
  });

  it('il pezzo O ruotato occupa le stesse celle', () => {
    const s = stateWith('O');
    expect(cells(rotate(s, 1))).toEqual(cells(s));
  });
});

describe('softDrop (↓)', () => {
  it('fa scendere il pezzo di una riga', () => {
    const s = stateWith('T');
    expect(softDrop(s).piece.row).toBe(6);
  });

  it('sul fondo fissa il pezzo e fa comparire il successivo', () => {
    const s = stateWith('O', { row: ROWS - 2 });
    const r = softDrop(s);
    expect(r.board[ROWS - 1][3]).toBe('O');
    expect(r.piece.type).toBe('O'); // next
    expect(r.next).toBe('T');
  });
});

describe('hardDrop (Spazio)', () => {
  it('porta il pezzo fino in fondo e lo fissa subito', () => {
    const s = stateWith('O', { row: 2, col: 4 });
    const r = hardDrop(s);
    expect(r.board[ROWS - 1][4]).toBe('O');
    expect(r.board[ROWS - 2][5]).toBe('O');
    expect(r.board.flat().filter(Boolean)).toHaveLength(4);
    expect(r.next).toBe('T');
  });

  it('si ferma sopra i blocchi già presenti', () => {
    const board = createEmptyBoard(ROWS, BOARD_COLS);
    board[ROWS - 1][4] = 'Z';
    const r = hardDrop(stateWith('O', { row: 2, col: 4, board }));
    expect(r.board[ROWS - 2][4]).toBe('O');
    expect(r.board[ROWS - 3][4]).toBe('O');
  });

  it('non fa nulla se la partita non è in corso', () => {
    const s = { ...stateWith('O'), status: 'over' };
    expect(hardDrop(s)).toBe(s);
  });
});
