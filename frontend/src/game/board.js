import { BOARD_COLS, BOARD_ROWS } from './config';

/**
 * Crea una griglia vuota rows × cols. Ogni cella vale null (vuota)
 * oppure, in seguito, l'identificativo del pezzo che la occupa.
 */
export function createEmptyBoard(rows = BOARD_ROWS, cols = BOARD_COLS) {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}
