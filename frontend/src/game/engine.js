import { createEmptyBoard } from './board';
import { BOARD_COLS, BOARD_ROWS, HIDDEN_ROWS, PREVIEW_SIZE } from './config';
import { levelForLines } from './levels';
import { clearLines } from './lines';
import { PIECES, createBag } from './pieces';
import { HARD_DROP_POINTS, SOFT_DROP_POINTS, lineClearPoints } from './scoring';

/**
 * Motore di gioco puro: ogni funzione restituisce un nuovo stato senza modificare l'input.
 *
 * Stato: { board, piece, next, queue, status, rng, score, lines, level }
 * - board: (BOARD_ROWS + HIDDEN_ROWS) × BOARD_COLS; le prime HIDDEN_ROWS righe sono la zona di comparsa
 * - piece: { type, shape, row, col } pezzo in caduta
 * - next: tipo del prossimo pezzo; queue: resto del sacchetto
 * - status: 'running' | 'over'
 * - score / lines / level: punteggio, righe eliminate, livello (sale ogni LINES_PER_LEVEL righe)
 */

/** Celle occupate dal pezzo, come coppie [riga, colonna] sulla griglia. */
export function getPieceCells({ shape, row, col }) {
  const cells = [];
  shape.forEach((line, r) =>
    line.forEach((filled, c) => {
      if (filled) cells.push([row + r, col + c]);
    })
  );
  return cells;
}

export function collides(board, piece) {
  return getPieceCells(piece).some(
    ([r, c]) => r < 0 || r >= board.length || c < 0 || c >= board[0].length || board[r][c] !== null
  );
}

/** Nuovo pezzo centrato, con la prima riga piena in riga 0 (zona nascosta). */
export function spawnPiece(type) {
  const shape = PIECES[type];
  const firstFilledRow = shape.findIndex((line) => line.some(Boolean));
  return {
    type,
    shape,
    row: 0 - firstFilledRow, // evita -0
    col: Math.floor((BOARD_COLS - shape[0].length) / 2),
  };
}

/** Estrae il prossimo tipo dalla coda, rimescolando un nuovo sacchetto quando è vuota. */
function draw(queue, rng) {
  const q = queue.length ? queue : createBag(rng);
  return [q[0], q.slice(1)];
}

export function createGame(rng = Math.random) {
  const [first, q1] = draw([], rng);
  const [next, queue] = draw(q1, rng);
  return {
    board: createEmptyBoard(BOARD_ROWS + HIDDEN_ROWS, BOARD_COLS),
    piece: spawnPiece(first),
    next,
    queue,
    status: 'running',
    rng,
    score: 0,
    lines: 0,
    level: 1,
  };
}

function lockPiece(board, piece) {
  const copy = board.map((line) => [...line]);
  getPieceCells(piece).forEach(([r, c]) => {
    copy[r][c] = piece.type;
  });
  return copy;
}

/** Fissa il pezzo corrente, elimina le righe complete, assegna i punti e fa comparire il successivo. */
function lockAndSpawn(state) {
  const { board, cleared } = clearLines(lockPiece(state.board, state.piece));
  const lines = state.lines + cleared;
  const scored = {
    ...state,
    board,
    lines,
    // i punti usano il livello in cui le righe sono state completate
    score: state.score + lineClearPoints(cleared, state.level),
    level: Math.max(state.level, levelForLines(lines)),
  };

  const piece = spawnPiece(state.next);
  if (collides(board, piece)) return { ...scored, status: 'over' };

  const [next, queue] = draw(state.queue, state.rng);
  return { ...scored, piece, next, queue };
}

/** Un passo di gravità: il pezzo scende di una riga, oppure viene fissato e ne compare uno nuovo. */
export function tick(state) {
  if (state.status !== 'running') return state;

  const moved = { ...state.piece, row: state.piece.row + 1 };
  if (!collides(state.board, moved)) return { ...state, piece: moved };
  return lockAndSpawn(state);
}

/** Righe visibili con il pezzo corrente sovrapposto (per il rendering). */
export function getVisibleBoard(state) {
  const board = state.status === 'running' ? lockPiece(state.board, state.piece) : state.board;
  return board.slice(HIDDEN_ROWS);
}

/** Griglia 4×4 dell'anteprima con il pezzo centrato. */
export function getPreview(type) {
  const grid = createEmptyBoard(PREVIEW_SIZE, PREVIEW_SIZE);
  if (!type) return grid;
  const shape = PIECES[type];
  const rows = shape.map((line, r) => (line.some(Boolean) ? r : -1)).filter((r) => r >= 0);
  const top = Math.floor((PREVIEW_SIZE - rows.length) / 2) - rows[0];
  const left = Math.floor((PREVIEW_SIZE - shape[0].length) / 2);
  shape.forEach((line, r) =>
    line.forEach((filled, c) => {
      if (filled) grid[top + r][left + c] = type;
    })
  );
  return grid;
}

/* ---------- Comandi del giocatore (fase 1.2.2) ---------- */

/** Sostituisce il pezzo corrente se la nuova posizione è libera, altrimenti restituisce lo stato invariato. */
function tryPlace(state, piece) {
  return collides(state.board, piece) ? null : { ...state, piece };
}

/** Sposta il pezzo di dCol colonne (-1 sinistra, +1 destra). */
export function move(state, dCol) {
  if (state.status !== 'running') return state;
  return tryPlace(state, { ...state.piece, col: state.piece.col + dCol }) ?? state;
}

/** Ruota una matrice quadrata: dir 1 = orario, -1 = antiorario. */
export function rotateShape(shape, dir) {
  const n = shape.length;
  return shape.map((_, r) =>
    shape.map((__, c) => (dir > 0 ? shape[n - 1 - c][r] : shape[c][n - 1 - r]))
  );
}

/** Rotazione con spostamento laterale: prova sul posto, poi 1 colonna a sinistra, poi a destra. */
export function rotate(state, dir) {
  if (state.status !== 'running') return state;
  const shape = rotateShape(state.piece.shape, dir);
  for (const kick of [0, -1, 1]) {
    const placed = tryPlace(state, { ...state.piece, shape, col: state.piece.col + kick });
    if (placed) return placed;
  }
  return state;
}

/** Caduta veloce: un passo di gravità anticipato, +1 punto se il pezzo scende (sul fondo lo fissa). */
export function softDrop(state) {
  const next = tick(state);
  if (next === state || next.board !== state.board) return next; // partita ferma o pezzo fissato
  return { ...next, score: next.score + SOFT_DROP_POINTS };
}

/** Caduta istantanea: il pezzo scende fino in fondo e viene fissato subito. */
export function hardDrop(state) {
  if (state.status !== 'running') return state;
  let piece = state.piece;
  while (!collides(state.board, { ...piece, row: piece.row + 1 })) {
    piece = { ...piece, row: piece.row + 1 };
  }
  const distance = piece.row - state.piece.row;
  return lockAndSpawn({ ...state, piece, score: state.score + distance * HARD_DROP_POINTS });
}
