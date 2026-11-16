import { expect, test } from '@playwright/test';

// Fasi 1.2.2 / 1.2.3: comandi da tastiera e punteggio nel browser reale.
// - Math.random fisso → il primo pezzo è la I orizzontale, poi la O.
// - Orologio simulato (page.clock): la gravità avanza solo con clock.runFor, niente corse con i tick.
const DROP_INTERVAL_MS = 800;

test.describe('Comandi da tastiera (browser)', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await page.addInitScript(() => {
      Math.random = () => 0.999;
    });
    await page.goto('/');
  });

  const board = (page) => page.getByRole('grid', { name: 'Campo di gioco' });
  const indexes = (page) =>
    board(page)
      .getByRole('gridcell')
      .evaluateAll((els) =>
        els.map((el, i) => (el.dataset.filled === 'true' ? i : -1)).filter((i) => i >= 0)
      );

  /** Avvia e fa scendere la I di 3 righe: tutta visibile in riga 1, colonne 3..6. */
  async function startWithVisibleI(page) {
    await page.getByRole('button', { name: 'Avvia' }).click();
    await page.clock.runFor(DROP_INTERVAL_MS * 3);
    await expect.poll(() => indexes(page)).toEqual([13, 14, 15, 16]);
  }

  test('spostamento, rotazione, cadute e punteggio', async ({ page }) => {
    await startWithVisibleI(page);
    const score = page.getByTestId('stat-punteggio');

    await page.keyboard.press('ArrowLeft');
    expect(await indexes(page)).toEqual([12, 13, 14, 15]);

    // ↑ ruota: I verticale nella colonna 4, righe 0..3
    await page.keyboard.press('ArrowUp');
    expect(await indexes(page)).toEqual([4, 14, 24, 34]);

    // ↓ caduta veloce: una riga, +1 punto
    await expect(score).toHaveText('0');
    await page.keyboard.press('ArrowDown');
    expect(await indexes(page)).toEqual([14, 24, 34, 44]);
    await expect(score).toHaveText('1');

    // Spazio: dalla riga 1 alla 16 (15 celle) → +30 punti
    await page.keyboard.press('Space');
    expect(await indexes(page)).toEqual([164, 174, 184, 194]);
    await expect(score).toHaveText('31');
    await expect(page.getByTestId('stat-righe')).toHaveText('0');
  });

  test('Spazio con il focus su «Riprendi» fa cadere il pezzo senza cliccare il pulsante', async ({ page }) => {
    await startWithVisibleI(page);
    await page.getByRole('button', { name: 'Pausa' }).click();
    await page.getByRole('button', { name: 'Riprendi' }).click(); // il focus resta sul pulsante

    await page.keyboard.press('Space');
    await expect(page.getByText('In pausa')).toHaveCount(0);
    expect(await indexes(page)).toEqual([193, 194, 195, 196]);
  });

  test('le frecce non fanno scorrere la pagina durante la partita', async ({ page }) => {
    await page.getByRole('button', { name: 'Avvia' }).click();
    const before = await page.evaluate(() => window.scrollY);
    for (const key of ['ArrowDown', 'ArrowDown', 'Space', 'ArrowUp']) await page.keyboard.press(key);
    expect(await page.evaluate(() => window.scrollY)).toBe(before);
  });
});
