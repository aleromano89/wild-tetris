// Client delle API punteggi (backend PHP, vedi direttive di progetto § API).

export const SCORES_URL = '/api/scores.php';

/**
 * Errore delle API. status 0 = server non raggiungibile; errors = messaggi per campo (422).
 * code: 'network' (server non raggiungibile) o 'http' (risposta senza messaggio del server):
 * in questi casi il messaggio da mostrare è tradotto dall'interfaccia (vedi i18n/apiError.js);
 * senza code, message è il testo inviato dal server.
 */
export class ApiError extends Error {
  constructor(message, status, errors = {}, code = undefined) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.code = code;
  }
}

async function request(url, options) {
  let res;
  try {
    res = await fetch(url, { ...options, headers: { Accept: 'application/json', ...options.headers } });
  } catch {
    throw new ApiError('Server non raggiungibile', 0, {}, 'network');
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    // risposta non JSON (es. errore del proxy)
  }

  if (!res.ok) {
    if (body?.error) throw new ApiError(body.error, res.status, body.errors ?? {});
    throw new ApiError(`Errore del server (${res.status})`, res.status, {}, 'http');
  }
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
