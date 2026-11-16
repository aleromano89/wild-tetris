// Punteggio: vedi regole-gioco.md

/** Punti per righe eliminate insieme (indice = numero di righe), da moltiplicare per il livello. */
const LINE_POINTS = [0, 100, 300, 500, 800];

export const SOFT_DROP_POINTS = 1; // per cella, caduta veloce
export const HARD_DROP_POINTS = 2; // per cella, caduta istantanea

export function lineClearPoints(cleared, level) {
  return LINE_POINTS[cleared] * level;
}
