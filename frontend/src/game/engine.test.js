import { describe, expect, it } from 'vitest';
import { BOARD_COLS, BOARD_ROWS, HIDDEN_ROWS } from './config';
import { PIECES } from './pieces';
import {
  collides,
  createGame,
  getPieceCells,
  getPreview,
  getVisibleBoard,
  spawnPiece,
  tick,
} from './engine';

const rng = () => 0; // sequenza deterministica

/** Fa avanzare il gioco finché il pezzo corrente non viene sostituito. */
function dropUntilLocked(state) {
  let s = state;
  while (s.board === state.board && s.status === 'running') s = tick(s);
  return s;
}

describe('createGame', () => {
  it('crea una griglia vuota con le righe nascoste di comparsa', () => {
    const game = createGame(rng);
    expect(game.board).toHaveLength(BOARD_ROWS + HIDDEN_ROWS);
    game.board.forEach((row) => expect(row).toHaveLength(BOARD_COLS));
    expect(game.board.flat().every((c) => c === null)).toBe(true);
  });

  it('ha un pezzo corrente e un prossimo pezzo, stato running', () => {
    const game = createGame(rng);
    expect(PIECES[game.piece.type]).toBeDefined();
    expect(PIECES[game.next]).toBeDefined();
    expect(game.status).toBe('running');
  });

  it('il pezzo compare nella zona nascosta, centrato orizzontalmente', () => {
    const { piece } = createGame(rng);
    const cells = getPieceCells(piece);
    expect(Math.min(...cells.map(([r]) => r))).toBe(0);
    const cols = cells.map(([, c]) => c);
    const center = (Math.min(...cols) + Math.max(...cols) + 1) / 2;
    expect(Math.abs(center - BOARD_COLS / 2)).toBeLessThanOrEqual(1);
  });
});

describe('collides', () => {
  const board = Array.from({ length: 4 }, () => Array(4).fill(null));
  const piece = { type: 'O', shape: [[1, 1], [1, 1]], row: 0, col: 0 };

  it('nessuna collisione in uno spazio libero', () => {
    expect(collides(board, piece)).toBe(false);
  });

  it('collide con il fondo e con i bordi', () => {
    expect(collides(board, { ...piece, row: 3 })).toBe(true);
    expect(collides(board, { ...piece, col: -1 })).toBe(true);
    expect(collides(board, { ...piece, col: 3 })).toBe(true);
  });

  it('collide con blocchi già presenti', () => {
    const filled = board.map((r) => [...r]);
    filled[1][1] = 'T';
    expect(collides(filled, piece)).toBe(true);
  });
});

describe('tick (caduta automatica)', () => {
  it('fa scendere il pezzo di una riga', () => {
    const game = createGame(rng);
    const next = tick(game);
    expect(next.piece.row).toBe(game.piece.row + 1);
    expect(next.piece.col).toBe(game.piece.col);
  });

  it('non modifica lo stato originale (funzione pura)', () => {
    const game = createGame(rng);
    const snapshot = JSON.stringify(game);
    tick(game);
    expect(JSON.stringify(game)).toBe(snapshot);
  });

  it('quando il pezzo tocca il fondo viene fissato nella griglia', () => {
    const game = createGame(rng);
    const after = dropUntilLocked(game);
    const lastRow = after.board[after.board.length - 1];
    expect(lastRow.filter((c) => c === game.piece.type).length).toBeGreaterThan(0);
    expect(after.board.flat().filter(Boolean)).toHaveLength(4);
  });

  it('dopo il fissaggio il prossimo pezzo diventa quello corrente', () => {
    const game = createGame(rng);
    const after = dropUntilLocked(game);
    expect(after.piece.type).toBe(game.next);
    expect(PIECES[after.next]).toBeDefined();
  });

  it('i pezzi si impilano uno sull\'altro', () => {
    let s = createGame(rng);
    s = dropUntilLocked(s);
    s = dropUntilLocked(s);
    expect(s.board.flat().filter(Boolean)).toHaveLength(8);
  });

  it('genera i pezzi a sacchetto: i primi 7 sono tutti diversi', () => {
    let s = createGame(Math.random);
    const types = [s.piece.type];
    for (let i = 0; i < 6; i++) {
      s = dropUntilLocked(s);
      types.push(s.piece.type);
    }
    expect(new Set(types).size).toBe(7);
  });

  it('game over quando il nuovo pezzo non ha spazio per comparire', () => {
    let s = createGame(rng);
    let guard = 0;
    while (s.status === 'running' && guard++ < 10000) s = tick(s);
    expect(s.status).toBe('over');
    expect(tick(s)).toBe(s); // a partita finita non cambia più nulla
  });
});

describe('spawnPiece', () => {
  it('posiziona il pezzo in riga 0', () => {
    expect(spawnPiece('T').row).toBe(0);
  });
});

describe('getVisibleBoard', () => {
  it('restituisce solo le 20 righe visibili con il pezzo corrente sovrapposto', () => {
    let s = createGame(rng);
    for (let i = 0; i < 5; i++) s = tick(s);
    const visible = getVisibleBoard(s);
    expect(visible).toHaveLength(BOARD_ROWS);
    expect(visible.flat().filter(Boolean)).toHaveLength(4);
    expect(s.board.flat().filter(Boolean)).toHaveLength(0); // la griglia non viene modificata
  });

  it('le celle del pezzo nella zona nascosta non sono visibili', () => {
    const s = createGame(rng);
    const hiddenCells = getPieceCells(s.piece).filter(([r]) => r < HIDDEN_ROWS).length;
    expect(getVisibleBoard(s).flat().filter(Boolean)).toHaveLength(4 - hiddenCells);
  });
});

describe('getPreview', () => {
  it('mostra il prossimo pezzo in una griglia 4×4', () => {
    const preview = getPreview('L');
    expect(preview).toHaveLength(4);
    preview.forEach((row) => expect(row).toHaveLength(4));
    expect(preview.flat().filter((c) => c === 'L')).toHaveLength(4);
  });

  it('senza pezzo restituisce una griglia vuota', () => {
    expect(getPreview(null).flat().every((c) => c === null)).toBe(true);
  });
});
