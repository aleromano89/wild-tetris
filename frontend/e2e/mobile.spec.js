import { expect, test } from '@playwright/test';

// Versione mobile: pulsantiera di gioco e barra statistiche compatta.
// Formati da CLAUDE.md: dispositivo piccolo (iPhone SE, area visibile in Safari 375×553)
// e grande (iPhone 15 Pro, 393×659). Si usa il browser del progetto "mobile" (touch attivo).
const DROP_INTERVAL_MS = 800;
const PAD_BUTTONS = ['Sposta a sinistra', 'Scendi', 'Sposta a destra', 'Ruota', 'Caduta istantanea'];
const BAR_STATS = ['bar-punteggio', 'bar-righe', 'bar-livello'];

const board = (page) => page.getByRole('grid', { name: 'Campo di gioco' });
const pad = (page) => page.getByRole('group', { name: 'Comandi di gioco' });
const bar = (page) => page.getByRole('region', { name: 'Statistiche partita' });
const indexes = (page) =>
  board(page)
    .getByRole('gridcell')
    .evaluateAll((els) => els.map((el, i) => (el.dataset.filled === 'true' ? i : -1)).filter((i) => i >= 0));

/** true se l'elemento è tutto dentro il viewport (senza scroll) e il suo centro non è coperto. */
const fullyVisible = (locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const inside = r.top >= 0 && r.left >= 0 && r.bottom <= window.innerHeight && r.right <= window.innerWidth;
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return inside && !!hit && (hit === el || el.contains(hit));
  });

async function startAtTop(page) {
  await page.getByRole('button', { name: 'Avvia' }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
}

test.describe('Versione mobile (browser)', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'solo progetto mobile');
    await page.clock.install();
    await page.addInitScript(() => {
      Math.random = () => 0.999;
    });
  });

  for (const [nome, viewport] of [
    ['iPhone SE', { width: 375, height: 553 }],
    ['iPhone 15 Pro', { width: 393, height: 659 }],
  ]) {
    test.describe(nome, () => {
      test.use({ viewport });

      test('durante la partita griglia, statistiche e pulsantiera stanno nello schermo senza scroll', async ({ page }) => {
        await page.goto('/');
        await startAtTop(page);

        await expect(bar(page)).toBeVisible();
        await expect(pad(page)).toBeVisible();

        // griglia: angoli e celle dell'ultima riga visibili e non coperti
        const cells = board(page).getByRole('gridcell');
        for (const i of [0, 9, 190, 199]) expect(await fullyVisible(cells.nth(i)), `cella ${i}`).toBe(true);

        for (const id of BAR_STATS) expect(await fullyVisible(page.getByTestId(id)), id).toBe(true);
        for (const name of PAD_BUTTONS) {
          const btn = pad(page).getByRole('button', { name });
          expect(await fullyVisible(btn), name).toBe(true);
          // area di tocco minima 44×44
          const box = await btn.boundingBox();
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    });
  }

  test('i pulsanti muovono il pezzo e aggiornano la barra statistiche, senza scorrere la pagina', async ({ page }) => {
    await page.goto('/');
    await startAtTop(page);
    await page.clock.runFor(DROP_INTERVAL_MS * 3);
    await expect.poll(() => indexes(page)).toEqual([13, 14, 15, 16]);

    const tap = (name) => pad(page).getByRole('button', { name }).tap();

    await tap('Sposta a sinistra');
    await expect.poll(() => indexes(page)).toEqual([12, 13, 14, 15]);
    await tap('Sposta a destra');
    await expect.poll(() => indexes(page)).toEqual([13, 14, 15, 16]);
    await tap('Ruota');
    await expect.poll(() => indexes(page)).toEqual([5, 15, 25, 35]);
    await tap('Scendi');
    await expect.poll(() => indexes(page)).toEqual([15, 25, 35, 45]);
    await expect(page.getByTestId('bar-punteggio')).toHaveText('1');
    await tap('Caduta istantanea');
    await expect.poll(() => indexes(page)).toEqual([165, 175, 185, 195]);
    await expect(page.getByTestId('bar-punteggio')).toHaveText('31');

    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
});

test('su desktop pulsantiera e barra statistiche compatta sono nascoste', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'solo progetto desktop');
  await page.goto('/');
  await expect(pad(page)).toBeHidden();
  await expect(bar(page)).toBeHidden();
  await expect(page.getByTestId('stat-punteggio')).toBeVisible();
});
