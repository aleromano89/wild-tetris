import { DROP_INTERVAL_MS, LINES_PER_LEVEL, MIN_DROP_INTERVAL_MS, SPEED_FACTOR } from './config';

/** Livello raggiunto con un certo numero di righe eliminate (si parte dal livello 1). */
export function levelForLines(lines) {
  return Math.floor(lines / LINES_PER_LEVEL) + 1;
}

/** Millisecondi tra un passo di gravità e il successivo al livello dato. */
export function dropInterval(level) {
  const ms = Math.round(DROP_INTERVAL_MS * SPEED_FACTOR ** (level - 1));
  return Math.max(MIN_DROP_INTERVAL_MS, ms);
}
