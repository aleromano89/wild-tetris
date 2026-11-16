// Client delle API punteggi (backend PHP, vedi CLAUDE.md § API).

export const SCORES_URL = '/api/scores.php';

/** Errore delle API. status 0 = server non raggiungibile; errors = messaggi per campo (422). */
export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

async function request(url, options) {
  let res;
  try {
    res = await fetch(url, { ...options, headers: { Accept: 'application/json', ...options.headers } });
  } catch {
    throw new ApiError('Server non raggiungibile', 0);
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    // risposta non JSON (es. errore del proxy)
  }

  if (!res.ok) throw new ApiError(body?.error ?? `Errore del server (${res.status})`, res.status, body?.errors ?? {});
  return body;
}

/** Top 10: [{player_name, score, lines_cleared, level, created_at}] */
export function fetchTopScores() {
  return request(SCORES_URL, { method: 'GET' });
}

/** Salva un punteggio e restituisce il record creato. */
export function submitScore({ player_name, score, lines_cleared, level }) {
  return request(SCORES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_name, score, lines_cleared, level }),
  });
}
