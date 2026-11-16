import { expect, test } from '@playwright/test';

// Fase 2: API punteggi (/api/scores.php), testata via HTTP contro nginx + PHP-FPM + MariaDB.
// Non dipende dal viewport: gira solo nel progetto desktop.
// I record di test usano punteggio 0 e nome con prefisso "e2e-" per non entrare in classifica.
test.skip(({ isMobile }) => isMobile, 'API: solo progetto desktop');

const URL = '/api/scores.php';
const valid = { player_name: 'e2e-test', score: 0, lines_cleared: 3, level: 1 };

test.describe('GET /api/scores.php', () => {
  test('risponde 200 JSON con al massimo 10 record ordinati per punteggio', async ({ request }) => {
    const res = await request.get(URL);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/json');

    const rows = await res.json();
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeLessThanOrEqual(10);
    for (const r of rows) {
      expect(Object.keys(r).sort()).toEqual(['created_at', 'level', 'lines_cleared', 'player_name', 'score']);
      expect(typeof r.player_name).toBe('string');
      expect(Number.isInteger(r.score)).toBe(true);
      expect(Number.isInteger(r.lines_cleared)).toBe(true);
      expect(Number.isInteger(r.level)).toBe(true);
    }
    for (let i = 1; i < rows.length; i++) expect(rows[i - 1].score).toBeGreaterThanOrEqual(rows[i].score);
  });

  test('un punteggio altissimo entra nella top 10', async ({ request }) => {
    const name = `e2e-top-${Math.floor(Math.random() * 1e6)}`;
    const score = 4_000_000_000;
    const created = await request.post(URL, { data: { ...valid, player_name: name, score } });
    expect(created.status()).toBe(201);

    const rows = await (await request.get(URL)).json();
    expect(rows.find((r) => r.player_name === name)).toMatchObject({ score });
  });
});

test.describe('POST /api/scores.php', () => {
  test('dati validi: 201 con il record creato', async ({ request }) => {
    const res = await request.post(URL, { data: { ...valid, player_name: '  e2e-àè  ' } });
    expect(res.status()).toBe(201);
    expect(res.headers()['content-type']).toContain('application/json');

    const body = await res.json();
    expect(body).toMatchObject({ player_name: 'e2e-àè', score: 0, lines_cleared: 3, level: 1 });
    expect(body.created_at).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  test('nome di 20 caratteri multibyte accettato', async ({ request }) => {
    const name = 'e2e-' + 'é'.repeat(16);
    const res = await request.post(URL, { data: { ...valid, player_name: name } });
    expect(res.status()).toBe(201);
    expect((await res.json()).player_name).toBe(name);
  });

  const invalid = [
    ['nome mancante', { score: 0, lines_cleared: 0, level: 1 }, 'player_name'],
    ['nome vuoto dopo trim', { ...valid, player_name: '   ' }, 'player_name'],
    ['nome oltre 20 caratteri', { ...valid, player_name: 'e2e-' + 'x'.repeat(17) }, 'player_name'],
    ['nome non stringa', { ...valid, player_name: 123 }, 'player_name'],
    ['nome con caratteri di controllo', { ...valid, player_name: 'e2e\u0000x' }, 'player_name'],
    ['punteggio negativo', { ...valid, score: -1 }, 'score'],
    ['punteggio decimale', { ...valid, score: 1.5 }, 'score'],
    ['punteggio stringa', { ...valid, score: '100' }, 'score'],
    ['punteggio oltre il limite', { ...valid, score: 4294967296 }, 'score'],
    ['righe mancanti', { player_name: 'e2e', score: 0, level: 1 }, 'lines_cleared'],
    ['righe booleane', { ...valid, lines_cleared: true }, 'lines_cleared'],
    ['livello zero', { ...valid, level: 0 }, 'level'],
    ['livello oltre il limite', { ...valid, level: 65536 }, 'level'],
  ];
  for (const [name, data, field] of invalid) {
    test(`422 se ${name}`, async ({ request }) => {
      const res = await request.post(URL, { data });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(body.error).toBeTruthy();
      expect(body.errors).toHaveProperty(field);
    });
  }

  test('400 se il body non è JSON valido', async ({ request }) => {
    const res = await request.post(URL, {
      headers: { 'Content-Type': 'application/json' },
      data: '{non json',
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBeTruthy();
  });

  test('422 se il body è un oggetto vuoto', async ({ request }) => {
    const res = await request.post(URL, { data: {} });
    expect(res.status()).toBe(422);
    expect(Object.keys((await res.json()).errors).sort()).toEqual(['level', 'lines_cleared', 'player_name', 'score']);
  });

  test('400 se il body JSON non è un oggetto', async ({ request }) => {
    const res = await request.post(URL, { data: [1, 2, 3] });
    expect(res.status()).toBe(400);
  });
});

test('metodo non supportato: 405 con header Allow', async ({ request }) => {
  const res = await request.delete(URL);
  expect(res.status()).toBe(405);
  expect(res.headers()['allow']).toBe('GET, POST');
  expect((await res.json()).error).toBeTruthy();
});
