// Tempo di gioco: conta solo mentre la partita è in corso (fermo in pausa e a fine partita).
// Funzioni pure: l'istante corrente (ms) è sempre passato da fuori.

/** Timer fermo a 0. elapsed: ms già accumulati; since: istante di (ri)partenza, null se fermo. */
export const createTimer = () => ({ elapsed: 0, since: null });

export const startTimer = (t, now) => (t.since === null ? { ...t, since: now } : t);

export const stopTimer = (t, now) =>
  t.since === null ? t : { elapsed: t.elapsed + Math.max(0, now - t.since), since: null };

export const elapsedMs = (t, now) => t.elapsed + (t.since === null ? 0 : Math.max(0, now - t.since));

const pad2 = (n) => String(n).padStart(2, '0');

/** ms → "m:ss", oltre l'ora "h:mm:ss" (secondi interi, per difetto). */
export function formatElapsed(ms) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${m}:${pad2(s)}`;
}
