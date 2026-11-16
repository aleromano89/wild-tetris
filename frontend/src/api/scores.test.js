import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, fetchTopScores, submitScore, SCORES_URL } from './scores';

const jsonResponse = (status, body) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

describe('client API punteggi', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('fetchTopScores: GET su /api/scores.php e restituisce l\'array', async () => {
    const rows = [{ player_name: 'Ada', score: 500, lines_cleared: 4, level: 1, created_at: '2026-11-14 10:00:00' }];
    const fetch = vi.fn(() => jsonResponse(200, rows));
    vi.stubGlobal('fetch', fetch);

    await expect(fetchTopScores()).resolves.toEqual(rows);
    expect(SCORES_URL).toBe('/api/scores.php');
    expect(fetch).toHaveBeenCalledWith('/api/scores.php', expect.objectContaining({ method: 'GET' }));
  });

  it('submitScore: POST JSON con i 4 campi e restituisce il record creato', async () => {
    const created = { player_name: 'Ada', score: 500, lines_cleared: 4, level: 1, created_at: '2026-11-14 10:00:00' };
    const fetch = vi.fn(() => jsonResponse(201, created));
    vi.stubGlobal('fetch', fetch);

    await expect(submitScore({ player_name: 'Ada', score: 500, lines_cleared: 4, level: 1 })).resolves.toEqual(created);
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('/api/scores.php');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual({ player_name: 'Ada', score: 500, lines_cleared: 4, level: 1 });
  });

  it('errore 422: ApiError con messaggio, status ed errori per campo', async () => {
    vi.stubGlobal('fetch', vi.fn(() => jsonResponse(422, { error: 'Dati non validi', errors: { player_name: 'Il nome è obbligatorio' } })));

    const err = await submitScore({ player_name: '', score: 0, lines_cleared: 0, level: 1 }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(422);
    expect(err.message).toBe('Dati non validi');
    expect(err.errors).toEqual({ player_name: 'Il nome è obbligatorio' });
  });

  it('risposta di errore non JSON: messaggio generico con lo status', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('<html>502</html>', { status: 502 }))));

    const err = await fetchTopScores().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(502);
    expect(err.message).toMatch(/502/);
  });

  it('rete non disponibile: ApiError con status 0', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))));

    const err = await fetchTopScores().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(0);
    expect(err.message).toMatch(/server non raggiungibile/i);
  });
});
