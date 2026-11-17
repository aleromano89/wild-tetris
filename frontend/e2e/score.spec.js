import { expect, test } from '@playwright/test';

// Fase 1.3: salvataggio del punteggio a fine partita e pagina classifica.
// I nomi dei record salvati iniziano con "e2e-": make e2e li cancella.

/** true se l'elemento è in primo piano al suo centro (non coperto da altri elementi). */
const isOnTop = (locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return el === hit || el.contains(hit);
  });

const noHorizontalScroll = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test('fine partita: salva il nome, conferma e porta alla classifica', async ({ page }, testInfo) => {
  await page.clock.install();
  await page.addInitScript(() => {
    Math.random = () => 0.999;
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Avvia' }).click();

  const overlay = page.getByText(/partita terminata/i);
  for (let i = 0; i < 40 && !(await overlay.count()); i++) await page.keyboard.press('Space');
  await expect(overlay).toBeVisible();

  // modulo dentro il campo di gioco, in primo piano, con il focus sul nome
  const input = page.getByRole('textbox', { name: /nome/i });
  await expect(input).toBeVisible();
  await expect(input).toBeFocused();
  await input.scrollIntoViewIfNeeded();
  expect(await isOnTop(input)).toBe(true);
  const boardBox = await page.getByRole('grid', { name: 'Campo di gioco' }).boundingBox();
  const formBox = await page.locator('.overlay--over').boundingBox();
  if (testInfo.project.name === 'mobile') {
    // su mobile il modulo ha una larghezza propria: centrato sulla griglia (vedi gameover.spec.js)
    expect(Math.abs(formBox.x + formBox.width / 2 - (boardBox.x + boardBox.width / 2))).toBeLessThan(2);
  } else {
    expect(formBox.x).toBeGreaterThanOrEqual(boardBox.x);
    expect(formBox.x + formBox.width).toBeLessThanOrEqual(boardBox.x + boardBox.width);
  }
  expect(await noHorizontalScroll(page)).toBeLessThanOrEqual(0);

  const name = `e2e-${testInfo.project.name}`;
  const score = Number((await page.getByTestId('stat-punteggio').textContent()).replace(/\D/g, ''));
  const lines = Number(await page.getByTestId('stat-righe').textContent());
  const level = Number(await page.getByTestId('stat-livello').textContent());

  await input.fill(name);
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/scores.php') && r.request().method() === 'POST'),
    page.getByRole('button', { name: 'Salva' }).click(),
  ]);
  expect(response.status()).toBe(201);
  expect(response.request().postDataJSON()).toEqual({ player_name: name, score, lines_cleared: lines, level });

  await expect(page.getByText(/punteggio salvato/i)).toBeVisible();

  // collegamento verso la classifica: mostra quanto restituito dall'API
  const [top] = await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/scores.php') && r.request().method() === 'GET'),
    page.getByRole('link', { name: /vedi classifica/i }).click(),
  ]);
  await expect(page).toHaveURL(/\/score\.html$/);
  const rows = await top.json();
  expect(rows.length).toBeGreaterThan(0); // almeno il punteggio appena salvato
  const table = page.getByRole('table', { name: /top 10/i });
  await expect(table.getByRole('row')).toHaveCount(rows.length + 1);
});

test.describe('pagina classifica', () => {
  const fakeRows = Array.from({ length: 10 }, (_, i) => ({
    player_name: i === 0 ? 'Nome_lungo_20_caratt' : `Giocatore ${i + 1}`,
    score: (10 - i) * 123456,
    lines_cleared: 300 - i * 10,
    level: 30 - i,
    created_at: '2026-11-14 18:24:08',
  }));

  test('top 10 visibile, non coperta, senza scroll orizzontale', async ({ page }, testInfo) => {
    await page.route('**/api/scores.php', (route) => route.fulfill({ json: fakeRows }));
    await page.goto('/score.html');

    const table = page.getByRole('table', { name: /top 10/i });
    await expect(table).toBeVisible();
    const rows = table.getByRole('row');
    await expect(rows).toHaveCount(11);
    await expect(rows.nth(1)).toContainText('Nome_lungo_20_caratt');
    await expect(rows.nth(1)).toContainText('1.234.560');

    for (const i of [1, 10]) {
      await rows.nth(i).scrollIntoViewIfNeeded();
      expect(await isOnTop(rows.nth(i).getByRole('cell').nth(2))).toBe(true);
    }
    expect(await noHorizontalScroll(page)).toBeLessThanOrEqual(0);

    const levelHeader = table.getByRole('columnheader', { name: 'Livello' });
    if (testInfo.project.name === 'mobile') await expect(levelHeader).toBeHidden();
    else await expect(levelHeader).toBeVisible();
  });

  test('errore del server: messaggio e «Riprova»', async ({ page }) => {
    let calls = 0;
    await page.route('**/api/scores.php', (route) =>
      ++calls === 1
        ? route.fulfill({ status: 500, json: { error: 'Errore del database' } })
        : route.fulfill({ json: fakeRows })
    );
    await page.goto('/score.html');

    await expect(page.getByRole('alert')).toContainText('Errore del database');
    await page.getByRole('button', { name: 'Riprova' }).click();
    await expect(page.getByRole('table', { name: /top 10/i }).getByRole('row')).toHaveCount(11);
  });

  test('collegamenti tra gioco e classifica', async ({ page }) => {
    await page.route('**/api/scores.php', (route) => route.fulfill({ json: [] }));
    await page.goto('/');
    await page.getByRole('link', { name: 'Classifica' }).click();
    await expect(page).toHaveURL(/\/score\.html$/);
    await expect(page.getByText(/nessun punteggio/i)).toBeVisible();

    await page.getByRole('link', { name: /torna al gioco/i }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('grid', { name: 'Campo di gioco' })).toBeVisible();
  });
});
