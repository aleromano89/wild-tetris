/**
 * Elimina le righe complete: le righe superiori scendono e in cima si aggiungono righe vuote.
 * Restituisce { board, cleared }; se non ci sono righe complete restituisce la griglia originale.
 */
export function clearLines(board) {
  const kept = board.filter((row) => row.some((cell) => cell === null));
  const cleared = board.length - kept.length;
  if (cleared === 0) return { board, cleared };

  const cols = board[0].length;
  const emptyRows = Array.from({ length: cleared }, () => Array(cols).fill(null));
  return { board: [...emptyRows, ...kept.map((row) => [...row])], cleared };
}
